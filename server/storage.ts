import { users, threats, auditLogs, systemSettings, type User, type InsertUser, type Threat, type InsertThreat, type AuditLog, type InsertAuditLog, type SystemSettings, type InsertSystemSettings } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Threat methods
  getThreat(id: number): Promise<Threat | undefined>;
  getThreats(filters?: { severity?: string; type?: string; status?: string }): Promise<Threat[]>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  updateThreat(id: number, updates: Partial<Threat>): Promise<Threat | undefined>;
  deleteThreat(id: number): Promise<boolean>;
  
  // Audit log methods
  getAuditLog(id: number): Promise<AuditLog | undefined>;
  getAuditLogs(filters?: { eventType?: string; userId?: number; status?: string }): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  // System settings methods
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  getSystemSettings(): Promise<SystemSettings[]>;
  updateSystemSetting(key: string, value: string, updatedBy: number): Promise<SystemSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private threats: Map<number, Threat> = new Map();
  private auditLogs: Map<number, AuditLog> = new Map();
  private systemSettings: Map<string, SystemSettings> = new Map();
  private currentUserId = 1;
  private currentThreatId = 1;
  private currentAuditLogId = 1;
  private currentSettingsId = 1;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create default admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: await bcrypt.hash("admin", 10),
      role: "admin",
      email: "admin@cyberguard.com",
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
    };
    this.users.set(adminUser.id, adminUser);

    // Create default analyst user
    const analystUser: User = {
      id: this.currentUserId++,
      username: "analyst",
      password: await bcrypt.hash("analyst", 10),
      role: "analyst",
      email: "analyst@cyberguard.com",
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
    };
    this.users.set(analystUser.id, analystUser);

    // Initialize some sample threats
    const sampleThreats: Threat[] = [
      {
        id: this.currentThreatId++,
        title: "Malware Detection: Trojan.Win32.Agent",
        description: "Critical malware detected attempting to access system files",
        severity: "critical",
        type: "malware",
        sourceIp: "192.168.100.45",
        targetIp: "10.0.1.15",
        port: 443,
        riskScore: 92,
        status: "active",
        detectedAt: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        resolvedAt: null,
        metadata: { country: "Unknown", userAgent: "Mozilla/5.0" },
      },
      {
        id: this.currentThreatId++,
        title: "Suspicious Login Activity",
        description: "Multiple failed login attempts from suspicious IP",
        severity: "high",
        type: "intrusion",
        sourceIp: "203.45.67.89",
        targetIp: null,
        port: 22,
        riskScore: 78,
        status: "investigating",
        detectedAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
        resolvedAt: null,
        metadata: { country: "Russia", attempts: 15 },
      },
      {
        id: this.currentThreatId++,
        title: "Unusual Network Traffic",
        description: "High bandwidth usage detected on UDP port 53",
        severity: "medium",
        type: "ddos",
        sourceIp: "10.0.0.100",
        targetIp: "8.8.8.8",
        port: 53,
        riskScore: 54,
        status: "active",
        detectedAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
        resolvedAt: null,
        metadata: { bandwidth: "150MB/s", protocol: "UDP" },
      },
    ];

    sampleThreats.forEach(threat => this.threats.set(threat.id, threat));

    // Initialize sample audit logs
    const sampleLogs: AuditLog[] = [
      {
        id: this.currentAuditLogId++,
        userId: adminUser.id,
        eventType: "authentication",
        description: "User login successful",
        sourceIp: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        status: "success",
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        metadata: { loginMethod: "password" },
      },
      {
        id: this.currentAuditLogId++,
        userId: null,
        eventType: "security",
        description: "Failed login attempt - invalid credentials",
        sourceIp: "203.45.67.89",
        userAgent: "curl/7.68.0",
        status: "failed",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        metadata: { attempts: 3 },
      },
      {
        id: this.currentAuditLogId++,
        userId: adminUser.id,
        eventType: "configuration",
        description: "Firewall rule updated: Block external access to port 22",
        sourceIp: "10.0.0.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        status: "success",
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        metadata: { rule: "BLOCK_SSH_EXTERNAL" },
      },
    ];

    sampleLogs.forEach(log => this.auditLogs.set(log.id, log));

    // Initialize system settings
    const defaultSettings: SystemSettings[] = [
      {
        id: this.currentSettingsId++,
        key: "twoFactorAuth",
        value: "true",
        description: "Require two-factor authentication for all users",
        updatedBy: adminUser.id,
        updatedAt: new Date(),
      },
      {
        id: this.currentSettingsId++,
        key: "autoBlockThreats",
        value: "true",
        description: "Automatically block critical threats",
        updatedBy: adminUser.id,
        updatedAt: new Date(),
      },
      {
        id: this.currentSettingsId++,
        key: "emailNotifications",
        value: "false",
        description: "Send alert notifications via email",
        updatedBy: adminUser.id,
        updatedAt: new Date(),
      },
      {
        id: this.currentSettingsId++,
        key: "sessionTimeout",
        value: "30",
        description: "Session timeout in minutes",
        updatedBy: adminUser.id,
        updatedAt: new Date(),
      },
    ];

    defaultSettings.forEach(setting => this.systemSettings.set(setting.key, setting));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      role: insertUser.role ?? "analyst", // Ensure role is always a string
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Threat methods
  async getThreat(id: number): Promise<Threat | undefined> {
    return this.threats.get(id);
  }

  async getThreats(filters?: { severity?: string; type?: string; status?: string }): Promise<Threat[]> {
    let threats = Array.from(this.threats.values());
    
    if (filters) {
      if (filters.severity) {
        threats = threats.filter(threat => threat.severity === filters.severity);
      }
      if (filters.type) {
        threats = threats.filter(threat => threat.type === filters.type);
      }
      if (filters.status) {
        threats = threats.filter(threat => threat.status === filters.status);
      }
    }
    
    return threats.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  async createThreat(insertThreat: InsertThreat): Promise<Threat> {
    const threat: Threat = {
      ...insertThreat,
      id: this.currentThreatId++,
      detectedAt: new Date(),
      resolvedAt: null,
      status: insertThreat.status ?? "active", // Ensure status is always a string
      metadata: insertThreat.metadata ?? {},   // Ensure metadata is always present
      targetIp: insertThreat.targetIp ?? null, // Ensure targetIp is always present
      port: insertThreat.port ?? null,         // Ensure port is always present
    };
    this.threats.set(threat.id, threat);
    return threat;
  }

  async updateThreat(id: number, updates: Partial<Threat>): Promise<Threat | undefined> {
    const threat = this.threats.get(id);
    if (!threat) return undefined;
    
    const updatedThreat = { ...threat, ...updates };
    this.threats.set(id, updatedThreat);
    return updatedThreat;
  }

  async deleteThreat(id: number): Promise<boolean> {
    return this.threats.delete(id);
  }

  // Audit log methods
  async getAuditLog(id: number): Promise<AuditLog | undefined> {
    return this.auditLogs.get(id);
  }

  async getAuditLogs(filters?: { eventType?: string; userId?: number; status?: string }): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (filters) {
      if (filters.eventType) {
        logs = logs.filter(log => log.eventType === filters.eventType);
      }
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const log: AuditLog = {
      id: this.currentAuditLogId++,
      status: insertLog.status,
      description: insertLog.description,
      sourceIp: insertLog.sourceIp,
      eventType: insertLog.eventType,
      metadata: insertLog.metadata ?? {},
      userId: insertLog.userId ?? null,
      userAgent: insertLog.userAgent ?? null,
      timestamp: new Date(),
    };
    this.auditLogs.set(log.id, log);
    return log;
  }

  // System settings methods
  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    return this.systemSettings.get(key);
  }

  async getSystemSettings(): Promise<SystemSettings[]> {
    return Array.from(this.systemSettings.values());
  }

  async updateSystemSetting(key: string, value: string, updatedBy: number): Promise<SystemSettings> {
    const existing = this.systemSettings.get(key);
    const setting: SystemSettings = {
      id: existing?.id || this.currentSettingsId++,
      key,
      value,
      description: existing?.description || "",
      updatedBy,
      updatedAt: new Date(),
    };
    this.systemSettings.set(key, setting);
    return setting;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Threat methods
  async getThreat(id: number): Promise<Threat | undefined> {
    const [threat] = await db.select().from(threats).where(eq(threats.id, id));
    return threat || undefined;
  }

  async getThreats(filters?: { severity?: string; type?: string; status?: string }): Promise<Threat[]> {
    let query = db.select().from(threats);
    
    if (filters) {
      const conditions = [];
      if (filters.severity) conditions.push(eq(threats.severity, filters.severity));
      if (filters.type) conditions.push(eq(threats.type, filters.type));
      if (filters.status) conditions.push(eq(threats.status, filters.status));
      
      if (conditions.length > 0) {
        const filteredQuery = query.where(and(...conditions));
        return await filteredQuery.orderBy(threats.detectedAt);
      }
    }
    
    return await query.orderBy(threats.detectedAt);
  }

  async createThreat(insertThreat: InsertThreat): Promise<Threat> {
    const [threat] = await db
      .insert(threats)
      .values(insertThreat)
      .returning();
    return threat;
  }

  async updateThreat(id: number, updates: Partial<Threat>): Promise<Threat | undefined> {
    const [threat] = await db
      .update(threats)
      .set(updates)
      .where(eq(threats.id, id))
      .returning();
    return threat || undefined;
  }

  async deleteThreat(id: number): Promise<boolean> {
    const result = await db.delete(threats).where(eq(threats.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Audit log methods
  async getAuditLog(id: number): Promise<AuditLog | undefined> {
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return log || undefined;
  }

  async getAuditLogs(filters?: { eventType?: string; userId?: number; status?: string }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    if (filters) {
      const conditions = [];
      if (filters.eventType) conditions.push(eq(auditLogs.eventType, filters.eventType));
      if (filters.userId) conditions.push(eq(auditLogs.userId, filters.userId));
      if (filters.status) conditions.push(eq(auditLogs.status, filters.status));
      
      if (conditions.length > 0) {
        const filteredQuery = query.where(and(...conditions));
        return await filteredQuery.orderBy(auditLogs.timestamp);
      }
    }
    
    return await query.orderBy(auditLogs.timestamp);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // System settings methods
  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async getSystemSettings(): Promise<SystemSettings[]> {
    return await db.select().from(systemSettings);
  }

  async updateSystemSetting(key: string, value: string, updatedBy: number): Promise<SystemSettings> {
    const existing = await this.getSystemSetting(key);
    
    if (existing) {
      const [setting] = await db
        .update(systemSettings)
        .set({ value, updatedBy, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(systemSettings)
        .values({ key, value, updatedBy })
        .returning();
      return setting;
    }
  }
}

export const storage = new DatabaseStorage();
