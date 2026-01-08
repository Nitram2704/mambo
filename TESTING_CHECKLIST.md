# Testing Checklist - Phase 2 & 3

Use this checklist to verify the implementation and quality of features in Phases 2 and 3.

## Phase 2: Monetization & Growth

### 1. Revenue Engine (RevenueCat)
- [ ] **Paywall Display**: Does the paywall appear when trying to access Pro features (e.g., Body Scan, AI Coach)?
- [ ] **Tier Selection**: Can you select different tiers (Starter, Pro, Elite)?
- [ ] **Purchase Flow**: Does the purchase flow trigger correctly (use Sandbox/Test mode)?
- [ ] **Entitlements**: After "purchase", are Pro features unlocked immediately?
- [ ] **Restore Purchases**: Does the "Restore" button work?

### 2. High-Value Features
- [ ] **Body Scan**:
    - [ ] Can you upload/take a photo?
    - [ ] Does the AI analysis return results (V-Taper, Symmetry, etc.)?
    - [ ] Are results saved in history?
- [ ] **Barcode Scanner**:
    - [ ] Does the camera open correctly?
    - [ ] Does it recognize common barcodes?
    - [ ] Does it fetch nutritional data from the database?

### 3. Growth
- [ ] **Smart Notifications**:
    - [ ] Do you receive reminders for water/workouts?
    - [ ] Are notifications localized?
- [ ] **Referral Program** (New):
    - [ ] Is your referral code visible in the profile?
    - [ ] Can you share the code/link?
    - [ ] Does applying a code during signup/settings work?

---

## Phase 3: Advanced Intelligence & Ecosystem

### 1. Advanced AI
- [ ] **Form Check**:
    - [ ] Can you record a video of an exercise?
    - [ ] Does Gemini 2.0 Flash Vision provide accurate feedback?
    - [ ] Is the feedback displayed clearly with a score?
- [ ] **The Academy**:
    - [ ] Can you browse mini-courses?
    - [ ] Do quizzes work and award XP?
- [ ] **Smart Alarm**:
    - [ ] Can you set a wake-up window?
    - [ ] Does the "Sunrise" effect work in Sleep Mode?
    - [ ] Does the alarm trigger based on movement/noise?

### 2. Ecosystem
- [ ] **Sleep Sync**:
    - [ ] Does the app pull data from HealthKit (iOS) or Google Fit (Android)?
    - [ ] Is sleep debt calculated correctly?
- [ ] **Wearables & Widgets** (Config):
    - [ ] Verify `app.json` contains the necessary native plugins.
    - [ ] Check the `WIDGETS_GUIDE.md` for manual native steps.

---

## General Quality (UX/UI)
- [ ] **Light/Dark Mode**: Do all screens look premium in both modes?
- [ ] **Haptics**: Do you feel haptic feedback on button presses and successes?
- [ ] **Localization**: Is all text correctly translated in Spanish and English?
- [ ] **Accessibility**: Can you navigate the main flows using Screen Readers?
