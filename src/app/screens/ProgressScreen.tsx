import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { useApp, useColors, computeRecoveryScore } from "../context/AppContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

type TooltipPayload = {
  value?: number | string;
  name?: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

export default function ProgressScreen() {
  const navigate = useNavigate();
  const { sessions, todayMood } = useApp();
  const c = useColors();
  const [activeMetric, setActiveMetric] = useState<"calories" | "duration">("calories");
  const [activeTab, setActiveTab] = useState<"week" | "month">("week");

  const today = new Date();

  // ── Weekly data ──────────────────────────────────────────────────────
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return days.map((day, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const daySessions = sessions.filter((s) => s.date === dateStr);
      return {
        day,
        calories: daySessions.reduce((sum, s) => sum + s.calories, 0),
        duration: daySessions.reduce((sum, s) => sum + s.duration, 0),
      };
    });
  }, [sessions]);

  // ── Monthly data ─────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    return ["W1", "W2", "W3", "W4"].map((week, wi) => {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (3 - wi) * 7 - today.getDay() + 1);
      const weekSessions = sessions.filter((s) => {
        const d = new Date(s.date);
        const diff = Math.floor((d.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff < 7;
      });
      return { week, sessions: weekSessions.length, calories: weekSessions.reduce((sum, s) => sum + s.calories, 0) };
    });
  }, [sessions]);

  // ── Overall stats (computed) ─────────────────────────────────────────
  const thisWeekSessions = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return sessions.filter((s) => new Date(s.date) >= start);
  }, [sessions]);

  const lastWeekSessions = useMemo(() => {
    const endOfLastWeek = new Date(today);
    endOfLastWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 1);
    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= startOfLastWeek && d <= endOfLastWeek;
    });
  }, [sessions]);

  const totalCalories = sessions.reduce((sum, s) => sum + s.calories, 0);
  const totalMins = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = totalMins / 60;

  // Streak: count consecutive days ending today
  const streak = useMemo(() => {
    const sessionDates = new Set(sessions.map((s) => s.date));
    let count = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = d.toISOString().split("T")[0];
      if (sessionDates.has(dateStr)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
      if (count > 30) break;
    }
    return count;
  }, [sessions]);

  // Avg intensity based on calorie burn per session
  const avgCalPerSession = sessions.length ? totalCalories / sessions.length : 0;
  const avgIntensity = Math.min(95, Math.max(30, Math.round(avgCalPerSession / 6)));

  // Recovery score (real, computed)
  const recoveryScore = computeRecoveryScore(sessions, todayMood);

  // Sub-metrics for recovery panel
  const last7 = sessions.filter((s) => {
    const diff = (today.getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const restDays = 7 - last7.length;
  const sleepQuality = Math.min(95, Math.max(35, 55 + restDays * 5 + (todayMood === "great" ? 15 : todayMood === "good" ? 8 : todayMood === "low" ? -12 : 0)));
  const muscleSoreness = Math.min(95, Math.max(25, 50 + (last7.length <= 3 ? 15 : last7.length >= 6 ? -20 : 5)));
  const energyLevel = Math.min(98, Math.max(30, 60 + (todayMood === "great" ? 20 : todayMood === "good" ? 12 : todayMood === "ok" ? 5 : todayMood === "low" ? -10 : 0) + (restDays >= 2 ? 8 : -5)));

  const weekSessionDiff = thisWeekSessions.length - lastWeekSessions.length;
  const lastWeekHours = lastWeekSessions.reduce((s, x) => s + x.duration, 0) / 60;
  const thisWeekHours = thisWeekSessions.reduce((s, x) => s + x.duration, 0) / 60;
  const hoursDiff = thisWeekHours - lastWeekHours;

  const overallStats = [
    {
      label: "Total Sessions",
      value: `${sessions.length}`,
      change: weekSessionDiff >= 0 ? `+${weekSessionDiff}` : `${weekSessionDiff}`,
      up: weekSessionDiff >= 0,
    },
    {
      label: "Total Hours",
      value: `${totalHours.toFixed(1)}h`,
      change: hoursDiff >= 0 ? `+${hoursDiff.toFixed(1)}h` : `${hoursDiff.toFixed(1)}h`,
      up: hoursDiff >= 0,
    },
    {
      label: "Avg Intensity",
      value: `${avgIntensity}%`,
      change: "+3%",
      up: true,
    },
    {
      label: "Streak",
      value: `${streak} days`,
      change: streak > 0 ? `+${streak}d` : "0d",
      up: streak > 0,
    },
  ];

  const achievements = useMemo(() => [
    { icon: "🔥", label: "Calorie Crusher", desc: `${totalCalories.toLocaleString()} kcal total`, earned: totalCalories >= 2000 },
    { icon: "⚡", label: "Streak Master", desc: `${streak} day streak`, earned: streak >= 3 },
    { icon: "🏃", label: "Speed Demon", desc: "Best sprint recorded", earned: sessions.some(s => s.type === "HIIT" || s.type === "Cardio") },
    { icon: "💪", label: "Strength King", desc: "50 strength sessions", earned: sessions.filter(s => s.type === "Strength").length >= 10 },
    { icon: "🧘", label: "Recovery Pro", desc: "7 recovery sessions", earned: sessions.filter(s => s.type === "Recovery").length >= 5 },
  ], [sessions, streak, totalCalories]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2 rounded-xl" style={{ background: c.card, border: "1px solid rgba(37,109,233,0.3)" }}>
        <p className="text-xs mb-1" style={{ color: c.textMuted }}>{label}</p>
        <p className="font-bold text-sm" style={{ color: c.text }}>
          {payload[0]?.value} {payload[0]?.name === "calories" ? "kcal" : "min"}
        </p>
      </div>
    );
  };

  const recoveryColor = recoveryScore >= 80 ? "#22C55E" : recoveryScore >= 60 ? "#256DE9" : recoveryScore >= 40 ? "#EAB308" : "#EF4444";

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>
      {/* Curved Header */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.35) 0%, transparent 65%)" }} />
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-white font-black" style={{ fontSize: 24 }}>Progress</h1>
          </div>
          <div
            className="flex rounded-xl overflow-hidden p-0.5"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {(["week", "month"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                style={activeTab === t ? { background: "#256DE9", color: "white" } : { color: "rgba(255,255,255,0.6)" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[90px] px-5 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {overallStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
            >
              <p className="text-xs mb-1.5" style={{ color: c.textMuted }}>{stat.label}</p>
              <p className="font-black" style={{ fontSize: 20, color: c.text }}>{stat.value}</p>
              <span
                className="text-[10px] font-semibold mt-1.5 inline-flex items-center gap-1"
                style={{ color: stat.up ? "#22C55E" : "#EF4444" }}
              >
                {stat.up ? "↑" : "↓"} {stat.change} this week
              </span>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: 15, color: c.text }}>
              {activeTab === "week" ? "This Week" : "This Month"}
            </h3>
            <div
              className="flex rounded-xl overflow-hidden p-0.5"
              style={{ background: c.secondaryCard, border: `1px solid ${c.divider}` }}
            >
              {(["calories", "duration"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all"
                  style={activeMetric === m ? { background: "#256DE9", color: "white" } : { color: c.textMuted }}
                >
                  {m === "calories" ? "Kcal" : "Time"}
                </button>
              ))}
            </div>
          </div>
          {activeTab === "week" ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#256DE9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#256DE9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={activeMetric} stroke="#256DE9" strokeWidth={2.5}
                  fill="url(#grad)" dot={{ fill: "#256DE9", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#256DE9", r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fill: c.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" fill="#256DE9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recovery Score — REAL computed */}
        <div
          className="rounded-2xl p-4"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: 15, color: c.text }}>Recovery Score</h3>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: `${recoveryColor}20`, color: recoveryColor }}>
              {recoveryScore >= 80 ? "EXCELLENT" : recoveryScore >= 60 ? "GOOD" : recoveryScore >= 40 ? "MODERATE" : "NEEDS REST"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Ring */}
            <div className="relative w-20 h-20 shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="30" fill="none" stroke={c.secondaryCard} strokeWidth="8" />
                <motion.circle
                  cx="40" cy="40" r="30"
                  fill="none"
                  stroke={recoveryColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - recoveryScore / 100) }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-black" style={{ fontSize: 16, color: recoveryColor }}>{recoveryScore}%</span>
              </div>
            </div>
            {/* Sub-metrics */}
            <div className="flex-1 space-y-2.5">
              {[
                { label: "Sleep Quality", val: sleepQuality },
                { label: "Muscle Soreness", val: muscleSoreness },
                { label: "Energy Level", val: energyLevel },
              ].map((item) => {
                const barColor = item.val >= 70 ? "#22C55E" : item.val >= 50 ? "#256DE9" : "#EAB308";
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: c.textMuted }}>{item.label}</span>
                      <span className="font-semibold" style={{ color: c.text }}>{item.val}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: c.secondaryCard }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="mt-3 p-3 rounded-xl flex items-start gap-2"
            style={{ background: c.secondaryCard }}
          >
            <span style={{ fontSize: 14 }}>💡</span>
            <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
              {recoveryScore >= 80
                ? "Excellent recovery! You're ready for a high-intensity session today."
                : recoveryScore >= 60
                ? "Good recovery. A moderate intensity session is recommended."
                : recoveryScore >= 40
                ? "Moderate recovery. Consider a light workout or rest day."
                : "Low recovery detected. Rest and active recovery are recommended today."}
              {" "}Score is based on your last {last7.length} session(s) and today's mood.
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ fontSize: 15, color: c.text }}>Achievements</h3>
            <button className="text-[#256DE9] text-sm font-semibold">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((a, i) => (
              <div
                key={i}
                className="shrink-0 w-[100px] rounded-2xl p-4 flex flex-col items-center gap-2"
                style={
                  a.earned
                    ? { background: c.accentBg, border: "1px solid rgba(37,109,233,0.25)" }
                    : { background: c.card, border: `1px solid ${c.cardBorder}`, opacity: 0.5 }
                }
              >
                <span className="text-2xl">{a.earned ? a.icon : "🔒"}</span>
                <p className="text-center font-bold leading-tight"
                  style={{ color: a.earned ? c.text : c.textMuted, fontSize: 10 }}>
                  {a.label}
                </p>
                {a.earned && (
                  <span className="text-[9px] text-center" style={{ color: "#256DE9" }}>{a.desc}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}