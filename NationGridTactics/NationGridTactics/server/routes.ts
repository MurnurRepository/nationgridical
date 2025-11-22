import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertCountrySchema, insertStructureSchema, insertUnitSchema, insertResearchSchema, insertTradeSchema, insertEventSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Utility function to generate exactly 100 connected territories
function generateTerritories(countryId: string, count: number = 100) {
  const territories = [];
  const startX = Math.floor(Math.random() * 50);
  const startY = Math.floor(Math.random() * 50);
  
  const used = new Set<string>();
  const available: Array<{ x: number; y: number }> = [];
  
  // Add starting territory
  territories.push({ countryId, x: startX, y: startY });
  used.add(`${startX},${startY}`);
  
  // Add neighbors of starting territory
  const addNeighbors = (x: number, y: number) => {
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!used.has(key)) {
        used.add(key);
        available.push(neighbor);
      }
    }
  };
  
  addNeighbors(startX, startY);
  
  // Keep adding until we have exactly count territories
  while (territories.length < count && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    const next = available.splice(randomIndex, 1)[0];
    territories.push({ countryId, x: next.x, y: next.y });
    addNeighbors(next.x, next.y);
  }
  
  return territories;
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure SESSION_SECRET is set
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable must be set");
  }

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, countryName, capitalCityName } = req.body;
      
      if (!username || !password || !countryName || !capitalCityName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });

      const country = await storage.createCountry({
        userId: user.id,
        name: countryName,
        capitalCityName,
      });

      await storage.createResources({ countryId: country.id });

      const territoryData = generateTerritories(country.id, 100);
      for (const t of territoryData) {
        await storage.createTerritory(t);
      }

      req.session.userId = user.id;
      res.json({ user, country });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Missing credentials" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Country routes
  app.get("/api/country", requireAuth, async (req, res) => {
    try {
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.json(country);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/countries", requireAuth, async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      res.json(countries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resources routes
  app.get("/api/resources", requireAuth, async (req, res) => {
    try {
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const resources = await storage.getResourcesByCountryId(country.id);
      res.json(resources);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Territory routes
  app.get("/api/territories", requireAuth, async (req, res) => {
    try {
      const territories = await storage.getAllTerritories();
      res.json(territories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Structure routes
  app.get("/api/structures", requireAuth, async (req, res) => {
    try {
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const structures = await storage.getStructuresByCountryId(country.id);
      res.json(structures);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/structures", requireAuth, async (req, res) => {
    try {
      const { territoryId, structureType } = req.body;
      
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const territory = await storage.getTerritoryById(territoryId);
      if (!territory || territory.countryId !== country.id) {
        return res.status(403).json({ error: "Invalid territory" });
      }

      const resources = await storage.getResourcesByCountryId(country.id);
      if (!resources) {
        return res.status(404).json({ error: "Resources not found" });
      }

      const costs: any = {
        bank: { materials: 100, money: 5000 },
        farm: { materials: 50, money: 2000, food: 20 },
        political_office: { materials: 80, money: 8000 },
        city: { materials: 200, money: 15000, food: 100 },
        factory: { materials: 150, money: 10000, oil: 50 },
        military_base: { materials: 180, money: 12000 },
        oil_rig: { materials: 120, money: 8000 },
        mine: { materials: 100, money: 6000 },
        research_center: { materials: 200, money: 20000 },
        missile_silo: { materials: 300, money: 50000, uranium: 10 },
        rocket_silo: { materials: 350, money: 60000, uranium: 15 },
        nuclear_power_plant: { materials: 500, money: 100000, uranium: 50 },
      };

      const cost = costs[structureType];
      if (!cost) {
        return res.status(400).json({ error: "Invalid structure type" });
      }

      if (cost.materials && resources.materials < cost.materials) {
        return res.status(400).json({ error: "Insufficient materials" });
      }
      if (cost.money && resources.money < cost.money) {
        return res.status(400).json({ error: "Insufficient money" });
      }
      if (cost.food && resources.food < cost.food) {
        return res.status(400).json({ error: "Insufficient food" });
      }
      if (cost.oil && resources.oil < cost.oil) {
        return res.status(400).json({ error: "Insufficient oil" });
      }
      if (cost.uranium && resources.uranium < cost.uranium) {
        return res.status(400).json({ error: "Insufficient uranium" });
      }

      const structure = await storage.createStructure({ territoryId, type: structureType });

      await storage.updateResources(country.id, {
        materials: resources.materials - (cost.materials || 0),
        money: resources.money - (cost.money || 0),
        food: resources.food - (cost.food || 0),
        oil: resources.oil - (cost.oil || 0),
        uranium: resources.uranium - (cost.uranium || 0),
      });

      res.json(structure);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unit routes
  app.get("/api/units", requireAuth, async (req, res) => {
    try {
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const units = await storage.getUnitsByCountryId(country.id);
      res.json(units);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/units", requireAuth, async (req, res) => {
    try {
      const { unitType, quantity } = req.body;
      
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const resources = await storage.getResourcesByCountryId(country.id);
      if (!resources) {
        return res.status(404).json({ error: "Resources not found" });
      }

      const costs: any = {
        infantry: { manpower: 100, money: 1000 },
        special_forces: { manpower: 50, money: 5000 },
        tank: { manpower: 20, money: 15000, materials: 50, oil: 20 },
        apc: { manpower: 15, money: 10000, materials: 30, oil: 15 },
        aircraft: { manpower: 10, money: 50000, materials: 100, oil: 50 },
        missile: { manpower: 5, money: 100000, materials: 200, uranium: 10 },
      };

      const cost = costs[unitType];
      if (!cost) {
        return res.status(400).json({ error: "Invalid unit type" });
      }

      const totalManpower = cost.manpower * quantity;
      const totalMoney = cost.money * quantity;
      const totalMaterials = (cost.materials || 0) * quantity;
      const totalOil = (cost.oil || 0) * quantity;
      const totalUranium = (cost.uranium || 0) * quantity;

      if (resources.manpower < totalManpower) {
        return res.status(400).json({ error: "Insufficient manpower" });
      }
      if (resources.money < totalMoney) {
        return res.status(400).json({ error: "Insufficient money" });
      }
      if (cost.materials && resources.materials < totalMaterials) {
        return res.status(400).json({ error: "Insufficient materials" });
      }
      if (cost.oil && resources.oil < totalOil) {
        return res.status(400).json({ error: "Insufficient oil" });
      }
      if (cost.uranium && resources.uranium < totalUranium) {
        return res.status(400).json({ error: "Insufficient uranium" });
      }

      const unit = await storage.createUnit({
        countryId: country.id,
        type: unitType,
        quantity,
        movementSpeed: unitType === "aircraft" ? 5 : unitType === "tank" ? 2 : 1,
      });

      await storage.updateResources(country.id, {
        manpower: resources.manpower - totalManpower,
        money: resources.money - totalMoney,
        materials: resources.materials - totalMaterials,
        oil: resources.oil - totalOil,
        uranium: resources.uranium - totalUranium,
      });

      res.json(unit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Research routes
  app.get("/api/research", requireAuth, async (req, res) => {
    try {
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const research = await storage.getResearchByCountryId(country.id);
      res.json(research);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/research", requireAuth, async (req, res) => {
    try {
      const { branch, technology } = req.body;
      
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const resources = await storage.getResourcesByCountryId(country.id);
      if (!resources) {
        return res.status(404).json({ error: "Resources not found" });
      }

      const costs: any = {
        basic_infantry: 100,
        special_forces: 300,
        tanks: 500,
        aircraft: 800,
        advanced_weapons: 400,
        tactical_doctrine: 600,
        nuclear_weapons: 2000,
        banking_system: 150,
        industrial_efficiency: 250,
        trade_routes: 200,
        economic_policy: 350,
        advanced_manufacturing: 500,
        basic_governance: 100,
        democracy: 300,
        propaganda: 200,
        intelligence_agency: 400,
        diplomacy: 350,
      };

      const cost = costs[technology];
      if (!cost) {
        return res.status(400).json({ error: "Invalid technology" });
      }

      if (resources.researchPoints < cost) {
        return res.status(400).json({ error: "Insufficient research points" });
      }

      const researchItem = await storage.createResearch({
        countryId: country.id,
        branch,
        technology,
        level: 1,
        inProgress: false,
        progress: 100,
      });

      await storage.updateResources(country.id, {
        researchPoints: resources.researchPoints - cost,
      });

      res.json(researchItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trade routes
  app.post("/api/trades", requireAuth, async (req, res) => {
    try {
      const { toCountryId, offer, request } = req.body;
      
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const trade = await storage.createTrade({
        fromCountryId: country.id,
        toCountryId,
        offerResources: offer,
        requestResources: request,
        status: "pending",
      });

      res.json(trade);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event routes
  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const country = await storage.getCountryByUserId(req.session.userId!);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const events = await storage.getEventsByCountryId(country.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time multiplayer
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
