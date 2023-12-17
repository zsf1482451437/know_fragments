redux和React没有直接关系，完全可以在React、Angular或其它地方单独使用Redux;

但React和Redux结合的更好，通过state去描述界面状态；

# 三大原则

## 单一数据源

- 整个应用程序的state被存储在一棵**object tree**中，并且object tree只存储在**一个store**中；
- Redux并没有强制不能创建多个store，但那样**不利于数据维护**；
- **单一数据源**可以让整个应用程序的state变得方便维护、追踪、修改；

## state是只读的

- 唯一修改state的方法一定是**派发（dispatch）action**，不可直接修改state；

- 这样就确保了视图或网络请求都不能直接修改state，他们**只能通过action来描述自己想要如何修改state**；

- 这样可以**保证所有的修改都被集中化处理**，并按照**严格的顺序**来执行，无需担心**race condition（竞态）**的问题；

  

## 使用纯函数来执行修改

- 通过reducer将**旧的state和action**联系到一起，并返回一个**新的state**；
- 随着应用程序的**复杂度增加**，我们可以将reducer**拆分成多个小的reducer**，分别操作不同的state tree的一部分；
- 但所有的reducer都应该是**纯函数**，不能产生任何副作用；

# 核心

## store

## action

需要通过action来更新数据：

- 所有的状态变化，必须通过派发（**dispatch**）action来更新；
- action是一个普通的js对象，用来描述此次更新的**type**和**content**；

## reducer

**如何将state和action联系在一起呢？**

reducer是个**纯函数**；

reducer做的事情是**将旧的state和action结合起来生成一个新的state**；

# 基本使用

```js
import { createStore } from 'redux'
// 初始化数据
const initialState = {
  name: 'zsf',
  counter: 100
}

// 定义reducer函数
function reducer(state = initialState, action) {
  // 有数据进行更新时，返回一个新的state

  // 没数据更新返回旧的state
  return state
}

// 创建store
export const store = createStore(reducer)
```

使用**store.getState()**就可以获取state了；

**reducer**接收**两个**参数：

- 1）旧的state
- 2）action

## 修改state

一旦调用dispatch，reducer就会重新执行；

```js
import { createStore } from 'redux'
// 初始化数据
const initialState = {
  name: 'zsf',
  counter: 100
}

// 定义reducer函数
function reducer(state = initialState, action) {
  // 有数据进行更新时，返回一个新的state
  if (action.type === 'change_name') {
    return { ...state, name: action.name }
  }

  // 没数据更新返回旧的state
  return state
}

// 创建store
export const store = createStore(reducer)
```

当**action类型过多**时，应该使用**switch**替代if

```js
console.log(store.getState()) // { name: 'zsf', couter: 100 }
const nameAction = { type: 'change_name', name: 'hhh' }
store.dispatch(nameAction)
console.log(store.getState()) // { name: 'hhh', couter: 100 }
```

## 订阅state

上述获取state要手动，想要自动获取最新state的话，需要**订阅**；

**store.subscribe()**传入一个回调**函数**，当state**发生变化**时会回调该函数；

```js
store.subscribe(() => {
  console.log(store.getState())
})
```

**取消订阅**

store.subscribe()返回值是个函数，调用即可取消订阅；

## 动态生成action

```js
store.dispatch({ type: 'change_name', name: 'hhh' })
store.dispatch({ type: 'change_name', name: 'xxx' })
store.dispatch({ type: 'change_name', name: 'jjj' })
```

你会发现有重复的内容，开发中会使用一个叫**actionCreators**的东西，它会帮助我们创建action；

```js
const changeNameAction = (name) => ({
  type: 'change_name',
  name
})
store.dispatch(changeNameAction('hhh'))
store.dispatch(changeNameAction('xxx'))
store.dispatch(changeNameAction('jjj'))
```

一般会将类似上述**changeNameAction**的函数放到store下**actionCreators.js**文件中

## constants.js

对于**两处地方**要使用**一样的字符串**，应该写成**常量**，放constants.js中；

## 代码组织原则

将派发的**action生成过程**放到一个actionCreators函数中，并将这些函数放到**actionCreators.js**文件中；

**actionCreators**和**reducer**函数中使用的**字符串常量**是一致的，将常量抽取到**constants.js**文件中；

将**reducer**和默认值(initialState)放到**reducer.js**文件中，而不是在index.js;

# 在项目中使用

在**类组件**中的**componentDidMoun**t生命周期中**订阅state**中的数据；

假设使用了counter

```js
componentDidMount() {
  store.subscribe(() => {
    const state = store.getState()
    this.setState({ counter: state.counter })
  })
}
```

并且在组件卸载后也要手动在**componentWillUnmount**生命周期进行**取消订阅**；

如果每个组件都要进行这些操作，那重复可就太多了；

可以把这些重复的操作抽取到**高阶组件**；

真实开发会使用一个库，**react-redux**；

由于可能多个组件都会使用到store中的数据，所以可以给**根组件**提供；

**根组件**

```jsx
...
import { Provider } from 'react-redux'
import { store } from './store'

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(
  <Provider store={store}>
    <App/>
  </Provider>
)
```

假设一个About组件想使用store中的数据，可以使用**react-redux**中的connect；

**connect**的**返回值**是个高阶组件；

**About**

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

export class About extends PureComponent {
  render () {
    return (
      <div>About</div>
    )
  }
}

export default connect()(About)
```

**connect为什么不直接封装成高阶组件，而返回值才是高阶组件？**

connect参数接收两个**函数**；

**第一个函数**需要告知connect拦截组件（上述的About）需要用**store**中的哪些数据，不是全部都要使用；

第一个函数返回的是一个映射，也就是**当前组件**和store中哪些数据的**映射**；

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

export class About extends PureComponent {
  render () {
    return (
      <div>About</div>
    )
  }
}

function fn1 (state) {
  return {
    counter: state.counter
  }
}

export default connect(fn1)(About)
```

## connect内部原理

**connect内部做了什么呢？**

做了类似这样的操作

```jsx
<About {...this.props} {...obj} />
```

会将上述**fn1**返回的对象（obj）和接收到的props以**属性**的方式传给**About组件**；

这不就是**高阶组件**应用场景之一的-----**props增强**吗？

同样，**高阶组件**另外的应用场景----**拦截生命周期**也在connect内部应用了（需要对store中的state订阅和取消订阅）；



由于About需要使用的数据已经注入到props中了，使用方式不就和使用props一样了吗？

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

export class About extends PureComponent {

  render () {
    const { counter } = this.props
    return (
      <div>
        <h2>About----{counter}</h2>
      </div>
    )
  }
}

function fn1 (state) {
  return {
    counter: state.counter
  }
}

export default connect(fn1)(About)
```

一般也不会使用fn1这样的函数命名，而是换成**mapStateToProps**这样见明知义的命名；

## 修改状态

**如果About组件想修改counter这个状态，该怎么操作？**

通常是导入store，然后使用**store.dispatch()**派发action；

而**派发操作**是可以不在组件内进行的，若不希望这派发操作与组件耦合在一起，是**可以解耦**的；

上面说到**connect**是接收两个函数的，第二个函数fn2接收一个参数（store传来的**dispatch**）；

函数fn2返回的也是个映射，是**当前组件**修改状态和**store**中修改状态的**映射（**下面的addNumber与addNumberAction）；

而修改状态的**addNumber**就添加到当前组件的props里面了，就可以通过**this.props.addNumber**进行派发action操作了；

而这样去派发，代码都是组件自己的行为，就可以解耦了；

**About**

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { addNumberAction } from './store/index'

export class About extends PureComponent {

  changeNum (num) {
    this.props.addNumber(num)
  }
  render () {
    const { counter } = this.props
    return (
      <div>
        <h2>About----{counter}</h2>
        <button onClick={e => this.changeNum(6)}>+6</button>
      </div>
    )
  }
}

function fn1 (state) {
  return {
    counter: state.counter
  }
}

function fn2 (disptch) {
  return {
    addNumber (num) {
      disptch(addNumberAction(num))
    }
  }
}

export default connect(fn1, fn2)(About)
```

一般也不会使用fn2这样的函数命名，而是换成**mapDispatchToProps**这样见明知义的命名；

## 分模块

如果store中分模块，每个模块都有

- constant.js
- actionCreators.js
- reducer.js
- index.js

那得需要将每个模块的reducer结合在一起，创建store的时候传进去；

可以使用redux中的**combineReducers**，接收一个对象，属性名任意起，而属性的值分别是**模块的reducer**；

```js
const reducer = combineReducers({
  counter: counterReducer,
  home: homeReducer
})
```

redux分模块的好处是，方便修改自己负责的逻辑，防止出现代码冲突；

如果整个应用程序需要共享的状态管理不分开，容易出现误改他人代码；

**combineReducers是如何实现的呢？**

它将传入的**reducer**合并到一个**对象**中，最终返回一个**combination的函数**（相当于之前的reducer函数）；

执行**combination函数**的过程中，它会通过**判断前后的数据是否相同**来决定返回之前的state还是新的state；

**新的state**会触发订阅者发生对应的刷新，而旧的state可以有效的组织订阅者发生刷新；

```js
function combineReducers(state = {}, action) {
    // 返回一个对象，store的state
    return {
        counter: counterReducer(state.counter, action)
    }
}
```



# 组件中的异步操作

上述使用的状态是本地的数据，但在真实开发往往是下进行**异步的网络请求**，然后再保存到**redux**中；

比如在Home组件请求了一些数据，如果Home想使用，只需要将这些数据保存到自己**state**中，使用render进行展示即可；

而About组件也想使用那些数据的话，怎么办呢？

- 首先可以想办法一步步传递过去，比如放到**Context**里面去，然后做一个**共享**，但是这个步骤有点**繁琐**，排除；
- 可以使用**eventBus**，拿到Home数据之后发射出去一个**全局事件**，因为eventBus是可以传参数的，可以把请求到数据传递过来，但是在整个项目中**过多使用eventBus**，**监听的事件来自哪里**是很难把控的，当出现bug是时不好调试，并且eventBus不建议传递这么大的数据，排除；
- 最合适的方法是**redux**，全局共享一个store，里面的state保存网络请求到数据；

**那如何保存在redux中呢？**

假如在**actionCreators.js文件**中

```js
export const getHomeAction = () => {
    axios.get('地址').then((res) => {
        const banners = res.data.banners.list
    })
    return {
        type: 'change_banners',
        banners: banners
    }
}
```

这样的话，不确定then什么时候被回调，banners也就不确定有没有值；

你可能会说，可以拿到结果之后再return，比如这样

```js
export const getHomeAction = () => {
    axios.get('地址').then((res) => {
        const banners = res.data.banners.list
        return {
            type: 'change_banners',
            banners: banners
        }
    })
    
}
```

这样的话，return的内容已经不是**getHomeAction**所return的了；

应该这样做

**组件中**

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getHomeAction } from './store/index'

export class About extends PureComponent {

 getHomeData() {
    this.props.getHome()
  }
  render () {
    const { counter } = this.props
    return (
      <div>
        <h2>About----{counter}</h2>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    counter: state.counter
  }
}

function mapDispatchToProps(disptch) {
  return {
    getHome() {
      disptch(getHomeAction())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(About)
```

在**actionCreators.js文件**中

```js
export const getHomeAction = () => {
    return {}
}
```

如果是一个普通的action，那需要返回action对象；

而问题是，对象中不能直接拿到从服务器请求到的异步数据，所以不能直接返回对象；

应该返回一个**函数**，然后函数里进行网络请求；

而redux要求派发的是action对象，要想派发函数，可以使用一个中间件----**redux-thunk**对store进行增强，使其可以派发函数；

## redux-thunk

安装

```
npm install redux-thunk
```

然后使用redux中的**applyMiddleware**，在store创建的时候，传递第二个参数

```js
import { createStore, applyMiddleware } from 'redux'
improt thunk from 'redux-thunk'
import reducer from './reducer'

const store = createStore(reducer, applyMiddleware(thunk))
export default store
```

**thunk内部做了什么？**

检测到派发的是函数，就**自动执行**，且可以接收两个参数：

- 第一个是store的**dispatch**（用于之后再次派发action）；
- 第二个是store的**getState**（考虑到之后的操作依赖原来的状态）；

在**actionCreators.js文件**中

```js
export const getHomeAction = () => {
    function foo(dispatch) {
       axios.get('地址').then((res) => {
           const banners = res.data.banners.list
           dispatch({ type: 'change_num', banners })
       })
    }
    return foo
}
```



# 两个工具

- redux devtool
- react devtool

谷歌商店或github下载（版本有点低）

官方建议redux devtool在**生产环境是看不到state**的，所以默认情况直接使用redux devtool是查看不到状态的，开发环境才开启（有的网站生产环境时开启的，这不好）；

在redux的**index.js**

```js
import { compose } from "redux"
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({trace: true}) || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)))
```

生产环境的话，改成

```js
import { compose } from "redux"
const composeEnhancers = compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)))
```

# ReduxToolKit

简称**RTK**

官方推荐使用ReduxToolKit工具包来进行Redux相关管理，编写代码会方便许多（创建store方便，使用起来差不多）；

**安装**

```
npm install @redux/toolkit react-redux
```

由于这工具包也是针对react-redux进行了封装，所以两个都需要安装；

## 核心API

- configureStore
- createSlice
- createAsyncThunk

**configureStore**：封装**createStore**以提供**简化的配置**选项和**良好的默认值**。它可以自动组合你的slice reducer，添加任何的**Redux中间件**，**redux-thunk**默认包含，并启用**Redux DevTools Extension**；

**createSlice**：接受**reducer函数**的对象，切片名称和初识状态值，并自动生成切片reducer，并带有相应的actions；

**createAsyncThunk**：接受一个**动作类型字符串**和一个**返回承诺的函数**，并生成一个pending/fullfilled/rejected基于该承诺分派动作类型的**thunk**；

## 基本使用

**configureStore**用于创建store对象，常见参数如下：

- **reducer**，将各个slice中的reducer组成一个对象；
- **middleware**，传入其它中间件；
- **devtools**: 是否配置devtools工具，默认为true；

store文件夹下的**index.js**

```js
import { configureStore } from '@reduxjs/toolkit'

const store = configStore({
    render: {}
})

export default store
```

**createSlice**接收以下参数：

- name
- initialState
- reducers

**name**：用户标记slice的名称（在redux-devtool会显示对应的名称），作用类似于**action对象的type**属性；

**initialState**：初始化值；

**reducers**： 

- 相当于之前的reducer函数，是**对象**，可以添加更多函数；
- **函数**类似于原来reducer中的一个**case**语句；
- 函数的参数（**state**，调用这个action时传递的action参数）

而**导出时**，只需要将**createSlice创建出切片中的reducer**导出，后续会将各个切片的reducer结合成一个；

**createSlice**返回一个**对象**，包含**所有的actions**；

**某个store模块**

```js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
    name: 'counter',
    initlState: {
        counter: 100
    },
    reducers: {
        addNumber(state, action) {
            
        },
    }
})
export default counterSlice.reducer
```

store文件夹下的**index.js**

```js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter'

const store = configStore({
    render: {
      counter: createReducer
    }
})

export default store
```

**发现没有，创建一个store是不是方便许多？**

接着使用counter模块的状态，与上述使用方式差不多

**根组件**

```jsx
...
import { Provider } from 'react-redux'
import { store } from './store'

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(
  <Provider store={store}>
    <App/>
  </Provider>
)
```

**App**

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

export class App extends PureComponent {
  render () {
    const { counter } = this.props
    return (
      <div>
        <h2>App----{counter}</h2>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    counter: state.counter.counter
  }
}

export default connect(mapStateToProps)(App)
```

**修改状态**

**App**

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { addNumberAction } from './store/couter'

export class App extends PureComponent {
  addNum(num) {
      this.props.addNumber(num)
  }
  render () {
    const { counter } = this.props
    return (
      <div>
        <h2>App----{counter}</h2>
        <button onClick={ e => this.addNum(1) }>+1</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    counter: state.counter.counter
  }
}

function mapDispatchToProps(dispatch) {
    return {
        addNumber(num) {
            dispatch(addNumberAction(num))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
```

**某个store模块(couter)**

```js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
    name: 'counter',
    initlState: {
        counter: 100
    },
    reducers: {
        addNumber(state, { payload }) {
            state.counter += payload 
        },
    }
})
export const { addNumberAction } = counterSlice.actions
export default counterSlice.reducer
```

看到这段代码

```js
reducers: {
    addNumber(state, { payload }) {
        state.counter += payload 
    },
}
```

你可能会问：**为什么不像reducer那样，返回新的state？**

其实这里RTK也做了优化，它使用了一个库（immer.js），只要修改了state，就会创建新的state然后返回；

## 异步操作

在之前的开发中，通过**redux-thunk中间件**让dispatch**中可以进行异步操作**；

Redux Toolkit默认已经集成了Thunk相关功能：**createAsyncThunk**

假设Home组件发起网络请求获取到的数据，About组件也想使用

**store某模块（home）**

```jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const getHomeAction = createAsyncThunk('getHomeData', async () => {
    const res = await axios.get('地址')
})

const homeSlice = createSlice({
    name: 'home',
    initlState: {
        banners: []
    },
    reducers: {
        changeBanners(state, { payload }) {
            state.banners += payload 
        },
    }
})

export default homeSlice.reducer
```

如何将在**getHomeAction**中获取的数据，放到homeSlice中的**initlState**呢？

**createAsyncThunk**的创建出来的action被**dispatch**时，会存在三种状态：

- pending：action被发出，但还没有最终结果；
- fulfilled：获取到最终结果（有返回值的结果）；
- rejected：执行过程中有错误或抛出异常；

可以在createSlice中的**extraReducer**中监听这些结果：

**store某模块（home）**

```jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const getHomeAction = createAsyncThunk('getHomeData', async () => {
    const res = await axios.get('地址')
    return res.data
})

const homeSlice = createSlice({
    name: 'home',
    initlState: {
        banners: []
    },
    reducers: {
        changeBanners(state, { payload }) {
            state.banners = payload 
        },
    },
    extraReducers: {
        [getHomeAction.fulfilled](state, { payload }) {
            state.banners = payload.data.banners.list
        }
    }
})

export default homeSlice.reducer
```

其中pedding和rejected状态可以不监听

**Home组件**

```jsx
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getHomeAction } from './store/home'

export class Home extends PureComponent {
  componentDidMount() {
      this.props.getHomeData()
  }
  render () {
    return (
      <div>
        <h2>Home</h2>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
    return {
        getHomeData() {
            dispatch(getHomeAction())
        }
    }
}

export default connect(null, mapDispatchToProps)(Home)
```

# 数据不可变性

无论是类组件的state还是redux中管理的state，都强调**数据的不可变性**；

整个js编码中，数据的不可变性非常重要；

所以前面进常进行浅拷贝来完成某些操作，但浅拷贝事实上也是存在问题的；

- 比如过大的对象，浅拷贝也会造成性能的浪费；
- 浅拷贝后的对象，在深层改变时，依然会对之前的对象产生影响；

**redux toolkit使用了immerjs这个库保证了数据的不可变性**

为了节省内存，当数据被修改时，会返回一个对象，但新的对象会**尽可能利用之前的数据结构**而不会对内存造成浪费；

# 实现connect

实现关键点：

- 两个**参数**为函数
- 返回一个**高阶组件**
- 获取到store的state作为属性传进需要共享该state的组件
- dispatch同理
- 当state中被共享的数据发生更新时，组件的render重新执行，需要监听订阅的state是否发生改变
- 取消state的订阅
- 降低对store的耦合度

## 参数

首先，它接收**两个函数作为参数**

```js
function connect(mapStateToProps, mapDispatchToProps) {
  
}
```

## 返回值

返回一个高阶组件

```jsx
import { PureComponent } from 'react'
export default function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrapperComponent) {
    class Newcpn extends PureComponent {
      render() {
        return <WrapperComponent {...this.props} />
      }
    }
    return Newcpn
  }
}
```

获取到store的state**作为属性**传进WrapperComponent

调用**第一个参数**，并**传进state**，它的返回值就是一个**映射**，就是想共享store中哪些数据；

然后将该映射注入WrapperComponent的**props**

同理，第二个参数也是如此

```jsx
import { PureComponent } from 'react'
import store from './store'

export default function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrapperComponent) {
    class Newcpn extends PureComponent {
      render() {
        const stateObj = mapStateToProps(store.getState())
        const dispatchObj = mapDispatchToProps(store.dispatch)

        return <WrapperComponent {...this.props} {...stateObj} {...dispatchObj}/>
      }
    }
    return Newcpn
  }
}
```

## 状态更新

目前还存在一个问题：当WrapperComponent修改共享的state时，界面没更新。

应该**根据最新状态**重新执行WrapperComponent的render函数

```jsx
import { PureComponent } from 'react'
import store from './store'

export default function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrapperComponent) {
    class Newcpn extends PureComponent {
      componentDidMount() {
        // 监听到订阅的state发生改变，强制执行render函数
        store.subscribe(() => {
          this.forceUpdate()
        })
      }
      render() {
        const stateObj = mapStateToProps(store.getState())
        const dispatchObj = mapDispatchToProps(store.dispatch)

        return <WrapperComponent {...this.props} {...stateObj} {...dispatchObj}/>
      }
    }
    return Newcpn
  }
}
```

但这样不好：state中任何改变，都会重新执行WrapperComponent的render函数；

应该是WrapperComponent用到的那些state发生改变，才需要重新执行render函数

```jsx
import { PureComponent } from 'react'
import store from './store'

export default function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrapperComponent) {
    class Newcpn extends PureComponent {
      constructor(props) {
        super(props)
        this.state = mapStateToProps(store.getState())
      }
      componentDidMount() {
        // 监听到订阅的state发生改变，强制执行render函数
        store.subscribe(() => {
          // this.forceUpdate()
          this.setState(mapStateToProps(store.getState()))
        })
      }
      render() {
        const stateObj = mapStateToProps(store.getState())
        const dispatchObj = mapDispatchToProps(store.dispatch)

        return <WrapperComponent {...this.props} {...stateObj} {...dispatchObj}/>
      }
    }
    return Newcpn
  }
}
```

## 取消订阅

不要忘记组件卸载时取消state的订阅哦

```jsx
import { PureComponent } from 'react'
import store from './store'

export default function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrapperComponent) {
    class Newcpn extends PureComponent {
      constructor(props) {
        super(props)
        this.state = mapStateToProps(store.getState())
      }
      componentDidMount() {
        // 监听到订阅的state发生改变，强制执行render函数
        this.unsubscribe = store.subscribe(() => {
          // this.forceUpdate()
          this.setState(mapStateToProps(store.getState()))
        })
      }
      componentWillUnmount() {
        this.unsubscribe()
      }
      render() {
        const stateObj = mapStateToProps(store.getState())
        const dispatchObj = mapDispatchToProps(store.dispatch)

        return <WrapperComponent {...this.props} {...stateObj} {...dispatchObj}/>
      }
    }
    return Newcpn
  }
}
```

## 解耦

目前还有一个问题：与上一层目录的store耦合了

- 方式一，connect再**接收一个参数**，让使用者传入store；
- 方式二，再提供一个**StoreContext**；

方式一会每次使用connect时会多传一个参数，有点麻烦

**StoreContext.js**

```js
import { createContext } from 'react'

export const StoreContext = createContext()
```

**统一导出**

```js
export { StoreContext } from './StoreContext'
export { connect } from './connect'
```

**使用者**

``` jsx
import { StoreContext } from '目录名称'

<StoreContext.Provider value={store}>
    <使用者 />
</StoreContext.Provider>
```

**connect.js**

```jsx
import { PureComponent } from 'react'
export { StoreContext } from './StoreContext'

export function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrapperComponent) {
    class Newcpn extends PureComponent {
      constructor(props, context) {
        super(props)
        this.state = mapStateToProps(context.getState())
      }
      componentDidMount() {
        // 监听到订阅的state发生改变，强制执行render函数
        this.unsubscribe = context.subscribe(() => {
          // this.forceUpdate()
          this.setState(mapStateToProps(this.context.getState()))
        })
      }
      componentWillUnmount() {
        this.unsubscribe()
      }
      render() {
        const stateObj = mapStateToProps(this.context.getState())
        const dispatchObj = mapDispatchToProps(this.context.dispatch)

        return <WrapperComponent {...this.props} {...stateObj} {...dispatchObj}/>
      }
    }
    Newcpn.contextType = StoreContext
    return Newcpn
  }
}
```

# 中间件原理

## 打印日志

先看一个需求：打印dispatch日志

- dispatch之前，打印action
- dispatch结束之后，打印state的结果

直接的思路是这样的

```js
const action = addNumberAction()
console.log('派发一个action', action)
dispatch(action)
console.log(store.getState())
```

这样有个问题：**每次派发**都需要这样写，重复代码太多

**可以编写一个中间件，让中间件完成这个过程**

派发action之前和之后，可以让**中间件**做一个**拦截**（正常情况是一派发就交给reducer）

上述redux-thunk中间件所做的事情是：

检测dispatch传入的是否为对象，若是函数则立即执行，并传入dispatch和state

```js
function log(store) {
    // 修改之前先记录原来的dispatch
    const next = store.dispacth
    function logAndDispatch(action) {
      console.log('当前派发的action', action)
      // 真正派发的代码：使用之前的dispatch派发
      next(action)
      console.log('派发之后的结果', store.getState())
    }
    
    store.dispatch = logAndDispatch
}
log(store)
store.dispatch({ type: 'addNumber', num: 100 })
```

将原来store.dispatch改成了logAndDispatch；

这种技术叫monkey patch（猴补丁，篡改现有代码，对整体的执行逻辑进行修改）

这便是中间件的原理

## 实现thunk核心代码

```js
function thunk(store) {
    // 修改之前先记录原来的dispatch
    const next = store.dispacth
    function dispatchThunk(action) {
      // 如果派发的是函数
      if (typeof action === 'funcion') {
          // 如果派发函数里面又派发了一个函数，使用原来的dispatch会报错，所以应该使用新的dispatch
          action(store.diapatch, store.getState)
      } else {
          next(action)
      }      
    }
    store.dispatch = dispatchThunk
}
thunk(store)
store.dispatch(function(dispatch, getState) {
    dispatch({})
})
```

## 实现applyMiddleware核心代码

```js
function applyMiddleware(store, ...fns) {
  fns.forEach(fn => {
    fn(store)
  })
}
```

# 状态管理选择

**react中如何管理状态？**

主要有三种：

- **组件内**部自己的state；
- **Context**数据的共享；
- **Redux**管理应用状态；

**开发中该如何选择呢？**

redux作者的建议：

- UI相关的组件内部可以维护的状态，在组件内部自己来维护；
- 大部分需要共享的状态，都交给redux来管理和维护；
- 从服务器请求的数据（包括请求的操作），交给redux来维护；
