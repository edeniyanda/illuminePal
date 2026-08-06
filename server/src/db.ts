import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isPlaceholder = !connectionString || connectionString.includes("user:password@ep-sample");

if (isPlaceholder) {
  console.warn("⚠️ [Optikur Server Warning]: DATABASE_URL is set to a placeholder in server/.env.");
  console.warn("💡 [Optikur Dev DB]: Running in local in-memory fallback database mode for dev server.");
  console.warn("To use live Neon Postgres, replace DATABASE_URL in server/.env with your connection string.");
}

export const pool = new Pool({
  connectionString: isPlaceholder ? undefined : connectionString,
  ssl: isPlaceholder
    ? undefined
    : {
        rejectUnauthorized: false,
      },
  connectionTimeoutMillis: 5000,
});

interface LocalUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
}

const localUsersStore = new Map<string, LocalUser>();

export async function query(text: string, params?: any[]) {
  if (isPlaceholder) {
    const cleanText = text.trim().toLowerCase();
    const emailParam = params?.[0]?.toString().toLowerCase();

    // Query: SELECT id FROM users WHERE email = $1 or SELECT id, email, password_hash...
    if (cleanText.startsWith("select")) {
      if (emailParam && localUsersStore.has(emailParam)) {
        const u = localUsersStore.get(emailParam)!;
        return {
          rowCount: 1,
          rows: [u],
        };
      }
      return { rowCount: 0, rows: [] };
    }

    // Query: INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING ...
    if (cleanText.startsWith("insert")) {
      const email = params?.[0]?.toString().toLowerCase() || "";
      const password_hash = params?.[1]?.toString() || "";
      const full_name = params?.[2]?.toString() || email.split("@")[0];
      const id = "usr_local_" + Math.random().toString(36).substring(2, 10);
      const created_at = new Date().toISOString();

      const newUser: LocalUser = { id, email, password_hash, full_name, created_at };
      localUsersStore.set(email, newUser);

      console.log(`[Local Dev DB] Saved user: ${email} (${id})`);
      return {
        rowCount: 1,
        rows: [newUser],
      };
    }

    return { rowCount: 0, rows: [] };
  }

  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`[SQL Query] executed in ${duration}ms | rows: ${res.rowCount}`);
  return res;
}
