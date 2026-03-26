# GooseHint: Real-Time Station Availability (P0)

## Objective
Improve the charging station map with real-time availability and offline support.

## Tasks
1. **Polling Script**:
   - Create a script (`scripts/poll_stations.ts`) to fetch station status every 5 minutes:
     ```ts
     import { prisma } from "@/lib/prisma";

     export async function pollStationStatus() {
       const stations = await fetch("https://api.chargestationmap.com/stations").then(res => res.json());
       for (const station of stations) {
         await prisma.chargingStation.update({
           where: { id: station.id },
           data: {
             isOnline: station.status === "Available",
             lastUpdated: new Date(),
           },
         });
       }
     }

     // Run every 5 minutes
     setInterval(pollStationStatus, 5 * 60 * 1000);
     ```
   - Add the script to `package.json` under `scripts`: `"poll-stations": "ts-node scripts/poll_stations.ts"`.

2. **UI Updates**:
   - Update `src/components/LeafletMap.tsx` to show real-time status:
     ```tsx
     function StationMarker({ station }) {
       return (
         <Marker position={[station.lat, station.lng]}
           icon={station.isOnline ? greenIcon : redIcon}>
           <Popup>
             <div>
               <h3>{station.name}</h3>
               <p>{station.isOnline ? "✅ Online" : "❌ Offline"}</p>
               <p>Last updated: {new Date(station.lastUpdated).toLocaleString()}</p>
             </div>
           </Popup>
         </Marker>
       );
     }
     ```

3. **Offline Support**:
   - Cache station data using IndexedDB (`src/lib/utils/offline.ts`):
     ```ts
     export async function cacheStations(stations) {
       const db = await openDB("eWheelz", 1, {
         upgrade(db) {
           db.createObjectStore("stations");
         },
       });
       await db.put("stations", stations, "stations");
     }
     ```

4. **Error Handling**:
   - Add a "Report Issue" button to flag incorrect station status.

## Expected Output
- A PR with real-time polling and UI updates.
- Offline cache implementation.
- Screenshots of the map showing real-time status.

## Notes
- Use environment variables for API endpoints.
- Test polling with mock data first.
