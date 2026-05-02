import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import { useState } from "react";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
      style={{ background: value ? "#256DE9" : "rgba(255,255,255,0.1)" }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
      />
    </button>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { user, isDark, setIsDark } = useApp();
  const c = useColors();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    workoutReminders: true,
    restDayAlerts: false,
    soundEffects: true,
    vibration: true,
    autoPlay: false,
    privacyMode: false,
    shareProgress: true,
  });

  const update = (key: keyof typeof settings, val: boolean) =>
    setSettings((s) => ({ ...s, [key]: val }));

  const sections = [
    {
      title: "Notifications",
      items: [
        { key: "pushNotifications", label: "Push Notifications", desc: "Get alerts about your workouts" },
        { key: "workoutReminders", label: "Workout Reminders", desc: "Daily session reminders" },
        { key: "restDayAlerts", label: "Rest Day Alerts", desc: "Recovery day recommendations" },
      ],
    },
    {
      title: "Audio & Haptics",
      items: [
        { key: "soundEffects", label: "Sound Effects", desc: "Audio cues during workouts" },
        { key: "vibration", label: "Vibration", desc: "Haptic feedback on actions" },
        { key: "autoPlay", label: "Auto-play Videos", desc: "Exercise demonstration videos" },
      ],
    },
    {
      title: "Privacy",
      items: [
        { key: "privacyMode", label: "Privacy Mode", desc: "Hide personal information" },
        { key: "shareProgress", label: "Share Progress", desc: "Allow community visibility" },
      ],
    },
  ];

  const profileFields = [
    { label: "Full Name", value: user.name || "Not set" },
    { label: "Email", value: user.email || "Not set" },
    { label: "Age", value: user.age ? `${user.age} years` : "Not set" },
    { label: "Gender", value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set" },
    { label: "Fitness Level", value: user.fitnessLevel || "Intermediate" },
    { label: "Primary Goal", value: user.goal || "Recovery & Performance" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>
      {/* Curved Header */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.35) 0%, transparent 65%)" }} />
        <div className="flex items-center gap-4 px-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-white font-black" style={{ fontSize: 22 }}>Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 px-5 space-y-5 pt-5">
        {/* Profile info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
            Profile Information
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            {profileFields.map((field, i) => (
              <div
                key={field.label}
                className={`flex items-center justify-between px-4 py-3.5 ${i < profileFields.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: c.divider }}
              >
                <span className="text-sm" style={{ color: c.textSub }}>{field.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: field.value === "Not set" ? c.textMuted : c.text }}>
                    {field.value}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance - Dark Mode */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
            Appearance
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</span>
                  <p className="text-sm font-semibold" style={{ color: c.text }}>Dark Mode</p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                  {isDark ? "Dark theme active" : "Light theme active (default)"}
                </p>
              </div>
              <Toggle value={isDark} onChange={setIsDark} />
            </div>
          </div>
        </div>

        {/* Toggle sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              {section.items.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between px-4 py-4 ${i < section.items.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: c.divider }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: c.text }}>{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{item.desc}</p>
                  </div>
                  <Toggle
                    value={settings[item.key as keyof typeof settings]}
                    onChange={(v) => update(item.key as keyof typeof settings, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.textMuted }}>
            Account
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            {[
              { label: "Rate REHAB X on Play Store", color: "#EAB308", icon: "⭐", action: () => window.open("https://play.google.com/store", "_blank") },
              { label: "Export My Data", color: c.textSub, icon: "📤", action: () => {} },
              { label: "Delete Account", color: "#EF4444", icon: "🗑️", action: () => {} },
            ].map((item, i) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center justify-between px-4 py-4 ${i < 2 ? "border-b" : ""}`}
                style={{ borderColor: c.divider }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs pb-2" style={{ color: c.textMuted }}>
          REHAB X v2.4.1 • Terms of Service • Privacy Policy
        </p>
      </div>
    </div>
  );
}