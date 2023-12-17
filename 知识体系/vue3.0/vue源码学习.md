# 1 DOM

## 1.1 真实DOM渲染

元素变成节点，然后根据**父子关系**形成**树结构**，最后由**浏览器**渲染成页面

## 1.2 虚拟DOM的优势

目前三大主流框架都会引入**虚拟DOM**来对真实DOM进行**抽象**，这种做有很多好处：

- **操作方便**

对真实DOM进行某些操作是不方便的，比如diff，clone等等，而换成虚拟DOM，利用js去操作这些就会方便

- **跨平台**

虚拟DOM就是像是中间层，在什么平台怎么渲染，由平台决定。

# 2 阅读源码

## 2.1 三大核心

vue的源码主要有这三大核心系统

- Compiler，**编译模板系统**
- Runtime，也叫Renderer模块，真正的**渲染模块**
- Reactivity，**响应式系统**，利用**diff**算法对比**新旧VNode**

## 2.2 **源码调试**

比如想看createApp的过程

1. 下载源码，推荐`git clone`（在此之前先`git init`）
2. 安装依赖，`npm install`
3. 对项目打包 `npm dev`（如果不是看package.json），执行前修改脚本，在后面加上 `--sourcemap`，为了不在整个项目在调试
4. 在**packages/vue/examples**文件夹下，创建一个demo，引入**packages/vue/dist/vue.global.js**里在你想要调试的位置加上`debugger`
5. 后面你懂得~

## 2.3 createApp()

**Vue.createApp()到底做了什么？**

以后补充~

### **源码位置**

**runtime-dom/src/index.ts**

### **技巧**

**标记**

推荐个vscode插件**BookMarks**，如果想在**某个位置打标记**，等下还行回头看，鼠标点到那个位置，使用**快捷键**（具体是什么查看即可）打上标记

**跳转**

**Ctrl + 鼠标左键**，可以快速跳转到某个函数定义位置

## 2.4 mount()

**mount()做了什么？**

以后补充~

**面试题**

**组件的VNode**和**组件的instance**有什么区别？

组件的VNode是构建**虚拟DOM**时形成的一个**节点**，这个节点刚好是组件；

组件的instance**保存组件各种状态**；

## 2.5 compiler

一般地，**编译器**的原理基本都是这样的：

1. 词法分析、语法分析，**parse**；
2. 生成**源语言**抽象语法树**ast**；
3. 源ast转化为**目标语言的ast**；
4. 然后通过**代码生成**，就可以生成**目标语言的代码**了

而vue中的compiler**将template中的内容转化成render函数**原理也是如此：

1. 词法分析、语法分析，**parse**；
2. 生成**html**抽象语法树**ast**；
3. html的ast转化为**js的ast**；
4. 然后通过**代码生成**，生成**js代码**
5. 然后将这些代码组织成**render函数**

## 2.6 组件的创建过程

1. 先创建**组件实例**instance；
2. 然后进行instance一系列的**初始化**；
3. 再执行相关**render()**,生成**vnode**；

## 2.7 Block Tree

**vue3源码对性能优化有哪些呢？**

- 对于**不会改变**的静态节点(**没有用到动态数据**)，进行作用域提升，**更新时不放入render()**，进行**diff算法**时，不考虑这些节点。比如下面的div是静态节点，而span和button由于用到了动态数据（绑定事件处理函数有可能发生改变），不算静态节点;这便是**Block Tree**

  ```html
  <div>hhh</div>
  <span>{{ msg }}</span>
  <button @click="test">点击</button>
  ```

  ```js
  import { ref } from 'vue'
  
  setup() {
      const msg = ref('zsf')
      const test = () => {
          console.log(123)
      }
      return {
          msg,
          test
      }
  }
  ```

  



# 3 实现Mini-Vue

它包含三个模块：

- **渲染**系统模块（runtime）
- 可**响应式**系统模块（reactivity）
- 应用**程序入口**模块

## 3.1 渲染系统模块

该模块负责**vnode转化成真实DOM**

包含三个功能：

功能一：**h()**,用于返回一个VNode对象；

功能二：**mount()**,用于将VNode挂载到DOM上

功能三：**patch()**,用于对比两个VNode，决定如何处理新的VNode

### h()

返回一个vnode对象

#### 目标

创建一个vnode

```js
const vnode = h('div', {class: 'zsf'}, [
  h('h2', null, '当前计数：100'),
  h('button', null, '+1')
])
console.log(vnode)
```



#### 参数

**参数1** html元素（组件暂不考虑）

**参数2** 元素的属性

**参数3** 元素内容（子节点）

#### 返回值

一个vnode对象

```js
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}
```



### mount()

将VNode挂载到DOM上

#### 目标

使用mount()将vnode挂载在div#app上

```js
mount(vnode, document.querySelector('#app'))
```

#### 参数

**参数1** vnode

**参数2** 父元素

#### 4步关键

第1步，**创建出真实元素el**，并在vnode上保留一份（后面通过vnode拿到真实el方便）；

第2步，**处理props**，**遍历**这个对象，如果是**属性**就使用**setAttribute()**给el设置属性；如果是**事件**就使用**addEventListener()**给el添加事件监听；

第3步，**处理children**，如果**vnode.children是字符串**，直接赋值给**el.textContent**就行；如果**vnode.children有子节点**，**遍历**那些子节点，并**递归调用mount()**；

第4步，使用**appendChild()**将el挂载到**container**上

```js
const mount = (vnode, container) => {
  // 1.vnode -> element,创建出真实元素，并且在vnode上保留一份el
  const el = vnode.el = document.createElement(vnode.tag)

  // 2.处理props
  if (vnode.props) {
    for(const key in vnode.props) {
      const value = vnode.props[key]
      if (key.startsWith('on')) { // 对事件监听的判断
        el.addEventListener(key.slice(2).toLocaleLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  // 3.处理children
  if(vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach((item)=> {
        mount(item, el)
      })
    }
  }

  // 4.将el挂载到container中
  container.appendChild(el) 
}
```

### patch()

#### 目标

创建新的vnode，然后新旧vnode使用diff算法，找出要修改真实DOM的哪个地方

```js
// 1.使用h()创建一个vnode
const vnode = h('div', {class: 'zsf', id: 'aa'}, [
  h('h2', null, '当前计数：100'),
  h('button', null, '+1')
])
// 2.使用mount()将vnode挂载在div#app上
mount(vnode, document.querySelector('#app'))

// 3.创建新的vnode
const vnode1 = h('div', {class: 'hhh', id: 'aa'}, '哈哈哈')
patch(vnode, vnode1)
```

#### 参数

**参数1** 旧vnode

**参数2** 新vnode

```js
const patch = (n1, n2) => {
  // 先看看类型是否一样，不一样直接移除旧vnode,然后挂载新vnode
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {
    // 1.取出el对象，并在n2中保存
    const el = n2.el = n1.el

    // 2.处理props
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // 2.1 获取所有的newProps，添加到el
    for (const key in oldProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      // 一样就不用改，不一样就用新的
      if (newValue !== oldValue) {
        if (key.startsWith('on')) { // 对事件监听的判断
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }
    // 2.2 删除oldProps
    for (const key in oldProps) {
      // 如果旧vnode有的属性在新的vnode中并没有，直接移除
      if (key.startsWith('on')) { // 对事件监听的判断
          const value = oldProps[key]
          el.removeEventListener(key.slice(2).toLowerCase(), value)
      } 
      if(!(key in newProps)) {
        el.removeAttribute(key)
      }
    }
    // 3.处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    if (typeof oldChildren === 'string') { // newChildren本身是一个string
      if (typeof oldChildren === 'string') {
        el.textContent = newChildren
      } else {
        el.innerHTML = newChildren
      }
    } else { // newChildren本身是一个数组
      if (typeof oldChildren === 'string') {
        el.innerHTML = ''
        newChildren.forEach((item) => {
          mount(item, el)
        })
      } else {
        // oldChildren: [v1, v2, v3 v8, v9]
        // newChildren: [v1, v5, v6]
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        // 1.前面有相同节点进行patch操作
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // 2.newChildren > oldChildren,新的长，patch完进行添加操作
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el)
          })
        }

        // 2.oldChildren > newChildren,旧的长,patch完进行移除操作
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el)
          })
        }
      }
    }
  }
}
```

**为什么需要commonLength？**

如果**oldChildren比newChildren长**，diff完需要**移除**操作，比如下面的情况

```
oldChildren: [v1, v2, v3, v8, v9]
newChildren: [v1, v5, v6]
```

如果**newChildren比oldChildren长**,diff完需要**添加**操作，比如下面的情况

```js
oldChildren: [v1, v2, v3]
newChildren: [v1, v5, v6, v8, v9]
```



## 3.2 响应式系统模块

该模块负责数据的**响应式**

### 收集依赖

**如何收集依赖？**

看这么一段代码

```js
class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  // 收集订阅者（依赖函数或者副作用）
  addEffect(effect) {
    this.subscribers.add(effect)
  }
}
function watchEffect(effect) {
  dep.addEffect(effect)
}

const dep = new Dep()

const info = {
  counter: 100
}

watchEffect(() => {
  console.log(info.counter)
})
```

Dep类中存放一个收集依赖的**subscribers集合**；

**watchEffect()**传入对**响应式对象**有依赖的**函数**，然后将**该函数**视为**订阅者**加入subscribers集合；



**subscribers为什么使用集合？**

集合有一个特点，就是**不允许重复**。

当某个函数对某个响应式对象重复依赖时，只需要加入一次subscribers即可。

但是实际上，我们采用**另一种写法**

```js
class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  // 收集订阅者（依赖函数或者副作用）
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }
}

let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  dep.depend()
  effect()
  activeEffect = null
}

const dep = new Dep()

const info = {
  counter: 100
}

watchEffect(() => {
  console.log(info.counter * 2)
})

info.counter++
```

与上一种写法不同的是

维护一个**指向订阅者**的指针**activeEffect**；

当订阅者加入**subscribers集合**，**activeEffect指向null**，为下一个订阅者服务；

当然，那些函数加入到订阅者后，在通知发布之前，默认**先执行一次**，获取所依赖响应式对象的初始值；

但是，还存在一个**问题**：

当**响应式对象**有很多属性时，某个函数只是依赖了counter，当**响应式对象**的其它属性发生改变时，**难道也要执行notify()?**当然不要！所以要**维护一个专门的dep**。比如counter有它的dep，其它属性有只属于他们的dep

**怎么维护一个属性专门的dep呢？**

#### vue2**数据劫持**

讨论维护一个专门的dep之前，先聊聊**数据劫持**

当**获取**一个对象的某个属性，比如**info.name**,内部就会调用name属性的**get()**;

当**修改**一个对象的某个属性，比如**info.name = 'lll'**,内部就会调用name属性的**set()**;

数据劫持并不会对该对象有什么影响，但是我们可以在劫持的**get()和set()**中做点事情，比如**针对性地收集依赖**，换句话说，**每个属性都有属于自己的dep**，这样收集起来后，就可以**针对性去通知**，就不会出现我对a有依赖，b变了，然后通知我:b变了...

```js
const targetMap = new WeakMap()
function getDep(target, key) {
  // 1.根据对象（target）取出depsMap对象
  let depsMap = targetMap.get(target)
  // 一开始targetMap是空的，所以depsMap也是空的
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 根据depsMap对象，取出dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// vue2进行数据劫持
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key)
    let value = raw[key]
    Object.defineProperty(raw, key, {
      get() {
        dep.depend()
        return value
      },
      set(newValue) {
        if (value !== newValue) {
          value = newValue
          dep.notify()
        }
      }
    })
  })
  return raw
}
```

这里面牵扯的东西有点多，静下心来，我慢慢给你梳理~

1.获取每个属性专门的dep，所以需要**getDep(obj, key)**：获取obj的一个key专属的dep；

2.一个对象obj有很多dep，他们之间的关系用一个**weakMap**存起来，weakMap大概是这样的：

`{ {dep1, dep2, ...}: obj }`，因为还有其它对象也要这样存，所以使用WeakMap再合适不过了，并且WeakMap是**弱引用**，也有助于垃圾回收~，这里就不多说了；

3.所以通过**targetMap.get(obj)**就可以获得obj所有的dep啦；

4.但一开始targetMap是空的，所以**targetMap.set(obj, depsMap)**；

5.已经拿到obj所有的dep，需要获取key对应的dep，所以有**depsMap.get(key)**，depsMap大概是这样的：

`{key1: dep1, key2: dep2,...}`

6.但是一开始dep也可能是空的，所以需要**depsMap.set(key, dep)**;

7.最后，在属性的get()触发时，就可以执行**dep.depend()**，将**依赖该属性的函数**放入该属性专属的订阅者；

8.在属性的set()触发时，就可以执行**dep.notify()**，只通知**依赖了该属性的订阅者**

当你理解到这里，**有没有被这种设计所惊艳到？**

**测试**

```js
class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  // 收集订阅者（依赖函数或者副作用）
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
    
  }
  // 发布通知，每位订阅者执行一次
  notify() {
    this.subscribers.forEach((effect) => {
      effect()
    })
  }
}

let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

const targetMap = new WeakMap()
function getDep(target, key) {
  // 1.根据对象（target）取出Map对象
  let depsMap = targetMap.get(target)
  // 一开始targetMap是空的，所以depsMap也是空的
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 根据Map对象，取出dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// vue2进行数据劫持
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key)
    let value = raw[key]
    Object.defineProperty(raw, key, {
      get() {
        dep.depend()
        return value
      },
      set(newValue) {
        if (value !== newValue) {
          value = newValue
          dep.notify()
        }
      }
    })
  })
  return raw
}
const info = reactive({counter: 100, name: 'zsf'})
const foo = reactive({height: 1.88})

watchEffect(() => {
  console.log(info.counter * 2)
})
watchEffect(() => {
  console.log(foo.height)
})

info.counter++

```

你会发现只有依赖counter的函数重新执行了

#### vue3**数据劫持**

```js
// vue3进行数据劫持
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key)
      dep.depend()
      return target[key]
    },
    set(target, key, newValue) {
      const dep = getDep(target, key)
      target[key] = newValue
      dep.notify()
    }
  })
}
```

和vue2相差无几，不过使用了Proxy做一层代理，更加灵活

**为什么vue3选择Proxy？**

- defineProperty劫持的是对象的属性，需要多次劫持，而Proxy劫持的是整个对象；
- Proxy能观察的类型比defineProperty更丰富，捕获器更多（has、deleteProperty等等）；

### 发布通知

当响应式对象发生改变，**如何通知各位订阅者呢？**

看这么一段代码

```js
class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  // 收集订阅者（依赖函数或者副作用）
  addEffect(effect) {
    this.subscribers.add(effect)
  }
  // 发布通知，每位订阅者执行一次
  notify() {
    this.subscribers.forEach((effect) => {
      effect()
    })
  }
}

function watchEffect(effect) {
  dep.addEffect(effect)
}

const dep = new Dep()

const info = {
  counter: 100
}

watchEffect(() => {
  console.log(info.counter * 2)
})

info.counter++
dep.notify()
```

Dep类中有个发布通知的方法**notify()**；

当响应式对象发生改变时，通知每位**订阅者**，也就是**对该响应式对象有依赖**的所有函数**都执行一次**；

## 3.3 应用程序入口模块

该模块**实现createApp(App).mount('#app')**

### createApp()

**参数** 根组件

**返回值** 一个有**mount()**的对象

```js
function createApp(rootComponent) {
  return {
    mount(selector) {
    }
  }
}
```

### mount()

**参数** 选择器

将根组件挂载在该选择器上

```js
function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldVNode = null

      watchEffect(function() {
        if (!isMounted) {
          oldVNode = rootComponent.render()
          mount(oldVNode, container)
          isMounted = true
        } else {
          const newVNode = rootComponent.render()
          patch(oldVNode, newVNode)
          oldVNode = newVNode
        }
      })
    }
  }
}
```

如果**第一次**调用app.mount(),挂载；

**第二次**调用,已经挂载，要刷新；

所以要设置个状态**isMounted**，初始值为false，默认未挂载;

挂载之后，**isMounted为true**；

如果数据发生更新，要对**oldVNode**和**newVNode**进行**patch()**的操作；

当数据更新完，**newVNode变oldVNode**，等待下一次patch();

每次**收集完依赖**，VNode已更新，要执行一次**上述过程**，所以要将上述过程传入**watchEffect()**；

## 3.4 完整代码

### index.html

```html
<div id="app"></div>
<script src="./reactivity.js"></script>
<script src="./renderer.js"></script>
<script src="./index.js"></script>
<script>
  // 根组件
  const App = {
    data: reactive({
      counter: 0
    }),
    render() {
      return h('div', null, [
        h('h2', null, `当前计数：${this.data.counter}`),
        h('button', {
          onClick:  () => {
            this.data.counter++
            console.log(this.data.counter)
          }
        }, '+1')
      ])
    }
  }
  // 挂载根组件
  const app = createApp(App)
  app.mount('#app')
</script>
```



### index.js

```js
function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldVNode = null

      watchEffect(function() {
        if (!isMounted) {
          oldVNode = rootComponent.render()
          mount(oldVNode, container)
          isMounted = true
        } else {
          const newVNode = rootComponent.render()
          patch(oldVNode, newVNode)
          oldVNode = newVNode
        }
      })
    }
  }
}
```



### reactivity.js

```js
class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  // 收集订阅者（依赖函数或者副作用）
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }
  // 发布通知，每位订阅者执行一次
  notify() {
    this.subscribers.forEach((effect) => {
      effect()
    })
  }
}

let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

const targetMap = new WeakMap()
function getDep(target, key) {
  // 1.根据对象（target）取出Map对象
  let depsMap = targetMap.get(target)
  // 一开始targetMap是空的，所以depsMap也是空的
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 根据Map对象，取出dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// vue3进行数据劫持
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key)
      dep.depend()
      return target[key]
    },
    set(target, key, newValue) {
      const dep = getDep(target, key)
      target[key] = newValue
      dep.notify()
    }
  })
}


```



### renderer.js

```js
/**
 * h函数
 * @param {*} tag 
 * @param {*} props 
 * @param {*} children 
 * @returns 一个VNode，也就是js对象
 */
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}
/**
 * mount函数
 * @param {*} vnode 
 * @param {*} container 
 */
const mount = (vnode, container) => {
  // 1.vnode -> element,创建出真实元素，并且在vnode上保留一份el
  const el = vnode.el = document.createElement(vnode.tag)

  // 2.处理props
  if (vnode.props) {
    for(const key in vnode.props) {
      const value = vnode.props[key]
      if (key.startsWith('on')) { // 对事件监听的判断
        el.addEventListener(key.slice(2).toLocaleLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  // 3.处理children
  if(vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach((item)=> {
        mount(item, el)
      })
    }
  }

  // 4.将el挂载到container中
  container.appendChild(el) 
}
/**
 * 
 * @param {*} n1 
 * @param {*} n2 
 */
const patch = (n1, n2) => {
  // 先看看类型是否一样，不一样直接移除旧vnode,然后挂载新vnode
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {
    // 1.取出el对象，并在n2中保存
    const el = n2.el = n1.el

    // 2.处理props
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    // 2.1 获取所有的newProps，添加到el
    for (const key in oldProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      // 一样就不用改，不一样就用新的
      if (newValue !== oldValue) {
        if (key.startsWith('on')) { // 对事件监听的判断
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }
    // 2.2 删除oldProps
    for (const key in oldProps) {
      // 如果旧vnode有的属性在新的vnode中并没有，直接移除
      if (key.startsWith('on')) { // 对事件监听的判断
          const value = oldProps[key]
          el.removeEventListener(key.slice(2).toLowerCase(), value)
      } 
      if(!(key in newProps)) {
        el.removeAttribute(key)
      }
    }
    // 3.处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    if (typeof oldChildren === 'string') { // newChildren本身是一个string
      if (typeof oldChildren === 'string') {
        el.textContent = newChildren
      } else {
        el.innerHTML = newChildren
      }
    } else { // newChildren本身是一个数组
      if (typeof oldChildren === 'string') {
        el.innerHTML = ''
        newChildren.forEach((item) => {
          mount(item, el)
        })
      } else {
        // oldChildren: [v1, v2, v3 v8, v9]
        // newChildren: [v1, v5, v6]
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        // 1.前面有相同节点进行patch操作
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // 2.newChildren > oldChildren,新的长，patch完进行添加操作
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el)
          })
        }

        // 2.oldChildren > newChildren,旧的长,patch完进行移除操作
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el)
          })
        }
      }
    }
  }
}
```

其中**renderer.js**的**patch()**部分较为复杂
