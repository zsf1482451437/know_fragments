---
name: "boss-greeting-generator"
description: "Generates concise Boss Zhipin greeting messages from a JD and resume. Invoke when user provides a job description and asks for short outreach/opening lines."
---

# Boss Greeting Generator

## Purpose

Generate short, natural, targeted Boss 直聘打招呼话术 from:

- a job description / JD
- the candidate's resume or relevant experience

The goal is to help the candidate quickly start a conversation with a recruiter or hiring manager while showing clear role fit.

## When To Invoke

Invoke this skill when the user:

- provides a JD and asks to generate Boss 直聘打招呼话术
- asks for "打招呼", "开场白", "投递话术", "Boss 直聘消息", "和 HR 怎么说"
- wants a short message based on their resume and a target role
- asks to generate multiple variants for different roles or companies

Do not invoke for long cover letters, full resume rewriting, or interview answers unless the user explicitly connects them to Boss 直聘 outreach.

## Input Needed

Prefer these inputs:

1. Target JD or role description
2. Candidate resume or summarized experience
3. Optional target style:
   - 稳重专业
   - 业务结果导向
   - 技术匹配导向
   - 简短直接
   - 稍微热情

If the JD or resume is missing, ask for it. If the user provides only one side, generate a generic version but clearly mention the assumption.

## Core Workflow

1. Extract JD Signals
   - role title
   - required stack
   - business domain
   - seniority expectation
   - key responsibilities
   - hidden priorities such as performance, componentization, cross-platform, testing, e-commerce, SEO, engineering efficiency

2. Extract Resume Signals
   - strongest matching projects
   - matching technologies
   - measurable outcomes
   - domain similarity
   - proof points that can be said in one sentence

3. Build Match Angle
   Choose 1-2 strongest angles only, and prefer concrete proof over generic adjectives:
   - 技术栈匹配
   - 行业/业务匹配
   - 项目经验匹配
   - 性能/工程化能力匹配
   - 跨端能力匹配
   - 商城/电商经验匹配
   - 测试/质量保障匹配

4. Generate Boss Message
   - concise and readable
   - lead with the candidate's strongest matching technology or project
   - mention no more than 2 matching points
   - no long paragraphs
   - no exaggerated claims
   - no fake company-specific facts
   - include 1 concrete proof point when it fits naturally
   - end with a light conversation hook

## Output Requirements

Default output should include only:

1. 推荐版本: 1 best message

Only include 备选版本 or 匹配点 when the user explicitly asks for multiple versions, comparison, or explanation.

If the user asks for "只要一句", output only 1 sentence.

## Message Length

Boss 直聘打招呼 should usually be:

- 50-80 Chinese characters by default
- no more than 110 Chinese characters unless the user asks for detail
- use one sentence or two short clauses; avoid long introductions

Avoid writing like a cover letter.

## Tone Rules

Use a direct, professional Chinese tone.

Good tone:

```text
您好，我有 3 年前端经验，主要做过 React/Next.js 跨境商城和 React Native 移动端项目，和岗位里的商城性能优化、组件化、多端适配比较匹配，方便的话想进一步了解下这个岗位。
```

Avoid:

```text
尊敬的领导您好，本人怀着无比诚挚的心情投递贵司岗位，希望能为贵司发展贡献绵薄之力。
```

Avoid:

```text
我精通所有前端技术，能独立负责公司所有前端架构，期待加入。
```

## Recommended Templates

### Web Frontend / React / Next.js

```text
您好，我有 3 年前端经验，主要做 React/Next.js 跨境商城，做过性能优化和组件化建设，和岗位方向比较匹配，想了解下。
```

### Cross-Platform / React Native

```text
您好，我有 React Native 项目经验，做过设备接入、实时预览和录像回放，和岗位的跨端开发方向比较匹配，想进一步沟通。
```

### E-commerce / Shopify

```text
您好，我做过 React 跨境商城和 Shopify 应用，熟悉 GraphQL、Docker 部署和性能优化，和岗位方向比较匹配，想了解下。
```

### Engineering Efficiency / AI Workflow

```text
您好，我有 React/Next.js 和 AI 辅助研发实践，做过工程化治理、测试补充和流程沉淀，想了解下岗位是否匹配。
```

## Personalization Rules

When tailoring to a JD:

- If JD emphasizes React/Next.js: lead with React/Next.js and Web performance.
- If JD emphasizes mobile/cross-platform: lead with React Native and iOS/Android delivery.
- If JD emphasizes e-commerce: lead with cross-border commerce, product pages, SEO, conversion pages.
- If JD emphasizes engineering efficiency: lead with componentization, testing, CI/CD, workflow.
- If JD emphasizes Shopify: lead with Shopify app, GraphQL, Docker, app listing.

## Safety And Credibility

Never invent:

- years of experience
- company names not in the resume/JD
- performance numbers not provided
- leadership scope not supported by the resume
- "精通", "架构负责人", "全链路负责人" unless clearly supported

Prefer:

- "参与"
- "负责模块"
- "做过"
- "有实践"
- "比较匹配"

Use "主导" only if resume clearly supports it.

## Output Example

Given:

- JD: React 前端，跨境电商，性能优化，SEO
- Resume: React/Next.js, Reolink Web 跨境商城, GogoalShop 性能优化

Output:

```markdown
## 推荐版本

您好，我有 3 年前端经验，做过 React/Next.js 跨境商城和性能优化，和岗位方向比较匹配，想进一步了解下。
```
