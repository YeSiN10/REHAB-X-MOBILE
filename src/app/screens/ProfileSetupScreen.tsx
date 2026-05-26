import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import { AvatarCropModal } from "../components/AvatarCropModal";
import { compressImage } from "../utils/imageUtils";
import { useT } from "../i18n";
import logo from "../../imports/Carte_visite_Final.png";

const genderOptions = [
  {
    value: "male", label: "Male",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    value: "female", label: "Female",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
      {/* Long hair left */}
      <path d="M8.5 7C8 5 8.5 3 10 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Long hair right */}
      <path d="M15.5 7C16 5 15.5 3 14 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Hair top arc */}
      <path d="M8.8 5.5C9.5 3.5 14.5 3.5 15.2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Flowing hair sides */}
      <path d="M8.5 7.5C7.5 10 7.5 13 8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15.5 7.5C16.5 10 16.5 13 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Body */}
      <path d="M5 21c0-3.5 3.1-6.5 7-6.5s7 3 7 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Female symbol cross */}
      <path d="M12 21v2M10 22h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>,
  },
];
const rehabilitationLevels = [
  { value: "Beginner",     label: "Beginner",     desc: "Just starting rehabilitation" },
  { value: "Intermediate", label: "Intermediate", desc: "Some rehab experience" },
  { value: "Advanced",     label: "Advanced",     desc: "Well into recovery" },
];
const goals = [
  {
    value: "Recovery & Performance", label: "Recovery",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    value: "Build Muscle", label: "Strength",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6.5 6.5h11M6.5 17.5h11M4 6.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM4 22.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM20 6.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM20 22.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM2 9v6M22 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    value: "Lose Weight", label: "Renforcement",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    value: "Flexibility", label: "Flexibility",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l-4 4M12 12l4 4M8 22l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
];
const PAIN_ZONES = [
  { id: "lower-back", label: "Lower Back", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: "knee",       label: "Knee",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2v5M12 17v5M7 12H2M22 12h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: "shoulder",   label: "Shoulder",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20c0-5 3.5-9 8-9s8 4 8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: "hip",        label: "Hip",        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3C8 3 5 6.13 5 10c0 2.5 1.3 4.7 3.3 6L7 21h10l-1.3-5C17.7 14.7 19 12.5 19 10c0-3.87-3-7-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "ankle",      label: "Ankle",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4h10v8l2 8H5l2-8V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "neck",       label: "Neck",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M10 9v7a2 2 0 004 0V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: "wrist",      label: "Wrist",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="14" rx="5" stroke="currentColor" strokeWidth="1.8"/><path d="M7 13h10M9 19h6M12 16v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: "elbow",      label: "Elbow",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 4l7 8-7 8M19 4l-7 8 7 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

export default function ProfileSetupScreen() {
  const navigate = useNavigate();
  const t = useT();
  const { user, updateUser, authToken, setTodayMood } = useApp();
  const c = useColors();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(user.name || "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const parsedExistingDob = user.dob ? user.dob.split("-") : ["", "", ""];
  const [dobYear, setDobYear] = useState(parsedExistingDob[0] || "");
  const [dobMonth, setDobMonth] = useState(parsedExistingDob[1] || "");
  const [dobDay, setDobDay] = useState(parsedExistingDob[2] || "");
  const dob = dobYear && dobMonth && dobDay ? `${dobYear}-${dobMonth}-${dobDay}` : "";

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const calcAge = (dateStr: string): number => {
    if (!dateStr) return 0;
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear;
  const minYear = currentYear - 100;
  const daysInMonth = dobYear && dobMonth ? new Date(parseInt(dobYear), parseInt(dobMonth), 0).getDate() : 31;
  const [phone, setPhone] = useState(user.phone || "");
  const [gender, setGender] = useState(user.gender || "");
  const accent = gender === "female" ? "#9333EA" : "#256DE9";
  const accentRgb = gender === "female" ? "147,51,234" : "37,109,233";
  const completingGradient = gender === "female"
    ? "linear-gradient(160deg, #3b1a6e 0%, #2d1554 40%, #1a0d30 100%)"
    : "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)";
  const completingGlow = gender === "female"
    ? "radial-gradient(ellipse at 50% 30%, rgba(147,51,234,0.45) 0%, transparent 65%)"
    : "radial-gradient(ellipse at 50% 30%, rgba(37,109,233,0.45) 0%, transparent 65%)";
  const progressBarGradient = gender === "female"
    ? "linear-gradient(90deg, #c084fc, #9333ea)"
    : "linear-gradient(90deg, #60a5fa, #3b82f6)";
  const [fitnessLevel, setFitnessLevel] = useState(user.fitnessLevel || "");
  const [goal, setGoal] = useState(user.goal || "");
  const [medicalDocs, setMedicalDocs] = useState<string[]>(
    user.medicalDocs && user.medicalDocs.length > 0
      ? user.medicalDocs
      : user.medicalDoc ? [user.medicalDoc] : []
  );
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [completing, setCompleting] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [visitedKine, setVisitedKine] = useState<string>(user.visitedKine || "");
  const [painLevel, setPainLevel] = useState<number | undefined>(user.painLevel);
  const [painZones, setPainZones] = useState<string[]>(user.painZones || []);

  const togglePainZone = (id: string) => {
    setPainZones((prev) => prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]);
  };

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
    setAvatar(cropped);
    setCropSrc(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    setMedicalDocs((prev) => [...prev, ...names]);
    e.target.value = "";
  };

  const removeDoc = (idx: number) => {
    setMedicalDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const checkUsername = async (val: string) => {
    if (!val.trim()) { setUsernameError("Username is required"); return; }
    if (!authToken) return;
    setCheckingUsername(true);
    setUsernameError(null);
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(val.trim())}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.taken) setUsernameError("This username is already taken. Please choose another.");
        else { setUsernameError(null); updateUser({ name: val.trim() }); }
      }
    } catch { /* offline — allow */ updateUser({ name: val.trim() }); }
    finally { setCheckingUsername(false); }
  };

  const handleComplete = () => {
    if (usernameError) return;
    if (initialMood) setTodayMood(initialMood);
    setCompleting(true);
    updateUser({
      name: username.trim() || user.name,
      dob,
      age: dob ? String(calcAge(dob)) : "",
      phone, gender, fitnessLevel, goal,
      medicalDoc: medicalDocs[0] || "",
      medicalDocs,
      profileSetupDone: true,
      avatar,
      visitedKine,
      painLevel,
      painZones,
    });
    setTimeout(() => navigate("/home"), 2000);
  };

  const [initialMood, setInitialMood] = useState("");
  const steps = [t.profileSetup.stepPersonal, t.profileSetup.stepRehab, t.profileSetup.stepKine, t.profileSetup.stepDocuments, t.home.mood.label];

  if (completing) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: completingGradient }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: completingGlow }} />
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="flex flex-col items-center gap-5 relative"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)", boxShadow: `0 0 48px rgba(${accentRgb},0.6)` }}
          >
            <img src={logo} alt="REHAB X" className="w-14 h-14 object-contain" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-center"
          >
            <p className="text-white/70 text-sm font-medium mb-1">Welcome aboard</p>
            <h2 className="text-white font-black" style={{ fontSize: 28, letterSpacing: "-0.5px" }}>
              {user.name ? user.name.split(" ")[0] : "Champion"} 🎉
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="px-5 py-2 rounded-full"
            style={{ background: `rgba(${accentRgb},0.3)`, border: `1px solid rgba(${accentRgb},0.5)` }}
          >
            <span className="text-white text-xs font-semibold tracking-wide">Setting up your journey 💪</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9, duration: 1.2, ease: "easeInOut" }}
            className="w-40 h-1 rounded-full bg-white/20 overflow-hidden"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.9, duration: 1.2, ease: "easeInOut" }}
              className="h-full rounded-full"
              style={{ background: progressBarGradient }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: c.bg }}>
      {cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
      {/* Header */}
      <div className="px-6 pt-14 pb-5 shrink-0" style={{ borderBottom: `1px solid ${c.divider}` }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent }}>
            <img src={logo} alt="REHAB X" className="w-6 h-6 object-contain" />
          </div>
          <span className="tracking-widest uppercase font-black" style={{ fontSize: 14, color: c.text }}>
            REHAB<span style={{ color: accent }}>X</span>
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: c.text }}>Set Up Your Profile</h1>
        <p className="mt-1 text-sm" style={{ color: c.textMuted }}>Help us personalize your recovery journey</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i <= step ? accent : c.secondaryCard }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {steps.map((s, i) => (
            <span key={s} className="text-[10px] font-semibold"
              style={{ color: i <= step ? accent : c.textMuted }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5">
        <AnimatePresence mode="wait">
          {/* ── STEP 0: Personal ── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              {/* Avatar selector */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold tracking-wider uppercase self-start" style={{ color: c.textSub }}>
                  Profile Photo
                </p>
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: avatar ? "transparent" : `linear-gradient(135deg, ${accent}, ${gender === "female" ? "#6b21a8" : "#1a4bb5"})`,
                      border: avatar ? `3px solid ${accent}` : "none",
                      boxShadow: `0 8px 24px rgba(${accentRgb},0.25)`,
                    }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-3xl">
                        {user.name ? user.name[0].toUpperCase() : "?"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: accent, border: `2px solid ${c.bg}`, boxShadow: `0 4px 12px rgba(${accentRgb},0.4)` }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
                    </svg>
                  </button>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button onClick={() => avatarRef.current?.click()} className="text-xs font-semibold" style={{ color: accent }}>
                  {avatar ? t.profile.uploadAvatar : t.profileSetup.uploadDoc}
                </button>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.username}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameError(null); }}
                    onBlur={(e) => { checkUsername(e.target.value); e.target.style.borderColor = usernameError ? "#EF4444" : c.inputBorder; }}
                    className="w-full px-4 py-4 rounded-2xl text-sm focus:outline-none transition-all"
                    style={{ background: c.inputBg, border: `1px solid ${usernameError ? "#EF4444" : c.inputBorder}`, color: c.text, caretColor: accent }}
                    placeholder={t.profileSetup.usernamePlaceholder}
                    onFocus={(e) => (e.target.style.borderColor = usernameError ? "#EF4444" : accent)}
                  />
                  {checkingUsername && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `rgba(${accentRgb},0.3)`, borderTopColor: accent }} />
                    </div>
                  )}
                </div>
                {usernameError && (
                  <p className="text-xs mt-1.5 ml-1" style={{ color: "#EF4444" }}>{usernameError}</p>
                )}
              </div>

              {/* Phone number */}
              <div>
                <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.phone}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 13.5 19.79 19.79 0 011 4.82a2 2 0 012-2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 10.19a16 16 0 006.72 6.72l1.46-1.46a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={c.textMuted} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm focus:outline-none transition-all"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: accent }}
                    placeholder={t.profileSetup.phonePlaceholder}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = c.inputBorder)}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.dateOfBirth}</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Day */}
                  <div className="relative">
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="w-full appearance-none py-4 px-4 rounded-2xl text-sm focus:outline-none transition-all pr-8"
                      style={{ background: c.inputBg, border: `1.5px solid ${dobDay ? accent : c.inputBorder}`, color: dobDay ? c.text : c.textMuted }}
                    >
                      <option value="">{t.profileSetup.dobDay}</option>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={String(d).padStart(2, "0")} style={{ background: c.inputBg, color: c.text }}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke={c.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  {/* Month */}
                  <div className="relative">
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="w-full appearance-none py-4 px-4 rounded-2xl text-sm focus:outline-none transition-all pr-8"
                      style={{ background: c.inputBg, border: `1.5px solid ${dobMonth ? accent : c.inputBorder}`, color: dobMonth ? c.text : c.textMuted }}
                    >
                      <option value="">{t.profileSetup.dobMonth}</option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, "0")} style={{ background: c.inputBg, color: c.text }}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke={c.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  {/* Year */}
                  <div className="relative">
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="w-full appearance-none py-4 px-4 rounded-2xl text-sm focus:outline-none transition-all pr-8"
                      style={{ background: c.inputBg, border: `1.5px solid ${dobYear ? accent : c.inputBorder}`, color: dobYear ? c.text : c.textMuted }}
                    >
                      <option value="">{t.profileSetup.dobYear}</option>
                      {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((y) => (
                        <option key={y} value={String(y)} style={{ background: c.inputBg, color: c.text }}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke={c.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
                {dob && (
                  <p className="text-xs mt-1.5 ml-1 font-semibold" style={{ color: accent }}>
                    Age: {calcAge(dob)} years old
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-semibold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.gender}</label>
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((opt) => {
                    const sel = gender === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setGender(opt.value)}
                        className="flex flex-col items-center gap-3 py-5 rounded-3xl transition-all relative overflow-hidden"
                        style={
                          sel
                            ? { background: `linear-gradient(135deg, ${gender === "female" ? "#c084fc" : "#3b82f6"} 0%, ${accent} 50%, ${gender === "female" ? "#6b21a8" : "#1a3a8f"} 100%)`, boxShadow: `0 10px 28px rgba(${accentRgb},0.4), inset 0 1px 0 rgba(255,255,255,0.15)` }
                            : { background: c.card, border: `1.5px solid ${c.cardBorder}` }
                        }
                      >
                        {sel && <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />}
                        <div style={{ color: sel ? "white" : accent }} className="relative">{opt.icon}</div>
                        <span className="text-sm font-black relative" style={{ color: sel ? "white" : c.text }}>{opt.value === "male" ? t.common.male : t.common.female}</span>
                      </button>
                    );
                  })}
                </div>
                {!gender && (
                  <p className="text-xs mt-2 text-center font-semibold" style={{ color: "#F59E0B" }}>
                    ⚠️ Please select your gender to continue
                  </p>
                )}
              </div>
            </motion.div>
          )}


          {/* ── STEP 1: Rehabilitation ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className="text-xs font-semibold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.rehabLevel}</label>
                <div className="space-y-2.5">
                  {rehabilitationLevels.map((lvl) => (
                    <button
                      key={lvl.value}
                      onClick={() => setFitnessLevel(lvl.value)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
                      style={
                        fitnessLevel === lvl.value
                          ? { background: accent, boxShadow: `0 8px 24px rgba(${accentRgb},0.3)` }
                          : { background: c.card, border: `1px solid ${c.cardBorder}` }
                      }
                    >
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{
                          borderColor: fitnessLevel === lvl.value ? "white" : c.textMuted,
                          background: fitnessLevel === lvl.value ? "white" : "transparent",
                        }}
                      >
                        {fitnessLevel === lvl.value && <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-sm" style={{ color: fitnessLevel === lvl.value ? "white" : c.text }}>
                          {lvl.value === "Beginner" ? t.common.beginner : lvl.value === "Intermediate" ? t.common.intermediate : t.common.advanced}
                        </p>
                        <p className="text-xs" style={{ color: fitnessLevel === lvl.value ? "rgba(255,255,255,0.7)" : c.textMuted }}>
                          {lvl.value === "Beginner" ? t.profileSetup.rehabBeginner : lvl.value === "Intermediate" ? t.profileSetup.rehabIntermediate : t.profileSetup.rehabAdvanced}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.mainGoal}</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {goals.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
                      style={
                        goal === g.value
                          ? { background: accent, boxShadow: `0 8px 24px rgba(${accentRgb},0.3)` }
                          : { background: c.card, border: `1px solid ${c.cardBorder}` }
                      }
                    >
                      <div style={{ color: goal === g.value ? "white" : accent }}>{g.icon}</div>
                      <span className="text-xs font-bold" style={{ color: goal === g.value ? "white" : c.text }}>
                        {g.value === "Recovery & Performance" ? t.profileSetup.goalRecovery : g.value === "Build Muscle" ? t.profileSetup.goalStrength : g.value === "Lose Weight" ? t.profileSetup.goalRenforcement : t.profileSetup.goalFlexibility}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {(!fitnessLevel || !goal) && (
                <p className="text-xs text-center font-semibold mt-2" style={{ color: "#F59E0B" }}>
                  ⚠️ Please select a rehab level and a goal to continue
                </p>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Kiné ── */}
          {step === 2 && (
            <motion.div key="step2kine" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

              {/* Visited Kiné */}
              <div>
                <label className="text-xs font-bold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>
                  {t.profileSetup.visitedKine}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "yes", label: "Yes",
                      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                    },
                    {
                      value: "no", label: "No",
                      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
                    },
                  ].map((opt) => {
                    const sel = visitedKine === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setVisitedKine(opt.value)}
                        className="flex flex-col items-center gap-3 py-6 rounded-3xl transition-all relative overflow-hidden"
                        style={
                          sel
                            ? { background: `linear-gradient(135deg, ${gender === "female" ? "#c084fc" : "#3b82f6"} 0%, ${accent} 50%, ${gender === "female" ? "#6b21a8" : "#1a3a8f"} 100%)`, boxShadow: `0 10px 32px rgba(${accentRgb},0.4), inset 0 1px 0 rgba(255,255,255,0.15)` }
                            : { background: c.card, border: `1.5px solid ${c.cardBorder}` }
                        }
                      >
                        {sel && <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />}
                        <div style={{ color: sel ? "white" : accent }} className="relative">{opt.icon}</div>
                        <span className="text-sm font-black relative" style={{ color: sel ? "white" : c.text }}>{opt.value === "yes" ? t.common.yes : t.common.no}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pain Level */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold tracking-wider uppercase" style={{ color: c.textSub }}>{t.profileSetup.painLevel}</label>
                  <div
                    className="px-3 py-1 rounded-full font-black text-xs"
                    style={{
                      background: painLevel === undefined ? c.secondaryCard : painLevel <= 3 ? "rgba(34,197,94,0.15)" : painLevel <= 6 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                      color: painLevel === undefined ? c.textMuted : painLevel <= 3 ? "#22C55E" : painLevel <= 6 ? "#F59E0B" : "#EF4444",
                    }}
                  >
                    {painLevel === undefined ? "-" : painLevel}/10
                  </div>
                </div>
                <div className="flex gap-1.5 mb-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                    const active = painLevel !== undefined && n <= painLevel;
                    const isCurrent = n === painLevel;
                    const col = n <= 3 ? "#22C55E" : n <= 6 ? "#F59E0B" : "#EF4444";
                    return (
                      <button
                        key={n}
                        onClick={() => setPainLevel(n)}
                        className="flex-1 rounded-xl flex items-center justify-center font-black text-xs transition-all"
                        style={{
                          height: isCurrent ? 44 : 38,
                          background: active ? col : c.secondaryCard,
                          color: active ? "white" : c.textMuted,
                          boxShadow: isCurrent ? `0 6px 16px ${col}55` : "none",
                          transform: isCurrent ? "translateY(-2px)" : "none",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between px-0.5">
                  <span className="text-[10px] font-semibold" style={{ color: "#22C55E" }}>{t.profileSetup.noPain}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#EF4444" }}>{t.profileSetup.maxPain}</span>
                </div>
              </div>

              {/* Pain Zones */}
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <label className="text-xs font-bold tracking-wider uppercase" style={{ color: c.textSub }}>
                    {t.profileSetup.painZones}
                  </label>
                  <span className="text-[10px]" style={{ color: c.textMuted }}>({t.profileSetup.painZonesHint})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PAIN_ZONES.map((zone) => {
                    const selected = painZones.includes(zone.id);
                    return (
                      <button
                        key={zone.id}
                        onClick={() => togglePainZone(zone.id)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left relative overflow-hidden"
                        style={
                          selected
                            ? { background: `linear-gradient(135deg, ${gender === "female" ? "#c084fc" : "#3b82f6"} 0%, ${accent} 55%, ${gender === "female" ? "#6b21a8" : "#1a3a8f"} 100%)`, boxShadow: `0 6px 20px rgba(${accentRgb},0.35), inset 0 1px 0 rgba(255,255,255,0.12)` }
                            : { background: c.card, border: `1.5px solid ${c.cardBorder}` }
                        }
                      >
                        {selected && <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative"
                          style={{ background: selected ? "rgba(255,255,255,0.2)" : `rgba(${accentRgb},0.1)` }}>
                          <div style={{ color: selected ? "white" : accent }}>{zone.icon}</div>
                        </div>
                        <span className="text-sm font-bold relative" style={{ color: selected ? "white" : c.text }}>{zone.label}</span>
                        {selected && (
                          <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: "rgba(255,255,255,0.25)" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Documents ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="p-4 rounded-2xl" style={{ background: c.accentBg, border: `1px solid rgba(${accentRgb},0.2)` }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `rgba(${accentRgb},0.2)` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: c.text }}>{t.profileSetup.medicalDocs}</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      {t.profileSetup.medicalDocsHint}
                    </p>
                  </div>
                </div>
              </div>

              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple className="hidden" onChange={handleFileUpload} />

              {/* Uploaded files list */}
              {medicalDocs.length > 0 && (
                <div className="space-y-2">
                  {medicalDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="flex-1 text-xs font-semibold truncate" style={{ color: "#22C55E" }}>{doc}</p>
                      <button onClick={() => removeDoc(idx)} className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-6 rounded-2xl flex flex-col items-center gap-3 transition-all"
                style={{ background: c.inputBg, border: `2px dashed ${c.inputBorder}` }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: c.accentBg }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: c.text }}>
                    {medicalDocs.length > 0 ? t.profileSetup.addMoreDocs : t.profileSetup.uploadDoc}
                  </p>
                  <p className="text-xs mt-1" style={{ color: c.textMuted }}>PDF, JPG, PNG, DOC</p>
                </div>
              </button>

              <div className="p-4 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: c.text }}>{t.profileSetup.skip}</p>
                <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
                  Medical documents help our system create a safer, personalized workout plan. Your data is encrypted and private.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Wellness ── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="p-4 rounded-2xl" style={{ background: c.accentBg, border: `1px solid rgba(${accentRgb},0.2)` }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `rgba(${accentRgb},0.2)` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 14 21" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: c.text }}>{t.home.mood.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      This helps us set the right starting intensity for your rehabilitation plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { value: "exhausted", emoji: "😩", label: "Exhausted", desc: "I need rest — pain or fatigue is high", color: "#EF4444" },
                  { value: "low", emoji: "😔", label: "Low energy", desc: "Feeling tired, only light activity", color: "#F97316" },
                  { value: "ok", emoji: "😐", label: "Okay", desc: "Some discomfort, moderate activity okay", color: "#EAB308" },
                  { value: "good", emoji: "😊", label: "Good", desc: "Ready for structured rehabilitation", color: "#22C55E" },
                  { value: "great", emoji: "🤩", label: "Feeling great", desc: "Full capacity — let's push the session!", color: accent },
                ].map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInitialMood(mood.value)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left"
                    style={initialMood === mood.value
                      ? { background: mood.color + "18", border: `2px solid ${mood.color}`, boxShadow: `0 4px 16px ${mood.color}33` }
                      : { background: c.card, border: `1.5px solid ${c.cardBorder}` }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ background: initialMood === mood.value ? mood.color + "22" : c.secondaryCard }}>
                      {mood.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: initialMood === mood.value ? mood.color : c.text }}>{t.home.mood[mood.value as keyof Omit<typeof t.home.mood, "label">]}</p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: c.textMuted }}>{mood.desc}</p>
                    </div>
                    {initialMood === mood.value && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: mood.color }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-xs" style={{ color: c.textMuted }}>
                This is optional — you can always update this from your home screen.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-8 pt-4 shrink-0" style={{ borderTop: `1px solid ${c.divider}`, background: c.bg }}>
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.text }}
            >
              Back
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (step === 0 && (!!usernameError || checkingUsername || !username.trim() || !dobYear || !dobMonth || !dobDay || !phone.trim() || !gender)) return;
              if (step === 1 && (!fitnessLevel || !goal)) return;
              if (step === 2 && (!visitedKine || painLevel === undefined || painZones.length === 0)) return;
              if (step < 4) setStep((s) => s + 1);
              else handleComplete();
            }}
            disabled={
              (step === 0 && (!!usernameError || checkingUsername || !username.trim() || !dobYear || !dobMonth || !dobDay || !phone.trim() || !gender)) ||
              (step === 1 && (!fitnessLevel || !goal)) ||
              (step === 2 && (!visitedKine || painLevel === undefined || painZones.length === 0))
            }
            className="flex-1 py-4 rounded-2xl text-white font-bold"
            style={{
              background: (
                (step === 0 && (!!usernameError || checkingUsername || !username.trim() || !dobYear || !dobMonth || !dobDay || !phone.trim() || !gender)) ||
                (step === 1 && (!fitnessLevel || !goal)) ||
                (step === 2 && (!visitedKine || painLevel === undefined || painZones.length === 0))
              )
                ? "#64748B"
                : `linear-gradient(135deg, ${accent} 0%, ${gender === "female" ? "#6b21a8" : "#1a4bb5"} 100%)`,
              boxShadow: (
                (step === 0 && (!!usernameError || checkingUsername || !username.trim() || !dobYear || !dobMonth || !dobDay || !phone.trim() || !gender)) ||
                (step === 1 && (!fitnessLevel || !goal)) ||
                (step === 2 && (!visitedKine || painLevel === undefined || painZones.length === 0))
              )
                ? "none"
                : `0 12px 32px rgba(${accentRgb},0.35)`,
              fontSize: 15,
              opacity: (
                (step === 0 && (!!usernameError || checkingUsername || !username.trim() || !dobYear || !dobMonth || !dobDay || !phone.trim() || !gender)) ||
                (step === 1 && (!fitnessLevel || !goal)) ||
                (step === 2 && (!visitedKine || painLevel === undefined || painZones.length === 0))
              ) ? 0.6 : 1,
            }}
          >
            {step < 4 ? t.common.continue : t.onboarding.getStarted}
          </motion.button>
        </div>
        {step === 4 && (
          <button onClick={handleComplete} className="w-full text-center mt-3 text-sm font-semibold" style={{ color: c.textMuted }}>
            {t.profileSetup.skip}
          </button>
        )}
      </div>
    </div>
  );
}
