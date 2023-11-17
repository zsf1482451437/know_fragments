# window对象

## 滚动到顶部--整个页面的顶部

```html
<!DOCTYPE html>
<html lang="ch-ZN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>js实现页面滚动返回顶部</title>
  <style>
    * {
      padding: 0px;
      margin: 0px;
    }

    div {
      width: 1200px;
      height: 300px;
      margin: 50px auto;
      font-size: 120px;
      line-height: 300px;
      text-align: center;
      color: #ffffff;
      background-color: #999999;
    }

    button {
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: 60px;
      height: 60px;
      border: 0px;
      border-radius: 10px;
      font-size: 24px;
      line-height: 30px;
      text-align: center;
      color: #000;
      background-color: #c5e4ff;
      outline: none;
      cursor: pointer;
    }

    button:hover {
      color: #fff;
      background-color: #5fb4ff;
    }
  </style>
</head>

<body>
  <div>模块1</div>
  <div>模块2</div>
  <div>模块3</div>
  <div>模块4</div>
  <div>模块5</div>
  <div>模块6</div>
  <div>模块7</div>
  <div>模块8</div>
  <div>模块9</div>
  <button>返回顶部</button>
  <script>
    var btn = document.querySelector('button'); // 获取元素
    var timer; // 用来储存计时器的变量
    btn.addEventListener('click', function () {
      clearInterval(timer); // 先停止上次的计时器（防止连点）
      timer = setInterval(function () {
        // 判断是否已经滚动到了顶部
        if (window.pageYOffset != 0) {
          // 如果没到顶部就再移动一点距离（我这里是一次移动了50像素）
          window.scroll(0, Math.max(window.pageYOffset - 50, 0));
        } else {
          // 如果到顶部了就停止计时器
          clearInterval(timer);
        }
      }, 10);
    })
  </script>
</body>

</html>

```

## 滚动到顶部--容器内

```js
function toTop() {
  var sidebar = document.querySelector('.sidebar-nav');
  var content = document.querySelector('.markdown-section');

  sidebar.addEventListener('click', function () {
    content.scroll(0, -content.scrollHeight)
  });
}
```

## 打开新窗口

```ts
const features =
        "height=400,width=300,left=100,top=100,status=yes,toolbar=no,menubar=no,location=no";
      const newWindow: any = window.open(url, "_blank", features);
      newWindow.opener = null; // 设置新窗口的 opener 为 null，使其半开状态
      newWindow.focus();
```



# 常见函数

## 数组

- concat 连接

### concat

**`concat()`** 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。

等效于 `[...arr1, arr2]`

## 类型

如何给一个第三方库的类型添加属性？比如Tree组件的DataNode添加属性

```ts
type DataNodeWithExtraProperty = DataNode & {
  extraProperty: string;
};

// 示例用法
const node: DataNodeWithExtraProperty = {
  id: 1,
  name: "Node 1",
  extraProperty: "Extra Data",
};
```



# 常见算法

## 树的扁平化

## 计算属性个数

```js
const obj = {
  name: 'John',
  age: 30,
  city: 'New York'
};

const propertyCount = Object.keys(obj).length;

console.log(propertyCount); // 输出 3
```

`Object.keys()`方法只会返回对象**自身的可枚举属性**，不包括继承的属性。如果需要计算包括继承属性在内的属性个数，可以使用`for...in`循环结合计数器进行计算。

```js
const obj = {
  name: 'John',
  age: 30,
  city: 'New York'
};

let count = 0;
for (let key in obj) {
  if (obj.hasOwnProperty(key)) {
    count++;
  }
}

console.log(count); // 输出 3
```

## 时间格式化

2023-09-08T03:46:42.06938545Z
格式化成24小时

使用dayjs库处理

```js
moment(info.inspectTime).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')
// 输出 "17:46:42"
```



# 

# 优雅写法

检查是否有值

```js
!!a
```

有值返回true，否则false

# 疑难杂症

## Module not found

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

