# yarn

## 查看当前的镜像源：

```
yarn config get registry
```

## 修改为淘宝镜像源：

```
yarn config set registry http://registry.npm.taobao.org
```

## 查看有效配置：

```
yarn config -v
```

## 疑问

**1.为什么执行 `yarn add xxx` 也会有project valid、resolution、fetch、link这些step？**

Yarn 包管理器会执行一系列步骤来确保顺利安装所需的包，并处理依赖关系。以下是这些步骤的简要说明：

1. **Project Validation（项目验证）**：Yarn 首先会验证项目根目录下的 `package.json` 文件，并检查是否存在有效的项目配置。这个步骤是为了确保你在正确的项目目录下执行命令，并且项目配置正确。
2. **Resolution（依赖解析）**：Yarn 接下来会解析你要安装的包（例如 `xxx`）及其版本号，并确定所需的依赖关系。它会检查项目的 `yarn.lock` 文件（如果存在）以获取准确的依赖版本，并确保解析的依赖关系与当前项目的其他部分兼容。
3. **Fetch（依赖下载）**：一旦依赖解析完成，Yarn 将开始从网络上下载所需的包及其依赖项。它会检查本地缓存，如果已经下载过这些包，就会直接使用缓存，否则会从远程仓库下载它们。
4. **Link（依赖链接）**：在下载完成后，Yarn 会将这些包链接到项目的 `node_modules` 目录中。这意味着它会在正确的位置创建符号链接，以使这些包可以被项目的其他部分引用。

这些步骤的目的是确保包的正确安装，并处理依赖关系以避免冲突或版本不兼容的问题。此外，执行这些步骤还可以提高包的安装速度，因为它们允许 Yarn 在安装过程中利用缓存和链接的特性。

# node

## nrm

- `nrm ls`：列出当前可用的注册表。
- `nrm use <registry>`：切换到指定的注册表。
- `nrm add <registry> <url>`：添加一个自定义的注册表。
- `nrm del <registry>`：删除指定的注册表。

nrm 是一个用于管理 Node.js 包管理器（如 npm 和 Yarn）的注册表（registry）的工具。

## nvm

**node version manger**

查询当前已安装

```
nvm list
```

下载指定版本

```
nvm install xxx
```

使用指定版本

```
nvm use xxx
```

### 疑难杂症

**nvm use xxx, node -v不生效**



# package.json

## 格式化脚本

```json
"prettify": "prettier --write \"src/**/*.ts\" \"src/**/*.tsx\" \"src/**/*.js\""
```

自动格式化 `src` 目录下的所有 `.ts`、`.tsx` 和 `.js` 文件

## 获取最新依赖



# lodash

## **sortedByUniqBy**

排除了经过**迭代函数**处理后相等的相邻元素，同时保留第一个出现的元素。该方法会先对数组进行排序，然后再进行处理。

```js
const ff = [{label: 'aaa',value: 'A'},{label: 'aaa1',value: 'A'},{label: 'bbb',value: 'B'}]
_.sortedUniqBy(ff, (i) => i.value)
// 返回
{label: 'aaa', value: 'A'}
{label: 'bbb', value: 'B'}
```

对于下拉菜单的**options**，**value要唯一**；

对于不唯一的数据，有三种思路处理：

- 数据库去重；
- 后端去重；
- 前端去重；

# 疑难杂症

## @sentry/cli

执行yarn，link步骤出现 `@sentry/cli@npm:1.75.2 couldn't be built successfully (exit code 1, logs can be found here: D:\temp\xfs-0d7a820d\build.log)`

```
[sentry-cli] Downloading from https://downloads.sentry-cdn.com/sentry-cli/1.75.2/sentry-cli-Windows-x86_64.exe
Error: Unable to download sentry-cli binary from https://downloads.sentry-cdn.com/sentry-cli/1.75.2/sentry-cli-Windows-x86_64.exe.
Error code: ECONNRESET
```

**解决**：

发现是**@sentry/webpack-plugin**依赖了**@sentry/cli**

1.根目录下新建.yarnrc

```
npmRegistryServer: "http://registry.npm.taobao.org/"
strict-ssl: false
```

单独安装@sentry/webpack-plugin

```
yarn add @sentry/webpack-plugin@1.18.9
```

## playwright安装慢

执行yarn，link 步骤第三方库playwright安装慢

### 