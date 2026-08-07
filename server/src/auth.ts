import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "optikur_prod_super_secret_jwt_key_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "optikur_prod_super_secret_refresh_key_2026";

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(user: { id: string; email: string; full_name?: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.full_name,
      iss: "optikur_auth_service",
    },
    JWT_SECRET,
    { expiresIn: "1d" } // 24-hour access token
  );
}

export function signRefreshToken(user: { id: string; email: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: "refresh",
      iss: "optikur_auth_service",
    },
    JWT_REFRESH_SECRET,
    { expiresIn: "30d" } // 30-day refresh token
  );
}

export function verifyAccessToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Express Middleware: Protects endpoints by verifying Authorization Bearer token
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email?.split("@")[0] || "User",
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}
