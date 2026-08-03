# ProxyService 与任务调度

## 模块定位

这一层对应 `service/proxy/index.ts`，是平台的统一任务调度中心。

如果说 Controller 只是“把请求交进来”，那么 `ProxyService` 才开始真正理解一条任务如何被执行、如何缓存、如何返回。

---

## 核心职责

`ProxyService` 主要做 5 件事：

1. 维护 pipeline 注册表。
2. 解析请求中的 `question`。
3. 根据 `method` 选择 pipeline。
4. 执行 pipeline 并缓存结果。
5. 提供任务结果读取能力。

---

## 详细过程

### 1. 维护 pipelineMap

Controller 在请求进入时，会持续调用：

- `registerPipeline(method, pipeline)`

把所有可执行 pipeline 注册进去。

因此 `ProxyService` 内部维护了一张：

- `method -> pipeline 实例`

的映射表。

这让平台具备了统一调度能力：

- 外部只认字符串 `method`
- 内部再把它翻译成真正的执行对象

### 2. 接收并记录任务上下文

`execute(body)` 开始时，会记录：

- `uuid`
- `biz_id`
- `biz_sub_id`
- `dag_runtime_id`

这些信息随后会被注入到 LLM proxy 上下文里，便于后续日志、监控、调用链透传。

### 3. 写入运行中状态

如果本次任务带 `uuid`，平台会先把：

- `[sandbox]{uuid} = doing`

写入 Redis。

这一步表示任务已经被受理并进入执行中。

### 4. 解析 method 与 question

`ProxyService` 会先对 `method` 做一次拆分：

- `mainMethod`
- `subMethod`

随后对 `question` 做 JSON 解析：

- 如果 `body.question` 是 JSON 字符串，则转成对象
- 如果解析失败，则回落为 `{}`

最终交给 pipeline 的并不是原始字符串，而是结构化对象。

### 5. 调用 pipeline.process()

找到 `pipelineMap.get(mainMethod)` 后，平台会调用：

- `pipeline.process({ ...body, subMethod, question })`

从这一刻开始，任务正式进入某条 pipeline 的领域逻辑。

### 6. 处理成功结果

如果 pipeline 正常执行完成，并且本次任务带 `uuid`，平台会：

1. 把最终结果序列化成字符串
2. 写入 `[sandbox]{uuid}`
3. 写入 `[sandbox]{uuid}_status = true`

说明任务已经成功完成。

### 7. 处理失败结果

如果 pipeline 执行抛错，并且带 `uuid`，平台会：

1. 把错误信息写入 `[sandbox]{uuid}`
2. 写入 `[sandbox]{uuid}_status = false`

说明任务失败，但平台仍然会输出可查询结果，而不是让任务直接“消失”。

---

## Redis 缓存策略

### 大结果分片写入

`ProxyService.setCache()` 并不是把整段结果一次性写进 Redis，而是按最大长度切块。

做法是：

1. 计算结果需要切成多少块
2. 依次写入 `${key}_0`, `${key}_1`, `${key}_2` ...
3. 再用主 key 保存 chunk 数量

这样做是为了规避大对象写入 Redis 时的长度限制和稳定性问题。

### 结果读取时重组

轮询结果时，平台会：

1. 先读取主 key，拿到 chunk 数量
2. 再依次读取每个分片
3. 拼回完整字符串

对外部调用者来说，拿到的依旧是完整结果；分片是平台内部实现细节。

---

## 结果查询过程

`getSynthesisResult(uuid)` 的读取逻辑是：

1. 先读 `[sandbox]{uuid}_status`
2. 如果没有状态，说明任务仍在运行
3. 如果状态是 `true`，说明成功
4. 如果状态是 `false`，说明失败
5. 再把 `[sandbox]{uuid}` 里的内容作为最终 answer 返回

因此，外部系统可以稳定地得到三态结果：

- Running
- Success
- Failed

---

## 这一层的作用

`ProxyService` 的意义在于把“执行”和“服务”连接起来：

- 往上承接 HTTP 请求
- 往下调用 pipeline
- 中间用 Redis 提供异步结果缓存

没有这一层，整个系统会退化成一堆只能本地触发的脚本；有了这一层，才真正具备平台调度能力。
