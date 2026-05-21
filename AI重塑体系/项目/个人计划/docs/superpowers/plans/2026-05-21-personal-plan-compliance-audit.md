# Personal Plan Compliance Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify that the rebuilt personal plan project complies with the requested stack, persistence model, test requirements, and SuperPower governance evidence expectations.

**Architecture:** Audit the project in three passes: requirements mapping, fresh command verification, and evidence-based conclusion writing. Avoid changing business code unless verification exposes a concrete defect in the audit path itself.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, Vite, Vitest, local JSON persistence via Vite middleware

---

### Task 1: Requirements Mapping

**Files:**
- Modify: `README.md`
- Inspect: `package.json`
- Inspect: `vite.config.ts`
- Inspect: `src/App.tsx`
- Inspect: `data/plan.json`

- [ ] **Step 1: Re-read the user requirements and map them to concrete project artifacts**

Requirement checklist:

```text
1. React
2. TypeScript
3. Tailwind CSS
4. JSON persistence
5. Unit tests
6. SuperPower-governed execution evidence
```

- [ ] **Step 2: Verify framework and tooling declarations**

Run:

```bash
cat package.json
```

Expected:

```text
Contains react, react-dom, typescript, tailwindcss, vite, vitest
```

- [ ] **Step 3: Verify JSON persistence path and write mechanism**

Inspect:

```text
vite.config.ts defines /api/plan middleware
data/plan.json exists as persistence source
src/App.tsx triggers persistPlan(plan)
```

- [ ] **Step 4: Verify the UI exposes planning features that match the documented system**

Inspect these UI sections in `src/App.tsx`:

```text
今日计划
近期计划
明日候选
子任务池
保存到 JSON
```

- [ ] **Step 5: Record mapping result**

Output table:

```text
Requirement -> Evidence File -> Status
```

### Task 2: Fresh Verification Commands

**Files:**
- Test: `src/lib/plan-utils.test.ts`
- Test: `src/services/plan-api.test.ts`
- Test: `src/App.test.tsx`
- Inspect: `dist/`

- [ ] **Step 1: Run unit tests fresh**

Run:

```bash
npm test
```

Expected:

```text
All test files pass with 0 failures
```

- [ ] **Step 2: Run production build fresh**

Run:

```bash
npm run build
```

Expected:

```text
TypeScript compile succeeds
Vite build exits with code 0
dist/ output is generated
```

- [ ] **Step 3: Run diagnostics check on touched files**

Check:

```text
src/App.tsx
vite.config.ts
```

Expected:

```text
No new diagnostics introduced by audit-driven changes
```

### Task 3: Governance and Completion Audit

**Files:**
- Create: `docs/superpowers/plans/2026-05-21-personal-plan-compliance-audit.md`
- Inspect: `.trae/rules/constitution.md`
- Inspect: `.trae/skills/superPower/SKILL.md`

- [ ] **Step 1: Verify this request entered through SuperPower**

Evidence:

```text
Current conversation contains a fresh superPower invocation before analysis
```

- [ ] **Step 2: Verify the strict chain was at least materially followed**

Checklist:

```text
superPower -> entered
using-superpowers -> used for skill applicability rule
writing-plans -> plan document saved under docs/superpowers/plans
verification-before-completion -> fresh test/build evidence collected before claims
```

- [ ] **Step 3: Write the final audit report**

Include:

```text
1. Compliance summary
2. Verified evidence
3. Residual gaps
4. Exact commands run
```

- [ ] **Step 4: Do not claim completion without evidence**

Before final response, verify that these commands were run in the current audit pass:

```bash
npm test
npm run build
```
