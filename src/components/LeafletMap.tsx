"use client";
// src/components/LeafletMap.tsx — Interactive Leaflet map (Leaflet via CDN, no npm)

import { useEffect, useRef, useState } from "react";
import { ChargingStation } from "@/types";
import { cacheStations, getCachedStations } from "@/lib/utils/offline";

// Augment window for Leaflet CDN load
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

interface Props {
  stations: ChargingStation[];
  height?: string;
  tripRoute?: {
    origin: [number, number];
    destination: [number, number];
    stops: Array<{ lat: number; lng: number; name: string }>;
  };
}

const STATUS_COLOR: Record<string, string> = {
  OPERATIONAL: "#16a34a",
  BUSY: "#f59e0b",
  OFFLINE: "#ef4444",
};

export default function LeafletMap({ stations, height = "500px", tripRoute }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");
  const [localStations, setLocalStations] = useState<ChargingStation[]>(stations);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // ── Effect 0: Sync local stations with props or cache ──────────────
  useEffect(() => {
    if (stations && stations.length > 0) {
      setLocalStations(stations);
      setIsOfflineMode(false);
    } else {
      // Try to load from cache if no stations provided
      getCachedStations().then((cached) => {
        if (cached && cached.length > 0) {
          setLocalStations(cached);
          setIsOfflineMode(true);
        }
      });
    }
  }, [stations]);

  // ── Effect 1: initialise map & load Leaflet (runs once on mount) ──────────
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Load Leaflet CSS from CDN
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;

    script.onload = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;

      try {
        const map = L.map(mapRef.current, {
          center: [30.3753, 69.3451],
          zoom: 6,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Create a layer group to hold all station markers so we can clear/re-add
        markersLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true); // triggers Effect 2
      } catch (e) {
        setError("Failed to load map.");
        console.error(e);
      }
    };

    script.onerror = () => setError("Could not load map (check internet connection).");
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []); // run once

  // ── Effect 2: plot station markers whenever stations or mapReady changes ──
  useEffect(() => {
    const L = window.L;
    if (!mapReady || !mapInstanceRef.current || !L) return;

    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    // Clear existing markers before re-plotting
    markersLayer.clearLayers();

    const makeIcon = (color: string, size = 14) =>
      L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,.4)
        "></div>`,
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

    for (const s of localStations) {
      const isOnline = s.isOnline !== false; // handle undefined as online
      const color = isOnline ? (STATUS_COLOR[s.liveStatus] ?? "#16a34a") : "#ef4444";
      const connectors = Array.isArray(s.connectorTypes)
        ? s.connectorTypes
        : s.connectorTypes?.split(",").map((c: string) => c.trim()) ?? [];

      const lastUpdatedStr = new Date(s.lastUpdated).toLocaleString();

      const popup = L.popup({ maxWidth: 240 }).setContent(`
        <div style="font-family:system-ui;font-size:13px;line-height:1.5">
          <div style="display:flex;justify-content:space-between;align-items:start">
             <strong style="font-size:14px">${s.name}</strong>
             <span style="font-size:10px;padding:1px 5px;border-radius:4px;background:${isOnline ? "#dcfce7" : "#fee2e2"};color:${isOnline ? "#166534" : "#991b1b"};font-weight:700">
               ${isOnline ? "ONLINE" : "OFFLINE"}
             </span>
          </div>
          <span style="color:#555">${s.network} · ${s.city}</span><br/>
          <span style="color:#16a34a;font-weight:600">⚡ ${s.maxPowerKw} kW</span>
          ${s.pricePerKwh ? ` · <span style="color:#0284c7">PKR ${s.pricePerKwh}/kWh</span>` : ""}
          <br/>
          <span style="font-size:11px;color:#777">${connectors.join(" · ")}</span><br/>
          <span style="font-size:11px;color:#777">🕐 ${s.operationalHours}</span><br/>
          <div style="font-size:11px;color:#777;margin-top:2px;border-top:1px solid #eee;padding-top:2px">
            Updated: ${lastUpdatedStr}
          </div>
          <div style="margin-top:8px;display:flex;gap:4px">
             <button onclick="window.location.href='/charging-map?report=${s.id}'" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;padding:4px;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer">Report Issue</button>
             <button onclick="window.location.href='https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}'" style="flex:1;background:#4f46e5;color:white;border:none;padding:4px;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer">Navigate</button>
          </div>
        </div>
      `);

      L.marker([s.latitude, s.longitude], { icon: makeIcon(color, 16) })
        .bindPopup(popup)
        .addTo(markersLayer);
    }

    if (localStations.length > 0 && !isOfflineMode) {
      cacheStations(localStations);
    }
  }, [localStations, mapReady, isOfflineMode]); // re-run whenever stations array or map readiness changes

  // ── Effect 3: draw trip route overlay ─────────────────────────────────────
  useEffect(() => {
    const L = window.L;
    if (!mapReady || !mapInstanceRef.current || !tripRoute || !L) return;

    const map = mapInstanceRef.current;
    const { origin, destination, stops } = tripRoute;
    const allPoints = [origin, ...stops.map((s) => [s.lat, s.lng] as [number, number]), destination];

    L.polyline(allPoints, { color: "#2563eb", weight: 3, opacity: 0.8, dashArray: "8 4" }).addTo(map);

    L.marker(origin, {
      icon: L.divIcon({
        html: `<div style="background:#16a34a;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap">START</div>`,
        className: "",
        iconAnchor: [16, 10],
      }),
    }).addTo(map);

    L.marker(destination, {
      icon: L.divIcon({
        html: `<div style="background:#dc2626;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap">END</div>`,
        className: "",
        iconAnchor: [16, 10],
      }),
    }).addTo(map);

    stops.forEach((stop, i) => {
      L.marker([stop.lat, stop.lng], {
        icon: L.divIcon({
          html: `<div style="background:#f59e0b;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap">⚡ Stop ${i + 1}</div>`,
          className: "",
          iconAnchor: [20, 10],
        }),
      }).bindTooltip(stop.name).addTo(map);
    });

    map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
  }, [tripRoute, mapReady]);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height, border: "1px solid #E6E9F2" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {isOfflineMode && (
        <div className="absolute top-4 left-4 z-[1000] px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-200 shadow-lg">
          ⚠️ OFFLINE MODE / CACHED DATA
        </div>
      )}
      {!mapReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#F6F8FF" }}>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-2"
              style={{ border: "4px solid #E6E9F2", borderTopColor: "#22C55E" }} />
            <div className="text-sm text-slate-500">Loading map…</div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#F6F8FF" }}>
          <div className="text-sm text-slate-500">{error}</div>
        </div>
      )}
    </div>
  );
}
