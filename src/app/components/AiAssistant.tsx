import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useColors, useApp } from "../context/AppContext";
import vrBrainLogo from "../../imports/vr_brain_logo.png";

const FAQ: { q: string; a: string }[] = [
  { q: "How does the recovery score work?", a: "Your recovery score (0–100) is calculated from your workout frequency, session variety, rest days, and daily mood. Aim for 75+ by mixing exercises with proper rest." },
  { q: "What are pain zones?", a: "Pain zones are body areas you tagged during onboarding (e.g. Lower Back, Knee). The app uses them to suggest safe exercises and avoid overloading injured areas." },
  { q: "How do I start a workout?", a: "Go to Exercises from the bottom nav, pick any exercise, then tap 'Start Workout'. The timer and rep counter will guide you through the session." },
  { q: "What is my streak?", a: "Your streak counts consecutive days you've logged at least one session. Keep it alive by completing a workout every day!" },
  { q: "How do I message my kiné?", a: "Open the sidebar menu and tap 'Doctor Messages'. You can chat directly with your assigned kinésithérapeute." },
  { q: "What are Premium features?", a: "Premium gives you: AI Assistant (that's me!), direct messaging with kinés, advanced analytics, HD video guides, nutrition plans, and more." },
  { q: "How do I upload medical documents?", a: "Go to Profile → Setup Profile and navigate to the Documents step. You can upload PDFs, images, and Word documents." },
  { q: "Can I change my pain zones later?", a: "Yes! Go to Profile → Edit Profile and update your rehabilitation info including pain zones and pain level at any time." },
];

interface Message {
  from: "user" | "ai";
  text: string;
}

export function AiAssistant() {
  const c = useColors();
  const { isPremium, isAuthenticated } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isPremium) setOpen(false);
  }, [isAuthenticated, isPremium]);
  const [messages, setMessages] = useState<Message[]>([
    { from: "ai", text: "Hi! I'm your REHAB X AI Assistant 🤖 How can I help you today? You can ask me anything about the app or your rehabilitation journey." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!isPremium || !isAuthenticated) return null;

  const findAnswer = (question: string): string => {
    const q = question.toLowerCase();
    for (const faq of FAQ) {
      const keywords = faq.q.toLowerCase().split(" ").filter((w) => w.length > 3);
      const matches = keywords.filter((kw) => q.includes(kw)).length;
      if (matches >= 2) return faq.a;
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hello! I'm here to help you with REHAB X. Ask me anything about workouts, your recovery, pain zones, or app features!";
    }
    if (q.includes("thank")) {
      return "You're welcome! Keep up your rehabilitation journey — you're doing great! 💪";
    }
    if (q.includes("exercise") || q.includes("workout")) {
      return "You can browse all exercises from the Exercises tab. Filter by type, and tap any exercise to see instructions and start a workout session!";
    }
    if (q.includes("premium") || q.includes("upgrade")) {
      return "You already have Premium! Enjoy features like this AI Assistant, Doctor Messaging, advanced analytics, and much more. 🌟";
    }
    return "Great question! For the best guidance, I recommend checking the relevant section in the app. You can also message your kiné directly from the Doctor Messages screen in the sidebar menu.";
  };

  const handleSend = (text = input.trim()) => {
    if (!text) return;
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTyping(true);
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { from: "ai", text: findAnswer(text) }]);
    }, delay);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 22 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="absolute bottom-24 right-4 z-30 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accentDark} 100%)`,
          boxShadow: `0 8px 28px rgba(${c.accentRgb},0.55)`,
        }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          <img
            src={vrBrainLogo}
            alt="AI"
            style={{ width: 30, height: 30, objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
        </motion.div>
        {/* Premium badge */}
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="absolute bottom-24 left-4 right-4 z-40 flex flex-col rounded-3xl overflow-hidden"
            style={{
              height: 400,
              background: c.card,
              border: `1px solid ${c.cardBorder}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0"
              style={{ background: c.headerGradient, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 5.97 2 10.8C2 13.63 3.53 16.14 5.94 17.74L5 21L9.05 19.35C10 19.77 11 20 12 20C17.52 20 22 16.03 22 11.2C22 6.37 17.52 2 12 2Z" fill="white" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>Premium · Always available</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.from === "ai" && (
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: c.accent }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 5.97 2 10.8C2 13.63 3.53 16.14 5.94 17.74L5 21L9.05 19.35C10 19.77 11 20 12 20C17.52 20 22 16.03 22 11.2C22 6.37 17.52 2 12 2Z" fill="white" />
                      </svg>
                    </div>
                  )}
                  <div className="max-w-[80%] px-3 py-2.5 rounded-2xl"
                    style={msg.from === "user"
                      ? { background: c.accent, borderBottomRightRadius: 6 }
                      : { background: c.secondaryCard, border: `1px solid ${c.cardBorder}`, borderBottomLeftRadius: 6 }
                    }>
                    <p className="text-xs leading-relaxed" style={{ color: msg.from === "user" ? "white" : c.text }}>
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: c.accent }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 5.97 2 10.8C2 13.63 3.53 16.14 5.94 17.74L5 21L9.05 19.35C10 19.77 11 20 12 20C17.52 20 22 16.03 22 11.2C22 6.37 17.52 2 12 2Z" fill="white" />
                    </svg>
                  </div>
                  <div className="flex gap-1 px-3 py-3 rounded-2xl" style={{ background: c.secondaryCard, borderBottomLeftRadius: 6 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }}
                        animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions && messages.length === 1 && (
                <div className="space-y-1.5 mt-1">
                  <p className="text-[10px] font-semibold px-1" style={{ color: c.textMuted }}>Quick questions</p>
                  {FAQ.slice(0, 4).map((faq, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      onClick={() => handleSend(faq.q)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium"
                      style={{ background: c.accentBg, border: `1px solid rgba(${c.accentRgb},0.2)`, color: c.accent }}
                    >
                      {faq.q}
                    </motion.button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: `1px solid ${c.divider}` }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                  style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: c.accent }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || typing}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: input.trim() ? c.accent : c.secondaryCard }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() ? "white" : c.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
