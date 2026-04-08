# Task 2-d + 2-e: Database Transaction Safety & Code Deduplication

## Part 1: Database Transaction Safety

### 1. `src/app/api/finance/accounts/route.ts` (POST handler)
- **Before**: Two separate DB calls — `updateMany` to unset defaults, then `create` for new account
- **After**: Wrapped in `db.$transaction(async (tx) => { ... })` — both `tx.account.updateMany` and `tx.account.create` run atomically
- **Also**: Replaced local `DEMO_USER_ID` with import from `@/lib/api`

### 2. `src/app/api/habits/[id]/route.ts` (PUT handler - toggle)
- **Before**: Three separate DB calls — `findUnique` for habit, `findUnique` for existing log, then `create` or `delete`
- **After**: Wrapped in `db.$transaction(async (tx) => { ... })` — `tx.habit.findUnique`, `tx.habitLog.findUnique`, `tx.habitLog.create`/`tx.habitLog.delete` all run atomically. Returns null from transaction if habit not found, then handles 404 outside
- **Also**: Replaced local `USER_ID` with `DEMO_USER_ID` from `@/lib/api`

### 3. `src/app/api/feed/like/route.ts` (POST handler)
- **Before**: Post existence check outside, then `findUnique` for existing like, `create`/`delete`, then `count` — 4 separate DB calls
- **After**: Post existence check remains outside (early exit optimization, no rollback needed). Like toggle + count wrapped in `db.$transaction(async (tx) => { ... })` — `tx.like.findUnique`, `tx.like.create`/`tx.like.delete`, `tx.like.count` all atomic
- **Also**: Replaced local `USER_ID` with `DEMO_USER_ID` from `@/lib/api`

### 4. `src/app/api/achievements/route.ts` (GET handler)
- **Before**: `createMany` for newly earned achievements, then separate `findMany` to fetch all persisted — 2 sequential DB calls
- **After**: Both `tx.achievement.createMany` and `tx.achievement.findMany` wrapped in `db.$transaction(async (tx) => { ... })` — atomic write + read

## Part 2: Code Deduplication

### 1. Achievements route (`src/app/api/achievements/route.ts`)
- **Removed**: Local `todayStr()`, `dateToStr()`, `calcStreak()` functions (~35 lines)
- **Replaced with**: Imports from `@/lib/format` — `getTodayStr`, `toDateStr`, `calculateStreak`
- **Analysis**: Local `calcStreak` sorted dates ascending then reversed, counted consecutive from end, checked today/yesterday start. Shared `calculateStreak` from `@/lib/format` uses Set dedup, starts from today/yesterday, counts backwards with safety limit (MAX_STREAK_ITERATIONS). Both produce identical results; shared version is more robust.
- **Also**: Changed `USER_ID` alias import to direct `DEMO_USER_ID` import from `@/lib/api`

### 2. Diary route (`src/app/api/diary/route.ts`)
- **Already fixed** by previous agent — `safeParseJSON` and `DEMO_USER_ID` already imported from `@/lib/api`. No local duplicates found.

### 3. All API routes — USER_ID/DEMO_USER_ID deduplication
- **17 files fixed** to import `DEMO_USER_ID` from `@/lib/api` instead of defining local constants:
  - `module-counts/route.ts` (was `USER_ID`)
  - `diary/stats/route.ts` (was `DEMO_USER_ID`)
  - `seed-lite/route.ts` (was `USER_ID`)
  - `notifications/route.ts` (was `USER_ID`)
  - `analytics/route.ts` (was `USER_ID`)
  - `budgets/route.ts` (was `DEMO_USER_ID`)
  - `nutrition/goals/route.ts` (was `USER_ID`)
  - `nutrition/water/[id]/route.ts` (was `USER_ID`)
  - `nutrition/stats/route.ts` (was `USER_ID`)
  - `nutrition/[id]/route.ts` (was `USER_ID`)
  - `settings/clear/route.ts` (was `USER_ID`)
  - `settings/export/route.ts` (was `USER_ID`)
  - `settings/import/route.ts` (was `USER_ID`)
  - `settings/stats/route.ts` (was `USER_ID`)
  - `feed/comment/route.ts` (was `USER_ID`)
  - 2 files (`diary/[id]/route.ts`, `workout/[id]/route.ts`) were already fixed by a previous agent
- **Verified**: `rg -n "const (DEMO_USER_ID|USER_ID)\s*=" src/app/api/` returns 0 results after changes

## Lint Results
- ✅ **0 errors**, 156 warnings (all pre-existing `no-console` warnings)
- ✅ Dev server compiles cleanly, all routes returning HTTP 200
