import { useState, useMemo, useEffect } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
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
  const realNow = new Date();
  const realTodayDay = realNow.getDate();
  const realTodayMonth = realNow.getMonth();
  const realTodayYear = realNow.getFullYear();

  const [selectedDay, setSelectedDay] = useState(realTodayDay);
  const [month, setMonth] = useState(realTodayMonth);
  const [year, setYear] = useState(realTodayYear);
  const [selectedCat, setSelectedCat] = useState("All");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // ── Done-days persistence ─────────────────────────────────────────────────
  const [doneDays, setDoneDays] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("rehabx_calendar_done");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const doneKey = (d: number) => `${year}-${month}-${d}`;
  const isDone  = (d: number) => doneDays.has(doneKey(d));

  const markDone = (d: number) => {
    setDoneDays(prev => {
      const next = new Set(prev);
      next.add(doneKey(d));
      try { localStorage.setItem("rehabx_calendar_done", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const TODAY_DAY = year === realTodayYear && month === realTodayMonth ? realTodayDay : -1;
  const isPastMonth   = year < realTodayYear || (year === realTodayYear && month < realTodayMonth);
  const isFutureMonth = year > realTodayYear || (year === realTodayYear && month > realTodayMonth);

  // Past months: all workout days are auto-completed (already gone)
  const isCompleted = (d: number) => isDone(d) || isPastMonth;

  const prevMonth = () => {
    setSelectedDay(1);
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(1);
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
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


  const upcoming = useMemo(() => {
    const durations = ["45 min", "52 min", "24 min", "38 min", "30 min", "40 min"];
    const times   = ["6:00 PM", "7:30 AM", "5:00 PM", "8:00 AM", "4:00 PM", "6:30 AM"];
    const results: { id: string; date: string; title: string; type: string; duration: string; color: string; exId: string }[] = [];

    let i = 0;
    // Always start from selectedDay and go forward — no wrap
    for (let d = selectedDay; d <= daysInMonth && results.length < 4; d++) {
      const wd = workoutDayData[d];
      if (!wd) continue;
      if (selectedCat !== "All" && wd.type !== selectedCat) continue;
      let dateLabel: string;
      if (TODAY_DAY !== -1) {
        // Current month — use Today / Tomorrow labels
        const diff = d - TODAY_DAY;
        if (diff === 0)      dateLabel = `Today • ${times[i % times.length]}`;
        else if (diff === 1) dateLabel = `Tomorrow • ${times[i % times.length]}`;
        else                 dateLabel = `${MONTHS[month]} ${d} • ${times[i % times.length]}`;
      } else {
        // Past or future month — just show the date
        dateLabel = `${MONTHS[month]} ${d} • ${times[i % times.length]}`;
      }
      results.push({ id: String(d), date: dateLabel, title: wd.title, type: wd.type, duration: durations[i % durations.length], color: wd.color, exId: wd.exId });
      i++;
    }
    return results;
  }, [selectedDay, selectedCat, daysInMonth, month, TODAY_DAY, isPastMonth]);

  // Compute this month stats from sessions
  const thisMonthSessions = sessions.filter(s => {
    const [y, m] = s.date.split("-").map(Number);
    return m - 1 === month && y === year;
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

  const currentH = now.getHours();
  const currentM = now.getMinutes();

  // A session is locked if: future month, future day in current month, past day in current month,
  // or today but time not yet reached. Past months are fully accessible.
  const isSessionFuture = (day: number, timeStr: string): boolean => {
    if (isFutureMonth) return true;             // future month — not yet
    if (isPastMonth)   return false;            // past month — freely accessible
    // Current month:
    if (day > TODAY_DAY) return true;           // future day
    if (day < TODAY_DAY) return true;           // past day — missed
    // Today: check real clock
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
        const sessionMs = new Date(year, month, day, t.h, t.m, 0).getTime();
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
        <div className="flex items-center justify-between px-5 mb-4">
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
            <h1 className="text-white font-black" style={{ fontSize: 24 }}>Calendar</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="font-bold" style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", minWidth: 84, textAlign: "center" }}>
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>


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
              const isToday = day === TODAY_DAY;
              const done    = isCompleted(day);
              const isPast  = !done && TODAY_DAY !== -1 && day < TODAY_DAY;
              const isSelected = day === selectedDay;
              const wData = visibleDays[day];
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center py-1.5 rounded-xl transition-all"
                  style={{
                    background: isSelected ? "#256DE9" : isToday && !isSelected ? c.accentBg : "transparent",
                    opacity: isPast && !isSelected ? 0.45 : 1,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: isSelected ? "white" : done ? "#256DE9" : isToday ? "#256DE9" : isPast ? c.textMuted : c.textSub,
                    }}
                  >
                    {day}
                  </span>
                  {wData && (
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{ background: isSelected ? "white" : done ? "#256DE9" : isPast ? c.textMuted : wData.color }}
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
          const done = isCompleted(selectedDay);
          return (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{ background: c.card, border: `1px solid ${done ? "#256DE940" : wd.color + "30"}`, boxShadow: c.shadow }}
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
                        style={{ background: done ? "#256DE920" : `${wd.color}20` }}
                      >
                        {done ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13L9 17L19 7" stroke="#256DE9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span style={{ color: wd.color }}>{categoryIcons[wd.type]}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: done ? "#256DE9" : wd.color }}>
                          {wd.type} • {sessionTime}
                        </span>
                        <p className="font-bold text-sm" style={{ color: c.text }}>{wd.title}</p>
                        {done ? (
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: "#256DE9" }}>✓ Completed</p>
                        ) : future ? (
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: c.textMuted }}>🔒 Not yet available</p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      onClick={() => { if (!future && !done) { markDone(selectedDay); navigate(`/exercises/${wd.exId}`); } }}
                      disabled={future || done}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: done ? "#256DE9" : future ? c.secondaryCard : "#256DE9",
                        border: future && !done ? `1px solid ${c.cardBorder}` : "none",
                        opacity: future ? 0.6 : 1,
                        cursor: future ? "not-allowed" : "pointer",
                      }}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : future ? (
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
              const sessionDone = isCompleted(parseInt(session.id));
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => { if (!future && !sessionDone) { markDone(parseInt(session.id)); navigate(`/exercises/${session.exId}`); } }}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{
                    background: c.card,
                    border: `1px solid ${sessionDone ? "#256DE940" : future ? c.cardBorder : session.color + "30"}`,
                    boxShadow: c.shadow,
                    cursor: future ? "default" : "pointer",
                  }}
                >
                  <div className="w-1 h-12 rounded-full shrink-0" style={{ background: sessionDone ? "#256DE9" : future ? c.divider : session.color }} />
                  <div className="flex-1">
                    <p className="text-xs mb-0.5" style={{ color: c.textMuted }}>{session.date}</p>
                    <p className="font-bold text-sm" style={{ color: future ? c.textSub : c.text }}>{session.title}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: sessionDone ? "#256DE9" : future ? c.textMuted : session.color }}>
                      {sessionDone ? "✓ Completed" : `${session.type} • ${session.duration}`}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: sessionDone ? "#256DE920" : future ? c.secondaryCard : `${session.color}15`,
                      border: `1px solid ${sessionDone ? "#256DE940" : future ? c.cardBorder : session.color + "30"}`,
                    }}
                  >
                    {sessionDone ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="#256DE9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : future ? (
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
            {MONTHS[month]} Overview
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Planned",   value: "20", color: "#256DE9" },
              { label: "Completed", value: String(isPastMonth ? Object.keys(workoutDayData).length : ([...doneDays].filter(k => k.startsWith(`${year}-${month}-`)).length || completedDays || 0)), color: "#22C55E" },
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