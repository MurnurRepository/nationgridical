import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  capitalCityName: text("capital_city_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: varchar("country_id").notNull().references(() => countries.id, { onDelete: "cascade" }).unique(),
  money: real("money").notNull().default(100000),
  population: integer("population").notNull().default(500000),
  researchPoints: real("research_points").notNull().default(0),
  manpower: integer("manpower").notNull().default(20000),
  stability: real("stability").notNull().default(100),
  oil: real("oil").notNull().default(0),
  minerals: real("minerals").notNull().default(0),
  materials: real("materials").notNull().default(0),
  food: real("food").notNull().default(0),
  uranium: real("uranium").notNull().default(0),
  economicStrength: real("economic_strength").notNull().default(50),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const territories = pgTable("territories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: varchar("country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  cityName: text("city_name"),
});

export const structures = pgTable("structures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  territoryId: varchar("territory_id").notNull().references(() => territories.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: varchar("country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  currentTerritoryId: varchar("current_territory_id").references(() => territories.id, { onDelete: "set null" }),
  targetTerritoryId: varchar("target_territory_id").references(() => territories.id, { onDelete: "set null" }),
  movementProgress: real("movement_progress").notNull().default(0),
  movementSpeed: real("movement_speed").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const research = pgTable("research", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: varchar("country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  branch: text("branch").notNull(),
  technology: text("technology").notNull(),
  level: integer("level").notNull().default(0),
  inProgress: boolean("in_progress").notNull().default(false),
  progress: real("progress").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromCountryId: varchar("from_country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  toCountryId: varchar("to_country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  offerResources: jsonb("offer_resources").notNull(),
  requestResources: jsonb("request_resources").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: varchar("country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  country: one(countries, {
    fields: [users.id],
    references: [countries.userId],
  }),
}));

export const countriesRelations = relations(countries, ({ one, many }) => ({
  user: one(users, {
    fields: [countries.userId],
    references: [users.id],
  }),
  resources: one(resources, {
    fields: [countries.id],
    references: [resources.countryId],
  }),
  territories: many(territories),
  units: many(units),
  research: many(research),
  outgoingTrades: many(trades, { relationName: "outgoingTrades" }),
  incomingTrades: many(trades, { relationName: "incomingTrades" }),
  events: many(events),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  country: one(countries, {
    fields: [resources.countryId],
    references: [countries.id],
  }),
}));

export const territoriesRelations = relations(territories, ({ one, many }) => ({
  country: one(countries, {
    fields: [territories.countryId],
    references: [countries.id],
  }),
  structures: many(structures),
  unitsHere: many(units, { relationName: "currentLocation" }),
}));

export const structuresRelations = relations(structures, ({ one }) => ({
  territory: one(territories, {
    fields: [structures.territoryId],
    references: [territories.id],
  }),
}));

export const unitsRelations = relations(units, ({ one }) => ({
  country: one(countries, {
    fields: [units.countryId],
    references: [countries.id],
  }),
  currentTerritory: one(territories, {
    fields: [units.currentTerritoryId],
    references: [territories.id],
    relationName: "currentLocation",
  }),
  targetTerritory: one(territories, {
    fields: [units.targetTerritoryId],
    references: [territories.id],
  }),
}));

export const researchRelations = relations(research, ({ one }) => ({
  country: one(countries, {
    fields: [research.countryId],
    references: [countries.id],
  }),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  fromCountry: one(countries, {
    fields: [trades.fromCountryId],
    references: [countries.id],
    relationName: "outgoingTrades",
  }),
  toCountry: one(countries, {
    fields: [trades.toCountryId],
    references: [countries.id],
    relationName: "incomingTrades",
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  country: one(countries, {
    fields: [events.countryId],
    references: [countries.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCountrySchema = createInsertSchema(countries).omit({ id: true, createdAt: true });
export const insertResourcesSchema = createInsertSchema(resources).omit({ id: true, lastUpdated: true });
export const insertTerritorySchema = createInsertSchema(territories).omit({ id: true });
export const insertStructureSchema = createInsertSchema(structures).omit({ id: true, createdAt: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true });
export const insertResearchSchema = createInsertSchema(research).omit({ id: true, updatedAt: true });
export const insertTradeSchema = createInsertSchema(trades).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

export type InsertResources = z.infer<typeof insertResourcesSchema>;
export type Resources = typeof resources.$inferSelect;

export type InsertTerritory = z.infer<typeof insertTerritorySchema>;
export type Territory = typeof territories.$inferSelect;

export type InsertStructure = z.infer<typeof insertStructureSchema>;
export type Structure = typeof structures.$inferSelect;

export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof units.$inferSelect;

export type InsertResearch = z.infer<typeof insertResearchSchema>;
export type Research = typeof research.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Game constants and types
export const STRUCTURE_TYPES = [
  "bank",
  "farm",
  "political_office",
  "city",
  "factory",
  "military_base",
  "oil_rig",
  "mine",
  "research_center",
  "missile_silo",
  "rocket_silo",
  "nuclear_power_plant",
] as const;

export const UNIT_TYPES = [
  "infantry",
  "special_forces",
  "tank",
  "apc",
  "aircraft",
  "missile",
] as const;

export const RESEARCH_BRANCHES = ["military", "economic", "political"] as const;

export const TRADE_STATUSES = ["pending", "accepted", "rejected", "cancelled"] as const;

export const EVENT_TYPES = ["coup", "insurgency", "economic_crash"] as const;

export type StructureType = typeof STRUCTURE_TYPES[number];
export type UnitType = typeof UNIT_TYPES[number];
export type ResearchBranch = typeof RESEARCH_BRANCHES[number];
export type TradeStatus = typeof TRADE_STATUSES[number];
export type EventType = typeof EVENT_TYPES[number];
