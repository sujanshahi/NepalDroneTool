import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    // Define the User interface for request.user
    interface User {
      id: number;
      username: string;
      password: string;
      email: string | null;
      fullName: string | null;
      createdAt: string;
      updatedAt: string;
      role: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  try {
    if (!password) {
      throw new Error('Password is required');
    }
    
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check if stored has the correct format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format');
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    // Ensure salt is valid
    if (!salt) {
      console.error('Missing salt in stored password');
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const PgSessionStore = connectPgSimple(session);
  
  const sessionSettings: session.SessionOptions = {
    store: new PgSessionStore({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'nepal-drone-secret',
    resave: true, // Changed to true to ensure the session is saved back to the store
    saveUninitialized: true, // Changed to true to allow anonymous sessions
    name: 'nepal.drone.sid', // Custom name to avoid conflicts
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: false // Set to false for development
    }
  };
  
  console.log('Session configuration:', {
    storeName: 'PgSessionStore',
    secret: sessionSettings.secret === 'nepal-drone-secret' ? '(using default)' : '(using environment variable)',
    resave: sessionSettings.resave,
    saveUninitialized: sessionSettings.saveUninitialized,
    cookieMaxAge: sessionSettings.cookie?.maxAge,
    cookieSecure: sessionSettings.cookie?.secure
  });

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Cast user to the Express.User type
        return done(null, user as unknown as Express.User);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user as unknown as Express.User);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration request received:', { 
        ...req.body, 
        password: req.body.password ? '[REDACTED]' : undefined 
      });
      
      const { username, password, email, fullName } = req.body;
      
      if (!username || !password) {
        console.error('Missing required fields for registration');
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log(`Registration failed: Username ${username} already exists`);
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password and create user
      console.log('Hashing password...');
      const hashedPassword = await hashPassword(password);
      
      console.log('Creating new user...');
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName
      });
      
      console.log('User created successfully, logging in...');
      
      // Log user in after registration
      req.login(newUser as unknown as Express.User, (err) => {
        if (err) {
          console.error('Error during login after registration:', err);
          return next(err);
        }
        // Send user data without password
        const { password, ...userWithoutPassword } = newUser;
        console.log('Registration and login complete');
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('Login request received:', { 
      ...req.body, 
      password: req.body.password ? '[REDACTED]' : undefined 
    });
    
    // Validate request body
    if (!req.body.username || !req.body.password) {
      console.error('Missing required fields for login');
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Use passport for authentication
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message?: string } = {}) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: "Internal server error during authentication" });
      }
      
      if (!user) {
        console.error('Authentication failed:', info.message || 'Unknown reason');
        return res.status(401).json({ error: info.message || "Authentication failed" });
      }
      
      console.log('Authentication successful for user:', user.username);
      
      // Log the user in
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login session error:', loginErr);
          return res.status(500).json({ error: "Failed to create login session" });
        }
        
        console.log('Session created successfully, user is logged in');
        
        // Check if user is authenticated after login
        if (req.isAuthenticated()) {
          console.log('User is authenticated after login');
        } else {
          console.warn('User NOT authenticated after login - session issue');
        }
        
        // Send user data without password
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - Checking authentication status');
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log('User not authenticated, returning 401');
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log('User is authenticated, user data:', { 
      id: req.user?.id,
      username: req.user?.username,
      email: req.user?.email,
    });
    
    // Send user data without password
    const { password, ...userWithoutPassword } = req.user as Express.User;
    res.json(userWithoutPassword);
  });

  // Middleware for protected routes
  app.use("/api/aircraft", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  });
}