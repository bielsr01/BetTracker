import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { type User, type InsertUser, type Bet, type InsertBet, users, bets } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bet methods
  getAllBets(): Promise<Bet[]>;
  getBet(id: string): Promise<Bet | undefined>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(id: string, status: 'pending' | 'won' | 'lost' | 'returned'): Promise<Bet | undefined>;
  getBetsByPairId(pairId: string): Promise<Bet[]>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql, { schema: { users, bets } });
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllBets(): Promise<Bet[]> {
    return await this.db.select().from(bets).orderBy(bets.createdAt);
  }

  async getBet(id: string): Promise<Bet | undefined> {
    const result = await this.db.select().from(bets).where(eq(bets.id, id));
    return result[0];
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const result = await this.db.insert(bets).values(bet).returning();
    return result[0];
  }

  async updateBetStatus(id: string, status: 'pending' | 'won' | 'lost' | 'returned'): Promise<Bet | undefined> {
    const result = await this.db.update(bets).set({ status }).where(eq(bets.id, id)).returning();
    return result[0];
  }

  async getBetsByPairId(pairId: string): Promise<Bet[]> {
    return await this.db.select().from(bets).where(eq(bets.pairId, pairId));
  }
}

export const storage = new DatabaseStorage();
