import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isPlaceholder = !connectionString || connectionString.includes("user:password@ep-sample");

if (isPlaceholder) {
  console.warn("⚠️ [Optikur Server Warning]: DATABASE_URL is set to a placeholder in server/.env.");
  console.warn("Please replace DATABASE_URL with your real Neon Postgres connection string.");
}

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
});

export async function query(text: string, params?: any[]) {
  if (isPlaceholder) {
    throw new Error("DATABASE_URL is not configured on the server. Please set a valid DATABASE_URL in server/.env");
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`[SQL Query] executed in ${duration}ms | rows: ${res.rowCount}`);
  return res;
}
