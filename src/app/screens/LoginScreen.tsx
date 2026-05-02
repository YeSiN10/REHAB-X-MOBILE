import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import logo from "../../imports/Carte_visite_Final.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void; auto_select?: boolean }) => void;
          prompt: () => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, user } = useApp();
  const c = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showToast, setShowToast] = useState<{ msg: string; type: "info" | "error" | "success" } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user.profileSetupDone ? "/home" : "/profile-setup", { replace: true });
    }
  }, [isAuthenticated]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      initGoogle();
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, []);

  const initGoogle = () => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
    });
  };

  const handleGoogleCredential = async (response: { credential: string }) => {
    setSocialLoading("Google");
    const result = await loginWithGoogle(response.credential);
    setSocialLoading(null);
    if (result.error) {
      showToastMsg(result.error, "error");
    } else {
      navigate(user.profileSetupDone ? "/home" : "/profile-setup", { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      showToastMsg("Google Sign-In not configured. Use VITE_GOOGLE_CLIENT_ID env var.", "error");
      return;
    }
    if (window.google) {
      setSocialLoading("Google");
      window.google.accounts.id.prompt();
      // Prompt may close without callback if dismissed; reset loading after 5s
      setTimeout(() => setSocialLoading(null), 5000);
    }
  };

  const handleAppleLogin = () => {
    showToastMsg("Apple Sign-In requires Apple Developer account setup.", "info");
  };

  const showToastMsg = (msg: string, type: "info" | "error" | "success" = "info") => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 3500);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email address is required";
    else if (!emailRegex.test(email)) e.email = "Please enter a valid email address";
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

  const inputStyle = {
    background: c.inputBg,
    border: `1px solid ${c.inputBorder}`,
    caretColor: "#256DE9",
    color: c.text,
  };

  const toastBg = showToast?.type === "error"
    ? "#EF4444"
    : showToast?.type === "success"
    ? "#22C55E"
    : "#256DE9";

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: c.bg }}>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: toastBg, boxShadow: `0 8px 24px ${toastBg}60` }}
          >
            <span className="text-sm font-medium text-white flex-1">{showToast.msg}</span>
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

          {/* Social buttons */}
          <div className="flex gap-3">
            {/* Google */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleLogin}
              disabled={!!socialLoading}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.textSub }}
            >
              {socialLoading === "Google" ? (
                <span className="w-4 h-4 border-2 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </motion.button>

            {/* Apple */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAppleLogin}
              disabled={!!socialLoading}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.textSub }}
            >
              {socialLoading === "Apple" ? (
                <span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 814 1000" fill={c.text}>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.3 130.3-316.7 258.4-316.7 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
              )}
              Apple
            </motion.button>
          </div>

          {!GOOGLE_CLIENT_ID && (
            <p className="text-center text-[10px]" style={{ color: c.textMuted }}>
              Social login needs VITE_GOOGLE_CLIENT_ID configured
            </p>
          )}

          <div className="mt-4 text-center">
            <span className="text-sm" style={{ color: c.textMuted }}>Don't have an account? </span>
            <button onClick={() => navigate("/signup")} className="text-[#256DE9] text-sm font-bold">Create Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
