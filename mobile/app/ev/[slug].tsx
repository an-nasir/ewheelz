// app/ev/[slug].tsx — EV Detail screen
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Colors } from "@/constants/colors";
import { fetchEvModel, type EvModel } from "@/lib/api";

const POWERTRAIN_STYLE: Record<string, { bg: string; color: string }> = {
  BEV:  { bg: "#DCFCE7", color: "#16A34A" },
  PHEV: { bg: "#EEF2FF", color: "#4F46E5" },
  HEV:  { bg: "#FFFBEB", color: "#B45309" },
  FCEV: { bg: "#F0F9FF", color: "#0284C7" },
};

interface SpecRow { label: string; value: string; icon: string; }

function buildSpecs(ev: EvModel): SpecRow[] {
  const rows: SpecRow[] = [];
  if (ev.wltpRangeKm)      rows.push({ label: "WLTP Range",    value: `${ev.wltpRangeKm} km`,      icon: "location" });
  if (ev.batteryKwh)       rows.push({ label: "Battery",       value: `${ev.batteryKwh} kWh`,      icon: "battery-charging" });
  if (ev.chargingDcKw)     rows.push({ label: "DC Charging",   value: `${ev.chargingDcKw} kW`,     icon: "flash" });
  if (ev.chargingAcKw)     rows.push({ label: "AC Charging",   value: `${ev.chargingAcKw} kW`,     icon: "power" });
  if (ev.accelerationSec)  rows.push({ label: "0–100 km/h",    value: `${ev.accelerationSec}s`,    icon: "speedometer" });
  if (ev.topSpeedKmh)      rows.push({ label: "Top Speed",     value: `${ev.topSpeedKmh} km/h`,    icon: "car-sport" });
  if (ev.seatingCapacity)  rows.push({ label: "Seats",         value: `${ev.seatingCapacity}`,     icon: "people" });
  if (ev.bodyStyle)        rows.push({ label: "Body Style",    value: ev.bodyStyle,                icon: "car" });
  if (ev.country)          rows.push({ label: "Origin",        value: ev.country,                  icon: "globe" });
  return rows;
}

export default function EvDetailScreen() {
  const { slug }  = useLocalSearchParams<{ slug: string }>();
  const insets    = useSafeAreaInsets();
  const [ev, setEv]       = useState<EvModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchEvModel(slug)
      .then(setEv)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!ev) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors.textMuted }}>EV not found.</Text>
      </View>
    );
  }

  const pt    = POWERTRAIN_STYLE[ev.powertrain] ?? POWERTRAIN_STYLE.BEV;
  const specs = buildSpecs(ev);
  const name  = `${ev.brand} ${ev.model}`;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={Colors.gradientHero as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 56 }]}
      >
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={{ position: "relative", zIndex: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={[styles.ptBadge, { backgroundColor: pt.bg }]}>
            <Text style={[styles.ptText, { color: pt.color }]}>{ev.powertrain}</Text>
          </View>
          <Text style={styles.brand}>{ev.brand}</Text>
          <Text style={styles.heroName}>{ev.model}{ev.variant ? ` ${ev.variant}` : ""}</Text>

          {/* Hero stat pills */}
          <View style={styles.heroPills}>
            {ev.wltpRangeKm && (
              <View style={styles.heroPill}>
                <Text style={styles.heroPillVal}>{ev.wltpRangeKm}</Text>
                <Text style={styles.heroPillLbl}>km range</Text>
              </View>
            )}
            {ev.batteryKwh && (
              <View style={styles.heroPill}>
                <Text style={styles.heroPillVal}>{ev.batteryKwh}</Text>
                <Text style={styles.heroPillLbl}>kWh battery</Text>
              </View>
            )}
            {ev.chargingDcKw && (
              <View style={styles.heroPill}>
                <Text style={styles.heroPillVal}>{ev.chargingDcKw}</Text>
                <Text style={styles.heroPillLbl}>kW DC</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>

        {/* Price card */}
        {ev.pricePkrMin && (
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Starting Price in Pakistan</Text>
              <Text style={styles.priceValue}>
                PKR {(ev.pricePkrMin / 1_000_000).toFixed(1)}M
                {ev.pricePkrMax && ev.pricePkrMax !== ev.pricePkrMin
                  ? ` – ${(ev.pricePkrMax / 1_000_000).toFixed(1)}M`
                  : ""}
              </Text>
            </View>
            <LinearGradient
              colors={[Colors.green, Colors.greenDark]}
              style={styles.priceBadge}
            >
              <Text style={styles.priceBadgeText}>Official</Text>
            </LinearGradient>
          </View>
        )}

        {/* Full specs */}
        <Text style={styles.sectionTitle}>Full Specifications</Text>
        <View style={styles.specsCard}>
          {specs.map((spec, i) => (
            <View key={spec.label} style={[styles.specRow, i < specs.length - 1 && styles.specRowBorder]}>
              <View style={styles.specIconWrap}>
                <Ionicons name={spec.icon as never} size={15} color={Colors.primary} />
              </View>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>

        {/* Real-world note */}
        <View style={styles.noteBanner}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.noteText}>
            Real-world range in Pakistan can be 15–25% lower due to AC use and traffic conditions.
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push("/charging")}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color={Colors.white} />
            <Text style={styles.actionBtnText}>Find Chargers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border }]}
            onPress={() => router.push("/community")}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={16} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Report Efficiency</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -60,
    right: -60,
  },
  blob2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    left: -20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ptBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  ptText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  brand: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.70)",
    marginBottom: 2,
  },
  heroName: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.white,
    marginBottom: 16,
    lineHeight: 38,
  },
  heroPills: {
    flexDirection: "row",
    gap: 10,
  },
  heroPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  heroPillVal: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.white,
  },
  heroPillLbl: {
    fontSize: 10,
    color: "rgba(255,255,255,0.70)",
    marginTop: 1,
  },
  content: {
    padding: 16,
  },
  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  specsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  specRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  specIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  specLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  specValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  noteBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
});
