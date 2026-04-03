---
Task ID: diary-edit
Agent: diary-edit-agent
Task: Add edit functionality to Diary module

Work Log:
- Read worklog.md and analyzed current project state — diary module already had UI for edit (buttons, dialog, form state) but was missing the backend API endpoint
- Read `/src/components/diary/diary-page.tsx` (1300+ lines) — confirmed existing edit infrastructure: `showEditDialog` state, `openEditDialog()` pre-fills form, `handleSubmitEdit()` sends PUT to `/api/diary/${id}`, `renderEntryDialog()` shared function for create/edit, edit buttons in detail panel header and footer
- Read `/src/app/api/diary/route.ts` — confirmed only GET and POST handlers exist, no PUT or DELETE for individual entries
- Created `/src/app/api/diary/[id]/route.ts` — new dynamic route with PUT and DELETE handlers:
  - PUT handler: validates entry ownership, accepts title/content/mood/date/tags/photos fields, only updates provided fields, returns serialized entry with `{ data }` response format
  - DELETE handler: validates entry ownership, deletes entry, returns `{ success: true, message }` response
  - Both handlers use Next.js 15+ `params: Promise<{ id: string }>` pattern (matching existing collections/[id] pattern)
  - Full validation: content non-empty, mood 1-5 integer, ISO date format, tags/photos as string arrays
- Updated `handleSubmitEdit` in diary-page.tsx:
  - Added `toast.dismiss()` before operation
  - Added `toast.success('Запись обновлена')` on successful edit
  - Added `toast.error('Ошибка при обновлении записи')` on non-ok response
  - Added catch block `toast.error(...)` with safe error extraction
  - Updated `selectedEntry` state with response data after successful edit for immediate UI refresh
- Verified existing edit dialog already works correctly: pre-fills title/content/mood/tags/date, mood selector with emoji system, tag input with Enter key, date picker, Russian labels throughout

### Verification Results:
- ESLint: 0 errors, 0 warnings (full project lint)
- Dev server: compiles cleanly, HTTP 200 on GET /
- All existing diary functionality preserved (create, view, delete)
- Prisma schema not modified
- Dark mode supported (all components use shadcn/ui)

### Stage Summary:
- Created `/api/diary/[id]/route.ts` with PUT and DELETE handlers — enables full CRUD for individual diary entries
- Enhanced `handleSubmitEdit` with toast notifications (success + error) matching pattern used by create/delete handlers
- Edit flow now fully functional: click edit button → dialog pre-fills with existing data → submit → toast + refresh + UI update
