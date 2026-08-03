# web3d-harness-lab 项目脚手架说明

## 文档目标

- 这份文档用于说明 `web3d-harness-lab` 的推荐目录结构、职责划分和启动顺序。
- 它不是完整代码实现，而是一份用于开工和持续扩展的工程说明书。
- 当前目录骨架已经创建在：

`/Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/web3D/web3d-harness-lab`

---

## 项目定位

`web3d-harness-lab` 不是一个单一 Demo，而是一个用于长期学习和验证 `Web3D` 的实验底座。

它的职责是：

- 承载所有 Web3D 学习实验
- 提供统一的实验启动方式
- 提供统一的观测能力
- 提供统一的记录和复盘入口
- 逐步沉淀成自己的 Web3D 工程资产

---

## 当前目录结构

```text
web3d-harness-lab/
├── src/
│   ├── harness/
│   ├── experiments/
│   │   ├── 01-basic-scene/
│   │   ├── 02-transform/
│   │   ├── 03-geometry/
│   │   ├── 04-material-pbr/
│   │   ├── 05-light-shadow/
│   │   ├── 06-gltf-loader/
│   │   ├── 07-interaction/
│   │   ├── 08-animation/
│   │   ├── 09-performance/
│   │   └── 10-r3f/
│   └── assets/
│       ├── models/
│       └── textures/
├── docs/
└── tests/
    └── screenshots/
```

---

## 目录职责

### `src/harness/`

用于存放实验公共基建。

建议逐步放入：

- `createScene.ts`
- `createCamera.ts`
- `createRenderer.ts`
- `createLights.ts`
- `createGui.ts`
- `createStats.ts`
- `bootstrapExperiment.ts`

这里的原则是：

- 只放“多个实验会重复使用”的东西
- 不放单一实验的业务逻辑

---

### `src/experiments/`

用于存放具体实验。

原则：

- 一个目录只验证一个主题
- 每个实验都应该能独立运行
- 每个实验都应该有自己的说明和结论

当前阶段建议按编号顺序推进，不要跳着做。

---

### `src/assets/`

用于存放实验资源。

建议分层：

- `models/` 存放 `glTF / GLB`
- `textures/` 存放贴图

建议规则：

- 公共资源放这里
- 某个实验独占的小资源可以放在对应实验目录里

---

### `docs/`

用于放学习型文档和实验结论。

建议维护这些文档：

- `learning-notes.md`
- `performance-notes.md`
- `troubleshooting.md`
- `experiment-template.md`

---

### `tests/screenshots/`

用于存放截图基线或实验结果截图。

后续可以配合：

- `Playwright`
- 手工截图对比

作用：

- 验证改动前后的视觉差异
- 给实验结论留下证据

---

## 推荐后续补齐的文件

为了让这个目录从“骨架”升级到“可运行项目”，建议后续按顺序补这些文件：

### 第一批

- `package.json`
- `tsconfig.json`
- `index.html`
- `src/main.ts`

### 第二批

- `src/harness/createScene.ts`
- `src/harness/createCamera.ts`
- `src/harness/createRenderer.ts`
- `src/harness/createGui.ts`
- `src/harness/createStats.ts`

### 第三批

- `src/experiments/01-basic-scene/index.ts`
- `src/experiments/01-basic-scene/notes.md`

---

## 推荐初始化命令

如果你准备把这个目录真正初始化成一个可运行项目，建议在 `web3d-harness-lab` 目录里执行：

```bash
npm create vite@latest . -- --template vanilla-ts
npm install three lil-gui stats.js
```

如果后续要转 `React Three Fiber`，再补：

```bash
npm install react react-dom @react-three/fiber @react-three/drei
```

---

## 第一个可运行版本建议

第一个版本只做下面这些事：

- 页面中显示一个立方体
- 支持鼠标拖拽视角
- 页面显示 FPS
- 支持修改颜色和旋转速度

不要在第一个版本就加入：

- 模型加载
- 复杂动画
- 大量交互
- 性能优化

先把实验底座打稳，再往上叠。

---

## 建议的首批文件分工

你后续真正开工时，可以按下面分工写：

| 文件 | 作用 |
|---|---|
| `src/main.ts` | 程序入口，挂载当前实验 |
| `src/harness/createScene.ts` | 创建场景 |
| `src/harness/createCamera.ts` | 创建相机 |
| `src/harness/createRenderer.ts` | 创建渲染器 |
| `src/harness/createGui.ts` | 创建参数面板 |
| `src/harness/createStats.ts` | 创建性能面板 |
| `src/experiments/01-basic-scene/index.ts` | 第一个实验 |
| `src/experiments/01-basic-scene/notes.md` | 第一个实验的观察和结论 |

---

## 开工顺序建议

建议严格按这个顺序进行：

1. 初始化 `Vite + TypeScript`
2. 安装 `three`、`lil-gui`、`stats.js`
3. 完成 `src/main.ts`
4. 写 `01-basic-scene`
5. 把公共逻辑抽进 `src/harness/`
6. 写第一篇实验笔记
7. 再进入 `02-transform`

---

## 这份骨架的长期价值

这套骨架的目标不是为了“把目录摆好看”，而是为了让你之后的每个 Web3D 学习动作都能沉淀为：

- 一个实验
- 一套指标
- 一篇结论
- 一份可复用的工程资产

当目录、实验、文档和指标都稳定下来后，这个仓库就会逐渐变成你的 `Web3D 方法论实验室`。
