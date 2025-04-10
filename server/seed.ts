import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from '@neondatabase/serverless';
import dotenv from "dotenv";
import ws from "ws";
import { airspaceZones, insertAirspaceZoneSchema, regulations, insertRegulationSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

// Load environment variables
dotenv.config();

// Configure Neon connection
neonConfig.webSocketConstructor = ws;

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle({ client: pool, schema: { airspaceZones, regulations } });

// Sample data for airspace zones
const sampleAirspaceZones = [
  {
    zoneId: "R-NPL-01",
    name: "Tribhuvan International Airport",
    description: "Restricted airspace surrounding Kathmandu's international airport",
    type: "restricted",
    geometry: {
      type: "Circle",
      coordinates: [27.6980, 85.3592],
      radius: 5000
    }
  },
  {
    zoneId: "C-NPL-01",
    name: "Kathmandu CTR",
    description: "Controlled airspace around Kathmandu metropolitan area",
    type: "controlled",
    geometry: {
      type: "Circle",
      coordinates: [27.7172, 85.3240],
      radius: 10000
    }
  },
  {
    zoneId: "A-NPL-01",
    name: "Chitwan National Park",
    description: "Advisory zone over protected wildlife area",
    type: "advisory",
    geometry: {
      type: "Polygon",
      coordinates: [
        [27.5142, 84.0000],
        [27.6142, 84.5000],
        [27.3142, 84.5000],
        [27.2142, 84.0000]
      ]
    }
  },
  {
    zoneId: "O-NPL-01",
    name: "Pokhara Rural Area",
    description: "Open airspace with no specific restrictions",
    type: "open",
    geometry: {
      type: "Circle",
      coordinates: [28.2096, 83.9856],
      radius: 15000
    }
  }
];

// Sample data for regulations
const sampleRegulations = [
  {
    regulationId: "REG-NPL-01",
    title: "Maximum Altitude Limit",
    description: "Drones must not fly higher than 120 meters above ground level",
    applicableTo: ["recreational", "commercial", "government"],
    source: "CAA Nepal Drone Regulations",
    zoneDependant: false,
    applicableZones: null
  },
  {
    regulationId: "REG-NPL-02",
    title: "Visual Line of Sight",
    description: "Drones must be operated within visual line of sight at all times",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations",
    zoneDependant: false,
    applicableZones: null
  },
  {
    regulationId: "REG-NPL-03",
    title: "Airport Proximity",
    description: "No drone operations within 5km of airports without explicit permission",
    applicableTo: ["recreational", "commercial", "government"],
    source: "CAA Nepal Drone Regulations",
    zoneDependant: true,
    applicableZones: ["restricted", "controlled"]
  },
  {
    regulationId: "REG-NPL-04",
    title: "Wildlife Areas",
    description: "Special permits required for drone operation over wildlife conservation areas",
    applicableTo: ["recreational", "commercial"],
    source: "Department of National Parks and Wildlife Conservation",
    zoneDependant: true,
    applicableZones: ["advisory"]
  },
  {
    regulationId: "REG-NPL-05",
    title: "Night Operations",
    description: "Drone operations between sunset and sunrise require special authorization",
    applicableTo: ["commercial", "government"],
    source: "CAA Nepal Drone Regulations",
    zoneDependant: false,
    applicableZones: null
  }
];

async function seedDatabase() {
  console.log("Starting database seeding...");
  
  try {
    // Seed airspace zones
    console.log("Seeding airspace zones...");
    
    for (const zone of sampleAirspaceZones) {
      // Check if zone already exists
      const existingZone = await db.select()
        .from(airspaceZones)
        .where(eq(airspaceZones.zoneId, zone.zoneId));
      
      if (existingZone.length === 0) {
        // Validate against schema
        const validatedZone = insertAirspaceZoneSchema.parse(zone);
        
        // Insert zone
        await db.insert(airspaceZones).values(validatedZone);
        console.log(`Added zone: ${zone.name}`);
      } else {
        console.log(`Zone ${zone.name} already exists, skipping...`);
      }
    }
    
    // Seed regulations
    console.log("Seeding regulations...");
    
    for (const regulation of sampleRegulations) {
      // Check if regulation already exists
      const existingRegulation = await db.select()
        .from(regulations)
        .where(eq(regulations.regulationId, regulation.regulationId));
      
      if (existingRegulation.length === 0) {
        // Validate against schema
        const validatedRegulation = insertRegulationSchema.parse(regulation);
        
        // Insert regulation
        await db.insert(regulations).values(validatedRegulation);
        console.log(`Added regulation: ${regulation.title}`);
      } else {
        console.log(`Regulation ${regulation.title} already exists, skipping...`);
      }
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    await pool.end();
  }
}

// Run the seeding function
seedDatabase().catch(console.error);