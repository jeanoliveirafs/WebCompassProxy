import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const navigationHistory = pgTable("navigation_history", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  responseTime: integer("response_time"),
  statusCode: integer("status_code"),
  contentSize: integer("content_size"),
  screenshotPath: text("screenshot_path"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNavigationHistorySchema = createInsertSchema(navigationHistory).pick({
  url: true,
  title: true,
  responseTime: true,
  statusCode: true,
  contentSize: true,
  screenshotPath: true,
});

export const insertScriptSchema = createInsertSchema(scripts).pick({
  name: true,
  description: true,
  content: true,
});

export type InsertNavigationHistory = z.infer<typeof insertNavigationHistorySchema>;
export type NavigationHistory = typeof navigationHistory.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

// API response types
export const proxyResponseSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  screenshotPath: z.string().optional(),
  responseTime: z.number(),
  statusCode: z.number(),
  contentSize: z.number(),
});

export const scriptExecutionSchema = z.object({
  script: z.string(),
  url: z.string(),
});

export type ProxyResponse = z.infer<typeof proxyResponseSchema>;
export type ScriptExecution = z.infer<typeof scriptExecutionSchema>;
