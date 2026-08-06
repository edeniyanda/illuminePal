import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("user:password@ep-sample")) {
  console.warn("⚠️ [Optikur Server Warning]: DATABASE_URL is set to a placeholder in server/.env.");
  console.warn("Please replace DATABASE_URL with your real Neon Postgres connection string.");
}

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`[SQL Query] executed in ${duration}ms | rows: ${res.rowCount}`);
  return res;
}
