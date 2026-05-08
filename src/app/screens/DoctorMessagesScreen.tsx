import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useColors, useApp } from "../context/AppContext";

const mockDoctors = [
  {
    id: "d1",
    name: "Dr. Amina Benali",
    specialty: "Kinésithérapeute",
    avatar: "AB",
    color: "#256DE9",
    online: true,
    lastMessage: "Your last session went great! Keep up the exercises.",
    time: "10:32",
    unread: 2,
  },
  {
    id: "d2",
    name: "Dr. Karim Oukil",
    specialty: "Rééducation Sportive",
    avatar: "KO",
    color: "#8B5CF6",
    online: false,
    lastMessage: "Please send me your pain zone report.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "d3",
    name: "Dr. Sara Meziane",
    specialty: "Orthopédie & Rehab",
    avatar: "SM",
    color: "#10B981",
    online: true,
    lastMessage: "I reviewed your MRI, let's discuss your plan.",
    time: "Mon",
    unread: 1,
  },
];

const mockMessages: Record<string, { from: "me" | "doctor"; text: string; time: string }[]> = {
  d1: [
    { from: "doctor", text: "Hello! How are you feeling after yesterday's session?", time: "10:00" },
    { from: "me", text: "Much better, the pain reduced a lot!", time: "10:15" },
    { from: "doctor", text: "Your last session went great! Keep up the exercises.", time: "10:32" },
  ],
  d2: [
    { from: "doctor", text: "Please send me your pain zone report.", time: "Yesterday" },
  ],
  d3: [
    { from: "doctor", text: "I reviewed your MRI, let's discuss your plan.", time: "Mon" },
    { from: "me", text: "Sure! When are you available?", time: "Mon" },
  ],
};

export default function DoctorMessagesScreen() {
  const navigate = useNavigate();
  const c = useColors();
  const { isPremium } = useApp();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  if (!isPremium) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8" style={{ background: c.bg }}>
        <button onClick={() => navigate(-1)} className="absolute top-14 left-5 w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke={c.text} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, rgba(37,109,233,0.15), rgba(168,85,247,0.15))", border: "2px solid rgba(168,85,247,0.3)" }}>
            <span style={{ fontSize: 36 }}>👨‍⚕️</span>
          </div>
          <h1 className="font-black text-2xl mb-2" style={{ color: c.text }}>Premium Feature</h1>
          <p className="text-sm mb-6" style={{ color: c.textMuted }}>Doctor messaging is available for Premium members only.</p>
          <button onClick={() => navigate("/premium")} className="px-8 py-3 rounded-2xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)", boxShadow: "0 12px 32px rgba(37,109,233,0.3)" }}>
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  const doctor = mockDoctors.find((d) => d.id === selectedDoctor);

  const sendMessage = () => {
    if (!input.trim() || !selectedDoctor) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => ({
      ...prev,
      [selectedDoctor]: [...(prev[selectedDoctor] || []), { from: "me", text: input.trim(), time: timeStr }],
    }));
    setInput("");
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [selectedDoctor!]: [
          ...(prev[selectedDoctor!] || []),
          { from: "doctor", text: "Thank you for the update! I'll review it shortly.", time: timeStr },
        ],
      }));
    }, 1800);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: c.bg }}>
      {/* Header */}
      <div className="relative px-5 pt-14 pb-5 shrink-0 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.4) 0%, transparent 65%)" }} />

        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => { if (selectedDoctor) setSelectedDoctor(null); else navigate(-1); }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black" style={{ fontSize: 18 }}>
              {doctor ? doctor.name : "Kinés & Doctors"}
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              {doctor ? doctor.specialty : "Premium messaging"}
            </p>
          </div>
          {doctor && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: doctor.online ? "#22C55E" : "#94A3B8" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{doctor.online ? "Online" : "Offline"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Doctor list */}
      <AnimatePresence mode="wait">
        {!selectedDoctor ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>Your Care Team</p>
            <div className="space-y-3">
              {mockDoctors.map((doc, i) => (
                <motion.button
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedDoctor(doc.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${doc.color}, ${doc.color}aa)` }}>
                      {doc.avatar}
                    </div>
                    {doc.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                        style={{ background: "#22C55E", borderColor: c.card }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-sm truncate" style={{ color: c.text }}>{doc.name}</p>
                      <span className="text-[10px] shrink-0 ml-2" style={{ color: c.textMuted }}>{doc.time}</span>
                    </div>
                    <p className="text-xs" style={{ color: c.textSub }}>{doc.specialty}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: c.textMuted }}>{doc.lastMessage}</p>
                  </div>
                  {doc.unread > 0 && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "#256DE9" }}>
                      <span className="text-[10px] font-black text-white">{doc.unread}</span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {(messages[selectedDoctor] || []).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[75%]">
                    <div className="px-4 py-3 rounded-2xl"
                      style={msg.from === "me"
                        ? { background: "#256DE9", borderBottomRightRadius: 6 }
                        : { background: c.card, border: `1px solid ${c.cardBorder}`, borderBottomLeftRadius: 6 }
                      }>
                      <p className="text-sm" style={{ color: msg.from === "me" ? "white" : c.text }}>{msg.text}</p>
                    </div>
                    <p className="text-[10px] mt-1 px-1" style={{ color: c.textMuted, textAlign: msg.from === "me" ? "right" : "left" }}>
                      {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 pb-6 pt-3 shrink-0" style={{ borderTop: `1px solid ${c.divider}` }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none"
                  style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text, caretColor: "#256DE9" }}
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: input.trim() ? "#256DE9" : c.secondaryCard, boxShadow: input.trim() ? "0 8px 20px rgba(37,109,233,0.3)" : "none" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() ? "white" : c.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
