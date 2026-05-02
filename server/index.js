import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

const JWT_SECRET = process.env.JWT_SECRET || "rehab-x-fallback-secret-change-in-prod";
const JWT_EXPIRES = "30d";

// ── KV helpers ────────────────────────────────────────────────────────────
async function kvGet(key) {
  const { rows } = await pool.query(
    "SELECT value FROM kv_store WHERE key = $1",
    [key]
  );
  return rows.length > 0 ? rows[0].value : null;
}

async function kvSet(key, value) {
  await pool.query(
    `INSERT INTO kv_store (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
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

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at",
      [email.toLowerCase(), name.trim(), passwordHash]
    );
    const user = rows[0];
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

    const { rows } = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
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
    let user;
    const { rows } = await pool.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (rows.length > 0) {
      user = rows[0];
    } else {
      const { rows: newRows } = await pool.query(
        "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name",
        [email.toLowerCase(), name || email.split("@")[0], "google-oauth-" + Date.now()]
      );
      user = newRows[0];
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
    const { rows } = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Me error:", err);
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
