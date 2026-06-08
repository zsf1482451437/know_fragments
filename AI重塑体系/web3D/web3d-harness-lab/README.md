# web3d-harness-lab

这是一个用于学习和验证 `Web3D` 的实验型工程骨架。

目标不是直接做成单一产品，而是持续沉淀：

- 最小实验
- 通用基建
- 性能记录
- 结论文档

---

## 当前目录

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

## 下一步

建议按这个顺序继续：

1. 在当前目录初始化 `Vite + TypeScript`
2. 安装 `three`、`lil-gui`、`stats.js`
3. 完成 `01-basic-scene`
4. 抽公共逻辑到 `src/harness/`
5. 给每个实验补 `notes.md`

---

## 相关文档

- [Web3D-Harness-Engineering学习SOP](file:///Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/web3D/Web3D-Harness-Engineering学习SOP.md)
- [Web3D-学习路线版](file:///Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/web3D/Web3D-学习路线版.md)
- [Web3D-实验模板版](file:///Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/web3D/Web3D-实验模板版.md)
- [web3d-harness-lab-项目脚手架说明](file:///Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/web3D/web3d-harness-lab-项目脚手架说明.md)
