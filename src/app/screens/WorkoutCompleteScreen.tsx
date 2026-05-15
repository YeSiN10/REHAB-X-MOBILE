import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { useApp, useColors } from "../context/AppContext";
import { useT } from "../i18n";

export default function WorkoutCompleteScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { sessions, addSession } = useApp();
  const c = useColors();
  const t = useT();
  const [confetti, setConfetti] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    setConfetti(true);
    const t = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Get real stats from the last session logged
  const lastSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions[sessions.length - 1];
  }, [sessions]);

  // If no session was logged (navigated directly), use estimated stats
  const stats = [
    {
      label: t.workoutComplete.duration,
      value: lastSession ? `${lastSession.duration}:00` : "28:45",
      unit: t.workoutComplete.minSec,
      icon: "⏱",
      color: c.accent,
      bg: `rgba(${c.accentRgb},0.08)`,
    },
    {
      label: t.workoutComplete.calories,
      value: lastSession ? String(lastSession.calories) : "312",
      unit: t.workoutComplete.kcalBurned,
      icon: "🔥",
      color: "#F97316",
      bg: "rgba(249,115,22,0.08)",
    },
    {
      label: t.workoutComplete.exercises,
      value: "5",
      unit: t.workoutComplete.completed,
      icon: "✅",
      color: "#22C55E",
      bg: "rgba(34,197,94,0.08)",
    },
    {
      label: t.workoutComplete.formScore,
      value: "92%",
      unit: t.workoutComplete.accuracy,
      icon: "🎯",
      color: "#A855F7",
      bg: "rgba(168,85,247,0.08)",
    },
  ];

  // Distinct days this week where at least 1 session was logged
  const thisWeekCount = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
    const uniqueDays = new Set(
      sessions
        .filter((s) => {
          const [y, m, d] = s.date.split("-").map(Number);
          const sessionDay = new Date(y, m - 1, d);
          return sessionDay >= startOfWeek;
        })
        .map((s) => s.date)
    );
    return uniqueDays.size;
  }, [sessions]);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>

      {/* Confetti */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                background: [c.accent, "#22C55E", "#F97316", "#A855F7", "#EAB308"][i % 5],
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ y: 900, opacity: [1, 1, 0], rotate: Math.random() * 720 - 360, x: Math.random() * 100 - 50 }}
              transition={{ duration: 2.5 + Math.random(), delay: Math.random() * 0.8 }}
            />
          ))}
        </div>
      )}

      {/* Top decoration */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: c.headerGradient,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          paddingTop: 56,
          paddingBottom: 28,
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(34,197,94,0.25) 0%, transparent 65%)" }} />

        {/* Back */}
        <button
          onClick={() => navigate("/home")}
          className="absolute top-14 left-5 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Trophy + text */}
        <div className="flex flex-col items-center text-center px-6 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="w-[90px] h-[90px] rounded-[30px] flex items-center justify-center mb-4"
            style={{ background: "rgba(34,197,94,0.2)", border: "2px solid rgba(34,197,94,0.4)", boxShadow: "0 0 40px rgba(34,197,94,0.25)" }}
          >
            <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
              <path d="M15 5H45V30C45 39.941 38.284 48 30 48C21.716 48 15 39.941 15 30V5Z" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="2" />
              <path d="M15 12H5C5 12 5 27 15 30" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
              <path d="M45 12H55C55 12 55 27 45 30" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 48H38M30 48V55M20 55H40" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 25L28 31L38 21" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="inline-flex px-4 py-1.5 rounded-full mb-2.5" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <span className="text-[#22C55E] text-[11px] font-bold tracking-[2px]">🎉 WORKOUT COMPLETE</span>
            </div>
            <h1 className="text-white font-black mb-1.5" style={{ fontSize: 26 }}>Crushed It!</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              Consistency is the key — great job finishing!
            </p>
          </motion.div>

          {/* XP badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-2xl"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#A855F7">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="font-bold text-sm" style={{ color: "#A855F7" }}>+120 XP Earned</span>
          </motion.div>
        </div>
      </div>

      {/* Scroll content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <span style={{ fontSize: 16 }}>{stat.icon}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: c.textMuted }}>{stat.label}</span>
              </div>
              <div className="font-black" style={{ fontSize: 22, color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{stat.unit}</div>
            </div>
          ))}
        </motion.div>

        {/* Weekly streak card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="p-4 rounded-2xl mb-5 flex items-center gap-4"
          style={{ background: c.accentBg, border: `1px solid rgba(${c.accentRgb},0.2)`, boxShadow: c.shadow }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: c.accent }}>
            <span style={{ fontSize: 24 }}>⚡</span>
          </div>
          <div className="flex-1">
            <p className="font-black" style={{ color: c.text, fontSize: 17 }}>{thisWeekCount} Sessions This Week</p>
            <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
              {thisWeekCount >= 5 ? "Weekly goal achieved! You're on fire! 🔥" : `${5 - thisWeekCount} more to reach your weekly goal`}
            </p>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <div key={d} className="flex-1 h-1.5 rounded-full" style={{ background: d <= thisWeekCount ? c.accent : c.secondaryCard }} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="p-4 rounded-2xl mb-6 flex items-start gap-3"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
        >
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <p className="font-bold text-sm mb-0.5" style={{ color: c.text }}>Recovery Tip</p>
            <p className="text-xs leading-relaxed" style={{ color: c.textSub }}>
              Drink 500ml of water now and aim for 7–8 hours of sleep tonight. Your muscles need protein within 30 minutes for optimal recovery.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-8 pt-2 shrink-0 space-y-3" style={{ borderTop: `1px solid ${c.divider}` }}>
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/home")}
          className="w-full py-4 rounded-2xl text-white font-bold"
          style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`, boxShadow: `0 16px 40px rgba(${c.accentRgb},0.3)`, fontSize: 16 }}
        >
          {t.workoutComplete.backToHome}
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/progress")}
          className="w-full py-4 rounded-2xl font-bold text-sm"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.textSub }}
        >
          {t.workoutComplete.viewProgress}
        </motion.button>
      </div>
    </div>
  );
}
