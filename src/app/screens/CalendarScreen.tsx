import { useState, useMemo, useEffect } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { useApp, useColors } from "../context/AppContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

const workoutDayData: Record<number, { type: string; color: string; title: string; exId: string }> = {
  1:  { type: "Strength",    color: "#A855F7", title: "Lower Body Blast",  exId: "2" },
  3:  { type: "Cardio",      color: "#256DE9", title: "Morning HIIT",      exId: "1" },
  5:  { type: "Recovery",    color: "#22C55E", title: "Sprint Recovery",   exId: "featured" },
  8:  { type: "Strength",    color: "#A855F7", title: "Upper Body Push",   exId: "2" },
  10: { type: "HIIT",        color: "#F97316", title: "Sprint Intervals",  exId: "1" },
  12: { type: "Flexibility", color: "#EAB308", title: "Flexibility Flow",  exId: "featured" },
  14: { type: "Recovery",    color: "#22C55E", title: "Active Recovery",   exId: "featured" },
  15: { type: "Cardio",      color: "#256DE9", title: "Aqua Training",     exId: "1" },
  17: { type: "Strength",    color: "#A855F7", title: "Core Power",        exId: "2" },
  19: { type: "HIIT",        color: "#F97316", title: "Morning HIIT",      exId: "1" },
  21: { type: "Recovery",    color: "#22C55E", title: "Yoga Flow",         exId: "featured" },
  22: { type: "Strength",    color: "#A855F7", title: "Lower Body",        exId: "2" },
  24: { type: "Cardio",      color: "#256DE9", title: "Bike Sprint",       exId: "1" },
  26: { type: "HIIT",        color: "#F97316", title: "Tabata",            exId: "1" },
  28: { type: "Flexibility", color: "#EAB308", title: "Stretch Flow",      exId: "featured" },
  30: { type: "Strength",    color: "#A855F7", title: "Full Body",         exId: "2" },
};

const categoryIcons: Record<string, ReactElement> = {
  Cardio: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Strength: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 6.5H4C3.45 6.5 3 6.95 3 7.5v9C3 17.05 3.45 17.5 4 17.5h2.5M17.5 6.5H20c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1h-2.5M6.5 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="6.5" cy="12" r="2.5" fill="currentColor" />
      <circle cx="17.5" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
  Recovery: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 14 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  ),
  HIIT: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),
  Flexibility: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 11c2-2 5-2 7 0s5 2 7 0M8 21l4-7 4 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  All: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9H21M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

const categories = ["All", "Cardio", "Strength", "Recovery", "HIIT", "Flexibility"];
const catColors: Record<string, string> = {
  All: "#256DE9", Cardio: "#256DE9", Strength: "#A855F7",
  Recovery: "#22C55E", HIIT: "#F97316", Flexibility: "#EAB308",
};

export default function CalendarScreen() {
  const navigate = useNavigate();
  const { sessions, addNotification } = useApp();
  const c = useColors();
  const [selectedDay, setSelectedDay] = useState(1);
  const [month] = useState(4); // May
  const [selectedCat, setSelectedCat] = useState("All");
  const [showAddWorkout, setShowAddWorkout] = useState(false);

  const firstDay = new Date(2026, month, 1).getDay();
  const daysInMonth = new Date(2026, month + 1, 0).getDate();
  const calCells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    const d = i - firstDay + 1;
    return d > 0 ? d : null;
  });

  // Which sessions days have workout + filter by category
  const visibleDays = useMemo(() => {
    const result: Record<number, typeof workoutDayData[0]> = {};
    for (const [dayStr, data] of Object.entries(workoutDayData)) {
      const day = parseInt(dayStr);
      if (selectedCat === "All" || data.type === selectedCat) {
        result[day] = data;
      }
    }
    return result;
  }, [selectedCat]);

  const now2 = new Date();
  const TODAY_DAY = now2.getMonth() === 4 && now2.getFullYear() === 2026 ? now2.getDate() : 3;

  const upcoming = useMemo(() => {
    const durations = ["45 min", "52 min", "24 min", "38 min", "30 min", "40 min"];
    const times   = ["6:00 PM", "7:30 AM", "5:00 PM", "8:00 AM", "4:00 PM", "6:30 AM"];
    const results: { id: string; date: string; title: string; type: string; duration: string; color: string; exId: string }[] = [];

    const tryAddDay = (d: number, i: number) => {
      const wd = workoutDayData[d];
      if (!wd) return;
      if (selectedCat !== "All" && wd.type !== selectedCat) return;
      const diff = d - TODAY_DAY;
      let dateLabel: string;
      if (diff === 0) dateLabel = `Today • ${times[i % times.length]}`;
      else if (diff === 1) dateLabel = `Tomorrow • ${times[i % times.length]}`;
      else if (diff < 0) dateLabel = `May ${d} • ${times[i % times.length]} (past)`;
      else dateLabel = `May ${d} • ${times[i % times.length]}`;
      results.push({ id: String(d), date: dateLabel, title: wd.title, type: wd.type, duration: durations[i % durations.length], color: wd.color, exId: wd.exId });
    };

    // Start from selectedDay forward
    let i = 0;
    for (let d = selectedDay; d <= daysInMonth && results.length < 3; d++) {
      tryAddDay(d, i);
      if (workoutDayData[d]) i++;
    }
    // If still need more, wrap from today
    if (results.length < 3) {
      for (let d = TODAY_DAY; d < selectedDay && results.length < 3; d++) {
        tryAddDay(d, i);
        if (workoutDayData[d]) i++;
      }
    }
    return results;
  }, [selectedDay, selectedCat, daysInMonth]);

  // Compute this month stats from sessions
  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === 4 && d.getFullYear() === 2026;
  });
  const completedDays = new Set(thisMonthSessions.map(s => new Date(s.date).getDate())).size;

  // ── Time helpers ─────────────────────────────────────────────────────────
  const parseTimeStr = (timeStr: string): { h: number; m: number } | null => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return { h, m };
  };

  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  const isSessionFuture = (day: number, timeStr: string): boolean => {
    if (day > TODAY_DAY) return true;
    if (day < TODAY_DAY) return false;
    const t = parseTimeStr(timeStr);
    if (!t) return false;
    return t.h > currentH || (t.h === currentH && t.m > currentM);
  };

  // Extract time from a dateLabel string like "Today • 6:00 PM" or "May 3 • 7:30 AM"
  const extractTime = (dateLabel: string): string => {
    const match = dateLabel.match(/(\d+:\d+\s*(?:AM|PM))/i);
    return match ? match[1] : "";
  };

  // ── Push notification scheduling ─────────────────────────────────────────
  useEffect(() => {
    if (!("Notification" in window)) return;
    const scheduleNotif = async () => {
      let perm = Notification.permission;
      if (perm === "default") perm = await Notification.requestPermission();
      if (perm !== "granted") return;

      const timesArr = ["6:00 PM", "7:30 AM", "5:00 PM", "8:00 AM", "4:00 PM", "6:30 AM"];
      let ti = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];

      for (const [dayStr, wd] of Object.entries(workoutDayData)) {
        const day = parseInt(dayStr);
        const timeStr = timesArr[ti % timesArr.length];
        ti++;
        if (!isSessionFuture(day, timeStr)) continue;

        const t = parseTimeStr(timeStr);
        if (!t) continue;

        // Schedule 30-min-before notification
        const sessionMs = new Date(2026, 4, day, t.h, t.m, 0).getTime();
        const notifMs = sessionMs - 30 * 60 * 1000;
        const delay = notifMs - Date.now();
        if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
          const timer = setTimeout(() => {
            addNotification({
              type: "reminder",
              title: "Session in 30 minutes! 🏋️",
              message: `${wd.title} starts at ${timeStr}. Get ready!`,
            });
            new Notification("REHAB X – Session Soon", {
              body: `${wd.title} starts at ${timeStr}. Get ready!`,
              icon: "/logo.png",
            });
          }, delay);
          timers.push(timer);
        }
      }
      return () => timers.forEach(clearTimeout);
    };
    const cleanup = scheduleNotif();
    return () => { cleanup.then((fn) => fn && fn()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="flex items-center justify-between px-5 mb-1">
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
            <div>
              <h1 className="text-white font-black" style={{ fontSize: 24 }}>Calendar</h1>
              <p className="font-semibold text-sm" style={{ color: "rgba(37,109,233,0.9)" }}>{MONTHS[month]} 2026</p>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "#256DE9", boxShadow: "0 4px 16px rgba(37,109,233,0.4)" }}
            onClick={() => setShowAddWorkout(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Workout Sheet */}
      <AnimatePresence>
        {showAddWorkout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowAddWorkout(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-5 pb-10"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: c.divider }} />
              <h3 className="font-black text-lg mb-2" style={{ color: c.text }}>Add Workout</h3>
              <p className="text-sm mb-5" style={{ color: c.textMuted }}>Choose a workout type to schedule or start now</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: "⚡", label: "HIIT", color: "#F97316", type: "HIIT" },
                  { icon: "💪", label: "Strength", color: "#A855F7", type: "Strength" },
                  { icon: "❤️", label: "Recovery", color: "#22C55E", type: "Recovery" },
                  { icon: "🏃", label: "Cardio", color: "#256DE9", type: "Cardio" },
                  { icon: "🧘", label: "Flexibility", color: "#EAB308", type: "Flexibility" },
                  { icon: "🎯", label: "Core", color: "#EC4899", type: "Core" },
                ].map((t) => (
                  <button
                    key={t.type}
                    onClick={() => { setShowAddWorkout(false); navigate("/exercises"); }}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                    style={{ background: c.secondaryCard, border: `1px solid ${c.cardBorder}` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${t.color}20` }}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: c.text }}>{t.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowAddWorkout(false); navigate("/exercises"); }}
                className="w-full py-4 rounded-2xl text-white font-bold"
                style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)", boxShadow: "0 12px 32px rgba(37,109,233,0.3)" }}
              >
                Browse All Exercises
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pb-[110px] px-5 space-y-4 pt-4">
        {/* Calendar */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
        >
          <div className="grid grid-cols-7 px-3 pt-4 pb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold" style={{ color: c.textMuted }}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
            {calCells.map((day, i) => {
              if (!day) return <div key={i} />;
              const isToday = day === 1;
              const isSelected = day === selectedDay;
              const wData = visibleDays[day];
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center py-1.5 rounded-xl transition-all"
                  style={{
                    background: isSelected ? "#256DE9" : isToday && !isSelected ? c.accentBg : "transparent",
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: isSelected ? "white" : isToday ? "#256DE9" : c.textSub }}
                  >
                    {day}
                  </span>
                  {wData && (
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{ background: isSelected ? "white" : wData.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filters (icon-style like exercise page) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCat === cat;
            const col = catColors[cat];
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedCat(cat)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl shrink-0 transition-all"
                style={
                  active
                    ? { background: col, color: "white", boxShadow: `0 6px 16px ${col}44` }
                    : { background: c.card, color: c.textMuted, border: `1px solid ${c.cardBorder}` }
                }
              >
                <span style={{ color: active ? "white" : col }}>{categoryIcons[cat]}</span>
                <span className="text-xs font-semibold">{cat}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected day detail */}
        {visibleDays[selectedDay] && (() => {
          const wd = visibleDays[selectedDay];
          return (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{ background: c.card, border: `1px solid ${wd.color}30`, boxShadow: c.shadow }}
            >
              {(() => {
                const sessionTimeKey = Object.entries(workoutDayData).findIndex(([d]) => parseInt(d) === selectedDay);
                const timesArr = ["6:00 PM", "7:30 AM", "5:00 PM", "8:00 AM", "4:00 PM", "6:30 AM"];
                const sessionTime = timesArr[Math.max(0, sessionTimeKey) % timesArr.length];
                const future = isSessionFuture(selectedDay, sessionTime);
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${wd.color}20` }}
                      >
                        <span style={{ color: wd.color }}>{categoryIcons[wd.type]}</span>
                      </div>
                      <div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider block"
                          style={{ color: wd.color }}
                        >
                          {wd.type} • {sessionTime}
                        </span>
                        <p className="font-bold text-sm" style={{ color: c.text }}>{wd.title}</p>
                        {future && (
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: c.textMuted }}>
                            🔒 Not yet available
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { if (!future) navigate(`/exercises/${wd.exId}`); }}
                      disabled={future}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity"
                      style={{ background: future ? c.secondaryCard : "#256DE9", border: future ? `1px solid ${c.cardBorder}` : "none", opacity: future ? 0.6 : 1, cursor: future ? "not-allowed" : "pointer" }}
                    >
                      {future ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="11" width="14" height="10" rx="2" fill={c.textMuted} />
                          <path d="M8 11V7C8 5.34 9.34 4 11 4H13C14.66 4 16 5.34 16 7V11" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5L19 12L8 19V5Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          );
        })()}

        {/* Upcoming sessions */}
        <div>
          <h3 className="font-bold mb-3" style={{ fontSize: 15, color: c.text }}>
            Upcoming Sessions
          </h3>
          <div className="space-y-3">
            {upcoming.map((session, idx) => {
              const sessionTimeStr = extractTime(session.date);
              const future = isSessionFuture(parseInt(session.id), sessionTimeStr);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => { if (!future) navigate(`/exercises/${session.exId}`); }}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: c.card, border: `1px solid ${future ? c.cardBorder : session.color + "30"}`, boxShadow: c.shadow, cursor: future ? "default" : "pointer" }}
                >
                  <div className="w-1 h-12 rounded-full shrink-0" style={{ background: future ? c.divider : session.color }} />
                  <div className="flex-1">
                    <p className="text-xs mb-0.5" style={{ color: c.textMuted }}>{session.date}</p>
                    <p className="font-bold text-sm" style={{ color: future ? c.textSub : c.text }}>{session.title}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: future ? c.textMuted : session.color }}>
                      {session.type} • {session.duration}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: future ? c.secondaryCard : `${session.color}15`, border: `1px solid ${future ? c.cardBorder : session.color + "30"}` }}
                  >
                    {future ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="11" width="14" height="10" rx="2" fill={c.textMuted} fillOpacity="0.6" />
                        <path d="M8 11V7C8 5.34 9.34 4 11 4H13C14.66 4 16 5.34 16 7V11" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5L19 12L8 19V5Z" fill={session.color} />
                      </svg>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Monthly overview */}
        <div
          className="rounded-2xl p-4"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: c.text }}>
            May Overview
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Planned",   value: "20", color: "#256DE9" },
              { label: "Completed", value: String(completedDays || 12), color: "#22C55E" },
              { label: "Skipped",   value: "3",  color: "#EF4444" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-black text-xl" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: c.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Cardio", color: "#256DE9" },
            { label: "Strength", color: "#A855F7" },
            { label: "Recovery", color: "#22C55E" },
            { label: "HIIT", color: "#F97316" },
            { label: "Flexibility", color: "#EAB308" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-xs font-medium" style={{ color: c.textMuted }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}