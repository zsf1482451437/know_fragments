---
name: "jd-resume-tailor"
description: "Derives a JD-targeted resume from a base resume. Invoke when user provides a job description and asks to tailor, generate, or optimize a resume."
---

# JD Resume Tailor

Use this skill to generate a JD-targeted resume from a base resume while preserving truthfulness, evidence, and interview defensibility.

## When To Invoke

Invoke this skill when the user:

- Provides a job description and asks to generate, tailor, optimize, or derive a resume.
- Mentions a base resume path and wants a new resume matching a JD.
- Wants skills, project experience, work experience, or project bullets adjusted for a specific role.
- Asks to test whether a JD can be matched by the existing resume.

Do not invoke this skill for short Boss Zhipin greeting messages. Use `boss-greeting-generator` for that.

## Default Base Resume

If the user does not provide another base resume path, use:

```text
/Users/bytedance/Desktop/项目/know_fragments/简历相关/resume_zhaisifeng.md
```

## Default Output Directory

Unless the user explicitly provides another output path, write all derived artifacts to:

```text
/Users/bytedance/Desktop/项目/know_fragments/简历相关/派生
```

## Core Principles

1. Keep the resume truthful. Do not invent companies, dates, shipped products, metrics, certifications, or technologies that are not supported by the base resume or project files.
2. Optimize emphasis, ordering, wording, and evidence. It is acceptable to reframe existing experience toward the JD, but not to fabricate experience.
3. Prefer STAR-style project bullets: background/problem, action, technology, measurable result.
4. Preserve the user's positioning: senior frontend engineer moving toward full-stack, strong in React, Shopify/e-commerce, engineering quality, performance optimization, cross-platform delivery, and AI-assisted workflow.
5. Make the resume interview-defensible. Any strengthened bullet should be explainable with concrete technical details.
6. Use Chinese by default unless the user explicitly requests English.
7. Surface JD keywords explicitly in both the skills section and project experience wherever there is real supporting evidence. Avoid only matching at a strategy level; the final resume text should visibly reflect the target JD language.

## Keyword Coverage And Evidence Rules

When the JD contains high-priority keywords, the final resume should not only mention them in the matching note. It should land them in the actual resume body with an evidence-aware strategy:

1. Strong evidence keywords: write them directly into 专业技能, 工作经历, or 项目经历.
2. Medium evidence keywords: write them as related practice, engineering understanding, or transferable experience.
3. Weak evidence keywords: use familiarity-level wording in skills, such as "熟悉", "了解", "具备实现思路", or "持续补充", and explain the boundary in the matching note.
4. Unsupported keywords: do not claim direct project ownership, production deployment, or business outcomes.

For JD keywords related to visualization, Canvas, WebGL, Three.js, data dashboard, low-code builder, visual editor, robot visualization, device monitoring, point cloud, video annotation, or 3D interaction:

- Prefer adding a self-built or personal project only when the base resume lacks a strong production project for that keyword.
- The project title should clearly mark the boundary when needed, for example "（个人项目）" or "演示平台".
- The skills section should use maturity-level wording:
  - Use "熟悉" for skills with direct implementation or credible project support.
  - Use "了解" for skills mainly supported by learning, demos, architecture notes, or exploratory work.
  - Avoid "精通" unless there is strong production evidence.
- Project bullets should describe production-grade usage scenarios as design goals, such as configuration-driven rendering, widget tree management, property panel linkage, canvas editing state, dashboard modules, model loading, interaction picking, hotspot annotation, state linkage, performance profiling, lazy loading, or rendering update control.
- Do not describe personal demos as commercial, shipped, or production-launched systems.
- Avoid awkwardly inserting visualization keywords into unrelated business projects. If insertion into existing projects feels forced, use a dedicated personal project to carry the keyword.

## Required Workflow

### 1. Intake

Collect or infer:

- JD text.
- Base resume path.
- Target output path.
- Resume name. If the user provides a custom resume name, use it as the output filename stem.

If the user does not provide a full output path, create the files under the default output directory using one of these rules:

1. If the user provides a custom resume name, use:

```text
<custom_resume_name>.md
```

and the matching note file:

```text
<custom_resume_name>_匹配说明.md
```

2. If the user does not provide a custom resume name, use this pattern:

```text
resume_zhaisifeng_<company_or_role>_定制版.md
```

If company or role is unclear, use:

```text
resume_zhaisifeng_jd_定制版.md
```

The matching note file should follow the same stem:

```text
resume_zhaisifeng_<company_or_role>_匹配说明.md
```

### 2. Parse JD

Extract the JD into these categories:

- Role type: frontend, full-stack, React, Shopify, RN, SaaS, low-code, data visualization, AI Coding, etc.
- Required technical skills.
- Preferred technical skills.
- Business domain requirements.
- Soft-skill signals: ownership, collaboration, delivery pressure, communication, independent design.
- Hidden evaluation signals, such as performance optimization, engineering quality, testing, architecture, cross-team delivery, or production troubleshooting.

Summarize the match strategy before editing:

```text
匹配策略：
- 主轴：<which experience should lead>
- 强化：<skills/projects to emphasize>
- 弱化：<less relevant content to compress>
- 风险：<gaps that should not be overstated>
```

### 3. Map Resume Evidence

Build an internal mapping from JD requirements to resume evidence:

- React/Next.js/Vite evidence.
- Shopify/e-commerce evidence.
- React Native/cross-platform evidence.
- Engineering quality evidence.
- Testing evidence.
- Performance evidence.
- Go/Node/full-stack evidence.
- AI Coding/OpenSpec/TDD workflow evidence.

If the JD requires something weakly supported, label it as "可迁移能力" instead of claiming direct experience.

Also identify which JD keywords should be landed into:

- 专业技能 section
- 工作经历 bullets
- 项目经历 bullets

The output should make high-priority JD keywords visible in these sections when support exists.

When mapping visualization or graphics-related keywords, explicitly decide whether they should be:

- added to the skills section with familiarity-level wording;
- inserted into an existing project only if naturally related;
- carried by a dedicated self-built/personal project with production-grade scenarios.

### 4. Tailor Resume

Generate a new resume with these editing rules:

- Keep basic information and education unchanged.
- Reorder or rewrite skills to put JD-critical skills first.
- Make JD high-priority keywords appear explicitly in the skills section when the base resume or project evidence supports them.
- Keep work experience truthful, but adjust bullets toward JD keywords.
- Reorder project experiences so the most relevant projects appear first.
- Rewrite project bullets to connect actions with outcomes.
- Make JD high-priority keywords appear explicitly in project bullets when there is defensible supporting evidence.
- Keep metrics already present in the base resume unless clearly supported elsewhere.
- Avoid overloading every bullet with too many technologies.
- Keep the resume concise enough for screening.

When the base resume does not contain direct wording for an important JD keyword:

- Prefer extracting support from project files, interview notes, or other existing workspace evidence.
- Prefer rewriting into adjacent, defensible expressions such as "可迁移能力", "相关实践", or "基础经验".
- If evidence is still weak, keep the keyword only in a cautious way and state the gap in the matching note.
- Do not fabricate direct project ownership, production usage, metrics, or shipped outcomes just to satisfy keyword coverage.

For self-built projects:

- It is acceptable to add or strengthen a personal project when it is consistent with the user's real learning/project materials.
- Mark the project clearly as "个人项目" when it is not a company project.
- Phrase production-grade aspects as "按接近生产环境的方式设计", "模拟生产级场景", "用于验证", or "面向生产级问题做方案验证".
- Do not imply actual business deployment, external users, revenue, company adoption, or online operation unless supported.
- Prefer concrete usage scenarios over generic technology lists.

Recommended project ordering by target:

- Shopify/e-commerce JD: `GogoalShop 跨境商城` -> `Shopify 自研应用` -> `Reolink 跨境商城` -> `AI Agent 电商系统`.
- React/Next.js frontend JD: `Reolink 跨境商城` -> `GogoalShop 跨境商城` -> `AI Agent 电商系统`.
- React Native JD: `Reolink 智能安防App` first.
- Full-stack/AI Coding JD: `AI Agent 电商系统` -> `Shopify 自研应用` -> `GogoalShop 跨境商城`.
- Engineering quality JD: emphasize testing, CI/CD, linting, pnpm, verify scripts, OpenSpec/TDD, and documentation.
- Visualization/graphics/tooling JD: relevant platform/tooling projects first, then add or emphasize a self-built visualization project if needed. Example positioning: `Shopify 自研应用` -> `AI Agent 电商系统` -> `可视化搭建与 Web3D 交互演示平台（个人项目）` -> other supporting projects.

### 5. Output Artifacts

When writing files, create:

1. The tailored resume Markdown file.
2. A brief matching note file only if useful or requested:

```text
/Users/bytedance/Desktop/项目/know_fragments/简历相关/派生/<resume_name_or_default_stem>_匹配说明.md
```

Default expectation:

- Tailored resumes go into `/Users/bytedance/Desktop/项目/know_fragments/简历相关/派生`
- Matching notes go into `/Users/bytedance/Desktop/项目/know_fragments/简历相关/派生`
- If the user specifies a custom resume name, use that name directly for the resume file stem
- If the user specifies a full output path, obey the user's path

The matching note should include:

- JD keywords.
- Which keywords were explicitly reflected into 技能 / 工作经历 / 项目经历.
- Resume changes.
- Interview talking points.
- Risk boundaries: what not to overclaim.
- For weak or self-built visualization/graphics evidence, clarify the maturity level and interview-safe wording.

### 6. Final Response

Report:

- New resume path.
- Main positioning used.
- Key sections changed.
- Any risks or weak matches.
- Suggested next action, such as testing with a JD, exporting PDF, or creating an interview script.

Keep the final response concise.

## Writing Style

Use strong but grounded wording:

- Prefer: "负责", "主导", "参与", "落地", "优化", "沉淀", "支撑".
- Prefer quantified outcomes when already supported.
- Avoid empty phrases like "精通", "深度掌握", "极大提升" unless backed by evidence.
- Avoid claiming production Go experience if the evidence is a personal project. Phrase as "Go 基础服务开发经验" or "通过个人项目跑通 Go 后端链路".
- For visualization or graphics skills, prefer layered wording such as "熟悉 ECharts/Canvas", "了解 Three.js/WebGL/React Three Fiber", "具备配置驱动渲染和编辑态交互实现思路".
- For personal visualization projects, prefer concrete scenario phrases such as "设备状态看板", "订单趋势图表", "告警信息展示", "画布组件拖拽", "属性面板联动", "模型加载", "热点标注", "交互拾取", "渲染性能验证".

## Safety Boundaries

Never:

- Fabricate employment history.
- Change education dates or company dates.
- Invent user management responsibilities.
- Invent revenue, conversion, or performance metrics.
- Turn personal projects into company projects.
- Claim direct production experience for technologies only used in personal demos.
- Present self-built visualization or Web3D demos as commercial production systems.
- Claim "精通 Three.js/WebGL/点云/视频标注" unless direct evidence exists.

If the JD has a hard requirement not supported by the resume, be explicit:

```text
该要求当前简历证据较弱，建议用可迁移能力表达，不建议写成直接项目经验。
```

If the user asks to "合理虚构" unsupported content, do not do that. Instead:

```text
可以增强关键词表达和匹配度，但不能虚构未做过的项目、职责、指标或技术落地；对于弱证据项，应使用可迁移能力或相关实践表达。
```

## Example Invocation

User:

```text
基于这个 JD 和 /Users/bytedance/Desktop/项目/know_fragments/简历相关/resume_zhaisifeng.md 派生一份新简历
<JD text>
```

Expected behavior:

1. Read the base resume.
2. Parse the JD.
3. Generate a tailored resume file.
4. Report the output path and match strategy.
