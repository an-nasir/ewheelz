# GooseHint: Enhance Trip Planner (P1)

## Objective
Improve the trip planner with charging stops and real-time data.

## Tasks
1. **Algorithm**:
   - Implement Dijkstra’s algorithm in `src/lib/tripPlanner.ts` to find optimal routes:
     ```ts
     export async function calculateRoute(start: string, end: string) {
       // Mock: Replace with Mapbox/Google Maps API
       const distance = Math.floor(Math.random() * 500) + 100; // 100-600 km
       const duration = Math.floor(distance / 100) * 60; // ~1 hour per 100 km
       const chargingStops = await getStationsAlongRoute(start, end);
       return { start, end, distance, duration, chargingStops };
     }
     ```

2. **UI Component**:
   - Update `src/app/trip-planner/page.tsx`:
     ```tsx
     import { calculateRoute } from "@/lib/tripPlanner";

     export default function TripPlanner() {
       const [start, setStart] = useState("");
       const [end, setEnd] = useState("");
       const [route, setRoute] = useState(null);

       const handlePlanTrip = async () => {
         const routeData = await calculateRoute(start, end);
         setRoute(routeData);
       };

       return (
         <div>
           <h2>Plan Your Trip</h2>
           <input placeholder="Start" value={start} onChange={(e) => setStart(e.target.value)} />
           <input placeholder="End" value={end} onChange={(e) => setEnd(e.target.value)} />
           <button onClick={handlePlanTrip}>Plan Trip</button>
           {route && (
             <div>
               <h3>Route: {route.distance} km | {route.duration} mins</h3>
               <h4>Charging Stops:</h4>
               <ul>
                 {route.chargingStops.map((stop, i) => (
                   <li key={i}>{stop.name} ({stop.distanceFromStart} km)</li>
                 ))}
               </ul>
             </div>
           )}
         </div>
       );
     }
     ```

3. **Database Query**:
   - Add `getStationsAlongRoute` to `src/lib/database/stations.ts`:
     ```ts
     export async function getStationsAlongRoute(start: string, end: string) {
       // Mock: Replace with actual geospatial query
       return await prisma.chargingStation.findMany({
         where: { isOnline: true },
         take: 3, // Limit to 3 stops for demo
       });
     }
     ```

4. **Real-Time Integration**:
   - Use the real-time station data from GooseHint 7 to show live availability.

## Expected Output
- A PR with the enhanced trip planner.
- Screenshots of the trip planner showing routes and charging stops.
- Updated `tripPlanner.ts` and database queries.

## Notes
- Replace mock data with actual Mapbox/Google Maps API calls.
- Test with real Pakistan cities (e.g., Lahore → Islamabad).
