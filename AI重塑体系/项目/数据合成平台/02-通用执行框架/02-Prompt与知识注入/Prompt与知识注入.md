# Prompt 与知识注入层

## 模块定位

这一层对应：

- `service/instruction-follow/`
- `service/proxy/pipelines/common-framework-v1/knowledge/`
- `service/proxy/pipelines/common-framework-v1/nodes/generalize-prompt/`
- `service/proxy/pipelines/common-framework-v1/nodes/before-enter-trace/`

它负责在模型真正开始改代码之前，把“应该知道什么”和“应该怎么做”提前灌进去。

---

## 这一层的两种能力

这一层其实由两部分组成：

1. Prompt 协议生成。
2. Knowledge 知识注入。

前者决定模型的行为规范，后者决定模型的技术知识边界。

---

## 详细过程

### 1. 原始需求进入 generalizePrompt

模板 JSON 中的 `prompt` 往往只是一个需求种子，不一定足够细。

因此平台先会进入 `generalizePrompt` 阶段。

常见节点有：

- `add_tech_stack`
- `detailed_prompt`

### 2. `add_tech_stack`

该节点会根据 `question.techStack` 把技术栈描述追加到 prompt 中。

例如在 Flutter 场景下，会追加：

- 语言是 Dart
- 框架是 Flutter

这样模型在后续生成时能更明确约束目标技术栈。

### 3. `detailed_prompt`

该节点会再次调用模型，把原始需求泛化为更完整的产品描述。

通常会补足：

- 目标平台
- 核心页面
- 风格基调
- 关键交互
- 布局形态

这一步的本质是把“一个题目”改造成“一个更适合 Agent 执行的任务描述”。

### 4. 注册知识库对象

在 `registryKnowledge()` 中，平台会读取 `question.knowledge` 中的 id 列表，去知识库中找到对应类并注册到当前上下文。

例如 Flutter 相关任务可能会启用：

- `flutter_sdk`
- `dart_lang`
- `flutter_riverpod`
- `flutter_behavior_pattern`

### 5. initConversation 组装对话

引擎随后会进入 `initConversation()`，把以下内容按顺序组装起来：

1. 平台级 system 规则
2. 工具调用规范
3. 不要自行启动服务等约束
4. 技术栈描述
5. 所选 knowledge 的文本内容
6. 当前目录结构
7. 用户最终需求 prompt

这一步完成后，模型拿到的就不是一个孤立 prompt，而是一整套上下文环境。

### 6. 根据 toolFormat 生成不同协议 Prompt

如果是：

- `nfc`，会生成 NFC 风格系统对话
- `xml`，会生成 XML 风格对话
- `json`，会生成 JSON 风格对话

这意味着平台不是单一 prompt 模式，而是“协议化 prompt 构造器”。

### 7. beforeEnterTrace 再补系统约束

在进入主循环前，平台还会跑 `beforeEnterTrace` 阶段。

这里常见动作包括：

- 注入 thinking prompt
- 替换 workDir
- 载入已有 messages
- 注入额外工具

因此模型真正开始执行前，会经历两轮上下文加工：

- 第一轮：generalize prompt
- 第二轮：before-enter-trace 注入运行态约束

---

## 这一层的价值

这层的本质是在做“模型工作面准备”。

它解决的是：

- 需求太粗，先细化
- 技术栈不清楚，先补足
- 模型不知道项目约束，先告诉它
- 模型不知道工具协议，先规范它
- 模型不知道领域知识，先注入它

如果没有这一层，模型虽然也能生成内容，但稳定性、可控性和贴合度都会明显下降。
