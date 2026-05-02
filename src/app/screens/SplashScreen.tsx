import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import logo from "../../imports/Carte_visite_Final.png";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 40);
    const timer = setTimeout(() => navigate("/onboarding"), 2500);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [navigate]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a4bb5 0%, #256DE9 45%, #1a3580 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="absolute bottom-[-120px] left-[-60px] w-[320px] h-[320px] rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }} />

      {/* Animated rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: 120 + i * 90,
            height: 120 + i * 90,
            animation: `ping-slow ${1.5 + i * 0.5}s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Logo + content */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-6 z-10"
      >
        {/* Logo circle */}
        <div className="relative">
          <div
            className="w-[100px] h-[100px] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              boxShadow: "0 0 0 3px rgba(255,255,255,0.1), 0 24px 48px rgba(0,0,0,0.2)",
            }}
          >
            <img src={logo} alt="REHAB X" className="w-16 h-16 object-contain" />
          </div>
          <div
            className="absolute inset-[-6px] rounded-full border-2 border-white/20"
            style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
          />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="tracking-[8px] uppercase"
            style={{ fontSize: 40, fontWeight: 900, color: "white", letterSpacing: 10 }}
          >
            REHAB<span style={{ color: "rgba(255,255,255,0.7)" }}>X</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="tracking-[4px] uppercase mt-1"
            style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}
          >
            Recovery & Performance
          </motion.p>
        </div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-[160px]"
        >
          <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%`, background: "white" }}
            />
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(0.9); opacity: 0.3; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}