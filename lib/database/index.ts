import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

// Disable prepared statements because Supabase transaction poolers do not support them.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);

export * from "./accounts";
export * from "./buckets";
export * from "./categories";
export * from "./transactions";
export * from "./types";
