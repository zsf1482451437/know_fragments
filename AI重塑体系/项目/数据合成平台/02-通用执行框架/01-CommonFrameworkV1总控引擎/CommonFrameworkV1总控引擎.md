# CommonFrameworkV1 总控引擎

## 模块定位

这一层对应：

- `service/proxy/pipelines/common-framework-v1/index.ts`
- `service/proxy/pipelines/common-framework-v1/core/engine.ts`
- `service/proxy/pipelines/common-framework-v1/types.ts`

它是整个数据合成平台里最核心的通用执行引擎。

如果 `ProxyService` 解决的是“把任务交给哪条产线”，那么 `CommonFrameworkV1` 解决的是“这条产线内部如何一步步跑完”。

---

## 核心思想

`CommonFrameworkV1` 不是一条写死逻辑的脚本，而是一个由配置驱动的生命周期框架：

- `question` 描述任务目标
- `knowledge` 选择知识注入内容
- `steps` 决定生命周期里跑哪些节点
- `techStack` 决定技术栈
- `sandbox` 决定执行环境
- `git` 决定代码仓来源和目标分支
- `modelCall` 决定模型来源与参数

这使得同一个引擎可以服务于不同技术栈、不同目标、不同场景。

---

## 详细过程

### 1. pipeline.process() 作为外层壳

`index.ts` 中的 `process()` 很薄，主要是把 `question` 交给 `CoreEngine.execute()` 执行，并返回最终结果。

这说明：

- pipeline 自身只是入口
- 真正的执行核心都沉到了 `core/engine.ts`

### 2. initState：初始化运行态

在执行开始时，引擎会调用 `initState(question)`。

这一阶段主要完成：

- 规范化 `question`
- 初始化 `messages`
- 初始化 `toolCall` / `toolCallResult`
- 初始化 `agentInvokeResult`
- 初始化 `extra.checkSignal`
- 初始化 `processMonitorData`

同时还会做一些规则补充：

- 非 `nfc` 格式会强制改用 `nfcVersion = v2`
- 如果开启 `enableMonitor`，自动插入监控节点
- 如果模型来源是 `seed-psm`，会在合适位置补 thinking prompt

### 3. processPipelineInput：兼容产线串联输入

如果当前输入不是原始 question，而是上一条产线的输出结果，那么引擎会根据 `strategy` 做二次处理。

这一步解决的是“多产线串联”的场景，例如：

- 先生成基础结果
- 再对结果做 style-fix
- 或者再做 query-add

也就是说，`CommonFrameworkV1` 不只能处理第一手输入，也能吃其他 pipeline 的结果。

### 4. 生成 trace id

引擎会基于：

- prompt
- scene
- type
- 当前时间
- 随机数

生成一个唯一 trace id。

这个 id 会贯穿：

- Git 目标分支前缀
- 监控数据
- 本次执行会话标识

### 5. 注册 knowledge 与 nodes

引擎会调用：

- `registryKnowledge(this)`
- `registryNodes(this)`

这一步是整个框架可配置化的关键。

它不是硬编码“下一步一定做什么”，而是：

- 从 question 读取知识 id
- 从 question 读取生命周期节点 id
- 在运行时动态拼出本次执行链路

### 6. generalizePrompt：执行前置泛化

在真正进入代码生成前，引擎会先触发 `Steps.GeneralizePrompt`。

这通常负责做两类事：

- 补技术栈描述
- 把原始需求泛化成更完整的需求

如果这个阶段直接返回 `exit`，说明本次任务只需要做泛化，不需要继续进入后续执行。

### 7. 创建沙箱与初始化 Git

随后进入环境准备阶段：

1. `createMarsSandboxSession()`
2. `initGitEnv()`

这一步把“抽象任务”落到“真实可执行仓库”。

### 8. initConversation：构造模型上下文

引擎会把：

- 系统规则
- 工具协议
- 技术栈信息
- 知识文本
- 当前目录结构
- 用户需求

组装成完整对话，供模型进入 Agent 模式。

### 9. executeActionSequence：进入主执行循环

这是引擎最重要的阶段。

大体流程是：

1. 执行 `beforeEnterTrace`
2. 如果还没 finish，则调用模型
3. 解析模型工具调用
4. 执行工具
5. 把工具结果追加进消息
6. 重复直到 `state.isFinish = true`
7. finish 后再执行后置阶段

### 10. 后置阶段串行执行

当主循环结束后，引擎会依次触发：

- `startService`
- `commonChecker`
- `genUnitTest`
- `runUnitTest`
- `beforeFinish`

也就是说，模型完成代码修改只是“前半程”，后半程还要靠框架去完成真实验证与收尾。

### 11. computeSignal：汇总评分

不同 checker 会把自己的信号值写入 `extra.checkSignal`。

引擎最后会把它们平均成：

- `extra.pass_rate`

这让平台具备了统一的质量打分能力。

### 12. releaseSession：释放沙箱

无论成功还是失败，最终都会进入 `finally`，尝试回收沙箱会话。

这样可以避免资源长期占用。

---

## 为什么它是平台核心

`CommonFrameworkV1` 的价值不在于它“会生成代码”，而在于它把下面这些事情统一进了一个框架：

- 输入规范化
- 生命周期编排
- 知识注入
- 环境准备
- 模型驱动
- 工具执行
- 质量校验
- 测试执行
- 结果收尾

它更像一个“合成任务操作系统”，而不是单个任务脚本。
