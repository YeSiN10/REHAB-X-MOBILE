import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import logo from "../../imports/Carte_visite_Final.png";

const genderOptions = [
  { value: "male",   label: "Male",   emoji: "👨" },
  { value: "female", label: "Female", emoji: "👩" },
  { value: "other",  label: "Other",  emoji: "🧑" },
];
const fitnessLevels = [
  { value: "Beginner",     label: "Beginner",     desc: "Just starting out" },
  { value: "Intermediate", label: "Intermediate", desc: "Some experience" },
  { value: "Advanced",     label: "Advanced",     desc: "Well experienced" },
];
const goals = [
  { value: "Recovery & Performance", label: "Recovery",    emoji: "🏥" },
  { value: "Build Muscle",           label: "Muscle",      emoji: "💪" },
  { value: "Lose Weight",            label: "Weight Loss", emoji: "⚡" },
  { value: "Flexibility",            label: "Flexibility", emoji: "🧘" },
];

export default function ProfileSetupScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const c = useColors();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [fitnessLevel, setFitnessLevel] = useState(user.fitnessLevel || "Intermediate");
  const [goal, setGoal] = useState(user.goal || "Recovery & Performance");
  const [medicalDoc, setMedicalDoc] = useState(user.medicalDoc || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [completing, setCompleting] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMedicalDoc(file.name);
  };

  const handleComplete = () => {
    setCompleting(true);
    updateUser({ age, gender, fitnessLevel, goal, medicalDoc, profileSetupDone: true, avatar });
    setTimeout(() => navigate("/home"), 2000);
  };

  const steps = ["Personal", "Fitness", "Documents"];

  if (completing) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: c.bg }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(37,109,233,0.12) 0%, transparent 65%)" }} />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center gap-6 z-10"
        >
          <div className="relative">
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(37,109,233,0.3)", "0 0 0 20px rgba(37,109,233,0)", "0 0 0 0 rgba(37,109,233,0)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: "#256DE9", border: "3px solid rgba(37,109,233,0.2)" }}
            >
              {/* Always show REHAB X logo, not user photo */}
              <img src={logo} alt="REHAB X" className="w-16 h-16 object-contain" />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
            <h2 className="font-black mb-2" style={{ fontSize: 24, color: c.text }}>Welcome aboard!</h2>
            <p className="text-sm" style={{ color: c.textMuted }}>Setting up your experience...</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-40 h-1 rounded-full overflow-hidden" style={{ background: c.secondaryCard }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full rounded-full bg-[#256DE9]"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: c.bg }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-5 shrink-0" style={{ borderBottom: `1px solid ${c.divider}` }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#256DE9" }}>
            <img src={logo} alt="REHAB X" className="w-6 h-6 object-contain" />
          </div>
          <span className="tracking-widest uppercase font-black" style={{ fontSize: 14, color: c.text }}>
            REHAB<span style={{ color: "#256DE9" }}>X</span>
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: c.text }}>Set Up Your Profile</h1>
        <p className="mt-1 text-sm" style={{ color: c.textMuted }}>Help us personalize your recovery journey</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i <= step ? "#256DE9" : c.secondaryCard }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {steps.map((s, i) => (
            <span key={s} className="text-[10px] font-semibold"
              style={{ color: i <= step ? "#256DE9" : c.textMuted }}>
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
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Avatar selector */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold tracking-wider uppercase self-start" style={{ color: c.textSub }}>
                  Profile Photo
                </p>
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: avatar ? "transparent" : "linear-gradient(135deg, #256DE9, #1a4bb5)",
                      border: avatar ? `3px solid #256DE9` : "none",
                      boxShadow: "0 8px 24px rgba(37,109,233,0.25)",
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
                    style={{ background: "#256DE9", border: `2px solid ${c.bg}`, boxShadow: "0 4px 12px rgba(37,109,233,0.4)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
                    </svg>
                  </button>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="text-xs font-semibold"
                  style={{ color: "#256DE9" }}
                >
                  {avatar ? "Change Photo" : "Upload Photo"}
                </button>
              </div>

              {/* Name editable — Username */}
              <div>
                <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>Username</label>
                <input
                  type="text"
                  defaultValue={user.name || ""}
                  onBlur={(e) => {
                    updateUser({ name: e.target.value });
                    e.target.style.borderColor = c.inputBorder;
                  }}
                  className="w-full px-4 py-4 rounded-2xl text-sm focus:outline-none transition-all"
                  style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: "#256DE9" }}
                  placeholder="Enter your username"
                  onFocus={(e) => (e.target.style.borderColor = "#256DE9")}
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>Age</label>
                <input
                  type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl text-sm focus:outline-none transition-all"
                  style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: "#256DE9" }}
                  placeholder="Enter your age" min="10" max="100"
                  onFocus={(e) => (e.target.style.borderColor = "#256DE9")}
                  onBlur={(e) => (e.target.style.borderColor = c.inputBorder)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-semibold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGender(opt.value)}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
                      style={
                        gender === opt.value
                          ? { background: "#256DE9", boxShadow: "0 8px 24px rgba(37,109,233,0.35)" }
                          : { background: c.card, border: `1px solid ${c.cardBorder}` }
                      }
                    >
                      <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: gender === opt.value ? "white" : c.text }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Fitness ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <label className="text-xs font-semibold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>Fitness Level</label>
                <div className="space-y-2.5">
                  {fitnessLevels.map((lvl) => (
                    <button
                      key={lvl.value}
                      onClick={() => setFitnessLevel(lvl.value)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
                      style={
                        fitnessLevel === lvl.value
                          ? { background: "#256DE9", boxShadow: "0 8px 24px rgba(37,109,233,0.3)" }
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
                        {fitnessLevel === lvl.value && <div className="w-2.5 h-2.5 rounded-full bg-[#256DE9]" />}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-sm" style={{ color: fitnessLevel === lvl.value ? "white" : c.text }}>
                          {lvl.label}
                        </p>
                        <p className="text-xs" style={{ color: fitnessLevel === lvl.value ? "rgba(255,255,255,0.7)" : c.textMuted }}>
                          {lvl.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-3 block tracking-wider uppercase" style={{ color: c.textSub }}>Primary Goal</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {goals.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
                      style={
                        goal === g.value
                          ? { background: "#256DE9", boxShadow: "0 8px 24px rgba(37,109,233,0.3)" }
                          : { background: c.card, border: `1px solid ${c.cardBorder}` }
                      }
                    >
                      <span style={{ fontSize: 22 }}>{g.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: goal === g.value ? "white" : c.text }}>
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="p-4 rounded-2xl" style={{ background: c.accentBg, border: "1px solid rgba(37,109,233,0.2)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(37,109,233,0.2)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#256DE9" strokeWidth="1.8" />
                      <path d="M12 8V12M12 16H12.01" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: c.text }}>Medical Documents</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      Upload relevant medical records, injury reports, or doctor notes for a personalized plan.
                    </p>
                  </div>
                </div>
              </div>

              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-2xl flex flex-col items-center gap-3 transition-all"
                style={{
                  background: medicalDoc ? "rgba(34,197,94,0.06)" : c.inputBg,
                  border: `2px dashed ${medicalDoc ? "#22C55E" : c.inputBorder}`,
                }}
              >
                {medicalDoc ? (
                  <>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm" style={{ color: "#22C55E" }}>File Uploaded!</p>
                      <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{medicalDoc}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setMedicalDoc(""); }}
                      className="text-xs font-semibold" style={{ color: "#EF4444" }}>Remove</button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: c.accentBg }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm" style={{ color: c.text }}>Upload Medical Documents</p>
                      <p className="text-xs mt-1" style={{ color: c.textMuted }}>PDF, JPG, PNG, DOC supported</p>
                    </div>
                  </>
                )}
              </button>

              <div className="p-4 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: c.text }}>This step is optional</p>
                <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
                  Medical documents help our system create a safer, personalized workout plan. Your data is encrypted and private.
                </p>
              </div>
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
            onClick={() => { if (step < 2) setStep((s) => s + 1); else handleComplete(); }}
            className="flex-1 py-4 rounded-2xl text-white font-bold"
            style={{
              background: "linear-gradient(135deg, #256DE9 0%, #1a4bb5 100%)",
              boxShadow: "0 12px 32px rgba(37,109,233,0.35)",
              fontSize: 15,
            }}
          >
            {step < 2 ? "Continue" : "Get Started 🚀"}
          </motion.button>
        </div>
        {step === 2 && (
          <button onClick={handleComplete} className="w-full text-center mt-3 text-sm font-semibold" style={{ color: c.textMuted }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}