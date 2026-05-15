import { Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { AppProvider, useApp, useColors } from "./context/AppContext";
import { AiAssistant } from "./components/AiAssistant";

function RtlManager() {
  const { language } = useApp();
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);
  return null;
}

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/verify-email", "/onboarding"];

function RouteGuard() {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    const isPublic = PUBLIC_ROUTES.some((r) => location.pathname === r);
    if (!isAuthenticated && !isPublic) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authLoading, location.pathname]);

  return null;
}

function AmbientGlow() {
  const c = useColors();
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: 500,
        height: 500,
        background: `radial-gradient(circle, rgba(${c.accentRgb},0.18) 0%, transparent 70%)`,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -60%)",
      }}
    />
  );
}

export default function Root() {
  const location = useLocation();

  return (
    <AppProvider>
      <RouteGuard />
      <RtlManager />
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, #0D1B3E 0%, #050810 60%, #000000 100%)",
        }}
      >
        {/* Ambient glow */}
        <AmbientGlow />

        {/* Phone frame */}
        <div
          className="relative overflow-hidden shrink-0"
          style={{
            width: 390,
            height: 844,
            borderRadius: 50,
            border: "1.5px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 0 0 8px #0a0a0f, 0 0 0 9px rgba(255,255,255,0.06), 0 60px 120px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)",
            background: "#07090F",
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute top-[14px] left-1/2 -translate-x-1/2 z-50"
            style={{
              width: 120,
              height: 35,
              borderRadius: 20,
              background: "#000",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.04)",
            }}
          />

          {/* Screen */}
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0">
                  <Outlet />
                </div>
              </motion.div>
            </AnimatePresence>
            <AiAssistant />
          </div>
        </div>
      </div>
    </AppProvider>
  );
}
