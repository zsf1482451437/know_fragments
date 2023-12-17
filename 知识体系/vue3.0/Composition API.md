# 1 mixin

如果**组件之间**存在相同的代码逻辑，我们希望对**相同**的代码逻辑进行**抽取**。

mixin提供一种灵活的方式，来**分发vue组件中可复用的功能**

一个mixin对象可以包含**任何组件选项（option）**

## 1.1 局部混入

a组件

```js
data() {
    return {
        msg: 'hhh'
    }
}
```

b组件

```js
data() {
    return {
        msg: 'hhh'
    }
}
```

存在可复用逻辑

混入

```js
export const a_b_minxin = {
    data() {    
    	return {        
        	msg: 'hhh'    
        }
    }
}
```

a组件、b组件可以这样写

```js
import { a_b_minxin } from './mixins'

mixin: ['a_b_minxin']
```

不止data选项，其它选项和生命周期也可以抽取。

## 1.2 全局混入

**如果希望混入的对象放进所有组件呢？**

使用app的api

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mixin({
    想混入的的内容
})
app.mount('#app')
```



## 1.3 合并规则

当混入的对象中的**选项**和组件对象中的选项出现**冲突**

分情况：

- 如果是**data**函数返回值对象，会**保留组件自身的数据**
- 如果是**生命周期钩子函数**，会被**合并到数组**中，都会被调用
- **其它选项**，比如**methods、components**等等，将会合并为同一个对象，如果对象的**key相同**，会**取组件对象的键值对**

# 2 options API的弊端

## 2.1 同一个逻辑分散

- **实现某个功能**时，这个功能**对应的代码逻辑**会被**拆分到各个选项**中
- 当组件变得更大，更复杂时，逻辑关注点的列表会增长，同一个功能的逻辑就会**被拆分的很分散**

比如一个计数器功能

```html
<h2>{{ counter }}</h2>
<button @click="increment">+1</button>
<button @click="decrement">-1</button>
```

```js
data() {
    return {
        counter: 0
    }
},
methods: {
    increment() {
        counter++
    },
    decrement() {
        counter--
    }
}
```

你看，**计数器功能**的逻辑被**拆分到data和methods**里面了。一个功能的逻辑被拆分了你可觉得没什么，但是如果多个功能的逻辑都被拆分了，**可读性非常不好**。

如果某一天你**想修改某个逻辑**，那你可有的忙啦，不是吗？



# 3 setup()

如果我们能将同一个**逻辑关注点相同**的代码**收集在一起**，不是更好么？

这就是Composition API想做的事

Vue Composition API也有人叫VCA

setup()是组件的一个选项，用来替代（**methods、computed、watch、data、生命周期**等等）

## 3.1 参数

```js
setup(props, context) {}
```

### props

父组件传过来的属性

如果**setup**中需要使用，拿到**props**参数即可

### context

也叫SetupContext，包含3个属性：

- **attrs**：所有非prop的属性（如id、class等等这些属性）
- **slots**：父组件传递过来的插槽（这以渲染函数返回时才有用）
- **emit**：组件内部需要发射事件时会用到（因为不能访问this，所以不可以通过this.$emit发射事件）

## 3.2 返回值

setup既然是个函数，那它也可以有返回值。它的返回值用来做什么呢？

可以在**模板template**中使用

可以通过setup返回值来替代data选项

```html
<h2>{{ msg }}</h2>
```

```js
setup() {
    return {
        msg: 'hhh'
    }
}
```

你就会看到hhh的标题~



## 3.3 不可以使用this

setup并没有绑定this，**this并没有指向当前组件实例**（之前官网说明的原因是：执行setup之前，组件实例还没有被创建出来。这个说法是错误的，后来已修改。**组件实例创建出来后，才执行setup的，但是this并没有绑定当前组件实例**）

**setup的调用发生在data、property、computed或methods被解析之前**，所以他们无法在setup中被获取

（vue2在methods、生命周期中可以拿到this，指向的是当前组件实例）

## 3.4 获取ref

在vue2，我们要想获取一个**元素或组件**的信息，是这样的

通过**this.$refs**

```html
<h2 ref="h">哈哈哈</h2>
```

```js
methods: {
    foo() {
        console.log(this.$refs.h)
    }
}
```

但是vue3的setup里面是**不能通过this获取当前组件实例**的，所以不能通过**this.$refs**获取组件或元素的信息

**那怎么获取？**

```html
<h2 ref="title">哈哈哈</h2>
```

```js
import { ref } from 'vue'
setup() {
    const title = ref(null)
    return {
        title
    }
}
```

当h2节点**挂载完成**，就可以通过**title.value**获取到h2的信息，组件亦是如此

## 3.5 顶层写法

后面补充~

# 4 Reactive API

## 4.1 **响应式**

在setup里面定义的变量，**不是响应式**的，尽管你修改该变量的值，在界面上也不会响应。

date里的变量可以做到响应式的原因是：vue内部将data里面内部的变量经过**reactive()**函数的处理

其实界面上拿到的变量时**reactive()处理过的返回值**

```html
<h2>{{ counter }}</h2>
<button @click="increment">+</button>
```

```js
setup() {
    let counter = 100
    const increment = () => {
        counter++
    }
    return {
        counter,
        increment
    }
}
```

这样虽然可以在界面上显示，但是当你点击+号时，界面并没有响应counter的变化（实际上counter已经变了）

**你需要将counter传进reactive函数**

```html
<h2>{{ state.counter }}</h2>
<button @click="increment">+</button>
```

```js
import { reactive } from 'vue'
setup() {
    const state = reactive({
        counter: 100
    })
    const increment = () => {
        state.counter++
    }
    return {
        state,
        increment
    }
}
```

## 4.2 其它API

### isProxy()

检查对象**是否是由reactive或readonly创建的proxy**

### isReactive()

- 检查对象**是否由reactive创建的proxy**
- 如果**该proxy是由readonly创建的**，但是**包裹了由reactive创建的另一个proxy**，它也会返回true

```js
const readonlyObj = readonly(reactiv(obj1))
isRactive(obj)// true
```

### isReadonly()

检查对象**是否是由readonly创建的proxy**

### toRaw()

返回**reactive或readonly**代理的原始对象（不建议保留对原始对象的持久引用，谨慎使用）

### shallowReactive()

创建一个proxy，它跟踪其自身property的响应式，但**不执行嵌套对象的深层响应式转换**（深层还是原生对象）

**什么意思呢？**

```js
const obj = reactive({
    name: 'zsf',
    friend: {
        name: 'hhh'
    }
})
obj.friend.name = 'lll'
```

**reactive()**对一个对象进行**响应式转换**是**彻底的**：如果该对象内部**嵌套**着对象（不管多少层），都会**一律变成响应式**

但是如果你希望只是**对象最外层的属性**是响应式的，就可以使用**shadowReactive**()啦

### shallowReadonly()

创建一个proxy，使其自身的property为只读，但**不执行嵌套对象的深度只读转换**（深度还是可读，可写的）

类似**shallowReactive()**，只有**对象最外层**的属性是**只读**的



# 5 Ref API

reactive()对传入的类型是**有限制**的，它要求我们必须传入的是一个**对象或数组类型**，如果传基本数据类型（String、Number、Boolean）会报一个警告

如果你觉得要通过**state.counter**使用有点麻烦，只是想单纯地对counter这个**基本类型**实现**响应式**

那就使用**Ref API**吧

## 5.1 ref自动解包

ref()会返回一个**可变的响应式对象**，该对象作为一个响应式的**引用**维护这它内部的值

它内部的值是**在ref的value属性**中被维护的

```html
<h2>{{ value }}</h2>
<button @click="increment">+</button>
```

```js
import { ref } from 'vue'
setup() {
    let counter = ref(100)
    const increment = () => {
        counter.value++
    }
    return {
        counter,
        increment
    }
}
```

这样counter就变成了一个ref的**可响应式引用**

理论上使用**counter.value**才可以使用counter的值，但vue为了我们开发方便，它做了这么一件事：

**当我们在template模板中使用ref对象，它会自动进行解包**

换句话说：**template模板中使用时直接counter就行**

这时你可能想问：**setup中可不可以也这样使用呢？**

不可以。上面说到，**当我们在template模板中使用ref对象，它会自动进行解包**。

所以这样的用法**只能在template模板中**使用，别的地方想拿到原本counter的值（100），就要**counter.value**

## 5.2 浅层解包

**ref对象的解包是浅层的**

### 普通对象

如果最外层包裹的是**普通对象**（假设叫obj，obj包裹counter），然后在template中通过**obj.counter**使用，是不会解包的。

```html
<h2>{{ obj.counter }}</h2>
<button @click="increment">+</button>
```

```js
import { ref } from 'vue'
setup() {
    let counter = ref(100)
    const obj = {
        counter
    }
    const increment = () => {
        counter.value++
    }
    return {
        counter,
        increment
    }
}
```

如果这样写，你会发现报错了。你得**obj.counter.value**才行

### reactive可响应式对象

但是，如果最外层包裹**reactive可响应式对象**，那么内容的ref是可以解包的



```html
<h2>{{ reactiveObj.counter }}</h2>
<button @click="increment">+</button>
```

```js
import { ref, reactive } from 'vue'
setup() {
    let counter = ref(100)
    const reactiveObj = reactive({
        counter
    })
    const increment = () => {
        counter.value++
    }
    return {
        counter,
        reactiveObj,
        increment
    }
}
```

这样写是没什么问题的，但是开发中**不推荐**。

## 5.3 其它API

### toRefs()

如果使用es6的**解构**语法，对**reactive()**返回的对象进行**解构赋值**，不再是响应式

```html
<h2>{{ name }}-{{ age }}</h2>
<button @click="increment">+</button>
```

```js
import { reactive } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 100
    })
    let { name, age } = info
    const increment = () => {
        age++
    }
    return {
        name,
        age,
        increment
    }
}
```

当你点击+号，你会发现屏幕上age没变（解构后不再是响应式啦）

这里的`let { name, age } = info`就相当于

```js
let name = 'zsf'
let age = 100
```

我们已经知道，在**setup**中只是简单的声明变量，就**不是响应式**的。

但是开发中要是这么一个需求：**解构后依然是响应式**，怎么办？

使用**toRefs()**

```html
<h2>{{ name }}-{{ age }}</h2>
<button @click="increment">+</button>
```

```js
import { reactive, toRefs } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 100
    })
    let { name, age } = toRefs(info)
    const increment = () => {
        age.value++
    }
    return {
        name,
        age,
        increment
    }
}
```

`let { name, age } = toRefs(info)`做的事情是：`name = ref.name, age = ref.age`

相当于用name和age分别指向是响应式的**ref.name、ref.age**

**注意：age.value才能拿到age的值，template里只使用age是因为vue自动解包了**（上面讲过了）

toRefs()使**info.age和ref.age**建立了**链接**，**任何一个修改都会引起另外一个变化**，所以上面increment函数里面的age.value换成info.age也行

当你再点击+号，屏幕上的age就会变啦

### toRef()

与toRefs()不同，toRefs()是将**所有**的属性变成**对应的ref对象**

而toRef()是转换一个

```js
import { reactive, toRef } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 100
    })
    let age = toRef(info, 'age')
    return {
        age
    }
}

```

### unref()

如果想获取一个ref引用中的value，也可以通过**unref()**

如果参数是个ref，则返回**内部值**，否则返回**参数本身**

unref()其实是 `val = isRef(val) ? val.value : val`语法糖函数

### isRef()

判断**是否是一个ref对象**

### shalldowRef()

创建一个**浅层的ref对象**

### triggerRef()

手动触发和**shalldowRef()**相关联的**副作用**

```html
<h2>{{ name }}</h2>
<button @click="increment">+</button>
```

```js
import { shallowRef, triggerRef } from 'vue'
setup() {
    const info = shallowRef({
        name: 'zsf',
        friend: {
            name: 'hhh'
        }
    })
    const changeInfo = () => {
        info.value.name = 'lll'
        triggerRef(info)
    }
    return {
        info,
        changeInfo
    }
}
```

shalldow()产生了浅层ref对象这个**副作用**，如果想消去这个副作用，使用**triggerRef()**

shalldow()和triggerRef()结合使用，其实就是**ref()**的功能

### customRef()

创建一个自定义的ref，并**对其依赖项跟踪和更新触发**进行**显示控制**

- 它需要一个**工厂函数**，该函数接受**track函数**和**trigger函数**作为**参数**
- 并且**返回**一个带有**get和set**的**对象**

```js
function my_ref() {
    return customRef((track, trigger) => {
        return {
            get() {
                track()
                return value
            },
            set(newValue) {
                value = newValue
                trigger()
            }
        }
    })
}
```

一个对象，当使用时**track()**收集依赖，设置时**trigger()**更新

## 5.4 老人言

能用ref就用ref，reactive不方便代码抽离~

# 6 readonly()

通过**reactive或者ref**可以获取到一个**响应式的对象**，但是在某些情况下，可以将该**响应式的对象**传给其它地方使用，但是**不希望被修改**

vue3提供了**readonly()**

readonly()**会返回原生对象的只读代理**（依然是个Proxy，proxy的set()被劫持，且不能对其进行修改）

## 6.1 原理

它内部的原理大概是这样的

```js
const obj = {
    name: 'zsf'
}
const objProxy = new Proxy(obj, {
    get(target, key) {
        return target[key]
    },
    set(taget, key, value) {
        警告：不允许修改！
    }
})
objProxy.name = 'hhh'// 警告：不允许修改！
```

## 6.2 基本使用

```html
<button @click="update">修改</button>
```

```js
import { readonly } from 'vue'
setup() {
    const obj = {
        name: 'zsf'
    }
    const proxyObj = readonly(obj)
    const update = () => {
        proxyObj.name = 'hhh' 
    }
    return {
        update
    }
}
```

当你点击修改，就会出现警告！

# 7 computed()

**setup是如何替换掉option API中的computed的呢？**

使用computed()

**computed()**返回值是一个ref对象

```html
<h2>{{ fullName }}</h2>
<button @click="changeName">改名</button>
```

```js
import { ref, computed } from 'vue'
setup() {
    const firstName = ref('z')
    const lastName = ref('sf')
    cosnt fullName = computed(() => {
        return firstName.value + '' + lastName.value
    })
    const changeName = () => {
        firstName.value = 'h'
    }
    return {
        fullName,
        changeName
    }
}
```

# 8 watch

**setup是如何替换掉option API中的watch的呢？**

- **watchEffect()**自动收集**响应式数据**的依赖
- **watch()**需要手动指定侦听的**数据源**

## 8.1 watchEffect()

- 参数：接收一个**函数**，默认**立即执行一次**
- 返回值： 是个函数

```html
<h2>{{ name }}-{{ age }}</h2>
<button @click="changeName">修改name</button>
<button @click="changeAge">修改age</button>
```

```js
import { ref, watchEffect } from 'vue'
setup() {
    const name = ref('zsf')
    const age = ref(18)
    const changeName = () => name.value = 'hhh'
    const changeAge = () => age.value++
    watchEffect(() => {
        console.log(name.vlaue, age.value)
    })
    return {
        name,
        age,
        changeName,
        changeAge
    }
}
```

当你点击这两个按钮,使收集的**依赖发生变化**，会执行**watchEffect()**

### 原理

默认**立即执行一次**的过程中，它会**收集**用了哪些**可响应式的对象**（也就是**收集依赖**）

只有收集的依赖发生变化时，**watchEffect()**传入的函数才会再次执行

### 停止侦听

**如果想在某些情况下停止侦听呢？**

比如上面的例子，当年龄到25不再侦听，可以使用**watchEffect()的返回值函数**，调用它即可

```html
<h2>{{ age }}</h2>
<button @click="changeAge">修改age</button>
```

```js
import { ref, watchEffect } from 'vue'
setup() {
    const age = ref(18)
    const changeAge = () => {
        age.value++
        if(age.value > 25) {
            stop()
        }
    }
    const stop = watchEffect(() => {
        console.log(name.vlaue, age.value)
    })
    return {
        age,
        changeAge
    }
}
```

### 清除副作用

**什么是清除副作用呢？**

在开发中我们需要在**侦听函数中**发起**网络请求**，但在网络请求还没到达时，**停止了侦听器**，或者**侦听器侦听函数再次被执行了**

那么**上一次的网络请求应该被取消掉**，这个时候就可以**清除上一次的副作用**了

watchEffect**第一个参数**接收一个**函数**（假设叫foo）,而foo的**参数**，又接收一个函数**foo1**，取消操作一般**foo1**里面执行

```html
<h2>{{ age }}</h2>
<button @click="changeAge">修改age</button>
```

```js
import { ref, watchEffect } from 'vue'
setup() {
    const age = ref(18)
    const changeAge = () => {
        age.value++
    }
    const stop = watchEffect((foo) => {
        foo(() => {
            // 取消操作
        })
        console.log(name.vlaue, age.value)
    })
    return {
        age,
        changeAge
    }
}
```

### 执行时机

```html
<h2 ref="title">哈哈哈</h2>
```

```js
import { ref } from 'vue'
setup() {
    const title = ref(null)
    return {
        title
    }
}
```

当h2节点**挂载完成**，就可以通过**title.value**获取到h2的信息，组件亦是如此

但是，setup执行发生在**节点挂载之前**，现在的**title.value**是null

要是想拿到**title.value**的值呢？

使用watchEffect()的**第二个参数**，等节点**挂载完成**再执行watchEffect()的回调。这样，**title.value**就有值啦

```js
import { ref, watchEffect } from 'vue'
setup() {
    const title = ref(null)
    watchEffect(() => {
        console.log(title.value)
    }, {
        flush: 'post'
    })
    return {
        title
    }
}
```

## 8.2 watch()

与watchEffect相比，watch允许我们：

- **惰性**执行副作用（第一次不会直接执行）；
- 更**具体**说明当哪些状态发生改变时，才触发侦听器的执行
- 可以访问侦听器变化**前后的值**



### 侦听单个数据源

**参数1-数据源**，有两种类型：

- 一个getter函数，但是该函数必须引用一个**reactive或ref对象**
- 一个可响应式对象，ref或者是reactive对象（常用的是ref对象）

**参数2-新旧值**



**传入getter函数**

```html
<h2>{{ info.name }}</h2>
<button @click="changeName">修改name</button>
```

```js
import { reactive, watch } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 18
    })
    watch(() => info.name, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    })
    const changeName = () => {
        info.name = 'hhh'
    }
    return {
        changeName,
        info
    }
}
```

**传入可响应式对象**

```js
import { reactive, watch } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 18
    })
    watch(info, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    })
    const changeName = () => {
        info.name = 'hhh'
    }
    return {
        changeName
    }
}
```

传入reactive对象的话，**oldValue和newValue**拿到的值是**reactive创建出来的Proxy对象的value**

传入ref对象的话，**oldValue和newValue**拿到的值才是**value值的本身**（原生对象的value）

```js
import { ref, watch } from 'vue'
setup() {
    const name = ref('zsf')
    watch(name, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    })
    const changeName = () => {
        name.value = 'hhh'
    }
    return {
        changeName
    }
}
```

如果你想让传入reactive对象时，**oldValue和newValue**也是**普通对象的值**

你可以**对info解构**（变成普通对象了），然后再**return**，变成一个getter函数

```js
import { reactive, watch } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 18
    })
    watch(() => {
        return {...info}
    }, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    })
    const changeName = () => {
        info.name = 'hhh'
    }
    return {
        changeName
    }
}
```

### 侦听多个数据源

```js
import { ref, reactive, watch } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 18
    })
    const name = ref('zsf')
    watch([info, name], (newValue, oldValue) => {
        console.log(oldValue, newValue)
    })
    const changeName = () => {
        info.name = 'hhh'
    }
    return {
        changeName
    }
}
```

这样oldValue和newValue分别就会多个值而已

### 深度侦听

默认

将可响应式对象解构之后不是深度侦听了

```js
import { reactive, watch } from 'vue'
setup() {
    const info = reactive({
        name: 'zsf',
        age: 18
    })
    watch(() => {
        return {...info}
    }, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    })
    const changeName = () => {
        info.name = 'hhh'
    }
    return {
        changeName
    }
}
```

要想解构之后继续深度侦听，得传第三个参数

```js
watch(() => {
        return {...info}
    }, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    }, {
    deep: true
})
```

### 立即执行

如果想一开始就执行一次侦听器

同样在第三个参数，**immediate: true**就行

```js
watch(() => {
        return {...info}
    }, (newValue, oldValue) => {
        console.log(oldValue, newValue)
    }, {
    deep: true,
    immediate: true
})
```

# 9 生命周期钩子

**setup是如何替换声明周期钩子的呢？**

通过**onX()**这种API，其中X就是updated、mounted等等这些生命周期

```js
import { onCreated, onUpdated, onMounted } from 'vue'
setup() {
    onUpdated(() => {
        console.log('updated')
    })
    其它同理
}
```

**注意：**

- created和beforeCreated**没有对应的API**，如果想在这两个生命周期执行回调函数，直接放setup里即可；
- 同一个生命周期**可以出现多次**

# 10 provide/inject

## 10.1 使用

父组件

```js
import { provide } from 'vue'
setup() {
    const name = 'zsf'
    let counter = 100
    provide('name', name)
    provide('counter', counter)
}
```

子孙组件

```html
<h2>{{ name }}-{{ counter }}</h2>
```

```js
import { inject } from 'vue'
setup() {
    const name = inject('name')
    const counter = inject('counter')
    return {
        name,
        counter
    }
}
```

用法其实和vue2差不多，不过是通过api的方式在setup里面执行

## 10.2 搭配readonly

当父组件传过来的是**可响应式对象**，那**子孙组件**改变该对象，父组件也会受影响，这不符合**单向数据流**

所以**父组件在提供数据时，应该限制只读**

这不就是**readonly()**的发挥作用的时候了嘛~

```js
import { ref, provide, readonly } from 'vue'
setup() {
    const name = ref('zsf')
    let counter = ref(100)
    provide('name', readonly(name))
    provide('counter', readonly(counter))
}
```

如果父组件的**某个数据确实需要改**，子孙组件应该是通过**发射事件**的形式，通知**父组件去修改**

# 11 hook案例

## 11.1 计数器

### vue2写法

```html
<h2>当前计数：{{ counter }}</h2>
<h2>计数+2：{{ doubleCounter }}</h2>
<button @click="increment">+1</button>
<button @click="increment">-1</button>
```

```js
data() {
    return {
        counter: 0
    }
},
computed: {
  doubleCounter() {
      return this.counter * 2
  }  
},
methods: {
    increment() {
        this.counter++
    },
    decrement() {
        this.counter--
    }
}
```

计数器逻辑被**分散**到data、methods、computed里面了

想利用mixin**复用**这逻辑时，是**不方便**的，而且也有可能出现**命名冲突**的问题

### vue3写法

Home.vue

```html
<h2>当前计数：{{ counter }}</h2>
<h2>计数+2：{{ doubleCounter }}</h2>
<button @click="increment">+1</button>
<button @click="increment">-1</button>
```

```js
import { ref, computed } from 'vue'
setup() {
    const counter = ref(0)
    const doubleCounter = computed(() => counter.value * 2)
    const increment = () => counter.value++
    const decrement = () => counter.value--
    return {
        counter,
        doubleCounter,
        increment，
        decrement
    }
}
```

你看，同一个逻辑的代码都聚集在一起，维护起来不是方便许多吗？

还可以将这部分抽离出来

建一个**hook**目录，目录下新建一个**useCounter.js**

```js
import { ref, computed } from 'vue'
export default function() {
    const counter = ref(0)
    const doubleCounter = computed(() => counter.value * 2)
    const increment = () => counter.value++
    const decrement = () => counter.value--
    return {
        counter,
        doubleCounter,
        increment，
        decrement
    }
}
```

Home.vue就可以这样写了

```html
<h2>当前计数：{{ counter }}</h2>
<h2>计数+2：{{ doubleCounter }}</h2>
<button @click="increment">+1</button>
<button @click="increment">-1</button>
```

```js
import useCounter from './hook/useCounter.js'

setup() {
    const { counter, doubleCounter, increment，decrement } = useCounter()
    return {
        counter,
        doubleCounter,
        increment，
        decrement
    }
}
```

这样，一个逻辑的代码都聚集在一起，可读性好，而且，要是想复用**useCounter()**不是很方便了吗？

## 11.2 修改网页标签页名字

### 需求

- **参数** 网页名
- **返回值** 网页名的ref对象，当网页名再次修改时，**document.title = 网页名**重新执行

Home.vue

```js
import useTitle from './hook/useTitle.js'

setup() {
    const titleRef = useTitle('zsf')
    setTimeout(() => {
        titleRef.value = 'hhh'
    }, 2000)
}
```

**useTitle.js**

```js
import { ref, watch } from 'vue'
export default function(title = 'default') {
    const titleRef = ref(title)
    watch(titleRef, (newValue) => {
        document.title = newValue
    }, {
        immediate: true
    })
}
return titleRef
```

这样你会发现，一开始网页名为**zsf**，2秒后变成**hhh**

## 11.3 监听滚动位置

### 需求

- **右下角实时显示滚动位置**

Home.vue

```html
<div class="scroll">
    <div class="scroll-x">scrollX:{{ scrollX }}</div>
    <div class="scroll-y">scrollY:{{ scrollY }}</div>
</div>
```

```js
import useScrollPosition from './hook/useScrollPosition.js'

setup() {
    const { scrollX, scrollY } = useScrollPosition()
    return {
        scrollX,
        scrollY
    }
}
```

```css
.scroll {
    position: fixed;
    right: 30px;
    bottom: 30px;
}
```

为了能滚动，尽量让容器宽高超过设备，这里就不写了~

**useScrollPosition.js**

```js
import { ref } from 'vue'
export default function() {
    const scrollX = ref(0)
    const scrollY = ref(0)
    document.addEventListener('scroll', () => {
        scrollX.value = window.scrollX
        scrollY.value = window.scrollY
    })
    return {
        scrollX,
        scrollY
    }
}
```

## 11.4 使用缓存

### 需求

- 只传key，取value
- 传key-vlaue，保存
- 当value变化，重新执行保存

**useLocalStorage.js**

```js
import { ref, watch } from 'vue'
export default function(key, value) {
    const data = ref(value)
    // 传key-value，保存到缓存；只传key，取value
    if(value) {
        window.localStorage.setItem(key, JSON.stringify(value))
    } else {
        data.value = JSON.parse(window.localStorage.getItem(key))
    }
    // 当value变化，重新执行保存到缓存
    watch(data, (newValue) => {
        window.localStorage.setItem(key, JSON.stringify(newValue))
    })
    
    return data
}

```

# 12 优秀的编码习惯

Home.vue

```js
import useScrollPosition from './hook/useScrollPosition.js'
import useTitle from './hook/useTitle.js'
import useCounter from './hook/useCounter.js'
setup() {
    ...
}
```

当需要导入的模块很多时，可能可读性不够好

这时需要在**hook**目录下新建一个**index.js**(统一的导出出口)

**index.js**

```js
import useScrollPosition from './useScrollPosition.js'
import useTitle from './useTitle.js'
import useCounter from './useCounter.js'
export {
	useScrollPosition,
    useTitle,
    useCounter
}
```

Home.vue就可以这样写了

```js
import {
    useScrollPosition,
    useTitle,
    useCounter
} from './hook'
```

利用webpack对路径的解析特点（导入省略目录下的index.js），并且某种程度抽取了路径（现在在Home.vue只要写一份）,代码看起来更简洁~
