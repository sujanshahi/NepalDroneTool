import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - basic user account
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  role: text("role").notNull().default("user"), // user, admin
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Flight plans schema - to save user flight plans
export const flightPlans = pgTable("flight_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  category: text("category").default("Basic"), // Micro, Basic, Advanced
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
  step: integer("step").notNull(),
  intent: jsonb("intent"), // JSON object with flight intent data
  location: jsonb("location"), // JSON object with location data
  flight: jsonb("flight"), // JSON object with flight details
  results: jsonb("results"), // JSON object with flight results
  path: jsonb("path"), // GeoJSON object with flight path (polyline or polygon)
  pilotLocation: jsonb("pilot_location"), // Coordinates of the pilot's location
  notes: text("notes"), // Additional notes
  status: text("status").default("draft"), // draft, planned, completed, cancelled
});

export const insertFlightPlanSchema = createInsertSchema(flightPlans).pick({
  userId: true,
  name: true,
  category: true,
  createdAt: true,
  updatedAt: true,
  step: true,
  intent: true,
  location: true,
  flight: true,
  results: true,
  path: true,
  pilotLocation: true,
  notes: true,
  status: true,
});

// Airspace zones schema - for storing Nepal's airspace restrictions
export const airspaceZones = pgTable("airspace_zones", {
  id: serial("id").primaryKey(),
  zoneId: text("zone_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "restricted", "controlled", "advisory", "open"
  geometry: jsonb("geometry").notNull(), // GeoJSON geometry
});

export const insertAirspaceZoneSchema = createInsertSchema(airspaceZones).pick({
  zoneId: true,
  name: true,
  description: true,
  type: true,
  geometry: true,
});

// Regulations schema - for storing Nepal's drone regulations
export const regulations = pgTable("regulations", {
  id: serial("id").primaryKey(),
  regulationId: text("regulation_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  applicableTo: jsonb("applicable_to").notNull(), // Array of strings
  source: text("source").notNull(),
  zoneDependant: boolean("zone_dependant").notNull(),
  applicableZones: jsonb("applicable_zones"), // Array of zone types
});

export const insertRegulationSchema = createInsertSchema(regulations).pick({
  regulationId: true,
  title: true,
  description: true,
  applicableTo: true,
  source: true,
  zoneDependant: true,
  applicableZones: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFlightPlan = z.infer<typeof insertFlightPlanSchema>;
export type FlightPlan = typeof flightPlans.$inferSelect;

export type InsertAirspaceZone = z.infer<typeof insertAirspaceZoneSchema>;
export type AirspaceZone = typeof airspaceZones.$inferSelect;

export type InsertRegulation = z.infer<typeof insertRegulationSchema>;
export type Regulation = typeof regulations.$inferSelect;

// Aircraft schema - for user's drone fleet
export const aircraft = pgTable("aircraft", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  weight: integer("weight"), // in grams
  type: text("type"), // micro, small, medium, large
  maxFlightTime: integer("max_flight_time"), // in minutes
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  status: text("status").notNull().default("active"), // active, inactive, maintenance
});

export const insertAircraftSchema = createInsertSchema(aircraft).pick({
  userId: true,
  name: true,
  manufacturer: true,
  model: true,
  serialNumber: true,
  weight: true,
  type: true,
  maxFlightTime: true,
});

export type InsertAircraft = z.infer<typeof insertAircraftSchema>;
export type Aircraft = typeof aircraft.$inferSelect;

// Flight Logs schema - for tracking completed drone flights
export const flightLogs = pgTable("flight_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  flightPlanId: integer("flight_plan_id").references(() => flightPlans.id),
  aircraftId: integer("aircraft_id").references(() => aircraft.id).notNull(),
  pilotName: text("pilot_name").notNull(), // Pilot in command
  observers: jsonb("observers"), // Array of observer names
  startTime: text("start_time").notNull(), // ISO date string
  endTime: text("end_time").notNull(), // ISO date string
  duration: integer("duration"), // Duration in minutes
  weatherConditions: text("weather_conditions"),
  flightTrack: jsonb("flight_track"), // Array of coordinates representing actual flight path
  notes: text("notes"), // Mission notes, incidents, etc.
  attachments: jsonb("attachments"), // Array of attachment URLs/filenames
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertFlightLogSchema = createInsertSchema(flightLogs).pick({
  userId: true,
  flightPlanId: true,
  aircraftId: true,
  pilotName: true,
  observers: true,
  startTime: true,
  endTime: true,
  duration: true,
  weatherConditions: true,
  flightTrack: true,
  notes: true,
  attachments: true,
});

export type InsertFlightLog = z.infer<typeof insertFlightLogSchema>;
export type FlightLog = typeof flightLogs.$inferSelect;
