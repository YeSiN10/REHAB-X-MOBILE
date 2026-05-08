import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import logo from "../../imports/Carte_visite_Final.png";

const features = [
  { icon: "⚡", title: "Advanced Exercises", desc: "60+ premium rehab programs", pro: true },
  { icon: "🤖", title: "AI Assistant", desc: "24/7 app & rehab guidance", pro: true },
  { icon: "👨‍⚕️", title: "Doctor Messaging", desc: "Chat directly with your kinés", pro: true },
  { icon: "📊", title: "Advanced Analytics", desc: "Deep performance insights", pro: true },
  { icon: "🎥", title: "HD Video Guides", desc: "Step-by-step expert demos", pro: true },
  { icon: "💊", title: "Nutrition Plans", desc: "Custom meal planning tools", pro: true },
];

const plans = [
  { id: "monthly", label: "Monthly", price: "$12.99", period: "/month", savings: null, popular: false },
  { id: "annual", label: "Annual", price: "$7.99", period: "/month", savings: "Save 38%", popular: true },
];

export default function PremiumScreen() {
  const navigate = useNavigate();
  const { setIsPremium, isPremium } = useApp();
  const c = useColors();
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setIsPremium(true);
      setLoading(false);
      navigate(-1);
    }, 1500);
  };

  if (isPremium) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ background: c.bg }}>
        <button onClick={() => navigate(-1)} className="absolute top-14 right-5 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke={c.text} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, rgba(37,109,233,0.15), rgba(168,85,247,0.15))", border: "2px solid rgba(168,85,247,0.3)" }}>
            <span style={{ fontSize: 40 }}>⭐</span>
          </div>
          <h1 className="font-black mb-2" style={{ fontSize: 26, color: c.text }}>You're Premium!</h1>
          <p className="text-sm" style={{ color: c.textMuted }}>All VR features are unlocked. Enjoy your full access.</p>
          <button onClick={() => navigate("/exercises")} className="mt-6 px-8 py-3 rounded-2xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)", boxShadow: "0 12px 32px rgba(37,109,233,0.3)" }}>
            Browse Pro Exercises
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: c.bg }}>
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden shrink-0"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.3) 0%, transparent 70%)" }} />

        {/* Close button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 right-5 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Logo + title */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#256DE9", boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
            >
              <img src={logo} alt="REHAB X" className="w-14 h-14 object-contain" />
            </div>
            <div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          </div>

          <div
            className="inline-flex px-4 py-1.5 rounded-full mb-4"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(37,109,233,0.25))", border: "1px solid rgba(168,85,247,0.4)" }}
          >
            <span className="text-[11px] font-bold tracking-[2px]" style={{ color: "#C084FC" }}>⭐ REHAB X PREMIUM</span>
          </div>

          <h1 className="text-white mb-2" style={{ fontSize: 26, fontWeight: 900 }}>Unlock Your Full Potential</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            Access all VR exercises and advanced features
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>What's Included</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-2xl"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
            >
              <div style={{ fontSize: 22 }}>{f.icon}</div>
              <p className="font-bold text-sm mt-2" style={{ color: c.text }}>{f.title}</p>
              <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Plan selection */}
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Choose Your Plan</p>
        <div className="flex gap-3 mb-5">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className="flex-1 py-4 px-3 rounded-2xl relative"
              style={
                selectedPlan === plan.id
                  ? { background: c.accentBg, border: "2px solid #256DE9", boxShadow: "0 8px 24px rgba(37,109,233,0.15)" }
                  : { background: c.secondaryCard, border: `1.5px solid ${c.cardBorder}` }
              }
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-[10px] font-bold whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)" }}
                >
                  BEST VALUE
                </div>
              )}
              <p className="font-black text-lg" style={{ color: selectedPlan === plan.id ? "#256DE9" : c.text }}>{plan.price}</p>
              <p className="text-xs" style={{ color: c.textMuted }}>{plan.period}</p>
              <p className="text-xs font-bold mt-1" style={{ color: selectedPlan === plan.id ? "#256DE9" : c.textMuted }}>{plan.label}</p>
              {plan.savings && (
                <div className="mt-2 px-2 py-0.5 rounded-full inline-block" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
                  <span className="text-[9px] font-bold">{plan.savings}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold mb-3"
          style={{ background: "linear-gradient(135deg, #256DE9 0%, #1a4bb5 100%)", boxShadow: "0 16px 40px rgba(37,109,233,0.4)", fontSize: 16 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Activating Premium...
            </span>
          ) : (
            `Start ${selectedPlan === "annual" ? "Annual" : "Monthly"} Plan`
          )}
        </motion.button>

        <p className="text-center text-xs mb-4" style={{ color: c.textMuted }}>Cancel anytime. No commitments.</p>

        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: c.accentBg, border: "1px solid rgba(37,109,233,0.15)" }}>
          <span style={{ fontSize: 20 }}>🎁</span>
          <p className="text-sm" style={{ color: c.textSub }}>
            <span className="font-bold" style={{ color: c.text }}>7-day free trial</span> included. Full access, no charge until trial ends.
          </p>
        </div>
      </div>
    </div>
  );
}
