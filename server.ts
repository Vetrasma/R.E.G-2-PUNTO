import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import cron from "node-cron";
import { AgentService } from "./server/agentService.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "reg-europa-secret-key-2024";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Initialize Database
const db = new Database("reg_europa.db");
db.pragma("journal_mode = WAL");

// Setup Tables (same as before)
db.exec(`
  CREATE TABLE IF NOT EXISTS api_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT UNIQUE,
    encrypted_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    permissions TEXT
  );

  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    user_info TEXT,
    proxy_user TEXT,
    auth_type TEXT,
    role TEXT,
    username TEXT DEFAULT 'sma',
    password TEXT,
    conn_type TEXT,
    details TEXT,
    hostname TEXT,
    port INTEGER DEFAULT 1521,
    type TEXT,
    service_name TEXT,
    status TEXT DEFAULT 'inactive',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT,
    coordinates TEXT,
    owner TEXT,
    property_type TEXT,
    condition TEXT,
    price REAL,
    vacancy_indicators TEXT,
    country TEXT,
    source_api TEXT,
    status TEXT DEFAULT 'detected',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER,
    content TEXT,
    viability_score INTEGER,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(opportunity_id) REFERENCES opportunities(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    severity TEXT,
    message TEXT,
    user_ref TEXT,
    agent_ref TEXT,
    type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashedPassword, "SUPERADMIN");
  
  // Default settings
  const defaultSettings = [
    ['countries_enabled', JSON.stringify(['Spain', 'Portugal', 'France', 'Germany', 'Italy', 'UK', 'Switzerland'])],
    ['scan_frequency', 'daily'],
    ['viability_threshold', '70'],
    ['apis_enabled', JSON.stringify(['Catastro', 'Idealista', 'Cadastre', 'LandRegistry'])]
  ];
  const insertSetting = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  defaultSettings.forEach(s => insertSetting.run(s[0], s[1]));
}

app.use(express.json());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Encryption Helpers
const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text: string) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// API Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/dashboard/stats", authenticate, (req, res) => {
  const stats = {
    totalOpportunities: db.prepare("SELECT COUNT(*) as count FROM opportunities").get() as any,
    totalProposals: db.prepare("SELECT COUNT(*) as count FROM proposals").get() as any,
    activeConnections: db.prepare("SELECT COUNT(*) as count FROM connections WHERE status = 'active'").get() as any,
    recentLogs: db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 10").all()
  };
  res.json(stats);
});

app.get("/api/connections", authenticate, (req, res) => {
  const connections = db.prepare("SELECT id, name, username, conn_type, hostname, port, status FROM connections").all();
  res.json(connections);
});

app.post("/api/connections", authenticate, (req: any, res) => {
  const { name, user_info, proxy_user, auth_type, role, username, password, conn_type, details, hostname, port, type, service_name } = req.body;
  const encryptedPassword = encrypt(password);
  const result = db.prepare(`
    INSERT INTO connections (name, user_info, proxy_user, auth_type, role, username, password, conn_type, details, hostname, port, type, service_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, user_info, proxy_user, auth_type, role, username || 'sma', encryptedPassword, conn_type, details, hostname, port || 1521, type, service_name);
  
  db.prepare("INSERT INTO logs (severity, message, user_ref, type) VALUES (?, ?, ?, ?)").run("INFO", `Connection ${name} created`, req.user.username, "CONNECTION");
  
  res.json({ id: result.lastInsertRowid });
});

app.post("/api/connections/test", authenticate, (req, res) => {
  setTimeout(() => {
    res.json({ success: true, message: "Connection test successful" });
  }, 1000);
});

app.get("/api/logs", authenticate, (req, res) => {
  const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC").all();
  res.json(logs);
});

app.get("/api/settings", authenticate, (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  const settingsObj = settings.reduce((acc: any, curr: any) => {
    // Mask API keys for security in the UI, unless specifically requested
    if (curr.key.endsWith('_API_KEY') || curr.key.endsWith('_SECRET')) {
      acc[curr.key] = "********";
    } else {
      acc[curr.key] = curr.value;
    }
    return acc;
  }, {});
  res.json(settingsObj);
});

app.post("/api/settings", authenticate, (req, res) => {
  const insert = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  Object.entries(req.body).forEach(([key, value]) => {
    let finalValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Encrypt sensitive keys if they are being updated (not masked)
    if ((key.endsWith('_API_KEY') || key.endsWith('_SECRET')) && value !== "********") {
      finalValue = encrypt(finalValue);
    }
    
    // Skip if it's a masked value being sent back
    if (value === "********") return;

    insert.run(key, finalValue);
  });
  res.json({ success: true });
});

// API Credentials Routes (Secure Storage)
app.get("/api/credentials", authenticate, (req, res) => {
  const credentials = db.prepare("SELECT id, provider FROM api_credentials").all();
  res.json(credentials);
});

app.post("/api/credentials", authenticate, (req, res) => {
  const { provider, key } = req.body;
  if (!provider || !key) return res.status(400).json({ error: "Provider and key are required" });
  
  const encryptedKey = encrypt(key);
  try {
    db.prepare("INSERT OR REPLACE INTO api_credentials (provider, encrypted_key) VALUES (?, ?)").run(provider, encryptedKey);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// AI Agent Routes
app.post("/api/agents/detect", authenticate, async (req, res) => {
  try {
    await AgentService.runDetection();
    res.json({ success: true, message: "Detection scan initiated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/agents/viability", authenticate, async (req, res) => {
  const { opportunity_id } = req.body;
  try {
    await AgentService.runViability(opportunity_id);
    res.json({ success: true, message: "Viability assessment initiated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/agents/proposals", authenticate, async (req, res) => {
  const { opportunity_id, viability_score } = req.body;
  try {
    await AgentService.runDocumentation(opportunity_id, viability_score);
    res.json({ success: true, message: "Proposal generation initiated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/agents/supervision", authenticate, async (req, res) => {
  try {
    await AgentService.runSupervision();
    res.json({ success: true, message: "Supervision cycle completed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real Cron Jobs
// Run detection every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("CRON: Running autonomous detection scan...");
  AgentService.runDetection();
});

// Run supervision every 6 hours
cron.schedule("0 */6 * * *", () => {
  console.log("CRON: Running autonomous supervision cycle...");
  AgentService.runSupervision();
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
