# REHAB X Mobile App

A React + Vite mobile fitness/recovery app rendered in a phone frame preview.

## Tech Stack

- **Framework**: React 18 + Vite 6
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4 + custom theme
- **Animation**: Framer Motion (motion)
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React + MUI Icons
- **Backend**: Supabase (Edge Functions for KV store / user sync)

## Project Structure

```
src/
  main.tsx                  # Entry point
  app/
    App.tsx                 # RouterProvider
    Root.tsx                # Phone frame shell + AnimatePresence
    routes.tsx              # All app routes
    context/
      AppContext.tsx         # Global state (user, sessions, theme, mood)
    screens/                # All app screens
      SplashScreen.tsx
      LoginScreen.tsx
      SignUpScreen.tsx
      OnboardingScreen.tsx
      ProfileSetupScreen.tsx
      HomeScreen.tsx
      SessionHistoryScreen.tsx
      ExercisesScreen.tsx
      ExerciseDetailScreen.tsx
      ActiveWorkoutScreen.tsx
      WorkoutCompleteScreen.tsx
      ProgressScreen.tsx
      CalendarScreen.tsx
      ProfileScreen.tsx
      SettingsScreen.tsx
      NotificationsScreen.tsx
      PlansScreen.tsx
      PremiumScreen.tsx
    components/
      BottomNav.tsx
      ProfileSidebar.tsx
      CurvedHeader.tsx
      ui/                   # shadcn/ui components
      figma/                # Figma-imported components
  styles/
    index.css
    tailwind.css
    theme.css
    fonts.css
  imports/                  # Figma-exported assets / images
supabase/
  functions/server/         # Edge functions (KV store, user/session sync)
utils/
  supabase/info.tsx         # Supabase project ID + anon key
```

## Running the App

```bash
npm run dev   # starts on port 5000
```

## Workflow

- **Start application**: `npm run dev` → port 5000 (webview)

## Key Features

- Phone frame simulation with Dynamic Island
- Smooth page transitions (AnimatePresence)
- Dark / Light theme toggle (persisted to localStorage + Supabase)
- Workout session tracking with seed data
- Recovery score computation based on sessions + mood
- Progress charts (weekly/monthly area + bar charts)
- Exercise library with detail views
- Active workout timer
- Profile setup + onboarding flow
- Premium screen
- Supabase sync (user, sessions, settings) with offline localStorage fallback
