import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import imgGoogle from "../../imports/Frame5/9e370cba9e445e60441d9117342a69eb0f5682cb.png";
import imgApple from "../../imports/Frame5/1124af59bd4f33acef499c3ca25ecd39752b18c9.png";
import logo from "../../imports/Carte_visite_Final.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isStrongPassword = (p: string) =>
  p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useApp();
  const c = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showToast, setShowToast] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(user.profileSetupDone ? "/home" : "/profile-setup", { replace: true });
    }
  }, [isAuthenticated]);

  const showToastMsg = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email address is required";
    else if (!emailRegex.test(email)) e.email = "Please enter a valid email address (e.g. name@domain.com)";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setErrors({ general: result.error });
    } else {
      navigate(user.profileSetupDone ? "/home" : "/profile-setup", { replace: true });
    }
  };

  const handleSocialLogin = (provider: "Google" | "Apple") => {
    setDemoLoading(provider);
    showToastMsg(`${provider} Sign In — Demo Mode`);
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
      <div className="px-6 pt-16 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full pointer-events-none" style={{ background: c.headerGlow }} />

        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#256DE9" }}>
            <img src={logo} alt="REHAB X" className="w-8 h-8 object-contain" />
          </div>
          <span className="tracking-[3px] uppercase" style={{ fontSize: 18, fontWeight: 900, color: c.text }}>
            REHAB<span style={{ color: "#256DE9" }}>X</span>
          </span>
        </div>

        <h1 className="mb-2" style={{ fontSize: 30, fontWeight: 800, color: c.text }}>Welcome back 👋</h1>
        <p style={{ fontSize: 14, color: c.textMuted }}>Sign in to continue your recovery journey</p>
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

          {/* Email */}
          <div>
            <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke={errors.email ? "#EF4444" : c.textMuted} strokeWidth="1.8" />
                  <path d="M3 9L12 14L21 9" stroke={errors.email ? "#EF4444" : c.textMuted} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }}
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm transition-all focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.email ? "#EF4444" : c.inputBorder }}
                placeholder="your@email.com"
                onFocus={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#256DE9")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : c.inputBorder)}
              />
            </div>
            {errors.email && <p className="text-xs mt-1.5 ml-1" style={{ color: "#EF4444" }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold mb-2 block tracking-wider uppercase" style={{ color: c.textSub }}>Password</label>
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
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3L21 21M10.584 10.587C10.2187 10.9524 10 11.4501 10 12C10 13.1046 10.8954 14 12 14C12.5499 14 13.0476 13.78 13.413 13.416M7.362 7.36C5.68 8.47 4.273 10.06 3.34 12C4.73 14.9 7.76 17 12 17C13.544 17 14.953 16.64 16.192 16M9.9 4.24C10.588 4.08 11.294 4 12 4C16.24 4 19.27 6.1 20.66 9C20.293 9.74 19.843 10.42 19.32 11.04" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.34 12C4.73 9.1 7.76 7 12 7C16.24 7 19.27 9.1 20.66 12C19.27 14.9 16.24 17 12 17C7.76 17 4.73 14.9 3.34 12Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1.5 ml-1" style={{ color: "#EF4444" }}>{errors.password}</p>}
            {!errors.password && (
              <p className="text-[10px] mt-1.5 ml-1" style={{ color: c.textMuted }}>
                Min. 8 characters · 1 uppercase · 1 number
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button className="text-[#256DE9] text-sm font-semibold">Forgot Password?</button>
          </div>

          {/* Login button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #256DE9 0%, #1a4bb5 100%)", boxShadow: "0 16px 40px rgba(37,109,233,0.35)", fontSize: 16 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : "Sign In"}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: c.divider }} />
            <span className="text-xs font-medium" style={{ color: c.textMuted }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: c.divider }} />
          </div>

          {/* Social — demo mode */}
          <div className="flex gap-3">
            {(["Google", "Apple"] as const).map((provider) => (
              <button
                key={provider}
                onClick={() => handleSocialLogin(provider)}
                disabled={!!demoLoading}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.textSub }}
              >
                {demoLoading === provider ? (
                  <span className="w-4 h-4 border-2 border-[#256DE9]/30 border-t-[#256DE9] rounded-full animate-spin" />
                ) : (
                  <img
                    src={provider === "Google" ? imgGoogle : imgApple}
                    alt={provider} className="w-5 h-5 object-contain"
                  />
                )}
                {provider}
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm" style={{ color: c.textMuted }}>Don't have an account? </span>
            <button onClick={() => navigate("/signup")} className="text-[#256DE9] text-sm font-bold">Create Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
