# UniLife — Worklog

---

## Project Overview

**UniLife** is a comprehensive personal life tracker application built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma ORM, and Recharts. It combines diary, finance, nutrition, workout, collections, and social feed modules into a single unified interface.

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **Database**: Prisma ORM + SQLite
- **State Management**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## Current Project Status

### ✅ Completed Features

1. **Database Schema** — Full Prisma schema with 15+ models (User, DiaryEntry, Transaction, Category, SubCategory, Budget, Meal, MealItem, WaterLog, Workout, WorkoutExercise, CollectionItem, Post, Like, Comment, Follow)

2. **API Routes** — REST API for all modules:
   - `/api/diary` — CRUD for diary entries with date filtering
   - `/api/finance` — Transactions, categories, monthly stats
   - `/api/finance/categories` — Category management
   - `/api/finance/stats` — Monthly financial summary
   - `/api/nutrition` — Meal CRUD with items
   - `/api/nutrition/water` — Water tracking
   - `/api/nutrition/stats` — Daily macro summary
   - `/api/workout` — Workout CRUD with exercises
   - `/api/collections` — Collection items CRUD
   - `/api/collections/[id]` — Individual item update/delete
   - `/api/feed` — Social feed with likes/comments
   - `/api/seed` — Database seeding

3. **App Layout** — Responsive sidebar navigation with:
   - Desktop: fixed 240px sidebar
   - Mobile: hamburger menu with Sheet component
   - Theme toggle (light/dark)
   - User profile section
   - Smooth page transitions with Framer Motion

4. **Dashboard** — Overview page with:
   - Greeting with Russian date formatting
   - 4 stat cards (Diary, Finance, Nutrition, Workouts)
   - Quick action buttons
   - Weekly mood BarChart
   - Monthly expense PieChart
   - Recent activity feed

5. **Diary Module** — Journal with:
   - Calendar view (monthly grid with mood indicators)
   - List view (card-based entry display)
   - Entry detail panel
   - New/Edit entry dialog (title, content, mood, tags, date)
   - Delete confirmation
   - Mood emoji system (😢😕😐🙂😄)

6. **Finance Module** — Money tracking with:
   - Summary cards (income, expenses, balance, savings rate)
   - Monthly expense/income BarChart
   - Category breakdown with progress bars
   - Transaction list grouped by date
   - Add transaction dialog with type toggle
   - Category filtering
   - Currency formatting (RUB)

7. **Nutrition Module** — Diet tracking with:
   - Macro summary cards (kcal, protein, fat, carbs) with progress bars
   - Water tracker (8 glass visual grid)
   - Meal timeline (Breakfast, Lunch, Dinner, Snack)
   - Add meal dialog with dynamic item list
   - FAB (Floating Action Button) for quick add

8. **Workout Module** — Exercise logging with:
   - Summary stats (total workouts, minutes, avg duration)
   - Month navigation
   - Expandable workout cards
   - Exercise details with sets/reps/weight
   - Add workout dialog with dynamic exercises

9. **Collections Module** — Library with:
   - Type filter tabs (Books, Movies, Recipes, Supplements, Products)
   - Status filter (Want, In Progress, Completed)
   - Responsive grid layout
   - Item cards with cover gradient, status badge, star rating
   - Detail dialog with status cycling
   - Add item dialog

10. **Feed Module** — Social feed with:
    - Post cards with entity type badges
    - Relative time formatting (Russian)
    - Like/comment counts
    - Optimistic like toggle
    - Add post dialog

11. **Settings Page** — Profile management with:
    - Profile editing (name, email, bio)
    - Notification preferences
    - Data management (export/import/reset)
    - App info

12. **Branding** — Generated app logo and custom emerald green theme

13. **Seed Data** — Comprehensive demo data:
    - 30 days of transactions
    - 14 diary entries
    - 7 days of meals and water logs
    - Multiple workouts with exercises
    - Books, movies, recipes, supplements collections
    - Social feed posts

### 📊 API Routes Summary

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/seed` | POST | Seed/reset demo data |
| `/api/diary` | GET, POST | Diary entries |
| `/api/finance` | GET, POST | Transactions |
| `/api/finance/categories` | GET, POST | Finance categories |
| `/api/finance/stats` | GET | Monthly finance stats |
| `/api/nutrition` | GET, POST | Meals |
| `/api/nutrition/water` | GET, POST | Water tracking |
| `/api/nutrition/stats` | GET | Daily nutrition stats |
| `/api/workout` | GET, POST | Workouts |
| `/api/collections` | GET, POST | Collection items |
| `/api/collections/[id]` | PUT, DELETE | Single collection item |
| `/api/feed` | GET, POST | Social feed posts |

---

## Risks & Recommendations

### Next Phase Priorities
1. **User Authentication** — Add NextAuth.js for multi-user support
2. **Data Persistence** — Migration from SQLite to PostgreSQL for production
3. **Real-time Updates** — WebSocket/SSE for live feed updates
4. **PWA Support** — Service worker and manifest for mobile install
5. **Search Module** — Global search across all entities
6. **Export/Import** — JSON/CSV data export functionality
7. **Charts Enhancement** — More detailed analytics (weekly/monthly trends)
8. **Image Upload** — Photo support for diary entries and collection items
9. **Notifications** — Push notifications for reminders
10. **Localization** — i18n support for multiple languages
