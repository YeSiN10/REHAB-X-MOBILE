import { useNavigate } from "react-router";
import { ReactNode } from "react";

interface CurvedHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: ReactNode;
  children?: ReactNode;
}

export function CurvedHeader({ title, subtitle, showBack = true, rightSlot, children }: CurvedHeaderProps) {
  const navigate = useNavigate();
  return (
    <div
      className="shrink-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #1a3a80 0%, #1b2c60 40%, #0d1630 100%)",
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        paddingTop: 52,
        paddingBottom: 20,
        boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
        zIndex: 2,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(37,109,233,0.35) 0%, transparent 65%)" }}
      />

      <div className="flex items-center gap-3 px-5">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-white font-black truncate" style={{ fontSize: 22 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{subtitle}</p>}
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
