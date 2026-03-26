// src/lib/utils/offline.ts — IndexedDB caching for charging stations
import { openDB } from "idb";
import { ChargingStation } from "@/types";

const DB_NAME = "eWheelz";
const STORE_NAME = "stations";

/**
 * Cache an array of charging stations to IndexedDB.
 */
export async function cacheStations(stations: ChargingStation[]) {
  if (typeof window === "undefined") return; // skip during SSR
  
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
    
    // We store all stations as one entry for easy retrieval, 
    // or we could store them individually. Storing as one array for now.
    await db.put(STORE_NAME, stations, "cached_stations");
    console.log(`[Offline] Successfully cached ${stations.length} stations.`);
  } catch (error) {
    console.error("[Offline] Failed to cache stations:", error);
  }
}

/**
 * Retrieve cached charging stations from IndexedDB.
 */
export async function getCachedStations(): Promise<ChargingStation[] | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const db = await openDB(DB_NAME, 1);
    const data = await db.get(STORE_NAME, "cached_stations");
    return data || null;
  } catch (error) {
    console.warn("[Offline] No cached data found or failed to read:", error);
    return null;
  }
}
