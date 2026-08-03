# Markdown Reader Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个本地 Web App，默认读取 `/Users/bytedance/Desktop/项目/know_fragments`，实现 Markdown 文件树浏览、文件打开、内容编辑和保存回本地磁盘。

**Architecture:** 使用 Vite + React + TypeScript 构建前端单页应用，Koa + Node `fs/promises` 提供本地文件 API。后端只监听 `127.0.0.1`，所有文件路径都通过 `pathGuard` 限制在工作区根目录内。

**Tech Stack:** Vite, React, TypeScript, TailwindCSS, Node.js, Koa, Vitest, Testing Library, pnpm。

---

## 0. 实施原则

- 所有实现都放在新项目 `/Users/bytedance/Desktop/项目/markdown-reader-editor` 中，不修改 `know_fragments` 的正文文档内容。
- 首版只做浏览、打开、编辑、保存，不实现搜索、新建、删除、重命名、Markdown 预览。
- 后端路径安全优先于 UI 完整度，`pathGuard` 必须先有测试再实现。
- 每个任务完成后运行对应测试，阶段完成后提交一次 Git commit。
- 如果执行时发现已有未提交改动，先用 `git status --short` 确认，不覆盖用户已有文件。

## 1. 目标文件结构

```text
/Users/bytedance/Desktop/项目/markdown-reader-editor/
  server/
    config.ts
    fileStore.test.ts
    fileStore.ts
    fileTree.test.ts
    fileTree.ts
    index.ts
    pathGuard.test.ts
    pathGuard.ts
    types.ts
  src/
    components/
      EditorHeader.tsx
      EmptyState.tsx
      FileTree.tsx
      MarkdownEditor.tsx
    services/
      api.test.ts
      api.ts
    test/
      setup.ts
    types/
      files.ts
    App.test.tsx
    App.tsx
    index.css
    main.tsx
    vite-env.d.ts
  .env.example
  .gitignore
  README.md
  eslint.config.js
  index.html
  package.json
  postcss.config.cjs
  tailwind.config.cjs
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  tsconfig.server.json
  vite.config.ts
  vitest.config.ts
```

## 2. 模块职责

| 文件 | 职责 |
| --- | --- |
| `server/config.ts` | 读取端口、监听地址、Markdown 工作区根目录 |
| `server/types.ts` | 定义后端文件节点、读取响应、保存响应类型 |
| `server/pathGuard.ts` | 校验相对路径、阻止越权、限制 `.md` 文件 |
| `server/fileTree.ts` | 扫描工作区目录，返回目录和 Markdown 文件树 |
| `server/fileStore.ts` | 读取和保存 Markdown 文件 |
| `server/index.ts` | 创建 Koa 服务并注册 API 路由 |
| `src/types/files.ts` | 定义前端文件树和 API 响应类型 |
| `src/services/api.ts` | 封装 `/api/files`、`/api/file` 请求 |
| `src/components/FileTree.tsx` | 渲染左侧目录树并处理文件点击 |
| `src/components/EditorHeader.tsx` | 展示当前路径、保存按钮和保存状态 |
| `src/components/MarkdownEditor.tsx` | 提供 Markdown 原文编辑区 |
| `src/components/EmptyState.tsx` | 展示未选择文件、加载、错误等空状态 |
| `src/App.tsx` | 管理文件树、当前文件、编辑内容、保存状态 |

## 3. 提交节奏

| 阶段 | 建议提交信息 |
| --- | --- |
| 项目脚手架完成 | `feat: 初始化阅读编辑器` |
| 后端路径与文件 API 完成 | `feat: 实现文件读写接口` |
| 前端浏览编辑保存完成 | `feat: 实现Markdown编辑界面` |
| 验收文档与收尾完成 | `docs: 补充项目使用说明` |

---

## Task 1: 初始化项目脚手架

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/package.json`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/index.html`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/main.tsx`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.tsx`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/index.css`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/vite-env.d.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/test/setup.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/.gitignore`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/.env.example`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.json`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.app.json`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.node.json`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.server.json`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/vite.config.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/vitest.config.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/tailwind.config.cjs`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/postcss.config.cjs`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/eslint.config.js`

- [ ] **Step 1: 创建项目目录**

Run:

```bash
mkdir -p /Users/bytedance/Desktop/项目/markdown-reader-editor
cd /Users/bytedance/Desktop/项目/markdown-reader-editor
git init
mkdir -p src/test
```

Expected:

```text
Initialized empty Git repository
```

- [ ] **Step 2: 创建 `package.json`**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/package.json`:

```json
{
  "name": "markdown-reader-editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"pnpm dev:server\" \"pnpm dev:web\"",
    "dev:web": "vite --host 127.0.0.1",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc -b tsconfig.app.json tsconfig.server.json && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint ."
  },
  "dependencies": {
    "@koa/cors": "^5.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "koa": "^2.16.1",
    "koa-bodyparser": "^4.4.1",
    "koa-router": "^12.0.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.29.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/koa": "^2.15.0",
    "@types/koa-bodyparser": "^4.3.12",
    "@types/koa-router": "^7.4.8",
    "@types/node": "^24.0.0",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "autoprefixer": "^10.4.21",
    "concurrently": "^9.2.0",
    "eslint": "^9.29.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.2.0",
    "jsdom": "^26.1.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.3",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.34.1",
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 3: 创建 TypeScript 配置**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.server.json" }
  ]
}
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "eslint.config.js"]
}
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/tsconfig.server.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.server.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["server/**/*.ts"]
}
```

- [ ] **Step 4: 创建 Vite、Vitest 和 Tailwind 配置**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4174',
        changeOrigin: true,
      },
    },
  },
});
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'server/**/*.test.ts'],
  },
});
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/tailwind.config.cjs`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/postcss.config.cjs`:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: 创建 ESLint 配置**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/eslint.config.js`:

```js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'build', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

- [ ] **Step 6: 创建前端入口文件**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Markdown Reader Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 px-8 py-6 shadow-xl">
        <p className="text-sm text-slate-400">Markdown Reader Editor</p>
        <h1 className="mt-2 text-2xl font-semibold">本地 Markdown 阅读编辑器</h1>
        <p className="mt-3 text-sm text-slate-300">项目脚手架已就绪。</p>
      </section>
    </main>
  );
}
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: 创建环境样例和忽略文件**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/.env.example`:

```bash
MARKDOWN_WORKSPACE_ROOT=/Users/bytedance/Desktop/项目/know_fragments
SERVER_HOST=127.0.0.1
SERVER_PORT=4174
```

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/.gitignore`:

```text
node_modules
dist
build
.env
.DS_Store
*.local
```

- [ ] **Step 8: 安装依赖**

Run:

```bash
cd /Users/bytedance/Desktop/项目/markdown-reader-editor
pnpm install
```

Expected:

```text
Done
```

- [ ] **Step 9: 验证脚手架**

Run:

```bash
pnpm build
pnpm lint
pnpm test
```

Expected:

```text
✓ built
No test files found
```

If `vitest run` exits with no test files as a non-zero code in the installed Vitest version, continue after Task 2 adds tests and use `pnpm test` again.

- [ ] **Step 10: 提交脚手架**

Run:

```bash
git status --short
git add .
git commit -m "feat: 初始化阅读编辑器"
```

Expected:

```text
[main ...] feat: 初始化阅读编辑器
```

---

## Task 2: 实现后端类型、配置和路径安全

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/types.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/config.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/pathGuard.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/pathGuard.test.ts`

- [ ] **Step 1: 创建后端类型**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/types.ts`:

```ts
export type FileNode = DirectoryNode | MarkdownFileNode;

export interface DirectoryNode {
  type: 'directory';
  name: string;
  path: string;
  children: FileNode[];
}

export interface MarkdownFileNode {
  type: 'file';
  name: string;
  path: string;
}

export interface FileTreeResponse {
  root: string;
  items: FileNode[];
}

export interface FileReadResponse {
  path: string;
  content: string;
  updatedAt: string;
}

export interface FileSaveResponse {
  path: string;
  saved: true;
  updatedAt: string;
}

export interface AppConfig {
  workspaceRoot: string;
  host: string;
  port: number;
}
```

- [ ] **Step 2: 创建配置读取模块**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/config.ts`:

```ts
import path from 'node:path';
import type { AppConfig } from './types.js';

const DEFAULT_WORKSPACE_ROOT = '/Users/bytedance/Desktop/项目/know_fragments';

export function getConfig(): AppConfig {
  const workspaceRoot = process.env.MARKDOWN_WORKSPACE_ROOT ?? DEFAULT_WORKSPACE_ROOT;
  const host = process.env.SERVER_HOST ?? '127.0.0.1';
  const port = Number(process.env.SERVER_PORT ?? 4174);

  return {
    workspaceRoot: path.resolve(workspaceRoot),
    host,
    port: Number.isFinite(port) ? port : 4174,
  };
}
```

- [ ] **Step 3: 写路径安全失败测试**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/pathGuard.test.ts`:

```ts
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveMarkdownPath } from './pathGuard.js';

const root = path.join(process.cwd(), 'tmp-workspace');

describe('resolveMarkdownPath', () => {
  it('resolves a markdown file inside workspace', () => {
    const result = resolveMarkdownPath(root, 'notes/day1.md');

    expect(result.relativePath).toBe('notes/day1.md');
    expect(result.absolutePath).toBe(path.resolve(root, 'notes/day1.md'));
  });

  it('rejects empty paths', () => {
    expect(() => resolveMarkdownPath(root, '')).toThrow('文件路径无效');
  });

  it('rejects absolute paths', () => {
    expect(() => resolveMarkdownPath(root, '/etc/passwd')).toThrow('不允许使用绝对路径');
  });

  it('rejects path traversal', () => {
    expect(() => resolveMarkdownPath(root, '../secret.md')).toThrow('无权访问该路径');
  });

  it('rejects non markdown files', () => {
    expect(() => resolveMarkdownPath(root, 'notes/data.txt')).toThrow('只支持 Markdown 文件');
  });
});
```

- [ ] **Step 4: 运行测试确认失败**

Run:

```bash
pnpm test server/pathGuard.test.ts
```

Expected:

```text
FAIL server/pathGuard.test.ts
Cannot find module './pathGuard.js'
```

- [ ] **Step 5: 实现路径安全模块**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/pathGuard.ts`:

```ts
import path from 'node:path';

export interface ResolvedMarkdownPath {
  absolutePath: string;
  relativePath: string;
}

export function resolveMarkdownPath(workspaceRoot: string, relativePath: string): ResolvedMarkdownPath {
  const normalizedRoot = path.resolve(workspaceRoot);
  const trimmedPath = relativePath.trim();

  if (!trimmedPath) {
    throw new Error('文件路径无效');
  }

  if (path.isAbsolute(trimmedPath)) {
    throw new Error('不允许使用绝对路径');
  }

  const absolutePath = path.resolve(normalizedRoot, trimmedPath);
  const relativeToRoot = path.relative(normalizedRoot, absolutePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    throw new Error('无权访问该路径');
  }

  if (path.extname(absolutePath).toLowerCase() !== '.md') {
    throw new Error('只支持 Markdown 文件');
  }

  return {
    absolutePath,
    relativePath: relativeToRoot.split(path.sep).join('/'),
  };
}
```

- [ ] **Step 6: 验证路径安全测试通过**

Run:

```bash
pnpm test server/pathGuard.test.ts
```

Expected:

```text
PASS server/pathGuard.test.ts
```

- [ ] **Step 7: 运行类型检查**

Run:

```bash
pnpm build
```

Expected:

```text
✓ built
```

---

## Task 3: 实现文件树扫描

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileTree.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileTree.test.ts`

- [ ] **Step 1: 写文件树测试**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileTree.test.ts`:

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildFileTree } from './fileTree.js';

let workspaceRoot: string;

beforeEach(async () => {
  workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'md-tree-'));
  await fs.mkdir(path.join(workspaceRoot, 'notes', 'daily'), { recursive: true });
  await fs.mkdir(path.join(workspaceRoot, '.git'), { recursive: true });
  await fs.writeFile(path.join(workspaceRoot, 'README.md'), '# Readme');
  await fs.writeFile(path.join(workspaceRoot, 'notes', 'daily', 'day1.md'), '# Day 1');
  await fs.writeFile(path.join(workspaceRoot, 'notes', 'draft.txt'), 'draft');
  await fs.writeFile(path.join(workspaceRoot, '.git', 'ignored.md'), '# ignored');
});

afterEach(async () => {
  await fs.rm(workspaceRoot, { recursive: true, force: true });
});

describe('buildFileTree', () => {
  it('returns directories and markdown files only', async () => {
    const tree = await buildFileTree(workspaceRoot);

    expect(tree.root).toBe(path.basename(workspaceRoot));
    expect(tree.items).toEqual([
      {
        type: 'directory',
        name: 'notes',
        path: 'notes',
        children: [
          {
            type: 'directory',
            name: 'daily',
            path: 'notes/daily',
            children: [
              {
                type: 'file',
                name: 'day1.md',
                path: 'notes/daily/day1.md',
              },
            ],
          },
        ],
      },
      {
        type: 'file',
        name: 'README.md',
        path: 'README.md',
      },
    ]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test server/fileTree.test.ts
```

Expected:

```text
FAIL server/fileTree.test.ts
Cannot find module './fileTree.js'
```

- [ ] **Step 3: 实现文件树扫描**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileTree.ts`:

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type { FileNode, FileTreeResponse } from './types.js';

const IGNORED_NAMES = new Set(['.git', 'node_modules', '.trae', '.DS_Store', 'dist', 'build']);

export async function buildFileTree(workspaceRoot: string): Promise<FileTreeResponse> {
  const root = path.resolve(workspaceRoot);
  const items = await readDirectory(root, root);

  return {
    root: path.basename(root),
    items,
  };
}

async function readDirectory(root: string, currentDirectory: string): Promise<FileNode[]> {
  const entries = await fs.readdir(currentDirectory, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    if (IGNORED_NAMES.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(currentDirectory, entry.name);
    const relativePath = toPosixPath(path.relative(root, absolutePath));

    if (entry.isDirectory()) {
      const children = await readDirectory(root, absolutePath);
      if (children.length > 0) {
        nodes.push({
          type: 'directory',
          name: entry.name,
          path: relativePath,
          children,
        });
      }
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
      nodes.push({
        type: 'file',
        name: entry.name,
        path: relativePath,
      });
    }
  }

  return nodes.sort(compareNodes);
}

function compareNodes(left: FileNode, right: FileNode): number {
  if (left.type !== right.type) {
    return left.type === 'directory' ? -1 : 1;
  }

  return left.name.localeCompare(right.name, 'zh-CN');
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}
```

- [ ] **Step 4: 验证文件树测试通过**

Run:

```bash
pnpm test server/fileTree.test.ts
```

Expected:

```text
PASS server/fileTree.test.ts
```

---

## Task 4: 实现文件读取和保存

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileStore.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileStore.test.ts`

- [ ] **Step 1: 写文件读写测试**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileStore.test.ts`:

```ts
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readMarkdownFile, saveMarkdownFile } from './fileStore.js';

let workspaceRoot: string;

beforeEach(async () => {
  workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'md-store-'));
  await fs.mkdir(path.join(workspaceRoot, 'notes'), { recursive: true });
  await fs.writeFile(path.join(workspaceRoot, 'notes', 'day1.md'), '# Day 1\n');
});

afterEach(async () => {
  await fs.rm(workspaceRoot, { recursive: true, force: true });
});

describe('fileStore', () => {
  it('reads markdown file content', async () => {
    const result = await readMarkdownFile(workspaceRoot, 'notes/day1.md');

    expect(result.path).toBe('notes/day1.md');
    expect(result.content).toBe('# Day 1\n');
    expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('saves markdown file content', async () => {
    const result = await saveMarkdownFile(workspaceRoot, 'notes/day1.md', '# Updated\n');
    const content = await fs.readFile(path.join(workspaceRoot, 'notes', 'day1.md'), 'utf-8');

    expect(result.saved).toBe(true);
    expect(content).toBe('# Updated\n');
  });

  it('rejects writing outside workspace', async () => {
    await expect(saveMarkdownFile(workspaceRoot, '../escape.md', '# Escape')).rejects.toThrow('无权访问该路径');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test server/fileStore.test.ts
```

Expected:

```text
FAIL server/fileStore.test.ts
Cannot find module './fileStore.js'
```

- [ ] **Step 3: 实现文件读写模块**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileStore.ts`:

```ts
import fs from 'node:fs/promises';
import type { FileReadResponse, FileSaveResponse } from './types.js';
import { resolveMarkdownPath } from './pathGuard.js';

export async function readMarkdownFile(workspaceRoot: string, relativePath: string): Promise<FileReadResponse> {
  const resolved = resolveMarkdownPath(workspaceRoot, relativePath);
  const [content, stat] = await Promise.all([
    fs.readFile(resolved.absolutePath, 'utf-8'),
    fs.stat(resolved.absolutePath),
  ]);

  return {
    path: resolved.relativePath,
    content,
    updatedAt: stat.mtime.toISOString(),
  };
}

export async function saveMarkdownFile(
  workspaceRoot: string,
  relativePath: string,
  content: string,
): Promise<FileSaveResponse> {
  const resolved = resolveMarkdownPath(workspaceRoot, relativePath);

  await fs.writeFile(resolved.absolutePath, content, 'utf-8');
  const stat = await fs.stat(resolved.absolutePath);

  return {
    path: resolved.relativePath,
    saved: true,
    updatedAt: stat.mtime.toISOString(),
  };
}
```

- [ ] **Step 4: 验证文件读写测试通过**

Run:

```bash
pnpm test server/fileStore.test.ts
```

Expected:

```text
PASS server/fileStore.test.ts
```

- [ ] **Step 5: 运行后端测试全集**

Run:

```bash
pnpm test server
```

Expected:

```text
PASS server/pathGuard.test.ts
PASS server/fileTree.test.ts
PASS server/fileStore.test.ts
```

---

## Task 5: 实现 Koa API 服务

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/index.ts`

- [ ] **Step 1: 创建 API 服务**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/index.ts`:

```ts
import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { getConfig } from './config.js';
import { buildFileTree } from './fileTree.js';
import { readMarkdownFile, saveMarkdownFile } from './fileStore.js';

const config = getConfig();
const app = new Koa();
const router = new Router({ prefix: '/api' });

router.get('/health', (ctx) => {
  ctx.body = {
    ok: true,
    workspaceRoot: config.workspaceRoot,
  };
});

router.get('/files', async (ctx) => {
  ctx.body = await buildFileTree(config.workspaceRoot);
});

router.get('/file', async (ctx) => {
  const filePath = String(ctx.query.path ?? '');
  ctx.body = await readMarkdownFile(config.workspaceRoot, filePath);
});

router.post('/file', async (ctx) => {
  const body = ctx.request.body as { path?: unknown; content?: unknown };
  const filePath = typeof body.path === 'string' ? body.path : '';
  const content = typeof body.content === 'string' ? body.content : '';

  ctx.body = await saveMarkdownFile(config.workspaceRoot, filePath, content);
});

app.use(cors({ origin: 'http://127.0.0.1:5173' }));
app.use(bodyParser({ jsonLimit: '5mb' }));
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : '服务异常';
    ctx.status = mapErrorStatus(message);
    ctx.body = { message };
  }
});
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port, config.host, () => {
  console.log(`Markdown API listening at http://${config.host}:${config.port}`);
  console.log(`Workspace root: ${config.workspaceRoot}`);
});

function mapErrorStatus(message: string): number {
  if (message.includes('无权访问')) {
    return 403;
  }

  if (message.includes('不存在')) {
    return 404;
  }

  if (message.includes('无效') || message.includes('绝对路径') || message.includes('Markdown')) {
    return 400;
  }

  return 500;
}
```

- [ ] **Step 2: 补充文件不存在错误语义**

Modify `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/fileStore.ts`:

```ts
import fs from 'node:fs/promises';
import type { FileReadResponse, FileSaveResponse } from './types.js';
import { resolveMarkdownPath } from './pathGuard.js';

export async function readMarkdownFile(workspaceRoot: string, relativePath: string): Promise<FileReadResponse> {
  const resolved = resolveMarkdownPath(workspaceRoot, relativePath);

  try {
    const [content, stat] = await Promise.all([
      fs.readFile(resolved.absolutePath, 'utf-8'),
      fs.stat(resolved.absolutePath),
    ]);

    return {
      path: resolved.relativePath,
      content,
      updatedAt: stat.mtime.toISOString(),
    };
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error('文件不存在或已被移动');
    }
    throw error;
  }
}

export async function saveMarkdownFile(
  workspaceRoot: string,
  relativePath: string,
  content: string,
): Promise<FileSaveResponse> {
  const resolved = resolveMarkdownPath(workspaceRoot, relativePath);

  try {
    await fs.writeFile(resolved.absolutePath, content, 'utf-8');
    const stat = await fs.stat(resolved.absolutePath);

    return {
      path: resolved.relativePath,
      saved: true,
      updatedAt: stat.mtime.toISOString(),
    };
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error('文件不存在或已被移动');
    }
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
```

- [ ] **Step 3: 运行后端和类型检查**

Run:

```bash
pnpm test server
pnpm build
```

Expected:

```text
PASS server/pathGuard.test.ts
PASS server/fileTree.test.ts
PASS server/fileStore.test.ts
✓ built
```

- [ ] **Step 4: 手动验证健康检查**

Run:

```bash
pnpm dev:server
```

Open another terminal and run:

```bash
curl http://127.0.0.1:4174/api/health
```

Expected:

```json
{"ok":true,"workspaceRoot":"/Users/bytedance/Desktop/项目/know_fragments"}
```

- [ ] **Step 5: 手动验证越权路径被拒绝**

Run:

```bash
curl "http://127.0.0.1:4174/api/file?path=../secret.md"
```

Expected:

```json
{"message":"无权访问该路径"}
```

- [ ] **Step 6: 提交后端 API**

Run:

```bash
git status --short
git add server package.json pnpm-lock.yaml tsconfig.server.json vitest.config.ts
git commit -m "feat: 实现文件读写接口"
```

Expected:

```text
[main ...] feat: 实现文件读写接口
```

---

## Task 6: 实现前端 API 类型和请求封装

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/types/files.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/services/api.ts`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/services/api.test.ts`

- [ ] **Step 1: 创建前端类型**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/types/files.ts`:

```ts
export type FileNode = DirectoryNode | MarkdownFileNode;

export interface DirectoryNode {
  type: 'directory';
  name: string;
  path: string;
  children: FileNode[];
}

export interface MarkdownFileNode {
  type: 'file';
  name: string;
  path: string;
}

export interface FileTreeResponse {
  root: string;
  items: FileNode[];
}

export interface FileReadResponse {
  path: string;
  content: string;
  updatedAt: string;
}

export interface FileSaveResponse {
  path: string;
  saved: true;
  updatedAt: string;
}
```

- [ ] **Step 2: 写 API 封装测试**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/services/api.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFileTree, readFile, saveFile } from './api';

describe('api service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches file tree', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ root: 'root', items: [] }));

    await expect(fetchFileTree()).resolves.toEqual({ root: 'root', items: [] });
    expect(fetch).toHaveBeenCalledWith('/api/files');
  });

  it('reads encoded file path', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ path: 'a b.md', content: '# A', updatedAt: 'now' }));

    await readFile('a b.md');

    expect(fetch).toHaveBeenCalledWith('/api/file?path=a%20b.md');
  });

  it('saves file content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ path: 'a.md', saved: true, updatedAt: 'now' }));

    await saveFile('a.md', '# A');

    expect(fetch).toHaveBeenCalledWith('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'a.md', content: '# A' }),
    });
  });

  it('throws api error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: '无权访问该路径' }, false));

    await expect(fetchFileTree()).rejects.toThrow('无权访问该路径');
  });
});

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as Response;
}
```

- [ ] **Step 3: 运行测试确认失败**

Run:

```bash
pnpm test src/services/api.test.ts
```

Expected:

```text
FAIL src/services/api.test.ts
Cannot find module './api'
```

- [ ] **Step 4: 实现 API 封装**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/services/api.ts`:

```ts
import type { FileReadResponse, FileSaveResponse, FileTreeResponse } from '../types/files';

export async function fetchFileTree(): Promise<FileTreeResponse> {
  return requestJson<FileTreeResponse>('/api/files');
}

export async function readFile(path: string): Promise<FileReadResponse> {
  return requestJson<FileReadResponse>(`/api/file?path=${encodeURIComponent(path)}`);
}

export async function saveFile(path: string, content: string): Promise<FileSaveResponse> {
  return requestJson<FileSaveResponse>('/api/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = (await response.json()) as T | { message?: string };

  if (!response.ok) {
    throw new Error('message' in data && data.message ? data.message : '请求失败');
  }

  return data as T;
}
```

- [ ] **Step 5: 验证 API 测试通过**

Run:

```bash
pnpm test src/services/api.test.ts
```

Expected:

```text
PASS src/services/api.test.ts
```

---

## Task 7: 实现基础 UI 组件

**Files:**
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/EmptyState.tsx`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/MarkdownEditor.tsx`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/EditorHeader.tsx`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/FileTree.tsx`

- [ ] **Step 1: 创建空状态组件**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/EmptyState.tsx`:

```tsx
interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 Markdown 编辑器组件**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/MarkdownEditor.tsx`:

```tsx
interface MarkdownEditorProps {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, disabled, onChange }: MarkdownEditorProps) {
  return (
    <textarea
      className="h-full w-full resize-none border-0 bg-white p-6 font-mono text-sm leading-7 text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      value={value}
      disabled={disabled}
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
```

- [ ] **Step 3: 创建编辑器顶部栏组件**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/EditorHeader.tsx`:

```tsx
export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface EditorHeaderProps {
  selectedPath: string | null;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
}

export function EditorHeader({ selectedPath, dirty, saving, error, onSave }: EditorHeaderProps) {
  const status = getSaveStatus(dirty, saving, error);

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">当前文件</p>
        <p className="truncate text-sm font-medium text-slate-800">{selectedPath ?? '未选择文件'}</p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-3">
        <span className={status.className}>{status.label}</span>
        <button
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          type="button"
          disabled={!selectedPath || !dirty || saving}
          onClick={onSave}
        >
          {saving ? '保存中' : '保存'}
        </button>
      </div>
    </header>
  );
}

function getSaveStatus(dirty: boolean, saving: boolean, error: string | null) {
  if (saving) {
    return { label: '保存中', className: 'text-sm text-blue-600' };
  }

  if (error) {
    return { label: '保存失败', className: 'text-sm text-red-600' };
  }

  if (dirty) {
    return { label: '未保存', className: 'text-sm text-amber-600' };
  }

  return { label: '已保存', className: 'text-sm text-emerald-600' };
}
```

- [ ] **Step 4: 创建文件树组件**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/components/FileTree.tsx`:

```tsx
import type { FileNode } from '../types/files';

interface FileTreeProps {
  root: string;
  items: FileNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

export function FileTree({ root, items, selectedPath, onSelectFile }: FileTreeProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
        <h1 className="mt-1 truncate text-lg font-semibold">{root}</h1>
      </div>
      <div className="flex-1 overflow-auto px-3 py-4">
        {items.length === 0 ? (
          <p className="px-2 text-sm text-slate-500">没有 Markdown 文件</p>
        ) : (
          <ul className="space-y-1">{items.map((node) => renderNode(node, selectedPath, onSelectFile, 0))}</ul>
        )}
      </div>
    </aside>
  );
}

function renderNode(
  node: FileNode,
  selectedPath: string | null,
  onSelectFile: (path: string) => void,
  depth: number,
) {
  if (node.type === 'directory') {
    return (
      <li key={node.path}>
        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500" style={{ paddingLeft: depth * 14 + 8 }}>
          {node.name}
        </div>
        <ul className="space-y-1">{node.children.map((child) => renderNode(child, selectedPath, onSelectFile, depth + 1))}</ul>
      </li>
    );
  }

  const active = selectedPath === node.path;

  return (
    <li key={node.path}>
      <button
        className={`w-full truncate rounded-xl px-2 py-2 text-left text-sm transition ${
          active ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
        type="button"
        title={node.path}
        onClick={() => onSelectFile(node.path)}
      >
        {node.name}
      </button>
    </li>
  );
}
```

- [ ] **Step 5: 运行类型检查**

Run:

```bash
pnpm build
```

Expected:

```text
✓ built
```

---

## Task 8: 集成 App 状态流和保存交互

**Files:**
- Modify: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.tsx`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.test.tsx`

- [ ] **Step 1: 写 App 核心交互测试**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads file tree, opens a markdown file, edits and saves it', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === '/api/files') {
        return jsonResponse({
          root: 'know_fragments',
          items: [{ type: 'file', name: 'README.md', path: 'README.md' }],
        });
      }

      if (url === '/api/file?path=README.md' && !init) {
        return jsonResponse({ path: 'README.md', content: '# Hello\n', updatedAt: 'now' });
      }

      if (url === '/api/file' && init?.method === 'POST') {
        return jsonResponse({ path: 'README.md', saved: true, updatedAt: 'later' });
      }

      return jsonResponse({ message: 'not found' }, false);
    });

    render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: 'README.md' }));
    const editor = await screen.findByDisplayValue('# Hello\n');

    await userEvent.clear(editor);
    await userEvent.type(editor, '# Updated');

    expect(screen.getByText('未保存')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => expect(screen.getByText('已保存')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'README.md', content: '# Updated' }),
    });
  });
});

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as Response;
}
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
pnpm test src/App.test.tsx
```

Expected:

```text
FAIL src/App.test.tsx
Unable to find role="button" and name "README.md"
```

- [ ] **Step 3: 实现 App 状态流**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { EditorHeader } from './components/EditorHeader';
import { EmptyState } from './components/EmptyState';
import { FileTree } from './components/FileTree';
import { MarkdownEditor } from './components/MarkdownEditor';
import { fetchFileTree, readFile, saveFile } from './services/api';
import type { FileNode } from './types/files';

export default function App() {
  const [root, setRoot] = useState('know_fragments');
  const [items, setItems] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => content !== originalContent, [content, originalContent]);

  useEffect(() => {
    void loadFileTree();
  }, []);

  async function loadFileTree() {
    setLoadingTree(true);
    setError(null);

    try {
      const tree = await fetchFileTree();
      setRoot(tree.root);
      setItems(tree.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingTree(false);
    }
  }

  async function handleSelectFile(path: string) {
    if (dirty && !window.confirm('当前文件尚未保存，是否放弃修改并切换文件？')) {
      return;
    }

    setSelectedPath(path);
    setLoadingFile(true);
    setError(null);

    try {
      const file = await readFile(path);
      setContent(file.content);
      setOriginalContent(file.content);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingFile(false);
    }
  }

  async function handleSave() {
    if (!selectedPath || !dirty) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveFile(selectedPath, content);
      setOriginalContent(content);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-100">
      <FileTree root={root} items={items} selectedPath={selectedPath} onSelectFile={handleSelectFile} />
      <section className="flex min-w-0 flex-1 flex-col">
        <EditorHeader selectedPath={selectedPath} dirty={dirty} saving={saving} error={error} onSave={handleSave} />
        <div className="min-h-0 flex-1">
          {loadingTree ? (
            <EmptyState title="正在加载文件树" description="正在扫描 know_fragments 下的 Markdown 文件。" />
          ) : loadingFile ? (
            <EmptyState title="正在打开文件" description="正在读取本地 Markdown 文件内容。" />
          ) : error && !selectedPath ? (
            <EmptyState title="加载失败" description={error} />
          ) : selectedPath ? (
            <MarkdownEditor value={content} disabled={saving} onChange={setContent} />
          ) : (
            <EmptyState title="选择一个 Markdown 文件" description="从左侧文件树中选择 .md 文件开始阅读或编辑。" />
          )}
        </div>
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求失败';
}
```

- [ ] **Step 4: 验证 App 测试通过**

Run:

```bash
pnpm test src/App.test.tsx
```

Expected:

```text
PASS src/App.test.tsx
```

- [ ] **Step 5: 运行前端测试全集**

Run:

```bash
pnpm test src
```

Expected:

```text
PASS src/services/api.test.ts
PASS src/App.test.tsx
```

---

## Task 9: 联调、样式完善和端到端手动验收

**Files:**
- Modify: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/index.css`
- Create: `/Users/bytedance/Desktop/项目/markdown-reader-editor/README.md`

- [ ] **Step 1: 优化基础页面滚动和选中文本样式**

Modify `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

::selection {
  background: #cbd5e1;
  color: #0f172a;
}
```

- [ ] **Step 2: 启动本地服务联调**

Run:

```bash
cd /Users/bytedance/Desktop/项目/markdown-reader-editor
pnpm dev
```

Expected:

```text
Markdown API listening at http://127.0.0.1:4174
Local: http://127.0.0.1:5173/
```

- [ ] **Step 3: 浏览器手动验收文件树**

Open:

```text
http://127.0.0.1:5173/
```

Expected:

```text
左侧显示 know_fragments，能看到 Markdown 文件和包含 Markdown 文件的目录。
```

- [ ] **Step 4: 浏览器手动验收打开文件**

Click:

```text
AI重塑体系/投资/00_方法论/美股ETF/Day1_建立ETF地图_教学讲义.md
```

Expected:

```text
右侧 textarea 显示 Markdown 原文，顶部路径显示当前文件路径。
```

- [ ] **Step 5: 浏览器手动验收保存文件**

Manual operation:

```text
在文件末尾新增一行：测试保存功能
点击保存
看到状态变为已保存
用 IDE 打开同一文件确认内容已写入
再删除新增测试行并保存，恢复文档内容
```

Expected:

```text
文件内容能写回本地，测试行可以被删除并再次保存。
```

- [ ] **Step 6: 手动验收路径安全**

Run:

```bash
curl "http://127.0.0.1:4174/api/file?path=../secret.md"
curl "http://127.0.0.1:4174/api/file?path=/etc/passwd"
curl "http://127.0.0.1:4174/api/file?path=README.txt"
```

Expected:

```json
{"message":"无权访问该路径"}
{"message":"不允许使用绝对路径"}
{"message":"只支持 Markdown 文件"}
```

- [ ] **Step 7: 创建 README**

Write `/Users/bytedance/Desktop/项目/markdown-reader-editor/README.md`:

```md
# Markdown Reader Editor

本项目是一个本地 Markdown 阅读编辑器，默认管理 `/Users/bytedance/Desktop/项目/know_fragments`。

## 功能范围

- 浏览 `know_fragments` 下的目录和 `.md` 文件。
- 打开 Markdown 文件并查看原文。
- 编辑 Markdown 内容。
- 保存内容回本地文件。
- 后端限制文件读写范围在工作区内。

## 启动

```bash
pnpm install
pnpm dev
```

浏览器打开：

```text
http://127.0.0.1:5173/
```

## 配置

可以通过环境变量覆盖默认工作区：

```bash
MARKDOWN_WORKSPACE_ROOT=/Users/bytedance/Desktop/项目/know_fragments
SERVER_HOST=127.0.0.1
SERVER_PORT=4174
```

## 验证

```bash
pnpm test
pnpm build
pnpm lint
```
```

- [ ] **Step 8: 运行最终自动化检查**

Run:

```bash
pnpm test
pnpm build
pnpm lint
```

Expected:

```text
Test Files 5 passed
✓ built
```

- [ ] **Step 9: 提交前端和文档**

Run:

```bash
git status --short
git add .
git commit -m "feat: 实现Markdown编辑界面"
```

Expected:

```text
[main ...] feat: 实现Markdown编辑界面
```

---

## Task 10: 完成最终交付检查

**Files:**
- Inspect: `/Users/bytedance/Desktop/项目/markdown-reader-editor/README.md`
- Inspect: `/Users/bytedance/Desktop/项目/markdown-reader-editor/server/pathGuard.ts`
- Inspect: `/Users/bytedance/Desktop/项目/markdown-reader-editor/src/App.tsx`

- [ ] **Step 1: 检查范围没有外溢**

Run:

```bash
grep -R "search\\|delete\\|rename\\|preview" -n src server README.md || true
```

Expected:

```text
没有出现已实现搜索、删除、重命名、预览功能的代码入口。
```

- [ ] **Step 2: 检查服务只监听本地**

Run:

```bash
grep -R "0.0.0.0" -n server src package.json || true
grep -R "127.0.0.1" -n server src package.json vite.config.ts
```

Expected:

```text
没有 0.0.0.0，存在 127.0.0.1。
```

- [ ] **Step 3: 检查工作区默认值**

Run:

```bash
grep -R "MARKDOWN_WORKSPACE_ROOT\\|know_fragments" -n server .env.example README.md
```

Expected:

```text
server/config.ts、.env.example、README.md 均包含 know_fragments 默认配置。
```

- [ ] **Step 4: 运行最终验证命令**

Run:

```bash
pnpm test
pnpm build
pnpm lint
```

Expected:

```text
所有测试、构建、Lint 均通过。
```

- [ ] **Step 5: 记录最终交付说明**

Prepare final handoff:

```text
已完成本地 Markdown 阅读编辑器 MVP：
- 默认读取 /Users/bytedance/Desktop/项目/know_fragments
- 支持文件树、打开 .md、编辑、保存
- 后端只监听 127.0.0.1
- 路径安全阻止 ../、绝对路径和非 .md 文件
- 已通过 pnpm test、pnpm build、pnpm lint
```

---

## 4. 需求覆盖矩阵

| 设计文档需求 | 覆盖任务 |
| --- | --- |
| 本地 Web App | Task 1, Task 5, Task 9 |
| 默认绑定 `know_fragments` | Task 2, Task 10 |
| 文件树浏览 | Task 3, Task 7, Task 8 |
| 打开 Markdown 文件 | Task 4, Task 5, Task 6, Task 8 |
| 编辑 Markdown 原文 | Task 7, Task 8 |
| 保存回本地文件 | Task 4, Task 5, Task 6, Task 8, Task 9 |
| 保存状态 | Task 7, Task 8 |
| 路径安全 | Task 2, Task 4, Task 5, Task 9, Task 10 |
| 错误处理 | Task 5, Task 6, Task 8 |
| 自动化测试 | Task 2, Task 3, Task 4, Task 6, Task 8, Task 9 |
| 手动验收 | Task 9, Task 10 |

## 5. 执行前检查

- 确认 `/Users/bytedance/Desktop/项目/markdown-reader-editor` 不存在，或确认其中内容可以作为该项目工作区使用。
- 确认 `pnpm` 可用：`pnpm --version`。
- 确认 Node.js 版本支持 React 19 和 Vite 7：`node --version` 建议为 Node 20+。
- 确认 `know_fragments` 路径存在：`ls /Users/bytedance/Desktop/项目/know_fragments`。

## 6. 执行完成定义

- `pnpm dev` 能同时启动前端和后端。
- `http://127.0.0.1:5173/` 能展示文件树。
- 能打开 `AI重塑体系/投资/00_方法论/美股ETF/Day1_建立ETF地图_教学讲义.md`。
- 能编辑并保存 Markdown 文件。
- `curl` 越权访问测试返回预期错误。
- `pnpm test`、`pnpm build`、`pnpm lint` 全部通过。
