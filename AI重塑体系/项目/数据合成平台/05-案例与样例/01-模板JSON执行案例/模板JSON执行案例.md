# 模板 JSON 执行案例

## 案例对象

这里以：

- `service/proxy/debug/datas/CommonFrameworkV1.json`

为例，梳理一份模板 JSON 如何在平台中完整跑通。

---

## 输入配置大意

这份模板描述的是一个 Flutter 场景任务，核心字段包括：

- `type = repo`
- `toolFormat = nfc`
- `nfcVersion = v3`
- `techStack.framework = flutter`
- `techStack.lang = dart`
- `targetPlatform = web`
- `modelCall.source = seed-psm`
- `knowledge = flutter_sdk / dart_lang / flutter_riverpod / flutter_behavior_pattern`
- `steps` 指定了每个生命周期启用的节点
- `sandbox` 指定使用 VKE 沙箱
- `git` 指定代码仓和目标分支

---

## 详细执行过程

### 1. 调试脚本读取模板

本地调试时，`service/proxy/debug/index.js` 会读取这份 JSON，并发给：

- `POST /api/proxy/execute`

此时：

- `method = CommonFrameworkV1`
- `question = 整份 JSON 的字符串`

### 2. 平台选择 `CommonFrameworkV1`

入口层把请求交给 `ProxyService`，后者根据 `method` 选中 `CommonFrameworkV1` 这条 pipeline。

### 3. 初始化任务状态

引擎读取模板后，会：

- 初始化 `state`
- 注入监控节点
- 建立 trace id
- 准备 `messages` 与 `extra`

### 4. 载入知识与节点

平台根据模板中的：

- `knowledge`
- `steps`

选择本次任务要启用的知识和节点。

这意味着模板 JSON 不只是“输入参数”，它实际上定义了本次执行链路。

### 5. 泛化需求

`generalizePrompt` 阶段会先：

- 补 Flutter/Dart 技术栈描述
- 再把原始 prompt 泛化成更完整的需求文本

因此模型真正看到的需求，通常比模板里的原始 prompt 更细、更具体。

### 6. 申请 VKE 沙箱

平台会根据：

- `sourceToken`
- `spec = 2c4g`
- `image`
- `ttl`

申请远端 VKE 沙箱。

后续所有命令和工具执行都发生在这里。

### 7. 初始化 Git 仓库

平台会：

1. clone 指定代码仓
2. 执行默认初始化命令
3. 执行模板中定义的 `initCommandList`

当前模板中的初始化命令会把工作区除 `.git` 外全部删空，等于保留 Git 关系、重建工作区。

### 8. 构造对话上下文

平台会把：

- 协议规则
- 技术栈
- Flutter 构建要求
- 目录结构
- 知识文本
- 用户需求

组装成 NFC v3 风格的 Agent 对话。

### 9. 模型进入 Agent 循环

`seed-psm` 模型会不断输出工具调用。

平台执行过程是：

1. 调模型
2. 解析工具调用
3. 在沙箱执行工具
4. 回填工具结果
5. 再调模型

直到模型调用 `finish`。

### 10. 自动代码修复

在模型输出之后，如果发现本轮写了 `.dart` 文件，平台会自动执行：

- `dart fix --apply`
- `dart format lib test`

这是框架层对 Dart 代码质量的自动兜底。

### 11. 启动与构建

因为模板中的 `targetPlatform = web`，所以后置阶段会按 Flutter Web 路径处理：

- `flutter build web --release`
- 启动 `build/web` 静态服务

虽然场景描述是移动端语义，但平台真正的执行模式以 `techStack.targetPlatform` 为准。

### 12. 执行 checker

当前模板启用了两个 checker：

- `dart_analyze`
- `flutter_build`

前者负责静态分析，后者负责真实构建验证，并都会输出 signal 分数。

### 13. 生成并执行 Flutter 测试

平台会：

1. 让模型探索仓库并生成 Widget Test
2. 把测试写入 `test/flutter_widget_test.dart`
3. 真实执行 `flutter test`
4. 如果失败，把错误喂回模型继续修复
5. 最终再正式跑一次测试并统计通过率

### 14. 最终提交 Git

在 `beforeFinish` 阶段，平台会：

- 汇总监控数据
- `git add`
- `git commit`
- `git push`

并把目标分支改造成带 trace 前缀的新分支，避免并发任务冲突。

### 15. 结果写回 Redis

最终返回结果包含：

- 本次 trace id
- 对话消息
- 处理后的 question
- 状态与错误信息
- pass_rate 与 checker 信号

同时结果也会写入 Redis，供轮询接口获取。

---

## 这个案例说明了什么

这份模板很好地体现了平台的真实工作方式：

- 不是一次性生成文本
- 而是配置驱动的 Agent 编排
- 中间依赖真实沙箱与真实仓库
- 最终要经过构建、测试、提交才能算完成

因此模板 JSON 在这里不是“参数对象”，而更像是一份“任务编排说明书”。
