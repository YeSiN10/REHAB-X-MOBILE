import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const API = `https://${projectId}.supabase.co/functions/v1/make-server-cbe26bfc`;
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` };

// ── DeviceID ──────────────────────────────────────────────────────────────
function getDeviceId(): string {
  let id = localStorage.getItem("rehab_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("rehab_device_id", id);
  }
  return id;
}

// ── Types ─────────────────────────────────────────────────────────────────
export interface User {
  name: string;
  email: string;
  gender: string;
  age: string;
  fitnessLevel: string;
  goal: string;
  medicalDoc?: string;
  profileSetupDone?: boolean;
  avatar?: string; // base64 data URL
}

export interface WorkoutSession {
  id?: string;
  date: string;
  calories: number;
  duration: number;
  type: string;
  exerciseId?: string;
  title?: string;
}

// ── Generate realistic seed sessions ─────────────────────────────────────
const generateSeedSessions = (): WorkoutSession[] => {
  const types = ["Cardio", "Strength", "Recovery", "HIIT", "Flexibility", "Core"];
  const titles = ["Morning HIIT", "Lower Body Blast", "Sprint Recovery", "Core Power", "Flex Flow", "Upper Body Push"];
  const sessions: WorkoutSession[] = [];
  const today = new Date();
  const pattern = [1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1,0,1,1];
  const calMap = [380,0,520,290,0,480,610,0,420,0,350,500,440,0,390,580,0,460,310,540,0,420,0,490,370,560,0,430,480,0,520,290,0,450,380];
  const durMap = [35,0,52,28,0,44,58,0,40,0,32,48,42,0,36,55,0,43,30,50,0,40,0,46,34,53,0,41,45,0,50,28,0,43,36];
  for (let i = 34; i >= 0; i--) {
    if (pattern[34 - i]) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const idx = 34 - i;
      sessions.push({
        id: crypto.randomUUID(),
        date: date.toISOString().split("T")[0],
        calories: calMap[idx],
        duration: durMap[idx],
        type: types[idx % types.length],
        title: titles[idx % titles.length],
      });
    }
  }
  return sessions;
};

// ── Theme colors ──────────────────────────────────────────────────────────
export const getThemeColors = (isDark: boolean) => ({
  bg: isDark ? "#07090F" : "#F0F4FF",
  card: isDark ? "#111929" : "#FFFFFF",
  cardBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(37,109,233,0.1)",
  text: isDark ? "#FFFFFF" : "#0A1628",
  textSub: isDark ? "#94A3B8" : "#4B5A6E",
  textMuted: isDark ? "#475569" : "#8896A6",
  inputBg: isDark ? "#111929" : "#EEF2FC",
  inputBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(37,109,233,0.15)",
  navBg: isDark ? "#07090F" : "#FFFFFF",
  navBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  accentBg: isDark ? "rgba(37,109,233,0.15)" : "rgba(37,109,233,0.1)",
  divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  secondaryCard: isDark ? "#0D1220" : "#E8EDFA",
  headerGlow: isDark
    ? "radial-gradient(circle, rgba(37,109,233,0.12) 0%, transparent 70%)"
    : "radial-gradient(circle, rgba(37,109,233,0.08) 0%, transparent 70%)",
  shadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(37,109,233,0.1)",
});

// ── Compute real recovery score ──────────────────────────────────────────
export const computeRecoveryScore = (sessions: WorkoutSession[], todayMood: string): number => {
  const today = new Date();
  const last7 = sessions.filter((s) => {
    const d = new Date(s.date);
    return (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  });

  // Frequency score (ideal = 4-5 sessions/week)
  const freq = last7.length;
  let freqScore = freq === 0 ? 40 : freq <= 2 ? 60 : freq <= 5 ? 75 + (freq - 2) * 5 : Math.max(55, 90 - (freq - 5) * 10);

  // Recovery session bonus
  const hasRecovery = last7.some((s) => s.type === "Recovery" || s.type === "Flexibility");
  const recoveryBonus = hasRecovery ? 8 : -4;

  // Variety bonus
  const types = new Set(last7.map((s) => s.type));
  const varietyBonus = types.size >= 3 ? 6 : types.size >= 2 ? 3 : 0;

  // Mood factor
  const moodMap: Record<string, number> = { great: 8, good: 4, ok: 0, low: -6, exhausted: -12, "": 0 };
  const moodBonus = moodMap[todayMood] ?? 0;

  // Rest days (at least 2/week is healthy)
  const restDays = 7 - freq;
  const restBonus = restDays >= 2 && restDays <= 3 ? 4 : restDays === 1 ? 0 : restDays === 0 ? -8 : -2;

  const raw = freqScore + recoveryBonus + varietyBonus + moodBonus + restBonus;
  return Math.min(98, Math.max(28, Math.round(raw)));
};

// ── Context type ─────────────────────────────────────────────────────────
interface AppContextType {
  user: User;
  updateUser: (u: Partial<User>) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  todayMood: string;
  setTodayMood: (m: string) => void;
  sessions: WorkoutSession[];
  addSession: (s: WorkoutSession) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  recoveryScore: number;
  isSyncing: boolean;
}

const defaultUser: User = {
  name: "", email: "", gender: "", age: "",
  fitnessLevel: "Intermediate", goal: "Recovery & Performance",
  profileSetupDone: false,
};

const AppContext = createContext<AppContextType>({
  user: defaultUser,
  updateUser: () => {},
  isDark: false,
  setIsDark: () => {},
  todayMood: "",
  setTodayMood: () => {},
  sessions: [],
  addSession: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
  isPremium: false,
  setIsPremium: () => {},
  recoveryScore: 72,
  isSyncing: false,
});

// ── Provider ──────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [deviceId] = useState(() => getDeviceId());
  const [isSyncing, setIsSyncing] = useState(false);

  const [user, setUser] = useState<User>(() => {
    try { return { ...defaultUser, ...JSON.parse(localStorage.getItem("rehab_user") || "{}") }; }
    catch { return defaultUser; }
  });

  const [isDark, setIsDarkState] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem("rehab_dark") || "false"); }
    catch { return false; }
  });

  const [todayMood, setTodayMoodState] = useState(() => {
    return localStorage.getItem("rehab_mood_today") || "";
  });

  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    try {
      const saved = localStorage.getItem("rehab_sessions");
      return saved ? JSON.parse(saved) : generateSeedSessions();
    } catch { return generateSeedSessions(); }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPremium, setIsPremiumState] = useState(false);

  const recoveryScore = computeRecoveryScore(sessions, todayMood);

  // ── Sync from Supabase on mount ──────────────────────────────────────
  useEffect(() => {
    const syncFromServer = async () => {
      setIsSyncing(true);
      try {
        // Fetch user
        const uRes = await fetch(`${API}/user/${deviceId}`, { headers });
        if (uRes.ok) {
          const uData = await uRes.json();
          if (uData && uData.name !== undefined) {
            const merged = { ...defaultUser, ...uData };
            setUser(merged);
            localStorage.setItem("rehab_user", JSON.stringify(merged));
          }
        }
        // Fetch sessions
        const sRes = await fetch(`${API}/sessions/${deviceId}`, { headers });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (Array.isArray(sData) && sData.length > 0) {
            setSessions(sData);
            localStorage.setItem("rehab_sessions", JSON.stringify(sData));
          }
        }
        // Fetch settings (dark mode)
        const settRes = await fetch(`${API}/settings/${deviceId}`, { headers });
        if (settRes.ok) {
          const settData = await settRes.json();
          if (settData && settData.isDark !== undefined) {
            setIsDarkState(settData.isDark);
            localStorage.setItem("rehab_dark", JSON.stringify(settData.isDark));
          }
        }
      } catch (e) {
        console.log("Supabase sync failed (offline fallback):", e);
      } finally {
        setIsSyncing(false);
      }
    };
    syncFromServer();
  }, [deviceId]);

  // ── Persist user ─────────────────────────────────────────────────────
  const updateUser = useCallback((u: Partial<User>) => {
    setUser((prev) => {
      const next = { ...prev, ...u };
      localStorage.setItem("rehab_user", JSON.stringify(next));
      fetch(`${API}/user/${deviceId}`, {
        method: "POST", headers, body: JSON.stringify(next),
      }).catch((e) => console.log("User sync error:", e));
      return next;
    });
  }, [deviceId]);

  // ── Persist dark mode ─────────────────────────────────────────────────
  const setIsDark = useCallback((v: boolean) => {
    setIsDarkState(v);
    localStorage.setItem("rehab_dark", JSON.stringify(v));
    fetch(`${API}/settings/${deviceId}`, {
      method: "POST", headers, body: JSON.stringify({ isDark: v }),
    }).catch((e) => console.log("Settings sync error:", e));
  }, [deviceId]);

  // ── Persist mood ──────────────────────────────────────────────────────
  const setTodayMood = useCallback((m: string) => {
    setTodayMoodState(m);
    localStorage.setItem("rehab_mood_today", m);
  }, []);

  // ── Add session ───────────────────────────────────────────────────────
  const addSession = useCallback((s: WorkoutSession) => {
    setSessions((prev) => {
      const updated = [...prev, { ...s, id: s.id || crypto.randomUUID() }];
      localStorage.setItem("rehab_sessions", JSON.stringify(updated));
      // Log to server
      fetch(`${API}/log/${deviceId}`, {
        method: "POST", headers, body: JSON.stringify(s),
      }).catch((e) => console.log("Session log error:", e));
      return updated;
    });
  }, [deviceId]);

  return (
    <AppContext.Provider
      value={{
        user, updateUser,
        isDark, setIsDark,
        todayMood, setTodayMood,
        sessions, addSession,
        sidebarOpen, setSidebarOpen,
        isPremium, setIsPremium: setIsPremiumState,
        recoveryScore,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export const useColors = () => {
  const { isDark } = useApp();
  return getThemeColors(isDark);
};
