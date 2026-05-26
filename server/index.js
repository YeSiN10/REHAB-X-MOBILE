import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rehab-x-fallback-secret-change-in-prod";
const JWT_EXPIRES = "30d";

// ── In-memory store (local dev — data resets on server restart) ───────────
// For persistent local storage, replace with a real DB (e.g. SQLite or Postgres).
const users = new Map();   // email → { id, email, name, passwordHash, createdAt }
const kvStore = new Map(); // key → value
let userIdCounter = 1;

function kvGet(key) {
  return kvStore.get(key) ?? null;
}
function kvSet(key, value) {
  kvStore.set(key, value);
}

// ── JWT middleware ─────────────────────────────────────────────────────────
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

// ── Health ─────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: "local-dev-in-memory" });
});

// ── Auth: Register ─────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const key = email.toLowerCase();
    if (users.has(key)) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const id = userIdCounter++;
    const user = { id, email: key, name: name.trim(), passwordHash, createdAt: new Date().toISOString() };
    users.set(key, user);
    const token = jwt.sign({ userId: id, email: key, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ token, user: { id, email: key, name: user.name } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── Auth: Login ────────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = users.get(email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
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

// ── Auth: Send Verification Code ───────────────────────────────────────────
app.post("/api/auth/send-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = Date.now() + 10 * 60 * 1000;
    kvSet(`verify_${email.toLowerCase()}`, { code, expires });
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    res.json({ success: true, devCode: code });
  } catch (err) {
    console.error("Send verification error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// ── Auth: Verify Code ──────────────────────────────────────────────────────
app.post("/api/auth/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code are required" });
    const entry = kvGet(`verify_${email.toLowerCase()}`);
    if (!entry) return res.status(400).json({ error: "No verification code found. Please request a new one." });
    if (Date.now() > entry.expires) return res.status(400).json({ error: "Code has expired. Please request a new one." });
    if (String(code) !== String(entry.code)) return res.status(400).json({ error: "Incorrect code. Please try again." });
    kvStore.delete(`verify_${email.toLowerCase()}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// ── Auth: Google ───────────────────────────────────────────────────────────
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Google token required" });
    const parts = token.split(".");
    if (parts.length !== 3) return res.status(400).json({ error: "Invalid token format" });
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const { email, name } = payload;
    if (!email) return res.status(400).json({ error: "Invalid Google token payload" });
    let user = users.get(email.toLowerCase());
    if (!user) {
      const id = userIdCounter++;
      user = { id, email: email.toLowerCase(), name: name || email.split("@")[0], passwordHash: "google-oauth", createdAt: new Date().toISOString() };
      users.set(email.toLowerCase(), user);
    }
    const jwtToken = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token: jwtToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed. Please try again." });
  }
});

// ── Auth: Me ───────────────────────────────────────────────────────────────
app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = [...users.values()].find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, email: user.email, name: user.name, created_at: user.createdAt });
});

// ── Username checks ────────────────────────────────────────────────────────
app.get("/api/username-available", (req, res) => {
  const { username } = req.query;
  if (!username?.trim()) return res.status(400).json({ error: "Username required" });
  const taken = [...users.values()].some(u => u.name.toLowerCase() === String(username).trim().toLowerCase());
  res.json({ available: !taken });
});

app.post("/api/update-username", requireAuth, (req, res) => {
  const { username } = req.body;
  if (!username?.trim()) return res.status(400).json({ error: "Username required" });
  const cleaned = String(username).trim();
  const conflict = [...users.values()].find(u => u.name.toLowerCase() === cleaned.toLowerCase() && u.id !== req.userId);
  if (conflict) return res.status(409).json({ error: "Username already taken" });
  const user = [...users.values()].find(u => u.id === req.userId);
  if (user) user.name = cleaned;
  res.json({ success: true });
});

app.get("/api/check-username", requireAuth, (req, res) => {
  const { username } = req.query;
  if (!username?.trim()) return res.status(400).json({ error: "Username required" });
  const taken = [...users.values()].some(u => u.name.toLowerCase() === String(username).trim().toLowerCase() && u.id !== req.userId);
  res.json({ taken });
});

// ── User profile ───────────────────────────────────────────────────────────
app.get("/api/user", requireAuth, (req, res) => {
  res.json(kvGet(`rehab_user_${req.userId}`));
});
app.post("/api/user", requireAuth, (req, res) => {
  kvSet(`rehab_user_${req.userId}`, req.body);
  res.json({ success: true });
});

// ── Sessions ───────────────────────────────────────────────────────────────
app.get("/api/sessions", requireAuth, (req, res) => {
  res.json(kvGet(`rehab_sessions_${req.userId}`) ?? []);
});
app.post("/api/sessions", requireAuth, (req, res) => {
  kvSet(`rehab_sessions_${req.userId}`, req.body);
  res.json({ success: true });
});

// ── Settings ───────────────────────────────────────────────────────────────
app.get("/api/settings", requireAuth, (req, res) => {
  res.json(kvGet(`rehab_settings_${req.userId}`));
});
app.post("/api/settings", requireAuth, (req, res) => {
  kvSet(`rehab_settings_${req.userId}`, req.body);
  res.json({ success: true });
});

// ── Log session ────────────────────────────────────────────────────────────
app.post("/api/log", requireAuth, (req, res) => {
  const existing = kvGet(`rehab_sessions_${req.userId}`) ?? [];
  const updated = [...existing, req.body];
  kvSet(`rehab_sessions_${req.userId}`, updated);
  res.json({ success: true, total: updated.length });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API server (in-memory) running on http://localhost:${PORT}`);
});
