import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useColors } from "../context/AppContext";

const workoutData: Record<string, {
  title: string; totalSets: number; category: string;
  exercises: { name: string; reps: string; duration?: number; instruction: string }[];
}> = {
  featured: {
    title: "Post-Sprint Recovery", totalSets: 3, category: "Recovery",
    exercises: [
      { name: "Light Walking",        reps: "5 min",   duration: 300, instruction: "Walk slowly at 40% pace. Arms relaxed, breathing controlled." },
      { name: "Hip Flexor Stretch",   reps: "30s each", duration: 60,  instruction: "Deep lunge hold. Keep upper body tall, feel the hip flexor stretch." },
      { name: "Dynamic Quad Stretch", reps: "10 reps",  duration: 60,  instruction: "Pull heel to glute while balancing. Controlled, no bouncing." },
      { name: "Hamstring Walks",      reps: "8 reps",   duration: 90,  instruction: "Straight-leg walk forward, flex each hamstring deliberately." },
      { name: "Calf Raises",          reps: "15 reps",  duration: 45,  instruction: "Slow calf raises — 2s up, hold at top, 3s down." },
    ],
  },
  "1": {
    title: "Morning HIIT", totalSets: 4, category: "HIIT",
    exercises: [
      { name: "Burpees",        reps: "20 reps", duration: 40, instruction: "Full extension at top, chest to floor. Explosive movement every rep." },
      { name: "Jump Squats",    reps: "15 reps", duration: 30, instruction: "Land softly, control the descent. Drive through heels on jump." },
      { name: "Mountain Climbers", reps: "30 sec", duration: 30, instruction: "Core tight, hips level with shoulders. Fast, alternating knee drives." },
      { name: "High Knees",     reps: "40 sec", duration: 40, instruction: "Drive knees to hip height. Pump arms in sync with legs." },
      { name: "Push-up Holds",  reps: "10 reps", duration: 35, instruction: "Hold bottom position 2s each rep. Elbows 45° from body." },
    ],
  },
  "2": {
    title: "Lower Body Blast", totalSets: 4, category: "Strength",
    exercises: [
      { name: "Barbell Squats",     reps: "8 reps",  duration: 45, instruction: "Hip-width stance, chest up, sit back. Break parallel for full range." },
      { name: "Romanian Deadlifts", reps: "10 reps", duration: 50, instruction: "Hinge at hips, slight knee bend. Feel hamstring stretch at bottom." },
      { name: "Walking Lunges",     reps: "12 each", duration: 60, instruction: "Large step forward, knee above ankle. Upright torso throughout." },
      { name: "Leg Press",          reps: "15 reps", duration: 40, instruction: "Full range motion. Don't lock knees at top of movement." },
      { name: "Glute Bridges",      reps: "15 reps", duration: 35, instruction: "Drive hips to ceiling. Squeeze glutes 2s at top each rep." },
    ],
  },
};

// Skeleton stick figure poses (SVG paths for body parts)
const SkeletonFigure = ({ exerciseName, phase }: { exerciseName: string; phase: number }) => {
  const c = useColors();
  const animate = phase % 2 === 0;

  // Different poses based on exercise type
  const getBodyPose = () => {
    const name = exerciseName.toLowerCase();
    if (name.includes("squat") || name.includes("lunge")) {
      return {
        torsoY: animate ? 80 : 65,
        leftKneeX: animate ? 55 : 45,
        leftKneeY: animate ? 110 : 95,
        rightKneeX: animate ? 75 : 85,
        rightKneeY: animate ? 110 : 95,
      };
    }
    if (name.includes("burpee") || name.includes("push")) {
      return {
        torsoY: animate ? 90 : 70,
        leftKneeX: animate ? 55 : 50,
        leftKneeY: animate ? 110 : 100,
        rightKneeX: animate ? 75 : 80,
        rightKneeY: animate ? 110 : 100,
      };
    }
    return {
      torsoY: animate ? 70 : 60,
      leftKneeX: 55,
      leftKneeY: animate ? 105 : 95,
      rightKneeX: 75,
      rightKneeY: animate ? 105 : 95,
    };
  };
  const pose = getBodyPose();

  return (
    <svg width="130" height="160" viewBox="0 0 130 160" style={{ filter: `drop-shadow(0 0 20px rgba(${c.accentRgb},0.6))` }}>
      {/* Glow effect behind skeleton */}
      <ellipse cx="65" cy="130" rx="30" ry="8" fill={`rgba(${c.accentRgb},0.3)`} />

      {/* Head */}
      <motion.circle
        cx="65" cy="28"
        r="14"
        fill="none" stroke={c.accent} strokeWidth="3"
        animate={{ cy: animate ? 30 : 26 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Spine */}
      <motion.line
        x1="65" y1="42" x2="65"
        animate={{ y2: animate ? pose.torsoY + 8 : pose.torsoY }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        stroke={c.accent} strokeWidth="3" strokeLinecap="round"
      />

      {/* Shoulders */}
      <motion.line
        x1="45" y1="52" x2="85" y2="52"
        stroke={c.accent} strokeWidth="3" strokeLinecap="round"
        animate={{ y1: animate ? 54 : 50, y2: animate ? 54 : 50 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Left arm */}
      <motion.line
        x1="45" y1="52"
        animate={{
          x2: animate ? 30 : 35,
          y2: animate ? 80 : 70,
          y1: animate ? 54 : 50,
        }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        stroke="#4DA3FF" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Right arm */}
      <motion.line
        x1="85" y1="52"
        animate={{
          x2: animate ? 100 : 95,
          y2: animate ? 80 : 70,
          y1: animate ? 54 : 50,
        }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        stroke="#4DA3FF" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Hips */}
      <motion.line
        x1="52" y1="90" x2="78" y2="90"
        animate={{ y1: animate ? pose.torsoY + 8 : pose.torsoY + 2, y2: animate ? pose.torsoY + 8 : pose.torsoY + 2 }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        stroke={c.accent} strokeWidth="3" strokeLinecap="round"
      />

      {/* Left leg */}
      <motion.path
        animate={{
          d: animate
            ? `M 52 ${pose.torsoY + 8} L ${pose.leftKneeX} ${pose.leftKneeY} L 48 135`
            : `M 52 ${pose.torsoY + 2} L ${pose.leftKneeX - 3} ${pose.leftKneeY - 8} L 50 125`,
        }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        fill="none" stroke="#4DA3FF" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Right leg */}
      <motion.path
        animate={{
          d: animate
            ? `M 78 ${pose.torsoY + 8} L ${pose.rightKneeX} ${pose.rightKneeY} L 82 135`
            : `M 78 ${pose.torsoY + 2} L ${pose.rightKneeX + 3} ${pose.rightKneeY - 8} L 80 125`,
        }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        fill="none" stroke="#4DA3FF" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Joints (dots) */}
      {[
        { cx: 45, cy: 52 }, { cx: 85, cy: 52 }, { cx: 52, cy: 90 }, { cx: 78, cy: 90 },
        { cx: pose.leftKneeX, cy: pose.leftKneeY }, { cx: pose.rightKneeX, cy: pose.rightKneeY },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r="4"
          fill={c.accent}
          animate={{ r: [4, 5, 4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </svg>
  );
};

export default function ActiveWorkoutScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addSession } = useApp();
  const workout = workoutData[id || "1"] || workoutData["1"];

  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [showPermissionScreen, setShowPermissionScreen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timer, setTimer] = useState(workout.exercises[0]?.duration || 45);
  const [isRunning, setIsRunning] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [restTimer, setRestTimer] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [formScore] = useState(92);
  const [skeletonPhase, setSkeletonPhase] = useState(0);
  const [showInstruction, setShowInstruction] = useState(true); // toggle instructions

  const currentEx = workout.exercises[currentExIdx];
  const totalExercises = workout.exercises.length;
  const progress = (currentExIdx + (currentSet - 1) / workout.totalSets) / totalExercises;

  // Request camera
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraPermission("granted");
      setShowPermissionScreen(false);
    } catch {
      setCameraPermission("denied");
    }
  };

  const skipCamera = () => {
    setCameraPermission("denied");
    setShowPermissionScreen(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Skeleton animation cycle
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSkeletonPhase((p) => p + 1), 700);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Countdown + rep simulation
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (isRest) {
        setRestTimer((t) => {
          if (t <= 1) {
            setIsRest(false); setRestTimer(60);
            if (currentExIdx < totalExercises - 1) {
              setCurrentExIdx((i) => i + 1);
              setTimer(workout.exercises[currentExIdx + 1]?.duration || 45);
              setRepCount(0);
            } else {
              handleComplete();
            }
            return 60;
          }
          return t - 1;
        });
      } else {
        setTimer((t) => {
          if (t <= 1) { setIsRest(true); return currentEx?.duration || 45; }
          return t - 1;
        });
        // Simulate rep counting
        if (Math.random() > 0.85) setRepCount((r) => r + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isRest, currentExIdx, currentEx, totalExercises, workout.exercises]);

  const handleComplete = useCallback(() => {
    // Log the completed session
    const totalCal = Math.round(elapsed / 60 * 8 + 150);
    addSession({
      date: new Date().toISOString().split("T")[0],
      calories: totalCal,
      duration: Math.round(elapsed / 60),
      type: workout.category,
      title: workout.title,
      exerciseId: id,
    });
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    navigate(`/workout-complete/${id || "1"}`);
  }, [elapsed, workout, addSession, navigate, id]);

  const handleNext = useCallback(() => {
    if (currentExIdx < totalExercises - 1) {
      setCurrentExIdx((i) => i + 1);
      setTimer(workout.exercises[currentExIdx + 1]?.duration || 45);
      setIsRest(false); setRepCount(0);
    } else if (currentSet < workout.totalSets) {
      setCurrentSet((s) => s + 1); setCurrentExIdx(0);
      setTimer(workout.exercises[0]?.duration || 45); setRepCount(0);
    } else {
      handleComplete();
    }
  }, [currentExIdx, totalExercises, currentSet, workout, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentExIdx > 0) {
      setCurrentExIdx((i) => i - 1);
      setTimer(workout.exercises[currentExIdx - 1]?.duration || 45);
      setIsRest(false);
    }
  }, [currentExIdx, workout.exercises]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── Camera permission screen (LIGHT MODE) ────────────────────────
  if (showPermissionScreen) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#F0F4FF" }}>
        {/* Glow */}
        <div className="absolute inset-0" style={{ background: c.headerGlowBg }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center px-8 text-center z-10"
        >
          {/* Camera icon */}
          <div
            className="w-28 h-28 rounded-[40px] flex items-center justify-center mb-8"
            style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`, boxShadow: `0 24px 48px rgba(${c.accentRgb},0.3)` }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
            </svg>
          </div>

          <h1 className="font-black mb-3" style={{ fontSize: 26, color: "#0A1628" }}>Camera Required</h1>
          <p style={{ color: "#4B5A6E", lineHeight: 1.6, fontSize: 15 }}>
            <span style={{ color: "#0A1628", fontWeight: 700 }}>{workout.title}</span> uses real-time camera tracking to monitor your form, count reps, and provide instant corrections.
          </p>

          <div className="mt-6 w-full space-y-3">
            {[
              { icon: "🦴", text: "Skeleton tracking for form analysis" },
              { icon: "📊", text: "Automatic rep counting" },
              { icon: "✅", text: "Real-time posture correction" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-2xl text-left"
                style={{ background: "white", border: `1px solid rgba(${c.accentRgb},0.12)`, boxShadow: `0 2px 12px rgba(${c.accentRgb},0.06)` }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: "#4B5A6E" }}>{item.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={requestCamera}
            className="w-full mt-8 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3"
            style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`, boxShadow: `0 16px 40px rgba(${c.accentRgb},0.35)`, fontSize: 16 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
            </svg>
            Allow Camera Access
          </motion.button>

          <button onClick={skipCamera} className="mt-4 text-sm font-semibold" style={{ color: "#8896A6" }}>
            Continue without camera
          </button>
        </motion.div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 60;
  const strokeDash = isRest
    ? circumference * (restTimer / 60)
    : circumference * (timer / (currentEx?.duration || 45));

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: "#07090F" }}>

      {/* ── Camera background ────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        {cameraPermission === "granted" ? (
          <>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }} // mirror selfie camera
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to bottom, rgba(7,9,15,0.75) 0%, rgba(7,9,15,0.3) 30%, rgba(7,9,15,0.3) 60%, rgba(7,9,15,0.9) 100%)"
            }} />
            {/* Grid overlay */}
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(${c.accentRgb},0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(${c.accentRgb},0.05) 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{
            background: "linear-gradient(160deg, #07090F 0%, #0F1A2E 100%)"
          }}>
            <div className="absolute inset-0" style={{
              background: `radial-gradient(circle at 50% 40%, rgba(${c.accentRgb},0.12) 0%, transparent 65%)`
            }} />
            {/* Simulated grid */}
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(${c.accentRgb},0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(${c.accentRgb},0.06) 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }} />
          </div>
        )}
      </div>

      {/* ── Skeleton / motion overlay ────────────────────────────────── */}
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ top: "18%", bottom: "40%" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExIdx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <SkeletonFigure exerciseName={currentEx?.name || ""} phase={skeletonPhase} />
            </motion.div>
          </AnimatePresence>

          {/* Form score overlay */}
          <div
            className="absolute top-0 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", backdropFilter: "blur(8px)" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" style={{ animation: "pulse 1.5s infinite" }} />
            <span className="text-[11px] font-bold text-white">Form {formScore}%</span>
          </div>

          {/* Rep counter */}
          {isRunning && repCount > 0 && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full"
              style={{ background: `rgba(${c.accentRgb},0.25)`, border: `1px solid rgba(${c.accentRgb},0.5)`, backdropFilter: "blur(8px)" }}
            >
              <span className="text-white font-black text-sm">{repCount} reps</span>
            </div>
          )}
        </div>
      )}

      {/* ── Top HUD ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4 shrink-0">
        <button
          onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); navigate(-1); }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(7,9,15,0.7)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-white font-bold" style={{ fontSize: 15 }}>{workout.title}</h1>
          <p className="text-[#475569] text-xs mt-0.5">Set {currentSet} of {workout.totalSets}</p>
        </div>

        <div
          className="px-3 py-2 rounded-xl flex items-center gap-1.5"
          style={{ background: "rgba(7,9,15,0.7)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          {cameraPermission === "granted" && (
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" style={{ animation: "pulse 1.5s infinite" }} />
          )}
          <span className="font-bold text-sm" style={{ color: c.accent }}>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-5 mb-3 shrink-0">
        <div className="flex justify-between text-xs text-[#475569] mb-1.5 font-medium">
          <span>Exercise {currentExIdx + 1}/{totalExercises}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div className="h-full rounded-full" style={{ background: c.accent }}
            animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* ── Timer ring ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center shrink-0">
        <div className="relative" style={{ width: 150, height: 150 }}>
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="60" fill="rgba(7,9,15,0.5)" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <motion.circle
              cx="75" cy="75" r="60"
              fill="none"
              stroke={isRest ? "#22C55E" : c.accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 0.5 }}
              transform="rotate(-90 75 75)"
              style={{ filter: `drop-shadow(0 0 8px ${isRest ? "#22C55E" : c.accent})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isRest ? (
              <>
                <span className="text-[#22C55E] text-[10px] font-bold tracking-wider">REST</span>
                <span className="text-white font-black" style={{ fontSize: 30 }}>{formatTime(restTimer)}</span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold tracking-wider" style={{ color: c.accent }}>TIME</span>
                <span className="text-white font-black" style={{ fontSize: 30 }}>{formatTime(timer)}</span>
              </>
            )}
          </div>
        </div>

        {/* Exercise name */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-center mt-2 px-5"
          >
            <h2 className="text-white font-black" style={{ fontSize: 20 }}>
              {isRest ? "Rest & Breathe" : currentEx?.name}
            </h2>
            <p className="text-[#475569] font-medium mt-0.5" style={{ fontSize: 13 }}>
              {isRest ? `Next: ${workout.exercises[currentExIdx + 1]?.name || "Done!"}` : currentEx?.reps}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Exercise instruction card — TOGGLEABLE ────────────────── */}
      {!isRest && currentEx && (
        <div className="relative z-10 px-5 mt-3 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>Instructions</p>
            <button
              onClick={() => setShowInstruction(!showInstruction)}
              className="px-3 py-1 rounded-full text-[10px] font-bold transition-all"
              style={{ background: showInstruction ? `rgba(${c.accentRgb},0.2)` : "rgba(255,255,255,0.08)", color: showInstruction ? c.accent : "#475569", border: `1px solid ${showInstruction ? `rgba(${c.accentRgb},0.3)` : "rgba(255,255,255,0.1)"}` }}
            >
              {showInstruction ? "Hide" : "Show"}
            </button>
          </div>
          {showInstruction && (
            <motion.div
              key={currentExIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl"
              style={{ background: `rgba(${c.accentRgb},0.12)`, border: `1px solid rgba(${c.accentRgb},0.25)`, backdropFilter: "blur(8px)" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                <span className="font-bold" style={{ color: c.accent }}>📋 </span>
                {currentEx.instruction}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Exercise list — HORIZONTAL SCROLL ────────────────────────── */}
      <div className="relative z-10 px-5 py-2 shrink-0 pb-[110px]">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {workout.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl shrink-0 transition-all"
              style={{
                background: i === currentExIdx
                  ? `rgba(${c.accentRgb},0.2)`
                  : i < currentExIdx
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(255,255,255,0.05)",
                border: i === currentExIdx
                  ? `1.5px solid rgba(${c.accentRgb},0.6)`
                  : i < currentExIdx
                    ? "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(4px)",
                minWidth: 0,
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: i < currentExIdx ? "#22C55E" : i === currentExIdx ? c.accent : "rgba(255,255,255,0.08)" }}
              >
                {i < currentExIdx ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="text-white font-bold text-[9px]">{i + 1}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold whitespace-nowrap" style={{ fontSize: 10, color: i === currentExIdx ? "white" : i < currentExIdx ? "#22C55E" : "#475569" }}>
                  {ex.name}
                </p>
                <p style={{ fontSize: 9, color: i === currentExIdx ? "rgba(255,255,255,0.6)" : "#334155" }}>{ex.reps}</p>
              </div>
              {i === currentExIdx && (
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.accent, boxShadow: `0 0 6px ${c.accent}` }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Controls — pinned to absolute bottom ─────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, rgba(7,9,15,1) 65%, rgba(7,9,15,0) 100%)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentExIdx === 0}
            className="w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 5M5 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-white"
            style={{
              background: isRunning ? "linear-gradient(135deg, #EF4444, #b91c1c)" : `linear-gradient(135deg, ${c.accent}, ${c.accentDark})`,
              boxShadow: isRunning ? "0 12px 30px rgba(239,68,68,0.3)" : `0 12px 30px rgba(${c.accentRgb},0.4)`,
              fontSize: 16, backdropFilter: "blur(8px)",
            }}
          >
            {isRunning ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                Pause
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5L19 12L8 19V5Z" /></svg>
                {elapsed === 0 ? "Start" : "Resume"}
              </>
            )}
          </motion.button>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}