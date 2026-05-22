import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rehab-x-fallback-secret-change-in-prod";
const JWT_EXPIRES = "30d";

let db;

// ── DB init ───────────────────────────────────────────────────────────────
async function initDb() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Database tables ready");
}

// ── KV helpers ────────────────────────────────────────────────────────────
async function kvGet(key) {
  const row = await db.get(
    "SELECT value FROM kv_store WHERE key = ?",
    [key]
  );
  return row ? JSON.parse(row.value) : null;
}

async function kvSet(key, value) {
  await db.run(
    `INSERT INTO kv_store (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
    [key, JSON.stringify(value)]
  );
}

// ── JWT middleware ────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized — no token provided" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.userName = payload.name;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized — invalid or expired token" });
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── Health ────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Auth: Register ────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existing = await db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // SQLite doesn't natively return the inserted row like Postgres RETURNING,
    // but the 'sqlite' library's run() returns an object with lastID.
    const result = await db.run(
      "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
      [email.toLowerCase(), name.trim(), passwordHash]
    );
    
    const user = await db.get("SELECT id, email, name, created_at FROM users WHERE id = ?", [result.lastID]);
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── Auth: Login ───────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.get(
      "SELECT id, email, name, password_hash FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── Auth: Send Verification Code ─────────────────────────────────────────
app.post("/api/auth/send-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await db.run(
      `INSERT INTO kv_store (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [`verify_${email.toLowerCase()}`, JSON.stringify({ code, expires })]
    );

    // In production, send via email service. For dev, return the code directly.
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    res.json({ success: true, devCode: code });
  } catch (err) {
    console.error("Send verification error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// ── Auth: Verify Code ─────────────────────────────────────────────────────
app.post("/api/auth/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code are required" });

    const row = await db.get(
      "SELECT value FROM kv_store WHERE key = ?",
      [`verify_${email.toLowerCase()}`]
    );

    if (!row) return res.status(400).json({ error: "No verification code found. Please request a new one." });

    const { code: storedCode, expires } = JSON.parse(row.value);

    if (Date.now() > expires) {
      return res.status(400).json({ error: "Code has expired. Please request a new one." });
    }
    if (String(code) !== String(storedCode)) {
      return res.status(400).json({ error: "Incorrect code. Please try again." });
    }

    // Mark verified — delete the code
    await db.run("DELETE FROM kv_store WHERE key = ?", [`verify_${email.toLowerCase()}`]);

    res.json({ success: true });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// ── Auth: Google ──────────────────────────────────────────────────────────
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Google token required" });

    // Decode Google ID token (JWT) — for production use google-auth-library to verify
    const parts = token.split(".");
    if (parts.length !== 3) return res.status(400).json({ error: "Invalid token format" });
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));

    const { email, name } = payload;
    if (!email) return res.status(400).json({ error: "Invalid Google token payload" });

    // Find or create user
    let user = await db.get(
      "SELECT id, email, name FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    
    if (!user) {
      const result = await db.run(
        "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
        [email.toLowerCase(), name || email.split("@")[0], "google-oauth-" + Date.now()]
      );
      user = await db.get("SELECT id, email, name FROM users WHERE id = ?", [result.lastID]);
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ token: jwtToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed. Please try again." });
  }
});

// ── Auth: Me ──────────────────────────────────────────────────────────────
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await db.get(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [req.userId]
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Public: Check username availability (for signup — no auth needed) ────
app.get("/api/username-available", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || !String(username).trim()) return res.status(400).json({ error: "Username required" });
    const user = await db.get(
      "SELECT id FROM users WHERE LOWER(name) = LOWER(?)",
      [String(username).trim()]
    );
    res.json({ available: !user });
  } catch (err) {
    console.error("Username available error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Sync display username back to users table ─────────────────────────────
app.post("/api/update-username", requireAuth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || !String(username).trim()) return res.status(400).json({ error: "Username required" });
    const cleaned = String(username).trim();
    const existing = await db.get(
      "SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id != ?",
      [cleaned, req.userId]
    );
    if (existing) return res.status(409).json({ error: "Username already taken" });
    
    await db.run("UPDATE users SET name = ? WHERE id = ?", [cleaned, req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Update username error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Check username availability ───────────────────────────────────────────
app.get("/api/check-username", requireAuth, async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || !username.trim()) return res.status(400).json({ error: "Username required" });
    const existing = await db.get(
      "SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id != ?",
      [username.trim(), req.userId]
    );
    res.json({ taken: !!existing });
  } catch (err) {
    console.error("Check username error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Protected: User profile ───────────────────────────────────────────────
app.get("/api/user", requireAuth, async (req, res) => {
  try {
    const data = await kvGet(`rehab_user_${req.userId}`);
    res.json(data ?? null);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/user", requireAuth, async (req, res) => {
  try {
    await kvSet(`rehab_user_${req.userId}`, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Save user error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Protected: Sessions ───────────────────────────────────────────────────
app.get("/api/sessions", requireAuth, async (req, res) => {
  try {
    const data = await kvGet(`rehab_sessions_${req.userId}`);
    res.json(data ?? []);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/sessions", requireAuth, async (req, res) => {
  try {
    await kvSet(`rehab_sessions_${req.userId}`, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Save sessions error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Protected: Settings ───────────────────────────────────────────────────
app.get("/api/settings", requireAuth, async (req, res) => {
  try {
    const data = await kvGet(`rehab_settings_${req.userId}`);
    res.json(data ?? null);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/settings", requireAuth, async (req, res) => {
  try {
    await kvSet(`rehab_settings_${req.userId}`, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Save settings error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// ── Protected: Log single session ─────────────────────────────────────────
app.post("/api/log", requireAuth, async (req, res) => {
  try {
    const existing = (await kvGet(`rehab_sessions_${req.userId}`)) ?? [];
    const updated = [...existing, req.body];
    await kvSet(`rehab_sessions_${req.userId}`, updated);
    res.json({ success: true, total: updated.length });
  } catch (err) {
    console.error("Log session error:", err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.API_PORT || 3001;
initDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
