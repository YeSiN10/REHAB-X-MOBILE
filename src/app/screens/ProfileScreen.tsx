import { useNavigate } from "react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "../components/BottomNav";
import { useApp, useColors, computeStreak, computeBestStreak } from "../context/AppContext";
import { useT } from "../i18n";
import { AvatarCropModal } from "../components/AvatarCropModal";
import { compressImage } from "../utils/imageUtils";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, sessions, logout, updateUser } = useApp();
  const c = useColors();
  const avatarRef = useRef<HTMLInputElement>(null);
  const medicalDocRef = useRef<HTMLInputElement>(null);
  const replaceDocRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [replaceIdx, setReplaceIdx] = useState<number | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const compressed = await compressImage(file);
      setCropSrc(compressed);
    } catch {
      console.error("Failed to load image");
    }
  };

  const handleCropConfirm = (cropped: string) => {
    updateUser({ avatar: cropped });
    setCropSrc(null);
  };

  const docs: string[] = user.medicalDocs && user.medicalDocs.length > 0
    ? user.medicalDocs
    : user.medicalDoc ? [user.medicalDoc] : [];

  const handleAddDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    const updated = [...docs, ...names];
    updateUser({ medicalDocs: updated, medicalDoc: updated[0] || "" });
    e.target.value = "";
  };

  const handleReplaceDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceIdx === null) return;
    const updated = [...docs];
    updated[replaceIdx] = file.name;
    updateUser({ medicalDocs: updated, medicalDoc: updated[0] || "" });
    e.target.value = "";
    setReplaceIdx(null);
  };

  const removeDoc = (idx: number) => {
    const updated = docs.filter((_, i) => i !== idx);
    updateUser({ medicalDocs: updated, medicalDoc: updated[0] || "" });
  };

  const displayName = user.name || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const totalCalories = sessions.reduce((sum, s) => sum + s.calories, 0);
  const totalHours = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60);
  const streak = computeStreak(sessions);
  const bestStreak = computeBestStreak(sessions);
  const t = useT();

  const stats = [
    { label: t.profile.sessions, value: `${sessions.length}` },
    { label: t.profile.streak, value: `${streak}d` },
    { label: t.profile.calories, value: totalCalories >= 1000 ? `${Math.round(totalCalories / 1000)}K` : `${totalCalories}` },
    { label: t.profile.hours, value: `${totalHours}h` },
  ];

  const achievements = [
    { icon: "🔥", label: "Calorie Crusher", earned: totalCalories >= 2000 },
    { icon: "⚡", label: "Streak Master", earned: bestStreak >= 3 },
    { icon: "🏃", label: "Speed Demon", earned: sessions.some(s => s.type === "HIIT" || s.type === "Cardio") },
    { icon: "💪", label: "Strength King", earned: sessions.filter(s => s.type === "Strength").length >= 5 },
    { icon: "🧘", label: "Recovery Pro", earned: sessions.filter(s => s.type === "Recovery").length >= 3 },
  ];

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
        {
          icon: "📋",
          label: "Medical Documents",
          path: null,
          badge: docs.length > 0 ? `${docs.length}` : null,
          action: "medical-docs",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "🔔", label: "Notifications", path: "/notifications", badge: null },
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

        {cropSrc && (
          <AvatarCropModal
            src={cropSrc}
            onConfirm={handleCropConfirm}
            onCancel={() => setCropSrc(null)}
          />
        )}
        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

        <div className="flex items-center gap-4 px-5">
          <div className="relative">
            <div
              className="w-[80px] h-[80px] rounded-[24px] flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #256DE9, #1a4bb5)",
                border: "2px solid #256DE9",
                boxShadow: "0 8px 24px rgba(37,109,233,0.3)",
              }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black" style={{ fontSize: 28 }}>{initials}</span>
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#256DE9", border: "2px solid #0d1630", boxShadow: "0 4px 12px rgba(37,109,233,0.4)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{displayName}</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              {user.fitnessLevel || "Intermediate"} Athlete
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="px-2.5 py-1 rounded-full" style={{ background: "rgba(37,109,233,0.3)" }}>
                <span className="text-[10px] font-bold" style={{ color: "#7AABFF" }}>
                  {user.goal ? user.goal.split(" ")[0] : "Recovery"}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full" style={{ background: "rgba(234,179,8,0.2)" }}>
                <span className="text-[#EAB308] text-[10px] font-bold">⭐ {sessions.length > 0 ? "Active" : "New"}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex gap-3 mt-5 mx-5 p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 text-center ${i > 0 ? "border-l" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <div className="font-black" style={{ fontSize: 18, color: "white" }}>{s.value}</div>
              <div className="text-[10px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[90px] px-5 space-y-4 pt-5">
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
                <p className="text-center leading-tight font-bold" style={{ color: a.earned ? c.text : c.textMuted, fontSize: 9 }}>
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
                  onClick={() => {
                    if (item.action === "medical-docs") { setShowMedicalModal(true); return; }
                    if (item.danger && item.label === "Sign Out") { logout(); }
                    if (item.path) navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${i < section.items.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: c.divider }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1 text-sm font-semibold text-left" style={{ color: item.danger ? "#EF4444" : c.text }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: item.action === "medical-docs" ? "#22C55E" : "#256DE9", fontSize: 10 }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke={item.danger ? "#EF4444" : c.textMuted} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-center text-xs pb-2" style={{ color: c.textMuted }}>
          REHAB X v2.4.1 • {sessions.length > 0 ? `${sessions.length} sessions logged` : "Fresh start — log your first workout!"}
        </p>
      </div>

      <BottomNav />

      {/* Hidden file inputs */}
      <input ref={medicalDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple className="hidden" onChange={handleAddDocs} />
      <input ref={replaceDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleReplaceDoc} />

      {/* Medical Documents Modal */}
      <AnimatePresence>
        {showMedicalModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowMedicalModal(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[32px] overflow-hidden"
              style={{ background: c.bg, maxHeight: "88%" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: c.divider }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-4">
                <div>
                  <h2 className="font-black" style={{ fontSize: 20, color: c.text }}>Medical Documents</h2>
                  <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                    {docs.length === 0
                      ? "No documents uploaded yet"
                      : `${docs.length} document${docs.length > 1 ? "s" : ""} uploaded`}
                  </p>
                </div>
                <button
                  onClick={() => setShowMedicalModal(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke={c.textMuted} strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto px-5 pb-8 space-y-3" style={{ maxHeight: "calc(88vh - 140px)" }}>

                {/* Status banner */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={
                    docs.length === 0
                      ? { background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }
                      : { background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)" }
                  }
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: docs.length === 0 ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.15)" }}
                  >
                    {docs.length === 0 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#EAB308" strokeWidth="1.8" />
                        <path d="M12 8V12M12 16H12.01" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm font-semibold flex-1" style={{ color: docs.length === 0 ? "#EAB308" : "#22C55E" }}>
                    {docs.length === 0
                      ? "No documents yet — add them below"
                      : `${docs.length} document${docs.length > 1 ? "s" : ""} on file`}
                  </p>
                </div>

                {/* Document list */}
                {docs.length > 0 && (
                  <div className="space-y-2">
                    {docs.map((doc, idx) => (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                        style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.accentBg }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: c.text }}>{doc}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>Tap replace to swap this file</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Replace */}
                          <button
                            onClick={() => { setReplaceIdx(idx); replaceDocRef.current?.click(); }}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold"
                            style={{ background: "rgba(37,109,233,0.1)", color: "#256DE9" }}
                          >
                            Replace
                          </button>
                          {/* Remove */}
                          <button
                            onClick={() => removeDoc(idx)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(239,68,68,0.1)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6L18 20C18 20.5304 17.7893 21.0391 17.4142 21.4142C17.0391 21.7893 16.5304 22 16 22H8C7.46957 22 6.96086 21.7893 6.58579 21.4142C6.21071 21.0391 6 20.5304 6 20L5 6H19Z" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <button
                  onClick={() => medicalDocRef.current?.click()}
                  className="w-full py-5 rounded-2xl flex flex-col items-center gap-2.5 transition-all"
                  style={{ background: c.inputBg, border: `2px dashed ${c.inputBorder}` }}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: c.accentBg }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: c.text }}>
                      {docs.length > 0 ? "Add More Documents" : "Upload Documents"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>PDF, JPG, PNG, DOC — multiple files</p>
                  </div>
                </button>

                {/* Privacy note */}
                <div className="px-4 py-3.5 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-xs font-bold" style={{ color: c.text }}>Private & Secure</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
                    Your medical documents are stored locally on your device and used only to personalise your recovery plan.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
