---
Task ID: workout-feed-enhance
Agent: workout-feed-enhance-agent
Task: Enhance workout page with personal records and feed page with reactions

Work Log:
- **Workout Page — Exercise Type Stats Bar**: Enhanced existing exercise type badges to show per-type workout counts with colored icons and tabular-nums font
- **Workout Page — Personal Records Summary Card**: Created `PersonalRecordsSummary` component with 3-column grid showing max weight, longest duration, total workouts. Trophy icon in amber gradient header. Only visible when workouts exist.
- **Workout Page — "Мой рекорд" Badge**: Added `exerciseMaxWeights` prop to `WorkoutDialog`. In ExerciseEditor, weight inputs show amber "✨ Рекорд" badge when entered weight exceeds personal max for that exercise name
- **Feed Page — Inline Reaction Buttons**: Added 4 visible reaction buttons (❤️ ❤️‍🔥 👏 😢) below each post. Tracks in localStorage (`unilife-post-reactions-{postId}`). Toggle select/deselect. Show reaction counts per type.
- **Feed Page — Enhanced Comment Section**: Updated comment header to use Badge component for count display. Added Badge import.

Stage Summary:
- 0 ESLint errors, dev server compiles successfully (GET / 200)
- New file: `/src/components/workout/personal-records-summary.tsx`
- Modified: `workout-page.tsx`, `workout-dialog.tsx`, `post-card.tsx`, `comment-section.tsx`
- All existing functionality preserved
