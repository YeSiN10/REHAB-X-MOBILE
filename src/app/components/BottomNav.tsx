import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { useColors } from "../context/AppContext";

const navItems = [
  {
    label: "Home",
    path: "/home",
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? "#256DE9" : "none"}
          stroke={active ? "#256DE9" : color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Exercises",
    path: "/exercises",
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.5 6.5H4C3.44772 6.5 3 6.94772 3 7.5V16.5C3 17.0523 3.44772 17.5 4 17.5H6.5M17.5 6.5H20C20.5523 6.5 21 6.94772 21 7.5V16.5C21 17.0523 20.5523 17.5 20 17.5H17.5M6.5 12H17.5M6.5 6.5V17.5M17.5 6.5V17.5"
          stroke={active ? "#256DE9" : color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="6.5" cy="12" r="2.5" fill={active ? "#256DE9" : color} />
        <circle cx="17.5" cy="12" r="2.5" fill={active ? "#256DE9" : color} />
      </svg>
    ),
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="4" width="18" height="18" rx="3"
          stroke={active ? "#256DE9" : color}
          fill={active ? "rgba(37,109,233,0.12)" : "none"}
          strokeWidth="1.8"
        />
        <path
          d="M3 9H21M8 2V6M16 2V6"
          stroke={active ? "#256DE9" : color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect x="7" y="13" width="3" height="3" rx="0.5" fill={active ? "#256DE9" : color} />
      </svg>
    ),
  },
  {
    label: "Progress",
    path: "/progress",
    icon: (active: boolean, color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17L8 12L13 15L21 7"
          stroke={active ? "#256DE9" : color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 21H21"
          stroke={active ? "#256DE9" : color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const c = useColors();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center px-2 pt-3 pb-6"
      style={{
        background: c.navBg,
        borderTop: `1px solid ${c.navBorder}`,
        height: 90,
        boxShadow: `0 -4px 20px ${c.navBorder}`,
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 py-1 relative"
          >
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#256DE9]"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <div className={`transition-all duration-200 ${isActive ? "scale-110" : "scale-100"}`}>
              {item.icon(isActive, c.textMuted)}
            </div>
            <span
              className="text-[10px] font-semibold transition-colors duration-200"
              style={{ color: isActive ? "#256DE9" : c.textMuted }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
