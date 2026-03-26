// scripts/poll_stations.ts — Real-time station status poller
import axios from "axios";
// scripts/poll_stations.ts — Real-time station status poller & Discovery
import { prisma } from "../src/lib/prisma";

const SITE_URL = "https://chargestationmap.com/";

/**
 * Poll station status from the external API and update the database.
 */
export async function pollStationStatus() {
  console.log(`[${new Date().toISOString()}] Polling station status...`);
  
  try {
    const response = await fetch("https://api.chargestationmap.com/stations");
    
    if (!response.ok) {
       console.warn(`[WARN] API fetch failed: ${response.statusText}. Using fallback mock logic for development.`);
       await mockPollLogic();
       return;
    }

    const stations = await response.json();
    for (const station of stations) {
      await prisma.chargingStation.updateMany({
        where: { OR: [ { id: station.id }, { name: station.name } ] },
        data: {
          lastUpdated: new Date(),
          liveStatus: (station.status === "Available" || station.status === "OPERATIONAL" || station.status === "Online") ? "OPERATIONAL" : "OFFLINE",
        },
      });
    }
    console.log(`[SUCCESS] Updated statuses for ${stations.length} stations.`);
  } catch (error) {
    console.error(`[ERROR] Polling failed:`, error);
    await mockPollLogic();
  }
}

/**
 * Checks home page DOM for new stations.
 */
export async function discoverNewStations() {
    console.log(`[${new Date().toISOString()}] Checking for new stations on site...`);
    try {
        const { data: html } = await axios.get(SITE_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' }
        });

        // Search for item blocks
        const itemRegex = /<div class="jet-listing-grid__item"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
        let match;
        let foundCount = 0;
        let addedCount = 0;

        while ((match = itemRegex.exec(html)) !== null) {
            const block = match[1];
            
            // Extract Name (approximate via elementor-heading-title)
            const headings = Array.from(block.matchAll(/<h[234] class="elementor-heading-title[^>]*>([\s\S]*?)<\/h[234]>/g));
            if (headings.length < 2) continue;

            const city = headings[0][1].trim();
            const name = headings[1][1].trim();
            const addr = headings[2] ? headings[2][1].trim() : "";
            
            const linkMatch = block.match(/href="(https:\/\/maps\.app\.goo\.gl\/[^"]+)"/);
            const mapLink = linkMatch ? linkMatch[1] : "";

            foundCount++;
            
            // Check if exists
            const existing = await prisma.chargingStation.findFirst({
                where: { name: name, city: city }
            });

            if (!existing) {
                console.log(`[DISCOVERY] Found NEW station: ${name} in ${city}. Adding to database...`);
                // Use a separate resolver if needed, but for now just add with basic info
                await prisma.chargingStation.create({
                    data: {
                        name,
                        city,
                        mapLink,
                        latitude: 0, // Will be updated by coordinate resolver later or manual fix
                        longitude: 0,
                        lastUpdated: new Date()
                    }
                });
                addedCount++;
            }
        }
        console.log(`[DISCOVERY SUCCESS] Scanned ${foundCount} items, added ${addedCount} new stations.`);
    } catch (error) {
        console.error(`[DISCOVERY ERROR] Failed to scan home page:`, error);
    }
}

/**
 * Mock logic for development.
 */
async function mockPollLogic() {
  const allStations = await prisma.chargingStation.findMany({ select: { id: true } });
  
  for (const s of allStations) {
    const isOnline = Math.random() > 0.1;
    await prisma.chargingStation.update({
      where: { id: s.id },
      data: { 
        liveStatus: isOnline ? "OPERATIONAL" : "OFFLINE", 
        lastUpdated: new Date() 
      }
    });
  }
}

// Main execution
async function main() {
    await pollStationStatus();
    await discoverNewStations();
}

main();

// Run every 10 minutes
setInterval(main, 10 * 60 * 1000);
