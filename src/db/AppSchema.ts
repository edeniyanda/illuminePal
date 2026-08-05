import { column, Schema, Table } from "@powersync/web";

/**
 * Optikur Local-First Database Schema (PowerSync + SQLite)
 * 
 * Defines tables for:
 * 1. break_logs: Granular history of completed/skipped 20-20-20 breaks
 * 2. user_settings: Offline-first application preferences
 * 3. daily_stats: Aggregated daily break compliance & habit streak counters
 */

export const breakLogs = new Table({
  user_id: column.text,
  timestamp: column.text,
  duration_seconds: column.integer,
  completed: column.integer, // 1 = completed, 0 = skipped
  break_type: column.text,    // 'short_break' | 'long_break' | 'exercise'
  created_at: column.text,
});

export const userSettings = new Table({
  user_id: column.text,
  focus_minutes: column.integer,
  rest_seconds: column.integer,
  sound_enabled: column.integer,                 // 1 or 0
  strict_mode: column.integer,                   // 1 or 0
  notifications_enabled: column.integer,         // 1 or 0
  overlay_notifications_enabled: column.integer, // 1 or 0
  native_notifications_enabled: column.integer,  // 1 or 0
  background_timer_enabled: column.integer,      // 1 or 0
  updated_at: column.text,
});

export const dailyStats = new Table({
  user_id: column.text,
  date: column.text,             // Format: 'YYYY-MM-DD'
  breaks_completed: column.integer,
  streak_days: column.integer,
  updated_at: column.text,
});

export const AppSchema = new Schema({
  break_logs: breakLogs,
  user_settings: userSettings,
  daily_stats: dailyStats,
});

export type BreakLogRecord = {
  id: string;
  user_id?: string | null;
  timestamp: string;
  duration_seconds: number;
  completed: number;
  break_type: string;
  created_at: string;
};

export type UserSettingsRecord = {
  id: string;
  user_id?: string | null;
  focus_minutes: number;
  rest_seconds: number;
  sound_enabled: number;
  strict_mode: number;
  notifications_enabled: number;
  overlay_notifications_enabled: number;
  native_notifications_enabled: number;
  background_timer_enabled: number;
  updated_at: string;
};

export type DailyStatsRecord = {
  id: string;
  user_id?: string | null;
  date: string;
  breaks_completed: number;
  streak_days: number;
  updated_at: string;
};
