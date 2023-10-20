# Module not found

报错信息：

```bash
Module not found: Error: Can't resolve 'xxx' in 'D:\workspace\pp\ce\b_d\app\client\node_modules\@taroify\core\picker'
```

排查思路：

1. 正确安装模块？
2. 模块路径正确？

我已经安装，去**node_modules**检查发现有；

所以应该是**路径别名**不对导致，我的项目用了ts，有个**tsconfig.path.json**配置文件，该配置文件与报错模块的相对路径是否正确

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "test/*": ["../test/*"],
      "@n/*":["../../node_modules/*"],
      "@tarojs/components$": ["../node_modules/@tarojs/components/dist-h5/react"],
      "@tarojs/taro$": ["../node_modules/@tarojs/taro-h5/dist/index.cjs.js"]
    }
  }
}
```

