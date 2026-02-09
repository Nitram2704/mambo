# PLAN: Mambo Evolution - AI, Social & Biometrics

This plan outlines the implementation of three major feature sets to evolve Mambo into a premium, AI-driven fitness ecosystem.

## 🎯 Objectives
1.  **AI Coach Pro**: Proactive, toggleable AI coaching using Google Gemini.
2.  **Social Gamification**: Real-time squad chat and group milestones using Supabase.
3.  **Advanced Biometrics**: Deep integration with Google Fit for holistic health tracking.
4.  **UI Standardization**: Standardize all titles and typography for a premium feel.

---

## 🛠️ Phase 1: Foundation & UI Standardization
**Agent: `frontend-specialist`**
- [ ] **Title Standardization**:
    - Update `locales/es.json` with standardized title keys.
    - Refactor all screens to use `variant="h1"`, `weight="black"`, and translation keys.
- [ ] **Settings Toggle**:
    - Add "AI Coach Pro" toggle in `app/profile/settings.tsx`.
    - Persist setting in `userProfileStore`.

---

## 🤖 Phase 2: AI Coach Pro (Option A)
**Agents: `backend-specialist`, `mobile-developer`**
- [ ] **Gemini Integration**:
    - Implement `GeminiService` for proactive workout cues.
    - Create a "Voice Coach" utility using `expo-speech` (triggered by Gemini analysis).
- [ ] **Workout Integration**:
    - Add AI coaching overlay in `app/workout/active.tsx` (only if enabled).
    - Implement real-time rep/set analysis cues.

---

## 🐺 Phase 3: Social Gamification (Option B)
**Agents: `database-architect`, `backend-specialist`**
- [ ] **Squad Chat Schema**:
    - Create `squad_messages` table in Supabase.
    - Enable Realtime for the new table.
- [ ] **Chat UI**:
    - Implement `app/social/squads/chat.tsx`.
    - Integrate with `socialStore` for real-time message updates.
- [ ] **Group Milestones**:
    - Implement logic for squad-wide XP goals.

---

## 📊 Phase 4: Advanced Biometrics (Option C)
**Agent: `mobile-developer`**
- [ ] **Google Fit Deep Dive**:
    - Expand `react-native-health` / `expo-health-connect` integration.
    - Map Google Fit data (heart rate, steps, active calories) to Mambo analytics.
- [ ] **Biometric Dashboard**:
    - Update `app/analytics/index.tsx` with new biometric charts.

---

## ✅ Verification Phase
**Agent: `test-engineer`**
- [ ] Run `security_scan.py` on new Supabase policies.
- [ ] Run `lint_runner.py` on all new screens.
- [ ] Manual verification of AI toggle and Realtime chat.

---

## 🎼 Orchestration Assignments
- **Orchestrator**: Antigravity
- **Planning**: `project-planner`
- **Frontend/Mobile**: `mobile-developer`, `frontend-specialist`
- **Backend/DB**: `backend-specialist`, `database-architect`
- **Verification**: `test-engineer`
