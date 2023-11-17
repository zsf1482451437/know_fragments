## 不同系统换行符

Visual Studio Code 编辑器中，你可以按 `Ctrl + Shift + H` 打开批量替换面板，然后启用正则表达式，并使用以下搜索和替换模式：

```
\r\n -> \n
```

包含的文件

```
./b_d/app/client/src
```

这将将所有回车符替换为 Unix 风格的换行符。

本地vscode编辑器也需要在eol设置中选择lf，

团队要是使用不同系统开发，需要在git配置设置

```bash
git config --global core.autocrlf false
```

高级写法：

```bash
git ls-files -z | xargs -0 perl -i -pe 's/\r$//g'
```

修改所有文件！