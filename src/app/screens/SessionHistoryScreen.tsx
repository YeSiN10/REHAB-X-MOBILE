import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BottomNav } from "../components/BottomNav";

const sessions = [
  {
    id: "1",
    title: "Morning HIIT",
    date: "Today, 7:30 AM",
    duration: "45 min",
    calories: 420,
    type: "Cardio",
    color: "#256DE9",
    rating: 5,
    sets: 4,
    img: "https://images.unsplash.com/photo-1729281008855-71e2506761c0?w=200&q=80",
  },
  {
    id: "2",
    title: "Lower Body Blast",
    date: "Yesterday, 6:00 PM",
    duration: "52 min",
    calories: 510,
    type: "Strength",
    color: "#A855F7",
    rating: 4,
    sets: 4,
    img: "https://images.unsplash.com/photo-1597376833295-40a54d5e69fc?w=200&q=80",
  },
  {
    id: "3",
    title: "Sprint Recovery",
    date: "Apr 29, 8:00 AM",
    duration: "24 min",
    calories: 180,
    type: "Recovery",
    color: "#22C55E",
    rating: 4,
    sets: 3,
    img: "https://images.unsplash.com/photo-1545463913-5083aa7359a6?w=200&q=80",
  },
  {
    id: "4",
    title: "Aqua Training",
    date: "Apr 28, 5:30 PM",
    duration: "60 min",
    calories: 480,
    type: "Cardio",
    color: "#256DE9",
    rating: 5,
    sets: 5,
    img: "https://images.unsplash.com/photo-1774009304081-ca87dd2f5d99?w=200&q=80",
  },
  {
    id: "5",
    title: "Core Power",
    date: "Apr 27, 7:00 AM",
    duration: "35 min",
    calories: 260,
    type: "Core",
    color: "#F97316",
    rating: 3,
    sets: 3,
    img: "https://images.unsplash.com/photo-1638820870229-00003edce192?w=200&q=80",
  },
  {
    id: "6",
    title: "Flexibility Flow",
    date: "Apr 26, 9:00 AM",
    duration: "30 min",
    calories: 180,
    type: "Flexibility",
    color: "#EAB308",
    rating: 5,
    sets: 2,
    img: "https://images.unsplash.com/photo-1769416945759-4660fd121172?w=200&q=80",
  },
];

const filters = ["All", "Cardio", "Strength", "Recovery", "Core", "Flexibility"];

export default function SessionHistoryScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const filtered = sessions.filter((s) => filter === "All" || s.type === filter);

  const totalStats = {
    sessions: filtered.length,
    calories: filtered.reduce((a, s) => a + s.calories, 0),
    time: filtered.reduce((a, s) => a + parseInt(s.duration), 0),
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: "#07090F" }}>
      {/* Curved Header */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.35) 0%, transparent 65%)" }} />
        <div className="flex items-center justify-between px-5 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-black" style={{ fontSize: 24 }}>History</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Past Activities</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2.5 px-5 mb-2">
          {[
            { label: "Sessions", value: totalStats.sessions },
            { label: "Calories", value: `${totalStats.calories.toLocaleString()} kcal` },
            { label: "Total Time", value: `${totalStats.time} min` },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: "#111929", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="text-white font-black" style={{ fontSize: 16 }}>
                {s.value}
              </div>
              <div className="text-[#475569] text-[10px] mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 px-5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={
                filter === f
                  ? { background: "#256DE9", color: "white", boxShadow: "0 6px 16px rgba(37,109,233,0.35)" }
                  : { background: "#111929", color: "#475569", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto pb-[90px] px-5 pt-2 space-y-3">
        {filtered.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/exercises/${session.id}`)}
            className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
            style={{ background: "#111929", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Thumbnail */}
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 relative">
              <img src={session.img} alt={session.title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: session.color }}
                >
                  {session.type}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm truncate">{session.title}</h3>
              <p className="text-[#475569] text-xs mt-0.5">{session.date}</p>

              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[#64748B] text-[10px] flex items-center gap-1">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#64748B" strokeWidth="2" />
                    <path d="M12 7V12L15 15" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {session.duration}
                </span>
                <span className="text-[#64748B] text-[10px]">•</span>
                <span className="text-[#64748B] text-[10px]">{session.calories} kcal</span>
                <span className="text-[#64748B] text-[10px]">•</span>
                <span className="text-[#64748B] text-[10px]">{session.sets} sets</span>
              </div>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill={s <= session.rating ? "#EAB308" : "#1A2640"}
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
              </div>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#0F1520" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}