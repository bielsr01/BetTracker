import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bettingHouse: text("betting_house").notNull(),
  betType: text("bet_type").notNull(),
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  stake: decimal("stake", { precision: 10, scale: 2 }).notNull(),
  potentialProfit: decimal("potential_profit", { precision: 10, scale: 2 }).notNull(),
  gameDate: timestamp("game_date").notNull(),
  status: text("status", { enum: ["pending", "won", "lost", "returned"] }).notNull().default("pending"),
  isVerified: boolean("is_verified").notNull().default(false),
  pairId: varchar("pair_id"), // Links two bets together as a pair
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

// OCR extracted data type
export const ocrDataSchema = z.object({
  bettingHouse: z.string().min(1, "Casa de aposta é obrigatória"),
  betType: z.string().min(1, "Tipo de aposta é obrigatório"),
  odds: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Odd deve ser um número válido"),
  stake: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor da aposta deve ser um número válido"),
  potentialProfit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Lucro potencial deve ser um número válido"),
});

export type OCRData = z.infer<typeof ocrDataSchema>;
