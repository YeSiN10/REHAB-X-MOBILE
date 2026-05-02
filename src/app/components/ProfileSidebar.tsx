import { useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import logo from "../../imports/Carte_visite_Final.png";

const menuItems = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    label: "Home", path: "/home",
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    label: "Profile", path: "/profile",
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3 9H21M8 2V6M16 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    label: "Calendar", path: "/calendar",
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 17L8 12L13 15L21 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    label: "Progress", path: "/progress",
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    label: "Notifications", path: "/notifications",
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    label: "Settings", path: "/settings",
  },
];

export function ProfileSidebar() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, user, updateUser, isDark, setIsDark } = useApp();
  const c = useColors();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleNav = (path: string) => {
    setSidebarOpen(false);
    setTimeout(() => navigate(path), 200);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const displayName = user.name || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute left-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 260,
              background: c.card,
              borderRight: `1px solid ${c.cardBorder}`,
              boxShadow: "4px 0 32px rgba(0,0,0,0.2)",
            }}
          >
            {/* Logo header — curved blue gradient */}
            <div
              className="px-5 pt-14 pb-5 shrink-0 relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.4) 0%, transparent 65%)" }} />

              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-5 relative z-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <img src={logo} alt="REHAB X" className="w-7 h-7 object-contain" />
                </div>
                <span className="tracking-[3px] uppercase" style={{ fontSize: 16, fontWeight: 900, color: "white" }}>
                  REHAB<span style={{ color: "#60a5fa" }}>X</span>
                </span>
              </div>

              {/* User info + avatar change */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative shrink-0">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="block"
                    title="Change avatar"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-12 h-12 rounded-2xl object-cover"
                        style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                      />
                    ) : user.name ? (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
                      >
                        <span className="text-white font-black" style={{ fontSize: 16 }}>{initials}</span>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)" }}
                      >
                        <img src={logo} alt="Avatar" className="w-8 h-8 object-contain" />
                      </div>
                    )}
                    {/* Camera icon overlay */}
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#256DE9", border: "1.5px solid #0d1630" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
                      </svg>
                    </div>
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {/* Online indicator */}
                  <div
                    className="absolute -bottom-0.5 left-0 w-3.5 h-3.5 rounded-full border-2"
                    style={{ background: "#22C55E", borderColor: "#0d1630" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: "white", fontSize: 15 }}>{displayName}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {user.fitnessLevel || "Intermediate"} Athlete
                  </p>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: "#60a5fa" }}
                  >
                    Change photo
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2" style={{ color: c.textMuted }}>
                Navigation
              </p>
              <div className="space-y-0.5">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                    style={{ color: c.textSub }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = c.accentBg;
                      (e.currentTarget as HTMLButtonElement).style.color = "#256DE9";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = c.textSub;
                    }}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${c.divider}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2" style={{ color: c.textMuted }}>
                  Appearance
                </p>
                <div
                  className="flex items-center justify-between px-3 py-3 rounded-xl"
                  style={{ background: c.accentBg }}
                >
                  <div className="flex items-center gap-2.5">
                    <span style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</span>
                    <span className="text-sm font-semibold" style={{ color: c.text }}>
                      {isDark ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0"
                    style={{ background: isDark ? "#256DE9" : "rgba(37,109,233,0.2)" }}
                  >
                    <motion.div
                      animate={{ x: isDark ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                    />
                  </button>
                </div>
              </div>

              {/* Premium */}
              <div className="mt-3">
                <button
                  onClick={() => handleNav("/premium")}
                  className="w-full px-3 py-3 rounded-xl flex items-center gap-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(37,109,233,0.15) 0%, rgba(168,85,247,0.1) 100%)",
                    border: "1px solid rgba(37,109,233,0.2)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>⭐</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold" style={{ color: c.text }}>Upgrade Premium</p>
                    <p style={{ color: c.textMuted, fontSize: 10 }}>Unlock all VR features</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#256DE9" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sign out */}
            <div className="px-3 pb-8 pt-3" style={{ borderTop: `1px solid ${c.divider}` }}>
              <button
                onClick={() => handleNav("/login")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                style={{ color: "#EF4444" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M16 17L21 12L16 7M21 12H9" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}