import { useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { useColors } from "../context/AppContext";
import { useT } from "../i18n";

const programs = [
  {
    id: "1",
    title: "Post-Injury Recovery",
    subtitle: "8-Week Program",
    desc: "Comprehensive VR rehabilitation protocol for post-injury recovery",
    sessions: 24, duration: "8 weeks", level: "All Levels",
    category: "Recovery", color: "#22C55E", progress: 45,
    img: "https://images.unsplash.com/photo-1545463913-5083aa7359a6?w=400&q=80",
    active: true,
  },
  {
    id: "2",
    title: "Athletic Performance",
    subtitle: "12-Week Program",
    desc: "Elite training system to maximize speed, strength and endurance",
    sessions: 36, duration: "12 weeks", level: "Advanced",
    category: "Performance", color: "#256DE9", progress: 0,
    img: "https://images.unsplash.com/photo-1766287453739-c3ffc3f37d05?w=400&q=80",
    active: false,
  },
  {
    id: "3",
    title: "Core Stability",
    subtitle: "4-Week Program",
    desc: "Build a rock-solid core for improved performance and injury prevention",
    sessions: 16, duration: "4 weeks", level: "Intermediate",
    category: "Strength", color: "#A855F7", progress: 0,
    img: "https://images.unsplash.com/photo-1638820870229-00003edce192?w=400&q=80",
    active: false,
  },
  {
    id: "4",
    title: "Sprint Training",
    subtitle: "6-Week Program",
    desc: "Explosive speed development for track and field athletes",
    sessions: 18, duration: "6 weeks", level: "Advanced",
    category: "Cardio", color: "#F97316", progress: 0,
    img: "https://images.unsplash.com/photo-1724763750864-9e81ee45d036?w=400&q=80",
    active: false,
  },
  {
    id: "5",
    title: "Flexibility & Mobility",
    subtitle: "3-Week Program",
    desc: "Improve range of motion and prevent injuries with daily stretching",
    sessions: 21, duration: "3 weeks", level: "Beginner",
    category: "Recovery", color: "#EAB308", progress: 0,
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    active: false,
  },
];

// Icon-style filter buttons like exercise page
const categoryFilters: { id: string; label: string; icon: ReactElement; color: string }[] = [
  {
    id: "All",
    label: "All",
    color: "#256DE9",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "Recovery",
    label: "Recovery",
    color: "#22C55E",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 14 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Performance",
    label: "Performance",
    color: "#256DE9",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
      </svg>
    ),
  },
  {
    id: "Strength",
    label: "Strength",
    color: "#A855F7",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M6.5 6.5H4C3.45 6.5 3 6.95 3 7.5v9c0 .55.45 1 1 1h2.5M17.5 6.5H20c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1h-2.5M6.5 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="6.5" cy="12" r="2.5" fill="currentColor" />
        <circle cx="17.5" cy="12" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "Cardio",
    label: "Cardio",
    color: "#F97316",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function PlansScreen() {
  const t = useT();
  const navigate = useNavigate();
  const c = useColors();
  const [selectedCat, setSelectedCat] = useState("All");

  const filtered = programs.filter(
    (p) => selectedCat === "All" || p.category === selectedCat
  );
  const activeProgram = programs.find((p) => p.active);

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
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-white font-black" style={{ fontSize: 24 }}>{t.plans.title}</h1>
          </div>
          <div
            className="px-3 py-1.5 rounded-full"
            style={{ background: "rgba(37,109,233,0.12)", border: "1px solid rgba(37,109,233,0.25)" }}
          >
            <span className="text-[#256DE9] text-[11px] font-bold">12 AVAILABLE</span>
          </div>
        </div>
        <p className="text-sm ml-[52px] -mt-1" style={{ color: c.textMuted }}>Science-backed VR rehab programs</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-[90px] px-5 space-y-4">
        {/* Active Program */}
        {activeProgram && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
              Active Program
            </p>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden cursor-pointer"
              style={{ height: 180 }}
              onClick={() => navigate(`/exercises/${activeProgram.id}`)}
            >
              <img
                src={activeProgram.img}
                alt={activeProgram.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(7,9,15,0.95) 0%, rgba(7,9,15,0.2) 60%, transparent 100%)",
                }}
              />
              <div className="absolute top-4 left-4">
                <span
                  className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: activeProgram.color }}
                >
                  ACTIVE PROGRAM
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-black" style={{ fontSize: 18 }}>
                  {activeProgram.title}
                </h3>
                <p className="text-[#94A3B8] text-xs mt-0.5">{activeProgram.subtitle}</p>
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94A3B8]">Progress</span>
                    <span style={{ color: activeProgram.color }}>{activeProgram.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${activeProgram.progress}%`, background: activeProgram.color }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Icon-style category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryFilters.map((cat) => {
            const active = selectedCat === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedCat(cat.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl shrink-0 transition-all"
                style={
                  active
                    ? { background: cat.color, color: "white", boxShadow: `0 6px 16px ${cat.color}44` }
                    : { background: c.card, color: c.textMuted, border: `1px solid ${c.cardBorder}` }
                }
              >
                <span style={{ color: active ? "white" : cat.color }}>{cat.icon}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Programs list */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
            All Programs
          </p>
          <div className="space-y-3">
            {filtered.map((program, idx) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/exercises/${program.id}`)}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
              >
                <div className="w-[80px] h-[80px] rounded-2xl overflow-hidden shrink-0 relative">
                  <img src={program.img} alt={program.title} className="w-full h-full object-cover" />
                  {program.active && (
                    <div
                      className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full"
                      style={{ background: "#22C55E", boxShadow: "0 0 6px #22C55E" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: program.color }}
                    >
                      {program.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm truncate" style={{ color: c.text }}>{program.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{program.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px]" style={{ color: c.textMuted }}>{program.sessions} sessions</span>
                    <span className="text-[10px]" style={{ color: c.divider }}>•</span>
                    <span className="text-[10px]" style={{ color: c.textMuted }}>{program.level}</span>
                  </div>
                  {program.active && program.progress > 0 && (
                    <div className="mt-1.5 w-full h-1 rounded-full" style={{ background: c.secondaryCard }}>
                      <div className="h-full rounded-full" style={{ width: `${program.progress}%`, background: program.color }} />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {program.active ? (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${program.color}20`, border: `1px solid ${program.color}40` }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5L19 12L8 19V5Z" fill={program.color} />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="px-3 py-2 rounded-xl"
                      style={{ background: "rgba(37,109,233,0.12)", border: "1px solid rgba(37,109,233,0.2)" }}
                    >
                      <span className="text-[#256DE9] text-[10px] font-bold">START</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}