import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";
import { useT } from "../i18n";

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const c = useColors();
  const notifTypes: Record<string, { color: string; icon: ReactNode }> = {
    workout: {
      color: c.accent,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6.5 6.5H4C3.45 6.5 3 6.95 3 7.5v9c0 .55.45 1 1 1h2.5M17.5 6.5H20c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1h-2.5M6.5 12h11" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="6.5" cy="12" r="2.5" fill={c.accent} />
          <circle cx="17.5" cy="12" r="2.5" fill={c.accent} />
        </svg>
      ),
    },
    achievement: {
      color: "#EAB308",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#EAB308">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
    },
    recovery: {
      color: "#22C55E",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 14 21" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" fill="rgba(34,197,94,0.1)" />
        </svg>
      ),
    },
    reminder: {
      color: "#F97316",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 8C18 6.41 17.37 4.88 16.24 3.76C15.12 2.63 13.59 2 12 2C10.41 2 8.88 2.63 7.76 3.76C6.63 4.88 6 6.41 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#F97316" strokeWidth="1.8" />
          <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  };
  const t = useT();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    clearAllNotifications,
  } = useApp();

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>
      {/* Curved Header */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: c.headerGradient,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          paddingTop: 52,
          paddingBottom: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          zIndex: 2,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: c.headerGlowBg }} />
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-black" style={{ fontSize: 22 }}>{t.notifications.title}</h1>
              {unreadNotificationsCount > 0 && (
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{unreadNotificationsCount} {t.notifications.unread}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {unreadNotificationsCount > 0 && (
              <button onClick={markAllNotificationsRead} className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: `rgba(${c.accentRgb},0.25)`, color: "#60a5fa", border: `1px solid rgba(${c.accentRgb},0.3)` }}>
                {t.notifications.markAllRead}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                {t.notifications.clearAll}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 px-5 space-y-5 pt-4">
        {/* Unread */}
        {unread.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
              New
            </p>
            <div className="space-y-3">
              <AnimatePresence>
                {unread.map((notif, idx) => {
                  const type = notifTypes[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60, height: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => markNotificationRead(notif.id)}
                      className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer relative"
                      style={{
                        background: c.card,
                        border: `1px solid ${type.color}25`,
                        boxShadow: c.shadow,
                      }}
                    >
                      <div
                        className="absolute top-4 right-4 w-2 h-2 rounded-full"
                        style={{ background: type.color }}
                      />
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: `${type.color}15` }}
                      >
                        {type.icon}
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-sm leading-tight" style={{ color: c.text }}>{notif.title}</p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: c.textSub }}>{notif.message}</p>
                        <p className="text-[10px] mt-1.5 font-medium" style={{ color: c.textMuted }}>{notif.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Read */}
        {read.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
              Earlier
            </p>
            <div className="space-y-2">
              <AnimatePresence>
                {read.map((notif, idx) => {
                  const type = notifTypes[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-start gap-3 p-4 rounded-2xl relative"
                      style={{
                        background: c.secondaryCard,
                        border: `1px solid ${c.divider}`,
                        opacity: 0.8,
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
                      >
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: c.textSub }}>{notif.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: c.textMuted }}>{notif.message}</p>
                        <p className="text-[10px] mt-1.5" style={{ color: c.textMuted }}>{notif.time}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }} className="shrink-0 mt-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.41 17.37 4.88 16.24 3.76C15.12 2.63 13.59 2 12 2C10.41 2 8.88 2.63 7.76 3.76C6.63 4.88 6 6.41 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={c.textMuted} strokeWidth="1.8" />
              </svg>
            </div>
            <p className="font-semibold text-sm" style={{ color: c.textSub }}>All caught up!</p>
            <p className="text-xs mt-1" style={{ color: c.textMuted }}>No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
