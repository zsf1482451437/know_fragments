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

## Array

- concat 连接

### concat

**`concat()`** 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。

等效于 `[...arr1, arr2]`

### from

从类似数组或可迭代对象创建一个新的数组实例。

```js
// 从字符串创建数组
const str = 'hello';
const arrFromStr = Array.from(str);
console.log(arrFromStr); // ['h', 'e', 'l', 'l', 'o']

// 从可迭代对象创建数组
const set = new Set([1, 2, 3, 4, 5]);
const arrFromSet = Array.from(set);
console.log(arrFromSet); // [1, 2, 3, 4, 5]

// 使用映射函数
const arr = [1, 2, 3];
const arrSquared = Array.from(arr, x => x * x);
console.log(arrSquared); // [1, 4, 9]

```

### isArray

检查一个值是否为数组

```js
const arr = [1, 2, 3];

console.log(Array.isArray(arr));  // 输出 true

const obj = { key: 'value' };

console.log(Array.isArray(obj));  // 输出 false
```

优势是在处理多种数据类型时更加安全，因为有时我们可能会遇到类似数组的对象（array-like objects）或者其他类似数组的数据结构，而这些并不是真正的数组。使用 `Array.isArray` 可以明确判断一个值是否为数组。

`Array.isArray()` 也拒绝原型链中带有 `Array.prototype`，而实际不是数组的对象，但 `instanceof Array` 会接受。

```js
// 创建一个普通对象
const notAnArray = {};

// 将原型链设置为 Array.prototype
Object.setPrototypeOf(notAnArray, Array.prototype);

// 此时 notAnArray 具有 Array 的原型链，但它并不是一个数组
console.log(Array.isArray(notAnArray)); // 输出: false
console.log(notAnArray instanceof Array); // 输出: true

// 添加一些属性，使其看起来更像一个对象
notAnArray.foo = 'bar';
notAnArray.length = 1;

// 尝试使用数组的一些方法，会发现它并不是真正的数组
console.log(notAnArray.join(',')); // 输出: "[object Object]"
console.log(notAnArray.push('baz')); // 抛出 TypeError: notAnArray.push is not a function

```



## Object

### freeze

冻结一个对象相当于[阻止其扩展](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions)然后将所有现有[属性的描述符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#描述)的 `configurable` 特性更改为 `false`——对于数据属性，将同时把 `writable` 特性更改为 `false`。无法向被冻结的对象的属性中添加或删除任何内容。任何这样的尝试都将失败，可能是静默失败，也可能抛出一个 [`TypeError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError) 异常（通常情况下，在[严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)中抛出）。

```js
const obj = {
  prop: 42,
};

Object.freeze(obj);

obj.prop = 33;
// Throws an error in strict mode

console.log(obj.prop);
// Expected output: 42
```

### assign

如果目标对象与源对象具有相同的[键（属性名）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)，则目标对象中的属性将被源对象中的属性覆盖，后面的源对象的属性将类似地覆盖前面的源对象的同名属性。

```js
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };

const returnedTarget = Object.assign(target, source);

console.log(target);
// Expected output: Object { a: 1, b: 4, c: 5 }

console.log(returnedTarget === target);
// Expected output: true
```

`Object.assign()` 方法只会拷贝源对象*可枚举的*的*自有属性*到目标对象。该方法在源对象上使用 `[[Get]]`，在目标对象上使用 `[[Set]]`，因此它会调用 [getter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get) 和 [setter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/set)。故它对属性进行*赋值*，而不仅仅是复制或定义新的属性。如果合并源对象包含 getter 的新属性到原型中，则可能不适合使用此方法。

### entries



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

# 经验

> **取值路径**较深时，推荐可选链或者lodash的get方法

> 某个变量接收string类型，如何传递{ type: "LOGOUT" }给他

```js
JSON.stringify({ type: "LOGOUT" })
```

# 常见第三方库

## lodash

- pick

> pick

从**对象**中挑选指定属性

基本用法：

```js
const _ = require('lodash');

const sourceObject = {
  name: 'John',
  age: 25,
  city: 'New York',
  country: 'USA',
};

const pickedObject = _.pick(sourceObject, ['name', 'age']);

console.log(pickedObject);
// Output: { name: 'John', age: 25 }

```

注意事项：

1. **不会修改原对象：** `_.pick` 不会修改传入的原始对象，而是返回一个新的对象。

2. **不存在的属性：** 如果指定的属性在原对象中不存在，它们会被忽略。

3. **数组作为属性列表：** 第二个参数是一个包含属性名的数组，你也可以传递多个参数，每个参数都是一个属性名。例如：

   ```js
   const pickedObject = _.pick(sourceObject, 'name', 'age');
   ```

4. **回调函数：** 你也可以传递一个回调函数，它决定了挑选哪些属性。例如：

   ```js
   const pickedObject = _.pick(sourceObject, (value, key) => key === 'name');
   ```

5. **深度挑选：** `_.pick` 默认只进行浅层次的挑选。如果你希望进行深度挑选，可以使用 `_.pick` 的 `deep` 参数：

   ```js
   const deepPickedObject = _.pick(sourceObject, ['name', 'address'], { deep: true });
   ```



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

