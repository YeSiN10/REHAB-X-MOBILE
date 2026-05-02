import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { useApp, useColors } from "../context/AppContext";

const menuSections = [
  {
    title: "Account",
    items: [
      { icon: "👤", label: "Personal Information", path: "/settings", badge: null },
      { icon: "🎯", label: "My Goals", path: "/settings", badge: null },
      { icon: "📊", label: "Progress Report", path: "/progress", badge: null },
      { icon: "🏆", label: "Achievements", path: "/progress", badge: "3" },
    ],
  },
  {
    title: "Health",
    items: [
      { icon: "❤️", label: "Health Metrics", path: "/progress", badge: null },
      { icon: "💊", label: "Recovery Protocol", path: "/exercises", badge: null },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: "🔔", label: "Notifications", path: "/notifications", badge: "3" },
      { icon: "⚙️", label: "App Settings", path: "/settings", badge: null },
      { icon: "⭐", label: "Upgrade to Premium", path: "/premium", badge: null },
    ],
  },
  {
    title: "",
    items: [
      { icon: "🚪", label: "Sign Out", path: "/login", badge: null, danger: true },
    ],
  },
];

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, sessions } = useApp();
  const c = useColors();

  const displayName = user.name || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const thisMonth = sessions.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalCalories = sessions.reduce((sum, s) => sum + s.calories, 0);
  const totalHours = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60);
  const streak = 5;

  const stats = [
    { label: "Sessions", value: `${sessions.length}` },
    { label: "Streak", value: `${streak}d` },
    { label: "Calories", value: totalCalories >= 1000 ? `${Math.round(totalCalories / 1000)}K` : `${totalCalories}` },
    { label: "Hours", value: `${totalHours}h` },
  ];

  const achievements = [
    { icon: "🔥", label: "Calorie Crusher", earned: true },
    { icon: "⚡", label: "Streak Master", earned: true },
    { icon: "🏃", label: "Speed Demon", earned: true },
    { icon: "💪", label: "Strength King", earned: false },
    { icon: "🧘", label: "Recovery Pro", earned: false },
  ];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>
      {/* Curved Header */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 24,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.35) 0%, transparent 65%)" }} />

        <div className="flex items-start justify-between px-5 mb-5">
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
            <div className="inline-flex px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="text-white text-[11px] font-bold tracking-[2px]">PROFILE</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2" fill="white" />
              <circle cx="12" cy="5" r="2" fill="white" />
              <circle cx="12" cy="19" r="2" fill="white" />
            </svg>
          </button>
        </div>

        {/* Avatar + info */}
        <div className="flex items-center gap-4 px-5">
          <div className="relative">
            <div
              className="w-[80px] h-[80px] rounded-[24px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #256DE9, #1a4bb5)",
                border: "2px solid #256DE9",
                boxShadow: "0 8px 24px rgba(37,109,233,0.3)",
              }}
            >
              <span className="text-white font-black" style={{ fontSize: 28 }}>{initials}</span>
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#256DE9", border: `2px solid ${c.card}` }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 20H21M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10217 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10217 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text }}>{displayName}</h2>
            <p className="text-sm mt-0.5" style={{ color: c.textMuted }}>
              {user.fitnessLevel || "Intermediate"} Athlete
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="px-2.5 py-1 rounded-full" style={{ background: c.accentBg }}>
                <span className="text-[#256DE9] text-[10px] font-bold">
                  {user.goal ? user.goal.split(" ")[0] : "Recovery"}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full" style={{ background: "rgba(234,179,8,0.12)" }}>
                <span className="text-[#EAB308] text-[10px] font-bold">⭐ 4.0 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex gap-3 mt-5 p-4 rounded-2xl"
          style={{ background: c.secondaryCard, border: `1px solid ${c.divider}` }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 text-center ${i > 0 ? "border-l" : ""}`}
              style={{ borderColor: c.divider }}
            >
              <div className="font-black" style={{ fontSize: 18, color: c.text }}>{s.value}</div>
              <div className="text-[10px] mt-0.5 font-medium" style={{ color: c.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[90px] px-5 space-y-4 pt-4">
        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ fontSize: 15, color: c.text }}>Achievements</h3>
            <button className="text-[#256DE9] text-sm font-semibold">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {achievements.map((a, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 w-[86px] rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={
                  a.earned
                    ? { background: c.accentBg, border: "1px solid rgba(37,109,233,0.25)" }
                    : { background: c.card, border: `1px solid ${c.cardBorder}`, opacity: 0.5 }
                }
              >
                <span className="text-2xl">{a.earned ? a.icon : "🔒"}</span>
                <p
                  className="text-center leading-tight font-bold"
                  style={{ color: a.earned ? c.text : c.textMuted, fontSize: 9 }}
                >
                  {a.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Menu sections */}
        {menuSections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
                {section.title}
              </p>
            )}
            <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              {section.items.map((item: any, i) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${i < section.items.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: c.divider }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className="flex-1 text-sm font-semibold text-left"
                    style={{ color: item.danger ? "#EF4444" : c.text }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: "#256DE9", fontSize: 10 }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke={item.danger ? "#EF4444" : c.textMuted}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-center text-xs pb-2" style={{ color: c.textMuted }}>
          REHAB X v2.4.1 • Member since Jan 2025
        </p>
      </div>

      <BottomNav />
    </div>
  );
}