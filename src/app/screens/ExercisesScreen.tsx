import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { useApp, useColors } from "../context/AppContext";

// Body part filter icons
const bodyPartFilters = [
  {
    id: "All",
    label: "All",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "Chest",
    label: "Chest",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 4C10 4 7 5.5 5 8C4 10 4 12 5 14C6.5 16.5 9 18 12 18C15 18 17.5 16.5 19 14C20 12 20 10 19 8C17 5.5 14 4 12 4Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <path d="M8 10C8 10 10 12 12 12C14 12 16 10 16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 12V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Back",
    label: "Back",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C10.5 3 9.5 4 9.5 5.5C9.5 7 10.5 8 12 8C13.5 8 14.5 7 14.5 5.5C14.5 4 13.5 3 12 3Z" fill="currentColor" />
        <path d="M8 9L12 8L16 9V14L12 21L8 14V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M12 8V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Arms",
    label: "Arms",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 8C5 8 4 10 5 12C5.5 13 6 14 6 15L7 19H9L10 15C10 15 11 13 11 11V8L8 6L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M8 6C8 6 8 4 10 3.5C12 3 13 4 13 5L12 7L11 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12C8 11.5 9 11.5 10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Legs",
    label: "Legs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 3H15V10L13 14L14 21H10L11 14L9 10V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M9 3C9 3 8 5 9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 3C15 3 16 5 15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Core",
    label: "Core",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="6" ry="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 9H18M6 12H18M6 15H18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M12 4V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Shoulders",
    label: "Shoulders",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 6C12 6 8 6 6 9C5 11 6 13 6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 6C12 6 16 6 18 9C19 11 18 13 18 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 13L7 19M18 13L17 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 19H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "Cardio",
    label: "Cardio",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 14 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M2 12H5L7 9L10 15L12 11L14 13H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const exercises = [
  { id: "1", title: "Morning HIIT", category: "Cardio", bodyPart: "Cardio", duration: "45 min", calories: 420, intensity: "High", level: "Advanced", isPremium: false, img: "https://images.unsplash.com/photo-1729281008855-71e2506761c0?w=400&q=80" },
  { id: "2", title: "Lower Body Blast", category: "Strength", bodyPart: "Legs", duration: "52 min", calories: 510, intensity: "High", level: "Intermediate", isPremium: false, img: "https://images.unsplash.com/photo-1597376833295-40a54d5e69fc?w=400&q=80" },
  { id: "3", title: "Flexibility Flow", category: "Flexibility", bodyPart: "Core", duration: "30 min", calories: 180, intensity: "Low", level: "Beginner", isPremium: false, img: "https://images.unsplash.com/photo-1769416945759-4660fd121172?w=400&q=80" },
  { id: "4", title: "Upper Body Push", category: "Strength", bodyPart: "Chest", duration: "38 min", calories: 320, intensity: "Medium", level: "Intermediate", isPremium: false, img: "https://images.unsplash.com/photo-1605296867724-fa87a8ef53fd?w=400&q=80" },
  { id: "5", title: "Sprint Recovery", category: "Recovery", bodyPart: "Legs", duration: "24 min", calories: 180, intensity: "Low", level: "All Levels", isPremium: false, img: "https://images.unsplash.com/photo-1604011237535-628ea8a45753?w=400&q=80" },
  { id: "6", title: "Aqua Training", category: "Cardio", bodyPart: "Cardio", duration: "60 min", calories: 480, intensity: "Medium", level: "Intermediate", isPremium: true, img: "https://images.unsplash.com/photo-1774009304081-ca87dd2f5d99?w=400&q=80" },
  { id: "7", title: "Sprint Intervals", category: "HIIT", bodyPart: "Cardio", duration: "40 min", calories: 580, intensity: "High", level: "Advanced", isPremium: true, img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80" },
  { id: "8", title: "Core Power", category: "Core", bodyPart: "Core", duration: "35 min", calories: 260, intensity: "Medium", level: "Intermediate", isPremium: false, img: "https://images.unsplash.com/photo-1638820870229-00003edce192?w=400&q=80" },
  { id: "9", title: "Shoulder Press Pro", category: "Strength", bodyPart: "Shoulders", duration: "42 min", calories: 310, intensity: "Medium", level: "Advanced", isPremium: true, img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { id: "10", title: "Back Sculpt", category: "Strength", bodyPart: "Back", duration: "48 min", calories: 380, intensity: "Medium", level: "Intermediate", isPremium: false, img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" },
  { id: "11", title: "Arm Blaster", category: "Strength", bodyPart: "Arms", duration: "30 min", calories: 220, intensity: "Medium", level: "Beginner", isPremium: false, img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" },
  { id: "12", title: "Elite Chest Program", category: "Strength", bodyPart: "Chest", duration: "55 min", calories: 460, intensity: "High", level: "Advanced", isPremium: true, img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80" },
];

const intensityColors: Record<string, { bg: string; text: string }> = {
  High: { bg: "rgba(249,115,22,0.15)", text: "#F97316" },
  Medium: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
  Low: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
};

export default function ExercisesScreen() {
  const navigate = useNavigate();
  const { isPremium, toggleFavorite, favoriteIds } = useApp();
  const c = useColors();
  const [selectedBodyPart, setSelectedBodyPart] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.documentElement.style.overflow = "";
  }, []);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [filterIntensity, setFilterIntensity] = useState<string[]>([]);

  const typeOptions = ["Strength", "Cardio", "HIIT", "Flexibility", "Recovery", "Core"];
  const levelOptions = ["Beginner", "Intermediate", "Advanced", "All Levels"];
  const intensityOptions = ["Low", "Medium", "High"];

  const toggleFilter = (arr: string[], val: string, setArr: (v: string[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const hasActiveFilters = filterType.length > 0 || filterLevel.length > 0 || filterIntensity.length > 0;

  const clearFilters = () => { setFilterType([]); setFilterLevel([]); setFilterIntensity([]); };

  const filtered = exercises.filter((ex) => {
    const matchPart = selectedBodyPart === "All" || ex.bodyPart === selectedBodyPart;
    const matchSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType.length === 0 || filterType.includes(ex.category);
    const matchLevel = filterLevel.length === 0 || filterLevel.includes(ex.level);
    const matchIntensity = filterIntensity.length === 0 || filterIntensity.includes(ex.intensity);
    return matchPart && matchSearch && matchType && matchLevel && matchIntensity;
  });

  const freeExercises = filtered.filter((e) => !e.isPremium);
  const premiumExercises = filtered.filter((e) => e.isPremium);

  const handleExerciseClick = (ex: typeof exercises[0]) => {
    if (ex.isPremium && !isPremium) {
      navigate("/premium");
    } else {
      navigate(`/exercises/${ex.id}`);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>
      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilterSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowFilterSheet(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-5 pb-8"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: c.divider }} />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-lg" style={{ color: c.text }}>Filter Exercises</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm font-bold" style={{ color: "#EF4444" }}>Clear All</button>
                )}
              </div>

              {/* Type */}
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: c.textMuted }}>Exercise Type</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {typeOptions.map(opt => (
                  <button key={opt} onClick={() => toggleFilter(filterType, opt, setFilterType)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={filterType.includes(opt)
                      ? { background: "#256DE9", color: "white", boxShadow: "0 4px 12px rgba(37,109,233,0.3)" }
                      : { background: c.secondaryCard, color: c.textSub, border: `1px solid ${c.cardBorder}` }}>
                    {opt}
                  </button>
                ))}
              </div>

              {/* Level */}
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: c.textMuted }}>Difficulty Level</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {levelOptions.map(opt => (
                  <button key={opt} onClick={() => toggleFilter(filterLevel, opt, setFilterLevel)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={filterLevel.includes(opt)
                      ? { background: "#256DE9", color: "white", boxShadow: "0 4px 12px rgba(37,109,233,0.3)" }
                      : { background: c.secondaryCard, color: c.textSub, border: `1px solid ${c.cardBorder}` }}>
                    {opt}
                  </button>
                ))}
              </div>

              {/* Intensity */}
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: c.textMuted }}>Intensity</p>
              <div className="flex gap-2 mb-6">
                {intensityOptions.map(opt => {
                  const colors: Record<string, string> = { Low: "#22C55E", Medium: "#EAB308", High: "#F97316" };
                  return (
                    <button key={opt} onClick={() => toggleFilter(filterIntensity, opt, setFilterIntensity)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={filterIntensity.includes(opt)
                        ? { background: colors[opt], color: "white", boxShadow: `0 4px 12px ${colors[opt]}44` }
                        : { background: c.secondaryCard, color: c.textSub, border: `1px solid ${c.cardBorder}` }}>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setShowFilterSheet(false)}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)", boxShadow: "0 12px 32px rgba(37,109,233,0.3)" }}>
                Apply Filters {hasActiveFilters ? `(${filterType.length + filterLevel.length + filterIntensity.length})` : ""}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            <h1 className="text-white font-black" style={{ fontSize: 24 }}>Exercises</h1>
          </div>
          <button
            onClick={() => setShowFilterSheet(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
            style={hasActiveFilters
              ? { background: "#256DE9", border: "1px solid rgba(255,255,255,0.2)" }
              : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M7 12H17M10 18H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-white text-xs font-bold">Filters{hasActiveFilters ? ` (${filterType.length + filterLevel.length + filterIntensity.length})` : ""}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative px-5 mb-4">
          <div className="absolute left-9 top-1/2 -translate-y-1/2">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" />
              <path d="M21 21L16.65 16.65" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", caretColor: "white", color: "white" }}
          />
        </div>

        {/* Body Part Icon Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 pl-5" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          {bodyPartFilters.map((filter) => {
            const isActive = selectedBodyPart === filter.id;
            return (
              <motion.button
                key={filter.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedBodyPart(filter.id)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                  style={isActive
                    ? { background: "#256DE9", boxShadow: "0 6px 20px rgba(37,109,233,0.5)", color: "white" }
                    : { background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }
                  }
                >
                  {filter.icon}
                </div>
                <span className="text-[9px] font-bold whitespace-nowrap"
                  style={{ color: isActive ? "white" : "rgba(255,255,255,0.5)" }}>
                  {filter.label}
                </span>
              </motion.button>
            );
          })}
          <div className="w-5 shrink-0" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-[120px] px-5 pt-4" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" } as React.CSSProperties}>
        <p className="text-xs font-semibold mb-4 tracking-wider" style={{ color: c.textMuted }}>
          {filtered.length} EXERCISES
        </p>

        {/* Featured banner */}
        {selectedBodyPart === "All" && filtered.length > 0 && !filtered[0].isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden mb-4 cursor-pointer"
            style={{ height: 170 }}
            onClick={() => handleExerciseClick(filtered[0])}
          >
            <img src={filtered[0].img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(7,9,15,0.95) 0%, rgba(7,9,15,0.2) 70%, transparent 100%)",
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: "#F97316" }}>
                🔥 TRENDING
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(filtered[0].id); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={favoriteIds.includes(filtered[0].id) ? "#ef4444" : "none"} stroke={favoriteIds.includes(filtered[0].id) ? "#ef4444" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-4 right-14">
              <h3 className="text-white font-bold" style={{ fontSize: 17 }}>
                {filtered[0].title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#94A3B8] text-xs">{filtered[0].duration}</span>
                <span className="text-[#475569] text-xs">•</span>
                <span className="text-[#94A3B8] text-xs">{filtered[0].calories} kcal</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/workout/${filtered[0].id}`); }}
              className="absolute right-3 bottom-3 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "#256DE9", boxShadow: "0 8px 20px rgba(37,109,233,0.5)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5L19 12L8 19V5Z" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Free exercises grid */}
        <AnimatePresence>
          <div className="grid grid-cols-2 gap-3">
            {(selectedBodyPart === "All" ? freeExercises.slice(1) : freeExercises).map((ex, idx) => {
              const ic = intensityColors[ex.intensity];
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleExerciseClick(ex)}
                  className="rounded-2xl overflow-hidden cursor-pointer"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
                >
                  <div className="relative h-[110px]">
                    <img src={ex.img} alt={ex.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,9,15,0.7) 0%, transparent 60%)" }} />
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: ic.bg, color: ic.text }}>
                        {ex.intensity}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.id); }}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={favoriteIds.includes(ex.id) ? "#ef4444" : "none"} stroke={favoriteIds.includes(ex.id) ? "#ef4444" : "rgba(255,255,255,0.8)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/workout/${ex.id}`); }}
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "#256DE9", boxShadow: "0 4px 12px rgba(37,109,233,0.4)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5L19 12L8 19V5Z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: "#256DE9" }}>
                      {ex.category}
                    </span>
                    <h3 className="font-bold text-sm leading-tight" style={{ color: c.text }}>{ex.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] flex items-center gap-0.5" style={{ color: c.textMuted }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {ex.duration}
                      </span>
                      <span className="text-[10px]" style={{ color: c.divider }}>•</span>
                      <span className="text-[10px]" style={{ color: c.textMuted }}>{ex.calories} kcal</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Premium Section */}
        {premiumExercises.length > 0 && (
          <div className="mt-5">
            {/* Premium header */}
            <div
              className="flex items-center gap-3 p-4 rounded-2xl mb-3"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(37,109,233,0.12) 100%)",
                border: "1px solid rgba(168,85,247,0.25)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(168,85,247,0.2)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#A855F7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: c.text }}>Advanced Exercises</p>
                <p className="text-xs" style={{ color: c.textMuted }}>Premium plan required to unlock</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/premium")}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #A855F7, #7C3AED)" }}
              >
                Upgrade
              </motion.button>
            </div>

            {/* Premium exercises grid */}
            <div className="grid grid-cols-2 gap-3">
              {premiumExercises.map((ex, idx) => {
                const ic = intensityColors[ex.intensity];
                return (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleExerciseClick(ex)}
                    className="rounded-2xl overflow-hidden cursor-pointer relative"
                    style={{ background: c.card, border: `1px solid rgba(168,85,247,0.2)` }}
                  >
                    <div className="relative h-[110px]">
                      <img src={ex.img} alt={ex.title} className="w-full h-full object-cover" />
                      {/* Blur overlay for premium */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "rgba(7,9,15,0.55)",
                          backdropFilter: isPremium ? "none" : "blur(2px)",
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: ic.bg, color: ic.text }}>
                          {ex.intensity}
                        </span>
                      </div>
                      {/* Premium lock badge */}
                      {!isPremium && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(168,85,247,0.9)" }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="5" y="11" width="14" height="10" rx="2" fill="white" />
                                <path d="M8 11V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="text-white text-[9px] font-bold">PREMIUM</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#A855F7" }}>
                          {ex.category}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.15)", color: "#A855F7" }}>
                          ⭐ PRO
                        </span>
                      </div>
                      <h3 className="font-bold text-sm leading-tight" style={{ color: c.text }}>{ex.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px]" style={{ color: c.textMuted }}>{ex.duration}</span>
                        <span className="text-[10px]" style={{ color: c.textMuted }}>•</span>
                        <span className="text-[10px]" style={{ color: c.textMuted }}>{ex.calories} kcal</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}