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

## Flutter 项目检测流程

### 使用前先确认设备

先执行：

```bash
flutter devices
```

这条命令用于查看当前可运行设备，例如：

- iOS Simulator
- Android Emulator
- 已连接真机

如果存在多个设备，推荐显式指定设备：

```bash
flutter run -d 设备id
```

这样可以避免 Flutter 默认选错目标设备。

### iOS（Mac）

推荐流程：

```bash
open -a Simulator
flutter run
```

更稳妥的做法是：

```bash
flutter devices
flutter run -d 设备id
```

适用说明：

- `open -a Simulator` 用于先启动 iOS 模拟器
- 模拟器启动后，再执行 `flutter run`
- 如果本机同时有多个 Apple 相关设备或目标，优先用 `flutter run -d 设备id`

### Android

推荐流程：

1. 打开 Android Studio
2. 进入 `Device Manager`
3. 启动目标模拟器
4. 回到项目目录执行 `flutter run`

更稳妥的做法同样是：

```bash
flutter devices
flutter run -d 设备id
```

适用说明：

- 先在 Android Studio 中把模拟器真正启动起来
- 再让 Flutter 去识别设备并执行运行
- 如果同时连接多个 Android 设备，也应优先指定 `设备id`

### 最短检测命令

#### iOS

```bash
open -a Simulator
flutter devices
flutter run -d 设备id
```

#### Android

```bash
flutter devices
flutter run -d 设备id
```

### 检测时的判断顺序

- 先确认模拟器或真机是否已经启动
- 再执行 `flutter devices` 看 Flutter 是否识别到设备
- 最后执行 `flutter run -d 设备id`

如果 `flutter devices` 看不到目标设备，优先排查：

- iOS Simulator / Android Emulator 是否真的启动完成
- Xcode / Android Studio 对应工具链是否正常
- 设备是否被其他进程占用

---

## Flutter 项目最小排查 SOP

### 适用场景

- 新拉一个 Flutter 项目后，想快速判断本机能不能跑
- 项目突然跑不起来，想按最小顺序排查
- 不想一上来就到处试命令，希望先走一套固定流程

### 最小排查顺序

#### 1. 先看本机环境

```bash
flutter doctor -v
```

先确认这些是否正常：

- Flutter SDK
- Dart SDK
- Xcode
- Android toolchain
- CocoaPods

如果这里已经报红，先不要急着进项目目录，优先把环境问题处理掉。

#### 2. 进入项目目录并拉依赖

```bash
cd "你的 Flutter 项目目录"
flutter pub get
```

这一步主要确认：

- `pubspec.yaml` 没有明显问题
- 依赖可以正常解析
- 当前 Flutter / Dart 版本能满足项目约束

如果这里失败，优先看：

- Dart 版本是否满足项目要求
- 网络或镜像问题
- `pubspec.yaml` 依赖冲突

#### 3. 确认可运行设备

```bash
flutter devices
```

这一步用于判断：

- 模拟器或真机是否真的被 Flutter 识别
- 当前是否存在可运行目标

如果没有设备，按前面的“Flutter 项目检测流程”去启动 iOS 或 Android 模拟器。

#### 4. 指定设备运行项目

```bash
flutter run -d 设备id
```

推荐始终显式指定 `设备id`，这样排查更稳定，尤其适合：

- 同时开了多个模拟器
- 同时连着真机和模拟器
- 不想让 Flutter 自动选错设备

#### 5. 验证测试是否可执行

```bash
flutter test
```

这一步主要看：

- 项目是否能进入测试阶段
- 是否存在依赖、版本、初始化或测试代码层面的报错

如果 `flutter run` 能跑但 `flutter test` 失败，说明问题更可能在：

- 测试代码本身
- 测试环境初始化
- 依赖版本与测试框架兼容性

### 一条日常检查链路

日常最推荐直接按这条顺序执行：

```bash
flutter doctor -v
cd "你的 Flutter 项目目录"
flutter pub get
flutter devices
flutter run -d 设备id
flutter test
```

### 最小判断逻辑

- `flutter doctor -v` 失败：先修环境，不要急着看项目
- `flutter pub get` 失败：先看版本约束和依赖解析
- `flutter devices` 看不到设备：先启动模拟器或检查真机连接
- `flutter run -d 设备id` 失败：再看运行日志、平台配置和工程问题
- `flutter test` 失败：优先定位测试环境或测试代码

### 排查失败时的补救命令

如果问题不明确，可以再补一轮基础清理：

```bash
flutter clean
flutter pub get
flutter run -d 设备id
flutter test
```

这套命令适合处理：

- 缓存未刷新
- 构建中间产物异常
- 切换 Flutter 版本后残留旧状态

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
