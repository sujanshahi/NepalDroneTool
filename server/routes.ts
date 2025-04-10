import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAirspaceZoneSchema, insertRegulationSchema, insertFlightPlanSchema, insertAircraftSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the drone flight planner
  
  // Error handling middleware
  const handleError = (res: Response, error: any) => {
    console.error("API error:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message || "An unexpected error occurred" 
    });
  };
  
  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Flight Plans routes
  app.get('/api/flight-plans', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const plans = await storage.getFlightPlansByUserId(userId);
        res.json(plans);
      } else {
        res.status(400).json({ error: "User ID required" });
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/flight-plans', async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = insertFlightPlanSchema.parse(req.body);
      
      // Create flight plan with validated data
      const flightPlan = await storage.createFlightPlan(validatedData);
      res.status(201).json(flightPlan);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get('/api/flight-plans/:id', async (req, res) => {
    try {
      const plan = await storage.getFlightPlan(parseInt(req.params.id));
      if (!plan) {
        return res.status(404).json({ error: "Flight plan not found" });
      }
      res.json(plan);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.put('/api/flight-plans/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPlan = await storage.updateFlightPlan(id, req.body);
      
      if (!updatedPlan) {
        return res.status(404).json({ error: "Flight plan not found" });
      }
      
      res.json(updatedPlan);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.delete('/api/flight-plans/:id', async (req, res) => {
    try {
      const success = await storage.deleteFlightPlan(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ error: "Flight plan not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Airspace zones routes
  app.get('/api/airspaces', async (req, res) => {
    try {
      const zones = await storage.getAllAirspaceZones();
      res.json(zones);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get('/api/airspaces/:id', async (req, res) => {
    try {
      // Check if we're looking up by numeric ID or zone ID
      if (isNaN(parseInt(req.params.id))) {
        const zone = await storage.getAirspaceZoneByZoneId(req.params.id);
        if (!zone) {
          return res.status(404).json({ error: "Airspace zone not found" });
        }
        res.json(zone);
      } else {
        const zone = await storage.getAirspaceZone(parseInt(req.params.id));
        if (!zone) {
          return res.status(404).json({ error: "Airspace zone not found" });
        }
        res.json(zone);
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/airspaces', async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = insertAirspaceZoneSchema.parse(req.body);
      
      // Create the airspace zone with validated data
      const zone = await storage.createAirspaceZone(validatedData);
      res.status(201).json(zone);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Regulations routes
  app.get('/api/regulations', async (req, res) => {
    try {
      const regs = await storage.getAllRegulations();
      res.json(regs);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get('/api/regulations/:id', async (req, res) => {
    try {
      const regulation = await storage.getRegulation(parseInt(req.params.id));
      if (!regulation) {
        return res.status(404).json({ error: "Regulation not found" });
      }
      res.json(regulation);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/regulations', async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = insertRegulationSchema.parse(req.body);
      
      // Create regulation with validated data
      const regulation = await storage.createRegulation(validatedData);
      res.status(201).json(regulation);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
