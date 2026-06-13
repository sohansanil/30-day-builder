As your AI junior developer, I will synthesize the provided PRD, architecture, and research into a clear, actionable plan.

---

## Master Build Prompt: Gamified Habit Tracker

## PROJECT CONTEXT
The habit tracking market is rapidly growing, driven by a strong demand for gamification features, which improve user retention (30%) and consistency (57%). Our target users (Millennials and Gen Z) prioritize engaging, mobile-based tools that offer clear feedback and progression. Crucially, there's a significant appeal for privacy-focused, local-first applications that store data directly on the device, avoiding cloud sync or personal accounts. Our app will leverage the "loss aversion" principle by deducting Health Points (HP) for missed habits, a proven gamification mechanic.

## PROJECT GOAL
Develop a gamified habit tracker that fosters long-term habit adherence through a unique "Health Point (HP) loss" mechanic. The application will be entirely client-side, storing all user data locally in browser `localStorage` to ensure privacy and eliminate the need for a backend or user accounts. Success will be measured by Daily Active Users (DAU), Habit Completion Rate, and 7/30-day retention.

## TECH STACK
*   **Frontend Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Data Persistence:** Browser `localStorage`

## ARCHITECTURE
This is a strictly **client-side, local-first** application with no backend or cloud dependencies.
*   **User Interface (Next.js/React):** Handles all visual rendering, user interactions, and provides immediate feedback.
*   **Habit Management Module:** Manages the lifecycle of habits (creation, completion, status updates, streak tracking).
*   **Gamification & Logic Engine:** Orchestrates the core HP deduction mechanic, end-of-day (EOD) processing, and overall game state.
*   **Local Data Storage Layer:** A wrapper around `localStorage` for structured persistence and retrieval of application data.

**Data Model (Stored in `localStorage` as JSON):**
*   **User (Implicit Global State):** `currentHP` (Number), `lastEODProcessedDate` (ISO Date String)
*   **Habit:** `id` (String), `name` (String), `description` (String), `frequency` (String, e.g., "daily"), `currentStreak` (Number), `createdAt` (ISO Date String), `lastCompletedDate` (ISO Date String)
*   **DailyCompletion:** `id` (String), `habitId` (String), `date` (ISO Date String, "YYYY-MM-DD"), `isCompleted` (Boolean), `hpDeductionApplied` (Boolean)

**Key Internal Actions (Simulated "API" for internal logic):**
*   `POST /api/habits`: Create a new habit.
*   `PATCH /api/habits/{id}/complete`: Mark a habit complete for today.
*   `GET /api/habits/daily`: Retrieve today's habits and status.
*   `GET /api/user/hp`: Get current HP.
*   `POST /api/system/eod-process`: Trigger EOD logic (HP deduction, executed once per day).

## FILE STRUCTURE
```
.
├── public/                 # Static assets (icons, manifest.json for PWA)
├── src/
│   ├── app/                # Next.js App Router root
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main dashboard/daily view
│   │   ├── habits/
│   │   │   ├── new/page.tsx # Create new habit form
│   │   │   └── [id]/page.tsx # View/edit specific habit
│   ├── components/         # Reusable UI components
│   │   ├── HabitCard.tsx
│   │   ├── HPDisplay.tsx
│   │   ├── OnboardingModal.tsx
│   │   └── ...
│   ├── lib/                # Business logic, utilities, data access
│   │   ├── storage.ts      # localStorage wrapper for CRUD operations
│   │   ├── gamification.ts # HP deduction and streak calculation logic
│   │   ├── dateUtils.ts    # Date formatting and comparison utilities
│   │   └── types.ts        # TypeScript type definitions for entities
│   ├── store/              # Zustand global state management
│   │   ├── habitStore.ts   # Manages habit data
│   │   └── userStore.ts    # Manages user HP and global settings
│   └── styles/             # Global styles and Tailwind config
│       └── globals.css
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## IMPLEMENTATION ORDER
1.  **Project Setup:** Initialize Next.js with TypeScript and Tailwind. Install Zustand. Update `globals.css`.
2.  **Type Definitions & Utilities (`src/lib/`):**
    *   Define `User`, `Habit`, `DailyCompletion` interfaces in `types.ts`.
    *   Implement a robust `localStorage` wrapper in `storage.ts` (getItem, setItem with JSON handling, default values).
    *   Create `dateUtils.ts` for current date (ISO), date comparison, and `isToday` functionality.
3.  **Global State Management (`src/store/`):**
    *   Develop `userStore.ts` for `currentHP` and `lastEODProcessedDate`, initializing from `localStorage`.
    *   Develop `habitStore.ts` for managing the list of habits, also initialized from `localStorage`.
4.  **Core UI & P0 Features (`src/components/`, `src/app/`):**
    *   Create `HPDisplay.tsx` to show `currentHP`.
    *   Build `HabitCard.tsx` to display a single habit's name, status, and streak.
    *   Implement `app/habits/new/page.tsx` for creating new habits.
    *   Develop `app/page.tsx` (main dashboard) to fetch/display today's habits and integrate `HPDisplay` and `HabitCard`s.
5.  **Gamification Logic (`src/lib/gamification.ts` & integration):**
    *   Implement `deductHpForMissedHabits(date)` function. This identifies all uncompleted habits for `date`, deducts HP via `userStore`, and updates `DailyCompletion` records.
    *   Integrate the EOD processing: In `src/app/layout.tsx` (or `page.tsx`), call EOD logic on initial load, ensuring it only runs once per day after midnight by checking `lastEODProcessedDate`.
6.  **Streak Tracking:** Enhance `habitStore.ts` and `HabitCard.tsx` to accurately calculate and display streaks.
7.  **Simple Onboarding (`src/components/OnboardingModal.tsx`):** Create a modal to explain the HP system, displayed only once (tracked in `localStorage`).
8.  **PWA Integration:** Add `manifest.json` and icons, configure `next.config.mjs` for PWA.
9.  **Refinement:** Implement error handling, enhance responsive design, apply visual polish using Tailwind CSS.

## CODING RULES
*   **TypeScript Strictness:** All code must be strongly typed using TypeScript.
*   **Functional Components & Hooks:** Utilize React functional components and hooks for state and side effects.
*   **Modularity:** Break down logic into small, focused, and reusable components and utility functions.
*   **Readability:** Write clean, concise, self-documenting code with meaningful variable names. Comments should explain *why*, not *what*.
*   **Error Handling:** Implement robust error handling for all `localStorage` operations and potential edge cases.
*   **Responsive Design:** Ensure the application is fully responsive and visually appealing across common mobile and desktop screen sizes using Tailwind CSS.
*   **Privacy-First:** Strictly adhere to the "no backend, no cloud sync, no accounts" principle. All user data must remain exclusively in `localStorage`.
*   **Performance:** Optimize `localStorage` interactions and component rendering to ensure a smooth, "zero-lag" user experience.

## FIRST TASK
Step 1: Initialize a new Next.js project using TypeScript and Tailwind CSS.
```bash
npx create-next-app@latest gamified-habit-tracker --ts --tailwind --eslint
```
Step 2: Install Zustand.
```bash
npm install zustand
```
Step 3: Update `src/app/globals.css` to include Tailwind's base, components, and utilities layers.
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Step 4: Create the following initial files and directories as placeholders. They should be empty or contain basic boilerplate for their respective types (e.g., `export type User = {};` for `types.ts`).
- `src/lib/types.ts`
- `src/lib/storage.ts`
- `src/lib/dateUtils.ts`
- `src/lib/gamification.ts`
- `src/store/userStore.ts`
- `src/store/habitStore.ts`
- `src/components/HPDisplay.tsx`
- `src/components/HabitCard.tsx`
- `src/components/OnboardingModal.tsx`
Step 5: Do not proceed with any further implementation until these initial setup steps are fully complete and verified. Confirm the Next.js development server runs without errors.