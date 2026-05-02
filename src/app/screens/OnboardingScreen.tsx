import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import logo from "../../imports/Carte_visite_Final.png";

const slides = [
  {
    title: "Recover Smarter",
    subtitle: "Science-backed VR rehabilitation programs designed by physiotherapy experts",
    icon: (
      <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.12)" />
        <path d="M30 50 C30 38 40 28 50 28 C60 28 70 38 70 50" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 54 L74 54" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M35 54 L35 68 C35 70 37 72 39 72 L61 72 C63 72 65 70 65 68 L65 54" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="44" r="6" fill="white" />
        <path d="M44 70 L44 78" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M56 70 L56 78" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    tag: "REHABILITATION",
  },
  {
    title: "Track Every Rep",
    subtitle: "Real-time VR workout tracking with intelligent progress analytics and insights",
    icon: (
      <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
        <rect x="15" y="55" width="10" height="30" rx="3" fill="rgba(255,255,255,0.6)" />
        <rect x="30" y="40" width="10" height="45" rx="3" fill="rgba(255,255,255,0.7)" />
        <rect x="45" y="30" width="10" height="55" rx="3" fill="rgba(255,255,255,0.85)" />
        <rect x="60" y="20" width="10" height="65" rx="3" fill="white" />
        <rect x="75" y="35" width="10" height="50" rx="3" fill="rgba(255,255,255,0.65)" />
        <path d="M15 55 L35 40 L50 30 L65 20 L80 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
        <circle cx="15" cy="55" r="3.5" fill="white" />
        <circle cx="35" cy="40" r="3.5" fill="white" />
        <circle cx="50" cy="30" r="3.5" fill="white" />
        <circle cx="65" cy="20" r="3.5" fill="white" />
        <circle cx="80" cy="35" r="3.5" fill="white" />
      </svg>
    ),
    tag: "ANALYTICS",
  },
  {
    title: "Camera Motion AI",
    subtitle: "Your phone's camera tracks your movement in real-time for perfect form correction",
    icon: (
      <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
        <rect x="15" y="30" width="70" height="50" rx="8" fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="2.5" />
        <circle cx="50" cy="55" r="14" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.5" />
        <circle cx="50" cy="55" r="7" fill="white" />
        <rect x="38" y="22" width="24" height="8" rx="4" fill="white" />
        <circle cx="72" cy="40" r="3.5" fill="rgba(255,255,255,0.7)" />
      </svg>
    ),
    tag: "VR MOTION TRACKING",
  },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigate("/login");
  };

  const slide = slides[current];

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a4bb5 0%, #256DE9 45%, #1a3580 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="absolute bottom-[-80px] left-[-40px] w-[260px] h-[260px] rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }} />

      {/* Header with logo + skip */}
      <div className="flex items-center justify-between px-6 pt-16 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
            <img src={logo} alt="REHAB X" className="w-6 h-6 object-contain mx-auto mt-1" />
          </div>
          <span className="text-white font-black tracking-[3px] uppercase text-sm">
            REHAB<span style={{ opacity: 0.7 }}>X</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-semibold"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Skip
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            {/* Tag */}
            <div
              className="px-4 py-1.5 rounded-full mb-8"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <span className="text-white text-[11px] font-bold tracking-[2px]">{slide.tag}</span>
            </div>

            {/* Icon */}
            <div
              className="w-[180px] h-[180px] rounded-[48px] flex items-center justify-center mb-10 relative"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
              }}
            >
              {slide.icon}
            </div>

            {/* Text */}
            <h1 className="text-white mb-4" style={{ fontSize: 30, fontWeight: 800 }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: 15, lineHeight: "1.7", color: "rgba(255,255,255,0.75)" }}>
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-14 z-10">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}>
              <motion.div
                animate={{
                  width: i === current ? 24 : 8,
                  background: i === current ? "white" : "rgba(255,255,255,0.35)",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            </button>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="w-full py-4 rounded-2xl font-bold"
          style={{
            background: "white",
            color: "#256DE9",
            fontSize: 16,
            boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
          }}
        >
          {current < slides.length - 1 ? "Continue" : "Get Started"}
        </motion.button>

        {/* Sign in */}
        <div className="text-center mt-5">
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Already have an account? </span>
          <button onClick={() => navigate("/login")} className="text-white text-sm font-bold">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}