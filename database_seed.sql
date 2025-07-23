-- CyberGuard Database Seed Script
-- This script populates the database with sample data for development and testing
-- Run this after creating the database schema with: npm run db:push

-- Clear existing data (in proper order due to foreign key constraints)
DELETE FROM audit_logs;
DELETE FROM system_settings;
DELETE FROM threats;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE threats_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE system_settings_id_seq RESTART WITH 1;

-- Insert Users
-- Note: Passwords are hashed versions of 'admin' and 'analyst'
INSERT INTO users (username, password, role, email, created_at, last_login, is_active) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'admin@cyberguard.com', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 minutes', true),
('analyst', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'analyst', 'analyst@cyberguard.com', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 hour', true),
('security_lead', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'security.lead@cyberguard.com', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 hours', true),
('junior_analyst', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'analyst', 'junior.analyst@cyberguard.com', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day', true);

-- Insert Threats
INSERT INTO threats (title, description, severity, type, source_ip, target_ip, port, risk_score, status, detected_at, resolved_at, metadata) VALUES
-- Critical Threats
('Malware Detection: Trojan.Win32.Agent', 'Critical malware detected attempting to access system files and establish persistence', 'critical', 'malware', '192.168.100.45', '10.0.1.15', 443, 92, 'active', NOW() - INTERVAL '3 minutes', NULL, '{"country": "Unknown", "userAgent": "Mozilla/5.0", "fileHash": "a1b2c3d4e5f6", "infectedFiles": 5}'),
('Advanced Persistent Threat Detected', 'Sophisticated APT campaign targeting financial data', 'critical', 'intrusion', '185.220.101.32', '10.0.1.50', 22, 95, 'investigating', NOW() - INTERVAL '15 minutes', NULL, '{"country": "Russia", "attackVector": "spear_phishing", "targetsIdentified": 12}'),
('Ransomware Activity: CryptoLocker Variant', 'Ransomware attempting to encrypt critical database files', 'critical', 'malware', '198.51.100.12', '10.0.1.10', 445, 98, 'active', NOW() - INTERVAL '7 minutes', NULL, '{"country": "Unknown", "encryptionType": "AES-256", "demandAmount": "50000", "filesAffected": 1247}'),

-- High Severity Threats
('Suspicious Login Activity', 'Multiple failed login attempts from suspicious IP address', 'high', 'intrusion', '203.45.67.89', NULL, 22, 78, 'investigating', NOW() - INTERVAL '8 minutes', NULL, '{"country": "Russia", "attempts": 15, "usernames": ["admin", "root", "administrator"]}'),
('SQL Injection Attempt', 'Automated SQL injection attack targeting user database', 'high', 'intrusion', '94.142.241.194', '10.0.1.25', 80, 82, 'active', NOW() - INTERVAL '12 minutes', NULL, '{"country": "Romania", "attackType": "union_based", "payloads": 23}'),
('Credential Stuffing Attack', 'Large-scale credential stuffing attack detected', 'high', 'intrusion', '104.21.35.78', '10.0.1.30', 443, 76, 'investigating', NOW() - INTERVAL '25 minutes', NULL, '{"country": "United States", "credentials_tested": 50000, "success_rate": "0.2%"}'),
('Privilege Escalation Attempt', 'Unauthorized attempt to escalate user privileges', 'high', 'intrusion', '10.0.2.45', '10.0.1.5', 445, 80, 'active', NOW() - INTERVAL '18 minutes', NULL, '{"country": "Internal", "exploitUsed": "CVE-2023-1234", "targetService": "Windows SMB"}'),

-- Medium Severity Threats
('Unusual Network Traffic', 'High bandwidth usage detected on UDP port 53', 'medium', 'ddos', '10.0.0.100', '8.8.8.8', 53, 54, 'active', NOW() - INTERVAL '12 minutes', NULL, '{"bandwidth": "150MB/s", "protocol": "UDP", "suspiciousQueries": 15000}'),
('Phishing Email Campaign', 'Sophisticated phishing emails targeting employees', 'medium', 'phishing', '172.16.254.1', NULL, 25, 65, 'investigating', NOW() - INTERVAL '1 hour', NULL, '{"country": "Nigeria", "emails_sent": 500, "click_rate": "12%", "target_department": "Finance"}'),
('Port Scanning Activity', 'Systematic port scanning from external IP', 'medium', 'intrusion', '192.0.2.146', '10.0.1.0', NULL, 58, 'active', NOW() - INTERVAL '35 minutes', NULL, '{"country": "China", "ports_scanned": 65535, "scan_type": "TCP_SYN", "duration": "30 minutes"}'),
('Suspicious DNS Queries', 'Unusual DNS queries to known malware domains', 'medium', 'malware', '10.0.3.22', NULL, 53, 62, 'investigating', NOW() - INTERVAL '45 minutes', NULL, '{"country": "Internal", "malicious_domains": 15, "query_count": 234}'),
('Data Exfiltration Attempt', 'Suspicious large file transfers to external servers', 'medium', 'intrusion', '10.0.1.75', '203.0.113.42', 443, 69, 'active', NOW() - INTERVAL '2 hours', NULL, '{"country": "Unknown", "data_volume": "2.5GB", "transfer_method": "HTTPS", "files": 1250}'),

-- Low Severity Threats
('Failed Authentication', 'Single failed login attempt from known IP', 'low', 'intrusion', '192.168.1.105', NULL, 22, 25, 'resolved', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes', '{"country": "Internal", "username": "user123", "reason": "password_expired"}'),
('Antivirus Detection', 'Low-risk adware detected and quarantined', 'low', 'malware', '10.0.1.88', NULL, NULL, 32, 'resolved', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 45 minutes', '{"country": "Internal", "malware_type": "adware", "quarantined": true, "source": "browser_download"}'),
('Spam Email Blocked', 'Spam email automatically blocked by mail filter', 'low', 'phishing', '198.51.100.200', NULL, 25, 18, 'resolved', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', '{"country": "Unknown", "spam_score": "8.5", "blocked_by": "SpamAssassin"}'),
('Firewall Rule Triggered', 'Benign traffic blocked by security rule', 'low', 'intrusion', '203.0.113.15', '10.0.1.12', 80, 22, 'resolved', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 30 minutes', '{"country": "Canada", "rule": "BLOCK_SUSPICIOUS_USERAGENT", "useragent": "curl/7.68.0"}'),

-- Additional Recent Threats for Timeline/Map Visualization
('Botnet Communication', 'Infected device communicating with botnet C&C server', 'high', 'malware', '10.0.2.33', '185.165.29.78', 8080, 84, 'active', NOW() - INTERVAL '6 hours', NULL, '{"country": "Germany", "botnet": "Mirai", "infected_devices": 1, "c2_server": "185.165.29.78"}'),
('Cross-Site Scripting Attack', 'XSS attack targeting web application users', 'medium', 'intrusion', '91.121.90.45', '10.0.1.40', 80, 71, 'investigating', NOW() - INTERVAL '8 hours', NULL, '{"country": "France", "attack_type": "reflected_xss", "payload": "<script>alert(1)</script>", "vulnerable_param": "search"}'),
('DDoS Attack - Layer 7', 'Application layer DDoS attack overwhelming web servers', 'high', 'ddos', '172.105.94.74', '10.0.1.35', 80, 87, 'investigating', NOW() - INTERVAL '10 hours', NULL, '{"country": "Netherlands", "attack_type": "HTTP_FLOOD", "requests_per_second": 50000, "target": "login_page"}'),
('Cryptojacking Malware', 'Cryptocurrency mining malware detected on workstation', 'medium', 'malware', '10.0.3.67', NULL, NULL, 73, 'active', NOW() - INTERVAL '12 hours', NULL, '{"country": "Internal", "cryptocurrency": "Monero", "cpu_usage": "95%", "mining_pool": "pool.minergate.com"}'),
('Zero-Day Exploit Attempt', 'Attempted exploitation of unpatched vulnerability', 'critical', 'intrusion', '45.32.108.15', '10.0.1.28', 443, 96, 'investigating', NOW() - INTERVAL '14 hours', NULL, '{"country": "United States", "vulnerability": "CVE-2024-XXXX", "exploit_kit": "Nuclear", "target_application": "Apache HTTP Server"}'),
('Insider Threat Activity', 'Suspicious file access by privileged user', 'high', 'intrusion', '10.0.4.12', '10.0.1.200', 445, 79, 'investigating', NOW() - INTERVAL '16 hours', NULL, '{"country": "Internal", "user": "john.doe", "files_accessed": 150, "after_hours": true, "department": "Finance"}'),
('Mobile Device Compromise', 'Company mobile device infected with spyware', 'medium', 'malware', '192.168.43.78', NULL, NULL, 67, 'active', NOW() - INTERVAL '18 hours', NULL, '{"country": "Internal", "device_type": "Android", "spyware": "FlexiSpy", "data_at_risk": "contacts,messages,location"}'),
('Social Engineering Attack', 'Phone-based social engineering targeting IT support', 'medium', 'phishing', NULL, NULL, NULL, 61, 'investigating', NOW() - INTERVAL '20 hours', NULL, '{"country": "Unknown", "attack_method": "vishing", "target_department": "IT", "information_sought": "password_reset"}'),
('IoT Device Vulnerability', 'Unsecured IoT device with default credentials', 'low', 'intrusion', '192.168.1.200', NULL, 23, 45, 'resolved', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '21 hours', '{"country": "Internal", "device_type": "IP_Camera", "vulnerability": "default_password", "firmware_version": "v1.0.2"}'),
('DNS Tunneling Detection', 'Suspicious DNS traffic indicating data exfiltration', 'medium', 'intrusion', '10.0.5.44', '8.8.4.4', 53, 66, 'investigating', NOW() - INTERVAL '24 hours', NULL, '{"country": "Internal", "tunnel_type": "DNS", "data_volume": "50MB", "queries": 15000, "suspicious_domains": 5}');

-- Insert Audit Logs
INSERT INTO audit_logs (user_id, event_type, description, source_ip, user_agent, status, timestamp, metadata) VALUES
-- Recent Authentication Events
(1, 'authentication', 'User login successful', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'success', NOW() - INTERVAL '2 minutes', '{"loginMethod": "password", "sessionId": "sess_123456", "duration": "2.3s"}'),
(2, 'authentication', 'User login successful', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'success', NOW() - INTERVAL '1 hour', '{"loginMethod": "password", "sessionId": "sess_789012", "duration": "1.8s"}'),
(NULL, 'security', 'Failed login attempt - invalid credentials', '203.45.67.89', 'curl/7.68.0', 'failed', NOW() - INTERVAL '5 minutes', '{"attempts": 3, "username": "admin", "reason": "invalid_password"}'),
(NULL, 'security', 'Failed login attempt - account locked', '94.142.241.194', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'failed', NOW() - INTERVAL '15 minutes', '{"attempts": 5, "username": "root", "reason": "account_locked", "lockout_duration": "30m"}'),
(3, 'authentication', 'User logout', '10.0.1.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '3 hours', '{"sessionDuration": "4h 23m", "reason": "manual_logout"}'),

-- Configuration Changes
(1, 'configuration', 'Firewall rule updated: Block external access to port 22', '10.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '10 minutes', '{"rule": "BLOCK_SSH_EXTERNAL", "previousValue": "ALLOW", "newValue": "BLOCK", "ports": [22]}'),
(1, 'configuration', 'System setting updated: Two-factor authentication enabled', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '30 minutes', '{"setting": "twoFactorAuth", "previousValue": "false", "newValue": "true"}'),
(3, 'configuration', 'User role modified for analyst account', '10.0.1.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'success', NOW() - INTERVAL '2 hours', '{"targetUser": "analyst", "previousRole": "analyst", "newRole": "senior_analyst", "reason": "promotion"}'),
(1, 'configuration', 'Database backup schedule updated', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '6 hours', '{"schedule": "daily", "time": "02:00", "retention": "30 days", "encryption": true}'),

-- Security Events
(2, 'security', 'Threat investigation completed', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'success', NOW() - INTERVAL '1 hour 30 minutes', '{"threatId": 5, "outcome": "false_positive", "timeSpent": "45m", "tools": ["wireshark", "volatility"]}'),
(1, 'security', 'Critical threat blocked automatically', '10.0.0.1', 'System', 'success', NOW() - INTERVAL '3 minutes', '{"threatId": 1, "blockMethod": "firewall", "sourceIp": "192.168.100.45", "automatic": true}'),
(2, 'security', 'Threat status updated to investigating', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'success', NOW() - INTERVAL '8 minutes', '{"threatId": 2, "previousStatus": "active", "newStatus": "investigating", "assignedTo": "analyst"}'),
(1, 'security', 'Security scan initiated', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '4 hours', '{"scanType": "full_network", "targets": "10.0.0.0/16", "tools": ["nmap", "nessus"], "estimatedDuration": "2h"}'),

-- System Events
(NULL, 'system', 'Database backup completed successfully', '10.0.0.1', 'System Cron', 'success', NOW() - INTERVAL '2 hours', '{"backupSize": "2.5GB", "duration": "8m 32s", "destination": "s3://backups/db/", "compression": "gzip"}'),
(NULL, 'system', 'System update installed', '10.0.0.1', 'System Update Manager', 'success', NOW() - INTERVAL '12 hours', '{"updates": ["security_patch_2024_01", "kernel_update_6.5.8"], "rebootRequired": false, "duration": "15m"}'),
(NULL, 'system', 'Log rotation completed', '10.0.0.1', 'System Logrotate', 'success', NOW() - INTERVAL '24 hours', '{"logsRotated": 15, "totalSize": "500MB", "compressed": true, "oldestKept": "30 days"}'),
(1, 'system', 'System health check performed', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '8 hours', '{"cpuUsage": "23%", "memoryUsage": "67%", "diskUsage": "45%", "networkTraffic": "125MB/s", "threats": 18}'),

-- Administrative Events
(1, 'administration', 'New user account created', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '15 days', '{"newUser": "junior_analyst", "role": "analyst", "department": "Security", "permissions": ["view_threats", "investigate"]}'),
(1, 'administration', 'User permissions updated', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'success', NOW() - INTERVAL '7 days', '{"targetUser": "analyst", "addedPermissions": ["resolve_threats"], "removedPermissions": [], "reason": "role_expansion"}'),
(3, 'administration', 'System maintenance window scheduled', '10.0.1.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'success', NOW() - INTERVAL '3 days', '{"startTime": "2024-01-25T02:00:00Z", "duration": "4h", "type": "security_updates", "affectedSystems": ["firewall", "ids", "database"]}'),

-- Failed Events for Analysis
(NULL, 'security', 'Intrusion detection system alert', '203.45.67.89', NULL, 'warning', NOW() - INTERVAL '25 minutes', '{"alertType": "brute_force", "targetService": "SSH", "attempts": 15, "blocked": true, "sourceCountry": "Russia"}'),
(2, 'configuration', 'Failed to update firewall rule - insufficient permissions', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'failed', NOW() - INTERVAL '1 hour 45 minutes', '{"rule": "ALLOW_PORT_8080", "reason": "insufficient_privileges", "requiredRole": "admin", "currentRole": "analyst"}'),
(NULL, 'system', 'Database connection failed', '10.0.0.1', 'System Monitor', 'failed', NOW() - INTERVAL '6 hours', '{"database": "threats_db", "error": "connection_timeout", "retryAttempt": 3, "nextRetry": "5m"}');

-- Insert System Settings
INSERT INTO system_settings (key, value, description, updated_by, updated_at) VALUES
('twoFactorAuth', 'true', 'Require two-factor authentication for all users', 1, NOW() - INTERVAL '30 minutes'),
('autoBlockThreats', 'true', 'Automatically block critical threats', 1, NOW() - INTERVAL '2 hours'),
('emailNotifications', 'false', 'Send alert notifications via email', 1, NOW() - INTERVAL '6 hours'),
('sessionTimeout', '30', 'Session timeout in minutes', 1, NOW() - INTERVAL '1 day'),
('maxLoginAttempts', '5', 'Maximum failed login attempts before account lockout', 1, NOW() - INTERVAL '3 days'),
('passwordMinLength', '12', 'Minimum password length requirement', 1, NOW() - INTERVAL '7 days'),
('threatRetentionDays', '365', 'Number of days to retain resolved threat data', 3, NOW() - INTERVAL '14 days'),
('auditLogRetentionDays', '90', 'Number of days to retain audit log data', 1, NOW() - INTERVAL '21 days'),
('automaticBackups', 'true', 'Enable automatic database backups', 1, NOW() - INTERVAL '30 days'),
('maintenanceMode', 'false', 'System maintenance mode status', 1, NOW() - INTERVAL '45 days'),
('alertThreshold', '75', 'Risk score threshold for automatic alerts', 3, NOW() - INTERVAL '5 days'),
('geoBlocking', 'true', 'Enable geographic IP blocking for high-risk countries', 1, NOW() - INTERVAL '10 days'),
('sslCertificateExpiry', '2024-12-31', 'SSL certificate expiration date', 1, NOW() - INTERVAL '60 days'),
('maxConcurrentSessions', '3', 'Maximum concurrent sessions per user', 1, NOW() - INTERVAL '15 days'),
('dataExportEnabled', 'true', 'Allow users to export threat and audit data', 1, NOW() - INTERVAL '20 days');

-- Verification queries (commented out - uncomment to run after import)
/*
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Threats', COUNT(*) FROM threats
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'System Settings', COUNT(*) FROM system_settings;

-- Show distribution of threats by severity
SELECT severity, COUNT(*) as count, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM threats), 2) as percentage
FROM threats 
GROUP BY severity 
ORDER BY count DESC;

-- Show recent audit events
SELECT event_type, COUNT(*) as count
FROM audit_logs 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;
*/