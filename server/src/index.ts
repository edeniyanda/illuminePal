import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import { hashPassword, comparePassword, signUserToken, verifyToken } from "./auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Optikur Auth API", timestamp: new Date().toISOString() });
});

/**
 * POST /api/auth/signup
 * Creates a new user account in Neon Postgres `users` table
 * Returns user profile + JWT authentication token
 */
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const fullName = name?.trim() || cleanEmail.split("@")[0];

    // Check if email already exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
    }

    // Hash password & insert into Neon Postgres
    const passwordHash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at`,
      [cleanEmail, passwordHash, fullName]
    );

    const newUser = result.rows[0];
    const token = signUserToken(newUser);

    console.log(`✅ [Sign Up Success] User created on Neon Postgres: ${newUser.email} (${newUser.id})`);

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
      },
      token,
    });
  } catch (error: any) {
    console.error("❌ [Sign Up Error]:", error);
    return res.status(500).json({ error: "Failed to create account. Please check database connection." });
  }
});

/**
 * POST /api/auth/login
 * Validates user credentials against Neon Postgres
 * Returns user profile + JWT authentication token
 */
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query Neon Postgres for user
    const result = await query("SELECT id, email, password_hash, full_name FROM users WHERE email = $1", [cleanEmail]);

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signUserToken(user);

    console.log(`✅ [Login Success] User authenticated on Neon Postgres: ${user.email} (${user.id})`);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
      token,
    });
  } catch (error: any) {
    console.error("❌ [Login Error]:", error);
    return res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});

/**
 * GET /api/auth/me
 * Verifies JWT token and returns current user info
 */
app.get("/api/auth/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    return res.json({ user: decoded });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Optikur Auth Server] Running on http://localhost:${PORT}`);
  console.log(`📡 [Endpoints]: POST /api/auth/signup | POST /api/auth/login | GET /health`);
});
