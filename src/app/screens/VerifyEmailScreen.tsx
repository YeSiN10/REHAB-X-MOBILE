import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useColors } from "../context/AppContext";
import logo from "../../imports/Carte_visite_Final.png";

export default function VerifyEmailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const c = useColors();
  const email: string = (location.state as { email?: string })?.email || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    sendCode();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendCode = async () => {
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.devCode) setDevCode(data.devCode);
    } catch {
      // offline fallback
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError("");
    setCode(["", "", "", "", "", ""]);
    setCountdown(60);
    await sendCode();
    setResending(false);
    inputRefs.current[0]?.focus();
  };

  const handleNumpadPress = (val: string) => {
    if (val === "del") {
      const firstEmpty = code.findIndex((c) => c === "");
      const idx = firstEmpty === -1 ? 5 : Math.max(0, firstEmpty - 1);
      const updated = [...code];
      updated[idx] = "";
      setCode(updated);
      setError("");
      inputRefs.current[idx]?.focus();
      return;
    }
    const firstEmpty = code.findIndex((c) => c === "");
    if (firstEmpty === -1) return;
    const updated = [...code];
    updated[firstEmpty] = val;
    setCode(updated);
    setError("");
    if (firstEmpty < 5) inputRefs.current[firstEmpty + 1]?.focus();
    else {
      handleVerify(updated);
    }
  };

  const handleVerify = async (codeArr = code) => {
    const fullCode = codeArr.join("");
    if (fullCode.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/profile-setup", { replace: true }), 1200);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const codeStr = code.join("");

  if (success) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(37,109,233,0.45) 0%, transparent 65%)" }} />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.2)", border: "2px solid rgba(34,197,94,0.5)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-white font-black text-2xl">Verified!</h2>
          <p className="text-white/60 text-sm">Setting up your profile...</p>
        </motion.div>
      </div>
    );
  }

  const numpadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: c.bg }}>
      {/* Curved Gradient Header */}
      <div
        className="relative px-6 pt-14 pb-8 shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.55) 0%, transparent 65%)" }} />

        {/* Back button */}
        <button onClick={() => navigate("/signup")} className="absolute top-5 left-5 w-10 h-10 rounded-2xl flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <img src={logo} alt="REHAB X" className="w-7 h-7 object-contain" />
          </div>
          <span className="tracking-[3px] uppercase font-black" style={{ fontSize: 15, color: "white" }}>
            REHAB<span style={{ color: "#60a5fa" }}>X</span>
          </span>
        </div>

        {/* Envelope icon */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="white" strokeWidth="1.8" />
              <path d="M3 9L12 14L21 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-white font-black mb-1" style={{ fontSize: 24 }}>Check Your Email</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            We sent a 6-digit code to
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: "#60a5fa" }}>
            {email || "your email"}
          </p>
        </div>
      </div>

      {/* Dev code banner */}
      {devCode ? (
        <div className="mx-5 mt-4 px-4 py-2.5 rounded-2xl flex items-center gap-2"
          style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <span style={{ fontSize: 14 }}>🔑</span>
          <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
            Dev mode — your code: <span className="font-black tracking-widest">{devCode}</span>
          </p>
        </div>
      ) : null}

      {/* Code boxes */}
      <div className="flex justify-center gap-3 px-6 mt-6">
        {code.map((digit, i) => (
          <motion.div
            key={i}
            animate={digit ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.18 }}
            className="w-11 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: digit ? "rgba(37,109,233,0.15)" : c.card,
              border: `2px solid ${digit ? "#256DE9" : c.cardBorder}`,
              boxShadow: digit ? "0 4px 16px rgba(37,109,233,0.25)" : "none",
            }}
          >
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="none"
              readOnly
              value={digit}
              className="w-full h-full text-center bg-transparent focus:outline-none font-black"
              style={{ fontSize: 22, color: digit ? "#256DE9" : c.textMuted }}
            />
          </motion.div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-xs font-semibold mt-3 px-6"
            style={{ color: "#EF4444" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center mt-3">
          <div className="w-5 h-5 border-2 border-[#256DE9]/30 border-t-[#256DE9] rounded-full animate-spin" />
        </div>
      )}

      {/* Resend */}
      <div className="text-center mt-4">
        {countdown > 0 ? (
          <p className="text-xs" style={{ color: c.textMuted }}>
            Resend code in <span className="font-bold" style={{ color: "#256DE9" }}>{countdown}s</span>
          </p>
        ) : (
          <button onClick={handleResend} disabled={resending} className="text-xs font-bold" style={{ color: "#256DE9" }}>
            {resending ? "Sending..." : "Resend Code"}
          </button>
        )}
      </div>

      {/* Numpad */}
      <div className="flex-1" />
      <div className="px-6 pb-6 shrink-0">
        <div className="grid grid-cols-3 gap-2.5">
          {numpadKeys.flat().map((key, idx) => {
            if (key === "") return <div key={idx} />;
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.92 }}
                onClick={() => !loading && handleNumpadPress(key)}
                disabled={loading}
                className="h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: key === "del" ? c.secondaryCard : c.card,
                  border: `1px solid ${c.cardBorder}`,
                  boxShadow: c.shadow,
                }}
              >
                {key === "del" ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M21 4H8L1 12L8 20H21C21.5523 20 22 19.5523 22 19V5C22 4.44772 21.5523 4 21 4Z" stroke={c.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 9L12 15M12 9L18 15" stroke={c.text} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="font-black" style={{ fontSize: 22, color: c.text }}>{key}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Manual verify button shown only when all 6 digits are entered */}
        {codeStr.length === 6 && !loading && (
          <motion.button
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleVerify()}
            className="w-full mt-4 py-4 rounded-2xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #256DE9 0%, #1a4bb5 100%)", boxShadow: "0 12px 32px rgba(37,109,233,0.35)", fontSize: 16 }}
          >
            Verify Code
          </motion.button>
        )}
      </div>
    </div>
  );
}
