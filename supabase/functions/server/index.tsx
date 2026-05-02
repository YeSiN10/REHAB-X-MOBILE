import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-cbe26bfc/health", (c) => {
  return c.json({ status: "ok" });
});

// ── User profile ──────────────────────────────────────────────────────────
app.get("/make-server-cbe26bfc/user/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const data = await kv.get(`rehab_user_${deviceId}`);
    return c.json(data ?? null);
  } catch (err) {
    console.log("Error getting user:", err);
    return c.json({ error: String(err) }, 500);
  }
});

app.post("/make-server-cbe26bfc/user/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const body = await c.req.json();
    await kv.set(`rehab_user_${deviceId}`, body);
    return c.json({ success: true });
  } catch (err) {
    console.log("Error saving user:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── Sessions ──────────────────────────────────────────────────────────────
app.get("/make-server-cbe26bfc/sessions/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const data = await kv.get(`rehab_sessions_${deviceId}`);
    return c.json(data ?? []);
  } catch (err) {
    console.log("Error getting sessions:", err);
    return c.json({ error: String(err) }, 500);
  }
});

app.post("/make-server-cbe26bfc/sessions/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const body = await c.req.json();
    await kv.set(`rehab_sessions_${deviceId}`, body);
    return c.json({ success: true });
  } catch (err) {
    console.log("Error saving sessions:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── Settings ──────────────────────────────────────────────────────────────
app.get("/make-server-cbe26bfc/settings/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const data = await kv.get(`rehab_settings_${deviceId}`);
    return c.json(data ?? null);
  } catch (err) {
    console.log("Error getting settings:", err);
    return c.json({ error: String(err) }, 500);
  }
});

app.post("/make-server-cbe26bfc/settings/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const body = await c.req.json();
    await kv.set(`rehab_settings_${deviceId}`, body);
    return c.json({ success: true });
  } catch (err) {
    console.log("Error saving settings:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── Progress log (add single session) ────────────────────────────────────
app.post("/make-server-cbe26bfc/log/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param("deviceId");
    const newSession = await c.req.json();
    const existing: any[] = (await kv.get(`rehab_sessions_${deviceId}`)) ?? [];
    const updated = [...existing, newSession];
    await kv.set(`rehab_sessions_${deviceId}`, updated);
    return c.json({ success: true, total: updated.length });
  } catch (err) {
    console.log("Error logging session:", err);
    return c.json({ error: String(err) }, 500);
  }
});

Deno.serve(app.fetch);
