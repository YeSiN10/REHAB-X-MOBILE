import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { useApp, useColors } from "../context/AppContext";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const moods = [
  { emoji: "😩", label: "Exhausted", value: "exhausted", color: "#EF4444" },
  { emoji: "😔", label: "Low",       value: "low",       color: "#F97316" },
  { emoji: "😐", label: "OK",        value: "ok",        color: "#EAB308" },
  { emoji: "😊", label: "Good",      value: "good",      color: "#22C55E" },
  { emoji: "🤩", label: "Great",     value: "great",     color: "#256DE9" },
];

const intensityColors: Record<string, { bg: string; text: string }> = {
  High:   { bg: "rgba(249,115,22,0.15)",  text: "#F97316" },
  Medium: { bg: "rgba(234,179,8,0.15)",   text: "#EAB308" },
  Low:    { bg: "rgba(34,197,94,0.15)",   text: "#22C55E" },
};

// All exercises mapped by goal
const allExercises: Record<string, { id: string; title: string; category: string; duration: string; calories: number; intensity: string; img: string }[]> = {
  "Recovery & Performance": [
    { id: "featured", title: "Post-Sprint Recovery", category: "Recovery", duration: "24 min", calories: 180, intensity: "Low", img: "https://images.unsplash.com/photo-1713711437257-0232e837f40c?w=400&q=80" },
    { id: "1", title: "Morning HIIT", category: "Cardio Focus", duration: "45 min", calories: 420, intensity: "High", img: "https://images.unsplash.com/photo-1724763750864-9e81ee45d036?w=400&q=80" },
    { id: "2", title: "Flexibility Flow", category: "Flexibility", duration: "30 min", calories: 180, intensity: "Low", img: "https://images.unsplash.com/photo-1713711437257-0232e837f40c?w=400&q=80" },
  ],
  "Build Muscle": [
    { id: "2", title: "Lower Body Blast", category: "Strength", duration: "52 min", calories: 510, intensity: "High", img: "https://images.unsplash.com/photo-1766287453739-c3ffc3f37d05?w=400&q=80" },
    { id: "1", title: "Morning HIIT", category: "HIIT", duration: "45 min", calories: 420, intensity: "High", img: "https://images.unsplash.com/photo-1724763750864-9e81ee45d036?w=400&q=80" },
    { id: "featured", title: "Core Power", category: "Strength", duration: "38 min", calories: 340, intensity: "Medium", img: "https://images.unsplash.com/photo-1766287453739-c3ffc3f37d05?w=400&q=80" },
  ],
  "Lose Weight": [
    { id: "1", title: "Morning HIIT", category: "Cardio Focus", duration: "45 min", calories: 520, intensity: "High", img: "https://images.unsplash.com/photo-1724763750864-9e81ee45d036?w=400&q=80" },
    { id: "2", title: "Sprint Intervals", category: "Cardio", duration: "30 min", calories: 480, intensity: "High", img: "https://images.unsplash.com/photo-1766287453739-c3ffc3f37d05?w=400&q=80" },
    { id: "featured", title: "Fat Burn Circuit", category: "HIIT", duration: "40 min", calories: 440, intensity: "Medium", img: "https://images.unsplash.com/photo-1713711437257-0232e837f40c?w=400&q=80" },
  ],
  "Flexibility": [
    { id: "featured", title: "Yoga Flow", category: "Flexibility", duration: "30 min", calories: 150, intensity: "Low", img: "https://images.unsplash.com/photo-1713711437257-0232e837f40c?w=400&q=80" },
    { id: "1", title: "Dynamic Stretch", category: "Recovery", duration: "25 min", calories: 120, intensity: "Low", img: "https://images.unsplash.com/photo-1724763750864-9e81ee45d036?w=400&q=80" },
    { id: "2", title: "Mobility Class", category: "Flexibility", duration: "35 min", calories: 160, intensity: "Low", img: "https://images.unsplash.com/photo-1766287453739-c3ffc3f37d05?w=400&q=80" },
  ],
};

// Instructions popup data
const exerciseInstructions: Record<string, { steps: string[]; tip: string }> = {
  featured: {
    steps: [
      "Position device where camera sees your full body",
      "Stand in the start zone shown on screen",
      "Follow the skeleton guide for each movement",
      "Complete all sets — camera tracks your form",
      "Breathe steadily throughout",
    ],
    tip: "Ensure good lighting for best tracking accuracy",
  },
  "1": {
    steps: [
      "Set up camera facing you with enough space",
      "Begin with 5-min dynamic warm-up",
      "Follow HIIT timer — max effort during active phases",
      "Use rest periods to recover",
      "Camera monitors your rep count automatically",
    ],
    tip: "Keep phone at chest height for best tracking",
  },
  "2": {
    steps: [
      "Point camera with 2m clear space behind you",
      "Start with warm-up sets at lighter weight",
      "Hold each rep at the bottom for 1 second",
      "Camera tracks depth — green means correct form",
      "Rest 90s between sets as prompted",
    ],
    tip: "Film from the side for best form analysis",
  },
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, setSidebarOpen, todayMood, setTodayMood, sessions, isDark } = useApp();
  const c = useColors();
  const [goalView, setGoalView] = useState<"weekly" | "monthly">("weekly");
  const [instructionsExId, setInstructionsExId] = useState<string | null>(null);
  const [showDailyBanner, setShowDailyBanner] = useState(true);

  const firstName = user.name ? user.name.split(" ")[0] : "there";
  const today = new Date();

  // Exercises filtered by user's primary goal
  const recommended = allExercises[user.goal || "Recovery & Performance"] || allExercises["Recovery & Performance"];

  const thisWeekSessions = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return sessions.filter((s) => new Date(s.date) >= start);
  }, [sessions]);

  const thisMonthSessions = useMemo(() =>
    sessions.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }), [sessions]);

  // Today's sessions
  const todaySessions = useMemo(() => {
    const todayStr = today.toISOString().split("T")[0];
    return sessions.filter(s => s.date === todayStr).length;
  }, [sessions]);
  const todayGoal = 1; // planned exercises today from calendar

  const totalCaloriesWeek = thisWeekSessions.reduce((sum, s) => sum + s.calories, 0);
  const totalDurationWeek = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);
  const weeklyGoalDays = 5;
  const completedWeekDays = Math.min(thisWeekSessions.length, 7);

  const weekDaysStatus = useMemo(() => {
    const result = [false, false, false, false, false, false, false];
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    thisWeekSessions.forEach((s) => {
      const d = new Date(s.date);
      const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) result[diff] = true;
    });
    return result;
  }, [thisWeekSessions]);

  const monthlyGoal = 20;
  const monthlyProgress = Math.min(thisMonthSessions.length, monthlyGoal);
  const monthlyPercent = Math.round((monthlyProgress / monthlyGoal) * 100);

  const streak = useMemo(() => {
    const dates = new Set(sessions.map((s) => s.date));
    let count = 0;
    const d = new Date(today);
    while (count <= 30) {
      if (dates.has(d.toISOString().split("T")[0])) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [sessions]);

  const quickStats = [
    { label: "Calories", value: totalCaloriesWeek >= 1000 ? `${(totalCaloriesWeek / 1000).toFixed(1)}k` : `${totalCaloriesWeek}`, unit: "kcal", icon: "🔥", color: "#F97316" },
    { label: "Active", value: totalDurationWeek >= 60 ? `${(totalDurationWeek / 60).toFixed(1)}` : `${totalDurationWeek}`, unit: totalDurationWeek >= 60 ? "hrs" : "min", icon: "⏱️", color: "#3B82F6" },
    { label: "Sessions", value: `${thisWeekSessions.length}`, unit: "week", icon: "💪", color: "#A855F7" },
    { label: "Streak", value: `${streak}`, unit: "days", icon: "⚡", color: "#EAB308" },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const instructionData = instructionsExId
    ? (exerciseInstructions[instructionsExId] || exerciseInstructions["featured"])
    : null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "RX";

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>
      <ProfileSidebar />

      {/* ── Instructions Popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {instructionsExId && instructionData && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setInstructionsExId(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl px-5 pt-6 pb-8"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: c.divider }} />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black" style={{ fontSize: 17, color: c.text }}>Camera Setup</h3>
                  <p className="text-xs" style={{ color: c.textMuted }}>Before you start your VR session</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl mb-4 flex items-start gap-3" style={{ background: "rgba(37,109,233,0.1)", border: "1px solid rgba(37,109,233,0.2)" }}>
                <span style={{ fontSize: 16 }}>📷</span>
                <p className="text-xs leading-relaxed" style={{ color: "#256DE9" }}>
                  <span className="font-bold">Camera required.</span> This VR exercise uses your camera to track movement and correct form in real-time.
                </p>
              </div>
              <div className="space-y-2.5 mb-5">
                {instructionData.steps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#256DE9" }}>
                      <span className="text-white font-black" style={{ fontSize: 10 }}>{i + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: c.textSub }}>{step}</p>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 rounded-2xl mb-5 flex items-start gap-2" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
                <span style={{ fontSize: 14 }}>💡</span>
                <p className="text-xs leading-relaxed" style={{ color: "#EAB308" }}>
                  <span className="font-bold">Tip: </span>{instructionData.tip}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setInstructionsExId(null); navigate(`/workout/${instructionsExId}`); }}
                className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3"
                style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)", boxShadow: "0 16px 40px rgba(37,109,233,0.35)", fontSize: 16 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5L19 12L8 19V5Z" /></svg>
                Start VR Session
              </motion.button>
              <button onClick={() => setInstructionsExId(null)} className="w-full text-center mt-3 text-sm font-semibold" style={{ color: c.textMuted }}>
                Not now
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CURVED HEADER ─────────────────────────────────────────── */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 22,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          zIndex: 2,
        }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.35) 0%, transparent 65%)" }} />

        {/* Top row: greeting + notif + avatar */}
        <div className="flex items-center justify-between px-5">
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{getGreeting()},</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", lineHeight: 1.2 }}>
              {firstName} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                style={{ background: "#EF4444", fontSize: 8, fontWeight: 700 }}>3</span>
            </button>

            {/* Avatar with green online dot */}
            <button onClick={() => setSidebarOpen(true)} className="relative shrink-0">
              <div
                className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ border: "2px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)" }}>
                    <span className="text-white font-black text-sm">{initials}</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                style={{ background: "#22C55E", border: "2px solid #0d1630", boxShadow: "0 0 6px #22C55E" }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scroll area ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-[90px] pt-4">

        {/* Daily exercise banner (like image-1) */}
        <AnimatePresence>
          {showDailyBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="mx-5 mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: c.card,
                border: "1.5px solid rgba(37,109,233,0.35)",
                boxShadow: `0 4px 20px rgba(37,109,233,0.15)`,
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(37,109,233,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8C18 6.4087 17.37 4.88 16.24 3.76C15.12 2.63 13.59 2 12 2C10.41 2 8.88 2.63 7.76 3.76C6.63 4.88 6 6.41 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#256DE9" strokeWidth="1.8" />
                  <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "#256DE9" }}>
                  It's your turn{" "}
                  <span style={{ color: c.text }}>{todaySessions}/{todayGoal}</span>
                  {" "}Exercise{todayGoal > 1 ? "s" : ""}!
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>
                  {todaySessions >= todayGoal ? "Daily goal achieved! 🎉" : "Tap to start your scheduled session"}
                </p>
              </div>
              <button
                onClick={() => setShowDailyBanner(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: c.secondaryCard }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke={c.textMuted} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal card */}
        <div className="px-5 mb-3">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
          >
            <div className="flex p-1 mx-3 mt-3 rounded-xl" style={{ background: c.secondaryCard }}>
              {(["weekly", "monthly"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setGoalView(view)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                  style={goalView === view
                    ? { background: "#256DE9", color: "white", boxShadow: "0 4px 12px rgba(37,109,233,0.3)" }
                    : { color: c.textMuted }}
                >
                  {view === "weekly" ? "Weekly Goal" : "Monthly Progress"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {goalView === "weekly" ? (
                <motion.div key="weekly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold" style={{ color: c.text }}>{completedWeekDays} of {weeklyGoalDays} days completed</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: c.accentBg, color: "#256DE9" }}>
                      {Math.round((completedWeekDays / weeklyGoalDays) * 100)}%
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {weekDays.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full h-1.5 rounded-full transition-all" style={{ background: weekDaysStatus[i] ? "#256DE9" : c.secondaryCard }} />
                        <span className="text-[9px] font-semibold" style={{ color: weekDaysStatus[i] ? "#256DE9" : c.textMuted }}>{day}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="monthly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="24" fill="none" stroke={c.secondaryCard} strokeWidth="6" />
                      <circle cx="32" cy="32" r="24" fill="none" stroke="#256DE9" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        strokeDashoffset={`${2 * Math.PI * 24 * (1 - monthlyPercent / 100)}`}
                        transform="rotate(-90 32 32)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-black" style={{ fontSize: 13, color: c.text }}>{monthlyPercent}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: c.text }}>{monthlyProgress} / {monthlyGoal} sessions</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      {monthlyGoal - monthlyProgress > 0 ? `${monthlyGoal - monthlyProgress} more to reach goal` : "Monthly goal achieved! 🎉"}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <div>
                        <p className="font-black" style={{ fontSize: 14, color: "#256DE9" }}>{thisMonthSessions.reduce((s, x) => s + x.calories, 0).toLocaleString()}</p>
                        <p className="text-[9px] font-semibold" style={{ color: c.textMuted }}>KCAL</p>
                      </div>
                      <div>
                        <p className="font-black" style={{ fontSize: 14, color: "#22C55E" }}>{Math.round(thisMonthSessions.reduce((s, x) => s + x.duration, 0) / 60 * 10) / 10}h</p>
                        <p className="text-[9px] font-semibold" style={{ color: c.textMuted }}>ACTIVE</p>
                      </div>
                      <div>
                        <p className="font-black" style={{ fontSize: 14, color: "#A855F7" }}>{thisMonthSessions.length}</p>
                        <p className="text-[9px] font-semibold" style={{ color: c.textMuted }}>SESSIONS</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Quick stats below the goal card ──────────────────────── */}
        <div className="px-5 mb-4">
          <div
            className="grid grid-cols-4 gap-2 p-3 rounded-2xl"
            style={{ border: "1.5px solid rgba(37,109,233,0.35)", background: "rgba(37,109,233,0.05)", boxShadow: "0 4px 20px rgba(37,109,233,0.08)" }}
          >
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5 py-1">
                <span style={{ fontSize: 16 }}>{stat.icon}</span>
                <span className="font-black" style={{ fontSize: 14, color: stat.color }}>{stat.value}</span>
                <span style={{ color: "#256DE9", fontSize: 8, fontWeight: 700, opacity: 0.7 }}>{stat.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Session */}
        <div className="px-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold" style={{ fontSize: 17, color: c.text }}>Featured Session</h2>
            <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#256DE9" }}>
              View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#256DE9" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <motion.div
            whileTap={{ scale: 0.99 }}
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            style={{ height: 195 }}
            onClick={() => navigate("/exercises/featured")}
          >
            <img src="https://images.unsplash.com/photo-1764314359427-6e685ce5b719?w=800&q=80" alt="Featured" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,9,15,0.95) 0%, rgba(7,9,15,0.3) 60%, transparent 100%)" }} />
            <div className="absolute top-4 left-4">
              <span className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider" style={{ background: "#256DE9" }}>
                📷 VR SESSION
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-16">
              <h3 className="text-white mb-1.5" style={{ fontSize: 19, fontWeight: 800 }}>Post-Sprint Recovery</h3>
              <div className="flex items-center gap-3">
                <span className="text-[#94A3B8] text-sm">⏱ 24 mins</span>
                <span className="w-1 h-1 rounded-full bg-[#475569]" />
                <span className="text-[#94A3B8] text-sm">Camera Tracking</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setInstructionsExId("featured"); }}
              className="absolute right-4 bottom-4 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#256DE9", boxShadow: "0 8px 24px rgba(37,109,233,0.5)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5L19 12L8 19V5Z" /></svg>
            </button>
          </motion.div>
        </div>

        {/* Recommended by goal */}
        <div className="px-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-bold" style={{ fontSize: 17, color: c.text }}>For You</h2>
              <p className="text-[10px] font-semibold" style={{ color: "#256DE9" }}>
                Based on: {user.goal || "Recovery & Performance"}
              </p>
            </div>
            <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#256DE9" }}>
              See All <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#256DE9" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="space-y-3">
            {recommended.map((ex, idx) => {
              const ic = intensityColors[ex.intensity];
              return (
                <motion.div
                  key={ex.id + idx}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/exercises/${ex.id}`)}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
                >
                  <div className="w-[78px] h-[72px] rounded-xl overflow-hidden shrink-0">
                    <img src={ex.img} alt={ex.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "#256DE9" }}>{ex.category}</span>
                    <h3 className="font-bold text-sm truncate" style={{ color: c.text }}>{ex.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: c.textMuted }}>⏱ {ex.duration}</span>
                      <span className="text-xs" style={{ color: c.textMuted }}>•</span>
                      <span className="text-xs" style={{ color: c.textMuted }}>📷 VR</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: ic.bg, color: ic.text }}>{ex.intensity}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setInstructionsExId(ex.id); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "#256DE9" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5L19 12L8 19V5Z" /></svg>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="px-5 mb-2">
          <div className="p-4 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold" style={{ fontSize: 15, color: c.text }}>How are you feeling today?</h2>
              {todayMood && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: c.accentBg, color: "#256DE9" }}>LOGGED</span>
              )}
            </div>
            <div className="flex justify-between">
              {moods.map((mood) => (
                <motion.button key={mood.value} whileTap={{ scale: 0.9 }} onClick={() => setTodayMood(mood.value)} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                    style={todayMood === mood.value
                      ? { background: mood.color + "22", border: `2px solid ${mood.color}`, boxShadow: `0 4px 12px ${mood.color}44` }
                      : { background: c.secondaryCard, border: `1.5px solid ${c.divider}` }}
                  >
                    <span style={{ fontSize: 20 }}>{mood.emoji}</span>
                  </div>
                  <span className="text-[9px] font-semibold" style={{ color: todayMood === mood.value ? mood.color : c.textMuted }}>{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}