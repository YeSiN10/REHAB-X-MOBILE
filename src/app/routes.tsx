import { createBrowserRouter } from "react-router";
import Root from "./Root";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import HomeScreen from "./screens/HomeScreen";
import SessionHistoryScreen from "./screens/SessionHistoryScreen";
import ExercisesScreen from "./screens/ExercisesScreen";
import ExerciseDetailScreen from "./screens/ExerciseDetailScreen";
import ActiveWorkoutScreen from "./screens/ActiveWorkoutScreen";
import WorkoutCompleteScreen from "./screens/WorkoutCompleteScreen";
import ProgressScreen from "./screens/ProgressScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import PlansScreen from "./screens/PlansScreen";
import ProfileSetupScreen from "./screens/ProfileSetupScreen";
import PremiumScreen from "./screens/PremiumScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: SplashScreen },
      { path: "login", Component: LoginScreen },
      { path: "signup", Component: SignUpScreen },
      { path: "onboarding", Component: OnboardingScreen },
      { path: "profile-setup", Component: ProfileSetupScreen },
      { path: "home", Component: HomeScreen },
      { path: "sessions", Component: SessionHistoryScreen },
      { path: "exercises", Component: ExercisesScreen },
      { path: "exercises/:id", Component: ExerciseDetailScreen },
      { path: "workout/:id", Component: ActiveWorkoutScreen },
      { path: "workout-complete/:id", Component: WorkoutCompleteScreen },
      { path: "progress", Component: ProgressScreen },
      { path: "calendar", Component: CalendarScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "settings", Component: SettingsScreen },
      { path: "notifications", Component: NotificationsScreen },
      { path: "plans", Component: PlansScreen },
      { path: "premium", Component: PremiumScreen },
    ],
  },
]);
