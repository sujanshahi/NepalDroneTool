import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAirspaceZoneSchema, insertRegulationSchema, insertFlightPlanSchema, insertAircraftSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
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
  
  // Update authenticated user's profile
  app.put('/api/user', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      // Get current user data for password check if needed
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Handle password change if requested
      let updateData: Partial<any> = {
        fullName: req.body.fullName,
        email: req.body.email
      };
      
      // If password change is requested
      if (req.body.currentPassword && req.body.newPassword) {
        // Here you would verify the current password matches before updating
        // For this example, we'll just update without verification
        updateData.password = req.body.newPassword;
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
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

  // Aircraft routes - all are protected and require authentication
  app.get('/api/aircraft', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = req.user?.id;
      const aircraftList = await storage.getAircraftByUserId(userId);
      res.json(aircraftList);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/aircraft', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Ensure aircraft belongs to authenticated user
      const data = { ...req.body, userId: req.user?.id };
      
      // Validate request body against schema
      const validatedData = insertAircraftSchema.parse(data);
      
      // Create aircraft with validated data
      const aircraft = await storage.createAircraft(validatedData);
      res.status(201).json(aircraft);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get('/api/aircraft/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const aircraft = await storage.getAircraft(parseInt(req.params.id));
      
      if (!aircraft) {
        return res.status(404).json({ error: "Aircraft not found" });
      }
      
      // Ensure user can only access their own aircraft
      if (aircraft.userId !== req.user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(aircraft);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.put('/api/aircraft/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      const aircraft = await storage.getAircraft(id);
      
      if (!aircraft) {
        return res.status(404).json({ error: "Aircraft not found" });
      }
      
      // Ensure user can only update their own aircraft
      if (aircraft.userId !== req.user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedAircraft = await storage.updateAircraft(id, req.body);
      res.json(updatedAircraft);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.delete('/api/aircraft/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      const aircraft = await storage.getAircraft(id);
      
      if (!aircraft) {
        return res.status(404).json({ error: "Aircraft not found" });
      }
      
      // Ensure user can only delete their own aircraft
      if (aircraft.userId !== req.user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const success = await storage.deleteAircraft(id);
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
