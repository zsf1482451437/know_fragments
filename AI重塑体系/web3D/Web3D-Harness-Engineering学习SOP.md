# Web3D Harness Engineering 学习 SOP

## 目标

- 这份文档用于用 `Harness Engineering` 的方式系统掌握 `Web3D` 技术。
- 重点不是零散学习 `Three.js` API，而是建立一套 `可复现`、`可观测`、`可验证`、`可迭代` 的学习与实验体系。
- 最终目标是从“会写 3D Demo”升级为“能解释现象、定位问题、做性能权衡、交付稳定 Web3D 应用”。

---

## 适用场景

- 你准备系统学习 `Web3D / Three.js / React Three Fiber`。
- 你不满足于“跟教程敲出来能跑”，希望建立工程化理解。
- 你希望把每个知识点沉淀为实验、结论和可复用模板。
- 你后续可能会做：
  - `3D 产品展示`
  - `设备运维可视化`
  - `数字孪生`
  - `3D 编辑器`

---

## 核心定义

### 什么是 Harness

这里的 `Harness` 可以理解为“实验夹具”或“验证支架”。

对于每一个 Web3D 知识点，都不只是写一段示例代码，而是搭一个最小实验环境，至少具备：

- 可运行
- 可切换参数
- 可观察结果
- 可记录性能
- 可复盘结论

例如学习材质时，不是只会写：

```ts
const material = new THREE.MeshStandardMaterial({
  roughness: 0.5,
  metalness: 0.8,
});
```

而是要构建一个 `PBR Material Harness`：

- 可以调整 `roughness`、`metalness`、`envMapIntensity`
- 可以切换多个模型球体和不同贴图
- 可以看到 `FPS`、`draw calls`、`triangles`
- 可以对比不同参数下的视觉和性能差异
- 可以写出“什么情况下该用什么材质”的结论

### 什么是 Harness Engineering

`Harness Engineering` 的核心是：

- 把每个技术点都转化成一个最小可验证实验
- 把经验变成结构化记录，而不是留在脑子里
- 把学习过程工程化，而不是教程式堆代码
- 用数据和现象驱动理解，而不是只记结论

---

## 学习总原则

- `先原理，后封装`：先理解相机、坐标系、材质、光照，再上高级框架。
- `先最小实验，后复杂项目`：不要一开始就做数字孪生大屏。
- `先观察，后优化`：没有指标就不要轻易说“性能差”。
- `先可重复，后可扩展`：每个实验都应该能被单独运行和复用。
- `先结论沉淀，后继续前进`：每完成一个实验，都要写一页结论。

---

## 推荐技术栈

| 层级 | 推荐选择 | 作用 |
|---|---|---|
| 语言 | `TypeScript` | 提高类型安全和可维护性 |
| 构建工具 | `Vite` | 快速搭建实验项目 |
| 核心引擎 | `Three.js` | 适合理解底层原理与主流实践 |
| 进阶框架 | `React Three Fiber` | 后期做复杂组件化应用 |
| 调试面板 | `lil-gui` | 动态调参数和观察结果 |
| 性能监控 | `stats.js` | 监控 FPS |
| 图形调试 | `Spector.js` | 观察 WebGL 调用与渲染过程 |
| 模型格式 | `glTF / GLB` | Web3D 主流资产格式 |
| 自动验证 | `Playwright` | 做截图回归和交互验证 |

---

## 学习路径

### 阶段 1：最小场景与渲染主线

目标：

- 理解 `scene`、`camera`、`renderer`、`mesh`、`light`
- 能解释一个最小 3D 场景为什么能显示出来

Harness：

- 一个立方体
- 一个光源
- 一个相机
- 一个 `OrbitControls`
- 一个 `stats.js`
- 一个 `lil-gui`

必须掌握的问题：

- 为什么相机位置不对时模型看不到
- `renderer.render(scene, camera)` 在做什么
- `PerspectiveCamera` 和 `OrthographicCamera` 的差异是什么

### 阶段 2：坐标系、矩阵与变换

目标：

- 理解世界坐标、本地坐标、相机坐标
- 理解平移、旋转、缩放和组合变换

Harness：

- 同时展示本地坐标轴和世界坐标轴
- 可切换父子节点关系
- 可动态调整 `position / rotation / scale`

必须掌握的问题：

- 为什么父节点旋转会影响子节点
- 为什么“模型移动”和“相机移动”视觉效果看起来类似但本质不同

### 阶段 3：几何体与 BufferGeometry

目标：

- 理解几何数据如何进入 GPU
- 认识顶点、法线、UV、索引

Harness：

- 立方体、球体、平面、线框切换
- 低面数与高面数模型对比
- 几何细分级别对比

必须掌握的问题：

- 面数变多为什么会影响性能
- 顶点属性缺失为什么会导致渲染异常

### 阶段 4：材质、贴图与 PBR

目标：

- 理解基础材质、标准材质、物理材质的差异
- 理解颜色贴图、法线贴图、金属度、粗糙度的作用

Harness：

- 同一模型切换 `Basic / Standard / Physical`
- 多种光照和环境贴图对比
- 参数面板实时调整材质属性

必须掌握的问题：

- 为什么 PBR 需要环境贴图才更真实
- 为什么法线贴图会改变“看起来的细节”但不增加几何面数

### 阶段 5：光照、阴影与环境

目标：

- 理解不同光源类型的适用场景
- 理解阴影的成本和限制

Harness：

- `AmbientLight`、`DirectionalLight`、`PointLight`、`SpotLight` 切换
- 阴影开关和阴影贴图尺寸切换
- 环境贴图前后对比

必须掌握的问题：

- 为什么阴影效果好但成本高
- 阴影锯齿和闪烁一般从哪里查

### 阶段 6：模型加载与资产管线

目标：

- 掌握 `GLTFLoader`
- 理解模型体积、纹理尺寸、压缩方案与加载速度之间的关系

Harness：

- 加载同一个模型的多个版本
- 对比不同纹理大小和压缩方式
- 展示加载耗时和资源体积

必须掌握的问题：

- 为什么 `glTF / GLB` 是 Web3D 主流格式
- 为什么一个“看起来不大”的模型文件仍然加载慢

### 阶段 7：交互与业务表达

目标：

- 掌握拾取、高亮、点击、悬浮、标注
- 能把 3D 场景和业务状态联动

Harness：

- 鼠标拾取模型部件
- Hover 高亮
- 点击显示信息面板
- 选中后切换颜色、描边或标签

必须掌握的问题：

- 射线拾取是怎么工作的
- 如何避免多个对象重叠时交互错乱

### 阶段 8：动画、镜头与状态管理

目标：

- 理解帧循环、补间、关键帧、骨骼动画
- 理解相机转场与场景状态切换

Harness：

- 自动旋转动画
- 模型关键帧动画播放
- 相机从 A 点平滑移动到 B 点

必须掌握的问题：

- 每帧更新逻辑该放哪里
- 业务状态和渲染状态如何解耦

### 阶段 9：性能分析与优化

目标：

- 学会定位性能瓶颈
- 建立性能预算意识

Harness：

- 批量生成 100、1000、5000 个对象
- 对比普通渲染与 `InstancedMesh`
- 对比不同贴图分辨率和阴影配置

必须掌握的问题：

- `draw calls`、`triangles`、纹理大小分别影响什么
- 什么时候该用实例化、LOD、裁剪和资源压缩

### 阶段 10：工程化与组件化

目标：

- 把实验代码升级为可维护工程
- 为后续业务应用建立组件沉淀能力

Harness：

- 把相机、灯光、模型加载、热点标注封装成模块
- 加入截图回归与关键交互校验
- 抽出统一的实验启动器

必须掌握的问题：

- 什么该封装成组件，什么该保留为实验代码
- 如何保证升级后不会破坏已有视觉结果

---

## 项目目录建议

建议单独建一个仓库或目录：

```text
web3d-harness-lab/
├── src/
│   ├── harness/
│   │   ├── createScene.ts
│   │   ├── createCamera.ts
│   │   ├── createRenderer.ts
│   │   ├── createLights.ts
│   │   ├── createGui.ts
│   │   ├── createStats.ts
│   │   └── bootstrapExperiment.ts
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
│   ├── assets/
│   │   ├── models/
│   │   └── textures/
│   └── main.ts
├── docs/
│   ├── experiment-template.md
│   ├── learning-notes.md
│   ├── performance-notes.md
│   └── troubleshooting.md
├── tests/
│   └── screenshots/
└── package.json
```

目录原则：

- `harness/` 存放通用实验基建
- `experiments/` 每个目录只验证一个主题
- `docs/` 存放结论和排障记录
- `tests/` 存放截图基线或自动验证脚本

---

## 每个实验的标准模板

每个实验建议都按下面结构执行。

### 1. 实验目标

- 这次只验证一个问题
- 问题必须可观察、可对比

示例：

- 比较 `MeshStandardMaterial` 和 `MeshPhysicalMaterial` 的视觉差异与成本
- 验证 `InstancedMesh` 对大批量物体渲染的收益

### 2. 输入变量

建议明确记录这些变量：

- 模型类型
- 面数规模
- 材质类型
- 光照数量
- 纹理尺寸
- 是否开启阴影
- 浏览器与设备环境

### 3. 控制面板

至少暴露：

- 开关型参数
- 连续型参数
- 用例切换

推荐使用：

- `lil-gui`

### 4. 指标采集

至少观察：

- `FPS`
- `draw calls`
- `triangles`
- 资源加载耗时
- 截图结果

### 5. 输出结论

每个实验结束时都要写：

- 观察到了什么现象
- 造成现象的原因是什么
- 适合在哪些业务场景使用
- 后续还要验证什么

---

## 12 周学习计划

| 周次 | 主题 | 交付物 |
|---|---|---|
| 第 1 周 | 最小场景、渲染循环、控制器 | `01-basic-scene` |
| 第 2 周 | 坐标系、矩阵、父子节点 | `02-transform-harness` |
| 第 3 周 | 几何体与 BufferGeometry | `03-geometry-harness` |
| 第 4 周 | 材质、贴图、PBR | `04-material-harness` |
| 第 5 周 | 光照、阴影、环境贴图 | `05-lighting-harness` |
| 第 6 周 | 模型加载与资源管理 | `06-gltf-loader-harness` |
| 第 7 周 | 交互拾取与业务标注 | `07-interaction-harness` |
| 第 8 周 | 动画、相机转场、状态管理 | `08-animation-harness` |
| 第 9 周 | 性能压测与优化实验 | `09-performance-harness` |
| 第 10 周 | `React Three Fiber` 组件化 | `10-r3f-harness` |
| 第 11 周 | 综合项目 1：3D 产品展示器 | 一个中型 Demo |
| 第 12 周 | 综合项目 2：设备运维可视化界面 | 一个带交互和性能报告的 Demo |

---

## 推荐项目练习顺序

| 项目 | 核心能力 | 难度 |
|---|---|---|
| 3D 产品展示器 | 模型加载、材质、热点标注、相机控制 | 入门 |
| 3D 房间漫游 | 场景组织、镜头移动、碰撞基础 | 中级 |
| 设备运维可视化 | 颜色状态联动、点击详情、告警标注 | 中级 |
| 园区 / 数字孪生 Demo | 大场景、LOD、性能治理、数据绑定 | 高级 |
| Web3D 编辑器 | 拾取、拖拽、变换控件、状态管理 | 高级 |

---

## 每日学习节奏

建议采用下面节奏：

- `1 小时学习`
- `1 小时实验`
- `20 分钟复盘`

具体执行方式：

- 学习：只看一个主题，不要一天吸收太多概念
- 实验：把新知识放进对应 Harness 中跑起来
- 观察：记录截图、FPS、加载耗时、异常现象
- 复盘：用 Markdown 写下结论和疑问
- 沉淀：把可复用代码抽到 `harness/`

---

## 起步安装建议

如果你要立即开始，推荐最小起步方案：

```bash
npm create vite@latest web3d-harness-lab -- --template vanilla-ts
cd web3d-harness-lab
npm install three lil-gui stats.js
```

如果你后续要转向组件化，再补：

```bash
npm install react react-dom @react-three/fiber @react-three/drei
```

---

## 第一个最小实验

第一个实验不要复杂，目标只设为：

- 能看到一个 3D 物体
- 能拖动视角
- 能看到 FPS
- 能改参数

最低配置：

- `BoxGeometry`
- `MeshStandardMaterial`
- `PerspectiveCamera`
- `DirectionalLight`
- `AmbientLight`
- `OrbitControls`
- `stats.js`
- `lil-gui`

当你完成这个实验后，要能明确回答：

- 为什么要有光源
- 为什么相机和物体位置都会影响可见结果
- 为什么 GUI 参数调整是学习速度放大器

---

## 验证标准

判断自己是否真正掌握一个 Web3D 知识点，不看“记住了多少 API”，而看能否完成下面几件事：

- 能独立搭一个最小实验
- 能解释实验现象
- 能调整变量并预测结果
- 能描述性能代价
- 能写出适用场景和限制

如果做不到这些，说明还停留在“会跟着教程写”的阶段。

---

## 常见误区

### 误区 1：一上来就做大项目

后果：

- 概念混杂
- 很难定位问题
- 代码会迅速失控

建议：

- 先用小实验拆掉复杂度

### 误区 2：只关注效果，不关注指标

后果：

- 不知道性能问题出在哪
- 无法量化优化收益

建议：

- 从第一天就看 `FPS`、`draw calls`、`triangles`

### 误区 3：只学框架封装，不学底层原理

后果：

- 能写业务组件，但遇到渲染问题就卡住

建议：

- 先用 `Three.js` 理解主线，再学 `React Three Fiber`

### 误区 4：不写实验结论

后果：

- 一周后忘记为什么当时这么做

建议：

- 每个实验必须配一段 Markdown 结论

---

## 建议的文档沉淀方式

建议后续至少维护这 3 份文档：

- `learning-notes.md`
  - 记录概念理解、关键结论、踩坑
- `performance-notes.md`
  - 记录各类优化实验与指标变化
- `troubleshooting.md`
  - 记录加载失败、材质异常、阴影问题、性能瓶颈等排障过程

---

## 一句话执行策略

你接下来学习 Web3D 时，不要问“下一个 API 是什么”，而要问：

> 我能不能为这个知识点搭一个最小 Harness，并通过现象、参数和指标真正掌握它？

---

## 下一步建议

建议按下面顺序启动：

1. 建一个 `web3d-harness-lab`
2. 完成 `01-basic-scene`
3. 给实验接入 `lil-gui` 和 `stats.js`
4. 写第一篇实验结论
5. 再进入 `transform / material / light / loader / performance`

当你把前 5 个实验做完，你就已经不是“会用 Three.js”，而是在建立自己的 `Web3D 工程知识系统` 了。
