# Implementation Plan - Mambo Social Suite

> [!IMPORTANT]
> This plan unifies "The Pulse" (Feed), "The Wolfpack" (Squads), and "The Arena" (Rankings) into a single, cohesive social experience, following the "Mambo Elite" design system.

## 🎯 Goal
Transform `app/social` into a high-retention ecosystem where users can share progress, join squads, and compete.

## 🏗️ Architecture Overview

### 1. The Pulse (Main Feed)
*   **Concept**: The landing page of the Social tab. An Instagram-style vertical scroll.
*   **Content Strategy (Hybrid)**:
    *   **Auto-Generated**: When a user finishes a workout, a "Workout Summary" post is generated (Stats, PRs broken, Intensity).
    *   **Manual**: Users can post photos (flexing, meals, gear) with captions.
*   **Interactions**: Like (Fire icon), Comment, Share.

### 2. The Wolfpack (Squads)
*   **Concept**: User-created micro-communities.
*   **Structure**:
    *   **Public Squads**: Open to anyone (e.g., "CrossFit Spain").
    *   **Private Squads**: Invite-only (e.g., "Oficina 303").
*   **Features**: Squad Chat, Squad Leaderboard, Weekly Challenges.

### 3. The Arena (Rankings)
*   **Concept**: Gamified competition to drive consistency.
*   **Metrics**: XP based on Workout Volume, Consistency (Streak), and Intensity.
*   **Scope**: Global, Squad-vs-Squad, and Friends.

---

## 📅 Phased Implementation

### Phase 1: The Pulse (Feed Foundation)
**Goal**: Create the main social landing page and content generation engine.
- [ ] **Database Schema**:
    -   `posts`: `user_id`, `type` (workout/manual), `content`, `media_url`, `workout_data` (JSON).
    -   `likes`, `comments`.
- [ ] **Social Landing UI**:
    -   Refactor `app/social/index.tsx` to be the Feed.
    -   Implement `PostCard` component (Glassmorphic design).
- [ ] **Content Engine**:
    -   Create `WorkoutPostGenerator`: Takes workout data -> Returns formatted post.
    -   Add "Share to Feed" modal at end of `ActiveWorkout`.

### Phase 2: The Wolfpack (Squad System)
**Goal**: Enable community creation and management.
- [ ] **Database Schema**:
    -   `squads`: `name`, `description`, `banner_url`, `privacy` (public/private), `owner_id`.
    -   `squad_members`: `squad_id`, `user_id`, `role` (admin/member).
- [ ] **Squad UI**:
    -   `app/social/squads/create.tsx`: Form for Name, Privacy, Banner.
    -   `app/social/squads/[id].tsx`: Squad details, member list, join button.
    -   `app/social/squads/browser.tsx`: Search and filter squads.

### Phase 3: The Arena (Competition)
**Goal**: Add the competitive layer.
- [ ] **Scoring Logic**:
    -   Implement `calculateWorkoutXP(workout)` utility.
    -   Add `xp` column to `profiles` and `squads`.
- [ ] **Leaderboard UI**:
    -   `app/social/arena/index.tsx`: Tabs for Global / Squad / Friends.
    -   Visual Rank Badges (Bronze, Silver, Gold, Elite, Mambo Legend).

### Phase 4: Integration & Polish
**Goal**: Seamless UX and "Mambo Elite" aesthetics.
- [ ] **Navigation**: Add floating action button (FAB) to Social tab for "New Post" / "Create Squad".
- [ ] **Notifications**: "X liked your post", "You have been invited to Squad Y".
- [ ] **Empty States**: "Follow people to see their workouts here" onboarding.

---

## 🛠️ Tech Stack & Dependencies
-   **Frontend**: React Native, Expo Router, Reanimated (for feed interactions).
-   **Backend**: Supabase (Postgres) for relational data.
-   **Storage**: Supabase Storage for post images and squad banners.
-   **Design**: "Mambo Elite" tokens (Volt/Zinc/Glass).

## ⚠️ Risks & Mitigations
-   **Empty Feed**: *Mitigation*: Show "Global Trending" posts if user has no friends yet.
-   **Spam**: *Mitigation*: Rate limit manual posts; Auto-posts require completed workouts.
