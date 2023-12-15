import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

// create database pool connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Function to check if the database is up
async function checkDatabaseConnection() {
  try {
    // Perform a simple query to check the connection
    const result = await db.execute(sql`SELECT 1`);
    if (result === undefined) {
      console.error("Database connection check failed");
    }
  } catch (error) {
    console.error("Database connection check failed:", error);
  }
}

// Interval in milliseconds for the database check (e.g., every 1 minutes)
const dbCheckInterval = 1 * 30 * 1000;

// Schedule the database check to run at regular intervals
setInterval(checkDatabaseConnection, dbCheckInterval);

// Initial check
checkDatabaseConnection();
