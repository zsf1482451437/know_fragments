# TypeError: this.getOptions is not a function

原因：less-loader模块版本过高

解决方法：

1.卸载掉已经安装的less-loader模块

在终端中打开项目，执行 `npm uninstall less-loader`

2.安装低一点的版本

执行 `npm install less-loader@6.0.0`

搞定！