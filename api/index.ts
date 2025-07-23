// This file exports the Express server for Vercel serverless functions
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes asynchronously
let isInitialized = false;
let initPromise: Promise<void> | null = null;

const initializeApp = async () => {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    await registerRoutes(app);
    
    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    isInitialized = true;
  })();
  
  return initPromise;
};

// Middleware to ensure app is initialized before handling requests
app.use(async (req, res, next) => {
  await initializeApp();
  next();
});

export default app;