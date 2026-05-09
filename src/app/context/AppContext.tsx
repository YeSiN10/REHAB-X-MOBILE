import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API = "/api";

// ── Types ─────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface User {
  name: string;
  email: string;
  gender: string;
  age: string;
  dob?: string;
  phone?: string;
  fitnessLevel: string;
  goal: string;
  medicalDoc?: string;
  medicalDocs?: string[];
  profileSetupDone?: boolean;
  avatar?: string;
  visitedKine?: string;
  painLevel?: number;
  painZones?: string[];
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

// ── Seed sessions (demo only for unauthenticated) ──────────────────────────
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

// ── Notifications ────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: "workout" | "achievement" | "recovery" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: AppNotification[] = [
  { id: "n1", type: "reminder", title: "Time to Work Out! 💪", message: "Your Morning HIIT session is scheduled in 30 minutes", time: "30 min ago", read: false },
  { id: "n2", type: "achievement", title: "Achievement Unlocked! ⭐", message: "You've earned the 'Streak Master' badge for 5 consecutive days", time: "2 hrs ago", read: false },
  { id: "n3", type: "workout", title: "Workout Completed", message: "Great job! You finished Aqua Training and burned 480 kcal", time: "Yesterday", read: false },
  { id: "n4", type: "recovery", title: "Recovery Recommendation", message: "Based on your intensity levels, today is ideal for a recovery session", time: "Yesterday", read: true },
  { id: "n5", type: "reminder", title: "Weekly Goal Progress", message: "You've completed 5 of 7 planned sessions this week. Keep it up!", time: "2 days ago", read: true },
  { id: "n6", type: "achievement", title: "Personal Record!", message: "New best time recorded for Sprint Intervals: 38:20", time: "3 days ago", read: true },
  { id: "n7", type: "workout", title: "Session Reminder", message: "Don't forget your Lower Body Blast scheduled for tomorrow at 6 PM", time: "4 days ago", read: true },
];

// ── Local date helper (avoids UTC midnight timezone drift) ────────────────
export function toLocalDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Streak computation ────────────────────────────────────────────────────
export function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const dates = new Set(sessions.map((s) => s.date));
  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const d = new Date(today);
  if (!dates.has(todayStr)) d.setDate(d.getDate() - 1);
  let count = 0;
  while (count <= 365) {
    if (dates.has(toLocalDateStr(d))) { count++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return count;
}

export function computeBestStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...new Set(sessions.map((s) => s.date))].sort();
  let best = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    if (diff === 1) { current++; if (current > best) best = current; }
    else current = 1;
  }
  return best;
}

// ── Recovery score ────────────────────────────────────────────────────────
export const computeRecoveryScore = (sessions: WorkoutSession[], todayMood: string): number => {
  const today = new Date();
  const startOf7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  const last7 = sessions.filter((s) => {
    const [y, m, d] = s.date.split("-").map(Number);
    return new Date(y, m - 1, d) >= startOf7;
  });
  // Count distinct active days (not raw session count)
  const activeDays = new Set(last7.map((s) => s.date)).size;
  const freq = activeDays;
  let freqScore = freq === 0 ? 40 : freq <= 2 ? 60 : freq <= 5 ? 75 + (freq - 2) * 5 : Math.max(55, 90 - (freq - 5) * 10);
  const hasRecovery = last7.some((s) => s.type === "Recovery" || s.type === "Flexibility");
  const recoveryBonus = hasRecovery ? 8 : -4;
  const types = new Set(last7.map((s) => s.type));
  const varietyBonus = types.size >= 3 ? 6 : types.size >= 2 ? 3 : 0;
  const moodMap: Record<string, number> = { great: 8, good: 4, ok: 0, low: -6, exhausted: -12, "": 0 };
  const moodBonus = moodMap[todayMood] ?? 0;
  const restDays = 7 - freq;
  const restBonus = restDays >= 2 && restDays <= 3 ? 4 : restDays === 1 ? 0 : restDays === 0 ? -8 : -2;
  const raw = freqScore + recoveryBonus + varietyBonus + moodBonus + restBonus;
  return Math.min(98, Math.max(28, Math.round(raw)));
};

// ── Context type ─────────────────────────────────────────────────────────
interface AppContextType {
  // Auth
  authUser: AuthUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: (googleToken: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  // App state
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
  streak: number;
  bestStreak: number;
  isSyncing: boolean;
  // Favorites
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;
  // Language
  language: "en" | "fr" | "ar";
  setLanguage: (l: "en" | "fr" | "ar") => void;
}

const defaultUser: User = {
  name: "", email: "", gender: "", age: "",
  fitnessLevel: "Intermediate", goal: "Recovery & Performance",
  profileSetupDone: false,
};

export const AppContext = createContext<AppContextType>({
  authUser: null,
  authToken: null,
  isAuthenticated: false,
  authLoading: true,
  login: async () => ({}),
  loginWithGoogle: async () => ({}),
  register: async () => ({}),
  logout: () => {},
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
  recoveryScore: 40,
  streak: 0,
  bestStreak: 0,
  isSyncing: false,
  favoriteIds: [],
  toggleFavorite: () => {},
  notifications: [],
  unreadNotificationsCount: 0,
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  dismissNotification: () => {},
  clearAllNotifications: () => {},
  addNotification: () => {},
  language: "en",
  setLanguage: () => {},
});

// ── Safe localStorage helpers ─────────────────────────────────────────────
const LARGE_FIELDS: (keyof User)[] = ["avatar", "medicalDoc"];

function userForStorage(u: User): Partial<User> {
  const copy = { ...u };
  LARGE_FIELDS.forEach((k) => delete copy[k]);
  return copy;
}

function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* quota exceeded — skip */ }
}

// ── Provider ──────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Auth state ─────────────────────────────────────────────────────────
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("rehab_auth_token")
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("rehab_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const isAuthenticated = !!authToken && !!authUser;

  // ── App state ──────────────────────────────────────────────────────────
  const [user, setUser] = useState<User>(() => {
    try { return { ...defaultUser, ...JSON.parse(localStorage.getItem("rehab_user") || "{}") }; }
    catch { return defaultUser; }
  });

  const [isDark, setIsDarkState] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem("rehab_dark") || "false"); }
    catch { return false; }
  });

  const [todayMood, setTodayMoodState] = useState(() =>
    localStorage.getItem("rehab_mood_today") || ""
  );

  // Sessions: authenticated users always start fresh (no seed data)
  // Unauthenticated users see seed data for demo purposes
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    const hasAuth = !!localStorage.getItem("rehab_auth_token");
    if (hasAuth) {
      try {
        const saved = localStorage.getItem("rehab_sessions");
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    // Demo mode — show seed data
    try {
      const saved = localStorage.getItem("rehab_sessions");
      return saved ? JSON.parse(saved) : generateSeedSessions();
    } catch { return generateSeedSessions(); }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPremium, setIsPremiumState] = useState(false);
  const [language, setLanguageState] = useState<"en" | "fr" | "ar">(() =>
    (localStorage.getItem("rehab_language") as "en" | "fr" | "ar") || "en"
  );
  const setLanguage = useCallback((l: "en" | "fr" | "ar") => {
    setLanguageState(l);
    localStorage.setItem("rehab_language", l);
  }, []);

  // ── Favorites (per-user, keyed by userId) ─────────────────────────────
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const storedUser = localStorage.getItem("rehab_auth_user");
      const userId = storedUser ? JSON.parse(storedUser)?.id : null;
      const key = userId ? `rehab_favorites_${userId}` : "rehab_favorites";
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const toggleFavorite = useCallback((id: string) => {
    const key = authUser?.id ? `rehab_favorites_${authUser.id}` : "rehab_favorites";
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      safeSet(key, JSON.stringify(next));
      return next;
    });
  }, [authUser?.id]);

  // ── Notifications ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("rehab_notifications");
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch { return initialNotifications; }
  });

  const saveNotifs = (n: AppNotification[]) => safeSet("rehab_notifications", JSON.stringify(n));

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifs(next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifs(next);
      return next;
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveNotifs(next);
      return next;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    safeSet("rehab_notifications", "[]");
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "time" | "read">) => {
    setNotifications((prev) => {
      const newNotif: AppNotification = { ...n, id: crypto.randomUUID(), time: "Just now", read: false };
      const next = [newNotif, ...prev];
      saveNotifs(next);
      return next;
    });
  }, []);

  const recoveryScore = computeRecoveryScore(sessions, todayMood);
  const streak = computeStreak(sessions);
  const bestStreak = Math.max(computeBestStreak(sessions), streak);

  // ── Authenticated headers helper ──────────────────────────────────────
  const authHeaders = useCallback((token?: string | null) => {
    const t = token ?? authToken;
    return {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  }, [authToken]);

  // ── Auth: Login ───────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Login failed" };
      const { token, user: au } = data;
      setAuthToken(token);
      setAuthUser(au);
      safeSet("rehab_auth_token", token);
      safeSet("rehab_auth_user", JSON.stringify(au));
      setUser((prev) => ({ ...prev, name: au.name, email: au.email }));
      // Load this user's favorites
      try {
        const saved = localStorage.getItem(`rehab_favorites_${au.id}`);
        setFavoriteIds(saved ? JSON.parse(saved) : []);
      } catch { setFavoriteIds([]); }
      syncRemoteData(token);
      return { user: au };
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  }, []);

  // ── Auth: Google Login ────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (googleToken: string) => {
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Google sign-in failed" };
      const { token, user: au } = data;
      setAuthToken(token);
      setAuthUser(au);
      safeSet("rehab_auth_token", token);
      safeSet("rehab_auth_user", JSON.stringify(au));
      setUser((prev) => ({ ...prev, name: au.name, email: au.email }));
      // Load this user's favorites
      try {
        const saved = localStorage.getItem(`rehab_favorites_${au.id}`);
        setFavoriteIds(saved ? JSON.parse(saved) : []);
      } catch { setFavoriteIds([]); }
      syncRemoteData(token);
      return {};
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  }, []);

  // ── Auth: Register ────────────────────────────────────────────────────
  const phoneRegexAuth = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Registration failed" };
      const { token, user: au } = data;
      setAuthToken(token);
      setAuthUser(au);
      safeSet("rehab_auth_token", token);
      safeSet("rehab_auth_user", JSON.stringify(au));
      // If they signed up with a phone number, pre-fill the phone field
      const isPhone = phoneRegexAuth.test(email.trim());
      setUser((prev) => ({
        ...prev,
        name: au.name,
        email: isPhone ? "" : au.email,
        ...(isPhone ? { phone: email.trim() } : {}),
      }));
      // New users start with empty sessions and empty favorites
      setSessions([]);
      setFavoriteIds([]);
      localStorage.removeItem("rehab_sessions");
      return {};
    } catch {
      return { error: "Network error. Please check your connection." };
    }
  }, []);

  // ── Auth: Logout ──────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setAuthToken(null);
    setAuthUser(null);
    localStorage.removeItem("rehab_auth_token");
    localStorage.removeItem("rehab_auth_user");
    localStorage.removeItem("rehab_user");
    localStorage.removeItem("rehab_sessions");
    localStorage.removeItem("rehab_mood_today");
    localStorage.removeItem("rehab_notifications");
    // Reset all per-user state
    setSessions([]);
    setUser(defaultUser);
    setTodayMoodState("");
    setNotifications(initialNotifications);
    setFavoriteIds([]);
  }, []);

  // ── Sync remote data after login ──────────────────────────────────────
  const syncRemoteData = async (token: string) => {
    setIsSyncing(true);
    try {
      const headers = authHeaders(token);
      // User profile
      const uRes = await fetch(`${API}/user`, { headers });
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData) {
          const merged = { ...defaultUser, ...uData };
          setUser(merged);
          safeSet("rehab_user", JSON.stringify(userForStorage(merged)));
        }
      }
      // Sessions — always apply result (even empty) for authenticated users
      const sRes = await fetch(`${API}/sessions`, { headers });
      if (sRes.ok) {
        const sData = await sRes.json();
        if (Array.isArray(sData)) {
          setSessions(sData);
          safeSet("rehab_sessions", JSON.stringify(sData.slice(-100)));
        }
      }
      // Settings
      const settRes = await fetch(`${API}/settings`, { headers });
      if (settRes.ok) {
        const settData = await settRes.json();
        if (settData?.isDark !== undefined) {
          setIsDarkState(settData.isDark);
          safeSet("rehab_dark", JSON.stringify(settData.isDark));
        }
      }
    } catch (e) {
      console.log("Sync failed (offline fallback):", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // ── Verify token on mount ─────────────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      if (!authToken) { setAuthLoading(false); return; }
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAuthUser({ id: data.id, email: data.email, name: data.name });
          safeSet("rehab_auth_user", JSON.stringify({ id: data.id, email: data.email, name: data.name }));
          syncRemoteData(authToken);
        } else {
          setAuthToken(null);
          setAuthUser(null);
          localStorage.removeItem("rehab_auth_token");
          localStorage.removeItem("rehab_auth_user");
        }
      } catch {
        // Offline — trust cached auth user
      } finally {
        setAuthLoading(false);
      }
    };
    verifyToken();
  }, []);

  // ── Persist user profile ──────────────────────────────────────────────
  const updateUser = useCallback((u: Partial<User>) => {
    setUser((prev) => {
      const next = { ...prev, ...u };
      safeSet("rehab_user", JSON.stringify(userForStorage(next)));
      if (authToken) {
        fetch(`${API}/user`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(next),
        }).catch((e) => console.log("User sync error:", e));
        // Keep users table name in sync so username uniqueness checks work
        if (u.name && u.name.trim()) {
          fetch(`${API}/update-username`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ username: u.name.trim() }),
          }).catch((e) => console.log("Username sync error:", e));
        }
      }
      return next;
    });
  }, [authToken, authHeaders]);

  // ── Persist dark mode ─────────────────────────────────────────────────
  const setIsDark = useCallback((v: boolean) => {
    setIsDarkState(v);
    safeSet("rehab_dark", JSON.stringify(v));
    if (authToken) {
      fetch(`${API}/settings`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ isDark: v }),
      }).catch((e) => console.log("Settings sync error:", e));
    }
  }, [authToken, authHeaders]);

  // ── Persist mood ──────────────────────────────────────────────────────
  const setTodayMood = useCallback((m: string) => {
    setTodayMoodState(m);
    safeSet("rehab_mood_today", m);
  }, []);

  // ── Add session ───────────────────────────────────────────────────────
  const addSession = useCallback((s: WorkoutSession) => {
    setSessions((prev) => {
      const updated = [...prev, { ...s, id: s.id || crypto.randomUUID() }];
      safeSet("rehab_sessions", JSON.stringify(updated.slice(-100)));
      if (authToken) {
        fetch(`${API}/log`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(s),
        }).catch((e) => console.log("Session log error:", e));
      }
      return updated;
    });
  }, [authToken, authHeaders]);

  return (
    <AppContext.Provider
      value={{
        authUser, authToken, isAuthenticated, authLoading,
        login, loginWithGoogle, register, logout,
        user, updateUser,
        isDark, setIsDark,
        todayMood, setTodayMood,
        sessions, addSession,
        sidebarOpen, setSidebarOpen,
        isPremium, setIsPremium: setIsPremiumState,
        recoveryScore,
        streak,
        bestStreak,
        isSyncing,
        favoriteIds,
        toggleFavorite,
        notifications, unreadNotificationsCount,
        markNotificationRead, markAllNotificationsRead,
        dismissNotification, clearAllNotifications, addNotification,
        language, setLanguage,
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
