import { Router, Response } from "express";
import { query } from "../db.js";
import { authenticateToken, AuthenticatedRequest, hashPassword, comparePassword } from "../auth.js";

const router = Router();

/**
 * GET /api/user/profile
 * Returns detailed user profile and cloud settings
 */
router.get("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const userRes = await query(
      "SELECT id, email, full_name, created_at FROM users WHERE id = $1",
      [userId]
    );
    const settingsRes = await query(
      "SELECT * FROM user_settings WHERE user_id = $1",
      [userId]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = userRes.rows[0];
    const settings = settingsRes.rows[0] || null;

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
      settings,
    });
  } catch (error) {
    console.error("❌ [Get Profile Error]:", error);
    return res.status(500).json({ error: "Failed to load user profile." });
  }
});

/**
 * PUT /api/user/profile
 * Updates user full name or email address
 */
router.put("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ error: "Please provide a name or email to update." });
    }

    let updatedName = name?.trim();
    let updatedEmail = email?.trim().toLowerCase();

    // Check email availability if changing email
    if (updatedEmail) {
      if (!updatedEmail.includes("@")) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }
      const existing = await query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [updatedEmail, userId]
      );
      if (existing.rowCount && existing.rowCount > 0) {
        return res.status(409).json({ error: "This email address is already in use by another account." });
      }
    }

    const currentRes = await query("SELECT full_name, email FROM users WHERE id = $1", [userId]);
    if (!currentRes.rowCount) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const current = currentRes.rows[0];
    updatedName = updatedName || current.full_name;
    updatedEmail = updatedEmail || current.email;

    const result = await query(
      `UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, email, full_name`,
      [updatedName, updatedEmail, userId]
    );

    const updatedUser = result.rows[0];

    console.log(`✅ [User Profile Updated]: ${updatedUser.email} (${updatedUser.id})`);

    return res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.full_name,
        updatedAt: updatedUser.updated_at,
      },
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("❌ [Update Profile Error]:", error);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

/**
 * PUT /api/user/password
 * Updates user password after verifying current password
 */
router.put("/password", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const userRes = await query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({ error: "User account not found." });
    }

    const user = userRes.rows[0];
    const isMatch = await comparePassword(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const newHash = await hashPassword(newPassword);
    await query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [newHash, userId]);

    console.log(`✅ [Password Updated]: User ${userId}`);

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("❌ [Update Password Error]:", error);
    return res.status(500).json({ error: "Failed to update password." });
  }
});

export default router;
