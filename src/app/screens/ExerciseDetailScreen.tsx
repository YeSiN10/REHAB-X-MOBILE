import { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useColors, useApp } from "../context/AppContext";

const exerciseData: Record<string, {
  title: string; category: string; duration: string; calories: number;
  intensity: string; level: string; img: string; description: string;
  steps: { title: string; desc: string; tip?: string }[];
  muscles: string[]; sets: number; reps: string; rest: string;
}> = {
  featured: {
    title: "Post-Sprint Recovery",
    category: "Recovery", duration: "24 min", calories: 180,
    intensity: "Low", level: "All Levels",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    description: "A science-backed VR recovery protocol designed to reduce muscle soreness, improve circulation, and accelerate recovery after high-intensity sprint training. Camera tracks your form in real time.",
    steps: [
      { title: "Light Walk Warm-Down", desc: "Start with 5 minutes of light walking at 40% of your normal pace. Camera will detect gait and ensure proper cadence.", tip: "Keep breathing steady and controlled throughout" },
      { title: "Hip Flexor Stretch", desc: "Drop into a deep lunge position and hold for 30 seconds on each side. VR overlay shows optimal hip alignment.", tip: "Keep your upper body tall, don't lean forward" },
      { title: "Dynamic Quad Stretch", desc: "Perform 10 controlled reps per leg, pulling your heel toward your glute. Camera auto-counts each rep.", tip: "Use a wall for support if needed" },
      { title: "Hamstring Walks", desc: "Complete 2 sets of 8 reps. Walk forward with straight legs, flexing each hamstring deliberately.", tip: "Keep your back flat throughout the movement" },
      { title: "Calf Raises & Ankle Rolls", desc: "20 slow calf raises followed by 10 ankle rotations each direction. Camera verifies range of motion." },
      { title: "Deep Breathing Cooldown", desc: "5 minutes of diaphragmatic breathing. Inhale 4 counts, hold 2, exhale 6. Camera monitors chest movement.", tip: "Focus on belly breathing, not chest breathing" },
    ],
    muscles: ["Hamstrings", "Quads", "Hip Flexors", "Calves"],
    sets: 3, reps: "10-12", rest: "60s",
  },
  "1": {
    title: "Morning HIIT",
    category: "Cardio", duration: "45 min", calories: 420,
    intensity: "High", level: "Advanced",
    img: "https://images.unsplash.com/photo-1729281008855-71e2506761c0?w=800&q=80",
    description: "An intense high-intensity interval training session powered by VR motion tracking. Camera monitors every rep, ensures proper form, and auto-counts your burpees in real time.",
    steps: [
      { title: "Dynamic Warm-Up", desc: "5 minutes of dynamic stretching — arm circles, leg swings, hip rotations. VR guides each movement.", tip: "Never skip warm-up for HIIT — injury risk is high without it" },
      { title: "Burpee Rounds", desc: "20 burpees at maximum effort. Camera detects chest-to-floor contact and counts each clean rep.", tip: "Modify by stepping instead of jumping if needed" },
      { title: "Jump Squats", desc: "15 explosive jump squats. VR tracks knee alignment and landing mechanics for safety.", tip: "Drive through your heels on the way up" },
      { title: "Mountain Climbers", desc: "30 seconds at high speed. Camera measures shoulder stability and hip level throughout.", tip: "Don't let your hips rise — keep them inline with your shoulders" },
      { title: "Active Rest", desc: "60 seconds of light jogging. Camera monitors heart rate through skin color analysis." },
      { title: "Repeat Circuit × 4", desc: "Complete the full circuit 4 times. VR tracks performance decline and alerts you to form breaks.", tip: "Quality over speed — maintain form throughout all rounds" },
      { title: "Cool-Down Stretch", desc: "5 minutes of static stretching. Camera ensures you hold each stretch to optimal depth." },
    ],
    muscles: ["Full Body", "Core", "Glutes", "Shoulders"],
    sets: 4, reps: "15-20", rest: "60s",
  },
  "2": {
    title: "Lower Body Blast",
    category: "Strength", duration: "52 min", calories: 510,
    intensity: "High", level: "Intermediate",
    img: "https://images.unsplash.com/photo-1597376833295-40a54d5e69fc?w=800&q=80",
    description: "Build explosive lower body strength. VR camera tracks squat depth, monitors knee alignment, and ensures you achieve full range of motion every rep.",
    steps: [
      { title: "Barbell Back Squats", desc: "4 sets × 8 reps. Camera monitors depth and ensures parallel — virtual line shown on screen.", tip: "Keep your chest up and knees tracking over toes" },
      { title: "Romanian Deadlifts", desc: "3 sets × 10 reps. VR overlay shows optimal hip hinge angle in real time.", tip: "Feel the stretch in your hamstrings at the bottom" },
      { title: "Walking Lunges", desc: "3 sets × 12 lunges. Camera tracks step distance and ensures proper knee tracking.", tip: "Take large steps — a shorter stride increases knee stress" },
      { title: "Leg Press Machine", desc: "3 sets × 15 reps. VR monitors foot placement and counts only full-range reps.", tip: "Don't lock your knees at the top of each rep" },
      { title: "Standing Calf Raises", desc: "4 sets × 20 reps. Camera measures plantar flexion range and ensures slow tempo.", tip: "Use a step for greater range of motion" },
      { title: "Glute Bridges", desc: "3 sets × 15 reps. VR overlay shows hip height target and counts each held contraction." },
    ],
    muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
    sets: 4, reps: "8-15", rest: "90s",
  },
  "3": {
    title: "Flexibility Flow",
    category: "Flexibility", duration: "30 min", calories: 180,
    intensity: "Low", level: "Beginner",
    img: "https://images.unsplash.com/photo-1769416945759-4660fd121172?w=800&q=80",
    description: "A full-body flexibility routine combining yoga poses and dynamic stretching. VR camera tracks your range of motion, provides real-time alignment cues, and guides you through each pose with precision.",
    steps: [
      { title: "Cat-Cow Warm-Up", desc: "Begin on all fours. Alternate between arching and rounding your spine for 2 minutes. Camera monitors spinal alignment.", tip: "Move with your breath — inhale to arch, exhale to round" },
      { title: "Sun Salutation Flow", desc: "3 rounds of sun salutations. VR overlays the ideal position for each transition.", tip: "Don't rush — quality of movement matters more than speed" },
      { title: "Deep Hip Flexor Lunge", desc: "Hold a low lunge for 45 seconds each side. Camera tracks hip squareness and front knee alignment.", tip: "Keep your back leg straight and glute engaged" },
      { title: "Seated Hamstring Stretch", desc: "Sit with legs extended, fold forward gently. Hold 45 seconds. VR shows your flexibility progress in real time.", tip: "Flex your feet and keep a long spine — don't round" },
      { title: "Pigeon Pose", desc: "30 seconds each side. Camera confirms hip alignment and ensures you're not compensating through your lower back.", tip: "Use a folded towel under your hip if you feel strain" },
      { title: "Supine Spinal Twist", desc: "1 minute each side lying on your back. VR monitors shoulder contact with the floor and guides breathing.", tip: "Keep both shoulders grounded for maximum spinal rotation" },
    ],
    muscles: ["Hip Flexors", "Hamstrings", "Spine", "Shoulders"],
    sets: 2, reps: "45s hold", rest: "15s",
  },
  "4": {
    title: "Upper Body Push",
    category: "Strength", duration: "38 min", calories: 320,
    intensity: "Medium", level: "Intermediate",
    img: "https://images.unsplash.com/photo-1605296867724-fa87a8ef53fd?w=800&q=80",
    description: "A comprehensive upper body push session targeting chest, shoulders, and triceps. VR camera tracks bar path, monitors joint angles, and ensures symmetrical activation across both sides of your body.",
    steps: [
      { title: "Flat Bench Press Warm-Up", desc: "2 warm-up sets at 50% working weight. Camera calibrates to your grip width and bar path.", tip: "Touch your chest on every rep — camera flags partial reps" },
      { title: "Incline Dumbbell Press", desc: "4 sets × 10 reps. VR shows optimal elbow flare angle and tracks dumbbell path symmetry.", tip: "Keep your shoulder blades retracted throughout the movement" },
      { title: "Overhead Shoulder Press", desc: "3 sets × 12 reps. Camera monitors lockout position and ensures no lower back hyperextension.", tip: "Brace your core — don't use your legs to push the weight" },
      { title: "Cable Flyes", desc: "3 sets × 15 reps. VR overlays the ideal arc path and confirms full chest stretch at the bottom.", tip: "Feel the stretch in your chest — control the weight down" },
      { title: "Tricep Dips", desc: "3 sets × 12 reps. Camera counts each dip and monitors elbow angle — stop at 90° for safety.", tip: "Keep your body upright to target triceps, not chest" },
      { title: "Push-Up Burnout", desc: "Maximum reps to failure. VR counts each rep and alerts you when form breaks to protect your joints." },
    ],
    muscles: ["Chest", "Anterior Deltoids", "Triceps", "Core"],
    sets: 4, reps: "8-12", rest: "90s",
  },
  "5": {
    title: "Sprint Recovery",
    category: "Recovery", duration: "24 min", calories: 180,
    intensity: "Low", level: "All Levels",
    img: "https://images.unsplash.com/photo-1604011237535-628ea8a45753?w=800&q=80",
    description: "An active recovery session designed to flush lactic acid, reduce muscle soreness, and restore mobility after sprint training. Camera monitors your movement quality and breathing patterns throughout.",
    steps: [
      { title: "Easy Walk Warm-Down", desc: "5 minutes at a slow, relaxed pace. Camera monitors gait symmetry and flags any limping or compensatory movement.", tip: "Allow your heart rate to drop naturally — resist the urge to rush" },
      { title: "Standing Quad Stretch", desc: "30 seconds each leg. Pull heel to glute and hold. VR overlay shows correct hip alignment.", tip: "Stand tall — don't lean forward or arch your lower back" },
      { title: "Lying Hamstring Stretch", desc: "45 seconds each leg lying on your back. Camera confirms your lower back stays flat on the floor.", tip: "Use a resistance band or towel if you can't reach your leg" },
      { title: "Hip Flexor Lunge Stretch", desc: "45 seconds each side in a kneeling lunge position. VR shows the ideal torso angle.", tip: "Squeeze your glute on the back leg to deepen the stretch" },
      { title: "Calf Stretch & Ankle Circles", desc: "30 seconds each calf stretch followed by 10 ankle circles per direction. Camera verifies range of motion.", tip: "Push your heel firmly into the ground during the calf stretch" },
      { title: "Deep Breathing Cool-Down", desc: "4-minute diaphragmatic breathing sequence: inhale 4 counts, hold 2, exhale 6. Camera monitors chest movement vs. belly breathing.", tip: "Focus on belly breathing — your chest should barely move" },
    ],
    muscles: ["Hamstrings", "Quads", "Hip Flexors", "Calves"],
    sets: 2, reps: "30s hold", rest: "15s",
  },
  "6": {
    title: "Aqua Training",
    category: "Cardio", duration: "60 min", calories: 480,
    intensity: "Medium", level: "Intermediate",
    img: "https://images.unsplash.com/photo-1774009304081-ca87dd2f5d99?w=800&q=80",
    description: "A full-body aquatic workout that builds cardiovascular endurance with minimal joint impact. VR camera adapts to water environments, tracking your stroke efficiency, lap count, and body position through the session.",
    steps: [
      { title: "Warm-Up Laps", desc: "4 easy laps using your preferred stroke. Camera establishes your baseline stroke rate and body position.", tip: "Focus on relaxed breathing — establish a rhythm before pushing pace" },
      { title: "Freestyle Intervals", desc: "6 × 50m sprints at 85% effort with 30-second rests. Camera tracks lap splits and stroke efficiency.", tip: "High elbow on the catch — it's the most powerful part of the stroke" },
      { title: "Kickboard Drills", desc: "4 × 25m focusing purely on leg drive. VR monitors kick amplitude and hip rotation.", tip: "Kick from your hips, not your knees — keep legs relatively straight" },
      { title: "Backstroke Recovery Laps", desc: "4 relaxed backstroke laps. Camera monitors body rotation and arm entry point.", tip: "Look straight up at the ceiling — a tilted head slows you down" },
      { title: "Water Resistance Strength", desc: "3 sets of 20 underwater push and pull movements using a pool noodle. Camera counts reps.", tip: "Slow, controlled movements create more resistance in the water" },
      { title: "Cool-Down Swim", desc: "4 easy laps, any stroke. Focus on gliding and full extension. Camera confirms stroke symmetry." },
    ],
    muscles: ["Shoulders", "Back", "Core", "Legs"],
    sets: 3, reps: "2 laps", rest: "60s",
  },
  "7": {
    title: "Sprint Intervals",
    category: "HIIT", duration: "40 min", calories: 580,
    intensity: "High", level: "Advanced",
    img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
    description: "Elite-level sprint interval training that pushes your cardiovascular limits and builds explosive speed. VR camera tracks ground contact time, stride length, and running mechanics to maximise every sprint.",
    steps: [
      { title: "Dynamic Running Warm-Up", desc: "10 minutes: high knees, butt kicks, leg swings, and acceleration drills. Camera confirms warm-up intensity.", tip: "Don't skip this — sprint training on cold muscles risks injury" },
      { title: "Stride-Outs", desc: "4 × 80m gradual accelerations at 70–90% max speed. Camera measures stride length increase.", tip: "Focus on relaxed mechanics — tension slows you down" },
      { title: "30-Second Maximum Sprints", desc: "6 × 30-second all-out sprints with 90-second recovery jogs. Camera measures speed and form under fatigue.", tip: "Drive your arms hard — arm mechanics dictate leg speed" },
      { title: "Flying 60s", desc: "4 × 60m sprints with a 20m rolling start. Camera tracks your peak velocity and when it occurs.", tip: "Lean slightly forward at the start — don't sit back or brake" },
      { title: "Hollow Sprint Repeats", desc: "3 × 100m at 95% effort with full recovery. Camera flags form breakdown — the most common injury point.", tip: "When your form breaks, slow down — speed without form is dangerous" },
      { title: "Cool-Down Jog & Stretch", desc: "10-minute easy jog then 5 minutes of static stretching. Camera verifies your heart rate returns to safe zone." },
    ],
    muscles: ["Glutes", "Quads", "Hamstrings", "Calves"],
    sets: 6, reps: "30s sprint", rest: "90s",
  },
  "8": {
    title: "Core Power",
    category: "Core", duration: "35 min", calories: 260,
    intensity: "Medium", level: "Intermediate",
    img: "https://images.unsplash.com/photo-1638820870229-00003edce192?w=800&q=80",
    description: "A targeted core stability and strength session that builds a solid foundation for every other workout. VR camera tracks spinal position, monitors hip tilt, and ensures proper core engagement throughout every movement.",
    steps: [
      { title: "Dead Bug Activation", desc: "3 × 10 reps each side. Lie on your back and extend opposite arm and leg. Camera monitors lumbar contact with floor.", tip: "Press your lower back into the ground — if it lifts, reduce range" },
      { title: "Plank Progressions", desc: "3 × 45 seconds standard plank, then 3 × 30 seconds side plank each side. VR checks hip alignment.", tip: "Squeeze your glutes and quads — a plank is a full-body move" },
      { title: "Hollow Body Hold", desc: "3 × 30-second holds. Camera monitors lower back position and confirms both legs and arms are off the floor.", tip: "Start with legs higher if you feel your back arching" },
      { title: "Russian Twists", desc: "3 sets × 20 reps with weight. Camera tracks rotation angle and confirms you're twisting your torso, not just your arms.", tip: "Lean back 45° and keep feet raised for maximum oblique engagement" },
      { title: "Ab Wheel Rollouts", desc: "3 × 10 reps. VR monitors your rollout depth and confirms you're not collapsing your lower back.", tip: "Brace hard before you roll — don't let your hips sag" },
      { title: "Mountain Climber Finisher", desc: "3 × 30 seconds maximum speed. Camera counts reps and monitors shoulder position over wrists.", tip: "Drive your knees to your chest — don't let your hips rise above shoulders" },
    ],
    muscles: ["Core", "Obliques", "Lower Back", "Hip Flexors"],
    sets: 3, reps: "15-20", rest: "60s",
  },
  "9": {
    title: "Shoulder Press Pro",
    category: "Strength", duration: "42 min", calories: 310,
    intensity: "Medium", level: "Advanced",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    description: "An advanced shoulder hypertrophy program targeting all three deltoid heads. VR camera monitors bar path on overhead pressing, checks for imbalances between left and right, and tracks full range of motion.",
    steps: [
      { title: "Shoulder Mobility Warm-Up", desc: "5 minutes of band pull-aparts, face pulls, and arm circles. Camera assesses your baseline shoulder mobility before loading.", tip: "If you feel impingement, reduce the range until mobility improves" },
      { title: "Seated Dumbbell Press", desc: "4 sets × 10 reps. VR tracks the dumbbell path and confirms symmetrical press from both sides.", tip: "Don't lock out completely — keep constant tension on the deltoids" },
      { title: "Lateral Raises", desc: "4 sets × 15 reps. Camera monitors elbow angle (slight bend) and confirms you raise to shoulder height — no higher.", tip: "Lead with your elbows, not your hands — think 'pouring a glass of water'" },
      { title: "Front Plate Raises", desc: "3 sets × 12 reps. VR tracks the plate path and monitors core stability during the movement.", tip: "Stop at eye level — going higher shifts load to your traps" },
      { title: "Reverse Pec Deck (Rear Delts)", desc: "4 sets × 15 reps. Camera confirms full arm extension and identifies which side fatigues first.", tip: "Retract your shoulder blades at the end of each rep for full rear delt activation" },
      { title: "Face Pulls Cool-Down", desc: "3 × 20 light reps to finish. VR monitors external rotation and ensures the cable finishes at face height.", tip: "This protects your rotator cuff — never skip it after heavy pressing" },
    ],
    muscles: ["Anterior Deltoids", "Lateral Deltoids", "Rear Deltoids", "Triceps"],
    sets: 4, reps: "8-10", rest: "90s",
  },
  "10": {
    title: "Back Sculpt",
    category: "Strength", duration: "48 min", calories: 380,
    intensity: "Medium", level: "Intermediate",
    img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
    description: "A complete back development session targeting width and thickness. VR camera monitors lat engagement, identifies rounding of the lower back under load, and confirms full range of motion on every pull.",
    steps: [
      { title: "Band Pull-Apart Warm-Up", desc: "3 × 20 band pull-aparts behind the head and in front. Camera assesses scapular retraction quality.", tip: "Squeeze hard at the back — that's the lat and rhomboid activation you need" },
      { title: "Wide-Grip Pull-Ups", desc: "4 sets × 8 reps. VR tracks chin-over-bar depth and monitors elbow path.", tip: "Dead hang at the bottom — partial reps build partial muscles" },
      { title: "Barbell Bent-Over Row", desc: "4 sets × 10 reps. Camera monitors hip hinge angle and confirms bar touches your lower chest each rep.", tip: "Drive your elbows back and up — not just back" },
      { title: "Cable Seated Row", desc: "3 sets × 12 reps with a pause at the chest. VR tracks elbow path and shoulder blade movement.", tip: "Hold the peak contraction for 1 second — that's where the muscle grows" },
      { title: "Single-Arm Dumbbell Row", desc: "3 sets × 12 reps per side. Camera detects rotation cheating and flags it immediately.", tip: "Support yourself well — an unstable base means less back activation" },
      { title: "Straight-Arm Pulldown", desc: "3 sets × 15 reps for lat isolation. VR confirms arms stay straight and monitors the full lat stretch at the top.", tip: "Feel the stretch at the top — that's the eccentric phase that builds size" },
    ],
    muscles: ["Latissimus Dorsi", "Rhomboids", "Rear Deltoids", "Biceps"],
    sets: 4, reps: "10-12", rest: "75s",
  },
  "11": {
    title: "Arm Blaster",
    category: "Strength", duration: "30 min", calories: 220,
    intensity: "Medium", level: "Beginner",
    img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
    description: "A beginner-friendly arm specialisation session targeting biceps and triceps for balanced arm development. VR camera monitors elbow position, tracks the full curl arc, and confirms tricep lockout on every rep.",
    steps: [
      { title: "Banded Warm-Up", desc: "3 × 15 banded bicep curls and tricep pushdowns to pump blood into the muscles before loading.", tip: "Warm-up sets shouldn't feel hard — they're for activation, not fatigue" },
      { title: "Standing Barbell Curl", desc: "3 sets × 12 reps. Camera monitors elbows — they must stay pinned to your sides throughout the movement.", tip: "Slow down the lowering phase — the eccentric builds more muscle" },
      { title: "Incline Dumbbell Curl", desc: "3 sets × 10 reps per arm. Lying on an incline bench gives a longer range of motion. VR confirms full extension at the bottom.", tip: "Don't swing — if you need momentum, drop the weight" },
      { title: "Skull Crushers", desc: "3 sets × 12 reps lying on a bench. Camera monitors bar path and confirms elbows don't flare outward.", tip: "Lower the bar to your forehead — don't go behind your head" },
      { title: "Overhead Dumbbell Tricep Extension", desc: "3 sets × 12 reps. VR tracks elbow position and ensures you get full extension overhead.", tip: "Keep your upper arms vertical — only your forearms should move" },
      { title: "Hammer Curls Finisher", desc: "2 sets × 15 reps each arm. Camera counts reps and monitors the neutral wrist grip throughout.", tip: "Hammer curls target your brachialis — a key muscle for arm thickness" },
    ],
    muscles: ["Biceps", "Triceps", "Brachialis", "Forearms"],
    sets: 3, reps: "12-15", rest: "60s",
  },
  "12": {
    title: "Elite Chest Program",
    category: "Strength", duration: "55 min", calories: 460,
    intensity: "High", level: "Advanced",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    description: "An advanced chest hypertrophy program for experienced lifters seeking maximum pectoral development. VR camera tracks bar path, monitors pec activation vs. shoulder dominance, and confirms arch safety on every set.",
    steps: [
      { title: "Pec Minor Mobility", desc: "5 minutes of doorframe stretches and band dislocates. Camera assesses shoulder mobility before heavy pressing.", tip: "Never load a shoulder you can't properly mobilise first" },
      { title: "Competition Bench Press", desc: "5 sets × 6 reps at 85% of your max. VR overlays the ideal bar path and counts only reps with chest touch.", tip: "Tuck your elbows to 45° — flaring causes shoulder impingement over time" },
      { title: "Weighted Dips", desc: "4 sets × 8 reps with added weight. Camera monitors forward lean angle — more lean means more chest activation.", tip: "Lean forward 30° and let your elbows flare to maximise lower chest" },
      { title: "High-to-Low Cable Fly", desc: "4 sets × 12 reps. VR tracks the crossing movement and confirms the peak contraction when hands meet.", tip: "Slightly cross your hands at the bottom — that's full pec contraction" },
      { title: "Decline Dumbbell Press", desc: "3 sets × 10 reps. Camera monitors dumbbell symmetry and elbow path.", tip: "Lower the weights slowly — 3-second eccentric maximises hypertrophy" },
      { title: "Push-Up Mechanical Drop Set", desc: "Start with feet elevated, then flat, then knees — no rest between. Camera counts each rep variation for total set volume.", tip: "This drop set is the hardest part — breathe and push through it" },
    ],
    muscles: ["Pectoralis Major", "Anterior Deltoids", "Triceps", "Serratus Anterior"],
    sets: 5, reps: "6-10", rest: "120s",
  },
};

const intensityColors: Record<string, { bg: string; text: string; glow: string }> = {
  High:   { bg: "rgba(249,115,22,0.15)",  text: "#F97316", glow: "rgba(249,115,22,0.3)" },
  Medium: { bg: "rgba(234,179,8,0.15)",   text: "#EAB308", glow: "rgba(234,179,8,0.3)" },
  Low:    { bg: "rgba(34,197,94,0.15)",   text: "#22C55E", glow: "rgba(34,197,94,0.3)" },
};

export default function ExerciseDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const c = useColors();
  const { favoriteIds, toggleFavorite } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "steps" | "muscles">("overview");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Touch swipe for steps
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0 && currentStepIdx < ex.steps.length - 1) setCurrentStepIdx((i) => i + 1);
      if (dx > 0 && currentStepIdx > 0) setCurrentStepIdx((i) => i - 1);
    }
  };

  const ex = exerciseData[id || "featured"] || exerciseData["featured"];
  const ic = intensityColors[ex.intensity] || intensityColors["Low"];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: c.bg }}>

      {/* ── Instructions popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {showInstructions && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
              onClick={() => setShowInstructions(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl px-5 pt-5 pb-8 flex flex-col"
              style={{ background: c.card, maxHeight: "85%", border: `1px solid ${c.cardBorder}` }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: c.divider }} />

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #256DE9, #1a4bb5)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-black" style={{ fontSize: 16, color: c.text }}>Before You Start</h3>
                  <p className="text-xs" style={{ color: c.textMuted }}>VR Camera Setup Guide</p>
                </div>
                <button onClick={() => setShowInstructions(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Camera permission notice */}
              <div className="p-3 rounded-2xl mb-4 flex items-start gap-3"
                style={{ background: "rgba(37,109,233,0.1)", border: "1px solid rgba(37,109,233,0.2)" }}>
                <span style={{ fontSize: 16 }}>📷</span>
                <p className="text-xs leading-relaxed" style={{ color: "#256DE9" }}>
                  <span className="font-bold">Camera required.</span> Grant camera access when prompted for motion tracking and real-time form analysis.
                </p>
              </div>

              {/* Swipeable step cards */}
              <div className="flex-1 overflow-hidden">
                {/* Progress dots */}
                <div className="flex gap-1.5 justify-center mb-3">
                  {ex.steps.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ width: i === currentStepIdx ? 20 : 6, background: i === currentStepIdx ? "#256DE9" : c.secondaryCard }}
                      className="h-1.5 rounded-full"
                    />
                  ))}
                </div>

                {/* Step card with touch swipe */}
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStepIdx}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-2xl"
                      style={{ background: c.secondaryCard, border: `1px solid ${c.cardBorder}` }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "#256DE9" }}
                        >
                          <span className="text-white font-black text-sm">{currentStepIdx + 1}</span>
                        </div>
                        <p className="font-bold" style={{ fontSize: 15, color: c.text }}>
                          {ex.steps[currentStepIdx].title}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: c.textSub }}>
                        {ex.steps[currentStepIdx].desc}
                      </p>
                      {ex.steps[currentStepIdx].tip && (
                        <div className="p-2.5 rounded-xl flex items-start gap-2"
                          style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
                          <span style={{ fontSize: 12 }}>💡</span>
                          <p className="text-xs" style={{ color: "#EAB308" }}>
                            <span className="font-bold">Tip: </span>{ex.steps[currentStepIdx].tip}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Swipe hint */}
                <p className="text-center text-[10px] mt-2" style={{ color: c.textMuted }}>
                  ← swipe to navigate steps →
                </p>

                {/* Navigation arrows */}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => currentStepIdx > 0 && setCurrentStepIdx((i) => i - 1)}
                    disabled={currentStepIdx === 0}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-30"
                    style={{ background: c.secondaryCard, color: c.textSub, border: `1px solid ${c.cardBorder}` }}
                  >
                    ← Prev
                  </button>
                  {currentStepIdx < ex.steps.length - 1 ? (
                    <button
                      onClick={() => setCurrentStepIdx((i) => i + 1)}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
                      style={{ background: "#256DE9", color: "white" }}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowInstructions(false); navigate(`/workout/${id || "featured"}`); }}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #256DE9 0%, #0d1630 100%)", boxShadow: "0 8px 24px rgba(37,109,233,0.4)" }}
                    >
                      Let's Go! 🚀
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero image ─────────────────────────────────────────────── */}
      <div className="relative shrink-0" style={{ height: 260 }}>
        <img src={ex.img} alt={ex.title} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,9,15,0.4) 0%, transparent 35%, rgba(7,9,15,0.5) 70%, #07090F 100%)" }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 pt-14">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(7,9,15,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => toggleFavorite(id || "featured")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(7,9,15,0.6)", backdropFilter: "blur(10px)", border: `1px solid ${favoriteIds.includes(id || "featured") ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteIds.includes(id || "featured") ? "#ef4444" : "none"} stroke={favoriteIds.includes(id || "featured") ? "#ef4444" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Camera badge */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: "rgba(7,9,15,0.7)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" style={{ animation: "pulse 1.5s infinite" }} />
          <span className="text-white text-[10px] font-bold tracking-wider">VR CAMERA TRACKING</span>
        </div>

        {/* Badges */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
            style={{ background: "rgba(37,109,233,0.2)", color: "#256DE9", border: "1px solid rgba(37,109,233,0.3)" }}>
            {ex.category}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
            style={{ background: ic.bg, color: ic.text, border: `1px solid ${ic.glow}` }}>
            {ex.intensity}
          </span>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-[120px]">
        <div className="px-5 pt-3">
          <h1 className="mb-4" style={{ fontSize: 22, fontWeight: 800, color: c.text }}>{ex.title}</h1>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            {[
              { label: "Duration", value: ex.duration, icon: "⏱️" },
              { label: "Calories", value: `${ex.calories}`, icon: "🔥" },
              { label: "Sets", value: `${ex.sets}`, icon: "🔁" },
              { label: "Level", value: ex.level.split(" ")[0], icon: "📊" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-2.5 text-center"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}>
                <div style={{ fontSize: 16 }}>{s.icon}</div>
                <div className="font-black text-xs mt-0.5" style={{ color: c.text }}>{s.value}</div>
                <div className="font-medium" style={{ color: c.textMuted, fontSize: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl p-1 mb-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
            {(["overview", "steps", "muscles"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={activeTab === tab
                  ? { background: "#256DE9", color: "white", boxShadow: "0 4px 12px rgba(37,109,233,0.3)" }
                  : { color: c.textMuted }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="leading-relaxed mb-5" style={{ fontSize: 14, color: c.textSub }}>{ex.description}</p>

                <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-2xl"
                  style={{ background: c.accentBg, border: "1px solid rgba(37,109,233,0.15)" }}>
                  {[
                    { label: "Sets", value: ex.sets, icon: "🔁" },
                    { label: "Reps", value: ex.reps, icon: "💪" },
                    { label: "Rest", value: ex.rest, icon: "⏸️" },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`text-center ${i < arr.length - 1 ? "border-r" : ""}`}
                      style={{ borderColor: "rgba(37,109,233,0.2)" }}>
                      <div style={{ fontSize: 18 }}>{item.icon}</div>
                      <div className="font-black mt-1" style={{ fontSize: 18, color: "#256DE9" }}>{item.value}</div>
                      <div className="text-xs" style={{ color: c.textMuted }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl flex items-start gap-3"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(234,179,8,0.15)" }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1" style={{ color: c.text }}>Pro Tip</p>
                    <p className="text-xs leading-relaxed" style={{ color: c.textSub }}>
                      {ex.steps[0]?.tip || "Focus on form over speed. The camera will detect and alert you to form breaks automatically."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "steps" && (
              <motion.div key="steps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Progress bar */}
                <div className="flex items-center gap-1.5 mb-5">
                  {ex.steps.map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: expandedStep !== null && i <= expandedStep ? "#256DE9" : c.secondaryCard }} />
                  ))}
                </div>

                <div className="space-y-3">
                  {ex.steps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <button onClick={() => setExpandedStep(expandedStep === i ? null : i)} className="w-full text-left">
                        <div className="rounded-2xl p-4 transition-all"
                          style={expandedStep === i
                            ? { background: c.accentBg, border: "1.5px solid rgba(37,109,233,0.3)", boxShadow: "0 8px 24px rgba(37,109,233,0.12)" }
                            : { background: c.card, border: `1px solid ${c.cardBorder}` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                              style={expandedStep === i
                                ? { background: "#256DE9", boxShadow: "0 4px 12px rgba(37,109,233,0.4)" }
                                : { background: c.secondaryCard }}>
                              <span className="font-black text-sm"
                                style={{ color: expandedStep === i ? "white" : c.textMuted }}>{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm"
                                style={{ color: expandedStep === i ? "#256DE9" : c.text }}>{step.title}</p>
                              {expandedStep !== i && (
                                <p className="text-xs mt-0.5 truncate" style={{ color: c.textMuted }}>
                                  {step.desc.substring(0, 45)}...
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 transition-transform duration-200"
                              style={{ transform: expandedStep === i ? "rotate(180deg)" : "rotate(0deg)", color: c.textMuted }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                          </div>
                          <AnimatePresence>
                            {expandedStep === i && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(37,109,233,0.15)" }}>
                                  <p className="text-sm leading-relaxed" style={{ color: c.textSub }}>{step.desc}</p>
                                  {step.tip && (
                                    <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl"
                                      style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                                      <span style={{ fontSize: 14 }}>💡</span>
                                      <p className="text-xs leading-relaxed" style={{ color: "#EAB308" }}>
                                        <span className="font-bold">Tip: </span>{step.tip}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-2xl flex items-center gap-3"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <p className="text-xs leading-relaxed" style={{ color: "#22C55E" }}>
                    <span className="font-bold">Complete all {ex.steps.length} steps</span> — swipe in the VR popup for step-by-step guidance.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "muscles" && (
              <motion.div key="muscles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.textMuted }}>
                  Muscle Groups Targeted
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {ex.muscles.map((muscle, i) => (
                    <motion.span key={muscle} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                      className="px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"
                      style={{
                        background: i === 0 ? "#256DE9" : c.accentBg,
                        color: i === 0 ? "white" : "#256DE9",
                        border: `1px solid rgba(37,109,233,${i === 0 ? "0" : "0.25"})`,
                        boxShadow: i === 0 ? "0 6px 20px rgba(37,109,233,0.3)" : "none",
                      }}>
                      {i === 0 && <span>🎯</span>}
                      {muscle}
                    </motion.span>
                  ))}
                </div>

                <div className="p-4 rounded-2xl mb-4" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: c.accentBg }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#256DE9" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="font-bold text-sm" style={{ color: c.text }}>Activation Summary</p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: c.textSub }}>
                    This exercise primarily targets{" "}
                    <span className="font-bold" style={{ color: "#256DE9" }}>{ex.muscles.slice(0, 2).join(" and ")}</span>
                    , with secondary activation of{" "}
                    <span className="font-semibold" style={{ color: c.text }}>
                      {ex.muscles.slice(2).join(" and ") || "supporting muscle groups"}
                    </span>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl" style={{ background: ic.bg, border: `1px solid ${ic.glow}` }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: ic.text }}>
                    Intensity Level — {ex.intensity}
                  </p>
                  <div className="flex items-center gap-2">
                    {["Low", "Medium", "High"].map((lvl) => (
                      <div key={lvl} className="flex-1 h-2 rounded-full"
                        style={{
                          background: (lvl === "Low") || (lvl === "Medium" && ex.intensity !== "Low") || ex.intensity === "High" ? ic.text : c.secondaryCard,
                          opacity: (lvl === "Low" ? 1 : (lvl === "Medium" && (ex.intensity === "Medium" || ex.intensity === "High")) ? 1 : ex.intensity === "High" ? 1 : 0.3),
                        }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {["Low", "Medium", "High"].map((lvl) => (
                      <span key={lvl} className="text-[9px] font-semibold" style={{ color: ic.text, opacity: 0.7 }}>{lvl}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CTA bar */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: `linear-gradient(to top, ${c.bg} 60%, ${c.bg}ee 100%)`, borderTop: `1px solid ${c.divider}` }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setCurrentStepIdx(0); setShowInstructions(true); }}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-3"
          style={{
            background: "linear-gradient(135deg, #256DE9 0%, #1a4bb5 100%)",
            boxShadow: "0 16px 40px rgba(37,109,233,0.35)",
            fontSize: 16,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
          </svg>
          Start VR Workout
        </motion.button>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}