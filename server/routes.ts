import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { insertUserSchema, insertThreatSchema, insertAuditLogSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        // Log failed login attempt
        await storage.createAuditLog({
          userId: null,
          eventType: "security",
          description: "Failed login attempt - invalid credentials",
          sourceIp: req.ip || "unknown",
          userAgent: req.headers['user-agent'] || "unknown",
          status: "failed",
          metadata: { username },
        });
        
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Log successful login
      await storage.createAuditLog({
        userId: user.id,
        eventType: "authentication",
        description: "User login successful",
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: { loginMethod: "password" },
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      await storage.createAuditLog({
        userId: req.user.id,
        eventType: "authentication",
        description: "User logout",
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: {},
      });

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Threat routes
  app.get("/api/threats", authenticateToken, async (req, res) => {
    try {
      const { severity, type, status } = req.query;
      const threats = await storage.getThreats({
        severity: severity as string,
        type: type as string,
        status: status as string,
      });
      res.json(threats);
    } catch (error) {
      console.error("Get threats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/threats/:id", authenticateToken, async (req, res) => {
    try {
      const threat = await storage.getThreat(parseInt(req.params.id));
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }
      res.json(threat);
    } catch (error) {
      console.error("Get threat error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/threats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertThreatSchema.parse(req.body);
      const threat = await storage.createThreat(validatedData);
      
      await storage.createAuditLog({
        userId: req.user.id,
        eventType: "security",
        description: `New threat created: ${threat.title}`,
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: { threatId: threat.id },
      });

      res.status(201).json(threat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create threat error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/threats/:id", authenticateToken, async (req, res) => {
    try {
      const threatId = parseInt(req.params.id);
      const updates = req.body;
      
      const threat = await storage.updateThreat(threatId, updates);
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        eventType: "security",
        description: `Threat updated: ${threat.title}`,
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: { threatId: threat.id, updates },
      });

      res.json(threat);
    } catch (error) {
      console.error("Update threat error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Audit log routes
  app.get("/api/audit-logs", authenticateToken, async (req, res) => {
    try {
      const { eventType, userId, status } = req.query;
      const logs = await storage.getAuditLogs({
        eventType: eventType as string,
        userId: userId ? parseInt(userId as string) : undefined,
        status: status as string,
      });
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      await storage.createAuditLog({
        userId: req.user.id,
        eventType: "configuration",
        description: `New user created: ${user.username}`,
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: { newUserId: user.id },
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createAuditLog({
        userId: req.user.id,
        eventType: "configuration",
        description: `User deleted: ID ${userId}`,
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: { deletedUserId: userId },
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // System settings routes (admin only)
  app.get("/api/settings", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/settings/:key", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      const setting = await storage.updateSystemSetting(key, value, req.user.id);
      
      await storage.createAuditLog({
        userId: req.user.id,
        eventType: "configuration",
        description: `System setting updated: ${key} = ${value}`,
        sourceIp: req.ip || "unknown",
        userAgent: req.headers['user-agent'] || "unknown",
        status: "success",
        metadata: { settingKey: key, oldValue: setting.value, newValue: value },
      });

      res.json(setting);
    } catch (error) {
      console.error("Update setting error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const threats = await storage.getThreats();
      const criticalThreats = threats.filter(t => t.severity === "critical");
      const activeThreats = threats.filter(t => t.status === "active");
      
      const stats = {
        activeThreats: activeThreats.length,
        criticalAlerts: criticalThreats.length,
        systemsOnline: 98.7,
        lastLoginIP: req.ip || "192.168.1.100",
        lastLoginTime: "2 minutes ago",
        threatCount: threats.length,
        notificationCount: criticalThreats.length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/timeline", authenticateToken, async (req, res) => {
    try {
      const threats = await storage.getThreats();
      
      // Generate timeline data for the last 24 hours
      const now = new Date();
      const timelineData = [];
      
      for (let i = 23; i >= 0; i--) {
        const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        
        const threatsInHour = threats.filter(threat => {
          const detectedAt = new Date(threat.detectedAt);
          return detectedAt >= hourStart && detectedAt < hourEnd;
        });
        
        timelineData.push({
          time: hourStart.toISOString(),
          hour: hourStart.getHours(),
          total: threatsInHour.length,
          critical: threatsInHour.filter(t => t.severity === "critical").length,
          high: threatsInHour.filter(t => t.severity === "high").length,
          medium: threatsInHour.filter(t => t.severity === "medium").length,
          low: threatsInHour.filter(t => t.severity === "low").length,
          threats: threatsInHour.map(t => ({
            id: t.id,
            title: t.title,
            severity: t.severity,
            type: t.type,
            sourceIp: t.sourceIp,
            riskScore: t.riskScore
          }))
        });
      }
      
      res.json(timelineData);
    } catch (error) {
      console.error("Error fetching timeline data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/analytics/geographic", authenticateToken, async (req, res) => {
    try {
      const threats = await storage.getThreats();
      
      // Extract geographic data from threat metadata
      const geographicData = threats
        .filter(threat => threat.metadata && typeof threat.metadata === 'object' && 
                'lat' in threat.metadata && 'lng' in threat.metadata)
        .map(threat => {
          const metadata = threat.metadata as any;
          return {
            id: threat.id,
            title: threat.title,
            severity: threat.severity,
            type: threat.type,
            sourceIp: threat.sourceIp,
            riskScore: threat.riskScore,
            status: threat.status,
            lat: metadata.lat,
            lng: metadata.lng,
            country: metadata.country || "Unknown",
            city: metadata.city || "Unknown",
            detectedAt: threat.detectedAt
          };
        });
      
      res.json(geographicData);
    } catch (error) {
      console.error("Error fetching geographic data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
