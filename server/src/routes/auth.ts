import { Router, Request, Response } from "express";
import { query } from "../db.js";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  authenticateToken,
  AuthenticatedRequest,
} from "../auth.js";

const router = Router();

/**
 * POST /api/auth/signup
 * Registers a new user account in Neon PostgreSQL & creates default user settings
 */
router.post("/signup", async (req: Request, res: Response) => {
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

    // Check if user email already exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
    }

    // Hash password & insert into users table
    const passwordHash = await hashPassword(password);
    const userResult = await query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at`,
      [cleanEmail, passwordHash, fullName]
    );

    const newUser = userResult.rows[0];

    // Initialize default user settings in cloud DB if not already present
    const existingSettings = await query("SELECT user_id FROM user_settings WHERE user_id = $1", [newUser.id]);
    if (!existingSettings.rowCount || existingSettings.rowCount === 0) {
      const settingsId = "settings_" + newUser.id;
      await query(
        `INSERT INTO user_settings (id, user_id, focus_minutes, rest_seconds, sound_enabled, strict_mode)
         VALUES ($1, $2, 20, 20, 1, 0)`,
        [settingsId, newUser.id]
      );
    }

    const accessToken = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser);

    console.log(`✅ [Backend Auth] New user registered: ${newUser.email} (${newUser.id})`);

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("❌ [Signup Error]:", error);
    return res.status(500).json({ error: "Failed to create account. Please check server connection." });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials against Neon PostgreSQL & issues fresh JWT access/refresh tokens
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user record
    const result = await query(
      "SELECT id, email, password_hash, full_name FROM users WHERE email = $1",
      [cleanEmail]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    console.log(`✅ [Backend Auth] User authenticated: ${user.email} (${user.id})`);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("❌ [Login Error]:", error);
    return res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});

/**
 * POST /api/auth/refresh
 * Rotates and issues a new access token using a valid refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required." });
  }

  try {
    const decoded: any = verifyRefreshToken(refreshToken);
    const result = await query(
      "SELECT id, email, full_name FROM users WHERE id = $1",
      [decoded.sub]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(401).json({ error: "User account not found." });
    }

    const user = result.rows[0];
    const newAccessToken = signAccessToken(user);

    return res.json({ token: newAccessToken });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
});

/**
 * GET /api/auth/me
 * Protected endpoint returning active user profile
 */
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await query(
      "SELECT id, email, full_name, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("❌ [Me Error]:", error);
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

export default router;
