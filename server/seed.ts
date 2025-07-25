import 'dotenv/config';
import { db } from './db.js';
import { users, threats, auditLogs, systemSettings } from '@shared/schema';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(auditLogs);
    await db.delete(systemSettings);
    await db.delete(threats);
    await db.delete(users);

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    const [adminUser, analystUser] = await db.insert(users).values([
      {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        email: 'admin@cyberguard.com',
        isActive: true,
      },
      {
        username: 'analyst',
        password: hashedPassword,
        role: 'analyst',
        email: 'analyst@cyberguard.com',
        isActive: true,
      }
    ]).returning();

    // Create sample threats
    console.log('🚨 Creating sample threats...');
    await db.insert(threats).values([
      {
        title: 'Malware Detection: Trojan.Win32.Agent',
        description: 'Critical malware detected attempting to access system files',
        severity: 'critical',
        type: 'malware',
        sourceIp: '192.168.100.45',
        targetIp: '10.0.1.15',
        port: 443,
        riskScore: 92,
        status: 'active',
        metadata: { country: 'Unknown', userAgent: 'Mozilla/5.0' },
      },
      {
        title: 'Suspicious Login Activity',
        description: 'Multiple failed login attempts from suspicious IP',
        severity: 'high',
        type: 'intrusion',
        sourceIp: '203.45.67.89',
        targetIp: null,
        port: 22,
        riskScore: 78,
        status: 'investigating',
        metadata: { country: 'Russia', attempts: 15 },
      },
      {
        title: 'Unusual Network Traffic',
        description: 'High bandwidth usage detected on UDP port 53',
        severity: 'medium',
        type: 'ddos',
        sourceIp: '10.0.0.100',
        targetIp: '8.8.8.8',
        port: 53,
        riskScore: 54,
        status: 'active',
        metadata: { bandwidth: '150MB/s', protocol: 'UDP' },
      },
    ]);

    // Create sample audit logs
    console.log('📋 Creating audit logs...');
    await db.insert(auditLogs).values([
      {
        userId: adminUser.id,
        eventType: 'authentication',
        description: 'User login successful',
        sourceIp: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        metadata: { loginMethod: 'password' },
      },
      {
        userId: adminUser.id,
        eventType: 'configuration',
        description: 'Firewall rule updated: Block external access to port 22',
        sourceIp: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        metadata: { rule: 'BLOCK_SSH_EXTERNAL' },
      },
    ]);

    // Create system settings
    console.log('⚙️ Creating system settings...');
    await db.insert(systemSettings).values([
      {
        key: 'twoFactorAuth',
        value: 'true',
        description: 'Require two-factor authentication for all users',
        updatedBy: adminUser.id,
      },
      {
        key: 'autoBlockThreats',
        value: 'true',
        description: 'Automatically block critical threats',
        updatedBy: adminUser.id,
      },
      {
        key: 'emailNotifications',
        value: 'false',
        description: 'Send alert notifications via email',
        updatedBy: adminUser.id,
      },
      {
        key: 'sessionTimeout',
        value: '30',
        description: 'Session timeout in minutes',
        updatedBy: adminUser.id,
      },
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Seeded data summary:
   - Users: 2 (admin/admin, analyst/analyst)
   - Threats: 3 sample threats
   - Audit Logs: 2 sample entries
   - System Settings: 4 default settings
`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };