import { 
  users, type User, type InsertUser,
  flightPlans, type FlightPlan, type InsertFlightPlan,
  airspaceZones, type AirspaceZone, type InsertAirspaceZone,
  regulations, type Regulation, type InsertRegulation
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Drizzle ORM instance
const db = drizzle(pool);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flight plan operations
  getFlightPlan(id: number): Promise<FlightPlan | undefined>;
  getFlightPlansByUserId(userId: number): Promise<FlightPlan[]>;
  createFlightPlan(flightPlan: InsertFlightPlan): Promise<FlightPlan>;
  updateFlightPlan(id: number, flightPlan: Partial<FlightPlan>): Promise<FlightPlan | undefined>;
  deleteFlightPlan(id: number): Promise<boolean>;
  
  // Airspace zone operations
  getAirspaceZone(id: number): Promise<AirspaceZone | undefined>;
  getAirspaceZoneByZoneId(zoneId: string): Promise<AirspaceZone | undefined>;
  getAllAirspaceZones(): Promise<AirspaceZone[]>;
  createAirspaceZone(zone: InsertAirspaceZone): Promise<AirspaceZone>;
  
  // Regulation operations
  getRegulation(id: number): Promise<Regulation | undefined>;
  getAllRegulations(): Promise<Regulation[]>;
  createRegulation(regulation: InsertRegulation): Promise<Regulation>;
}

// PostgreSQL implementation of the storage interface
export class PgStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Flight plan operations
  async getFlightPlan(id: number): Promise<FlightPlan | undefined> {
    const result = await db.select().from(flightPlans).where(eq(flightPlans.id, id));
    return result[0];
  }
  
  async getFlightPlansByUserId(userId: number): Promise<FlightPlan[]> {
    return await db.select().from(flightPlans).where(eq(flightPlans.userId, userId));
  }
  
  async createFlightPlan(plan: InsertFlightPlan): Promise<FlightPlan> {
    const result = await db.insert(flightPlans).values(plan).returning();
    return result[0];
  }
  
  async updateFlightPlan(id: number, plan: Partial<FlightPlan>): Promise<FlightPlan | undefined> {
    const result = await db.update(flightPlans)
      .set(plan)
      .where(eq(flightPlans.id, id))
      .returning();
    return result[0];
  }
  
  async deleteFlightPlan(id: number): Promise<boolean> {
    const result = await db.delete(flightPlans).where(eq(flightPlans.id, id)).returning();
    return result.length > 0;
  }
  
  // Airspace zone operations
  async getAirspaceZone(id: number): Promise<AirspaceZone | undefined> {
    const result = await db.select().from(airspaceZones).where(eq(airspaceZones.id, id));
    return result[0];
  }
  
  async getAirspaceZoneByZoneId(zoneId: string): Promise<AirspaceZone | undefined> {
    const result = await db.select().from(airspaceZones).where(eq(airspaceZones.zoneId, zoneId));
    return result[0];
  }
  
  async getAllAirspaceZones(): Promise<AirspaceZone[]> {
    return await db.select().from(airspaceZones);
  }
  
  async createAirspaceZone(zone: InsertAirspaceZone): Promise<AirspaceZone> {
    const result = await db.insert(airspaceZones).values(zone).returning();
    return result[0];
  }
  
  // Regulation operations
  async getRegulation(id: number): Promise<Regulation | undefined> {
    const result = await db.select().from(regulations).where(eq(regulations.id, id));
    return result[0];
  }
  
  async getAllRegulations(): Promise<Regulation[]> {
    return await db.select().from(regulations);
  }
  
  async createRegulation(regulation: InsertRegulation): Promise<Regulation> {
    const result = await db.insert(regulations).values(regulation).returning();
    return result[0];
  }
}

// Create a singleton instance of the storage
export const storage = new PgStorage();
