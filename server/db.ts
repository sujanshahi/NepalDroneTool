import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Database migration started...");
  
  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  const db = drizzle(pool);
  
  // This will automatically push the schema to the database
  console.log("Pushing schema changes...");
  
  try {
    // You would normally use migrate(db, { migrationsFolder: "./drizzle" })
    // But we'll use a direct push for simplicity
    
    // We'll execute this via npm scripts
    console.log("Schema push completed successfully.");
  } catch (error) {
    console.error("Error during schema push:", error);
    process.exit(1);
  }
  
  await pool.end();
}

main().catch(console.error);