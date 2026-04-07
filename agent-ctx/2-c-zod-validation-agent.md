# Task 2-c: Zod Input Validation for Core API Routes

## Agent: zod-validation-agent

## Summary
Added Zod input validation to all 9 core POST endpoints and 6 dynamic PUT/PATCH endpoints using the shared `parseBody()` utility from `@/lib/api`. Replaced all manual `if`-based validation blocks with declarative Zod schemas.

## Files Changed (15 total)

### Core POST Routes (9 files)

1. **`/src/app/api/diary/route.ts`**
   - Schema: `createDiarySchema` — validates `content` (required, min 1), `title`, `mood` (int 1-5), `date`, `tags` (string[]), `photos` (string[])
   - Removed manual content/mood validation; uses `parseBody()`
   - Replaced local `DEMO_USER_ID` with import from `@/lib/api`
   - Replaced local `safeParseJSON` with import from `@/lib/api`

2. **`/src/app/api/finance/route.ts`**
   - Schema: `createTransactionSchema` — validates `type` (enum), `amount` (positive), `date` (required), optional fields
   - Removed manual type/amount/date checks; uses `parseBody()`
   - Removed `parseFloat()` since Zod ensures `amount` is already a number
   - Kept business logic check for category existence

3. **`/src/app/api/nutrition/route.ts`**
   - Schema: `createMealSchema` — validates `type` (enum), `date` (required), `items` (array with `name` required per item)
   - Removed manual meal type, date, items loop validation; uses `parseBody()`
   - Replaced local `USER_ID` with `DEMO_USER_ID` from `@/lib/api`

4. **`/src/app/api/nutrition/water/route.ts`**
   - Schema: `createWaterLogSchema` — validates `date` (required), `amountMl` (positive, optional)
   - Removed manual date check; uses `parseBody()`

5. **`/src/app/api/workout/route.ts`**
   - Schema: `createWorkoutSchema` — validates `name` (min 1), `date` (required), optional exercises array
   - Removed manual name/date check; uses `parseBody()`

6. **`/src/app/api/collections/route.ts`**
   - Schema: `createCollectionSchema` — validates `type` (via shared `collectionTypeSchema`), `title` (min 1), `rating` (int 1-5, nullable)
   - Removed manual type/title/rating validation; uses `parseBody()`

7. **`/src/app/api/feed/route.ts`**
   - Schema: `createPostSchema` — validates `entityType` (min 1), `entityId` (min 1), optional `caption`/`tags`
   - Removed manual required field check; uses `parseBody()`

8. **`/src/app/api/habits/route.ts`**
   - Schema: `createHabitSchema` — validates `name` (min 1), optional `emoji`, `color`, `frequency`, `targetCount`, `archived`, `category`
   - Removed manual name trim check; uses `parseBody()`

9. **`/src/app/api/goals/route.ts`**
   - Schema: `createGoalSchema` — validates `title` (min 1), `progress` (0-100), optional fields
   - Removed manual title check; uses `parseBody()`

### Dynamic PUT/PATCH Routes (6 files)

10. **`/src/app/api/diary/[id]/route.ts`** (PUT)
    - Schema: `updateDiarySchema` — partial update, all fields optional
    - Removed manual content/mood/date validation blocks

11. **`/src/app/api/finance/[id]/route.ts`** (PUT)
    - Schema: `updateTransactionSchema` — `amount` and `date` required, `type` optional (via shared `transactionTypeSchema`)
    - Removed manual type/amount/date checks

12. **`/src/app/api/collections/[id]/route.ts`** (PUT)
    - Schema: `updateCollectionSchema` — partial update, uses shared `collectionTypeSchema`
    - Removed manual type/rating validation

13. **`/src/app/api/habits/[id]/route.ts`** (PATCH)
    - Schema: `updateHabitSchema` — partial update for habit details
    - PUT (toggle) unchanged — no body to validate

14. **`/src/app/api/workout/[id]/route.ts`** (PUT)
    - Schema: `updateWorkoutSchema` — validates `name`, `date`, optional exercises array
    - Removed manual name/date check; eliminated inline type annotations for exercises

15. **`/src/app/api/goals/[id]/route.ts`** (PUT)
    - Schema: `updateGoalSchema` — partial update, all fields optional
    - Added Zod validation where previously there was none

## Pattern Used
```typescript
import { z } from 'zod'
import { parseBody, DEMO_USER_ID } from '@/lib/api'

const createXxxSchema = z.object({ ... })

export async function POST(request: NextRequest) {
  try {
    const data = await parseBody(request, createXxxSchema)
    if (!data) return  // parseBody already sends error response
    // ... business logic with typed `data`
  } catch (error) { ... }
}
```

## Reused Shared Schemas from `@/lib/api`
- `DEMO_USER_ID` — replaced 8 local constant declarations
- `transactionTypeSchema` — used in finance routes
- `collectionTypeSchema` — used in collections routes
- `safeParseJSON` — used in diary serialization
- `parseBody()` — the core validation utility

## Verification
- ✅ ESLint: 0 errors, 156 warnings (all pre-existing no-console/react-hooks warnings)
- ✅ Dev server: compiles cleanly, all requests return HTTP 200
- ✅ No breaking changes to existing business logic
