# Task ID: diary-enhance-2
## Agent: styling-agent
## Task: Enhance Diary Page Visual Design

### Work Summary:

#### 1. Mood Calendar Heatmap Enhancement (`calendar-view.tsx`)
- **Added `MOOD_CELL_BG` constant** — Maps mood values 1-5 to subtle background tint classes:
  - Mood 1 (Ужасно) → `bg-rose-50 dark:bg-rose-950/30`
  - Mood 2 (Плохо) → `bg-amber-50 dark:bg-amber-950/30`
  - Mood 3 (Нормально) → `bg-yellow-50/60 dark:bg-yellow-950/20`
  - Mood 4 (Хорошо) → `bg-lime-50 dark:bg-lime-950/30`
  - Mood 5 (Отлично) → `bg-emerald-50 dark:bg-emerald-950/30`
- **Enhanced cell hover** — Changed all calendar cells to `hover:scale-125` for consistent subtle zoom on hover
- **Mood-tinted cell backgrounds** — Cells with entries now use mood-specific background colors instead of generic `bg-accent/50`
- **Pulsing today ring** — Replaced static `ring-2 ring-primary ring-offset-2` with a separate `<span>` element using `animate-pulse` for a pulsing ring effect on today's cell. The ring uses `ring-primary/60` opacity for softer appearance
- **Added `z-10` to day number** — Ensures day number renders above the pulsing ring overlay

#### 2. Entry Cards Visual Enhancement (`entry-list.tsx`)
- **Reading progress indicator** — Added a thin gradient bar (`h-0.5`) at the bottom of each card with `bg-gradient-to-r from-emerald-400 to-teal-400`. Width is dynamically calculated: 100% when expanded, proportional to `150/content.length` when collapsed. Smooth transition animation (`duration-500 ease-out`)
- **Word count badge in header** — Added a small muted word count badge (`text-[10px]`, dashed border) in the card header area next to date and mood badge. Shows `N сл.` format with FileText icon. Added `flex-wrap` to header row for proper wrapping
- **"Time ago" display** — Already present in the codebase (using `getRelativeTime()` helper at line 218). Confirmed working with Clock icon and subtle styling

#### 3. Detail Panel Enhancement (`entry-detail.tsx`)
- **Gradient header accent** — Added `absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent` overlay at the top of each entry card for a subtle gradient header effect
- **Larger mood emoji** — Increased mood emoji container from `h-14 w-14` to `h-16 w-16` and emoji size from `text-4xl` to `text-5xl`
- **Entry navigation buttons** — Added "Предыдущая"/"Следующая" buttons at the bottom of each entry card using ChevronLeft/ChevronRight icons. Features:
  - Ghost variant with muted text that highlights on hover
  - Disabled state when no prev/next entry available
  - Entry counter display between buttons (e.g., "3 / 14")
  - Separated from actions by a `<Separator />`
  - `stopPropagation()` to prevent card click handler interference
  - Only shown when there are prev/next entries available

#### 4. Parent Component Update (`diary-page.tsx`)
- **Added `allEntries` prop** — Passes the full entries array to EntryDetail for navigation computation
- **Added `onNavigateEntry` callback** — Updates both `selectedDate` and `selectedEntry` when navigating between entries

### Verification Results:
- ✅ ESLint: 0 errors, 158 warnings (all pre-existing no-console warnings)
- ✅ Dev server: compiles cleanly, HTTP 200

### Files Modified:
1. `/src/components/diary/calendar-view.tsx` — Calendar heatmap enhancements
2. `/src/components/diary/entry-list.tsx` — Entry card progress bar and word count
3. `/src/components/diary/entry-detail.tsx` — Gradient header, larger emoji, navigation
4. `/src/components/diary/diary-page.tsx` — New props passed to EntryDetail
