# Git 分支与仓库初始化

## 主题定位

这一节聚焦 `handleGitBranch()` 和 `initGitEnv()` 前半段，解释平台如何把逻辑目标分支变成真实可执行仓库。

---

## 目标分支重写

`handleGitBranch()` 会把 `targetBranch` 改成 `${traceId}/${targetBranch}`。

这么做的原因是：

- 避免并发任务直接写同一分支
- 提供 trace 级隔离
- 方便回溯每次执行结果

---

## 仓库存在性判断

在初始化 Git 环境时，平台会先执行：

```bash
ls -a
```

如果发现已有 `.git`，就不再重复 clone；否则才进入 clone 流程。

---

## clone 目标仓库

平台会使用模板里的：

- `url`
- `sourceBranch`
- `destination`
- `pat`

去拉起工作仓。这里 clone 的不是临时仓，而是后续模型真实操作的代码仓。

---

## 小结

这一层做的是“把 Git 元数据和工作目录准备成一个真实项目现场”。
