# 1 JSON由来

JavaScript Object Notation（对象符号），提出主要应用js，目前已**独立于编程语言**

**道格拉斯设计**

**服务器和客户端**传输的**数据格式**

其它格式：

- XML 越来越少使用
- Protobuf 越来越多使用

## 1.1 应用场景

- 网络数据传输JSON数据
- 配置文件
- 非关系型数据（NoSql）库存储格式

## 1.2 基本语法

- **双引号**
- 不支持**undefined**
- 不能有**注释**
- 最后位置不能有**逗号**

## 1.3 序列化

某些情况希望将js**复杂类型**转化成**JSON格式**的字符串，方便处理,比如**localStorage.setItem()**需要传字符串，直接传对象的话，会直接被解析Object~

```js
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const objString = JSON.stringify(obj)
console.log(objString)// {"name":"zsf","age":18,"friend":{"name":"why"}}
```

还可以将**JSON格式**的字符串转回**对象**

```js
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const objString = JSON.stringify(obj)
console.log(objString)

const info = JSON.parse(objString)
console.log(info)// {name: 'zsf', age: 18, friend: {…}}
```

### stringify

- 参数1：对象
- 参数2：replacer
- 参数3：space

#### 参数2

参数2传入**数组**，**按需转化**

```
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const objString = JSON.stringify(obj, ['name', 'age'])
console.log(objString)// {"name":"zsf","age":18}

```

参数2传入**回调函数**，加工数据再序列化

```js
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const objString = JSON.stringify(obj, (key, value) => {
  if (key === 'age') {
    return value + 1
  }
  return value
})
console.log(objString)// age+1了
```

#### 参数3

缩进空格，默认是2，提高可读性，也可以用其他字符当空格

#### 特殊情况

如果obj对象中有toJSON方法，直接使用对象的

## 1.4 解析

### parse

- 参数1：JSON字符串
- 参数2：revier

#### 参数2

也可以**拦截**数据，**加工再解析**，类似

stringfy的参数2

## 1.5 进行深拷贝

**浅拷贝例子**

例子，**展开运算符**

```js
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const obj1 = {...obj}
obj1.friend.name = 'kobe'
console.log(obj.friend.name)// kobe
```

只是对obj对象里**简单类型的属性**做了**深拷贝**，而**引用类型的属性**做的是**浅拷贝**，拷贝的是**地址**，指向依然是同一个（obj.friend = obj1.friend）,所以**obj.friend.name**才会被影响



利用JSON的**序列化和解析**可以进行对象的**深拷贝**

```js
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const jsonString = JSON.stringify(obj)
const info = JSON.parse(jsonString)
obj.friend.name = 'kobe'
console.log(info.friend.name)// 还是why
```

但是这种方式有个

### **缺点**

stringify**不会对函数做处理**。。。

对象里要是有函数会**默认移除**~

# 2 浏览器存储方案

## 2.1 WebStorage

浏览器提供一种比cookie更直观的key-value存储方式

有两个：

- locaStorage
- sessionStorage

### locaStorage

永久性的存储方法，在**关闭掉网页重新打开**时，存储的**内容依然保留**

### sessionStorage

本次会话的存储，**关闭掉会话**时，存储的**内容会被清除**

### 常见属性、方法

| length              | 只读属性,通常搭配key()做遍历 |
| ------------------- | ---------------------------- |
| setItem(key, value) |                              |
| getItem(key)        |                              |
| key()               | 搭配length属性遍历           |
| removeItem(key)     |                              |
| clear()             |                              |

遍历

```js
const obj = {
  name: 'zsf',
  age: 18,
  friend: {
    name: 'why'
  }
}

const jsonString = JSON.stringify(obj)

localStorage.setItem(obj, jsonString)

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(localStorage.getItem(key))
}
```

### Storage工具类的封装

#### 关键点

- 哪种storage
- setitem(key, value)中value的序列化
- getItem(key)中value的解析
- 一些边缘情况

```js
class SFCache {
  constructor(isLocal = true) {
    // 哪种storage
    this.storage = isLocal ? localStorage : sessionStorage
  }

  setItem (key, value) {
    // 边缘情况
    if (value) {
      this.storage.setItem(key, JSON.JSON(value))
    }
  }

  getItem (key) {
    let value = this.storage.getItem(key)
    // 边缘情况
    if (value) {
      value = JSON.parse(value)
      return value
    }
  }

  removeItem (key) {
    this.storage.removeItem(key)
  }

  clear () {
    this.storage.clear()
  }

  key (index) {
    return this.storage.key(index)
  }

  length () {
    return this.storage.length
  }
}

const localCache = new SFCache()
const sessionCache = new SFCache(false)
// 导出
export {
  localCache,
  sessionCache
}
```

## 2.2 IndexDB

如果存**大量数据**，就可以尝试这种存储方案

但是要是存**大量数据**，**浏览器缓存**的东西会非常多，浏览器亚历山大~

**移动端**要是也想存大量数据，用**sqlite**

- 事务型数据库系统
- 基于js面向对象数据库，类似NoSQL

