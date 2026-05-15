import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { useT, useLang } from "../i18n";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
      style={{ background: value ? c.accent : "rgba(150,150,150,0.2)" }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
      />
    </button>
  );
}

const genderOptions = ["Male", "Female", "Other"];
const fitnessOptions = ["Beginner", "Intermediate", "Advanced"];
const goalOptions = ["Recovery & Performance", "Build Muscle", "Lose Weight", "Flexibility"];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, isDark, setIsDark, updateUser, sessions, streak } = useApp();
  const c = useColors();
  const t = useT();
  const { language, setLanguage } = useLang();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    workoutReminders: true,
    restDayAlerts: false,
    soundEffects: true,
    vibration: true,
    autoPlay: false,
    privacyMode: false,
    shareProgress: true,
  });

  const update = (key: keyof typeof settings, val: boolean) =>
    setSettings((s) => ({ ...s, [key]: val }));

  // Editable field state
  const [editSheet, setEditSheet] = useState<{ field: string; label: string; value: string; type?: string; options?: string[] } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Star rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openEdit = (field: string, label: string, currentValue: string, type?: string, options?: string[]) => {
    setEditValue(currentValue || "");
    setEditSheet({ field, label, value: currentValue, type, options });
  };

  const saveEdit = () => {
    if (!editSheet) return;
    const { field } = editSheet;
    const updates: Record<string, string> = { [field]: editValue };
    updateUser(updates as any);
    setEditSheet(null);
    showToast("Profile updated");
  };

  const handleExport = () => {
    const doc = new jsPDF();
    const totalCalories = sessions.reduce((s, x) => s + x.calories, 0);
    const totalMinutes = sessions.reduce((s, x) => s + x.duration, 0);
    const typeCount: Record<string, number> = {};
    sessions.forEach((s) => { typeCount[s.type] = (typeCount[s.type] || 0) + 1; });

    const [aR, aG, aB] = c.accentRgb.split(",").map(Number);
    doc.setFontSize(22);
    doc.setTextColor(aR, aG, aB);
    doc.text("REHAB X — My Data Export", 20, 25);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, 35);

    doc.setDrawColor(aR, aG, aB);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Profile", 20, 52);
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Name: ${user.name || "—"}`, 20, 62);
    doc.text(`Email: ${user.email || "—"}`, 20, 70);
    doc.text(`Age: ${user.age || "—"}`, 20, 78);
    doc.text(`Gender: ${user.gender || "—"}`, 20, 86);
    doc.text(`Fitness Level: ${user.fitnessLevel || "—"}`, 20, 94);
    doc.text(`Goal: ${user.goal || "—"}`, 20, 102);
    if (user.phone) doc.text(`Phone: ${user.phone}`, 20, 110);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Activity Summary", 20, 126);
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Sessions: ${sessions.length}`, 20, 136);
    doc.text(`Total Calories Burned: ${totalCalories.toLocaleString()} kcal`, 20, 144);
    doc.text(`Total Active Time: ${Math.round(totalMinutes / 60 * 10) / 10} hours (${totalMinutes} min)`, 20, 152);
    doc.text(`Current Streak: ${streak} days`, 20, 160);

    if (Object.keys(typeCount).length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Workout Breakdown", 20, 176);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      let y = 186;
      Object.entries(typeCount).forEach(([type, count]) => {
        doc.text(`${type}: ${count} session${count !== 1 ? "s" : ""}`, 20, y);
        y += 8;
      });
    }

    if (sessions.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Recent Sessions (last 20)", 20, 25);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const recent = sessions.slice(-20).reverse();
      let y = 38;
      recent.forEach((s) => {
        doc.text(`${s.date}  |  ${s.type}  |  ${s.calories} kcal  |  ${s.duration} min`, 20, y);
        y += 8;
      });
    }

    doc.save("rehab-x-data.pdf");
    showToast("PDF downloaded!");
  };

  const profileFields = [
    { label: "Full Name", field: "name", value: user.name || "", type: "text" },
    { label: "Email", field: "email", value: user.email || "", type: "email", readonly: true },
    { label: "Phone", field: "phone", value: user.phone || "", type: "tel" },
    { label: "Age", field: "age", value: user.age || "", type: "number" },
    { label: "Gender", field: "gender", value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "", type: "select", options: genderOptions },
    { label: "Fitness Level", field: "fitnessLevel", value: user.fitnessLevel || "Intermediate", type: "select", options: fitnessOptions },
    { label: "Primary Goal", field: "goal", value: user.goal || "Recovery & Performance", type: "select", options: goalOptions },
  ];

  const sections = [
    {
      title: t.settings.notifications,
      items: [
        { key: "pushNotifications", label: t.settings.pushNotifications, desc: t.settings.pushNotificationsDesc },
        { key: "workoutReminders", label: t.settings.workoutReminders, desc: t.settings.workoutRemindersDesc },
        { key: "restDayAlerts", label: t.settings.restDayAlerts, desc: t.settings.restDayAlertsDesc },
      ],
    },
    {
      title: t.settings.audioHaptics,
      items: [
        { key: "soundEffects", label: t.settings.soundEffects, desc: t.settings.soundEffectsDesc },
        { key: "vibration", label: t.settings.vibration, desc: t.settings.vibrationDesc },
        { key: "autoPlay", label: t.settings.autoPlay, desc: t.settings.autoPlayDesc },
      ],
    },
    {
      title: t.settings.privacy,
      items: [
        { key: "privacyMode", label: t.settings.privacyMode, desc: t.settings.privacyModeDesc },
        { key: "shareProgress", label: t.settings.shareProgress, desc: t.settings.shareProgressDesc },
      ],
    },
  ];

  const starLabels = t.settings.starLabels;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="absolute top-20 left-5 right-5 z-50 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: c.accent, boxShadow: `0 8px 24px rgba(${c.accentRgb},0.4)` }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-sm font-semibold text-white flex-1">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
              onClick={() => !ratingDone && setShowRatingModal(false)} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-x-5 z-50 rounded-3xl p-6 overflow-hidden"
              style={{ top: "50%", transform: "translateY(-50%)", background: c.headerGradient, border: `1px solid rgba(${c.accentRgb},0.35)`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% -15%, rgba(${c.accentRgb},0.5) 0%, transparent 60%)` }} />
              {ratingDone ? (
                <div className="flex flex-col items-center py-4 text-center relative">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: `rgba(${c.accentRgb},0.25)`, border: `2px solid rgba(${c.accentRgb},0.5)` }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                  <h3 className="font-black mt-4 mb-2" style={{ fontSize: 22, color: "white" }}>{t.settings.thankYou}</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{t.settings.starRating.replace("{n}", String(selectedRating))}</p>
                  <button
                    onClick={() => { setShowRatingModal(false); setRatingDone(false); setSelectedRating(0); }}
                    className="mt-6 px-8 py-3 rounded-2xl text-white font-bold"
                    style={{ background: `rgba(${c.accentRgb},0.4)`, border: `1px solid rgba(${c.accentRgb},0.6)` }}
                  >
                    {t.common.close}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `rgba(${c.accentRgb},0.25)`, border: `1px solid rgba(${c.accentRgb},0.4)` }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#60a5fa" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-black" style={{ fontSize: 18, color: "white" }}>{t.settings.rateTitle}</h3>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{t.settings.rateSubtitle}</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoveredStar || selectedRating) >= star;
                      return (
                        <motion.button
                          key={star}
                          whileTap={{ scale: 0.82 }}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setSelectedRating(star)}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                          style={{
                            background: active ? `rgba(${c.accentRgb},0.4)` : "rgba(255,255,255,0.07)",
                            border: `1.5px solid ${active ? "rgba(96,165,250,0.7)" : "rgba(255,255,255,0.12)"}`,
                            boxShadow: active ? `0 4px 16px rgba(${c.accentRgb},0.4)` : "none",
                          }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#60a5fa" : "none"} stroke={active ? "#60a5fa" : "rgba(255,255,255,0.35)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        </motion.button>
                      );
                    })}
                  </div>

                  {(hoveredStar || selectedRating) > 0 && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-bold mb-4" style={{ color: "#60a5fa" }}>
                      {starLabels[(hoveredStar || selectedRating) - 1]}
                    </motion.p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowRatingModal(false)} className="flex-1 py-3 rounded-2xl font-semibold text-sm" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      {t.settings.notNow}
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={selectedRating === 0}
                      onClick={() => setRatingDone(true)}
                      className="flex-1 py-3 rounded-2xl text-white font-bold text-sm disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`, boxShadow: `0 8px 24px rgba(${c.accentRgb},0.4)` }}
                    >
                      {t.settings.submitRating}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Field Bottom Sheet */}
      <AnimatePresence>
        {editSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setEditSheet(null)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-5 pb-10"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: c.divider }} />
              <h3 className="font-black text-lg mb-5" style={{ color: c.text }}>{t.settings.editField} {editSheet.label}</h3>

              {editSheet.options ? (
                <div className="space-y-2 mb-6">
                  {editSheet.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setEditValue(opt)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
                      style={editValue === opt
                        ? { background: c.accent, boxShadow: `0 8px 20px rgba(${c.accentRgb},0.3)` }
                        : { background: c.secondaryCard, border: `1px solid ${c.cardBorder}` }}
                    >
                      <span className="font-semibold text-sm" style={{ color: editValue === opt ? "white" : c.text }}>{opt}</span>
                      {editValue === opt && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type={editSheet.type || "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-4 rounded-2xl text-sm focus:outline-none mb-6"
                  style={{ background: c.inputBg, border: `1.5px solid ${c.accent}`, color: c.text, caretColor: c.accent }}
                  placeholder={`Enter your ${editSheet.label.toLowerCase()}`}
                />
              )}

              <div className="flex gap-3">
                <button onClick={() => setEditSheet(null)} className="flex-1 py-4 rounded-2xl font-bold text-sm" style={{ background: c.secondaryCard, color: c.textSub }}>
                  {t.common.cancel}
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveEdit} className="flex-1 py-4 rounded-2xl text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`, boxShadow: `0 12px 28px rgba(${c.accentRgb},0.3)` }}>
                  {t.settings.saveChanges}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Curved Header */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: c.headerGradient,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: c.headerGlowBg }} />
        <div className="flex items-center gap-4 px-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-white font-black" style={{ fontSize: 22 }}>{t.settings.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 px-5 space-y-5 pt-5">
        {/* Profile info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{t.settings.profileInformation}</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            {profileFields.map((field, i) => (
              <button
                key={field.label}
                onClick={() => {
                  if (field.readonly) return;
                  openEdit(field.field, field.label, field.value, field.type, (field as any).options);
                }}
                disabled={field.readonly}
                className={`w-full flex items-center justify-between px-4 py-3.5 transition-all ${i < profileFields.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: c.divider }}
              >
                <span className="text-sm" style={{ color: c.textSub }}>{field.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: !field.value || field.value === "Not set" ? c.textMuted : c.text }}>
                    {field.value || t.common.notSet}
                  </span>
                  {!field.readonly && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20H21M16.5 3.5C16.9 3.1 17.4 2.88 18 2.88C18.56 2.88 19.1 3.1 19.5 3.5C19.9 3.9 20.12 4.44 20.12 5C20.12 5.56 19.9 6.1 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke={c.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {field.readonly && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke={c.textMuted} strokeWidth="1.8" />
                      <path d="M8 11V7C8 5.34 9.34 4 11 4H13C14.66 4 16 5.34 16 7V11" stroke={c.textMuted} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{t.settings.appearance}</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</span>
                  <p className="text-sm font-semibold" style={{ color: c.text }}>{t.settings.darkMode}</p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                  {isDark ? t.settings.darkModeActive : t.settings.lightModeActive}
                </p>
              </div>
              <Toggle value={isDark} onChange={setIsDark} />
            </div>
          </div>
        </div>

        {/* Language picker */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{t.settings.languageSection}</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex items-center gap-2 px-4 py-3">
              {(["en", "fr", "ar"] as const).map((lang) => {
                const info = { en: { flag: "🇬🇧", label: "EN" }, fr: { flag: "🇫🇷", label: "FR" }, ar: { flag: "🇸🇦", label: "AR" } }[lang];
                const isActive = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
                    style={isActive
                      ? { background: c.accent, boxShadow: `0 8px 20px rgba(${c.accentRgb},0.35)` }
                      : { background: c.secondaryCard, border: `1px solid ${c.cardBorder}` }
                    }
                  >
                    <span style={{ fontSize: 22 }}>{info.flag}</span>
                    <span className="text-xs font-bold" style={{ color: isActive ? "white" : c.textSub }}>{info.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Toggle sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{section.title}</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              {section.items.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between px-4 py-4 ${i < section.items.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: c.divider }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: c.text }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{item.desc}</p>
                  </div>
                  <Toggle
                    value={settings[item.key as keyof typeof settings]}
                    onChange={(v) => update(item.key as keyof typeof settings, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Account actions */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>{t.settings.account}</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: c.divider }}
            >
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={c.accent} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-sm font-semibold" style={{ color: c.accent }}>{t.settings.rateApp}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke={c.accent} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: c.divider }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 16 }}>📤</span>
                <span className="text-sm font-semibold" style={{ color: c.textSub }}>{t.settings.exportData}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="w-full flex items-center justify-between px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 16 }}>🗑️</span>
                <span className="text-sm font-semibold" style={{ color: "#EF4444" }}>Delete Account</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-xs pb-2" style={{ color: c.textMuted }}>
          REHAB X v2.4.1 • Terms of Service • Privacy Policy
        </p>
      </div>
    </div>
  );
}
