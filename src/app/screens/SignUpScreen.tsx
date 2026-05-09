import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import { useT } from "../i18n";
import imgGoogle from "../../imports/Frame5/9e370cba9e445e60441d9117342a69eb0f5682cb.png";
import imgApple from "../../imports/Frame5/1124af59bd4f33acef499c3ca25ecd39752b18c9.png";
import logo from "../../imports/Carte_visite_Final.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
const isStrongPassword = (p: string) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

const strengthLevel = (p: string): { label: string; color: string; bars: number } => {
  if (!p) return { label: "", color: c_default, bars: 0 };
  if (p.length < 6) return { label: "Weak", color: "#EF4444", bars: 1 };
  if (!isStrongPassword(p)) return { label: "Fair", color: "#EAB308", bars: 2 };
  if (p.length >= 12 && /[^A-Za-z0-9]/.test(p)) return { label: "Very Strong", color: "#22C55E", bars: 4 };
  return { label: "Strong", color: "#256DE9", bars: 3 };
};
const c_default = "#475569";

export default function SignUpScreen() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useApp();
  const c = useColors();
  const t = useT();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [showToast, setShowToast] = useState<string | null>(null);

  const strength = strengthLevel(password);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/profile-setup", { replace: true });
  }, [isAuthenticated]);

  const showToastMsg = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const checkUsernameAvailable = async (val: string) => {
    if (!val.trim()) return;
    setCheckingName(true);
    try {
      const res = await fetch(`/api/username-available?username=${encodeURIComponent(val.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.available) {
          setErrors((e) => ({ ...e, name: "This username is already taken. Please choose another." }));
        } else {
          setErrors((e) => ({ ...e, name: undefined }));
        }
      }
    } catch { /* offline — skip check */ }
    finally { setCheckingName(false); }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Username is required";
    else if (errors.name) e.name = errors.name;
    if (!email) e.email = "Email or phone number is required";
    else if (!emailRegex.test(email) && !phoneRegex.test(email)) e.email = "Please enter a valid email or phone number";
    if (!password) e.password = "Password is required";
    else if (!isStrongPassword(password)) e.password = "Password must be 8+ chars, 1 uppercase, 1 number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    // Always re-check username right before submitting (catches cases where user never blurred the field)
    if (name.trim()) {
      setCheckingName(true);
      try {
        const res = await fetch(`/api/username-available?username=${encodeURIComponent(name.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.available) {
            setErrors((e) => ({ ...e, name: "This username is already taken. Please choose another." }));
            setCheckingName(false);
            return;
          }
        }
      } catch { /* offline — proceed */ }
      setCheckingName(false);
    }
    setLoading(true);
    setErrors({});
    const result = await register(name.trim(), email, password);
    setLoading(false);
    if (result.error) {
      setErrors({ general: result.error });
    } else {
      navigate("/verify-email", { replace: true, state: { email } });
    }
  };

  const handleSocialSignup = (provider: "Google" | "Apple") => {
    setDemoLoading(provider);
    showToastMsg(`${provider} Sign Up — Demo Mode`);
    setTimeout(() => {
      setDemoLoading(null);
      showToastMsg("Social login not available in demo");
    }, 1500);
  };

  const inputStyle = {
    background: c.inputBg,
    border: `1px solid ${c.inputBorder}`,
    caretColor: "#256DE9",
    color: c.text,
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: c.bg }}>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "#256DE9", boxShadow: "0 8px 24px rgba(37,109,233,0.4)" }}
          >
            <span className="text-sm font-medium text-white flex-1">{showToast}</span>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[250px] h-[250px] rounded-full pointer-events-none" style={{ background: c.headerGlow }} />

        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate("/login")} className="flex items-center gap-2" style={{ color: c.textSub }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-semibold">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#256DE9" }}>
              <img src={logo} alt="REHAB X" className="w-6 h-6 object-contain" />
            </div>
            <span className="tracking-[2px] uppercase font-black" style={{ fontSize: 14, color: c.text }}>
              REHAB<span style={{ color: "#256DE9" }}>X</span>
            </span>
          </div>
        </div>

        <h1 className="mb-2" style={{ fontSize: 28, fontWeight: 800, color: c.text }}>{t.signup.title}</h1>
        <p style={{ fontSize: 14, color: c.textMuted }}>{t.signup.subtitle}</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
        <div className="space-y-4">
          {errors.general && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {errors.general}
            </div>
          )}
          {/* Username */}
          <div>
            <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.signup.username}</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke={errors.name ? "#EF4444" : c.textMuted} strokeWidth="1.8" />
                  <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke={errors.name ? "#EF4444" : c.textMuted} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text" value={name}
                onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }}
                className="w-full pl-11 pr-10 py-4 rounded-2xl text-sm transition-all focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.name ? "#EF4444" : c.inputBorder }}
                placeholder="Your username"
                onFocus={(e) => (e.target.style.borderColor = errors.name ? "#EF4444" : "#256DE9")}
                onBlur={(e) => { e.target.style.borderColor = errors.name ? "#EF4444" : c.inputBorder; checkUsernameAvailable(e.target.value); }}
              />
              {checkingName && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#256DE9]/30 border-t-[#256DE9] rounded-full animate-spin" />
                </div>
              )}
              {!checkingName && name.trim() && !errors.name && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
            {errors.name && <p className="text-xs mt-1.5 ml-1" style={{ color: "#EF4444" }}>{errors.name}</p>}
          </div>

          {/* Email or Phone */}
          <div>
            <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.login.emailOrPhone}</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke={errors.email ? "#EF4444" : c.textMuted} strokeWidth="1.8" />
                  <path d="M3 9L12 14L21 9" stroke={errors.email ? "#EF4444" : c.textMuted} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }}
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm transition-all focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.email ? "#EF4444" : c.inputBorder }}
                placeholder="email@example.com or +1 234 567 8900"
                onFocus={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#256DE9")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : c.inputBorder)}
              />
            </div>
            {errors.email && <p className="text-xs mt-1.5 ml-1" style={{ color: "#EF4444" }}>{errors.email}</p>}
          </div>

          {/* Password + strength */}
          <div>
            <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>{t.login.password}</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke={errors.password ? "#EF4444" : c.textMuted} strokeWidth="1.8" />
                  <path d="M8 11V7C8 5.34 9.34 4 11 4H13C14.66 4 16 5.34 16 7V11" stroke={errors.password ? "#EF4444" : c.textMuted} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type={showPass ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }}
                className="w-full pl-11 pr-12 py-4 rounded-2xl text-sm transition-all focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.password ? "#EF4444" : c.inputBorder }}
                placeholder="••••••••"
                onFocus={(e) => (e.target.style.borderColor = errors.password ? "#EF4444" : "#256DE9")}
                onBlur={(e) => (e.target.style.borderColor = errors.password ? "#EF4444" : c.inputBorder)}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: c.textMuted }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3.34 12C4.73 9.1 7.76 7 12 7C16.24 7 19.27 9.1 20.66 12C19.27 14.9 16.24 17 12 17C7.76 17 4.73 14.9 3.34 12Z" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            </div>

            {/* Password strength */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div key={bar} className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: bar <= strength.bars ? strength.color : c.secondaryCard }} />
                  ))}
                </div>
                <p className="text-[10px] font-semibold" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-xs mt-1.5 ml-1" style={{ color: "#EF4444" }}>{errors.password}</p>}
            {!errors.password && !password && (
              <p className="text-[10px] mt-1.5 ml-1" style={{ color: c.textMuted }}>
                Min. 8 chars · 1 uppercase · 1 number for security
              </p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #256DE9 0%, #1a4bb5 100%)", boxShadow: "0 16px 40px rgba(37,109,233,0.35)", fontSize: 16 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.signup.creating}
              </span>
            ) : t.signup.createAccount}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: c.divider }} />
            <span className="text-xs font-medium" style={{ color: c.textMuted }}>{t.signup.orSignUpWith}</span>
            <div className="flex-1 h-px" style={{ background: c.divider }} />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            {(["Google", "Apple"] as const).map((provider) => (
              <button
                key={provider}
                onClick={() => handleSocialSignup(provider)}
                disabled={!!demoLoading}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.textSub }}
              >
                {demoLoading === provider ? (
                  <span className="w-4 h-4 border-2 border-[#256DE9]/30 border-t-[#256DE9] rounded-full animate-spin" />
                ) : (
                  <img src={provider === "Google" ? imgGoogle : imgApple} alt={provider} className="w-5 h-5 object-contain" />
                )}
                {provider}
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm" style={{ color: c.textMuted }}>{t.signup.alreadyHaveAccount} </span>
            <button onClick={() => navigate("/login")} className="text-[#256DE9] text-sm font-bold">{t.login.signIn}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
