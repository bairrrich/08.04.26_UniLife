# Task ID: productivity-weather-widgets
## Agent: widget-enhancement-agent
## Task: Enhance Productivity Score Widget and Weather Widget

### Work Summary:

**Task 1 — Enhanced Productivity Score Widget (`/src/components/dashboard/productivity-score.tsx`):**

**Changes Made:**
- **New Props Interface**: Replaced old props (`diaryWritten`, `waterMl`, `workoutDone`, `habitsCompleted`, `habitsTotal`, `nutritionLogged`, `score`) with new ones:
  - `habitsPercentage: number` — Habits completion 0-100 (40% weight)
  - `hasDiaryEntry: boolean` — Diary entry today (20% weight)
  - `hasWorkout: boolean` — Workout today (20% weight)
  - `waterProgress: number` — Water intake 0-100 (20% weight)
  - `scoreHistory?: number[]` — 7-day history (preserved)
  - `loading: boolean` — Loading state (preserved)

- **Score Calculation**: Moved inside the widget (was previously passed as prop). Formula: `habitsPercentage * 0.4 + diary(20) + workout(20) + waterProgress * 0.2`

- **Score Color Thresholds Updated**:
  - Red: < 30 (was < 50)
  - Amber: 30-59 (was 50-79)
  - Emerald: 60-80 (was ≥ 80)
  - Emerald + Glow: > 80 (new tier with faster pulse animation and drop shadow glow)

- **Breakdown Items Enhanced**:
  - 4 items: Привычки (✅), Дневник (📝), Тренировка (🏃), Вода (💧)
  - Each shows Check/X icon (from lucide-react) instead of custom emoji circles
  - Weight percentage displayed (40%, 20%, 20%, 20%)
  - Mini progress bar with 3-state coloring (emerald for 100%, amber for partial, muted for 0%)

- **Label**: Changed from "Продуктивность за сегодня" to "Продуктивность" with Zap icon
- **Imports**: Replaced `CheckCircle2, Circle` with `Check, X` from lucide-react

**Task 2 — Mood-Based Weather Widget (`/src/components/dashboard/weather-widget.tsx`):**

**Complete rewrite** from real Open-Meteo API weather widget to mood-based "weather" widget:

- **New Props Interface**:
  - `avgMood: number | null` — Average mood 1-5 (null = no data)
  - `productivityScore: number` — 0-100 productivity score
  - `hasDiaryEntry: boolean` — Diary entry today
  - `hasWorkout: boolean` — Workout today
  - `habitsCompleted: boolean` — All habits completed

- **Weather Conditions** (based on mood):
  - avgMood ≥ 4: "Солнечно ☀️" with warm amber/orange gradient
  - avgMood 2-4: "Облачно ⛅" with neutral slate/gray gradient
  - avgMood < 2: "Дождливо 🌧️" with cool blue/indigo gradient
  - No mood data: "Ясно 🌤️" with sky/cyan default gradient

- **Temperature Display**: Maps productivity score to 0-40° range with colored text matching weather condition

- **Day Forecast**: 3 items in a grid:
  - 📝 Дневник (Check/X)
  - 🏃 Тренировка (Check/X)
  - ✅ Привычки (Check/X)
  - Completed count badge (emerald/amber/muted coloring)

- **Visual Design**:
  - Multi-layered gradient backgrounds matching weather condition
  - Decorative blur orbs (amber + sky)
  - Glass card with card-hover effect
  - Floating gradient icon badge
  - Dark mode support throughout

**Task 3 — Dashboard Integration (`/src/components/dashboard/dashboard-page.tsx`):**

- **Water Progress**: New `waterProgress` memo computed from `waterTodayMl / 2000ml * 100`
- **Average Mood**: New `avgMood` memo computed from `recentMoods` (last 7 days average)
- **Productivity Score**: Updated formula to match new weights (habits 40%, diary 20%, workout 20%, water 20%)
- **ProductivityScore Props**: Updated to pass `habitsPercentage`, `hasDiaryEntry`, `hasWorkout`, `waterProgress`
- **WeatherWidget Props**: Updated to pass `avgMood`, `productivityScore`, `hasDiaryEntry`, `hasWorkout`, `habitsCompleted`

### Verification Results:
- ✅ ESLint: 0 errors, 157 warnings (pre-existing)
- ✅ Dev server: compiles successfully ("Ready in ~400ms")
- ✅ All existing dashboard functionality preserved
- ✅ Widget config system integration maintained (DEFAULT_SECTIONS unchanged)

### Files Modified:
1. `/src/components/dashboard/productivity-score.tsx` — Enhanced props, scoring, colors, breakdown
2. `/src/components/dashboard/weather-widget.tsx` — Complete rewrite to mood-based widget
3. `/src/components/dashboard/dashboard-page.tsx` — Updated props and added computed values
