**需求：**

有个对象，希望**监听**这个对象的属性**被设置**或**获取**、**删除**、**新增**的过程

**属性描述符方式**

用**属性描述符**中的**存储属性描述符**可以做到

`Object.defineProperty(obj, key, {get/set})`

其中**get/set**可以监听**对象属性**的**获取或设置**

```js
const obj = {
  name: 'zsf',
  age: 18
}

Object.keys(obj).forEach((key) => {
  let value = obj[key]

  Object.defineProperty(obj, key, {
    get: function () {
      console.log(`${ key }属性被获取了`)
      return value
    },

    set: function (newValue) {
      console.log(`${ key }属性被设置值了`)
      value = newValue 
    }    
  })
})

console.log(obj.name)
obj.name = 'hhh'
console.log(obj.name)
```



但是，这种方式存在比较大**缺点**：

- **Object.defineProperty**设计的**初衷**，**不是为了监听一个对象中所有属性的**，而是**定义普通的属性**
- 但是想**监听其它操作**，如**新增、删除**属性，Object.defineProperty**做不到**

# 1 Proxy

es6新增，**是个类**

- **监听一个对象的操作**
- **创建**一个**代理对象**
- 该对象的所有操作，都是**通过代理对象完成**
- **代理对象**可以**监听原对象**进行了**哪些操作**

## 1.1 基本使用

- 第2个参数是捕获器对象，会重写原的对象set和get方法
- target参数：代理的对象
- key参数：代理的对象的key

```js
const obj = {
  name: 'zsf',
  age: 18
}

const objProxy = new Proxy(obj, {
  // 获取值时捕获器
  get: function (target, key, receiver) {
    console.log('获取')
    return target[key]
  },
  // 设置值时的捕获器
  set: function (target, key, newValue, receiver) {
    console.log('设置')
    target[key] = newValue
  }
})
objProxy.age = 20
console.log(objProxy.age)
```

## 1.2 其它捕获器

- has-in的捕获器
- deleteProperty捕获器

```js
const obj = {
  name: 'zsf',
  age: 18
}

const objProxy = new Proxy(obj, {
  // has-in捕获器
  has: function (target, key) {
    console.log('存在')
    return key in target
  },
  // deleteProperty捕获器
  deleteProperty: function (target, key) {
    console.log('删除')
    delete target[key]
  }
})

console.log('name' in objProxy)
delete objProxy.age
```

**还有其它捕获器**

| **getPropertyOf()**            | **Object.getPropertyOf()的捕获器**        |
| ------------------------------ | ----------------------------------------- |
| **setPropertyOf()**            | **Object.setPropertyOf()的捕获器**        |
| isExtensible()                 | Object.isExtensible()的捕获器             |
| preventExtensions()            | Object.preventExtensions()的捕获器        |
| **getOwnPropertyDescriptor()** | Object.getOwnPropertyDescriptor()的捕获器 |
| **defineProperty()**           | **Object.defineProperty()的捕获器**       |

其它就不列啦

# 2 Reflect

es6新增，**是个对象**，反射

**这个reflect有什么用呢？**

**提供**很多**操作js对象**的**方法**，有点像**Object**操作对象的方法

**已经有Object了，为什么还要reflect呢？**

- **早期ECMA规范**没有考虑到对**对象本身**的一些**操作如何设计更加规范**，所以将这些api都放到Object上
- 但是Object作为**构造函数**，这些操作放在它身上并**不合适**
- 所以，**es6新增了reflect对象，**将这些**操作集中到reflect**身上

具体哪些方法放到reflect，去MDN

## 2.1 常见方法

**Proxy有哪些捕获器，Reflect就有哪些方法**

## 2.2 基本使用

Proxy出现的本意是**不对原对象进行操作**，但是这两个操作就是对原对象的操作

- `return target[key]`
- `target[key] = newValue`

所以需要Reflect**对原对象做一个映射**，并且**有操作对象那些方法**

```js
const obj = {
  name: 'zsf',
  age: 18
}

const objProxy = new Proxy(obj, {
  // 获取值时捕获器
  get: function (target, key) {
    return Reflect.get(target, key, receiver)
  },
  // 设置值时的捕获器
  set: function (target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver)
  }
})
objProxy.age = 20
console.log(objProxy.age)
```

## 2.3 参数receiver的作用

将指向**原对象obj**的**this**改成**指向代理对象objProxy**，这样让代理对象变得有意义，不然会直接绕过代理对象去使用原对象

看这段代码

```js
const obj = {
  _name: 'zsf',
  get_name () {
    return this._name
  },
  set_name (newName) {
    this._name = newName
  }
}

const objProxy = new Proxy(obj, {
  get (target, key) {
    return Reflect.get(target, key)
  },
  set (target, key, newValue) {
    Reflect.set(target, key, newValue)
  }
})
console.log(objProxy.name)// hhh
console.log(obj._name)// zsf
```

1. 访问**objProxy.name**
2. 来到**get捕获器**里面
3. get捕获器通过**reflect.get(target, key)**会去**访问obj.get_name()**
4. 注意，可**不是访问_name**

##  2.4 reflect的construct

**应用场景**

es6转es5



```js
function Student(name, age) {
  this.name = name
  this.age = age
}

function Teachear() {
  
}

const stu = new Student('zsf', 18)
console.log(stu)
```

打印出来的stu是Student类型，但是现在有这样一个**需求**：

依然使用**Student()创建出stu对象**，但是希望是**Teacher类型**

3个参数：

- 1**构造类型**
- 2**参数列表[]**
- 3**目标类型**

```js
function Student(name, age) {
  this.name = name
  this.age = age
}

function Teachear() {
  
}

const obj = Reflect.construct(Student, ['zsf', 18], Teachear)
console.log(obj)//Teachear {name: 'zsf', age: 18}
```

