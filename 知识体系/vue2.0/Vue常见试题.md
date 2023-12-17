

# vue实现双向数据绑定原理是什么？

**双向数据绑定的的由来**

对于传统的dom操作，当**数据变化**时**更新视图**需要先**获取到目标节点**，然后将改变后的值放入节点中，视图发生变化时，需要**绑定事件修改数据**。

Vue实现双向数据绑定是采用**数据劫持和发布者-订阅者模式**。

核心组成部分：

1. 监听器`Observer`： **数据劫持**
2. 订阅者容器： 监听器监听到数据变动时，遍历订阅者容器发布消息
3. `Compile`：解析模板指令，将模板中的变量替换成数据，比如`{{title}}`
4. `Watcher`： 连接`Observer`和`Compile`的桥梁

**vue2**

**数据劫持**是利用ES5的**Object.defineProperty**方法来劫持每个属性的**getter和setter**，在数据变动时发布消息给订阅者

**`Object.defineProperty`有一些缺陷，不仅要遍历`data`逐个劫持，还不能监听到数组的改变~**

**vue3**

Vue3的**数据劫持**使用了ES6的Proxy-Reflect，（Proxy的监听数组实现是把数组变成了一个类数组对象），

**为什么使用Proxy？**

首先，**Object.defineProperty**设计的**初衷**，**不是为了监听一个对象中所有属性的**，而是**定义普通的属性**

其次，Object.defineProperty要是想**监听其它操作**，如**新增、删除**属性，它做不到

Proxy可以**监听原对象**进行了**哪些操作**

**reflect有什么用呢？**

提供很多**操作js对象**的方法，有点像**Object**操作对象的方法

**已经有Object了，为什么还要reflect呢？**

- **早期ECMA规范**没有考虑到对**对象本身**的一些**操作如何设计更加规范**，所以将这些api都放到Object上
- 但是Object作为**构造函数**，这些操作放在它身上并**不合适**
- 所以，**es6新增了reflect对象，**将这些**操作集中到reflect**身上

# vue-router如何实现？

**为什么会出现前端路由？**

因为后端路由有一个很大的缺点，**每次路由切换**的时候都需要去**刷新页面**，然后发出ajax请求，然后将请求数据返回

所以我们的需求而是**更新视图而不发生请求**。这需要通过hash值来实现。而hash 值的变化，并**不会**导致浏览器向服务器**发出请求**，所以**不会刷新页面**，另外每次 hash 值的变化，还会**触发hashchange 事件**，通过这个事件我们就可以知道 hash 值发生了哪些变化。（hash 出现在 URL 中，但不会被包含在 http 请求中）

# hash/history的区别？

**用户体验角度**

- hash模式会在url中自带#
- history 模式则不会带#（但是这需要服务器把所有路由都重定向到根页面）

**改变路径方式**

- 通过改变location.hash
- 而history通过pushState()和replaceState()

# Vuex有哪些基本属性  怎么使用？

**state**

存放所有共享的状态

**getters**

基于state的派生属性，**类似于计算属性**，当需要计算后在使用时就可以使用getters

**mutations**

提交mutation是更改Vuex中的store中的状态的**唯一**方法

mutation必须是同步的，如果要异步需要使用action

```js
const store = new Vuex.Store({
  state: {
    count: 1
  },
  mutations: {
    //无提交荷载
    increment(state) {
        state.count++
    }
    //提交荷载
    incrementN(state, obj) {
      state.count += obj.n
    }
  }
})

```

```js
//无提交荷载
store.commit('increment')
//提交荷载
store.commit('incrementN', {
    n: 100
    })
```

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。

```js
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    incrementA (context) {
      setInterval(function(){
        context.commit('increment')
      }, 1000)
    }
  }
})

```

Action 通过 `store.dispatch` 方法触发

```js
store.dispatch('incrementA')
```

**Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象**

因此你可以调用 context.**commit** 提交一个 mutation，或者通过 context.**state** 和 context.**getters** 来获取 state 和 getters。

**modules**

使用单一状态树，导致应用的所有状态集中到一个很大的对象。但是，当应用变得很大时，store 对象会变得**臃肿不堪。**

为了解决以上问题，Vuex 允许我们将 store 分割到模块（module）。每个模块拥有自己的 state、mutation、action、getters

```js
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

```

# 计算属性和watch有什么区别?以及它们的运用场景?

来认识一下计算属性的缓存妙处~

```html
<div id="example">
  <p>"{{ message }}"</p>
  <p>"{{ reversedMessage }}"</p>
</div>
```

```js
var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // 计算属性的 getter
    reversedMessage: function () {
      // `this` 指向 vm 实例
      return this.message.split('').reverse().join('')
    }
  }
})
```

当然，使用methods结果也是一样

```js
methods: {
  reversedMessage: function () {
    return this.message.split('').reverse().join('')
  }
}
```

但是，**计算属性是基于它们的响应式依赖进行缓存的**。只在相关**响应式依赖发生改变**时它们才会**重新求值**。这就意味着只要 `message` 还没有发生改变，多次访问 `reversedMessage` 计算属性会立即返回之前的计算结果，而**不必再次执行函数**。

**为什么需要缓存？**

假设我们有一个性能开销比较大的计算属性 **A**，它需要遍历一个巨大的数组并做大量的计算。然后我们可能有其他的计算属性依赖于 **A**。如果没有缓存，我们将不可避免的多次执行 **A** 的 getter！

当然，如果你不希望有缓存，也可以使用方法来替代~

**区别**

- computed**支持缓存**，watch不支持~

- 计算属性是**声明式**编程，而watch是**命令式**编程，而且可能有很多重复代码

  

**运用场景**

- 当数据需要**经过处理再显示**时，使用计算属性**computed**~
- 当需要在**数据变化时执行异步**或**开销较大**的操作时，使用**watch**~

# 你知道组件之间的传值方式有哪些？

| props      | 父传子         |      |
| ---------- | -------------- | ---- |
| $emit/v-on | 子传父         |      |
| EventBus   | 非父子可以使用 |      |

**props**

父组件**fpn**

```html
<div id="fpn">
    <spn :s-msg="fMsg"></spn>
  </div>
```

```js
data: {
    fMsg: '父亲的数据'
  }
```

子组件**spn**

```html
<div>
   <h2>{{ sMsg }}</h2>
</div>
```

```js
props: {
	sMsg: {
	  type: String,
	  default: 'hhh'
	}
```

**父组件的fMsg**通过**props**传给**子组件的sMsg**

HTML 中的 attribute 名是大小写不敏感的，浏览器会把**所有大写字符**解释为小写字符，并在**前面加个横线分隔**（js中是**sMsg**，在html中就变**s-msg**啦~），组件名**注册时大写**，**使用时可以小写横线分隔**就是这个原因~

**$emit/v-on**

子组件**spn**

```html
<div>
  <button @click="spn"></button>
</div>
```

```js
data () {
  return {
    list: [
      {id: 1, name: '热门'}
    ]
  }
},
methods: {
  spn () {
    // 发射事件
    this.$emit('spnClick',this.list)
  }
}  
```

父组件**fpn**

@是v-on的语法糖~

```html
<div id="fpn">
  <spn @spnClick="fpn"></spn>
</div>
```

```js
methods: {
  fpn (value) {
      console.log(value)
  }
}
```

子组件通过点击，**将自定义事件spnClick发射出去**~，并且**可以携带一些信息**（this.list）一起发射；

当父组件fpn使用子组件spn时，要是**监听到子组件的点击**，可以绑定一个**处理函数**，该处理函数的**参数**可以**拿到**子组件传递过来的**信息**(spn的list)。

**EventBus**

**1.初始化**

**第一种方式**

将一个空的vue对象挂载到Vue原型上，这样每个组件对象都可以使用~

```js
Vue.prototype.$EventBus = new Vue()
```

**第二种方式**

创建一个模块Bus.js，导出一个空的vue对象，需要就导入

```js
// Bus.js
import Vue from 'vue'
export const EventBus = new Vue();
```

实质上，它是一个不具备 DOM 的组件，它具有的仅仅只是组件的**实例方法**而已，因此它非常的**轻便**。

**2.发送和接收事件**

- `EventBus.$emit('emit事件名'，数据)`发送
- `EventBus.$on("emit事件名", callback(payload1,…))` 接收

举例导入Bus.js模块的方式通过事件总线传递信息

```vue
<!-- A.vue -->
<template>
    <p>{{msgB}}</p>
    <button @click="sendMsgA()">-</button>
</template>

<script> 
import { EventBus } from "../Bus.js";
export default {
    data(){
        return {
        msg: ''
        }
    },
    mounted() {
        EventBus.$on("bMsg", (msg) => {
            // a组件接受 b发送来的消息
            this.msg = msg;
        });
    },
    methods: {
        sendMsgA() {
            EventBus.$emit("aMsg", '来自A页面的消息'); // a 发送数据
        }
    }
}; 
</script>


<!-- B.vue -->
<template>
  <p>{{msgA}}</p>
    <button @click="sendMsgB()">-</button>
</template>

<script> 
import { EventBus } from "../event-bus.js";
export default {
    data(){
        return {
        msg: ''
        }
    },
    mounted() {
        EventBus.$on("aMsg", (msg) => {
            // b组件接受 a发送来的消息
            this.msg = msg;
        });
    },
    methods: {
        sendMsgB() {
            EventBus.$emit("bMsg", '来自b页面的消息'); // b发送数据
        }
    }
};
</script>
```

如果只想接收一次，可以使用`EventBus.$once('事件名', callback(payload1,…)`

**优缺点**

**优点**

- 解决了多层组件之间繁琐的事件传播。
- 使用原理十分简单，代码量少。

**缺点**

- vue是单页面应用，如果在某一个页面刷新了之后，与之相关的EventBus会被移除，这样可能出现一下意外bug
- 如果有反复操作的页面，EventBus在监听的时候就会**触发很多次**，也是一个非常大的隐患。通常会用到，在vue页面**销毁时**，同时**移除EventBus**事件监听。
- 由于是都使用一个Vue实例，所以容易出现**重复触发**的情景，两个页面都定义了**同一个事件名**，并且没有用$off销毁（常出现在路由切换时）。

# 父组件到子组件更新的方式是什么样的？

prop使得其父子 prop 之间形成了一个**单向下行绑定**：**父级 prop 的更新**会向下流动到子组件中，但是反过来则不行。

这样会防止从子组件意外变更父级组件的状态，从而导致你的应用的**数据流向**难以理解。

每次**父级组件发生变更**时，子组件中所有的 prop 都将会**刷新**为最新的值。这意味着你**不应该**在一个子组件内部直接改变 prop。

**那要是想变更prop呢？**

通过**发射事件**去通知父组件修改

两种常见的试图变更一个 prop 的情形：

**一**，**这个 prop 用来传递一个初始值；这个子组件接下来希望将其作为一个本地的 prop 数据来使用**

最好定义一个**本地的 data property** 并将这个 prop 用作其初始值（仅限于基本类型）

```js
props: ['initialCounter'],
data () {
  return {
    counter: this.initialCounter
  }
}
```

**二**

**这个 prop 以一种原始的值传入且需要进行转换**。最好依赖于这个 prop 的值来派生一个计算属性

```js
props: ['size'],
computed: {
  normalizedSize: function () {
    return this.size.trim().toLowerCase()
  }
}
```

**注意**

在 JavaScript 中**对象和数组**是通过引用传入的，所以对于一个数组或对象类型的 prop 来说，在子组件中改变变更这个对象或数组本身**将会影响**到父组件的状态。

# vue的生命周期？



vue**的生命周期怎么理解？**

每个 **Vue 实例**从**创建到销毁**的过程叫vue的生命周期。同时在这个过程中也会**运行**一些叫做**生命周期钩子**的函数，这给了用户在不同阶段添加自己的代码的机会。

**vue有哪些生命周期钩子？**

| 钩子            | 调用时机                                              | 工作内容                                                     | 注意                                                         |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| beforeCreate    | 在**实例初始化之后**,同步调用。                       | **数据侦听**、**事件/侦听器**配置                            |                                                              |
| created         | 在**实例创建完成后**，立即同步调用。                  | **计算属性**、**方法**、**事件/侦听器的回调函数**。          | $el property 目前尚不可用。                                  |
| beforeMount     | 在**挂载开始之前**调用                                | 相关的 **render 函数**首次被调用                             | 该钩子在**服务器端渲染**期间不被调用                         |
| mounted         | **实例被挂载后**调用                                  | el 被新创建的 vm.$el **替换**了。如果根实例挂载到了一个文档内的元素上，当 mounted 被调用时 vm.$el 也在文档内。 | 1.不会保证所有的子组件也都被挂载完成。如果你希望等到整个视图都渲染完毕再执行某些操作，可以在 mounted 内部使用 <br />2.vm.$**nextTick**；该钩子在**服务器端渲染**期间不被调用 |
| beforeUpdate    | 在**数据发生改变后，DOM 被更新之前**调用。            | 这里适合在现有 DOM 将要被更新之前访问它，比如移除手动添加的事件监听器。 | 该钩子在**服务器端渲染**期间不被调用，因为只有初次渲染会在服务器端进行 |
| updated         | 数据更改导致的**虚拟 DOM 重新渲染和更新完毕之后**调用 | 当这个钩子被调用时，组件 DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。然而在大多数情况下，你应该**避免在此期间更改状态**。如果要相应状态改变，通常最好使用**计算属性**或 **watcher** 取而代之 | 1.不会保证所有的子组件也都被重新渲染完毕。如果你希望等到整个视图都渲染完毕，可以在 updated 里使用 vm.$**nextTick**；<br />2.该钩子在**服务器端渲染**期间不被调用 |
| activated       | 被 **keep-alive** 缓存的组件**激活时**调用。          |                                                              | 该钩子在**服务器端渲染**期间不被调用                         |
| deactivated     | 被 **keep-alive** 缓存的组件**失活时**调用。          |                                                              | 该钩子在**服务器端渲染**期间不被调用                         |
| beforeUnmounted | 实例**销毁之前**调用，在这一步，实例仍然完全可用      |                                                              | 该钩子在**服务器端渲染**期间不被调用                         |
| Unmounted       | **实例销毁后**调用。                                  | 对应 Vue 实例的所有**指令都被解绑**，所有的**事件监听器被移除**，所有的**子实例也都被销毁。** | 该钩子在**服务器端渲染**期间不被调用。                       |



# 你了解nextTick多少？

在此之前，需要聊聊

**什么是异步更新队列？**

Vue 在更新 DOM 时是**异步**执行的。

只要侦听到数据变化，Vue 将开启一个队列，并**缓冲**在**同一事件循环**中发生的所有数据变更。

如果同一个 watcher 被**多次触发**，只会被推入到队列中**一次**。

在缓冲时**去除重复**数据对于避免不必要的计算和 DOM 操作是非常重要的。

在下一个的事件循环“tick”中，**Vue 刷新队列并执行实际 (已去重的) 工作。**

Vue 在内部对异步队列尝试使用原生的 `Promise.then`、`MutationObserver` 和 `setImmediate`，如果执行环境不支持，则会采用 `setTimeout(fn, 0)` 代替。

例如，当你设置 `vm.someData = 'new value'`，该组件不会立即更新。当刷新队列时，组件会在下一个事件循环“tick”中更新。

**要是想基于更新后的 DOM 状态来做点什么呢？**

那就使用nextTick吧！这样回调函数将在 DOM 更新完成后被调用。

`$nextTick()` 返回一个 `Promise` 对象，相当于把DOM更新完要做的操作放到**微任务队列**

# keep-alive是什么？

是一个抽象组件。（它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中。）

包裹**动态组件**时，会**缓存**不活动的组件实例，而**不是销毁**它们。

当组件在 `<keep-alive>` 内被切换，该组件的的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会被对应执行。

**应用场景**

当需要**保存组件的某些状态**（如滚动位置）下一次返回就**恢复那些状态**时，就**不能销毁**组件，而是将这些**状态缓存**起来，这时就可以使用keep-alive

# 你怎么使用插槽？

插槽有个非常棒的的功能：

**复用**组件的前提下，你还可以**动态的拓展**该组件。

`<navigation-link>` 的模板

```html
<navigation-link url="/profile">
  <slot>123</slot>
</navigation-link>
```

**复用**

```html
<navigation-link url="/profile">
  Your Profile
</navigation-link>
```

当组件渲染的时候，`<slot></slot>` 将会被替换为“Your Profile”。插槽内可以包含**任何模板代码**，当**没内容替换**插槽的内容时，会**默认使用**插槽的**模板代码**（123）

```html
<navigation-link url="/profile">
  Your Profile
</navigation-link>
```

这个又叫**匿名插槽**

这时你可能会想：一个插槽不够用啊~

你放心，可以使用**多个插槽**。

这时你可能又会问：那多个插槽之间怎么区分使用的哪一个？

起个名字呗

这就是**具名插槽**的由来~

**具名插槽的使用**

- 定义时 `slot`元素加`name="xxx"`属性
- 使用时 替换元素加 `v-slot="xxx"` 属性

**基础模板**

`<base-layout>` 组件

```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

**拓展** 

在向具名插槽提供内容的时候，可以在一个 `<template>` 元素上使用 `v-slot` 指令，并以 `v-slot` 的参数的形式提供其名称

（`<template>` 元素可以换成任何html元素~）

```html
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

最终会被渲染出

```html
<div class="container">
  <header>
    <h1>Here might be a page title</h1>
  </header>
  <main>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </main>
  <footer>
    <p>Here's some contact info</p>
  </footer>
</div>
```

你可以理解为**对号入座**式拓展，有了名字，拓展起来的不会乱啦~

