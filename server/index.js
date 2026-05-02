import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

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

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/user/:deviceId", async (req, res) => {
  try {
    const data = await kvGet(`rehab_user_${req.params.deviceId}`);
    res.json(data ?? null);
  } catch (err) {
    console.error("Error getting user:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/user/:deviceId", async (req, res) => {
  try {
    await kvSet(`rehab_user_${req.params.deviceId}`, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/sessions/:deviceId", async (req, res) => {
  try {
    const data = await kvGet(`rehab_sessions_${req.params.deviceId}`);
    res.json(data ?? []);
  } catch (err) {
    console.error("Error getting sessions:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/sessions/:deviceId", async (req, res) => {
  try {
    await kvSet(`rehab_sessions_${req.params.deviceId}`, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving sessions:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/settings/:deviceId", async (req, res) => {
  try {
    const data = await kvGet(`rehab_settings_${req.params.deviceId}`);
    res.json(data ?? null);
  } catch (err) {
    console.error("Error getting settings:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/settings/:deviceId", async (req, res) => {
  try {
    await kvSet(`rehab_settings_${req.params.deviceId}`, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving settings:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/log/:deviceId", async (req, res) => {
  try {
    const existing = (await kvGet(`rehab_sessions_${req.params.deviceId}`)) ?? [];
    const updated = [...existing, req.body];
    await kvSet(`rehab_sessions_${req.params.deviceId}`, updated);
    res.json({ success: true, total: updated.length });
  } catch (err) {
    console.error("Error logging session:", err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
