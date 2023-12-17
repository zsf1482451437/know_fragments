**为什么需要hooks？**

- React16.8新增特性，它可以让我们在不编写class的情况下使用**state**以及其它的**React特性**（比如生命周期）
- 函数式组件有两个缺陷：
  - 1）不能保存状态；
  - 2）修改状态不会重新渲染，就算能重新执行，状态也会被初始化；

- 类组件随着业务的增多，比如componentDidMount可能包含大量的逻辑代码，包括网络请求、一些事件的监听（还需要在componentWillUNmount中移除），导致逻辑难以拆分；

# 使用场景

- hook基本可以代替所有使用**class组件**的地方；
- 若是一个旧的项目，并不需要直接将所有的代码重构为hooks，因为它完全**向下兼容**，可以**渐进式**的来使用它；
- hook只能在**函数组件**中使用；

只能在**函数式组件**中使用，并且置于**顶层**（最外层）

但是也可以在**自定义的hook函数**（命名以use开头）中使用

# useState

## 参数

初始化值，不设置为undefined，只会首次渲染时使用

## 返回值

**数组**，包含两个元素：

- 元素一：当前状态值；
- 元素二：设置状态值的函数；

调用元素二后，会根据新的状态**重新渲染**当前组件

一般来说，在函数执行完之后内存就会被回收，而state中的变量会被react所保留

## 计数器案例

看看使用函数式组件和类组件编写有什么区别

**类组件**

```jsx
import React, { PureComponent } from 'react'

export class CounterClass extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      count: 0
    }
  }
  changeCount (num) {
    this.setState({ count: this.state.count + num })
  }
  render () {
    const { count } = this.state
    return (
      <div>
        <h2>当前计数：{count}</h2>
        <button onClick={e => this.changeCount(1)}>+1</button>
        <button onClick={e => this.changeCount(-1)}>-1</button>
      </div>
    )
  }
}

export default CounterClass
```

**函数式组件结合hook**

**useState**的作用是给函数式组件**定义状态**的，第一个参数是状态的**初始化值**，只有在**首次渲染**时才有效；

返回一个数组，第一个元素就是该**状态**，第二个元素是个**函数**，修改状态的方法，参数是要**修改后的值**；

```jsx
import { memo, useState } from "react"

function CounterHook (props) {
  const [counter, setCounter] = useState(0)
  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={e => setCounter(counter + 1)}>+1</button>
      <button onClick={e => setCounter(counter - 1)}>-1</button>
    </div>
  )
}

export default memo(CounterHook)
```

对比你会发现：**定义状态一行代码，修改状态的方法也不用自己定义**

这样代码是不是变得简洁很多？

# useEffect

useState可以在函数式组件中定义状态以及修改状态，**那生命周期呢？**

**Effect Hook**可以完成一些类似**类组件中生命周期**的功能；

事实上，类似于**网络请求**、**手动更新DOM**、一些**事件的监听**，都是React更新DOM的一些副作用（side Effects）

对于完成这些功能的hook被称之为**Effect Hook**

## 参数

### 参数一

传入一个**回调函数**，当组件渲染完成会自动执行，可以将组件的一些**副作用**放到该函数内；

默认情况下，无论是首次渲染还是组件重新渲染完成，都会执行该回调函数

该函数的返回值是个回调函数，会在组件**重新渲染或组件卸载**的时候执行

### 参数二

该useEffect在哪些**state**发生变化时，才重新执行（受谁影响）；

如果传入一个空的数组，表示不受谁的影响，第一个参数只执行一次；

也就是说，可以决定哪些副作用重新执行；

这个参数使得useEffect比生命周期好用很多；

## 修改标题案例

```jsx
import { memo, useEffect, useState } from "react"

function CounterHook (props) {
  const [counter, setCounter] = useState(0)
  useEffect(() => {
    document.title = counter
  })
  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={e => setCounter(counter + 1)}>+1</button>
    </div>
  )
}

export default memo(CounterHook)
```

## 清除副作用

编写class组件时，某些副作用的代码，需要在**componentWillUNmount**中清除，比如：

- 事件总线或redux手动调用subscribe之后，需要**取消订阅**；

那useEffect是怎么实现类似**componentWillUNmount**中的清除操作呢？



```jsx
useEffect(() => {
  console.log('监听redux中状态变化')
  return () => {
    console.log('取消监听redux中状态变化')
  }
})
```

如果**监听-取消监听**放在class组件中，就会将**监听**操作放**componentDidMount**中，而**取消监听**操作放**componentWillUNmount**中，相关逻辑分散了

而使用**useEffect**后，可以增加代码的**内聚性**

这是effect的**清除机制**

## 多个useEffect

在一个函数式组件中可以有**多个useEffect**，防止一个useEffect处理多个副作用，不同副作用应该分开，逻辑分离，方便后续抽离成自定义hook，就可以复用啦；

## 性能优化

前面说到，useEffect的参数是个回调函数，该函数会在组件渲染完成后执行，如果该组件重新渲染，该函数会**重新执行**

而某些副作用只需要执行一次（组件首次渲染后），比如**网络请求**、**订阅和取消订阅**

多次执行会导致一些性能的问题

```jsx
import { memo, useEffect, useState } from "react"

function CounterHook (props) {
  const [counter, setCounter] = useState(0)
  useEffect(() => {
    console.log('counter修改, 需要重新执行')
  }, [counter])
  useEffect(() => {
    console.log('该副作用只需要重新执行一次')
  }, [])
  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={e => setCounter(counter + 1)}>+1</button>
    </div>
  )
}

export default memo(CounterHook)
```

# 特殊场景的hook

## useContext

**结合context来使用**

之前在组件中共享context的方式：

- 类组件中可以通过**类名.contextType = MyContext** 的方式获取context；
- 多个Context在函数式组件中通过**MyContext.Consumer** 共享context；

但是要用到多个context，代码就会存在大量的嵌套关系，可读性不好

而**useContext**允许我们直接获取**某个context**的值

当**共享的数据发生变化**，那共享过这些数据的**组件也会重新渲染**，获取最新的共享数据；



**根组件**

```jsx
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeContext, UserContext } from './context'

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(
  <UserContext.Provider value={{name: 'zsf'}}>
    <ThemeContext.Provider value={{color: 'red'}}>
      <App/>
    </ThemeContext.Provider>
  </UserContext.Provider>
)
```

**context**

```js
import { createContext } from "react";

const UserContext = createContext()
const ThemeContext = createContext()

export {
  UserContext,
  ThemeContext
}
```

**以前使用context**

```jsx
import React, { memo } from 'react'
import { ThemeContext, UserContext } from './context'

const App = memo(() => {
  return (
    <div>
      <h2>App</h2>
      <UserContext.Consumer>
        {
          value => {
            return (
              <h2>
                {value.name}
                <ThemeContext.Consumer>
                  {
                    value => {
                      return <h2>{value.color}</h2>
                    }
                  }
                </ThemeContext.Consumer>
              </h2>
            )
          }
        }
      </UserContext.Consumer>

    </div>
  )
})

export default App
```

**结合useContext使用context**

```
import React, { memo, useContext } from 'react'
import { ThemeContext, UserContext } from './context'

const App = memo(() => {
  const user = useContext(UserContext)
  const theme = useContext(ThemeContext)
  return (
    <div>
      <h2>App</h2>
      {user.name} - {theme.color}
    </div>
  )
})

export default App
```

## useReducer

useReducer仅仅是useState的一种替代方案；

某些场景下，若**state的处理逻辑**比较复杂，我们可以通过useReducer来对其进行**拆分**；

或这次修改的state需要**依赖之前的state**时，也可以使用；

### 参数

- 1）reducer函数
- 2）state初始化值

### 返回值

**数组**

- 第一个元素是state；
- 第二个元素是dispatch；

## useImperativeHandle

之前是怎么获取子组件的DOM的呢？

```jsx
import React, { forwardRef, memo, useRef } from 'react'

const Hello = memo(forwardRef((props, ref) => {
  return <input type='text' ref={ref} />
}))

const App = memo(() => {
  const titleRef = useRef()

  function showDom () {
    console.log(titleRef.current)
  }

  return (
    <div>
      <Hello ref={titleRef} />
      <button onClick={e => showDom()}>+1</button>
    </div>
  )
})

export default App
```

如果担心父组件除了**获取子组件DOM**之外还进行另外的操作，可以给父组件对子组件的操作**设置权限**

也就是子组件暴露给父组件一部分功能，这时可以使用**useImperativeHandle**

### 参数

1）ref

2）函数，返回ref.current对象，相当于**重置**原来的ref.current对象

```jsx
import React, { forwardRef, memo, useImperativeHandle, useRef } from 'react'

const Hello = memo(forwardRef((props, ref) => {
  // 子组件对父组件传入的ref进行处理
  useImperativeHandle(ref, () => {
    return {
      focus () {
        // 想DOM操作可以在子组件内进行
        console.log('子组件只提供这个方法')
      }
    }
  })
  return <input type='text'/>
}))

const App = memo(() => {
  const titleRef = useRef()

  function showDom () {
    titleRef.current.focus()
  }

  return (
    <div>
      <Hello ref={titleRef} />
      <button onClick={e => showDom()}>+1</button>
    </div>
  )
})

export default App
```

如此一来，子组件**Hello**只向父组件提供**focus**方法，通过titleRef.curent获取的方法只有focus；

## useLayoutEffect

它与useEffect看起来非常相似，只有一点区别：

- useEffect会在**渲染的内容**更新到DOM上后执行，不会阻塞DOM的更新；
- useLayoutEffect会在**渲染的内容更新到DOM之前**执行，会阻塞DOM的更新；

```jsx
import React, { memo, useEffect, useLayoutEffect, useState } from 'react'



const App = memo(() => {
  const [count, setCount]  = useState(0)
  useEffect(() => {
    console.log('useEffect')
  })

  useLayoutEffect(() => {
    console.log('useLayoutEffect')
  })

  console.log('App render')
  return (
    <div>
      <h2>{count}</h2>
      <button onClick={e => setCount()}>+1</button>
    </div>
  )
})

export default App
```

你会看到打印顺序是：App render、useLayoutEffect、useEffect

但是官方不太推荐使用

## useSelector

在之前的redux开发中，为了让组件和redux结合起来，使用了**connect**返回的**高阶函数**；

还需要编写**mapStateToProps**和**mapDispatchToProps**映射的函数；

redux7.1开始，提供了**Hook**的方式；

它的作用是将state映射到组件中：

- 参数1：将state映射到需要的数据中；
- 参数2：可以进行比较来决定是否重新渲染；

```jsx
import React, { memo, useEffect } from 'react'
import { useSelector } from 'react-redux'

const App = memo(() => {
  const { count } = useSelector((state) => ({ 
      count: state.counter.count 
  })
  return (
    <div>
      <h2>App:{count}</h2>
    </div>
  )
})

export default App
```

### 性能优化

组件使用**useSelector**时，监听的是整个**state**；

只要state发生变化，组件就会**重新渲染**；

这显然是不应该的：比如，state中的count改变，某个**子组件**的props并未发生改变，而只是使用**useSelector**映射state中num，但由于state发生变化，导致子组件重新渲染；

所以对state的监听，应该更精准些，useSelector提供了第二个参数；

```jsx
import React, { memo, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'

const App = memo(() => {
  const { count } = useSelector((state) => ({ 
      count: state.counter.count 
  }, shallowEqual)
  return (
    <div>
      <h2>App:{count}</h2>
    </div>
  )
})

export default App
```



## useDispatch

直接获取dispatch

```js
const dispatch = useDispatch()
```

## useId

### SPA的缺陷

- 首屏渲染速度
- 不利于SEO优化

### 服务器端渲染

**SSR**（Server Side Rendering，服务器端渲染），指的是页面在**服务器端**已经渲染好了；

CSR（Client Side Rendering，客户端渲染），比如SPA页面，需要浏览器执行js，创建完整的页面结构；

### SSR同构应用

一套代码既可以在服务器端运行，又可以在客户端运行，就叫同构应用

前端代码代码在**服务器端**运行只是html，不具备交互性；还需在客户端（浏览器）加载页面，这个过程叫**hydration**；

**而useId的作用是：生成横跨服务器端和客户端的唯一稳定的id，同时避免hydration不匹配**

## useTransition

告诉react对于部分任务的更新优先级较低，可以稍后进行更新

推荐一个生成虚拟数据的库 **@faker-js/faker**

看这么一个案例，**根据输入框过滤显示列表**

当数据量过大，输入框的重新渲染会等待**列表的更新**后才进行的，导致输入框刷新**卡顿**；

所以可以使用**useTransition**告知react列表的更新优先级较低，等输入框重新渲染再更新列表；

```js
import { faker } from '@faker-js/faker'

const namesArray = []
for (let i = 0; i < 1000; i++) {
  namesArray.push(faker.name.fullName())
}

export default namesArray
```

```jsx
import React, { memo, useState, useTransition } from 'react'
import namesArray from './namesArray'

const App = memo(() => {

  const [showNames, setShowNames] = useState(namesArray)
  const [pending, startTransition] = useTransition()

  function valueChangeHandle (event) {
    startTransition(() => {
      const keyword = event.target.value
      const filterShowNames = namesArray.filter(item => item.includes(keyword))
      setShowNames(filterShowNames)
    })
  }
  return (
    <div>
      <input type="text" onInput={valueChangeHandle} />
      <h2>用户名列表：{pending && <span>loading...</span>}</h2>
      <ul>
        {
          showNames.map((item, index) => {
            return <li key={index}>{item}</li>
          })
        }
      </ul>
    </div>
  )
})

export default App
```

## useDeferredValue

与useTransition类似，可以更新延迟

```js
import { faker } from '@faker-js/faker'

const namesArray = []
for (let i = 0; i < 1000; i++) {
  namesArray.push(faker.name.fullName())
}

export default namesArray
```



```jsx
import React, { memo, useDeferredValue, useState } from 'react'
import namesArray from './namesArray'

const App = memo(() => {

  const [showNames, setShowNames] = useState(namesArray)
  const deferredShowNames = useDeferredValue(showNames)

  function valueChangeHandle (event) {
    const keyword = event.target.value
    const filterShowNames = namesArray.filter(item => item.includes(keyword))
    setShowNames(filterShowNames)
  }
  return (
    <div>
      <input type="text" onInput={valueChangeHandle} />
      <h2>用户名列表：</h2>
      <ul>
        {
          deferredShowNames.map((item, index) => {
            return <li key={index}>{item}</li>
          })
        }
      </ul>
    </div>
  )
})

export default App
```



# 性能优化的hook

## useCallback

在**函数式组件**中，一般会定义修改状态的**方法**；

当状态改变，组件重新渲染，修改状态的方法也会**重新定义**；

这样使得组件重新渲染的时候，修改状态的方法被**反复回收和定义**，这样存在一定的性能问题；

而**useCallback**实际的目的是为了进行性能优化；

**它是如何进行性能优化的呢？**

1. useCallback会返回一个函数的**记忆值**（用的是**闭包陷阱**）；
2. 在依赖不变的情况下，多次定义时，**返回的值是相同的**；

你可能会这样用

```jsx
import React, { memo, useCallback, useState } from 'react'


const App = memo(() => {
  const [counter, setCounter] = useState(0)
  const increment = useCallback(function () {
    setCounter(counter + 1)
  })

  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={increment}>+1</button>
    </div>
  )
})

export default App
```

这样的话，修改状态的方法依然多次定义，不过是以参数的形式，并没有解决问题

### 参数

- 1）回调函数
- 2）数组（类似useEffect，只关注某些状态，当这些状态发生改变时才会返回新的**记忆值**）

给个案例说明一下useCallback的好处



```jsx
import React, { memo, useCallback, useState } from 'react'

// 当props中的属性发生改变时，组件本身会被重新渲染
const SFIncrement = memo(function (props) {
  const { increment } = props
  console.log('SFIncrement被渲染')
  return (
    <div>
      <button onClick={e => increment()}>点击</button>
    </div>
  )
})

const App = memo(() => {
  const [counter, setCounter] = useState(0)
  const [message, setMessage] = useState('hello')
  
  const increment = () => {
    setCounter(counter + 1)
  }

  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={increment}>+1</button>
      <SFIncrement increment={increment} />
      <h3>{message}</h3>
      <button onClick={e => setMessage('你好')}>
  )
export default App
```



当状态**message**发生改变，组件**App**重新渲染，**inrement**重新定义，值发生变化，子组件**SFIncrement**对increment有依赖，也得重新渲染；

这是不应该的。

但如果使用了useCallback

```jsx
import React, { memo, useCallback, useState } from 'react'

// 当props中的属性发生改变时，组件本身会被重新渲染
const SFIncrement = memo(function (props) {
  const { increment } = props
  console.log('SFIncrement被渲染')
  return (
    <div>
      <button onClick={e => increment()}>点击</button>
    </div>
  )
})

const App = memo(() => {
  const [counter, setCounter] = useState(0)
  const [message, setMessage] = useState('hello')
  const increment = useCallback(function () {
    setCounter(counter + 1)
  }, [counter])

  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={increment}>+1</button>
      <SFIncrement increment={increment} />
      <h3>{message}</h3>
      <button onClick={e => setMessage('你好')}></button>
    </div>
  )
})

export default App
```

当状态**message**发生改变，组件**App**重新渲染；

由于**useCallback**第二参数告知它只关注状态**counter**，当counter发生变化才会返回新的**记忆值**；

尽管你修改状态**message**，但**inrement**依然用上一次的记忆值（闭包陷阱），值并**未发生变化**，子组件**SFIncrement**不会重新渲染；

**这不就体现出useCallback的对性能的优化了吗？**



### 应用场景

- 当**子组件**需要传入一个**函数**当props时，最好使用useCallback进行优化

通常使用useCallback的目的是**不希望子组件进行多次渲染**，并不是为了函数进行缓存；

## useRef

上述代码还可以进一步优化：**当counter改变，也使用同一个函数**

方式一，**解除对counter的依赖**，缺陷：闭包陷阱，状态counter每次都是用的**初始化的值**，导致修改都是在初识值的基础上修改（0 + 1），也就无法修改状态

```jsx
import React, { memo, useCallback, useState } from 'react'

// 当props中的属性发生改变时，组件本身会被重新渲染
const SFIncrement = memo(function (props) {
  const { increment } = props
  console.log('SFIncrement被渲染')
  return (
    <div>
      <button onClick={e => increment()}>点击</button>
    </div>
  )
})

const App = memo(() => {
  const [counter, setCounter] = useState(0)
  const [message, setMessage] = useState('hello')
  const increment = useCallback(function () {
    setCounter(counter + 1)
  }, [])

  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={increment}>+1</button>
      <SFIncrement increment={increment} />
      <h3>{message}</h3>
      <button onClick={e => setMessage('你好')}></button>
    </div>
  )
})

export default App
```

### 返回同一个对象

利用useRef返回的是同一个对象，就可以解决上述的**闭包陷阱**问题

```jsx
import React, { memo, useCallback, useState, useRef } from 'react'

// 当props中的属性发生改变时，组件本身会被重新渲染
const SFIncrement = memo(function (props) {
  const { increment } = props
  console.log('SFIncrement被渲染')
  return (
    <div>
      <button onClick={e => increment()}>点击</button>
    </div>
  )
})

const App = memo(() => {
  const [counter, setCounter] = useState(0)
  const [message, setMessage] = useState('hello')

  const countRef = useRef()
  countRef.current = counter
  const increment = useCallback(function () {
    setCounter(countRef.current + 1)
  }, [])

  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={increment}>+1</button>
      <SFIncrement increment={increment} />
      <h3>{message}</h3>
      <button onClick={e => setMessage('你好')}></button>
    </div>
  )
})

export default App
```

虽然组件多次渲染，但**countRef是同一个对象**，但它的**current属性**每次渲染都被赋予状态**counter**最新的值，也就是counter被保存到current了，counter就可以正确被修改了，并且不会渲染子组件**SFIncrement**

### 获取DOM

在类组件中，可以使用createRef获取DOM，**useRef**可以在**函数式组件**中获取DOM；

```jsx
import React, { memo, useRef } from 'react'

const App = memo(() => {
  const titleRef = useRef()

  function showDom () {
    console.log(titleRef.current)
  }
  
  return (
    <div>
      <h2 ref={titleRef}>hello</h2>
      <button onClick={e => showDom()}>+1</button>
    </div>
  )
})

export default App
```



## useMemo

### 参数

接收参数类似useCallback，但是**useCallback**的返回值是**参数1的本身**，而**useMemo**的返回值的**参数1的返回值**；

**useCallback(fn, [])**相当于**useMemo(() => fn, [])**

- 1）函数
- 2）数组

```jsx
import React, { memo, useState } from 'react'

function calcNum (num) {
  console.log('计算过程被调用')
  let total = 0
  for (let i = 0; i < num; i++) {
    total += 1
  }
  return total
}
const App = memo(() => {
  const [counter, setCounter] = useState(0)
  const result = calcNum(50)
  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={e => setCounter(counter + 1)}></button>
      <div>结果:{result}</div>
    </div>
  )
})

export default App
```

当状态**counter**发生改变，组件重新渲染，而**result计算过程**也会被重新执行，这是不应该的；

**使用useMemo之后**

```jsx
import React, { memo, useMemo, useState } from 'react'

function calcNum (num) {
  console.log('计算过程被调用')
  let total = 0
  for (let i = 0; i < num; i++) {
    total += 1
  }
  return total
}
const App = memo(() => {
  const [counter, setCounter] = useState(0)

  const result = useMemo(() => {
    return calcNum(50)
  }, [])


  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={e => setCounter(counter + 1)}>+1</button>
      <div>结果:{result}</div>
    </div>
  )
})

export default App
```

尽管组件被程重新渲染，也只会执行**calcNum**一次；

如果**calcNum**对其它状态有依赖，可以在第二个参数传；

同理，如果**对子组件传入相同内容的对象**，可以使用useMemo进行优化；

```jsx
import React, { memo, useMemo, useState } from 'react'

const App = memo(() => {
  const [counter, setCounter] = useState(0)

  const info = useMemo(() => ({name: 'zsf', age: 18}), [])
  
  return (
    <div>
      <h2>当前计数：{counter}</h2>
      <button onClick={e => setCounter(counter + 1)}>+1</button>
      <子组件 info={info} />
    </div>
  )
})

export default App
```



# 自定义hook

hook的思想就是抽取重复的逻辑，开发中遇到重复使用的逻辑，是可以抽取出来，自定义成hook的；

**这不就之前的高阶组件（针对类组件）的作用吗？**

而hook复用逻辑是针对函数式组件

## 打印生命周期

现在有个需求，所有组件创建和销毁都进行打印

```jsx
import React, { memo, useEffect } from 'react'

function usePrintLife () {
  useEffect(() => {
    console.log('组件被创建')
    return () => {
      console.log('组件被销毁')
    }
  }, [])
}

const App = memo(() => {
  usePrintLife()
  return (
    <div>
      <h2>App</h2>

    </div>
  )
})

export default App
```

## localStorage与useState结合

当很多组件都需要获取localStorage中的内容作为状态时，就可以将这部分代码抽取成hook

```js
import { useEffect, useState } from "react"

function useLocalStorage(key) {
  const [data, setData] = useState(JSON.parse(localStorage.getItem(key)) || '')

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data))
  }, [data])

  return [data, setData]
}

export default useLocalStorage
```

其它组件只要使用**useLocalStorage**这个hook即可
