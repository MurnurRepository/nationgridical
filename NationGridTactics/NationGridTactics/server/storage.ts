import { 
  users, 
  countries, 
  resources, 
  territories, 
  structures, 
  units, 
  research, 
  trades, 
  events,
  type User, 
  type InsertUser,
  type Country,
  type InsertCountry,
  type Resources,
  type InsertResources,
  type Territory,
  type InsertTerritory,
  type Structure,
  type InsertStructure,
  type Unit,
  type InsertUnit,
  type Research,
  type InsertResearch,
  type Trade,
  type InsertTrade,
  type Event,
  type InsertEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Countries
  getCountry(id: string): Promise<Country | undefined>;
  getCountryByUserId(userId: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  getAllCountries(): Promise<Country[]>;

  // Resources
  getResourcesByCountryId(countryId: string): Promise<Resources | undefined>;
  createResources(resources: InsertResources): Promise<Resources>;
  updateResources(countryId: string, resources: Partial<Resources>): Promise<Resources>;

  // Territories
  getTerritoriesByCountryId(countryId: string): Promise<Territory[]>;
  getTerritoryById(id: string): Promise<Territory | undefined>;
  createTerritory(territory: InsertTerritory): Promise<Territory>;
  getAllTerritories(): Promise<Territory[]>;

  // Structures
  getStructuresByCountryId(countryId: string): Promise<Structure[]>;
  createStructure(structure: InsertStructure): Promise<Structure>;

  // Units
  getUnitsByCountryId(countryId: string): Promise<Unit[]>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<Unit>): Promise<Unit>;

  // Research
  getResearchByCountryId(countryId: string): Promise<Research[]>;
  createResearch(research: InsertResearch): Promise<Research>;
  updateResearch(id: string, research: Partial<Research>): Promise<Research>;

  // Trades
  getTradesByCountryId(countryId: string): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, trade: Partial<Trade>): Promise<Trade>;

  // Events
  getEventsByCountryId(countryId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Countries
  async getCountry(id: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country || undefined;
  }

  async getCountryByUserId(userId: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.userId, userId));
    return country || undefined;
  }

  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    const [country] = await db
      .insert(countries)
      .values(insertCountry)
      .returning();
    return country;
  }

  async getAllCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  // Resources
  async getResourcesByCountryId(countryId: string): Promise<Resources | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.countryId, countryId));
    return resource || undefined;
  }

  async createResources(insertResources: InsertResources): Promise<Resources> {
    const [resource] = await db
      .insert(resources)
      .values(insertResources)
      .returning();
    return resource;
  }

  async updateResources(countryId: string, updates: Partial<Resources>): Promise<Resources> {
    const [updated] = await db
      .update(resources)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(resources.countryId, countryId))
      .returning();
    return updated;
  }

  // Territories
  async getTerritoriesByCountryId(countryId: string): Promise<Territory[]> {
    return await db.select().from(territories).where(eq(territories.countryId, countryId));
  }

  async getTerritoryById(id: string): Promise<Territory | undefined> {
    const [territory] = await db.select().from(territories).where(eq(territories.id, id));
    return territory || undefined;
  }

  async createTerritory(insertTerritory: InsertTerritory): Promise<Territory> {
    const [territory] = await db
      .insert(territories)
      .values(insertTerritory)
      .returning();
    return territory;
  }

  async getAllTerritories(): Promise<Territory[]> {
    return await db.select().from(territories);
  }

  // Structures
  async getStructuresByCountryId(countryId: string): Promise<Structure[]> {
    const result = await db
      .select({
        structure: structures,
      })
      .from(structures)
      .innerJoin(territories, eq(structures.territoryId, territories.id))
      .where(eq(territories.countryId, countryId));
    
    return result.map(r => r.structure);
  }

  async createStructure(insertStructure: InsertStructure): Promise<Structure> {
    const [structure] = await db
      .insert(structures)
      .values(insertStructure)
      .returning();
    return structure;
  }

  // Units
  async getUnitsByCountryId(countryId: string): Promise<Unit[]> {
    return await db.select().from(units).where(eq(units.countryId, countryId));
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const [unit] = await db
      .insert(units)
      .values(insertUnit)
      .returning();
    return unit;
  }

  async updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
    const [updated] = await db
      .update(units)
      .set(updates)
      .where(eq(units.id, id))
      .returning();
    return updated;
  }

  // Research
  async getResearchByCountryId(countryId: string): Promise<Research[]> {
    return await db.select().from(research).where(eq(research.countryId, countryId));
  }

  async createResearch(insertResearch: InsertResearch): Promise<Research> {
    const [researchItem] = await db
      .insert(research)
      .values(insertResearch)
      .returning();
    return researchItem;
  }

  async updateResearch(id: string, updates: Partial<Research>): Promise<Research> {
    const [updated] = await db
      .update(research)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(research.id, id))
      .returning();
    return updated;
  }

  // Trades
  async getTradesByCountryId(countryId: string): Promise<Trade[]> {
    return await db
      .select()
      .from(trades)
      .where(
        eq(trades.fromCountryId, countryId)
      );
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const [trade] = await db
      .insert(trades)
      .values(insertTrade)
      .returning();
    return trade;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    const [updated] = await db
      .update(trades)
      .set(updates)
      .where(eq(trades.id, id))
      .returning();
    return updated;
  }

  // Events
  async getEventsByCountryId(countryId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.countryId, countryId))
      .orderBy(desc(events.createdAt))
      .limit(50);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }
}

export const storage = new DatabaseStorage();
