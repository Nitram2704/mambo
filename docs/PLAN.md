# PLAN: Orchestrated Integration of `1-autoqa`

## Goal
Integrate the `1-autoqa` branch changes, finalize the ESM transition (Option A), and securely configure the OpenRouter AI service.

---

## 👥 Roles & Responsibilities

### 1. `devops-engineer` (Infrastructure & Git)
- **Task**: Finalize the configuration migration.
- **Actions**: 
  - Verify existing `.cjs` files (`babel`, `metro`, `jest`, `eslint`, `tailwind`).
  - Delete legacy `.js` config files.
  - Stage and commit the transition.
  - Run `npm install` to ensure ESM/QA dependencies are locked.

### 2. `backend-specialist` (API & Connectivity)
- **Task**: Secure API integration.
- **Actions**:
  - Add `OPENROUTER_API_KEY` to `.env`.
  - Verify `aiService.ts` correctly reads from environment variables.
  - Perform a connectivity smoke test for OpenRouter.

### 3. `test-engineer` (Quality Assurance)
- **Task**: Stability verification.
- **Actions**:
  - Run `npm test` (Jest) to ensure the `.cjs` config works.
  - Run `npx expo lint` for code quality.
  - Run Mambo-QA runner (`npm run test:ai`) to verify the new branch features.

---

## 🛠️ Proposed Workflow

### Phase 1: Planning (Current)
- [x] Select Approach A.
- [x] Document this Plan.
- [ ] User Approval.

### Phase 2: Implementation (Parallel)
- **Step 1**: DevOps & Backend work in parallel to stabilize environment.
- **Step 2**: Test-engineer validates the resulting build.

---

## ✅ Verification Criteria
1. `npm test` passing with zero ESM resolution errors.
2. `expo start` (Metro) loading successfully.
3. OpenRouter API responding to test requests.
4. Orchestration Report generated with all agent contributions.

---

**Onaylıyor musunuz? (Y/N)**
- Y: Implementation başlatılır
- N: Planı düzeltirim
