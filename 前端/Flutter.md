# Flutter

## 定位

- 这份文档用于沉淀 Flutter 的学习笔记、环境知识、常见命令、问题排查和项目实践经验。
- 当前先收录一个正在使用的主题：`本地原地升级 Flutter 到 3.44.0`。

## 知识图谱

### 1. 环境与版本

- Flutter SDK
- Dart SDK
- Xcode / Android Toolchain
- CocoaPods
- PATH 配置
- `flutter doctor`

### 2. 工程与依赖

- `pubspec.yaml`
- `flutter pub get`
- `flutter clean`
- 多项目版本管理
- FVM

### 3. 开发与调试

- `flutter run`
- 热重载与热重启
- Widget 调试
- 日志与崩溃排查

### 4. 测试与验证

- `flutter test`
- Widget Test
- Golden Test
- 集成测试

### 5. 平台能力

- iOS 构建
- Android 构建
- Web / Desktop
- 原生桥接

---

## 本地原地升级到 Flutter 3.44.0

### 当前环境

- 当前 `flutter` 路径：`/Users/bytedance/Projects/SDK/flutter/bin/flutter`
- 当前版本：`Flutter 3.41.5`
- 当前 Dart：`3.11.3`
- 目标版本：`Flutter 3.44.0`

### 适用场景

- 适合你继续沿用当前 SDK 目录：`/Users/bytedance/Projects/SDK/flutter`
- 适合你明确知道自己是在维护一套固定 Flutter SDK，而不是为不同项目隔离多个版本
- 不适合对 SDK 目录里的本地提交特别敏感的场景

### 核心认知

- Flutter 本质上就是一个 Git 仓库，很多升级动作本质上是在切换分支、tag 或提交。
- 你当前这套 Flutter 是通过 Git 目录方式安装，不是 `brew` 管理。
- 所以“升级 Flutter”在你这里，本质上就是：
  1. 进入 Flutter SDK 目录
  2. 拉取远端 tag 和提交
  3. 切到目标版本
  4. 运行 `flutter doctor` 初始化工具链

### 升级步骤

#### 1. 进入 Flutter SDK 目录

```bash
cd /Users/bytedance/Projects/SDK/flutter
```

#### 2. 查看当前仓库状态

```bash
git status --short --branch
```

重点看两件事：

- 有没有未提交改动
- 当前分支是否和远端偏离很多

如果你只是学习和自用环境，这一步主要是为了心里有数。

#### 3. 拉取最新 tag 和远端信息

```bash
git fetch --all --tags
```

这一步会把 `3.44.0` 这类版本 tag 拉到本地。

#### 4. 切到目标版本

```bash
git checkout 3.44.0
```

如果成功，当前 SDK 就已经切到 `Flutter 3.44.0` 对应代码了。

#### 5. 初始化 SDK

```bash
bin/flutter doctor
```

第一次执行会做几件事：

- 校验 Flutter SDK
- 下载对应 Dart SDK
- 检查 Xcode / Android / CocoaPods
- 刷新缓存

#### 6. 验证版本

```bash
bin/flutter --version
```

预期看到：

```text
Flutter 3.44.0
```

---

## 升级后的验证流程

### 1. 验证 Flutter 和 Dart

```bash
flutter --version
```

重点检查：

- Flutter 是否为 `3.44.0`
- Dart 是否已经高于项目要求，例如覆盖 `3.11.5`

### 2. 验证本机开发环境

```bash
flutter doctor -v
```

重点看：

- Flutter SDK
- Xcode
- Android toolchain
- CocoaPods
- 可用设备

### 3. 回到项目验证依赖

```bash
cd "/Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/项目/日历"
flutter pub get
```

### 4. 验证测试是否能跑

```bash
flutter test
```

如果之前报的是 Dart 版本不满足，那么升级完成后，这一步应该能真正进入测试执行阶段。

---

## 常见问题

### 1. `flutter --version` 还是旧版本

先检查：

```bash
which flutter
```

如果输出的不是：

```text
/Users/bytedance/Projects/SDK/flutter/bin/flutter
```

说明你当前 shell 用的不是这套 SDK。

### 2. `git checkout 3.44.0` 失败

先执行：

```bash
git fetch --all --tags
git tag --list "3.44*"
```

确认本地已经拉到 `3.44.0`。

### 3. `flutter doctor` 很慢

正常现象，尤其是第一次切到新版本时，会下载缓存和工具链。

### 4. 升级后项目还是跑不起来

继续执行：

```bash
flutter clean
flutter pub get
flutter test
```

如果还不行，再往这几个方向排查：

- Xcode 或 Android 本地环境缺失
- CocoaPods 问题
- 项目依赖冲突
- 缓存未刷新

### 5. 原地升级的风险是什么

- 可能覆盖你当前 SDK 目录已有的本地上下文
- 如果你依赖当前 SDK 里的特殊分支或本地提交，切 tag 后可能改变行为
- 所以原地升级适合“你明确知道自己在切 SDK 仓库版本”的场景

---

## 最短命令清单

```bash
cd /Users/bytedance/Projects/SDK/flutter
git fetch --all --tags
git checkout 3.44.0
bin/flutter doctor
bin/flutter --version
```

然后回到项目：

```bash
cd "/Users/bytedance/Desktop/项目/know_fragments/AI重塑体系/项目/日历"
flutter pub get
flutter test
```

---

## 后续可继续补充的主题

- Flutter 环境安装与 PATH 管理
- Flutter 常用命令速查
- Flutter 测试体系
- Flutter 状态管理选型
- Flutter iOS 构建问题
- Flutter Android 构建问题
- Flutter 多项目版本管理与 FVM
