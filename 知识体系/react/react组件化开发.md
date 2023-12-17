根据**定义方式**，可分为

- 函数组件
- 类组件

根据内部**是否有状态需要维护**，可分为

- 无状态组件
- 有状态组件

根据**职责**，可分为

- 展示型组件
- 容器型组件

# 类组件

1. 定义一个**类**（类名**大写**，组件名称必须是大写，小写会被认为是html元素），**继承自React.Component**;
2. **constructor**可选，通常初始化一些数据；
3. **this.state**中维护组件内部数据；
4. class中必须实现**render方法**（render当中返回的**jsx内容**，就是之后React会帮助我们渲染的内容）；

## render函数的返回值

- **react**元素（通过jsx写的代码，组件也算react元素）
- **数组 **（会遍历数组元素并显示）或 **fragments**
- **portals**：可以渲染子节点到不同的DOM子树中
- **字符串**或**数值类型**，在DOM中会被渲染为文本节点
- **布尔类型**或**null**：什么都不渲染



## 数据

组件中的数据，可以分成2类：

- **参与**界面更新的数据：当**数据变化**时，需要**更新**组件渲染的内容
- **不参与**界面更新的数据：反之

参与界面更新的数据也可以称之为**参与数据流**，这些数据定义在**当前对象的state**中；

可以通过在**构造函数**中**this.state** = {数据}；

当**数据发生变化**时，可以调用**this.setState**来更新数据，并且通知React进行update操作；

update操作时，就会**重新调用render函数**，并使用**最新的数据**，来渲染界面；

```jsx
class App extends React.Component {
  // 组件数据
  constructor() {
    super()
    this.state = {
      msg: 'hello'
    }
  }
  // 组件方法

  // 渲染内容 render方法
  render() {
    return (
      <div>
        <h2>{this.state.msg}</h2>
        <button>修改文本</button>
      </div>
    )
  }
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

# 函数式组件

返回值和**类组件render函数**返回值一样

## 特点（hooks出现之前）

- 无生命周期，也**会被更新并挂载**，但是**没有生命周期函数**；
- this**不能指向组件实例**，因为没有组件实例；
- **没有内部状态**；

```jsx
function App() {
    return (
    	<h2>123</h2>
    )
}
```

# 生命周期

从**创建到销毁**的过程，叫生命周期；

- 装载阶段（Mount），组件**第一次在DOM树被渲染**的过程；
- 更新过程（Update），**组件状态**或**props**发生改变，重新更新渲染的过程；
- 卸载阶段（Unmount），组件**从DOM树中被移除**的过程；

**生命周期函数**

React内部为了告诉我们**当前处于哪些阶段**，会对组件内部实现**某些函数进行回调**，这些函数便是生命周期函数：

- 比如实现**componentDidMount**函数，组件已经**挂载到DOM上**时，就会回调；
- 比如实现**componentDidUpdate**函数，组件已经**发生了更新**时，就会回调；
- 比如实现**componentWillUnmount**函数，组件**即将被移除**时，就会回调；

谈及React的生命周期时，主要是**类的生命周期**（**函数式组件**没有生命周期，不过可以通过**hooks**来模拟一些生命周期函数的回调）

## 执行顺序

**mount**阶段：

- 执行类的**constructor**方法；
- 执行**render**方法；
- React更新**DOM**和**Refs**；
- 执行**componentDidMount**方法

**update**阶段：

- 执行**setState**方法；
- 执行**render**方法；
- React更新**DOM**和**Refs**；
- 执行**componentDidUpdate**方法；

**unMount**阶段：

- 当组件被卸载，会执行**componentWillUnmount**方法

## 操作建议

### **constructor**

若**不初始化state**或**不进行方法绑定**，则不需要React组件实现构造函数；

通常只做两件事：

- 初始化state；
- 为事件绑定this；

### componentDidMount

- 依赖于DOM的操作
- 发送网络请求（官方建议）
- 添加一些订阅（会在componentWillUnmount取消订阅）

### componentDidUpdate

- 若对更新前后的**props**进行了比较，也可以在此处进行网络请求（例如当props未发生变化时，不发送网络请求）

### componentWillUnmount

- 清除、取消操作

## 不常用生命周期

**shouldComponentUpdate**

当该函数返回**false**时，则**不会重新执行render**函数，反之则会；

**getSnapshotBeforeUpdate**

在React更新DOM之前回调的一个函数，可以获取**DOM更新前**的一些信息，比如滚动位置；

# 组件通信

## 父传子

- 父组件通过**属性=值**的形式来传递给子组件；
- 子组件通过**props参数**获取父组件传递过来的数据；

**父组件**

```jsx
import React, { Component } from 'react'
import Header from './Header'

class Main extends Component {
  constructor() {
    super()
    this.state = {
      list: [1, 2, 3]
    }
  }
  render () {
    const { list } = this.state
    return (
      <Header list={list} />
    )
  }
}
```

**子组件**

```jsx
import React, { Component } from 'react'

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render () {
    const { list } = this.props
    return (
      <ul>
        {
          list.map((item) => {
            return (
              <li key={item}>{item}</li>
            )
          })
        }
      </ul>
    )
  }
}
```

当constructor接收的参数props传递给super时，内部**将props保存在当前实例**中，类似进行了 `this.props = props` 

constructor**也可以省略**，内部默认进行保存props操作；

## props类型限制

对于大型项目来说，传递的数据应该进行**类型检查**（防止”字符串调用map“这种错误）

- Flow
- TypeScript
- prop-types库

从React15.5开始，React.PropTypes已移入另一个包中：prop-types库

```jsx
import React, { Component } from 'react'
import PropsTypes from 'prop-types'

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render () {
    const { list } = this.props
    return (
      <ul>
        {
          list.map((item) => {
            return (
              <li key={item}>{item}</li>
            )
          })
        }
      </ul>
    )
  }
}

Header.propsTypes = {
  list: PropsTypes.array.isRequired
}
```

通过组件实例的**propsTypes属性**，设置了list是**数组类型**且是**必传**的props

若非必传，可以是设置**默认值**（可以避免undefined问题）

```js
Header.propsTypes = {
  list: PropsTypes.array.isRequired
}
Header.defaultProps = {
    list: []
}
```

可以限制的类型有

- array
- bool
- func
- number
- object
- string
- symbol
- node
- **element**

## 子传父

**子组件如何向父组件传递消息？**

- 在vue中是通过自定义事件来完成；
- 在react中同样通过**props**传递消息，只是让父组件给子组件传递一个**回调函数**，在子组件中**调用**这回调函数；

**父组件main.jsx**

```jsx
import React, { Component } from 'react'
import Header from './Header'

class Main extends Component {
  constructor() {
    super()
    this.state = {
      counter: 100
    }
  }

  changeCount(count) {
    this.setState({
      counter: this.state.counter + count
    })
  }

  render () {
    const { counter } = this.state
    return (
      <div>
        <h2>当前计数：{counter}</h2>
        <Header addClick={(count) => this.changeCount(count)} />
      </div>
    )
  }
}
```

**子组件header.jsx**

```jsx
import React, { Component } from 'react'

class Header extends Component {
  add(count) {
    this.props.addClick(count)
  }
  render () {
    const { add } = this
    return (
      <div>
        <button onClick={e => add(1)}>+1</button>
      </div>
    )
  }
}
```

当子组件的按钮点击之后，会调用**父组件**传过来的**props中的addClick()**;

从而通知父组件去调用**changeCount()**,去修改**父组件的数据**；

## 案例

**父组件App.jsx**

```jsx
import React from "react"
import TabControl from "./TabControl"
class App extends React.Component {
  constructor() {
    super()
    this.state = {
      titles: ['流行', '新品', '精选'],
      tabIndex: 0
    }
  }
  changeTab (index) {
    this.setState({
      tabIndex: index
    })
  }

  render () {
    const { titles, tabIndex } = this.state
    return (
      <div>
        <TabControl titles={titles} tabClick={(index) => this.changeTab(index)} />
        <h1>{titles[tabIndex]}</h1>
      </div>
    )
  }
}
```

**子组件TabControl.jsx**

```jsx
import React, { Component } from 'react'
import "./style.css"

class TabControl extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentIndex: 0
    }
  }
  itemClick (index) {
    this.setState({
      currentIndex: index
    })
    this.props.tabClick(index)
  }

  render () {
    const { titles } = this.props
    const { currentIndex } = this.state

    return (
      <div className='tab-control'>
        {
          titles.map((item, index) => {
            return (
              <div
                className={`item ${index === currentIndex ? 'active' : ''}`}
                key={item}
                onClick={() => this.itemClick(index)}
              >
                <span className='text'>{item}</span>
              </div>
            )
          })
        }
      </div>
    )
  }
}
```

**style.css**

```css
.tab-control {
  display: flex;
  height: 40px;
  text-align: center;
}

.tab-control .item {
  flex: 1;
}

.tab-control .item.active {
  color: red;
}

.tab-control .item.active .text {
  padding: 3px;
  border-bottom: 3px solid red;
}
```

## 非父子

如果两组件传递数据跨层级比较多，一层层传递非常麻烦；

react提供了一个API：**Context**；

Context提供了一种**组件间共享某些数据**的方案，比如当前认证得用户、主题或首选语言；

### context的基本使用

React.createContext参数有个**defaultValue**，如果**不是后代组件**关系（兄弟组件），可以从defaultValue取到共享的数据

1. 使用**React.createContext**创建出context（每个context对象都会返回一个Provider组件，它允许**消费组件订阅**context的变化）；
2. 通过**context的Provider中的value**属性为**后代**提供希望共享的数据；
3. 后代设置**contextType**为指定context（可以多个context）；
4. 然后可以获取到那些数据了；

**context.js**

```js
import React from "react"
const ThemeContext = React.createContext()
export default ThemeContext
```

**App.jsx**

```jsx
import React from "react"
import Home from "./Home"
import ThemeContext from "./context"

class App extends React.Component {
  render () {
    return (
      <div>
        <h2>App</h2>
        <ThemeContext.Provider value={{ color: 'red', size: '30' }}>
          <Home></Home>
        </ThemeContext.Provider>
      </div>
    )
  }
}

```

**Home.jsx**

```jsx
import React, { Component } from 'react'
import HomeInfo from './HomeInfo'

class Home extends Component {
  render () {
    return (
      <div>
        <h2>Home</h2>
        <HomeInfo></HomeInfo>
      </div>
    )
  }
}
```

**HomeInfo.jsx**

```jsx
import React, { Component } from 'react'
import ThemeContext from './context'

class HomeInfo extends Component {
  render () {
    const { color } = this.context
    return (
      <div>
        <h2>HomeInfo:{color}</h2>
      </div>
    )
  }
}
HomeInfo.contextType = ThemeContext
```

### 函数式组件共享context

在类组件中可以使用**this**拿到context；

**而函数式组件中this拿不到，怎么做呢？**

**context.Consumer**也可以订阅到context的变更（当组件中需要使用**多个context**也可以使用Consumer）；

需要一个**函数**作为**子元素**，通过该函数的**参数value**传递当前的context；

```jsx
import ThemeContext from "./context"
function HomeBannar () {
  return (
    <div>
      <h2>HomeBannar</h2>
      <ThemeContext.Consumer>
        {
          (value) => {
            return <h2>{value.color}</h2>
          }
        }
      </ThemeContext.Consumer>
    </div>
  )
}
```

### 事件总线EventBus

context实现跨组件传递数据只能从根开始，要是需要**兄弟组件之间传递呢**？事件总线

先安装相关的库，比如event-bus

**event-bus.js**

```js
import { HYEventBus } from 'hy-event-store'

const eventBus = new HYEventBus()

export default eventBus
```

然后发射事件

```jsx
import eventBus from './event-bus'

...
preClick() {
  eventBus.emit('bannerPrev', 10)
}

render() {
  return (
    <div>
      <h2>HomeBanner</h2>
      <button onClick={e => this.preClick()}>上一个</button>
      
    </div>
  )
}
```

在组件挂载完成后，可以监听事件

```jsx
import eventBus from './event-bus'

...
componentDidMount() {
  eventBus.on('bannerPrev', (val) => {
    console.log(val)
  })
}
```

在组件销毁后，要移除事件监听；

方便在**eventBus.off()**传递函数，在**eventBus.on()**传递的函数应该抽离成**单独的函数**；

```jsx
import eventBus from "./event-bus"

...
componentDidMount() {
  eventBus.on('bannerPrev', this.bannerPrevClick)
}

bannerPrevClick(val) {
  console.log(val)
}

componentWillUnmount() {
  eventBus.off('bannerPrev', this.bannerPrevClick)
}
```

然而还有个问题：**bannerPrevClick**在运行时找不到this（当前组件实例），这样就无法调用setState()

可以将**bannerPrevClick**定义成箭头函数，或者显示绑定

```jsx
import eventBus from "./event-bus"

...
componentDidMount() {
  eventBus.on('bannerPrev', this.bannerPrevClick)
}

bannerPrevClick = (val) => {
  console.log(val)
}

componentWillUnmount() {
  eventBus.off('bannerPrev', this.bannerPrevClick)
}
```

或

```jsx
import eventBus from "./event-bus"

...
componentDidMount() {
  eventBus.on('bannerPrev', this.bannerPrevClick)
}

bannerPrevClick(val) {
  console.log(val)
}

componentWillUnmount () {
  eventBus.off('bannerPrev', this.bannerPrevClick)
}
```



# 实现插槽方案

react中有两种实现插槽的方式：

- 组件的**children**子元素；
- props属性传递**React**元素；

## props的**children属性**

- props中有一个**children**属性，是个**数组**，存放着多个子元素；
- 若只有一个子元素，则children不是数组，而是该子元素本身（缺点）；

**父元素**

```jsx
class App extends Component {
  render () {
    return (
      <div>
        <NavBar>
          <button>按钮</button>
          <h2>标题</h2>
          <i>斜体文字</i>
        </NavBar>
      </div>
    )
  }
}
```

**子元素**

```jsx
class NavBar extends Component {
  render () {
    const { children } = this.props
    return (
      <div className='nav-bar'>
        <div className="left">{children[0]}</div>
        <div className="center">{children[1]}</div>
        <div className="right">{children[2]}</div>
      </div>
    )
  }
}
```

通过children子元素实现插槽效果，还有个缺点，就是需要**索引**精准匹配；

## props传递React子元素

**父元素**

```jsx
render () {
    return (
      <div>
        <NavBar
          leftSlot={<button>按钮</button>}
          centerSlot={<h2>标题</h2>}
          rightSlot={<i>斜体文字</i>}
        />
      </div>
    )
  }
```

**子元素**

```jsx
render () {
    const { leftSlot, centerSlot, rightSlot } = this.props
    return (
      <div className='nav-bar'>
        <div className="left">{leftSlot}</div>
        <div className="center">{centerSlot}</div>
        <div className="right">{rightSlot}</div>
      </div>
    )
  }
```

## 作用域插槽

希望**复用**某个组件；

但是该组件展示**数据的方式**可能**不符合预期**；

而**父组件**希望能决定**数据的每一项**该以什么样的方式展示；

这时候就可以使用作用域插槽啦

**如何取到这每一项呢？**通过函数

**父组件**

```jsx
constructor() {
  super()
  this.state = {
    titles: ['流行', '新品', '精选'],
    tabIndex: 0
  }
}
changeTab (index) {
  this.setState({
    tabIndex: index
  })
}

render () {
  const { titles, tabIndex } = this.state
  return (
    <div>
      <TabControl
        titles={titles}
        tabClick={(index) => this.changeTab(index)}
        itemType={(item) => <button>{item}</button>}
      />
      <h1>{titles[tabIndex]}</h1>
    </div>
  )
}
```

**子组件**

```jsx
constructor(props) {
super(props)

this.state = {
  currentIndex: 0
}

emClick (index) {
this.setState({
  currentIndex: index
})
this.props.tabClick(index)


nder () {
const { titles, itemType } = this.props
const { currentIndex } = this.state

return (
  <div className='tab-control'>
    {
      titles.map((item, index) => {
        return (
          <div
            className={`item ${index === currentIndex ? 'active' : ''}`}
            key={item}
            onClick={() => this.itemClick(index)}
          >
            {itemType(item)}
          </div>
        )
      })
    }
  </div>
)
```

在**父组件中**，使用**TabControl组件**时增加一个props（**itemType**）；

itemType的值是一个**函数**，这个函数决定**每一项数据**在**子组件中**的展示方式；

而子组件通过**props**，可以调用这个函数，并且通过**参数**，可以传递**每一项数据**交给**父组件**；

# setState

## 为什么使用它

修改了state之后，希望React根据**最新的state**来重新渲染界面，但是React不知道数据发生了变化；

React并**没有数据劫持**，而Vue2使用**Object.defineProperty**或者Vue3使用**Proxy**来监听数据的变化；

需要通过setState来告知React，数据发生了变化；

## 用法

### **用法1：传入一个对象**

```js
setState({
    msg: 1
})
```

内部调用**Object.assign(this.state, newState)**，这个对象会和state**合并**，将指定属性的值覆盖

### **用法2：传入一个回调函数**

这个函数返回一个对象

```js
setState(() => {
  return {
      msg: 1
  }
})
```

这种方式和传入一个对象类似，**那这种方式有什么好处呢？**

1）可以编写对新state的**处理逻辑**，内聚性更强

2）当前回调函数可以传递**之前的state和props**

### 用法3：传入第二参数（callback）

setState在React的事件处理中是一个**异步调用**，不会立即完成，也不会阻塞其它代码；

如果希望数据合并之后进行一些逻辑处理，就可以在第二个参数传入一个回调函数；

```js
this.state = {
    msg: 0,
    name: 'hhh'
}

...
setState({ msg: 1 }, () => {
	console.log(this.state.msg)// 1
})
console.log(this.state.msg)// 0
```

## 为什么设计成异步

1）可以显著**提升性能**

- 若每次调用setState都进行一次更新，意味着render函数会被**频繁调用**，界面重新渲染，这样效率是很低的；
- 最好的办法应该是获取到多个更新，之后进行**批量更新**，只执行一次render函数；

2）若同步更新了state，但还没有执行render函数，那state和props不能保持同步

**而React18之前，有些情况setState是同步的**

- setTimeout
- 原生dom事件

如果想把setState变成同步，立即拿到最新state，可以使用**flushSync()**，这个函数在**react-dom**中；

```jsx
flushSync(() => {
    this.setState({
        msg: '123'
    })
})
console.log(this.state.msg)
```

# React性能优化

React在**state**或**props**发生改变时，会调用React的render方法，创建出一棵新的树；

如果一棵树参考另外一棵树进行完全比较更新，那时间复杂度将是**O(n²)**；

这开销会有点大，于是React进行了优化，将其优化成了**O(n)**:

- 只会**同层节点**比较，不会跨节点比较；
- **不同类型**的节点，产生不同的树结构；
- 开发中，可以通过**key**来指定哪些节点在不同的渲染下保持稳定；

## shouldComponentUpdate

当一个组件的render函数被执行，那这个组件的那些**子组件的render函数**也会被执行；

如果那些子组件的state或者props并没有发生改变，那重新执行render函数是**多余的、浪费性能**的；

它们调用render函数应该有个前提：**依赖的数据（state、props）发生改变时，再调用自己的render函数**；

如何控制render函数是否被调用：通过一个生命周期**shouldComponentUpdate**方法，很多时候简称**SCU**；

该方法有两个参数：

- 1）nextProps，修改之后的props
- 2）nextState，修改之后的state

例如，在一个组件中

```jsx
shouldComponentUpdate(nextProps, nextState) {
    if (this.state.msg !== nextState.msg) return true
    return false
}
```

只有msg发生改变才会重新执行它的render函数

可是，如果每个组件都要这样判断，那未免也太麻烦了

这时候React给我我们提供了**PureComponent**

## PureComponent

若当前组件是**类组件**，可以**继承PureComponent**；

对于props和state的判断，内部已经帮我做了，所以render函数就会根据需要来重新执行了；

不过，**内部的比较是浅层的**，使用**shallowEqual()**；

**后续开发类组件基本都是继承PureComponent**

```jsx
import { PureComponent } from 'react'

class App extends PureComponent {
  ...
  render () {
    return (
      <div>
        <h2>App</h2>
      </div>
    )
  }
}
```



## memo

类组件才有生命周期**shouldComponentUpdate**，那**函数式组件**如何判断props是否发生改变呢？

使用react中的**memo**

```jsx
import { memo } from 'react'

const Home = memo(function(props) {
  return <h2>home: {props.msg}</h2>
})

export default Home
```

## 数据不可变的力量

看个例子

```jsx
import React from "react"

class App extends React.Component {
  constructor() {
    super()

    this.state = {
      books: [
        { name: '你不知道的js', price: 99, count: 1 },
        { name: 'js高级程序设计', price: 88, count: 1 },
        { name: 'React高级程序设计', price: 78, count: 2 },
      ]
    }
  }

  addBooks () {
    const newBooks = { name: 'Vue高级程序设计', price: 66, count: 2 }
    this.state.books.push(newBooks)
    this.setState({ books: this.state.books })
  }

  render () {
    const { books } = this.state
    return (
      <div>
        <h2>数据列表</h2>
        <ul>
          {
            books.map((item, index) => {
              return (
                <li key={index}>
                  <span>name:{item.name}-price:{item.price}-counter:{item.count}</span>
                  <button>+1</button>
                </li>
              )
            })
          }
        </ul>
        <button onClick={e => this.addBooks()}>添加书籍</button>
      </div>
    )
  }
}
```

单独看addBooks

```js
addBooks() {
  const newBooks = { name: 'Vue高级程序设计', price: 66, count: 2 }
  this.state.books.push(newBooks)
  this.setState({ books: this.state.books })
}
```

这里修改state中的books方法是**直接修改**，虽然也能成功，但是React不推荐！为什么呢？

如果将这类组件**继承PureComponent**而不是Component，那这种方法修改不成功；

而继承PureComponent的类组件内部会判断修改前后的state是否发生变化，并且是**浅层的比较**，从而决定是否重新执行render函数；

而这浅层的比较只是比较到books这一层（内存地址）是否变化，并**没有比较books里面的内容**；

这种浅层比较，导致**内部判断state没有发生变化**（实际books内容已经变了），而**不会重新执行render**函数；

应该写成这样（组件先改成继承PureComponent）

```jsx
addBooks () {
  const newBooks = { name: 'Vue高级程序设计', price: 66, count: 2 }
  const books = [...this.state.books]
  books.push(newBooks)
  this.setState({ books: books })
}
```

重新创建的**books和state中books的内存地址不一样**，内部判断state发生了变化，所以会重新执行render函数；

# ref

## 获取原生dom

- 在React元素上绑定一个ref字符串
- 提前创建ref对象(通过current取到)，createRef()，将创建出来的对象绑定到React元素（**推荐**）
- 传入一个回调函数，在对应的元素被渲染之后，回调函数被执行，并将该元素传入该回调函数

```jsx
import React, { createRef, PureComponent } from 'react'

export class App extends PureComponent {
  constructor() {
    super()
    this.titleRef = createRef()
    this.titleEl = null
  }
  getDOM () {
    // 1.在React元素上绑定一个ref字符串
    console.log(this.refs.zsf) // 已废弃
    // 2.提前创建ref对象(通过current取到)，createRef()，将创建出来的对象绑定到React元素
    console.log(this.titleRef.current)
    // 3.传入一个回调函数，在对应的元素被渲染之后，回调函数被执行，并将该元素传入该回调函数
    console.log(this.titleEl)
  }
  render () {
    return (
      <div>
        <h2 ref='zsf'>App1</h2>
        <h2 ref={this.titleRef}>App2</h2>
        <h2 ref={(el) => this.titleEl = el}>App2</h2>
        <button onClick={e => this.getDOM()}>获取DOM</button>
      </div>
    )
  }
}

```

## 获取组件实例

对于类组件，和获取原生dom类似

```jsx
constructor() {
  super()
  this.hRef = createRef()
}
getDOM () {
  console.log(this.hRef.current)
}
render () {
  return (
    <div>
      <Hello ref={this.hRef} />
      <button onClick={e => this.getDOM()}>获取DOM</button>
    </div>
  )
}
```

而**函数式组件没有实例**，但是在开发中可能想要获取**函数式组件中某个元素的DOM**，如何操作？

直接拿不到，但可以通过react提供的一个高阶函数**forwordRef**，接收一个函数（也就是传入函数式组件）；

函数式组件第二个参数是接收一个**ref**；

在App中创建的**ref**传给函数式组件**Hello**，而经过**forwordRef**的**转发**，可以将其绑定函数式组件某个元素的DOM；

```jsx
const Hello = forwardRef(function (props, ref) {
  return (
    <div>
      <h1 ref={ref}>hello</h1>
      <p>hhh</p>
    </div>
  )
})

class App extends PureComponent {
  constructor() {
    super()
    this.hRef = createRef()
  }
  getDOM () {
    console.log(this.titleRef.current)
  }
  render () {
    return (
      <div>
        <Hello ref={this.hRef} />
        <button onClick={e => this.getDOM()}>获取DOM</button>
      </div>
    )
  }
}
```

# 受控和非受控组件

## 受控组件

在HTML中，表单元素通常会自己维护state，并根据**用户输入**进行更新；

表单元素一旦**绑定value值来自state中的属性**，那么它就变成了**受控组件**；

而React中没有双向绑定，是通过受控组件来控制input、textarea等表单元素；

想修改value需要监听表单元素的**onChange**事件，通过**event.target.value**获取最新的value值；

```jsx
constructor() {
  super()
  this.state = {
    username: ''
  }
}

inputChange (event) {
  this.setState({ username: event.target.value })
}
render () {
  const { username } = this.state
  return (
    <div>
      <h2>App</h2>
      <h2>username:{username}</h2>
      {/* 受控组件 */}
      <input type="text" value={username} onChange={e => this.inputChange(e)} />
      {/* 非受控组件 */}
      <input type="text" />
    </div>
  )
}
```

### form表单

对于传统的form表单，默认是是会向服务器**发起网络请求**并**刷新页面**；

在React中需要监听**onSubmit事件**，使用event对象的**preventDefault()**阻止这一默认行为；

```jsx
constructor() {
  super()
  this.state = {
    username: ''
  }
}
handleSubmit (event) {
  event.preventDefault()
  console.log(this.state.username)
}
inputChange (event) {
  this.setState({ username: event.target.value })
}
render () {
  const { username } = this.state
  return (
    <div>
      <form onSubmit={e => this.handleSubmit(e)}>
        <label htmlFor="username">
          用户：<input id='username' type="text" value={username} onChange={e => this.inputChange(e)} />
        </label>
        <button type='submit'>提交</button>
      </form>
    </div>
  )
}
```

### 多个受控组件同个函数处理

```jsx
constructor() {
  super()
  this.state = {
    username: '',
    password: ''
  }
}
handleSubmit (event) {
  event.preventDefault()
  console.log(this.state)
}
inputChange (event) {
  this.setState({ [event.target.name]: event.target.value })
}
render () {
  const { username, password } = this.state
  return (
    <div>
      <form onSubmit={e => this.handleSubmit(e)}>
        <label htmlFor="username">
          用户：<input id='username' name='username' type="text" value={username} onChange={e => this.inputChange(e)} />
        </label>

        <label htmlFor="username">
          密码：<input id='password' name='password' type="password" value={password} onChange={e => this.inputChange(e)} />
        </label>

        <button type='submit'>提交</button>
      </form>
    </div>
  )
}
```

### 处理多选表单

**checkbox**和**radio**这两种表单用的是**checked**来保存状态，不是value；

```jsx
constructor() {
  super()
  this.state = {
    hobbies: [
      { value: 'sing', text: '唱', isChecked: false },
      { value: 'dance', text: '跳', isChecked: false },
      { value: 'rap', text: 'rap', isChecked: false },
    ]
  }
}
handleSubmit (event) {
  event.preventDefault()

  console.log(this.state.hobbies)
}
inputChange (event, index) {
  const hobbies = [...this.state.hobbies]
  hobbies[index].isChecked = event.target.checked
  this.setState({ hobbies: hobbies })
}

render () {
  const { hobbies } = this.state
  return (
    <div>
      <form onSubmit={e => this.handleSubmit(e)}>
        爱好
        {
          hobbies.map((item, index) => {
            return (
              <label htmlFor={item.value} key={item.value}>
                <input id={item.value} type="checkbox" checked={item.isChecked} onChange={e => this.inputChange(e, index)} />
                <span>{item.text}</span>
              </label>

            )
          })
        }

        <button type='submit'>提交</button>
      </form>
    </div>
  )
}
```

### select多选

select**单选**和普通表单写法类似，要是多选呢？

多选时，select元素的value得是**数组**

select如何获取用户选中的多个状态呢？**event.target.selectedOptions**

不过**event.target.selectedOptions**是类数组，不能使用一些数组的高阶函数；

可以使用**Array.from()**,将它转化成数组；

```jsx
constructor() {
  super()
  this.state = {
    fruit: ['orange']
  }
}
handleSubmit (event) {
  event.preventDefault()

  console.log(this.state.fruit)
}
inputChange (event) {
  const options = Array.from(event.target.selectedOptions)
  const values = options.map(item => item.value)
  this.setState({ fruit: values })
}

render () {
  const { fruit } = this.state
  return (
    <div>
      <form onSubmit={e => this.handleSubmit(e)}>
        水果
        <select value={fruit} onChange={e => this.inputChange(e)} multiple>
          <option value="apple">苹果</option>
          <option value="orange">橘子</option>
          <option value="banana">香蕉</option>
        </select>
        <button type='submit'>提交</button>
      </form>
    </div>
  )
}
```



## 非受控组件

而表单元素的value值交给**浏览器**维护，借助**ref**来获取

# 高阶组件

Higher-Order Components，简称**HOC**；

高阶组件是**参数**为组件，**返回值**为新组件的函数；

可以对传入的组件**拦截**，然后可以进行**props增强、登陆鉴权**等等操作

应用场景：

- props增强
- 登陆鉴权
- 劫持生命周期（比如计算渲染花费时间）

比如**memo()**、**forwardRef()**都是高阶组件

## **应用**

### props增强

不修改原有代码的情况下，添加新的props；

**Home**

```jsx
const Home = enhancedUserInfo(function (props) {
  return <h1>Home: {props.name}- {props.level}</h1>
})
```

**enhancedUserInfo**

```jsx
function enhancedUserInfo (Cpn) {
  class NewComponent extends PureComponent {
    constructor() {
      super()

      this.state = {
        userInfo: {
          name: 'zsf',
          level: 99
        }
      }
    }
    render () {
      return <Cpn {...this.state.userInfo} />
    }
  }
  return NewComponent
}
```

**App**

```jsx
export class App extends PureComponent {
  render () {
    return (
      <div>
        <Home />
      </div>
    )
  }
}
```

**实际应用场景---context**

**App**

```jsx
<div>
   <ThemeContext.Provider value={{ color: 'red', size: 30 }}>
     <Home />
   </ThemeContext.Provider>
 </div >
```

**ThemeContext**

```js
import { createContext } from "react"
const ThemeContext = createContext()
export default ThemeContext
```

**Home**

```jsx
class Home extends PureComponent {
  render () {
    const { color, size } = this.props
    return (
      <div>Home:{color} - {size}</div>
    )
  }
}

export default withTheme(Home)
```

**withTheme**

```jsx
function withTheme(Cpn) {
  return (props) => {
    return (
      <ThemeContext.Consumer>
        {
          value => {
            return <Cpn {...value} {...props} />
          }
        }
      </ThemeContext.Consumer>
    )
  }
}
```

### 登陆鉴权

开发中，若需要**判断用户是否登陆**才能显示某个组件；

如果每个组件都需要自己判断，那太繁琐了；

可以编写个高阶组件：对每个组件进行鉴权判断，然后再决定是否显示；

**App**

```jsx
render () {
  return (
    <div>
      <Home />
    </div >
  )
}
```

**Home**

```jsx
export class Home extends PureComponent {
  render () {
    return (
      <div>home</div>
    )
  }
}

export default loginAuth(Home)
```

**loginAuth**

```js
function loginAuth(Cpn) {
  return props => {
    const token = localStorage.getItem('token')

    if(token) {
      return <Cpn {...props}/>
    } else {
      return <h2>请先登陆</h2>
    }
  }
}
```

### 生命周期的劫持

应用类似。。。

## 意义

早期React提供组件之间复用代码的方式是**mixin**，目前已经不在建议使用；

mixin可能会**相互依赖**，**相互耦合**，不利于代码维护；

而**HOC**也是一种组件间复用代码的方式；

## 缺点

- HOC需要在原组件上进行包裹或嵌套，若大量使用HOC，将会产生非常多的**嵌套**，这让调试变得困难；
- HOC可以**劫持props**，在不遵守约定的情况下也可能造成冲突；

而**hooks**的出现，是开创性的，它解决了很多React之前存在的问题，比如**this指向**、**hoc的嵌套复杂**等等

# portals

某些情况下，希望渲染的内容**独立于父组件**，甚至是独立于当前挂载到的DOM元素中（默认都是挂载到id为root的DOM的）；

使用来自react-dom中的**createPortal(内容，DOM元素)**

# fragment

如果不希望多渲染出一个根元素（经常使用div），可以使用fragment；

类似vue中的**template**

```jsx
render () {
  return (
    <Fragment>
      <h1>1</h1>
      <span>2</span>
    </Fragment >
  )
}
```

## fragment语法糖

```jsx
render () {
  return (
    <>
      <h1>1</h1>
      <span>2</span>
    </>
  )
}
```

**如果有key属性这不能省略fragment**

# StrictMode

**StrictMode**是一个用来**突出显示**应用程序中**潜在问题**的工具：

- 与fragment一样，StrictMode不会渲染任何可见的UI；
- 它为其后代元素触发额外的检查和警告；
- 仅在开发模式下运行，不影响生产构建；
- 可以为应用程序**任何部分**开启严格模式；

## 检测内容

- 不安全的**生命周期**
- 过时的ref API
- 过时的context API
- 意外的副作用（严格模式下会执行2次生命周期，看看是否有副作用）
