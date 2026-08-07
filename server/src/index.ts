import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDbTables } from "./db.js";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import syncRouter from "./routes/sync.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Graceful JSON syntax error parser middleware
app.use((err: any, _req: Request, res: Response, next: any) => {
  if (err instanceof SyntaxError && "body" in err) {
    console.warn("[Optikur Server Warning]: Received malformed JSON request body payload.");
    return res.status(400).json({ error: "Invalid JSON body payload format." });
  }
  next(err);
});

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Optikur Backend API (Neon PostgreSQL)",
    timestamp: new Date().toISOString(),
  });
});

// Mount Production API Routers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/sync", syncRouter);

// Initialize DB Table Schemas on startup if connected to Neon
initDbTables().catch((err) => console.warn("[DB Init Warning]:", err));

app.listen(PORT, () => {
  console.log(`🚀 [Optikur Backend Server] Running on http://localhost:${PORT}`);
  console.log(`📡 [API Routes Mounted]: /api/auth/* | /api/user/* | /api/sync/* | GET /health`);
});
