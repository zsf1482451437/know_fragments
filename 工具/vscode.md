# 快捷键

> 打开命名面板

```
ctrl+shift+p
```

在`.eslintrc.js`:

```js
module.exports = {
  // ...
  parserOptions: {
    ...
    tsconfigRootDir: __dirname,
    ...
  },
  // ...
}
```

参考：https://stackoverflow.com/questions/69897000/parsing-error-cannot-read-file-tsconfig-json-eslint-after-following-firebase

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

## 在vscode的tab中打开多个文件？

shift选中拖到右边

## 调试单个文件

打开文件，在文件中打断点或添加debugger；

导航-运行和调试-选择环境（Chrome或node）；

# 疑难杂症

## Parsing Error: Cannot read file 'tsconfig.json'

去settings中找到workingDirectories，`path` 设置为前端项目根目录；`eslint.workingDirectories` 添加src

```json
{
  "folders": [
    {
      "path": "D:/workspace/pp/ce-45/b_d/app/client"
    }
  ],
  "settings": {
    "eslint.workingDirectories": ["src"]
  }
}
```

## Could not establish connection to "xxxx": The VS Code Sever failed to Start 

重启vscode~

