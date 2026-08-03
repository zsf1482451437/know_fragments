# Info Hub GitHub Trending Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript information-fetching service that collects GitHub Trending, stores daily snapshots, and generates daily and weekly digests.

**Architecture:** Use adapter-style source collectors, focused digest generators, and a storage boundary so additional platforms can be added without changing the scheduler or notifier layers. The MVP runs locally with CLI jobs and keeps notifier implementations pluggable.

**Tech Stack:** Node.js 22, TypeScript, Vitest, Cheerio, Node built-in SQLite, dotenv.

---

### File Structure

- Create: `package.json` for npm scripts and dependencies.
- Create: `tsconfig.json` for strict TypeScript compilation.
- Create: `vitest.config.ts` for unit test configuration.
- Create: `.env.example` for scheduling and notifier configuration.
- Create: `src/core/types.ts` for shared source, digest, storage, and notifier contracts.
- Create: `src/sources/github/githubTrendingParser.ts` for parsing GitHub Trending HTML.
- Create: `src/sources/github/githubTrendingCollector.ts` for fetching Trending pages.
- Create: `src/storage/sqliteStore.ts` for snapshot persistence.
- Create: `src/digest/githubDigest.ts` for daily and weekly Markdown summaries.
- Create: `src/notifiers/consoleNotifier.ts` for first-stage delivery.
- Create: `src/jobs/dailyGithubTrending.ts` for daily collection and digest generation.
- Create: `src/jobs/weeklyGithubSummary.ts` for weekly aggregation.
- Create: `src/main.ts` for CLI entry routing.
- Test: `tests/githubTrendingParser.test.ts` for parser behavior.
- Test: `tests/githubDigest.test.ts` for daily and weekly digest behavior.

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize npm metadata**

Run: `npm init -y`

Expected: `package.json` exists.

- [ ] **Step 2: Install dependencies**

Run: `npm install cheerio dotenv`

Expected: dependencies are added.

- [ ] **Step 3: Install dev dependencies**

Run: `npm install -D typescript tsx vitest @types/node`

Expected: dev dependencies are added.

- [ ] **Step 4: Add TypeScript and test configuration**

Create strict TypeScript config and Vitest config with `src/**/*.ts` and `tests/**/*.ts`.

### Task 2: GitHub Trending Parser

**Files:**
- Create: `tests/githubTrendingParser.test.ts`
- Create: `src/core/types.ts`
- Create: `src/sources/github/githubTrendingParser.ts`

- [ ] **Step 1: Write failing parser tests**

Test a realistic Trending repository card and assert owner, name, url, description, language, stars, forks, starsToday, and collectedAt.

- [ ] **Step 2: Run parser test and verify RED**

Run: `npm test -- tests/githubTrendingParser.test.ts`

Expected: FAIL because parser module does not exist.

- [ ] **Step 3: Implement minimal parser**

Use Cheerio to parse `article.Box-row`, normalize numeric strings like `1,234`, and return typed `GitHubTrendingRepo` records.

- [ ] **Step 4: Run parser test and verify GREEN**

Run: `npm test -- tests/githubTrendingParser.test.ts`

Expected: PASS.

### Task 3: Digest Generation

**Files:**
- Create: `tests/githubDigest.test.ts`
- Create: `src/digest/githubDigest.ts`

- [ ] **Step 1: Write failing digest tests**

Test daily Top N Markdown and weekly repeated-project aggregation.

- [ ] **Step 2: Run digest test and verify RED**

Run: `npm test -- tests/githubDigest.test.ts`

Expected: FAIL because digest module does not exist.

- [ ] **Step 3: Implement minimal digest functions**

Export `generateDailyGithubDigest` and `generateWeeklyGithubDigest`.

- [ ] **Step 4: Run digest test and verify GREEN**

Run: `npm test -- tests/githubDigest.test.ts`

Expected: PASS.

### Task 4: Jobs And Storage Skeleton

**Files:**
- Create: `src/sources/github/githubTrendingCollector.ts`
- Create: `src/storage/sqliteStore.ts`
- Create: `src/notifiers/consoleNotifier.ts`
- Create: `src/jobs/dailyGithubTrending.ts`
- Create: `src/jobs/weeklyGithubSummary.ts`
- Create: `src/main.ts`

- [ ] **Step 1: Implement collector**

Fetch `https://github.com/trending` with optional `language` and `since` query parameters, then parse HTML.

- [ ] **Step 2: Implement storage boundary**

Use Node built-in SQLite to create `trending_snapshots` and save/query GitHub repo snapshots by collection date.

- [ ] **Step 3: Implement console notifier**

Print digest Markdown to stdout for the first delivery channel.

- [ ] **Step 4: Implement CLI jobs**

Support `daily:github` and `weekly:github` commands.

### Task 5: Verification

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 3: Run CLI help**

Run: `npm run dev -- --help`

Expected: supported commands are printed.
