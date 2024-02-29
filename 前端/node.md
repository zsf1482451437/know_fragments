# yarn

## 常见命令

### 查看哪些模块依赖了xxx

```bash
yarn why xxx
```

npm：

```bash
npm ls xxx
```



### 查看当前的镜像源：

```
yarn config get npmRegistryServer
```

### 修改为淘宝镜像源：

```
yarn config set npmRegistryServer https://registry.npm.taobao.org
```

### 查看有效配置：

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

## 疑难杂症

yarn执行 `eslint ./src/**`

### spawn ENAMETOOLONG

通常发生在文件路径超过操作系统允许的最大长度时。在这种情况下，它可能是由于 `eslint ./src/**` 命令尝试匹配的文件数量太多

### ETIMEDOUT 

> ➤ YN0000: ┌ Resolution step
> ➤ YN0001: │ RequestError: connect ETIMEDOUT 104.16.3.35:443
>     at ClientRequest.<anonymous> (D:\workspace\pp\pro\b_d\app\client\.yarn\releases\yarn-3.5.1.cjs:195:14340)
>     at Object.onceWrapper (node:events:629:26)
>     at ClientRequest.emit (node:events:526:35)
>     at o.emit (D:\workspace\pp\pro\b_d\app\client\.yarn\releases\yarn-3.5.1.cjs:190:90286)
>     at TLSSocket.socketErrorListener (node:_http_client:501:9)
>     at TLSSocket.emit (node:events:514:28)
>     at emitErrorNT (node:internal/streams/destroy:151:8)
>     at emitErrorCloseNT (node:internal/streams/destroy:116:3)
>     at process.processTicksAndRejections (node:internal/process/task_queues:82:21)
>     at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1495:16)
> ➤ YN0000: └ Completed in 1m 33s
> ➤ YN0000: Failed with errors in 1m 33s

访问不了国外的库源，切换库源切换成淘宝镜像：

```bash
yarn config set npmRegistryServer https://registry.npm.taobao.org
```

### No candidates found

错误信息：

> $ yarn add design-system@2.1.30
> ➤ YN0000: ┌ Resolution step
> ➤ YN0001: │ Error: design-system@npm:2.1.30: No candidates found
>     at ge (D:\workspace\pp\pro\b_d\app\client\.yarn\releases\yarn-3.5.1.cjs:439:8124)
>     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
>     at async Promise.allSettled (index 149)
>     at async io (D:\workspace\pp\pro\b_d\app\client\.yarn\releases\yarn-3.5.1.cjs:390:10398)
> ➤ YN0000: └ Completed in 1s 901ms
> ➤ YN0000: Failed with errors in 1s 911ms

### remote archive doesn't match

执行yarn，控制台报错：

> question:➤ YN0018: │ @babel/preset-env@npm:7.22.9: The remote archive doesn't match the expected checksum

yarn.lock文件指定的版本和预期版本冲突，删掉yarn.lock重新yarn

### @sentry/cli

执行yarn，link步骤出现 `@sentry/cli@npm:1.75.2 couldn't be built successfully (exit code 1, logs can be found here: D:\temp\xfs-0d7a820d\build.log)`

```
[sentry-cli] Downloading from https://downloads.sentry-cdn.com/sentry-cli/1.75.2/sentry-cli-Windows-x86_64.exe
Error: Unable to download sentry-cli binary from https://downloads.sentry-cdn.com/sentry-cli/1.75.2/sentry-cli-Windows-x86_64.exe.
Error code: ECONNRESET
```

**解决**：

发现是**@sentry/webpack-plugin**依赖了**@sentry/cli**

单独安装@sentry/webpack-plugin

```
yarn add @sentry/webpack-plugin@1.18.9
```

### postcss.plugin was deprecated.

执行yarn start，终端提示：`postcss-resolve-url: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`

项目中并没有用到postcss-resolve-url模块或插件；

postcss 8.4.31存在这个问题，跟换版本，建议最新版。

### Nested CSS was detected

执行yarn start，终端提示：`Nested CSS was detected, but CSS nesting has not been configured correctly`

这是因为项目中的某个模块使用了css嵌套，但是配置不正确

> postcss.config.js

```js
/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss/nesting"),
    require("tailwindcss"),
    require("autoprefixer"),
  ],
};

module.exports = config;
```

> tailwind.config.js

```js
export const plugins = [require("tailwindcss/nesting")];
```

重启。

参考

https://github.com/tailwindlabs/tailwindcss/discussions/7035

# node

>  知识体系一览

```bash
Node.js
├── 基础知识
│   ├── JavaScript 基础
│   ├── Node.js 模块系统
│   ├── 全局对象和变量
│   └── 事件驱动编程
├── 核心模块
│   ├── 文件系统（fs）
│   ├── HTTP
│   ├── 路径（path）
│   ├── 操作系统（os）
│   ├── 命令行参数（process）
│   ├── 缓冲区（Buffer）
│   └── 更多...
├── 异步编程
│   ├── 回调函数
│   ├── Promise
│   ├── async/await
│   └── 事件与事件触发器
├── Web 开发
│   ├── Express 框架
│   ├── Koa 框架
│   ├── RESTful API
│   ├── WebSocket
│   ├── 模板引擎
│   ├── 身份验证和授权
│   └── 更多...
├── 数据库集成
│   ├── MySQL
│   ├── MongoDB
│   ├── PostgreSQL
│   ├── Redis
│   ├── SQLite
│   └── ORM（对象关系映射）
├── 包管理工具（npm）
│   ├── 安装和使用包
│   ├── 创建和发布包
│   ├── 包的版本管理
│   ├── 包的依赖管理
│   └── 更多...
├── 调试和测试
│   ├── Node.js 调试器
│   ├── 单元测试
│   ├── 集成测试
│   ├── 基准测试
│   └── 更多...
├── 安全性和认证
│   ├── 常见安全问题
│   ├── 加密和哈希
│   ├── 认证和授权
│   ├── CSRF 防御
│   └── 更多...
├── 性能优化
│   ├── 代码优化
│   ├── 内存管理
│   ├── 并发和并行
│   ├── 缓存和CDN
│   └── 更多...
├── 部署和容器化
│   ├── 部署到服务器
│   ├── Docker 容器化
│   ├── 使用 Kubernetes
│   ├── 自动化部署
│   └── 更多...
├── Serverless 架构
│   ├── 什么是 Serverless
│   ├── AWS Lambda
│   ├── Azure Functions
│   ├── Google Cloud Functions
│   └── 更多...
├── RESTful API
│   ├── 设计原则
│   ├── 路由和控制器
│   ├── 数据验证
│   ├── 错误处理
│   └── 更多...
├── GraphQL
│   ├── GraphQL 查询语言
│   ├── 构建 GraphQL API
│   ├── 数据解析和验证
│   ├── 客户端集成
│   └── 更多...
├── 开发工具和工作流
│   ├── ESLint
│   ├── Prettier
│   ├── Webpack
│   ├── Babel
│   ├── Nodemon
│   └── 更多...
└── 社区和资源
    ├── 官方文档和教程
    ├── 博客和论坛
    ├── 开源项目
    ├── 示例代码
    └── 更多...
```



## 基础知识

```bash
基础知识
├── JavaScript 基础
│   ├── 数据类型
│   ├── 变量和作用域
│   ├── 运算符
│   ├── 控制流程
│   ├── 函数
│   ├── 对象和原型
│   ├── 数组
│   ├── 异常处理
│   └── ES6+ 新特性
├── Node.js 模块系统
│   ├── CommonJS 规范
│   ├── 内置模块和第三方模块
│   ├── 模块路径解析
│   └── 模块的循环依赖
├── 全局对象和变量
│   ├── global 对象
│   ├── process 对象
│   ├── __dirname 和 __filename
│   ├── module 和 exports
│   └── 其他常用全局变量
└── 事件驱动编程
    ├── EventEmmitter 类
    ├── 事件监听器和触发器
    ├── 自定义事件
    └── EventEmitter 的继承和使用
```

### Node.js 模块系统

```bash
├── Node.js 模块系统
│   ├── CommonJS 规范
│   ├── 内置模块和第三方模块
│   ├── 模块路径解析
│   └── 模块的循环依赖
```

#### CommonJS 规范

- 导出
- 导入
- exports和module.exports

> 导出

可以使用exports或module.exports导出模块成员（对象，函数，其他值）

模拟下模块的**导出行为**

```js
function require(/* ... */) {
  const module = { exports: {} };
  ((module, exports) => {
    // Module code here. In this example, define a function.
    function someFunc() {}
    exports = someFunc;
    // At this point, exports is no longer a shortcut to module.exports, and
    // this module will still export an empty default object.
    module.exports = someFunc;
    // At this point, the module will now export someFunc, instead of the
    // default object.
  })(module, module.exports);
  return module.exports;
}
```

rquire()接收一个参数（通常是路径），创建一个名为**module**的对象，并初始化其export属性为空对象；

使用立即执行函数 `(module, exports) => (...)` 将**module** 和 **module.exports**作为参数传进去。在这立即执行函数中，可以编写**模块的实际代码**;

这个例子中，定义了一个函数someFunc()，然后将exports 赋值为 someFunc。需要注意的是，这里的exports只是一个形参，它与外部的exports对象没有任何关联；

接着，将module.exports 赋值为 someFunc。这样，module.exports现在指向了someFunc，而**不再是空对象**；

最后，返回module.exports，实际上是返回了经过修改后的module.exports对象。

也就是说，当exports被重新分配时，它不再是module.epxports的一个引用，而是一个独立的变量。因此，重新分配exports并不会影响到module.exports

> 导入

可以使用require()导入模块

> 综合案例

math.js

```js
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

module.exports = {
  add,
  subtract,
};

module.exports.default = multiply;  // 设置默认导出
```

app.js

```js
const { default: multiply, add, subtract } = require('./math');

console.log(add(5, 3));             // 输出：8
console.log(subtract(10, 7));       // 输出：3
console.log(multiply(4, 6));        // 输出：24
```

> exports和module.exports区别

可以说exports是module.exports的**快捷方式**，`module.exports.f = ...`  可以写成 `exports.f` ,但是注意，和任何变量一样，**如果将新值分配给export，则它不再是module.exports的引用;**

看个案例

```js
module.exports.hello = true; // 这模块导出了一个对象 { hello: true }
console.log(exports); // { hello: true }

exports = { hello: false }; // exports分配新值，不再绑定module.exports
exports.hello = 1;
console.log(exports); // { hello: 1 }
console.log(module.exports); // 所以还是{ hello: true }
```

当 `module.exports` 属性被一个新对象完全替换时，`exports` 对象会失去与 `module.exports` 的引用关系，并被重新分配为一个空对象 `{}`。这意味着对 `exports` 对象的修改不会再影响到 `module.exports`，因为它们不再指向同一个对象。

```js
// moduleA.js
module.exports = {
  greet: 'Hello'
}; // 被一个新对象完全替换
exports.foo = 'World'; // exports对象失去与 module.exports 的引用关系
console.log(module.exports); // 输出: { greet: 'Hello' }
console.log(exports); // 输出: { foo: 'World' }
```

反向认证

```js
// moduleB.js
const moduleA = require('./moduleA');

console.log(moduleA); // 输出: { greet: 'Hello' }
console.log(moduleA.foo); // 输出: undefined
```

参考链接：https://nodejs.org/docs/latest/api/modules.html#exports-shortcut

#### 内置模块和第三方模块

- 内置模块的使用
- package.json
- npm

```bash
├── 内置模块和第三方模块
│   ├── 内置模块的使用
│   ├── 安装和使用第三方模块（省略）
│   ├── package.json 文件
│   └── npm 命令
```

> 内置模块的使用（todo：补充）

常用内置模块有：

- fs（文件模块）
- http（http模块）
- path（路径模块）

【fs】案例

```js
const fs = require('fs');

fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

使用`readFile`方法异步地读取文件`file.txt`的内容，并在回调函数中打印出来。

【http】案例

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
```

使用`createServer`方法创建一个 HTTP 服务器。服务器监听端口 3000，并在访问时返回 "Hello, World!"。

【path】案例

```js
const path = require('path');

const fullPath = path.join(__dirname, 'files', 'file.txt');
console.log(fullPath); // 当前目录\files\file.txt
```

使用`join`方法将目录名、子目录名和文件名拼接成完整的文件路径。`__dirname`变量表示当前脚本所在的目录。

> package.json

以下是 package.json 文件的一些重要字段和功能：

- `name`：项目的名称。
- `version`：项目的版本号。
- `description`：项目的描述信息。
- `main`：指定项目的主入口文件。
- `scripts`：定义了一些脚本命令，用于项目的构建、测试、运行等操作。
- `dependencies`：列出了项目所依赖的第三方模块及其版本号。
- `devDependencies`：列出了仅在开发过程中使用的第三方模块及其版本号。
- `author`：项目的作者信息。
- `license`：项目的许可证信息。

package.json 文件可以手动编写，也可以通过运行 `npm init` 命令自动创建和配置。

使用 `npm install` 安装第三方模块时，它们的信息会自动添加到 package.json 文件的 `dependencies` 或 `devDependencies` 字段中。

#### 模块路径解析

#### 模块循环依赖



## 核心模块

> fs、http、path、buffer等

## 异步编程

> 

## 数据库集成

> node与SQL和NoSQL数据库交互，如MySQL、postgresql、MongoDB、redis等

## web开发

## 测试

> 单元测试、集成测试、端到端测试

## 错误处理和调试

> 处理和调试应用中的错误

## 性能优化

> 内存管理、并发和异步处理等

## 安全

> 常见安全威胁、https

## 部署&运维

> PM2、docker等工具，持续集成和持续部署（CI/CD）

## 框架

> NestJS、Koa

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

## 疑难杂症

1.**nvm use xxx, node -v不生效**

2.执行 nvm install v16.13.0

> Could not retrieve https://npm.taobao.org/mirrors/node/latest/SHASUMS256.txt.



# package.json

## 格式化脚本

```json
"format": "prettier --write 'src/**/*.{js,jsx,ts,tsx,json,css,scss,md}'"
```



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

## playwright安装慢

执行yarn，link 步骤第三方库playwright安装慢

### 