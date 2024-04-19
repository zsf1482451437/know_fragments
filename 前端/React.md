# 基础语法

## 技术特点

**非技术方面**

- 由**facebook**来维护和更新，它是大量优秀程序员的**思想结晶**；
- **react hooks**是**开创性**的新功能；
- **vue composition api**学习**react hooks**的思想；

**技术方面**

- **声明式**---它允许只需要维护**自己的状态**，当状态改变时，React可以根据**最新的状态**去渲染UI界面
- **组件化开发**---复杂页面拆分成一个个**小组件**
- **跨平台**---Web、ReactNative（或Flutter）、ReactVR



## 三个开发依赖

react开发必须需要**3个库**：

- **react**---包含react所必须的**核心代码**
- **react-dom**---react渲染在**不同平台**所需要的核心代码
- **babel**---将**jsx**转换成浏览器识别的代码的工具

**为什么需要react-dom这个库呢？**

- web端：react-dom会将**jsx**最终渲染成**真实DOM**，显示在浏览器中
- native端：react-dom会将**jsx**最终渲染成**原生的控件**，比如android和ios的按钮

**babel和react的关系**

- 可以使用**React.createElement**来编写js代码，但是非常**繁琐**，且**可读性差**；
- 而**jsx**（JavaScript XML）的语法可以克服以上缺点；
- 但浏览器不能识别**jsx**这种高级语法，需要**babel**进行转换成**普通js**；

## **hello案例**

```html
<div id="root"></div>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script> 
<!-- babel -->
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
```

```jsx
// script要写上type属性，需要转化代码
// React18以前
// ReactDOM.render(<h2>Hello World</h2>, document.querySelector('#root'))
// 18之后
const root = ReactDOM.createRoot(document.querySelector('#root'))
// 1.文本定义成变量
let msg = 'Hello World'

// 2.监听按钮的点击
function btnClick() {
  // 2.1修改数据
  msg = 'React'

  // 2.2重新渲染界面
  rootRender()
))
}
rootRender()
// 3.封装一个渲染函数
function rootRender() {
  root.render((
    <div>
      <h2>{msg}</h2>
      <button onClick={btnClick}>修改文本</button>
    </div>
  ))
}
```

## jsx

jsx是一种JavaScript的**语法拓展**（eXtension），很多地方称之为JavaScript XML，因为看起来就是一段XML语法；

它用于**描述UI界面**，并且其可以完成**和JavaScript融合**在一起使用；

它**不同于Vue中的模板语法**，不需要学习模板语法中的一些指令（比如v-for、v-if、v-else、v-bind）；

```jsx
class App extends React.Component {
  // 组件数据
  constructor() {
    super()
    this.state = {
      counter: 0
    }
  }
  // 方法

  // 渲染内容 render方法
  render() {
    const { counter } = this.state
    const msg = <h2>当前计数：{counter}</h2>
    return msg
  }
}
// 创建root并渲染App组件
const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

**为什么React选择JSX而不是像vue一样搞一个模板语法？**

react认为**渲染逻辑**本质上与**其它UI逻辑**存在内在耦合；

- 比如**UI需要绑定事件**；
- 比如**UI中需要展示状态**；
- 比如在**某些状态发生改变时，又需要改变UI**；

### 书写规范

- 顶层只能有**一个根元素**，所以很多时候外层包裹一个div（或**Fragment**）；
- 为了方便阅读，通常在最外层包一个**小括号**；
- 单标签必须以/>结尾；
- **注释**写法 `{ /* 注释 */ }`

```jsx
class App extends React.Component {
  // 组件数据
  constructor() {
    super()
    this.state = {
      counter: 0
    }
  }
  // 方法

  // 渲染内容 render方法
  render() {
    { /* 注释 */ }  
    const { counter } = this.state
    const msg = <h2>当前计数：{counter}</h2>
    return msg
  }
}
// 创建root并渲染App组件
const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

### 嵌入内容

插入**变量为子元素**时

- 若是**Number、String、Array**类型时，可以直接显示；
- 若是**null、undefined、Boolean**类型时，内容为空，要想显示**需要转换**为字符串；
- **object对象类型**不能作为子元素（not valid as a react child）

插入**表达式**时

类似插值表达式

- 运算表达式
- 三元运算符
- 执行一个函数

### 绑定属性

- **class绑定**尽量使用**className**，因为在jsx中class是关键字（有警告）；
- 有**动态类**可以使用**字符串拼接**、**数组动态添加**、第三方库**classnames**等等；
- 绑定style属性：绑定**对象类型**；



```jsx
constructor() {
  super()
  this.state = {
    title: 'hhh',
    isActive: true
  }
}
// 方法

// 渲染内容 render方法
render() {
  const { title, isActive } = this.state
  // 1.class绑定写法一：字符串拼接
  const className = `abc cba ${isActive ? 'active' : ''}`
  // 2.class绑定写法二：将所有的class放数组中
  const classList = ['abc', 'cba']
  if(isActive) classList.push('active')
   
  return (
    <div>
      <h2 title={title} className={className}>123</h2>
      <h2 className={classList.join(' ')}>123</h2>
      <h2 style={{color: "red", fontSize: "30px"}}>ggg</h2>
    </div>
  )
}
```

### 事件绑定

**原生DOM有个监听事件，可以如何操作？**

- 获取节点，添加监听事件
- 节点上绑定onxxx

**在React中是如何操作的呢？**

- 事件命名采用**小驼峰**（camelCase）；
- 通过**{}**传入事件处理函数，这函数会在事件发生时被执行；

#### **this的绑定问题**

- 主动修改this指向，**显式绑定**
- **es6 class yields**
- 直接传入**箭头函数**

**方法在哪里定义?**

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
  btnClick() {
    console.log(this) // undefined
  }

  // 渲染内容 render方法
  render() {
    return (
      <div>
        <h2>{this.state.msg}</h2>
        <button onClick={this.btnClick}>修改文本</button>
      </div>
    )
  }
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```



`onClick={this.btnClick}`

等效于

```js
const click = this.btnClick
click()
```

由于**类**中代码会使用**严格模式**，**独立调用**的函数中**this指向undefined**

**如何将this指向当前对象实例？**显式绑定

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
  btnClick() {
    console.log(this) // undefined
  }

  // 渲染内容 render方法
  render() {
    return (
      <div>
        <h2>{this.state.msg}</h2>
        <button onClick={this.btnClick.bind(this)}>修改文本</button>
      </div>
    )
  }
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

render函数中的this指向的便是**当前对象的实例**

`onClick={this.btnClick.bind(this)}`

等效于

```js
const click = this.btnClick.bind(this)
click()
```

综上，

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
  btnClick() {
    this.setState({
      msg: 'React'
    })
  }

  // 渲染内容 render方法
  render() {
    return (
      <div>
        <h2>{this.state.msg}</h2>
        <button onClick={this.btnClick.bind(this)}>修改文本</button>
      </div>
    )
  }
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

还可以这样修改this，提前在**constructor**里修改this指向，这样使用时会方便一点，不用每次都要写bind

```jsx
class App extends React.Component {
  // 组件数据
  constructor() {
    super()
    this.state = {
      msg: 'hello'
    }
    this.btnClick = this.btnClick.bind(this)
  }
  // 组件方法
  btnClick() {
    this.setState({
      msg: 'React'
    })
  }

  // 渲染内容 render方法
  render() {
    return (
      <div>
        <h2>{this.state.msg}</h2>
        <button onClick={this.btnClick}>修改文本</button>
      </div>
    )
  }
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

**setState()来自哪里呢？**

继承自**React.Component**，其内部完成了两件事：

- 将**state**中指定的值修改掉（这里是msg）；
- 自动**重新执行render**函数；

**es6 class yields 方式**

```jsx
// 利用es6的class yields语法，类中也可以给成员赋值
btnClick = () => {
  console.log(this) // 当前对象实例
}

// 渲染内容 render方法
render() {
  const { btnClick } = this
  return (
    <div>
      <button onClick={btnClick}></button>
    </div>
  )
}
```

**直接传入箭头函数**

- 当事件触发时，会调用该箭头函数；

- 而该箭头函数里面又可以调用一个函数；


```jsx
btnClick = () => {
  console.log(this) // 当前对象实例
}

// 渲染内容 render方法
render() {
  const { btnClick } = this
  return (
    <div>
      <button onClick={() => btnClick()}></button>
    </div>
  )
}
```

#### 参数传递问题

虽然**bind**那种方式也可以传递参数，但是会有**参数顺序**的问题；

所以使用**箭头函数**好一点；

```jsx
// 利用es6的class yields语法，类中也可以给成员赋值
btnClick = (event, name, age) => {
  console.log(event) // 当前对象实例
  console.log(name)
  console.log(age)
}

// 渲染内容 render方法
render() {
  const { btnClick } = this
  return (
    <div>
      <button onClick={(e) => btnClick(e, 'zsf', 18)}></button>
    </div>
  )
}
```

### 条件渲染

- 条件判断语句（逻辑较多的情况）
- 三元运算符（简单逻辑）
- 与运算符&&（条件成立渲染某个组件，不成立什么也不渲染）

### jsx转化js本质

每遇到一个标签，就会调用**React.createElement(type, config, ...children)**

参数**type**：

- 若是标签元素，使用**字符串**，如 **’div‘**；
- 若是组件元素，使用**组件名**，如 **login**；

参数**config**：

- 所有jsx中的**属性**都在config中以**键值对**的形式存在，比如**className属性**；

参数**children**：

- 存放在元素中的内容，以**children数组**的方式进行存储；

复制一段jsx代码去babel官网转化

jsx

```jsx
<div>
  <h2>{this.state.msg}</h2>
  <button onClick={this.btnClick}>修改文本</button>
</div>
```

js

```js
"use strict";

/*#__pure__*/React.createElement("div", null,
                    /*#__pure__*/React.createElement("h2", null, (void 0).state.msg),
                    /*#__pure__*/React.createElement("button", { onClick: (void 0).btnClick },"\u4FEE\u6539\u6587\u672C"));
```

其中

```
/*#__pure__*/
```

pure是**“纯”**的意思，表示后面的函数是**纯函数**；

由于纯函数**没有副作用**（不会影响其它作用域的内容），在用不上的时候，**tree shaking**时可以放心摇掉；

### 虚拟DOM

通过React.createElement最终创建出来一个**ReactElement**对象；

一个个ReactElement对象组成**JavaScript对象树**；

这个对象树就是**虚拟DOM**；

**虚拟DOM有什么作用？**

- 可以快速进行**diff**算法，更新节点；
- 它只是js对象，渲染成什么真实节点由**平台**决定，**跨平台**；
- **声明式**编程，你只需要告诉React希望UI是什么状态，不需要直接进行DOM操作，从手动修改DOM、属性操作、事件处理中解放出来

### 协调

可以通过**ReactDOM.render**让虚拟DOM和真实DOM的同步起来，这个过程叫**协调**；



## 列表案例

```jsx
// 组件数据
constructor() {
  super()
  this.state = {
    list: [1, 2, 3, 4],
    currentIndex: 0
  }
}
// 
btnClick = (index) => {
  this.setState({
    currentIndex: index
  })
}

// 渲染内容 render方法
render() {
  const { list, currentIndex } = this.state
  const { btnClick } = this

  return (
    <div>
      <ul>
        {
          list.map((item, index) => {
            return (
             <li 
               className={currentIndex === index ? 'active' : ''}
               key={item}
               onClick={() => btnClick(index)}
             >
             {item}
             </li>
            )
          })
        }
      </ul>
    </div>
  )
}
```

## 计数器案例

```jsx
class App extends React.Component {
  // 组件数据
  constructor() {
    super()
    this.state = {
      counter: 0
    }
    
    this.increment = this.increment.bind(this)
    this.decrement = this.decrement.bind(this)
  }
  // 方法
  increment() {
    this.setState({
      counter: this.state.counter + 1
    })
  }
  decrement() {
    this.setState({
      counter: this.state.counter - 1
    })
  }

  // 渲染内容 render方法
  render() {
    const { counter } = this.state
    const { increment, decrement } = this
    return (
      <div>
        <h2>当前计数：{counter}</h2>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
      </div>
    )
  }
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App/>)
```

## 购物车案例

**数据源**

```js
const books = [
  {
    id: 1,
    name: '《算法导论》',
    date: '2006-9',
    price: 85.00,
    count: 1
  },
  {
    id: 2,
    name: '《UNIX编程艺术》',
    date: '2006-2',
    price: 59.00,
    count: 1
  },
  {
    id: 3,
    name: '《编程珠玑》',
    date: '2008-10',
    price: 39.00,
    count: 1
  },
  {
    id: 4,
    name: '《代码大全》',
    date: '2006-3',
    price: 128.00,
    count: 1
  },
]
```

**组件数据**

```jsx
// 组件数据
constructor() {
  super()
  this.state = {
    books: books
  }
}
```

**组件方法**

```jsx
// 总价
getTotalPrice() {
  return this.state.books.reduce((preValue, item) => preValue + item.count * item.price, 0)
}
// 增加/减少
changeCount(index, count) {
  // react不推荐直接修改state中的数据，推荐做法是浅拷贝
  const newBooks = [...this.state.books]
  newBooks[index].count += count
  // 修改state，重新执行render函数
  this.setState({ books: newBooks })
}
// 删除一条数据
removeItem(index) {
  const newBooks = [...this.state.books]
  newBooks.splice(index, 1)
  // 修改state，重新执行render函数
  this.setState({ books: newBooks })
}
```

**渲染函数**



```jsx
// 有书时的渲染内容
renderBookList() {
  const { books } = this.state
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>书籍名称</th>
            <th>出版日期</th>
            <th>价格</th>
            <th>购买数量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {
            books.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.date}</td>
                  <td>{'￥' + item.price.toFixed(2)}</td>
                  <td>
                    <button 
                      disabled={item.count <= 1}
                      onClick={() => this.changeCount(index, -1)}
                    >
                    -
                    </button>
                    {item.count}
                    <button onClick={() => this.changeCount(index, 1)}>+</button>
                  </td>
                  <td>
                    <button onClick={() => this.removeItem(index)}>删除</button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <h2>总价格：{'￥' + this.getTotalPrice().toFixed(2)}</h2>
    </div>
  )
}
// 无书时的渲染内容
renderBookEmpty() {
  return <div><h2>购物车为空，请添加书籍</h2></div>
}
// 渲染内容 render方法
render() {
  const { books } = this.state
  return books.length ? this.renderBookList() : this.renderBookEmpty()
}
```



# 组件化开发

根据**定义方式**，可分为

- 函数组件
- 类组件

根据内部**是否有状态需要维护**，可分为

- 无状态组件
- 有状态组件

根据**职责**，可分为

- 展示型组件
- 容器型组件

## 类组件

1. 定义一个**类**（类名**大写**，组件名称必须是大写，小写会被认为是html元素），**继承自React.Component**;
2. **constructor**可选，通常初始化一些数据；
3. **this.state**中维护组件内部数据；
4. class中必须实现**render方法**（render当中返回的**jsx内容**，就是之后React会帮助我们渲染的内容）；

### render函数的返回值

- **react**元素（通过jsx写的代码，组件也算react元素）
- **数组 **（会遍历数组元素并显示）或 **fragments**
- **portals**：可以渲染子节点到不同的DOM子树中
- **字符串**或**数值类型**，在DOM中会被渲染为文本节点
- **布尔类型**或**null**：什么都不渲染



### 数据

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

## 函数式组件

返回值和**类组件render函数**返回值一样

### 特点（hooks出现之前）

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

## 生命周期

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

### 执行顺序

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

### 操作建议

#### **constructor**

若**不初始化state**或**不进行方法绑定**，则不需要React组件实现构造函数；

通常只做两件事：

- 初始化state；
- 为事件绑定this；

#### componentDidMount

- 依赖于DOM的操作
- 发送网络请求（官方建议）
- 添加一些订阅（会在componentWillUnmount取消订阅）

#### componentDidUpdate

- 若对更新前后的**props**进行了比较，也可以在此处进行网络请求（例如当props未发生变化时，不发送网络请求）

#### componentWillUnmount

- 清除、取消操作

### 不常用生命周期

**shouldComponentUpdate**

当该函数返回**false**时，则**不会重新执行render**函数，反之则会；

**getSnapshotBeforeUpdate**

在React更新DOM之前回调的一个函数，可以获取**DOM更新前**的一些信息，比如滚动位置；

## 组件通信

### 父传子

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

### props类型限制

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

### 子传父

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

### 案例

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

### 非父子

如果两组件传递数据跨层级比较多，一层层传递非常麻烦；

react提供了一个API：**Context**；

Context提供了一种**组件间共享某些数据**的方案，比如当前认证得用户、主题或首选语言；

#### context的基本使用

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

#### 函数式组件共享context

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

#### 事件总线EventBus

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



## 实现插槽方案

react中有两种实现插槽的方式：

- 组件的**children**子元素；
- props属性传递**React**元素；

### props的**children属性**

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

### props传递React子元素

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

### 作用域插槽

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

## setState

### 为什么使用它

修改了state之后，希望React根据**最新的state**来重新渲染界面，但是React不知道数据发生了变化；

React并**没有数据劫持**，而Vue2使用**Object.defineProperty**或者Vue3使用**Proxy**来监听数据的变化；

需要通过setState来告知React，数据发生了变化；

### 用法

#### **用法1：传入一个对象**

```js
setState({
    msg: 1
})
```

内部调用**Object.assign(this.state, newState)**，这个对象会和state**合并**，将指定属性的值覆盖

#### **用法2：传入一个回调函数**

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

#### 用法3：传入第二参数（callback）

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

### 为什么设计成异步

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

## React性能优化

React在**state**或**props**发生改变时，会调用React的render方法，创建出一棵新的树；

如果一棵树参考另外一棵树进行完全比较更新，那时间复杂度将是**O(n²)**；

这开销会有点大，于是React进行了优化，将其优化成了**O(n)**:

- 只会**同层节点**比较，不会跨节点比较；
- **不同类型**的节点，产生不同的树结构；
- 开发中，可以通过**key**来指定哪些节点在不同的渲染下保持稳定；

### shouldComponentUpdate

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

### PureComponent

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



### memo

类组件才有生命周期**shouldComponentUpdate**，那**函数式组件**如何判断props是否发生改变呢？

使用react中的**memo**

```jsx
import { memo } from 'react'

const Home = memo(function(props) {
  return <h2>home: {props.msg}</h2>
})

export default Home
```

### 数据不可变的力量

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

## ref

### 获取原生dom

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

### 获取组件实例

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

## 受控和非受控组件

### 受控组件

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

#### form表单

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

#### 多个受控组件同个函数处理

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

#### 处理多选表单

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

#### select多选

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



### 非受控组件

而表单元素的value值交给**浏览器**维护，借助**ref**来获取

## 高阶组件

Higher-Order Components，简称**HOC**；

高阶组件是**参数**为组件，**返回值**为新组件的函数；

可以对传入的组件**拦截**，然后可以进行**props增强、登陆鉴权**等等操作

应用场景：

- props增强
- 登陆鉴权
- 劫持生命周期（比如计算渲染花费时间）

比如**memo()**、**forwardRef()**都是高阶组件

### **应用**

#### props增强

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

#### 登陆鉴权

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

#### 生命周期的劫持

应用类似。。。

### 意义

早期React提供组件之间复用代码的方式是**mixin**，目前已经不在建议使用；

mixin可能会**相互依赖**，**相互耦合**，不利于代码维护；

而**HOC**也是一种组件间复用代码的方式；

### 缺点

- HOC需要在原组件上进行包裹或嵌套，若大量使用HOC，将会产生非常多的**嵌套**，这让调试变得困难；
- HOC可以**劫持props**，在不遵守约定的情况下也可能造成冲突；

而**hooks**的出现，是开创性的，它解决了很多React之前存在的问题，比如**this指向**、**hoc的嵌套复杂**等等

## portals

某些情况下，希望渲染的内容**独立于父组件**，甚至是独立于当前挂载到的DOM元素中（默认都是挂载到id为root的DOM的）；

使用来自react-dom中的**createPortal(内容，DOM元素)**

## fragment

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

### fragment语法糖

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

## StrictMode

**StrictMode**是一个用来**突出显示**应用程序中**潜在问题**的工具：

- 与fragment一样，StrictMode不会渲染任何可见的UI；
- 它为其后代元素触发额外的检查和警告；
- 仅在开发模式下运行，不影响生产构建；
- 可以为应用程序**任何部分**开启严格模式；

### 检测内容

- 不安全的**生命周期**
- 过时的ref API
- 过时的context API
- 意外的副作用（严格模式下会执行2次生命周期，看看是否有副作用）

# react中的样式

css的设计并不是为组件化而生的，目前**组件化框架**中都需要一种合适的**css解决方案**；

在组件化中选择合适的css解决方案应该符合以下条件：

- 局部css：具备**独立作用域**，不会污染其它组件样式；
- **动态css**：可以获取当前组件的一些状态，根据状态的变化生成不同的css样式（某些值是来自**js的变量**）；
- 支持所有的**css特性**：伪类、动画、媒体查询等；
- 编写起来符合**css风格**特点

## css解决方案

### 内联样式

- style接收**小驼峰**命名的**js对象**，而不是字符串；
- 也可以引用**state**中的状态来设置相关样式；

#### 优点

- 样式之间不会冲突；
- 可以动态获取当前state中的状态；

#### 缺点

- 写法上需要驼峰标识；
- 某些样式无提示；
- 大量的样式会使代码混乱；
- 某些样式无法编写（伪类、伪元素）；

```jsx
constructor() {
  super()
  this.state = {
    titleSize: 30
  }
}
addSize () {
  this.setState({ titleSize: this.state.titleSize + 2 })
}
render () {
  const { titleSize } = this.state
  return (
    <Fragment>
      <h2 style={{ color: 'red', fontSize: `${titleSize}px` }}>我是标题</h2>
      <button onClick={e => this.addSize()}>增加</button>
    </Fragment >
  )
}
```

**官方推荐内联样式和普通css结合起来写**

### 普通的css

- 通常会编写到一个**单独的文件**，之后再进行引入；
- 但是这样的css属于**全局css，**样式之间会相互影响；
- 这种编写方式最大的问题是样式之间会**相互层叠**；

### css modules

css modules并不是React特有的解决方案，而是使用了类似**webpack配置环境**下都可以使用的；

若想在项目中使用，需要配置**webpack.config.js**中的**modules属性为true**；

React脚手架已经**内置**了css modules的配置；

**.css/.less/.scss**等样式文件都需要修改成**.modules.css/.modules.less/.modules.scss**等；

之后以**对象的形式**使用；

为了保持类名的**唯一性**，类名尾部会拼接上**动态的哈希值**；

**App**

```jsx
import appStyle from './App.module.css'

...
render () {
  return (
    <Fragment>
      <h2 className={appStyle.title}>我是标题</h2>
    </Fragment >
  )
}
```

**App.module.css**

```css
.title {
  font-size: 32px;
  color: green;
}
```

#### 缺点

- 类名**不能使用连接符**（比如.home-title）,这在js中是不识别的；
- 所有的className都必须使用（**style.className**）的形式来编写；
- **不方便动态修改样式**，依然**需要使用内联样式**的方式；

#### React项目中使用less

想在React项目中使用less，得安装less-loader并进行相关的配置；

##### 安装

而webpack配置在React项目中是隐藏的，如果想改可以安装一个工具**craco**（将webpack源码暴露出来修改不推荐）；

```
npm install @craco/craco@alpha
```

如果安装出现脚手架版本不兼容，可以去github上的issue部分，查看人家怎么解决的；

查到的资料是安装alpha的版本

```
npm install @craco/craco
```

##### 修改命令

在**package.json**里的scripts修改运行项目的命令，将**react-scripts都替换成craco**，不再是react-scripts帮我吗启动项目了，交给carco；

##### 安装craco-less

使用craco-less代替less-loader

```
npm install craco-less
```



##### 新建文件

新建一个叫**craco.config.js**的文件，里面的配置会合并到webpack配置中；

### CSS in JS

css in js模式是一种将**样式也写入JavaScript中**的方式，并且可以方便使用JavaScript的**状态**；

css in js 通过JavaScript来为css赋予一些能力，包括**类似css预处理器**一样的**样式嵌套**、**函数定义**、**逻辑复用**、**动态修改状态**等等；

虽然css预处理器也具备某些能力，但**获取动态状态**依然是不好处理的点；

所以，目前可以说css-in-js是React编写css**最为受欢迎**的一种解决方案；

目前比较流行的css-in-js的库有哪些？

- style-components
- emotion
- glamorous

#### styled-components

安装

```
npm install styled-components
```

##### 基本使用

使用该库中的**sytled.div**方法，渲染出一个div组件；

```js
import styled from 'styled-components'

export const AppWrapper = styled.div`` // 标签模板字符串写法，也算函数调用
```

**这么做有什么好处？**

这样就可以针对AppWrapper包裹的**所有子元素**，编写样式了；

```js
import styled from 'styled-components'

export const AppWrapper = styled.div`
  .section {
    border: 1px solid red;
    .title {
      font-size: 30px;
      color: blue;
    }
    .content {
      font-size: 20px;
      color: green;
    }
  }
`
```

同时安装一个vscode插件（vscode-styled-components），可以**高亮**和**提示**

##### 引用js状态

主要有三种

- 接收外部传入的props（推荐）
- attrs中设置
- 接收外部的变量（推荐）

AppWrapper组件通过**props**拿到js的状态；

然后在**模板字符串**中可以通过一个**函数**，去拿到props中的js的状态；

如果直接通过props去取是取不到的（直接取会去当前作用域找props）；

```jsx
constructor() {
  super()

  this.state = {
    size: 30,
    color: 'yellow'
  }
}
render () {
  const { size, color } = this.state
  return (
    <AppWrapper size={size} color={color}>
      <div className='section'>
        <h2 className='title'>我是标题</h2>
        <p className='content'>我是内容</p>
      </div>
    </AppWrapper>
  )
}
```

样式

```js
import styled from 'styled-components'

export const AppWrapper = styled.div`
  .section {
    border: 1px solid red;
    .title {
      font-size: ${props => props.size}px;
      color: ${props => props.color};
    }
    .content {
      font-size: 20px;
      color: green;
    }
  }
`
```

##### 共享状态

比如一些**主题样式**就需要全局共享；

找到**根元素**，使用styled-components中的**ThemeProvider**包裹根元素，通过**theme属性**传递共享的内容，类似于context中共享状态；

这样，每个**样式组件**（上述AppWrapper就是一个样式组件）都可以通过**props**获取到共享的内容，获取方式与上述过程类似（通过函数）；

根元素

```jsx
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from 'styled-components'

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(
  <ThemeProvider theme={{ color: 'red' }}>
    <App/>
  </ThemeProvider>
)
```

##### 样式继承

当需要继承某些样式时

```js
const SFButton = styled.button`
  border: 1px solid red;
  border-radius: 5px;
`

export const SYButtonWrapper = styled(SFButton)`
  background-color: #fff;
`
```

这样，SYButtonWrapper组件就**继承**了SFButton中的border和borde-radius相关的样式，就不用再写一遍了；

## 动态添加class

在Vue中添加class很简单，你可以

- 传入一个对象
- 传入一个数组
- 甚至是对象数组混合使用

而在React中添加class，可以通过一下**逻辑判断**来添加某些class（适合添加简单的class）；

但要是class复杂起来，这添加起来变得复杂；

这是就可以使用一个叫**classnames**的库了；

### classnames

安装

```
npm install classnames 
```

```jsx
constructor() {
  super()

  this.state = {
    isbbb: true
  }
}
render () {
  const { isbbb } = this.state
  return (
    <div>
      App
      <h2 className={classNames('aaa', { bbb: isbbb })}>hhh</h2>
    </div>
  )
}
```

当isbbb为true时就加上bbb这个类啦；

# hooks

**为什么需要hooks？**

- React16.8新增特性，它可以让我们在不编写class的情况下使用**state**以及其它的**React特性**（比如生命周期）
- 函数式组件有两个缺陷：
  - 1）不能保存状态；
  - 2）修改状态不会重新渲染，就算能重新执行，状态也会被初始化；

- 类组件随着业务的增多，比如componentDidMount可能包含大量的逻辑代码，包括网络请求、一些事件的监听（还需要在componentWillUNmount中移除），导致逻辑难以拆分；

## 使用场景

- hook基本可以代替所有使用**class组件**的地方；
- 若是一个旧的项目，并不需要直接将所有的代码重构为hooks，因为它完全**向下兼容**，可以**渐进式**的来使用它；
- hook只能在**函数组件**中使用；

只能在**函数式组件**中使用，并且置于**顶层**（最外层）

但是也可以在**自定义的hook函数**（命名以use开头）中使用

## useState

### 参数

初始化值，不设置为undefined，只会首次渲染时使用

### 返回值

**数组**，包含两个元素：

- 元素一：当前状态值；
- 元素二：设置状态值的函数；

调用元素二后，会根据新的状态**重新渲染**当前组件

一般来说，在函数执行完之后内存就会被回收，而state中的变量会被react所保留

### 计数器案例

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

## useEffect

useState可以在函数式组件中定义状态以及修改状态，**那生命周期呢？**

**Effect Hook**可以完成一些类似**类组件中生命周期**的功能；

事实上，类似于**网络请求**、**手动更新DOM**、一些**事件的监听**，都是React更新DOM的一些副作用（side Effects）

对于完成这些功能的hook被称之为**Effect Hook**

### 参数

#### 参数一

传入一个**回调函数**，当组件渲染完成会自动执行，可以将组件的一些**副作用**放到该函数内；

默认情况下，无论是首次渲染还是组件重新渲染完成，都会执行该回调函数

该函数的返回值是个回调函数，会在组件**重新渲染或组件卸载**的时候执行

#### 参数二

该useEffect在哪些**state**发生变化时，才重新执行（受谁影响）；

如果传入一个空的数组，表示不受谁的影响，第一个参数只执行一次；

也就是说，可以决定哪些副作用重新执行；

这个参数使得useEffect比生命周期好用很多；

### 修改标题案例

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

### 清除副作用

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

### 多个useEffect

在一个函数式组件中可以有**多个useEffect**，防止一个useEffect处理多个副作用，不同副作用应该分开，逻辑分离，方便后续抽离成自定义hook，就可以复用啦；

### 性能优化

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

## 特殊场景的hook

### useContext

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

### useReducer

useReducer仅仅是useState的一种替代方案；

某些场景下，若**state的处理逻辑**比较复杂，我们可以通过useReducer来对其进行**拆分**；

或这次修改的state需要**依赖之前的state**时，也可以使用；

#### 参数

- 1）reducer函数
- 2）state初始化值

#### 返回值

**数组**

- 第一个元素是state；
- 第二个元素是dispatch；

### useImperativeHandle

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

#### 参数

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

### useLayoutEffect

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

### useSelector

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

#### 性能优化

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



### useDispatch

直接获取dispatch

```js
const dispatch = useDispatch()
```

### useId

#### SPA的缺陷

- 首屏渲染速度
- 不利于SEO优化

#### 服务器端渲染

**SSR**（Server Side Rendering，服务器端渲染），指的是页面在**服务器端**已经渲染好了；

CSR（Client Side Rendering，客户端渲染），比如SPA页面，需要浏览器执行js，创建完整的页面结构；

#### SSR同构应用

一套代码既可以在服务器端运行，又可以在客户端运行，就叫同构应用

前端代码代码在**服务器端**运行只是html，不具备交互性；还需在客户端（浏览器）加载页面，这个过程叫**hydration**；

**而useId的作用是：生成横跨服务器端和客户端的唯一稳定的id，同时避免hydration不匹配**

### useTransition

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

### useDeferredValue

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



## 性能优化的hook

### useCallback

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

#### 参数

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



#### 应用场景

- 当**子组件**需要传入一个**函数**当props时，最好使用useCallback进行优化

通常使用useCallback的目的是**不希望子组件进行多次渲染**，并不是为了函数进行缓存；

### useRef

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

#### 返回同一个对象

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

#### 获取DOM

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



### useMemo

#### 参数

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



## 自定义hook

hook的思想就是抽取重复的逻辑，开发中遇到重复使用的逻辑，是可以抽取出来，自定义成hook的；

**这不就之前的高阶组件（针对类组件）的作用吗？**

而hook复用逻辑是针对函数式组件

### 打印生命周期

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

### localStorage与useState结合

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

# 路由

React Router6.x发生了较大的变化，目前它已经非常稳定，可以放心使用；

## 基本使用

### 安装

- 安装时，选择**react-router-dom**；
- **react-router**会包含一些**react-native**的内容，web开发不需要；

```
npm install react-router-dom;
```

react-router最主要的**API**是给我们提供一些组件：

**BrowserRouter或HashRouter**

- Router中包含了对路径改变的监听，并且会将相应的路径传递给子组件；
- BrowserRouter使用history模式；
- HashRouter使用Hash模式；

### 包裹组件

```jsx
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(
    <HashRouter>
      <App/>
    </HashRouter>
)
```

### 路由映射配置

**Route**s：包裹所有的Route，在其中匹配一个路由

**Router5.x**使用的是**Switch组件**

Route组件用于路径匹配，有三个属性：

- **path：路径**
- **element：组件（Router5.x是component）**
- exact：精准匹配，只有路径完全一致，才会渲染（Router6.x不仔支持）

```jsx
return (
  <div>
    <h2>App</h2>
    {/* 映射关系 */}
    <Routes>
      <Route path='/about' element={<About />}></Route>
    </Routes>
  </div>
)
```

### 切换路由

**Link和NavLink**

- 通常路径的跳转是使用Link组件，最终会被渲染成**a元素**；
- NavLink是在Link基础之上增加了一下**样式属性**；
- **to属性**，Link中最重要的属性，设置跳转路径；

```jsx
return (
  <div>
    <h2>App</h2>
    <Link to='/about'>关于</Link>
    <Link to='/home'>首页</Link>
    {/* 映射关系 */}
    <Routes>
      <Route path='/about' element={<About />}></Route>
      <Route path='/home' element={<Home />}></Route>
    </Routes>
  </div>
)
```

### **not found**页面

在映射关系里面，当所有路径都匹配不到时，使用**通配符**，然后渲染出**notfound**页面；

```jsx
<Routes>
   <Route path='/login' element={<Login />}></Route>
   <Route path='/home' element={<Home />}></Route>
   <Route path='*' element={<NotFound />}></Route>
 </Routes>
```



## 路由重定向

**Navigate**用于**路由重定向**，当这个组件出现时，就会执行跳转到对应的**to**的路径中；

### **案例**

用户跳转到Profile界面；

但Profile界面有一个isLogin用于记录用户是否登陆；

- true：那么显示用户的名称；
- false：直接重定向到登陆界面；

**App**

```jsx
<Routes>
  <Route path='/login' element={<Login />}></Route>
  <Route path='/home' element={<Home />}></Route>
</Routes>
```

**Login**

```jsx
constructor() {
  super()

  this.state = {
    isLogin: false
  }
}
login () {
  this.setState({ isLogin: true })
}
render () {
  const { isLogin } = this.state
  return (
    <div>
      <h2>Login</h2>

      {!isLogin ? <button onClick={e => this.login()}>登陆</button> : <Navigate to='/home'/>}
    </div>
  )
}
```

### 常见应用场景

- **首次进入**网页重定向

**首次进入网页重定向**

```jsx
<Routes>
  <Route path='/login' element={<Navigate to='/home'/>}></Route>
  <Route path='/home' element={<Home />}></Route>
</Routes>
```

## 路由嵌套

早期是在**组件内配置嵌套路由**的，这就导致路由的映射**太分散**，router6.x之后就方便许多；

**App**

```jsx
<Routes>
  <Route path='/home' element={<Home />}>
    <Route path='/home/list' element={<List />}></Route>
  </Route>
</Routes>
```

**Home**

```jsx
return (
  <div>
    <h2>Home</h2>
    <Link to='/home/list'>列表</Link>
  </div>
)
```

此时还需要类似router-view的**占位符**，用于标记匹配到子路由之后，组件渲染的**位置**；

叫**OutLet**

```jsx
return (
  <div>
    <h2>Home</h2>
    <Link to='/home/list'>列表</Link>
    <Outlet />
  </div>

)
```

### 手动路由跳转

如果使用**Lnik组件**跳转，那渲染出来的将是**a元素**；

**如果想渲染其它元素呢？**比如按钮

react-router-dom提供了一个hook函数，**useNavigate**，可以手动实现路由跳转；

不过，**hook函数**只能在**函数式组件**中使用，并且**置于顶层**；

不过，可以使用**高阶组件**，对一个类组件进行**增强**，让其可以使用hook函数；

```jsx
export function App (props) {
  const navigate = useNavigate()

  function navigateTo (path) {
    navigate(path)
  }

  return (
    <div>
      <h2>App</h2>
      <button onClick={e => navigateTo('/home')}>首页</button>
      {/* 映射关系 */}
      <Routes>
        <Route path='/home' element={<Home />}></Route>
      </Routes>
    </div>
  )
}
```

### 封装withRouter

如果类组件希望使用hook函数，需要对其增强；

封装一个让类组件可以使用hook函数的**高阶组件**；

```jsx
function withRouter (WrapperComponent) {
  return function (props) {
    const navigate = useNavigate()
    const router = { navigate }
    return <WrapperComponent {...props} router={router} />
  }
}
```

**Home**

```jsx
export class Home extends PureComponent {
  navigateTo (path) {
    const { navigate } = this.props.router
    navigate(path)
  }
  render () {
    return (
      <div>
        <h2>Home</h2>
        <button onClick={e => this.navigateTo('/home/list')}>列表</button>
        <Outlet />
      </div>

    )
  }
}

export default withRouter(Home)
```

## 路由传参

react-router-dom提供了一个hook函数，**useParams**，可以获取跳转参数；

- 方式一，**动态路由**，在映射关系那拼接上  `:name`；
- 方式二，**查询字符串**

### 动态路由

**映射关系**

**App**

```jsx
<Routes>
  <Route path='/home' element={<Home />}>
    <Route path='/home/list/:id' element={<List />}></Route>
  </Route>
</Routes>
```



**携带参数跳转**

**Home**

```jsx
export class Home extends PureComponent {
  navigateTo (id) {
    const { navigate } = this.props.router
    navigate('/home/list/' + id)
  }
  render () {
    return (
      <div>
        <h2>Home</h2>
        <button onClick={e => this.navigateTo(123)}>列表</button>
        <Outlet />
      </div>
    )
  }
}

export default withRouter(Home)
```

**获取传递参数**

为了类组件能使用hook函数，给**高阶组件**withRouter添加功能；

```jsx
function withRouter (WrapperComponent) {
  return function (props) {
    const navigate = useNavigate()
    const params = useParams()
    const router = { navigate, params }
    return <WrapperComponent {...props} router={router} />
  }
}
```

获取跳转时传递过来的参数

**List**

```jsx
export class List extends PureComponent {
  render () {
    const { params } = this.props.router
    return (
      <div>List:{params.id}</div>
    )
  }
}

export default withRouter(List)
```

### 查询字符串

**映射关系**

```jsx
<Routes>
  <Route path='/home' element={<Home />}>
    <Route path='/home/list/:id' element={<List />}></Route>
  </Route>
</Routes>
```



**携带参数跳转**

**Home**

```jsx
render () {
  return (
    <div>
      <h2>Home</h2>
      <Link to='/home/list?name=zsf&age=18'>列表</Link>
      <Outlet />
    </div>
  )
}
```

**获取传递参数**

通过查询字符串获取参数，有两种方式：

- react-router-dom提供了一个hook函数，**useLocation**，可以通过它返回对象中**search属性**拿到，不过还要进行处理（比如拿到的是  `?name=zsf&age=18`）；
- react-router-dom还提供了一个hook函数，**useSearchParams**，而它返回一个数组，我们只需要首个位置的内容（后续再说第二个位置），该内容是个对象，可以通过它的**get(key)**获取它的属性（比如get('name')）

为了类组件能使用hook函数，给**高阶组件**withRouter添加功能；

同时，为了方便获取查询字符串中的内容，需要将useSearchParams返回内容首个位置的那个对象，**转化为普通对象**（不然只能通过该对象的get方法获取，由于不确定传参时的属性命名，所以通过get去获取不行）

```jsx
function withRouter (WrapperComponent) {
  return function (props) {
    // 编程式导航
    const navigate = useNavigate()
    // 动态路由参数：/detail/:id
    const params = useParams()
    // 查询字符串参数：/user?name=zsf&age=18
    const [searchParams] = useSearchParams()
    // 转化为普通对象
    const query = Object.fromEntries(searchParams)
    const router = { navigate, params, query }
    return <WrapperComponent {...props} router={router} />
  }
}
```

**List**

```jsx
export class List extends PureComponent {
  render () {
    const { query } = this.props.router
    return (
      <div>List:{query.name}-{query.age}</div>
    )
  }
}

export default withRouter(List)
```

## 配置文件

Vue的路由与组件映射关系是以对象的形式放到一个数组中；

而React的路由与组件映射关系是一个Routes组件包裹一些Route组件；

React如果将**路由与组件的映射关系**都放App组件的话就不太合适了；

我们也可以将这些映射关系**写成配置**:

- 在Router5.x，需要安装react-router-config库；
- 而Router6.x，直接写成配置



React提供了一个API，**useRoutes**，可以根据配置信息，生成原来的映射关系

原来的映射关系

```jsx
{/* 映射关系 */}
<Routes>
  <Route path='/home' element={<Home />}>
    <Route path='/home/list' element={<List />}></Route>
  </Route>
</Routes>
```

新建一个文件夹router，在里面再新建**index.js**

```js
import { Navigate } from 'react-router-dom'
import Home from '../Home'
import List from '../List'

const routes = [
  {
    path: '/',
    element: <Navigate to='/home'/>
  },
  {
    path: '/home',
    element: <Home/>,
    children: [
      {
        path: '/home/list',
        element: <List/>
      }
    ]
  },
]

export default routes
```

**App**

```jsx
return (
  <div>
    <h2>App</h2>
    {/* 映射关系 */}
    {useRoutes(routes)}
  </div>
)
```

### 懒加载

如果想分包，可以用懒加载；

Reac提供了lazy方法，传入一个函数，返回一个promise；

```js
import { Navigate } from 'react-router-dom'
import React from 'react'

const Home = React.lazy(() => import('../Home'))
const List = React.lazy(() => import('../List'))

const routes = [
  {
    path: '/',
    element: <Navigate to='/home'/>
  },
  {
    path: '/home',
    element: <Home/>,
    children: [
      {
        path: '/home/list',
        element: <List/>
      }
    ]
  },
]

export default routes
```

分包之后，本地服务器需要**分别下载这些包**才能正常显示页面，为了防止这些包尚未完全下载导致报错；

需要使用React提供的**Suspense组件**包裹**根组件**，并传**fallback**一个组件提示用户；

**根组件**

```jsx
<Suspense fallback={<h3>Loading...</h3>}>
  <App/>
</Suspense>
```



# 状态管理

redux和React没有直接关系，完全可以在React、Angular或其它地方单独使用Redux;

但React和Redux结合的更好，通过state去描述界面状态；

## 三大原则

### 单一数据源

- 整个应用程序的state被存储在一棵**object tree**中，并且object tree只存储在**一个store**中；
- Redux并没有强制不能创建多个store，但那样**不利于数据维护**；
- **单一数据源**可以让整个应用程序的state变得方便维护、追踪、修改；

### state是只读的

- 唯一修改state的方法一定是**派发（dispatch）action**，不可直接修改state；

- 这样就确保了视图或网络请求都不能直接修改state，他们**只能通过action来描述自己想要如何修改state**；

- 这样可以**保证所有的修改都被集中化处理**，并按照**严格的顺序**来执行，无需担心**race condition（竞态）**的问题；

  

### 使用纯函数来执行修改

- 通过reducer将**旧的state和action**联系到一起，并返回一个**新的state**；
- 随着应用程序的**复杂度增加**，我们可以将reducer**拆分成多个小的reducer**，分别操作不同的state tree的一部分；
- 但所有的reducer都应该是**纯函数**，不能产生任何副作用；

## 核心

### store

### action

需要通过action来更新数据：

- 所有的状态变化，必须通过派发（**dispatch**）action来更新；
- action是一个普通的js对象，用来描述此次更新的**type**和**content**；

### reducer

**如何将state和action联系在一起呢？**

reducer是个**纯函数**；

reducer做的事情是**将旧的state和action结合起来生成一个新的state**；

## 基本使用

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

### 修改state

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

### 订阅state

上述获取state要手动，想要自动获取最新state的话，需要**订阅**；

**store.subscribe()**传入一个回调**函数**，当state**发生变化**时会回调该函数；

```js
store.subscribe(() => {
  console.log(store.getState())
})
```

**取消订阅**

store.subscribe()返回值是个函数，调用即可取消订阅；

### 动态生成action

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

### constants.js

对于**两处地方**要使用**一样的字符串**，应该写成**常量**，放constants.js中；

### 代码组织原则

将派发的**action生成过程**放到一个actionCreators函数中，并将这些函数放到**actionCreators.js**文件中；

**actionCreators**和**reducer**函数中使用的**字符串常量**是一致的，将常量抽取到**constants.js**文件中；

将**reducer**和默认值(initialState)放到**reducer.js**文件中，而不是在index.js;

## 项目中使用

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

### connect内部原理

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

### 修改状态

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

### 分模块

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

#### 



## ReduxToolKit

简称**RTK**

官方推荐使用ReduxToolKit工具包来进行Redux相关管理，编写代码会方便许多（创建store方便，使用起来差不多）；

**安装**

```
npm install @redux/toolkit react-redux
```

由于这工具包也是针对react-redux进行了封装，所以两个都需要安装；

### 核心API

- configureStore
- createSlice
- createAsyncThunk

**configureStore**：封装**createStore**以提供**简化的配置**选项和**良好的默认值**。它可以自动组合你的slice reducer，添加任何的**Redux中间件**，**redux-thunk**默认包含，并启用**Redux DevTools Extension**；

**createSlice**：接受**reducer函数**的对象，切片名称和初识状态值，并自动生成切片reducer，并带有相应的actions；

**createAsyncThunk**：接受一个**动作类型字符串**和一个**返回承诺的函数**，并生成一个pending/fullfilled/rejected基于该承诺分派动作类型的**thunk**；

### 基本使用

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

### 异步操作

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

## 中间件

> 组件中的异步操作

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

### redux-thunk

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



**两个工具**

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

### redux-saga

 :question: 为何选择redux-saga

1. **处理异步逻辑**：redux-saga 使用 ES6 的 Generator 功能，使得异步流程易于读取、编写和测试。这使得异步代码看起来像标准的同步 JavaScript 代码。
2. **管理副作用**：redux-saga 的目标是使应用程序的副作用（如数据获取和访问浏览器缓存等异步操作）更易于管理，执行效率更高，并且在处理失败时更优秀。
3. **集成 Redux**：redux-saga 是一个 Redux 中间件，这意味着可以使用普通的 Redux 动作从主应用程序启动、暂停和取消这个线程。它可以访问完整的 Redux 应用程序状态，并且可以分派 Redux 动作。
4. **避免回调地狱**：与 redux-thunk 相比，redux-saga 不会导致回调地狱，你可以轻松地测试你的异步流程，而且你的动作保持纯净。
5. **易于测试**：由于 redux-saga 使用了 Generator，你可以在不执行实际副作用的情况下进行测试，这使得异步流程的测试变得非常简单。

#### effect



#### quick start

### 原理

#### 打印日志

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

#### 实现thunk核心代码

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

#### 实现applyMiddleware核心代码

```js
function applyMiddleware(store, ...fns) {
  fns.forEach(fn => {
    fn(store)
  })
}
```



## 实现connect

实现关键点：

- 两个**参数**为函数
- 返回一个**高阶组件**
- 获取到store的state作为属性传进需要共享该state的组件
- dispatch同理
- 当state中被共享的数据发生更新时，组件的render重新执行，需要监听订阅的state是否发生改变
- 取消state的订阅
- 降低对store的耦合度

### 参数

首先，它接收**两个函数作为参数**

```js
function connect(mapStateToProps, mapDispatchToProps) {
  
}
```

### 返回值

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

### 状态更新

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

### 取消订阅

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

### 解耦

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



## 数据不可变性

无论是类组件的state还是redux中管理的state，都强调**数据的不可变性**；

整个js编码中，数据的不可变性非常重要；

所以前面进常进行浅拷贝来完成某些操作，但浅拷贝事实上也是存在问题的；

- 比如过大的对象，浅拷贝也会造成性能的浪费；
- 浅拷贝后的对象，在深层改变时，依然会对之前的对象产生影响；

**redux toolkit使用了immerjs这个库保证了数据的不可变性**

为了节省内存，当数据被修改时，会返回一个对象，但新的对象会**尽可能利用之前的数据结构**而不会对内存造成浪费；

## 状态管理选择

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

# 脚手架

三大主流框架都有对应的脚手架

- vue---@vue/cli
- angular---@angular/cli
- react---react-create-app(CRA)

## react-create-app

### 创建项目

```
create-react-app 项目名称
```

**项目名称**不能包含**大写字母**

### 项目结构

#### manifest.json

配置该网页应用部分功能在**移动端桌面**的显示效果

#### robots.txt

**爬虫**相关，可以配置网站那些内容可以被爬虫

#### PWA

(Progressive Web App),渐进式web应用

一个PWA应用首先是**一个网页**，可以通过**web技术**编写出网页应用；

随后添加上**App manifest**和**service worker**来实现PWA的**安装和离线**等功能；

假设开发出来的网站是一个PWA，在**Android**移动端的**Chrome**浏览器跑起来，**左/右上角**会有三个点，点击会出现一个**菜单**，里面包含一个功能，可以将这个网站变成**桌面图标**；

而**service worker**负责**离线缓存**，当丢失网络时，某些功能离线也可以使用~；

并且也可以实现**消息推送**；

通过第三方包**react-scripts**可以查看**webpack**配置；

# 过渡动画

过渡动画增加用户体验；

可以通过**原生css**实现；

不过React社区也提供了**react-transition-group**用来完成过渡动画；

## react-transition-group

主要是 **入场** 和 **离场** 动画

安装

```
npm install react-transition-group
```

### 四个组件

- Transition（不一定要结合css）
- CSSTransition（结合css）
- SwitchTransition（两个组件显示和隐藏**切换**时使用）
- TransitionGroup（将**多个动画**组件包裹其中，一般用于**列表**中的动画）

#### CSSTransition

CSSTransition是基于Transition组件构建的；

CSSTransition执行过程中有**三个状态**：appear（第一次加载）、enter、exit；

**in**传Boolean值，**必传timeout**，单位毫秒，动画持续时间，**必传unmountOnExit**，结束动画时是否卸载，布尔值；

如果想要**第一次加载**时也希望有动画，可以给CSSTransition组件加appear属性，布尔值；

##### 执行过程

1. 当in为true时，触发进入状态；
2. 会添加**-enter**、**-enter-active**的class开始执行动画；
3. 当动画执行结束后，会**移除**前面两个class，并添加**-enter-done**的calss；

反之同理

**App**

```jsx
constructor() {
  super()
  this.state = {
    isShow: true
  }
}
render () {
  const { isShow } = this.state
  return (
    <Fragment>
      <button onClick={e => this.setState({ isShow: !isShow })}>切换</button>
      <CSSTransition in={isShow} unmountOnExit={true} classNames="zsf" timeout={2000}>
        <h2>哈哈哈</h2>
      </CSSTransition>
    </Fragment >
  )
}
```

**对应样式**

```
/* 入场动画 */
.zsf-enter {
 opacity: 0;
}

.zsf-enter-active {
  opacity: 1;
  transition: opacity 2s ease;
}
/* 离场动画 */
.zsf-exit {
  opacity: 1;
 }
 
 .zsf-exit-active {
   opacity: 0;
   transition: opacity 2s ease;
 }
```

##### 钩子函数

主要为了检测动画执行过程，来完成一些js操作

- onEnter：在进入动画之前被触发
- onEntering： 在应用进入动画时被触发
- onEntered：在应用进入动画结束后被触发

#### SwitchTransition

比如有一个按钮需要在on和off之间切换，希望on先从左侧退出，off再从右侧进入；

这种动画在vue中被称为vue transition modes；

属性mode有个值：

- in-out  新组件先进入，旧组件再移除
- out-in  组件先移除，新组件再进入

里面要有CSSTransition或者Transition组件，不能直接包裹你想要切换的组件；

不像CSSTransition或者Transition接收in属性来判断元素是何种状态，取而代之的是**key**属性；

**App**

```jsx
constructor() {
  super()
  this.state = {
    isLogin: true
  }
}
render () {
  const { isLogin } = this.state
  return (
    <Fragment>
      <SwitchTransition mode='out-in'>
        <CSSTransition key={isLogin ? 'exit' : 'login'} classNames='zsf' timeout={1000}>
          <button onClick={e => this.setState({ isLogin: !isLogin })}>{isLogin ? '注销' : '登陆'}</button>
        </CSSTransition>
      </SwitchTransition>

    </Fragment >
  )
}
```

**样式**

```css
/* 入场动画 */
.zsf-enter {
 transform: translateX(100px);
}

.zsf-enter-active {
  transform: translateX(0);
  transition: transform 1s ease;
}
/* 离场动画 */
.zsf-exit {
  transform: translateX(0);
 }
 
 .zsf-exit-active {
  transform: translateX(-100px);
   transition: transform 1s ease;
 }
```

#### TransitionGroup

当有一组动画时，需要将这些**CSSTransition**放入到一个TransitionGroup中来完成动画；

TransitionGroup默认渲染成**div**，可以使用**component属性**指定其它元素（传**字符串**）；

并且CSSTransition设置**key属性**要保持唯一，否则会发生错乱；

**App**

```jsx
constructor() {
  super()
  this.state = {
    books: [
      { id: 111, name: '你不知道的js', price: 99 },
      { id: 112, name: 'js高级程序设计', price: 89 },
      { id: 113, name: 'Vue程序设计', price: 77 },
    ]
  }
}
addBook () {
  const books = [...this.state.books]
  books.push({ id: 114, name: 'React程序设计', price: 87 })
  this.setState({ books: books })
}
removeBook (index) {
  const books = [...this.state.books]
  books.splice(index, 1)
  this.setState({ books: books })
}
render () {
  const { books } = this.state
  return (
    <Fragment>
      <h2>书籍列表</h2>
      <TransitionGroup component='ul'>
        {
          books.map((item, index) => {
            return (
              <CSSTransition key={item.id} classNames='zsf' timeout={1000}>
                <li key={item.name}>
                  <span>{item.name}-{item.price}</span>
                  <button onClick={e => this.removeBook(index)}>删除</button>
                </li>
              </CSSTransition>
            )
          })
        }
      </TransitionGroup>
      <button onClick={e => this.addBook()}>添加新书</button>
    </Fragment >
  )
}
```

**样式**

```css
/* 入场动画 */
.zsf-enter {
 transform: translateX(150px);
}

.zsf-enter-active {
  transform: translateX(0);
  transition: transform 1s ease;
}
/* 离场动画 */
.zsf-exit {
  transform: translateX(0);
 }
 
 .zsf-exit-active {
  transform: translateX(150px);
   transition: transform 1s ease;
 }
```





# 爱彼迎项目

## 创建

命名为airbnb

```
create-react-app airbnb
```

### 项目配置

- icon
- 标题
- jsconfig.json(vscode智能提示)

**jsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "baseUrl": "./",
    "moduleResolution": "node",
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "jsx": "preserve",
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  }
}

```

删除不必要的文件，只保留App.js和index.js

### 重置App.js和index.js

**App.js**

```jsx
import React, { memo } from 'react'

const App = memo(() => {
  return (
    <div>App</div>
  )
})

export default App
```

**index.js**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```



### craco配置别名

安装

```
npm install @craco/craco@alpha -D 
```

新建**craco.config.js**

```js
const path = require('path');

const resolve = dir => path.resolve(__dirname, dir);

module.exports = {
  webpack: {
    alias: {
      '@': resolve("src"),
      'components': resolve("src/components"),
      'utils': resolve('src/utils'),
    }
  }
}
```

### craco配置less文件

安装

```
npm install craco-less@2.1.0-alpha.0
```

**craco.config.js**

```js
const path = require('path');
const CracoLessPlugin = require('craco-less');

const resolve = dir => path.resolve(__dirname, dir);

module.exports = {
  // less
  plugins: [
    {
      plugin: CracoLessPlugin
    },
  ],
  // webpack
  webpack: {
    alias: {
      '@': resolve('src'),
      'components': resolve('src/components'),
      'utils': resolve('src/utils')
    }
  }
}
```

### css样式重置

对默认css样式重置：

- normalize.css
- reset.css

安装

```
npm install normalize.css
```

**index.js**

```js
import 'normalize.css'
import '@/assets/css/reset.css'
```

**reset.css**

```less
@import "./variables.less";

body, button, dd, dl, dt, form, h1, h2, h3, h4, h5, h6, hr, input, li, ol, p, pre, td, textarea, th, ul {
  padding: 0;
  margin: 0;
}

a {
  color: @textColor;
  text-decoration: none;
}

img {
  vertical-align: top;
}

ul, li {
  list-style: none;
}
```

**variables.less**

```less
@textColor: #484848;
@textColorSecondary: #222;
```

## 项目初识化配置

### 配置router

安装

```
npm install react-router-dom
```

**路由配置**

```js
import React from 'react'
import { Navigate } from 'react-router-dom'

const Home = React.lazy(() => import('@/views/home'))
const Entire = React.lazy(() => import('@/views/entire'))
const Detail = React.lazy(() => import('@/views/detail'))

const routes = [
  {
    path: '/',
    element: <Navigate to='/home'/>
  },
  {
    path: '/home',
    element: <Home/>
  },
  {
    path: '/entire',
    element: <Entire/>
  },
  {
    path: '/detail',
    element: <Detail/>
  }
]

export default routes
```

**index.js**

```jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from './App'
import 'normalize.css'
import '@/assets/css/reset.css'


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Suspense fallback='loading'>
      <HashRouter>
        <App />
      </HashRouter>
    </Suspense>
  </React.StrictMode>
)
```

**App.jsx**

```jsx
import React, { memo } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from './router'

const App = memo(() => {
  return (
    <div className='app'>
      <div className='header'>header</div>
      <div className='page'>
        {
          useRoutes(routes)
        }
      </div>
      <div className='footer'>footer</div>
    </div>
  )
})

export default App
```

### 配置redux

安装

```
npm install @reduxjs/toolkit react-redux
```

store下的**index.js**

```js
import { configureStore } from '@reduxjs/toolkit'
import homeReducer from './modules/home'
import entireReducer from './modules/entire'

const store = configureStore({
  reducer: {
    home: homeReducer,
    entire: entireReducer
  }
})

export default store
```

**home模块的reducer**

```js
import { createSlice } from '@reduxjs/toolkit'

const homeSlice = createSlice({
  name: 'home',
  initialState: {

  },
  reducers: {

  }
})

export default homeSlice.reducer
```

**entire模块的reducer**

```js
const initialState = {

}

function reducer(state = initialState, action) {
  switch (action.type) {  
    default:
      return state
  }
}

export default reducer
```

**App.jsx**

```jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'


import App from './App'
import store from './store'
import 'normalize.css'
import '@/assets/css/reset.css'



const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Suspense fallback='loading'>
      <Provider store={store}>
        <HashRouter>
        <App />
      </HashRouter>
      </Provider>
    </Suspense>
  </React.StrictMode>
)
```

### 封装axios

安装

```
npm install axios
```

services下的request下的**index.js**

```js
import axios from "axios"
import { BASE_URL, TIMEOUT } from './config'

class SFRequest {
  constructor(baseURL, timeout) {
    this.instance = axios.create({
      baseURL,
      timeout
    })

    this.instance.interceptors.response.use((res) => {
      return res.data
    }, err => {
      return err
    })
  }

  request(config) {
    return this.instance.request(config)
  }

  get(config) {
    return this.request({...config, method: 'get'})
  }
  
  post(config) {
    return this.request({...config, method: 'post'})
  }
}

export default new SFRequest(BASE_URL, TIMEOUT)
```

**config.js**

```js
export const BASE_URL = 'xxx'
export const TIMEOUT = 10000
```

## 首页

### 头部内容

#### AppHeader

使用**css in js**技术编写样式

```
npm install styled-components
```

**对应样式**

```js
import styled from 'styled-components'

export const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 80px;
  border-bottom: 1px solid #eee;
`
```

**AppHeader**

```jsx
import React, { memo } from 'react'

import HeaderCenter from './c-cpns/header-center'
import HeaderLeft from './c-cpns/header-left'
import HeaderRight from './c-cpns/header-right'
import { HeaderWrapper } from './style'

const AppHeader = memo(() => {
  return (
    <HeaderWrapper>
      <HeaderLeft />
      <HeaderCenter />
      <HeaderRight />
    </HeaderWrapper>
  )
})

export default AppHeader
```

#### **布局关键**

为了保持**中间部分**居中，中间**内容决定宽度**，左右两边宽度各**占剩余的一半**，也就是**flex：1**；

**右边内容**需要**向右对齐**，也就是**justify-content：flex-end**；

#### HeaderLeft

```jsx
import React, { memo } from 'react'
import { LeftWrapper } from './style'

const HeaderLeft = memo(() => {
  return (
    <LeftWrapper>HeaderLeft</LeftWrapper>
  )
})

export default HeaderLeft
```

**对应样式**

```js
import styled from "styled-components"

export const LeftWrapper = styled.div`
  flex: 1;
`
```



##### 使用svg两种方式

- 保存为**svg文件**，通过**img元素**引入
- 直接使用**svg元素**

直接使用svg元素好处是：当页面加载时，直接渲染svg元素，**无需下载**，且修改样式方便

##### 字符串变对象的工具函数

**styleStrToObject**

```js
function styleStrToObject(styleStr) {
  const obj = {}

  const s = styleStr.toLowerCase().replace(/-(.)/g, function (m, g) {
    return g.toUpperCase()
  }).replace(/;\s?$/g,"").split(/:|;/g)
  
  for (var i = 0; i < s.length; i += 2) {
    obj[s[i].replace(/\s/g,"")] = s[i+1].replace(/^\s+|\s+$/g,"")
  }

  return obj
}

export default styleStrToObject
```

**HeaderLeft**

```jsx
import React, { memo } from 'react'
import { LeftWrapper } from './style'

import IconLogo from '@/assets/svg/icon_logo'

const HeaderLeft = memo(() => {
  return (
    <LeftWrapper>
      <IconLogo />
    </LeftWrapper>
  )
})

export default HeaderLeft
```

**修改颜色**

svg默认用到的颜色就是当前**最近父元素**的颜色，这样颜色就可以随便变了

**对应样式**

```js
import styled from "styled-components"

export const LeftWrapper = styled.div`
  flex: 1;
  color: red;
`
```

**IconLogo**

```jsx
import React, { memo } from 'react'
import styleStrToObject from './utils'

const IconLogo = memo(() => {
  return (
    <svg width="102" height="32" style={styleStrToObject("display:block")}><path d="M29.3864 22.7101C29.2429 22.3073 29.0752 21.9176 28.9157 21.5565C28.6701 21.0011 28.4129 20.4446 28.1641 19.9067L28.1444 19.864C25.9255 15.0589 23.5439 10.1881 21.0659 5.38701L20.9607 5.18316C20.7079 4.69289 20.4466 4.18596 20.1784 3.68786C19.8604 3.0575 19.4745 2.4636 19.0276 1.91668C18.5245 1.31651 17.8956 0.833822 17.1853 0.502654C16.475 0.171486 15.7005 -9.83959e-05 14.9165 4.23317e-08C14.1325 9.84805e-05 13.3581 0.171877 12.6478 0.503224C11.9376 0.834571 11.3088 1.31742 10.8059 1.91771C10.3595 2.46476 9.97383 3.05853 9.65572 3.68858C9.38521 4.19115 9.12145 4.70278 8.8664 5.19757L8.76872 5.38696C6.29061 10.1884 3.90903 15.0592 1.69015 19.8639L1.65782 19.9338C1.41334 20.463 1.16057 21.0102 0.919073 21.5563C0.75949 21.9171 0.592009 22.3065 0.448355 22.7103C0.0369063 23.8104 -0.094204 24.9953 0.0668098 26.1585C0.237562 27.334 0.713008 28.4447 1.44606 29.3804C2.17911 30.3161 3.14434 31.0444 4.24614 31.4932C5.07835 31.8299 5.96818 32.002 6.86616 32C7.14824 31.9999 7.43008 31.9835 7.71027 31.9509C8.846 31.8062 9.94136 31.4366 10.9321 30.8639C12.2317 30.1338 13.5152 29.0638 14.9173 27.5348C16.3194 29.0638 17.6029 30.1338 18.9025 30.8639C19.8932 31.4367 20.9886 31.8062 22.1243 31.9509C22.4045 31.9835 22.6864 31.9999 22.9685 32C23.8664 32.002 24.7561 31.8299 25.5883 31.4932C26.6901 31.0444 27.6554 30.3161 28.3885 29.3804C29.1216 28.4447 29.5971 27.3341 29.7679 26.1585C29.9287 24.9952 29.7976 23.8103 29.3864 22.7101ZM14.9173 24.377C13.1816 22.1769 12.0678 20.1338 11.677 18.421C11.5169 17.7792 11.4791 17.1131 11.5656 16.4573C11.6339 15.9766 11.8105 15.5176 12.0821 15.1148C12.4163 14.6814 12.8458 14.3304 13.3374 14.0889C13.829 13.8475 14.3696 13.7219 14.9175 13.7219C15.4655 13.722 16.006 13.8476 16.4976 14.0892C16.9892 14.3307 17.4186 14.6817 17.7528 15.1151C18.0244 15.5181 18.201 15.9771 18.2693 16.4579C18.3556 17.114 18.3177 17.7803 18.1573 18.4223C17.7661 20.1349 16.6526 22.1774 14.9173 24.377ZM27.7406 25.8689C27.6212 26.6908 27.2887 27.4674 26.7762 28.1216C26.2636 28.7759 25.5887 29.2852 24.8183 29.599C24.0393 29.9111 23.1939 30.0217 22.3607 29.9205C21.4946 29.8089 20.6599 29.5239 19.9069 29.0824C18.7501 28.4325 17.5791 27.4348 16.2614 25.9712C18.3591 23.3846 19.669 21.0005 20.154 18.877C20.3723 17.984 20.4196 17.0579 20.2935 16.1475C20.1791 15.3632 19.8879 14.615 19.4419 13.9593C18.9194 13.2519 18.2378 12.6768 17.452 12.2805C16.6661 11.8842 15.798 11.6777 14.9175 11.6777C14.0371 11.6777 13.1689 11.8841 12.383 12.2803C11.5971 12.6765 10.9155 13.2515 10.393 13.9589C9.94707 14.6144 9.65591 15.3624 9.5414 16.1465C9.41524 17.0566 9.4623 17.9822 9.68011 18.8749C10.1648 20.9993 11.4748 23.384 13.5732 25.9714C12.2555 27.4348 11.0845 28.4325 9.92769 29.0825C9.17468 29.5239 8.34007 29.809 7.47395 29.9205C6.64065 30.0217 5.79525 29.9111 5.0162 29.599C4.24581 29.2852 3.57092 28.7759 3.05838 28.1217C2.54585 27.4674 2.21345 26.6908 2.09411 25.8689C1.97932 25.0334 2.07701 24.1825 2.37818 23.3946C2.49266 23.0728 2.62663 22.757 2.7926 22.3818C3.0274 21.851 3.27657 21.3115 3.51759 20.7898L3.54996 20.7197C5.75643 15.9419 8.12481 11.0982 10.5894 6.32294L10.6875 6.13283C10.9384 5.64601 11.1979 5.14267 11.4597 4.6563C11.7101 4.15501 12.0132 3.68171 12.3639 3.2444C12.6746 2.86903 13.0646 2.56681 13.5059 2.35934C13.9473 2.15186 14.4291 2.04426 14.9169 2.04422C15.4047 2.04418 15.8866 2.15171 16.3279 2.35911C16.7693 2.56651 17.1593 2.86867 17.4701 3.24399C17.821 3.68097 18.1242 4.15411 18.3744 4.65538C18.6338 5.13742 18.891 5.63623 19.1398 6.11858L19.2452 6.32315C21.7097 11.0979 24.078 15.9415 26.2847 20.7201L26.3046 20.7631C26.5498 21.2936 26.8033 21.8419 27.042 22.382C27.2082 22.7577 27.3424 23.0738 27.4566 23.3944C27.7576 24.1824 27.8553 25.0333 27.7406 25.8689Z" fill="currentcolor"></path><path d="M41.6847 24.1196C40.8856 24.1196 40.1505 23.9594 39.4792 23.6391C38.808 23.3188 38.2327 22.8703 37.7212 22.2937C37.2098 21.7172 36.8263 21.0445 36.5386 20.3078C36.2509 19.539 36.123 18.7062 36.123 17.8093C36.123 16.9124 36.2829 16.0475 36.5705 15.2787C36.8582 14.51 37.2737 13.8373 37.7852 13.2287C38.2966 12.6521 38.9039 12.1716 39.6071 11.8513C40.3103 11.531 41.0455 11.3708 41.8765 11.3708C42.6756 11.3708 43.3788 11.531 44.0181 11.8833C44.6574 12.2037 45.1688 12.6841 45.5843 13.2927L45.6802 11.7232H48.6209V23.7992H45.6802L45.5843 22.0375C45.1688 22.6781 44.6254 23.1906 43.9222 23.575C43.2829 23.9274 42.5158 24.1196 41.6847 24.1196ZM42.4519 21.2367C43.0272 21.2367 43.5386 21.0765 44.0181 20.7882C44.4656 20.4679 44.8172 20.0515 45.1049 19.539C45.3606 19.0265 45.4884 18.4179 45.4884 17.7452C45.4884 17.0725 45.3606 16.4639 45.1049 15.9514C44.8492 15.4389 44.4656 15.0225 44.0181 14.7022C43.5706 14.3818 43.0272 14.2537 42.4519 14.2537C41.8765 14.2537 41.3651 14.4139 40.8856 14.7022C40.4382 15.0225 40.0866 15.4389 39.7989 15.9514C39.5432 16.4639 39.4153 17.0725 39.4153 17.7452C39.4153 18.4179 39.5432 19.0265 39.7989 19.539C40.0546 20.0515 40.4382 20.4679 40.8856 20.7882C41.3651 21.0765 41.8765 21.2367 42.4519 21.2367ZM53.6392 8.4559C53.6392 8.80825 53.5753 9.12858 53.4154 9.38483C53.2556 9.64109 53.0319 9.86531 52.7442 10.0255C52.4565 10.1856 52.1369 10.2497 51.8173 10.2497C51.4976 10.2497 51.178 10.1856 50.8903 10.0255C50.6026 9.86531 50.3789 9.64109 50.2191 9.38483C50.0592 9.09654 49.9953 8.80825 49.9953 8.4559C49.9953 8.10355 50.0592 7.78323 50.2191 7.52697C50.3789 7.23868 50.6026 7.04649 50.8903 6.88633C51.178 6.72617 51.4976 6.66211 51.8173 6.66211C52.1369 6.66211 52.4565 6.72617 52.7442 6.88633C53.0319 7.04649 53.2556 7.27072 53.4154 7.52697C53.5433 7.78323 53.6392 8.07152 53.6392 8.4559ZM50.2191 23.7672V11.6911H53.4154V23.7672H50.2191V23.7672ZM61.9498 14.8623V14.8943C61.79 14.8303 61.5982 14.7982 61.4383 14.7662C61.2466 14.7342 61.0867 14.7342 60.895 14.7342C60 14.7342 59.3287 14.9904 58.8812 15.535C58.4018 16.0795 58.178 16.8483 58.178 17.8413V23.7672H54.9817V11.6911H57.9223L58.0182 13.517C58.3379 12.8763 58.7214 12.3958 59.2648 12.0435C59.7762 11.6911 60.3835 11.531 61.0867 11.531C61.3105 11.531 61.5342 11.563 61.726 11.595C61.8219 11.6271 61.8858 11.6271 61.9498 11.6591V14.8623ZM63.2283 23.7672V6.72617H66.4247V13.2287C66.8722 12.6521 67.3836 12.2036 68.0229 11.8513C68.6622 11.531 69.3654 11.3388 70.1645 11.3388C70.9635 11.3388 71.6987 11.4989 72.3699 11.8193C73.0412 12.1396 73.6165 12.588 74.128 13.1646C74.6394 13.7412 75.0229 14.4139 75.3106 15.1506C75.5983 15.9194 75.7261 16.7522 75.7261 17.6491C75.7261 18.546 75.5663 19.4109 75.2787 20.1796C74.991 20.9484 74.5755 21.6211 74.064 22.2297C73.5526 22.8063 72.9453 23.2867 72.2421 23.6071C71.5389 23.9274 70.8037 24.0875 69.9727 24.0875C69.1736 24.0875 68.4704 23.9274 67.8311 23.575C67.1918 23.2547 66.6804 22.7742 66.2649 22.1656L66.169 23.7352L63.2283 23.7672ZM69.3973 21.2367C69.9727 21.2367 70.4841 21.0765 70.9635 20.7882C71.411 20.4679 71.7626 20.0515 72.0503 19.539C72.306 19.0265 72.4339 18.4179 72.4339 17.7452C72.4339 17.0725 72.306 16.4639 72.0503 15.9514C71.7626 15.4389 71.411 15.0225 70.9635 14.7022C70.5161 14.3818 69.9727 14.2537 69.3973 14.2537C68.822 14.2537 68.3106 14.4139 67.8311 14.7022C67.3836 15.0225 67.032 15.4389 66.7443 15.9514C66.4886 16.4639 66.3608 17.0725 66.3608 17.7452C66.3608 18.4179 66.4886 19.0265 66.7443 19.539C67 20.0515 67.3836 20.4679 67.8311 20.7882C68.3106 21.0765 68.822 21.2367 69.3973 21.2367ZM76.9408 23.7672V11.6911H79.8814L79.9773 13.2607C80.3289 12.6841 80.8084 12.2357 81.4157 11.8833C82.023 11.531 82.7262 11.3708 83.5253 11.3708C84.4203 11.3708 85.1874 11.595 85.8267 12.0115C86.4979 12.4279 87.0094 13.0365 87.361 13.8053C87.7126 14.574 87.9043 15.5029 87.9043 16.56V23.7992H84.708V16.9764C84.708 16.1436 84.5162 15.4709 84.1326 14.9904C83.7491 14.51 83.2376 14.2537 82.5664 14.2537C82.0869 14.2537 81.6714 14.3498 81.2878 14.574C80.9362 14.7982 80.6486 15.0865 80.4248 15.503C80.2011 15.8873 80.1052 16.3678 80.1052 16.8483V23.7672H76.9408V23.7672ZM89.5025 23.7672V6.72617H92.6989V13.2287C93.1464 12.6521 93.6578 12.2036 94.2971 11.8513C94.9364 11.531 95.6396 11.3388 96.4387 11.3388C97.2378 11.3388 97.9729 11.4989 98.6442 11.8193C99.3154 12.1396 99.8907 12.588 100.402 13.1646C100.914 13.7412 101.297 14.4139 101.585 15.1506C101.873 15.9194 102 16.7522 102 17.6491C102 18.546 101.841 19.4109 101.553 20.1796C101.265 20.9484 100.85 21.6211 100.338 22.2297C99.8268 22.8063 99.2195 23.2867 98.5163 23.6071C97.8131 23.9274 97.0779 24.0875 96.2469 24.0875C95.4478 24.0875 94.7446 23.9274 94.1053 23.575C93.466 23.2547 92.9546 22.7742 92.5391 22.1656L92.4432 23.7352L89.5025 23.7672ZM95.7035 21.2367C96.2788 21.2367 96.7903 21.0765 97.2697 20.7882C97.7172 20.4679 98.0688 20.0515 98.3565 19.539C98.6122 19.0265 98.7401 18.4179 98.7401 17.7452C98.7401 17.0725 98.6122 16.4639 98.3565 15.9514C98.1008 15.4389 97.7172 15.0225 97.2697 14.7022C96.8222 14.3818 96.2788 14.2537 95.7035 14.2537C95.1281 14.2537 94.6167 14.4139 94.1373 14.7022C93.6898 15.0225 93.3382 15.4389 93.0505 15.9514C92.7628 16.4639 92.6669 17.0725 92.6669 17.7452C92.6669 18.4179 92.7948 19.0265 93.0505 19.539C93.3062 20.0515 93.6898 20.4679 94.1373 20.7882C94.6167 21.0765 95.0962 21.2367 95.7035 21.2367Z" fill="currentcolor"></path></svg>
  )
})

export default IconLogo
```

##### 主题颜色

```js
const theme = {
  color: {
    primaryColor: '#ff385c',
    secondaryColor: '#00848A'
  },
}

export default theme
```

**index.js**

```jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'


import App from './App'
import store from './store'
import 'normalize.css'
import '@/assets/css/reset.less'
import theme from './assets/theme'



const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Suspense fallback='loading'>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <App />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    </Suspense>
  </React.StrictMode>
)
```

**HeaderLeft**

```jsx
import React, { memo } from 'react'
import { LeftWrapper } from './style'

import IconLogo from '@/assets/svg/icon_logo'

const HeaderLeft = memo(() => {
  return (
    <LeftWrapper>
      <div className='logo'>
        <IconLogo />
      </div>
    </LeftWrapper>
  )
})

export default HeaderLeft
```

**对应样式**

```js
import styled from "styled-components"

export const LeftWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  color: ${props => props.theme.color.primaryColor};

  .logo {
    margin-left: 25px;
    cursor: pointer;
  }
`
```



#### HeaderCenter

```jsx
import IconSearchBar from '@/assets/svg/icon_search_bar'
import React, { memo } from 'react'
import { CenterWrapper } from './style'

const HeaderCenter = memo(() => {
  return (
    <CenterWrapper>
      <div className='search-bar'>
        <div className='text'>
          搜索房源和体验
        </div>
        <div className='icon'>
          <IconSearchBar />
        </div>
      </div>
    </CenterWrapper>
  )
})

export default HeaderCenter
```

**对应样式**

```js
import styled from 'styled-components'

export const CenterWrapper = styled.div`
  .search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    height: 48px;
    box-sizing: border-box;
    padding: 0 8px;
    border: 1px solid #ddd;
    border-radius: 24px;
    cursor: pointer;
    
    ${props => props.theme.mixin.boxShadow};

    .text {
      padding: 0 16px;
      color: #222;
      font-weight: 600;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: #fff;
      background-color: ${props => props.theme.color.primaryColor};
    }
  }
`
```

**IconSearchBar**

```jsx
import React, { memo } from 'react'
import styleStrToObj from './utils'

const IconSearchBar = memo(() => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={styleStrToObj("display:block;fill:none;height:12px;width:12px;stroke:currentColor;stroke-width:5.333333333333333;overflow:visible")} aria-hidden="true" role="presentation" focusable="false"><g fill="none"><path d="m13 24c6.0751322 0 11-4.9248678 11-11 0-6.07513225-4.9248678-11-11-11-6.07513225 0-11 4.92486775-11 11 0 6.0751322 4.92486775 11 11 11zm8-3 9 9"></path></g></svg>
  )
})

export default IconSearchBar
```



#### HeaderRight

```jsx
import React, { memo } from 'react'

import { RightWrapper } from './style'
import IconAvatar from '@/assets/svg/icon_avatar'
import IconGlobal from '@/assets/svg/icon_global'
import IconMenu from '@/assets/svg/icon_menu'

const HeaderRight = memo(() => {
  return (
    <RightWrapper>
      <div className='btns'>
        <span className='btn'>登陆</span>
        <span className='btn'>注册</span>
        <span className='btn'>
          <IconGlobal />
        </span>
      </div>

      <div className='profile'>
        <IconMenu />
        <IconAvatar />
      </div>
    </RightWrapper>
  )
})

export default HeaderRight
```

**IconGlobal**

```jsx
import React, { memo } from 'react'
import styleStrToObject from './utils'

const IconGlobal = memo(() => {
  return (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={styleStrToObject("display: block; height: 16px; width: 16px; fill: currentcolor;")}><path d="m8.002.25a7.77 7.77 0 0 1 7.748 7.776 7.75 7.75 0 0 1 -7.521 7.72l-.246.004a7.75 7.75 0 0 1 -7.73-7.513l-.003-.245a7.75 7.75 0 0 1 7.752-7.742zm1.949 8.5h-3.903c.155 2.897 1.176 5.343 1.886 5.493l.068.007c.68-.002 1.72-2.365 1.932-5.23zm4.255 0h-2.752c-.091 1.96-.53 3.783-1.188 5.076a6.257 6.257 0 0 0 3.905-4.829zm-9.661 0h-2.75a6.257 6.257 0 0 0 3.934 5.075c-.615-1.208-1.036-2.875-1.162-4.686l-.022-.39zm1.188-6.576-.115.046a6.257 6.257 0 0 0 -3.823 5.03h2.75c.085-1.83.471-3.54 1.059-4.81zm2.262-.424c-.702.002-1.784 2.512-1.947 5.5h3.904c-.156-2.903-1.178-5.343-1.892-5.494l-.065-.007zm2.28.432.023.05c.643 1.288 1.069 3.084 1.157 5.018h2.748a6.275 6.275 0 0 0 -3.929-5.068z"></path></svg>
  )
})

export default IconGlobal
```

**IconMenu**

```jsx
import React, { memo } from 'react'
import styleStrToObject from './utils'

const IconMenu = memo(() => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={styleStrToObject("display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 3; overflow: visible;")}><g fill="none" fillRule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg>
  )
})

export default IconMenu
```

**IconAvatar**

```jsx
import React, { memo } from 'react'
import styleStrToObject from './utils'

const IconAvatar = memo(() => {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={styleStrToObject("display: block; height: 32px; width: 32px; fill: currentcolor;")}><path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path></svg>
  )
})

export default IconAvatar
```

**对应样式**

```js
import styled from 'styled-components'

export const RightWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  color: ${props => props.theme.text.primaryColor};
  font-size: 14px;
  font-weight: 600;

  .btns {
    display: flex;
    box-sizing: content-box;

    .btn {
      height: 18px;
      line-height: 18px;
      padding: 12px 15px;
      border-radius: 22px;
      cursor: pointer;
      box-sizing: content-box;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }

  .profile {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 77px;
    height: 42px;
    margin-right: 24px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 25px;
    background-color: #fff;
    cursor: pointer;

    color: ${props => props.theme.text.primaryColor};
  }
`
```

**主题样式**

```js
const theme = {
  color: {
    primaryColor: '#ff385c',
    secondaryColor: '#00848A'
  },
  text: {
    primaryColor: "#484848",
    secondaryColor: "#222"
  },
}

export default theme
```

##### 抽取可复用动画

**主体样式**

```js
const theme = {
  color: {
    primaryColor: '#ff385c',
    secondaryColor: '#00848A'
  },
  text: {
    primaryColor: "#484848",
    secondaryColor: "#222"
  },
  mixin: {
    boxShadow: `
      transition: box-shadow 200ms ease;
      &:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,.18);
      }
    `
  }
}

export default theme
```

**HeaderRight对应样式**

```js
.profile {
  ...

  ${props => props.theme.mixin.boxShadow};
  
}
```

##### **信息面板切换**

点击个人信息图标，**面板**显示；

窗口任何点击，**面板**隐藏；

有一个问题：点击个人信息面板后，由于**事件冒泡**，导致窗口的点击事件也触发了，所以**面板**依然关闭；

使用**事件捕获**，**addEventListener**第二个参数为true即可；

**HeaderRight**

```jsx
import React, { memo, useEffect, useState } from 'react'

import { RightWrapper } from './style'
import IconAvatar from '@/assets/svg/icon_avatar'
import IconGlobal from '@/assets/svg/icon_global'
import IconMenu from '@/assets/svg/icon_menu'

const HeaderRight = memo(() => {
  // 状态
  const [showPanel, setShowPanel] = useState(false)

  // 副作用
  useEffect(() => {
    function windowHandle () {
      setShowPanel(false)
    }
    window.addEventListener('click', windowHandle, true)
    // 取消监听
    return () => {
      window.removeEventListener('click', windowHandle, true)
    }
  }, [])

  // 事件监听
  function profileClick () {
    setShowPanel(true)
  }

  return (
    <RightWrapper>
      <div className='btns'>
        <span className='btn'>登陆</span>
        <span className='btn'>注册</span>
        <span className='btn'>
          <IconGlobal />
        </span>
      </div>

      <div className='profile' onClick={profileClick}>
        <IconMenu />
        <IconAvatar />
        {
          showPanel && (
            <div className='panel'>
              <div className='top'>
                <div className='item register'>注册</div>
                <div className='item login'>登陆</div>
              </div>
              <div className='bottom'>
                <div className='item'>出租房源</div>
                <div className='item'>开展体验</div>
                <div className='item'>帮助</div>
              </div>
            </div>
          )
        }
      </div>
    </RightWrapper>
  )
})

export default HeaderRight
```

**对应样式**

```js
.profile {
  ...
  .panel {
      position: absolute;
      top: 54px;
      right: 0;
      width: 240px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 6px rgba(0,0,0,.2);
      color: #666;

      .top, .bottom {
        padding: 10px 0;

        .item {
          height: 40px;
          line-height: 40px;
          padding: 0 16px;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }

      .top {
        border-bottom: 1px solid #ddd;
      }
  } 
}
```

### 中间内容

#### 顶部轮播图片

**Home**

```jsx
import React, { memo } from 'react'

import HomeBanner from './c-cpns/home-banner'
import { HomeWrapper } from './style'

const Home = memo(() => {
  return (
    <HomeWrapper>
      <HomeBanner />
    </HomeWrapper>
  )
})

export default Home
```

**HomeBanner**

```jsx
import React, { memo } from 'react'

import { BannerWrapper } from './style'

const HomeBanner = memo(() => {
  return (
    <BannerWrapper>HomeBanner</BannerWrapper>
  )
})

export default HomeBanner
```

**对应样式**

```js
import styled from 'styled-components'

export const BannerWrapper = styled.div`
  height: 529px;
  background: url(${require("@/assets/img/cover_01.jpeg")}) center/cover;
`
```

#### 高性价比数据

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'

const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'></div>
    </HomeWrapper>
  )
})

export default Home
```

**对应样式**

```js
import styled from 'styled-components'

export const HomeWrapper = styled.div`
  > .content {
    width: 1032px;
    margin: 0 auto;
  }
`
```

**services的home模块**

```js
import sfRequest from ".."

export function getHomeGoodPriceData() {
  return sfRequest.get({
    url: '/home/goodprice'
  })
}
```

**redux的home模块**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getHomeGoodPriceData } from '@/services'

export const fetchHomeDataAction = createAsyncThunk('fetchHomeData', async () => {
  const res = await getHomeGoodPriceData()
  
  return res
})

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    goodPriceInfo: {}
  },
  reducers: {
    changeGoodPriceInfoAction(state, { payload }) {
      state.goodPriceInfo = payload
    }
  },
  extraReducers: {
    [fetchHomeDataAction.fulfilled](state, { payload }) {
      state.goodPriceInfo = payload
    }
  }
})

export const { changeGoodPriceInfoAction } = homeSlice.actions

export default homeSlice.reducer
```

#### 房间item

**RoomItem**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { ItemWrapper } from './style'

const RoomItem = memo((props) => {
  const { itemData } = props
  return (
    <ItemWrapper verifyColor={itemData?.verify_info?.text_color || '#39576a'}>
      <div className='inner'>
        <div className='cover'>
          <img src={itemData.picture_url} alt="" />
        </div>
        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```

**对应样式**

```js
import styled from 'styled-components'

export const ItemWrapper = styled.div`
  box-sizing: border-box;
  width: 25%;
  padding: 8px;
  
  .inner {
    width: 100%;
  }

  .cover {
    position: relative;
    box-sizing: border-box;
    padding: 66.66% 8px 0;
    border-radius: 3px;
    overflow: hidden;

    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }

  .desc {
    margin: 10px 0 5px;
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.verifyColor};
  }

  .name {
    font-size: 16px;
    font-weight: 700;

    overflow: hidden;  
    text-overflow: ellipsis; 
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical;
  }

  .price {
    margin: 8px 0;
  }
`
```

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import SectionHeader from '@/components/section-header'
import RoomItem from '@/components/room-item'

const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <div className='good-price'>
          <SectionHeader title={goodPriceInfo.title} />
          <ul className='room-list'>
            {
              goodPriceInfo.list?.slice(0, 8)?.map((item) => {
                return (
                  <RoomItem itemData={item} key={item.id} />
                )
              })
            }
          </ul>
        </div>
      </div>
    </HomeWrapper>
  )
})

export default Home
```

##### 集成Material UI

**安装**

```
npm install @emotion/react @emotion/styled
```

```
npm install @mui/material @mui/styled-engine-sc styled-components
```

由于之前安装过**styled-components**，所以这样安装即可

```
npm install @mui/material @mui/styled-engine-sc
```

接着就可以使用里面的组件啦

##### 集成AntDesign

**安装**

```
npm install antd
```

在**index.js**引入样式

```
import 'antd/dist/reset.css';
```

同时为了能够使用**less**，需要添加配置如下

**craco.config.js**

```js
...
module.exports = {
  // less
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {  },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  // webpack
  ...
}
```

##### 底部评价

**RoomItem**

```jsx
import { Rating } from '@mui/material'
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { ItemWrapper } from './style'

const RoomItem = memo((props) => {
  const { itemData } = props
  return (
    <ItemWrapper verifyColor={itemData?.verify_info?.text_color || '#39576a'}>
      <div className='inner'>
        <div className='cover'>
          <img src={itemData.picture_url} alt="" />
        </div>
        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
        <div className='bottom'>
          <Rating
            value={itemData.star_rating ?? 5}
            precision={0.5}
            readOnly
            sx={{ fontSize: "12px", color: "#00848A" }}
          />
          <span className='count'>{itemData.reviews_count}</span>
          {
            itemData.bottom_info && (<span className='extra'>·{itemData.bottom_info.content}</span>)
          }
        </div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```

**对应样式**

```js
/*
 * @Description: 待编辑
 * @Author: SiFeng Zhai
 * @Date: 2023-01-03 19:18:39
 * @LastEditors: SiFeng Zhai
 * @LastEditTime: 2023-01-03 21:56:05
 */
import styled from 'styled-components'

export const ItemWrapper = styled.div`
  box-sizing: border-box;
  width: 25%;
  padding: 8px;
  
  .inner {
    width: 100%;
  }

  .cover {
    position: relative;
    box-sizing: border-box;
    padding: 66.66% 8px 0;
    border-radius: 3px;
    overflow: hidden;

    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }

  .desc {
    margin: 10px 0 5px;
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.verifyColor};
  }

  .name {
    font-size: 16px;
    font-weight: 700;

    overflow: hidden;  
    text-overflow: ellipsis; 
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical;
  }

  .price {
    margin: 8px 0;
  }

  .bottom {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.text.primaryColor};

    .count {
      margin: 0 2px 0 4px;
    }

    .MuiRating-icon {
      margin-right: -2px;
    }
  }
`
```

##### 重构一下

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <div className='good-price'>
          <SectionHeader title={goodPriceInfo.title} />
          <SectionRooms roomList={goodPriceInfo.list} />
        </div>
      </div>
    </HomeWrapper>
  )
})

export default Home
```

**SectionRooms**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import RoomItem from '@/components/room-item'
import { RoomsWrapper } from './style'

const SectionRooms = memo((props) => {
  const { roomList = [] } = props
  return (
    <div>
      <RoomsWrapper>
        {
          roomList.slice(0, 8)?.map((item) => {
            return (
              <RoomItem itemData={item} key={item.id} />
            )
          })
        }
      </RoomsWrapper>
    </div>
  )
})

SectionRooms.propTypes = {
  roomList: PropTypes.array
}

export default SectionRooms
```

**对应样式**

```js
import styled from 'styled-components'

export const RoomsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
  cursor: pointer;
`
```



#### 高评分数据

##### 获取

**services的home模块**

```js
import sfRequest from ".."
...

export function getHomeHighScoreData() {
  return sfRequest.get({
    url: '/home/highscore'
  })
}
```

**store的home模块**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getHomeGoodPriceData, getHomeHighScoreData } from '@/services'

export const fetchHomeDataAction = createAsyncThunk('fetchHomeData', (payload, { dispatch }) => {
  getHomeGoodPriceData().then(res => {
    dispatch(changeGoodPriceInfoAction(res))
  })
  getHomeHighScoreData().then(res => {
    dispatch(changeHighScoreInfoAction(res))
  })
})

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    goodPriceInfo: {},
    highScoreInfo: {}
  },
  reducers: {
    changeGoodPriceInfoAction(state, { payload }) {
      state.goodPriceInfo = payload
    },
    changeHighScoreInfoAction(state, { payload }) {
      state.highScoreInfo = payload
    }
  },
  // extraReducers: {
  //   [fetchHomeDataAction.fulfilled](state, { payload }) {
  //     state.goodPriceInfo = payload
  //   }
  // }
})

export const { changeGoodPriceInfoAction, changeHighScoreInfoAction } = homeSlice.actions

export default homeSlice.reducer
```

##### 展示

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <div className='good-price'>
          <SectionHeader title={goodPriceInfo.title} />
          <SectionRooms roomList={goodPriceInfo.list} />
        </div>
        <div className='high-score'>
          <SectionHeader title={highScoreInfo.title} subtitle={highScoreInfo.subtitle} />
          <SectionRooms roomList={highScoreInfo.list} />
        </div>
      </div>
    </HomeWrapper>
  )
})

export default Home
```

##### **重构一下**

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <HomeSertionV1 infoData={goodPriceInfo} />
        <HomeSertionV1 infoData={highScoreInfo} />
      </div>
    </HomeWrapper>
  )
})

export default Home
```

**HomeSertionV1**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { SectionV1Wrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'

const HomeSertionV1 = memo((props) => {
  const { infoData } = props
  return (
    <SectionV1Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <SectionRooms roomList={infoData.list} />
    </SectionV1Wrapper>
  )
})

HomeSertionV1.propTypes = {
  infoData: PropTypes.object
}

export default HomeSertionV1
```

**对应样式**

```js
import styled from "styled-components"

export const SectionV1Wrapper = styled.div`
  margin-top: 30px;
`
```

#### 折扣数据

##### 获取

**services的home模块**

```js
import sfRequest from ".."
...

export function getHomeDiscountData() {
  return sfRequest.get({
    url: '/home/discount'
  })
}
```

**store的home模块**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getHomeDiscountData, getHomeGoodPriceData, getHomeHighScoreData } from '@/services'

export const fetchHomeDataAction = createAsyncThunk('fetchHomeData', (payload, { dispatch }) => {
  getHomeGoodPriceData().then(res => {
    dispatch(changeGoodPriceInfoAction(res))
  })
  getHomeHighScoreData().then(res => {
    dispatch(changeHighScoreInfoAction(res))
  })
  getHomeDiscountData().then(res => {
    dispatch(changeDiscountInfoAction(res))
  })
})

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    goodPriceInfo: {},
    highScoreInfo: {},
    discountInfo: {}
  },
  reducers: {
    changeGoodPriceInfoAction(state, { payload }) {
      state.goodPriceInfo = payload
    },
    changeHighScoreInfoAction(state, { payload }) {
      state.highScoreInfo = payload
    },
    changeDiscountInfoAction(state, { payload }) {
      state.discountInfo = payload
    },
  },
  // extraReducers: {
  //   [fetchHomeDataAction.fulfilled](state, { payload }) {
  //     state.goodPriceInfo = payload
  //   }
  // }
})

export const { 
  changeGoodPriceInfoAction, 
  changeHighScoreInfoAction,
  changeDiscountInfoAction 
} = homeSlice.actions

export default homeSlice.reducer
```



##### RoomItem动态宽度

这部分区域的需求是一行3个，RoomItem的宽度是一行4个，需要将**RoomItem**的宽度设置成**动态的**；

**RoomItem**

```jsx
import { Rating } from '@mui/material'
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { ItemWrapper } from './style'

const RoomItem = memo((props) => {
  const { itemData, itemWidth = '25%' } = props
  return (
    <ItemWrapper
      verifyColor={itemData?.verify_info?.text_color || '#39576a'}
      itemWidth={itemWidth}
    >
      <div className='inner'>
        <div className='cover'>
          <img src={itemData.picture_url} alt="" />
        </div>
        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
        <div className='bottom'>
          <Rating
            value={itemData.star_rating ?? 5}
            precision={0.5}
            readOnly
            sx={{ fontSize: "12px", color: "#00848A" }}
          />
          <span className='count'>{itemData.reviews_count}</span>
          {
            itemData.bottom_info && (<span className='extra'>·{itemData.bottom_info.content}</span>)
          }
        </div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```

**对应样式**

```js
/*
 * @Description: 待编辑
 * @Author: SiFeng Zhai
 * @Date: 2023-01-03 19:18:39
 * @LastEditors: SiFeng Zhai
 * @LastEditTime: 2023-01-06 08:41:08
 */
import styled from 'styled-components'

export const ItemWrapper = styled.div`
  box-sizing: border-box;
  width: ${props => props.itemWidth};
  padding: 8px;
  
  .inner {
    width: 100%;
  }

  .cover {
    position: relative;
    box-sizing: border-box;
    padding: 66.66% 8px 0;
    border-radius: 3px;
    overflow: hidden;

    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }

  .desc {
    margin: 10px 0 5px;
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.verifyColor};
  }

  .name {
    font-size: 16px;
    font-weight: 700;

    overflow: hidden;  
    text-overflow: ellipsis; 
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical;
  }

  .price {
    margin: 8px 0;
  }

  .bottom {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.text.primaryColor};

    .count {
      margin: 0 2px 0 4px;
    }

    .MuiRating-icon {
      margin-right: -2px;
    }
  }
`
```

**SectionRooms**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import RoomItem from '@/components/room-item'
import { RoomsWrapper } from './style'

const SectionRooms = memo((props) => {
  const { roomList = [], itemWidth } = props
  return (
    <div>
      <RoomsWrapper>
        {
          roomList.slice(0, 8)?.map((item) => {
            return (
              <RoomItem itemData={item} key={item.id} itemWidth={itemWidth} />
            )
          })
        }
      </RoomsWrapper>
    </div>
  )
})

SectionRooms.propTypes = {
  roomList: PropTypes.array
}

export default SectionRooms
```

**HomeSertionV1**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { SectionV1Wrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'

const HomeSertionV1 = memo((props) => {
  const { infoData } = props
  return (
    <SectionV1Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <SectionRooms roomList={infoData.list} itemWidth='25%' />
    </SectionV1Wrapper>
  )
})

HomeSertionV1.propTypes = {
  infoData: PropTypes.object
}

export default HomeSertionV1
```

##### 展示

###### 选项卡

**SectionTabs**

```jsx
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { memo, useState } from 'react'

import { TabsWrapper } from './style'

const SectionTabs = memo((props) => {
  const { tabNames = [] } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  function itmeClick (index) {
    setCurrentIndex(index)
  }
  return (
    <TabsWrapper>
      {
        tabNames.map((item, index) => {
          return (
            <div
              key={index}
              className={classNames('item', { active: index === currentIndex })}
              onClick={e => itmeClick(index)}
            >
              {item}
            </div>
          )
        })
      }
    </TabsWrapper>
  )
})

SectionTabs.propTypes = {
  tabNames: PropTypes.array
}

export default SectionTabs
```

有用到第三方库**classnames**

安装

```
npm install classnames
```

**对应样式**

```js
import styled from "styled-components"

export const TabsWrapper = styled.div`
  display: flex;
  .item {
    box-sizing: border-box;
    flex-basis: 120px;
    flex-shrink: 0;
    padding: 14px 16px;
    margin-right: 16px;
    border-radius: 3px;
    font-size: 17px;
    text-align: center;
    border: 0.5px solid #D8D8D8;
    white-space: nowrap;
    cursor: pointer;
    ${props => props.theme.mixin.boxShadow};

    &:last-child {
      margin-right: 0;
    }
  
    &.active {
      color: #fff;
      background-color: ${props => props.theme.color.secondaryColor};
    }
  }
`
```

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'
import SectionTabs from '@/components/section-tabs'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo, discountInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
  }), shallowEqual)

  // 数据转换
  const tabNames = discountInfo.dest_address?.map(item => item.name)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <div className='discount'>
          <SectionHeader title={discountInfo.title} subtitle={discountInfo.subtitle} />
          <SectionTabs tabNames={tabNames} />
          <SectionRooms roomList={discountInfo.dest_list?.['成都']} itemWidth='33.33%' />
        </div>
        <HomeSertionV1 infoData={goodPriceInfo} />
        <HomeSertionV1 infoData={highScoreInfo} />
      </div>
    </HomeWrapper>
  )
})

export default Home
```

切换时需要**发射事件**通知**父组件**

###### 性能优化

由于涉及到**父子组件事件传递**，可使用**useCallback**性能优化；

**SectionTabs**

```jsx
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { memo, useState } from 'react'

import { TabsWrapper } from './style'

const SectionTabs = memo((props) => {
  const { tabNames = [], tabClick } = props

  const [currentIndex, setCurrentIndex] = useState(0)

  function itmeClick (index, item) {
    setCurrentIndex(index)
    tabClick(item)
  }
  return (
    <TabsWrapper>
      {
        tabNames.map((item, index) => {
          return (
            <div
              key={index}
              className={classNames('item', { active: index === currentIndex })}
              onClick={e => itmeClick(index, item)}
            >
              {item}
            </div>
          )
        })
      }
    </TabsWrapper>
  )
})

SectionTabs.propTypes = {
  tabNames: PropTypes.array
}

export default SectionTabs
```

**Home**

```jsx
import React, { memo, useCallback, useEffect, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'
import SectionTabs from '@/components/section-tabs'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo, discountInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
  }), shallowEqual)

  // 数据转换
  const [name, setName] = useState('佛山')
  const tabNames = discountInfo.dest_address?.map(item => item.name)
  const tabClickHandle = useCallback(function (name) {
    setName(name)
  }, [])

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <div className='discount'>
          <SectionHeader title={discountInfo.title} subtitle={discountInfo.subtitle} />
          <SectionTabs tabNames={tabNames} tabClick={tabClickHandle} />
          <SectionRooms roomList={discountInfo.dest_list?.[name]} itemWidth='33.33%' />
        </div>
        <HomeSertionV1 infoData={goodPriceInfo} />
        <HomeSertionV1 infoData={highScoreInfo} />
      </div>
    </HomeWrapper>
  )
})

export default Home
```

###### 重构一下

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import HomeSectionV2 from './c-cpns/home-section-v2'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo, discountInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        <HomeSectionV2 infoData={discountInfo} />
        <HomeSertionV1 infoData={goodPriceInfo} />
        <HomeSertionV1 infoData={highScoreInfo} />
      </div>
    </HomeWrapper>
  )
})

export default Home
```

**HomeSectionV2**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useCallback, useState } from 'react'

import { SectionV2Wrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'
import SectionTabs from '@/components/section-tabs'

const HomeSectionV2 = memo((props) => {
  // 从props中获取数据
  const { infoData } = props

  // 内部状态
  const [name, setName] = useState('佛山')
  const tabNames = infoData.dest_address?.map(item => item.name)

  // 事件处理
  const tabClickHandle = useCallback(function (name) {
    setName(name)
  }, [])
  return (
    <SectionV2Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <SectionTabs tabNames={tabNames} tabClick={tabClickHandle} />
      <SectionRooms roomList={infoData.dest_list?.[name]} itemWidth='33.33%' />
    </SectionV2Wrapper>
  )
})

HomeSectionV2.propTypes = {
  infoData: PropTypes.object
}

export default HomeSectionV2
```

###### 初次渲染选项卡的数据

初次渲染的选项卡选中的不一定是上述的佛山

现在有3种思路：

1. 取后台返回数据的**第一项**
2. 当**infoData**有值时才渲染**HomeSectionV2**（推荐）
3. 使用**useEffect**，监听**infoData**，若改变则调用**setName**（组件渲染3次）

第一种思路**行不通**：

**HomeSectionV2**首次渲染时，**infoData**是**空对象**，当infoData有值之后，HomeSectionV2第二次渲染；

而**useState**的**初始值**，只在组件**首次渲染**才有用，后续初始值用不上了，这样导致useState的初始值是**空对象**，故行不通；

第3中思路**不建议**：

**HomeSectionV2**第1次渲染，**infoData**没数据；

当**infoData**有值时，**HomeSectionV2**第2次渲染；

**useEffect**监听**infoData**有值之后，设置了name，**HomeSectionV2**第3次渲染；

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import HomeSectionV2 from './c-cpns/home-section-v2'
import { isEmptyObject } from '@/utils'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo, discountInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        {isEmptyObject(discountInfo) && <HomeSectionV2 infoData={discountInfo} />}
        {isEmptyObject(goodPriceInfo) && <HomeSertionV1 infoData={goodPriceInfo} />}
        {isEmptyObject(highScoreInfo) && <HomeSertionV1 infoData={highScoreInfo} />}
      </div>
    </HomeWrapper>
  )
})

export default Home
```

**utils下的isEmptyObject**

```js
export function isEmptyObject(obj) {
  return !!Object.keys(obj).length
}
```

**HomeSectionV2**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useCallback, useState } from 'react'

import { SectionV2Wrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'
import SectionTabs from '@/components/section-tabs'

const HomeSectionV2 = memo((props) => {
  // 从props中获取数据
  const { infoData } = props

  // 内部状态
  const initialName = Object.keys(infoData.dest_list)[0]
  const [name, setName] = useState(initialName)
  const tabNames = infoData.dest_address?.map(item => item.name)

  // 事件处理
  const tabClickHandle = useCallback(function (name) {
    setName(name)
  }, [])
  return (
    <SectionV2Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <SectionTabs tabNames={tabNames} tabClick={tabClickHandle} />
      <SectionRooms roomList={infoData.dest_list?.[name]} itemWidth='33.33%' />
    </SectionV2Wrapper>
  )
})

HomeSectionV2.propTypes = {
  infoData: PropTypes.object
}

export default HomeSectionV2
```

#### 热门推荐数据

##### 获取

**services的home模块**

```js
import sfRequest from ".."
...

export function getHomeHotRecommendData() {
  return sfRequest.get({
    url: '/home/hotrecommenddest'
  })
}
```

**store的home模块**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getHomeDiscountData, getHomeGoodPriceData, getHomeHighScoreData, getHomeHotRecommendData } from '@/services'

export const fetchHomeDataAction = createAsyncThunk('fetchHomeData', (payload, { dispatch }) => {
  getHomeGoodPriceData().then(res => {
    dispatch(changeGoodPriceInfoAction(res))
  })
  getHomeHighScoreData().then(res => {
    dispatch(changeHighScoreInfoAction(res))
  })
  getHomeDiscountData().then(res => {
    dispatch(changeDiscountInfoAction(res))
  })
  getHomeHotRecommendData().then(res => {
    dispatch(changeRecommendInfoAction(res))
  })
})

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    goodPriceInfo: {},
    highScoreInfo: {},
    discountInfo: {},
    recommendInfo: {},
  },
  reducers: {
    changeGoodPriceInfoAction(state, { payload }) {
      state.goodPriceInfo = payload
    },
    changeHighScoreInfoAction(state, { payload }) {
      state.highScoreInfo = payload
    },
    changeDiscountInfoAction(state, { payload }) {
      state.discountInfo = payload
    },
    changeRecommendInfoAction(state, { payload }) {
      state.recommendInfo = payload
    },
  },
  // extraReducers: {
  //   [fetchHomeDataAction.fulfilled](state, { payload }) {
  //     state.goodPriceInfo = payload
  //   }
  // }
})

export const { 
  changeGoodPriceInfoAction, 
  changeHighScoreInfoAction,
  changeDiscountInfoAction,
  changeRecommendInfoAction, 
} = homeSlice.actions

export default homeSlice.reducer
```

##### 展示

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import HomeSectionV2 from './c-cpns/home-section-v2'
import { isEmptyObject } from '@/utils'


const Home = memo(() => {
  // 从redux中获取数据
  const { goodPriceInfo, highScoreInfo, discountInfo, recommendInfo } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
    recommendInfo: state.home.recommendInfo,
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        {isEmptyObject(discountInfo) && <HomeSectionV2 infoData={discountInfo} />}
        {isEmptyObject(recommendInfo) && <HomeSectionV2 infoData={recommendInfo} />}
        {isEmptyObject(goodPriceInfo) && <HomeSertionV1 infoData={goodPriceInfo} />}
        {isEmptyObject(highScoreInfo) && <HomeSertionV1 infoData={highScoreInfo} />}
      </div>
    </HomeWrapper>
  )
})

export default Home
```

#### 区域底部

两种情况：

- 根据选中城市，显示更多；
- 显示全部；

这两种情况取决于是否传name属性

**SectionFooter**

```jsx
import IconMoreArrow from '@/assets/svg/icon_more_arrow'
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { FooterWrapper } from './style'

const SectionFooter = memo((props) => {
  const { name } = props
  let showMsg = '显示全部'
  if (name) {
    showMsg = `显示更多${name}房源`
  }
  return (
    <FooterWrapper color={name ? '#00848A' : '#000'}>
      <div className='info'>
        <span className='text'>{showMsg}</span>
        <IconMoreArrow />
      </div>
    </FooterWrapper>
  )
})

SectionFooter.propTypes = {
  name: PropTypes.string
}

export default SectionFooter
```

**对应样式**

```js
import styled from "styled-components"

export const FooterWrapper = styled.div`
  display: flex;
  margin-top: 10px;

  .info {
    display: flex;
    align-items: center;
    cursor: pointer;

    font-size: 17px;
    font-weight: 700;
    color: ${props => props.color};

    &:hover {
      text-decoration: underline;
    }

    .text {
      margin-right: 6px;
    }
  }
`
```

**IconMoreArrow**

```jsx
import React, { memo } from 'react'
import styleStrToObject from './utils'

const IconMoreArrow = memo(() => {
  return (
    <svg viewBox="0 0 18 18" role="presentation" aria-hidden="true" focusable="false" style={styleStrToObject("height: 10px; width: 10px; fill: currentcolor;")}><path d="m4.29 1.71a1 1 0 1 1 1.42-1.41l8 8a1 1 0 0 1 0 1.41l-8 8a1 1 0 1 1 -1.42-1.41l7.29-7.29z" fillRule="evenodd"></path></svg>
  )
})

export default IconMoreArrow
```

**HomeSertionV1**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { SectionV1Wrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'
import SectionFooter from '@/components/section-footer'

const HomeSertionV1 = memo((props) => {
  const { infoData } = props
  return (
    <SectionV1Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <SectionRooms roomList={infoData.list} itemWidth='25%' />
      <SectionFooter />
    </SectionV1Wrapper>
  )
})

HomeSertionV1.propTypes = {
  infoData: PropTypes.object
}

export default HomeSertionV1
```

**HomeSectionV2**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useCallback, useState } from 'react'

import { SectionV2Wrapper } from './style'
import SectionHeader from '@/components/section-header'
import SectionRooms from '@/components/section-rooms'
import SectionTabs from '@/components/section-tabs'
import SectionFooter from '@/components/section-footer'

const HomeSectionV2 = memo((props) => {
  // 从props中获取数据
  const { infoData } = props

  // 内部状态
  const initialName = Object.keys(infoData.dest_list)[0]
  const [name, setName] = useState(initialName)
  const tabNames = infoData.dest_address?.map(item => item.name)

  // 事件处理
  const tabClickHandle = useCallback(function (name) {
    setName(name)
  }, [])
  return (
    <SectionV2Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <SectionTabs tabNames={tabNames} tabClick={tabClickHandle} />
      <SectionRooms roomList={infoData.dest_list?.[name]} itemWidth='33.33%' />
      <SectionFooter name={name} />
    </SectionV2Wrapper>
  )
})

HomeSectionV2.propTypes = {
  infoData: PropTypes.object
}

export default HomeSectionV2
```

#### 选项卡滚动的封装

超出部分隐藏；

**可滚动区域的内容**大于宽度时，右边按钮显示，这个判断在组件渲染完成之后进行，可使用**useEffect**；

能往**右边**滚动时，左边按钮显示；

中间展示**内容不确定**，使用**类似插槽**的做法，也就是**props.children**;

##### 右侧按钮显示逻辑

**ScrollView**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useRef, useState } from 'react'
import { ViewWrapper } from './style'

const ScrollView = memo((props) => {
  // 状态
  const [showRight, setShowRight] = useState(false)
  // 组件渲染完成，判断是否显示右侧按钮
  const scrollContentRef = useRef()
  useEffect(() => {
    const scrollWith = scrollContentRef.current.srcollWidth // 可滚动宽度
    const clientWidth = scrollContentRef.current.clientWidth // 本身占据宽度
    const totalDistance = scrollWith - clientWidth
    setShowRight(totalDistance > 0)
  }, [props.children])
  return (
    <ViewWrapper>
      <div>左</div>
      {showRight && <button>右</button>}
      <div className='scroll-content' ref={scrollContentRef}>
        {
          props.children
        }
      </div>
    </ViewWrapper>
  )
})

ScrollView.propTypes = {}

export default ScrollView
```

**对应样式**

```js
import styled from "styled-components"

export const ViewWrapper = styled.div`
  overflow: hidden;
  .scroll-content {
    position: relative;
    display: flex;

    transition: transform 300ms ease;
  }
`

```

点击右边按钮之后，**滚动的区间多长呢？**

滚动之后，最左元素的**偏移量**就是滚动区间，**offsetLeft**（相对于定位元素，没定位则相对于body）；

使用移动**transform**来实现滚动, 并加上动画；

滚动到某种程度（**totalDistance**小于**newEl的offsetLeft**）之后，右边按钮需要隐藏；

多次渲染组件时需要将**totalDistance**记录下来；

**ScrollView**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useRef, useState } from 'react'
import { ViewWrapper } from './style'

const ScrollView = memo((props) => {
  // 状态
  const [showRight, setShowRight] = useState(false)
  const [posIndex, setPosIndex] = useState(0)
  const totalDistanceRef = useRef()

  // 组件渲染完成，判断是否显示右侧按钮
  const scrollContentRef = useRef()
  useEffect(() => {
    const scrollWidth = scrollContentRef.current.scrollWidth // 可滚动宽度
    const clientWidth = scrollContentRef.current.clientWidth // 本身占据宽度
    const totalDistance = scrollWidth - clientWidth
    totalDistanceRef.current = totalDistance
    setShowRight(totalDistance > 0)
  }, [props.children])

  // 事件处理
  function rightClick () {
    const newIndex = posIndex + 1
    const newEl = scrollContentRef.current.children[newIndex]
    scrollContentRef.current.style.transform = `translate(-${newEl.offsetLeft}px)`
    setPosIndex(newIndex)
    // 是否继续显示右边按钮
    setShowRight(totalDistanceRef.current > newEl.offsetLeft)
  }
  return (
    <ViewWrapper>
      <div>左</div>
      {showRight && <button onClick={rightClick}>右</button>}
      <div className='scroll-content' ref={scrollContentRef}>
        {props.children}
      </div>
    </ViewWrapper>
  )
})

ScrollView.propTypes = {}

export default ScrollView
```

##### 右侧按钮显示逻辑

默认不显示；

只要**newEl.offsetLeft**大于0就显示；

**ScrollView**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useRef, useState } from 'react'
import { ViewWrapper } from './style'

const ScrollView = memo((props) => {
  // 状态
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [posIndex, setPosIndex] = useState(0)
  const totalDistanceRef = useRef()

  // 组件渲染完成，判断是否显示右侧按钮
  const scrollContentRef = useRef()
  useEffect(() => {
    const scrollWidth = scrollContentRef.current.scrollWidth // 可滚动宽度
    const clientWidth = scrollContentRef.current.clientWidth // 本身占据宽度
    const totalDistance = scrollWidth - clientWidth
    totalDistanceRef.current = totalDistance
    setShowRight(totalDistance > 0)
  }, [props.children])

  // 事件处理
  function leftClick () {
    const newIndex = posIndex - 1
    const newEl = scrollContentRef.current.children[newIndex]
    scrollContentRef.current.style.transform = `translate(-${newEl.offsetLeft}px)`
    setPosIndex(newIndex)
    // 是否继续显示两边按钮
    setShowRight(totalDistanceRef.current > newEl.offsetLeft)
    setShowLeft(newEl.offsetLeft > 0)
  }

  function rightClick () {
    const newIndex = posIndex + 1
    const newEl = scrollContentRef.current.children[newIndex]
    scrollContentRef.current.style.transform = `translate(-${newEl.offsetLeft}px)`
    setPosIndex(newIndex)
    // 是否继续显示两边按钮
    setShowRight(totalDistanceRef.current > newEl.offsetLeft)
    setShowLeft(newEl.offsetLeft > 0)
  }



  return (
    <ViewWrapper>
      {showLeft && <button onClick={leftClick}>左</button>}
      {showRight && <button onClick={rightClick}>右</button>}
      <div className='scroll-content' ref={scrollContentRef}>
        {props.children}
      </div>
    </ViewWrapper>
  )
})

ScrollView.propTypes = {}

export default ScrollView
```

不难发现，**leftClick**和**rightClick**逻辑几乎一样

##### 抽取重复逻辑

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useRef, useState } from 'react'
import { ViewWrapper } from './style'

const ScrollView = memo((props) => {
  // 状态
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [posIndex, setPosIndex] = useState(0)
  const totalDistanceRef = useRef()

  // 组件渲染完成，判断是否显示右侧按钮
  const scrollContentRef = useRef()
  useEffect(() => {
    const scrollWidth = scrollContentRef.current.scrollWidth // 可滚动宽度
    const clientWidth = scrollContentRef.current.clientWidth // 本身占据宽度
    const totalDistance = scrollWidth - clientWidth
    totalDistanceRef.current = totalDistance
    setShowRight(totalDistance > 0)
  }, [props.children])

  // 事件处理
  function controlClick (isRight) {
    const newIndex = isRight ? posIndex + 1 : posIndex - 1
    const newEl = scrollContentRef.current.children[newIndex]
    scrollContentRef.current.style.transform = `translate(-${newEl.offsetLeft}px)`
    setPosIndex(newIndex)
    // 是否继续显示两边按钮
    setShowRight(totalDistanceRef.current > newEl.offsetLeft)
    setShowLeft(newEl.offsetLeft > 0)
  }

  return (
    <ViewWrapper>
      {showLeft && <button onClick={e => controlClick(false)}>左</button>}
      {showRight && <button onClick={e => controlClick(true)}>右</button>}
      <div className='scroll-content' ref={scrollContentRef}>
        {props.children}
      </div>
    </ViewWrapper>
  )
})

ScrollView.propTypes = {}

export default ScrollView
```

##### 两侧按钮替换成图标

**ScrollView**

```jsx
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'
import PropTypes from 'prop-types'
import React, { memo, useEffect, useRef, useState } from 'react'
import { ViewWrapper } from './style'

const ScrollView = memo((props) => {
  // 状态
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [posIndex, setPosIndex] = useState(0)
  const totalDistanceRef = useRef()

  // 组件渲染完成，判断是否显示右侧按钮
  const scrollContentRef = useRef()
  useEffect(() => {
    const scrollWidth = scrollContentRef.current.scrollWidth // 可滚动宽度
    const clientWidth = scrollContentRef.current.clientWidth // 本身占据宽度
    const totalDistance = scrollWidth - clientWidth
    totalDistanceRef.current = totalDistance
    setShowRight(totalDistance > 0)
  }, [props.children])

  // 事件处理
  function controlClick (isRight) {
    const newIndex = isRight ? posIndex + 1 : posIndex - 1
    const newEl = scrollContentRef.current.children[newIndex]
    scrollContentRef.current.style.transform = `translate(-${newEl.offsetLeft}px)`
    setPosIndex(newIndex)
    // 是否继续显示两边按钮
    setShowRight(totalDistanceRef.current > newEl.offsetLeft)
    setShowLeft(newEl.offsetLeft > 0)
  }

  return (
    <ViewWrapper>
      {showLeft && (
        <div className='control left' onClick={e => controlClick(false)}>
          <IconArrowLeft />
        </div>
      )
      }
      {showRight && (
        <div className='control right' onClick={e => controlClick(true)}>
          <IconArrowRight />
        </div>
      )
      }
      <div className='scroll'>
        <div className='scroll-content' ref={scrollContentRef}>
          {props.children}
        </div>
      </div>
    </ViewWrapper>
  )
})

ScrollView.propTypes = {}

export default ScrollView
```

**IconArrowLeft**

```jsx
import React, { memo } from 'react'
import styleStrToObj from './utils'

const IconArrowLeft = memo(() => {
  return (
    <svg viewBox="0 0 18 18" role="img" aria-hidden="false" aria-label="previous" focusable="false" style={styleStrToObj("height: 12px; width: 12px; display: block; fill: currentcolor;")}><path d="m13.7 16.29a1 1 0 1 1 -1.42 1.41l-8-8a1 1 0 0 1 0-1.41l8-8a1 1 0 1 1 1.42 1.41l-7.29 7.29z" fillRule="evenodd"></path></svg>
  )
})

export default IconArrowLeft
```

**IconArrowRight**

```jsx
import React, { memo } from 'react'
import styleStrToObj from './utils'

const IconArrowRight = memo(() => {
  return (
    <svg viewBox="0 0 18 18" role="img" aria-hidden="false" aria-label="next" focusable="false" style={styleStrToObj("height: 12px; width: 12px; display: block; fill: currentcolor;")}><path d="m4.29 1.71a1 1 0 1 1 1.42-1.41l8 8a1 1 0 0 1 0 1.41l-8 8a1 1 0 1 1 -1.42-1.41l7.29-7.29z" fillRule="evenodd"></path></svg>
  )
})

export default IconArrowRight
```

**对应样式**

```js
import styled from "styled-components"

export const ViewWrapper = styled.div`
  position: relative;
  padding: 8px 0;
  
  .scroll {
    overflow: hidden;
    .scroll-content {
      display: flex;
      transition: transform 300ms ease;
    }
  }
  .control {
    position: absolute;
    z-index: 9;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    text-align: center;
    border-width: 2px;
    border-style: solid;
    border-color: #fff;
    background: #fff;
    box-shadow: 0px 1px 1px 1px rgba(0,0,0,.14);
    cursor: pointer;

    &.left {
      left: 0;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    &.right {
      right: 0;
      top: 50%;
      transform: translate(50%, -50%);
    }
  }
`

```

之后那些区域需要类似选项卡的滚动效果，使用**ScrollView**就行；

#### 向往数据

##### 获取

**services下的home模块**

```js
import sfRequest from ".."
...

export function getHomeLongForData() {
  return sfRequest.get({
    url: '/home/longfor'
  })
}
```

**store下的home模块**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getHomeDiscountData, getHomeGoodPriceData, getHomeHighScoreData, getHomeHotRecommendData, getHomeLongForData } from '@/services'

export const fetchHomeDataAction = createAsyncThunk('fetchHomeData', (payload, { dispatch }) => {
  getHomeGoodPriceData().then(res => {
    dispatch(changeGoodPriceInfoAction(res))
  })
  getHomeHighScoreData().then(res => {
    dispatch(changeHighScoreInfoAction(res))
  })
  getHomeDiscountData().then(res => {
    dispatch(changeDiscountInfoAction(res))
  })
  getHomeHotRecommendData().then(res => {
    dispatch(changeRecommendInfoAction(res))
  })
  getHomeLongForData().then(res => {
    dispatch(changeLongForInfoAction(res))
  })
})

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    goodPriceInfo: {},
    highScoreInfo: {},
    discountInfo: {},
    recommendInfo: {},
    longForInfo: {},
  },
  reducers: {
    changeGoodPriceInfoAction(state, { payload }) {
      state.goodPriceInfo = payload
    },
    changeHighScoreInfoAction(state, { payload }) {
      state.highScoreInfo = payload
    },
    changeDiscountInfoAction(state, { payload }) {
      state.discountInfo = payload
    },
    changeRecommendInfoAction(state, { payload }) {
      state.recommendInfo = payload
    },
    changeLongForInfoAction(state, { payload }) {
      state.longForInfo = payload
    },
  },
  // extraReducers: {
  //   [fetchHomeDataAction.fulfilled](state, { payload }) {
  //     state.goodPriceInfo = payload
  //   }
  // }
})

export const { 
  changeGoodPriceInfoAction, 
  changeHighScoreInfoAction,
  changeDiscountInfoAction,
  changeRecommendInfoAction,
  changeLongForInfoAction, 
} = homeSlice.actions

export default homeSlice.reducer
```

##### 展示

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import HomeSectionV2 from './c-cpns/home-section-v2'
import { isEmptyObject } from '@/utils'
import HomeLongFor from './c-cpns/home-longfor'


const Home = memo(() => {
  // 从redux中获取数据
  const {
    goodPriceInfo,
    highScoreInfo,
    discountInfo,
    recommendInfo,
    longForInfo,
  } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
    recommendInfo: state.home.recommendInfo,
    longForInfo: state.home.longForInfo,
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        {isEmptyObject(discountInfo) && <HomeSectionV2 infoData={discountInfo} />}
        {isEmptyObject(recommendInfo) && <HomeSectionV2 infoData={recommendInfo} />}
        {isEmptyObject(longForInfo) && <HomeLongFor infoData={longForInfo} />}
        {isEmptyObject(goodPriceInfo) && <HomeSertionV1 infoData={goodPriceInfo} />}
        {isEmptyObject(highScoreInfo) && <HomeSertionV1 infoData={highScoreInfo} />}
      </div>
    </HomeWrapper>
  )
})

export default Home
```

**HomeLongFor**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { LongForWrapper } from './style'
import SectionHeader from '@/components/section-header'
import LongforItem from '@/components/longfor-item'

const HomeLongFor = memo((props) => {
  const { infoData } = props
  return (
    <LongForWrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <div className='longfor-list'>
        {
          infoData.list.map(item => {
            return <LongforItem itemData={item} key={item.city} />
          })
        }
      </div>
    </LongForWrapper>
  )
})

HomeLongFor.propTypes = {
  infoData: PropTypes.object
}

export default HomeLongFor
```

**对应样式**

```js
import styled from "styled-components"

export const LongForWrapper = styled.div`
  margin-top: 30px -8px 0;
  .longfor-list {
    display: flex;
    margin: 0 -8px;
  }
`
```

**LongforItem**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { ItemWrapper } from './style'

const LongforItem = memo((props) => {
  const { itemData } = props
  return (
    <ItemWrapper>
      <div className='inner'>
        <img className='cover' src={itemData.picture_url} alt='' />
        <div className='bg-cover'></div>
        <div className='info'>
          <div className='city'>{itemData.city}</div>
          <div className='price'>均价 {itemData.price}</div>
        </div>
      </div>
    </ItemWrapper>
  )
})

LongforItem.propTypes = {
  itemData: PropTypes.object
}

export default LongforItem
```

**对应样式**

```js
import styled from "styled-components"

export const ItemWrapper = styled.div`
  flex-shrink: 0;
  width: 20%;
  
  .inner {
    position: relative;
    padding: 8px;
  }

  .cover {
    width: 100%;
    border-radius: 3px;
    overflow: hidden;
  }

  .bg-cover {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    height: 60%;
    background-image: linear-gradient(-180deg, rgba(0, 0, 0, 0) 3%, rgb(0, 0, 0) 100%)
  }

  .info {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 24px 32px;
    color: #fff;

    .city {
      font-size: 18px;
      font-weight: 600;
    }

    .price {
      font-size: 14px;
      margin-top: 5px;
    }
  }
`
```

##### 添加滚动效果

**HomeLongFor**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { LongForWrapper } from './style'
import SectionHeader from '@/components/section-header'
import LongforItem from '@/components/longfor-item'
import ScrollView from '@/base-ui/scroll-view'

const HomeLongFor = memo((props) => {
  const { infoData } = props
  return (
    <LongForWrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <div className='longfor-list'>
        <ScrollView>
          {
            infoData.list.map(item => {
              return <LongforItem itemData={item} key={item.city} />
            })
          }
        </ScrollView>
      </div>
    </LongForWrapper>
  )
})

HomeLongFor.propTypes = {
  infoData: PropTypes.object
}

export default HomeLongFor
```

#### 底部数据

##### 获取

**services的home模块**

```js
import sfRequest from ".."
...

export function getHomePlusData() {
  return sfRequest.get({
    url: '/home/plus'
  })
}
```

**store的home模块**

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getHomeDiscountData, getHomeGoodPriceData, getHomeHighScoreData, getHomeHotRecommendData, getHomeLongForData, getHomePlusData } from '@/services'

export const fetchHomeDataAction = createAsyncThunk('fetchHomeData', (payload, { dispatch }) => {
  getHomeGoodPriceData().then(res => {
    dispatch(changeGoodPriceInfoAction(res))
  })
  getHomeHighScoreData().then(res => {
    dispatch(changeHighScoreInfoAction(res))
  })
  getHomeDiscountData().then(res => {
    dispatch(changeDiscountInfoAction(res))
  })
  getHomeHotRecommendData().then(res => {
    dispatch(changeRecommendInfoAction(res))
  })
  getHomeLongForData().then(res => {
    dispatch(changeLongForInfoAction(res))
  })
  getHomePlusData().then(res => {
    dispatch(changePlusInfoAction(res))
  })
})

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    goodPriceInfo: {},
    highScoreInfo: {},
    discountInfo: {},
    recommendInfo: {},
    longForInfo: {},
    plusInfo: {},
  },
  reducers: {
    changeGoodPriceInfoAction(state, { payload }) {
      state.goodPriceInfo = payload
    },
    changeHighScoreInfoAction(state, { payload }) {
      state.highScoreInfo = payload
    },
    changeDiscountInfoAction(state, { payload }) {
      state.discountInfo = payload
    },
    changeRecommendInfoAction(state, { payload }) {
      state.recommendInfo = payload
    },
    changeLongForInfoAction(state, { payload }) {
      state.longForInfo = payload
    },
    changePlusInfoAction(state, { payload }) {
      state.plusInfo = payload
    },
  },
  // extraReducers: {
  //   [fetchHomeDataAction.fulfilled](state, { payload }) {
  //     state.goodPriceInfo = payload
  //   }
  // }
})

export const { 
  changeGoodPriceInfoAction, 
  changeHighScoreInfoAction,
  changeDiscountInfoAction,
  changeRecommendInfoAction,
  changeLongForInfoAction,
  changePlusInfoAction, 
} = homeSlice.actions

export default homeSlice.reducer
```

##### 展示

**Home**

```jsx
import React, { memo, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import HomeBanner from './c-cpns/home-banner'
import { fetchHomeDataAction } from '@/store/modules/home'
import { HomeWrapper } from './style'
import HomeSertionV1 from './c-cpns/home-section-v1'
import HomeSectionV2 from './c-cpns/home-section-v2'
import { isEmptyObject } from '@/utils'
import HomeLongFor from './c-cpns/home-longfor'
import HomeSectionV3 from './c-cpns/home-section-v3'


const Home = memo(() => {
  // 从redux中获取数据
  const {
    goodPriceInfo,
    highScoreInfo,
    discountInfo,
    recommendInfo,
    longForInfo,
    plusInfo,
  } = useSelector((state) => ({
    goodPriceInfo: state.home.goodPriceInfo,
    highScoreInfo: state.home.highScoreInfo,
    discountInfo: state.home.discountInfo,
    recommendInfo: state.home.recommendInfo,
    longForInfo: state.home.longForInfo,
    plusInfo: state.home.plusInfo,
  }), shallowEqual)

  // 派发异步事件：发起网络请求
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchHomeDataAction())
  }, [dispatch])

  return (
    <HomeWrapper>
      <HomeBanner />
      <div className='content'>
        {isEmptyObject(discountInfo) && <HomeSectionV2 infoData={discountInfo} />}
        {isEmptyObject(recommendInfo) && <HomeSectionV2 infoData={recommendInfo} />}
        {isEmptyObject(longForInfo) && <HomeLongFor infoData={longForInfo} />}
        {isEmptyObject(goodPriceInfo) && <HomeSertionV1 infoData={goodPriceInfo} />}
        {isEmptyObject(highScoreInfo) && <HomeSertionV1 infoData={highScoreInfo} />}
        {isEmptyObject(plusInfo) && <HomeSectionV3 infoData={plusInfo} />}
      </div>
    </HomeWrapper>
  )
})

export default Home
```

**HomeSectionV3**

```jsx
import ScrollView from '@/base-ui/scroll-view'
import RoomItem from '@/components/room-item'
import SectionHeader from '@/components/section-header'
import PropTypes from 'prop-types'
import React, { memo } from 'react'
import { SectionV3Wrapper } from './style'

const HomeSectionV3 = memo((props) => {
  const { infoData } = props
  return (
    <SectionV3Wrapper>
      <SectionHeader title={infoData.title} subtitle={infoData.subtitle} />
      <div className='room-list'>
        <ScrollView>
          {
            infoData.list.map(item => {
              return <RoomItem itemData={item} itemWidth='20%' key={item.id} />
            })
          }
        </ScrollView>
      </div>
    </SectionV3Wrapper>
  )
})

HomeSectionV3.propTypes = {
  infoData: PropTypes.object
}

export default HomeSectionV3

```

**对应样式**

```js
import styled from "styled-components"

export const SectionV3Wrapper = styled.div`
  .room-list {
    margin: 0 -8px;
  }
`
```

#### 首页跳转思路

在**SectionFooter**里面监听点击，跳转即可；

**SectionFooter**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'

import { FooterWrapper } from './style'
import IconMoreArrow from '@/assets/svg/icon_more_arrow'

const SectionFooter = memo((props) => {
  const { name } = props
  let showMsg = '显示全部'
  if (name) {
    showMsg = `显示更多${name}房源`
  }
  // 事件处理
  const navigate = useNavigate()
  function more () {
    navigate('/entire')
  }

  return (
    <FooterWrapper color={name ? '#00848A' : '#000'}>
      <div className='info' onClick={more}>
        <span className='text'>{showMsg}</span>
        <IconMoreArrow />
      </div>
    </FooterWrapper>
  )
})

SectionFooter.propTypes = {
  name: PropTypes.string
}

export default SectionFooter
```



### 底部内容

**AppFooter**

```jsx
import React, { memo } from 'react'
import { FooterWrapper } from './style'
import footerData from "@/assets/data/footer.json"

const AppFooter = memo(() => {
  return (
    <FooterWrapper>
      <div className='wrapper'>
        <div className='service'>
          {
            footerData.map(item => {
              return (
                <div className='item' key={item.name}>
                  <div className='name'>{item.name}</div>
                  <div className='list'>
                    {
                      item.list.map(iten => {
                        return <div className='iten' key={iten}>{iten}</div>
                      })
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className='statement'>© 2022 Airbnb, Inc. All rights reserved.条款 · 隐私政策 · 网站地图 · 全国旅游投诉渠道 12301</div>
      </div>
    </FooterWrapper>
  )
})

export default AppFooter
```

**对应样式**

```js
import styled from "styled-components";

export const FooterWrapper = styled.div`
  margin-top: 100px;
  border-top: 1px solid #EBEBEB;

  .wrapper {
    width: 1080px;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 48px 24px;
  }

  .service {
    display: flex;

    .item {
      flex: 1;

      .name {
        margin-bottom: 16px;
        font-weight: 700;
      }

      .list {
        .iten {
          margin-top: 6px;
          color: #767676;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .statement {
    margin-top: 30px;
    border-top: 1px solid #EBEBEB;
    padding: 20px;
    color: #767676;
    text-align: center;
  }
`
```

### 头部动画

当滚动到一定程度时，头部内容发生变化：

- 弹出搜索区域时，其它区域**阴影**；
- **点击**搜索弹出搜索区域
- **点击**其它区域收回搜索区域
- **滚动**到一定距离收回搜索区域

由于滚动事件**执行频率很高**，导致频繁调用**setXXX**方法，使得组件**多次重新渲染**，所以需要**节流**操作；

使用**underscore**库，比**lodash**轻量；

不可以简单判断滚动距离**大于某个数值**时收回搜索区域（条件可能无限成立，超多次重新渲染），而是**滚动后ScrollY**与**滚动前的ScrollY**的差值大于一定数值时才收回搜索区域；

由于滚动前的ScrollY与组件重新渲染没有关系，所以没必要使用**useState**记录；

而**useRef**在整个生命周期保持不变，可以用它来记录；

没弹出搜索区时，**prevY**与**ScrollY**保持一致，弹出搜索区后，当scrollY与prevY差值大于一定数值，收回搜索区；

当向上滚时，scrollY与prevY差值为负数，导致一致不收回搜索区，所以使用他们**差值的绝对值**；

**AppHeader**

```jsx
import React, { memo, useRef, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import classNames from 'classnames'

import HeaderCenter from './c-cpns/header-center'
import HeaderLeft from './c-cpns/header-left'
import HeaderRight from './c-cpns/header-right'
import { HeaderWrapper, SearchAreaWrapper } from './style'
import useScrollPosition from '@/hooks/useScrollPosition'

const AppHeader = memo(() => {
  // 内部状态
  const [isSearch, setIsSearch] = useState(false)

  // redux中获取数据
  const { headerConfig } = useSelector((state) => ({
    headerConfig: state.main.headerConfig
  }), shallowEqual)
  const { isFixed } = headerConfig

  // 监听滚动
  const { scrollY } = useScrollPosition()
  const prevY = useRef(0)
  if (!isSearch) prevY.current = scrollY
  if (isSearch && Math.abs(scrollY - prevY.current) > 30) setIsSearch(false)

  return (
    <HeaderWrapper className={classNames({ fixed: isFixed })}>
      <div className="content">
        <div className="top">
          <HeaderLeft />
          <HeaderCenter isSearch={isSearch} searchClickHandle={e => setIsSearch(true)} />
          <HeaderRight />
        </div>
        <SearchAreaWrapper isSearch={isSearch}></SearchAreaWrapper>
      </div>
      {isSearch && <div className="cover" onClick={e => setIsSearch(false)}></div>}
    </HeaderWrapper>
  )
})

export default AppHeader
```

**对应样式**

```js
import styled from 'styled-components'

export const HeaderWrapper = styled.div`
  border-bottom: 1px solid #eee;
  
  &.fixed {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;
    right: 0;
  }

  .content {
    position: relative;
    z-index: 19;
    background-color: #fff;
    .top {
      display: flex;
      /* align-items: center; */
      height: 80px;
    }

    .search-area {
      height: 100px;
    }
  }

  .cover {
    position: fixed;
    z-index: 9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0,.5);
  }
`
export const SearchAreaWrapper = styled.div`
transition: height 300ms ease;
  height: ${props => props.isSearch ? '100px' : '0'};
`
```

**useScrollPosition**

```js
import { useEffect, useState } from "react"
import { throttle } from 'underscore'

export default function useScrollPosition() {
  // 装状态记录位置
  const [scrollX, setScrollX] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  // 监听window的滚动
  useEffect(() => {
    const handleScroll = throttle(function() {
      setScrollX(window.scrollX)
      setScrollY(window.scrollY)
    }, 100)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return { scrollX, scrollY }
}
```

**HeaderCenter**

```jsx
import React, { memo, useState } from 'react'

import { CenterWrapper } from './style'
import IconSearchBar from '@/assets/svg/icon_search_bar'
import searchTitles from '@/assets/data/search_titles'
import SearchSections from './c-cpns/search-sections'
import SearchTabs from './c-cpns/search-tabs'
import { CSSTransition } from 'react-transition-group'

const HeaderCenter = memo((props) => {
  const { isSearch, searchClickHandle } = props
  const [tabIndex, setTabIndex] = useState(0)

  const titles = searchTitles.map(item => item.title)
  // 事件处理
  function searchClick () {
    if (searchClickHandle) searchClickHandle()
  }

  return (
    <CenterWrapper>
      <CSSTransition in={!isSearch} classNames='bar' timeout={250} unmountOnExit={true}>
        <div className='search-bar' onClick={searchClick}>
          <div className='text'>
            搜索房源和体验
          </div>
          <div className='icon'>
            <IconSearchBar />
          </div>
        </div>
      </CSSTransition>
      <CSSTransition in={isSearch} classNames='detail' timeout={250} unmountOnExit={true}>
        <div className="search-detail">
          <SearchTabs titles={titles} tabClick={setTabIndex} />
          <div className="infos">
            <SearchSections searchInfos={searchTitles[tabIndex].searchInfos} />
          </div>
        </div>
      </CSSTransition>
    </CenterWrapper>
  )
})

export default HeaderCenter
```

**对应样式**

```js
import styled from 'styled-components'

export const CenterWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  height: 48px;

  .search-bar {
    position: absolute;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    height: 48px;
    margin-top: 20px;
    box-sizing: border-box;
    padding: 0 8px;
    border: 1px solid #ddd;
    border-radius: 24px;
    cursor: pointer;
    
    ${props => props.theme.mixin.boxShadow};

    .text {
      padding: 0 16px;
      color: #222;
      font-weight: 600;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: #fff;
      background-color: ${props => props.theme.color.primaryColor};
    }
  }

  .search-detail {
    position: relative;
    transform-origin: 50% 0;
    will-change: transform, opacity;

    .infos {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  
  .detail-exit {
    transform: scale(1.0) translateY(0);
    opacity: 1;
  }

  .detail-exit-active {
    transition: all 250ms ease;
    transform: scale(0.35, 0.727273) translateY(-58px);
    opacity: 0;
  }

  .detail-enter {
    transform: scale(0.35, 0.727273) translateY(-58px);
    opacity: 0;
  }

  .detail-enter-active {
    transform: scale(1.0) translateY(0);
    opacity: 1;
    transition: all 250ms ease;
  }

  .bar-enter {
    transform: scale(2.85714, 1.375) translateY(58px);
    opacity: 0;
  }

  .bar-enter-active {
    transition: all 250ms ease;
    transform: scale(1.0) translateY(0);
    opacity: 1;
  }

  .bar-exit {
    opacity: 0;
  }
`
```

**SearchTabs**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useState } from 'react'
import classNames from 'classnames'

import { TabsWrapper } from './style'

const SearchTabs = memo((props) => {
  const { titles, tabClick } = props
  const [currentIndex, setCurrentIndex] = useState(0)
  // 事件处理
  function itemClick (index) {
    setCurrentIndex(index)
    if (tabClick) tabClick(index)
  }
  return (
    <TabsWrapper>
      {
        titles.map((item, index) => {
          return (
            <div
              className={classNames('item', { active: currentIndex === index })}
              key={item}
              onClick={e => itemClick(index)}
            >
              <span className='text'>{item}</span>
              <span className='bottom'></span>
            </div>
          )
        })
      }
    </TabsWrapper>
  )
})

SearchTabs.propTypes = {
  titles: PropTypes.array
}

export default SearchTabs
```

**对应样式**

```js
import styled from "styled-components";

export const TabsWrapper = styled.div`
  display: flex;
  
  color: ${props => props.theme.isAlpha ? "#fff": "#222"};

  .item {
    position: relative;
    width: 64px;
    height: 20px;
    margin: 10px 16px;
    font-size: 16px;
    cursor: pointer;

    &.active .bottom {
      position: absolute;
      top: 28px;
      left: 0;
      width: 64px;
      height: 2px;
      background-color: ${props => props.theme.isAlpha ? "#fff": "#333"};
    }
  }
`
```

**SearchSections**

```jsx
import PropTypes from 'prop-types'
import React, { memo } from 'react'

import { SectionsWrapper } from './style'

const SearchSections = memo((props) => {
  const { searchInfos } = props
  return (
    <SectionsWrapper>
      {
        searchInfos.map((item, index) => {
          return (
            <div className="item" key={index}>
              <div className="info">
                <div className="title">{item.title}</div>
                <div className="desc">{item.desc}</div>
              </div>
              {index !== searchInfos.length - 1 && <div className='divider'></div>}
            </div>
          )
        })
      }
    </SectionsWrapper>
  )
})

SearchSections.propTypes = {
  searchInfos: PropTypes.array
}

export default SearchSections
```

**对应样式**

```js
import styled from "styled-components";

export const SectionsWrapper = styled.div`
  display: flex;
  width: 850px;
  height: 66px;
  border-radius: 32px;
  border: 1px solid #ddd;
  background-color: #fff;

  .item {
    flex: 1;
    display: flex;
    align-items: center;
    border-radius: 32px;

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 30px;

      .title {
        font-size: 12px;
        font-weight: 800;
        color: #222;
      }

      .desc {
        font-size: 14px;
        color: #666;
      }
    }

    .divider {
      height: 32px;
      width: 1px;
      background-color: #ddd;
    }

    &:hover {
      background-color: #eee;
    }
  }
`
```

### 头部透明效果

首页头部有搜索区有透明效果，其它页面也可能有；

只有**头部允许透明且ScrollY等于0**的时候，头部才会透明；

**只要回到顶部，且头部允许透明，那必定要弹出搜索区**；

当头部透明时，头部很多区域样式需要调整，由于**isAlpha**有些地方传不到，所以无法根据isAlpha调整相应样式；

应该让isAlpha能传递给所有需要调整样式的组件，用**ThemeProvider**包起那些组件；

**AppHeader**

```jsx
import React, { memo, useRef, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import classNames from 'classnames'

import HeaderCenter from './c-cpns/header-center'
import HeaderLeft from './c-cpns/header-left'
import HeaderRight from './c-cpns/header-right'
import { HeaderWrapper, SearchAreaWrapper } from './style'
import useScrollPosition from '@/hooks/useScrollPosition'
import { ThemeProvider } from 'styled-components'

const AppHeader = memo(() => {
  // 内部状态
  const [isSearch, setIsSearch] = useState(false)

  // redux中获取数据
  const { headerConfig } = useSelector((state) => ({
    headerConfig: state.main.headerConfig
  }), shallowEqual)
  const { isFixed, topAlpha } = headerConfig

  // 监听滚动
  const { scrollY } = useScrollPosition()
  const prevY = useRef(0)
  if (!isSearch) prevY.current = scrollY
  if (isSearch && Math.abs(scrollY - prevY.current) > 30) setIsSearch(false)

  // 透明度的逻辑
  const isAlpha = topAlpha && scrollY === 0
  return (
    <ThemeProvider theme={{ isAlpha }}>
      <HeaderWrapper className={classNames({ fixed: isFixed })}>
        <div className="content">
          <div className="top">
            <HeaderLeft />
            <HeaderCenter isSearch={isAlpha || isSearch} searchClickHandle={e => setIsSearch(true)} />
            <HeaderRight />
          </div>
          <SearchAreaWrapper isSearch={isAlpha || isSearch}></SearchAreaWrapper>
        </div>
        {isSearch && <div className="cover" onClick={e => setIsSearch(false)}></div>}
      </HeaderWrapper>
    </ThemeProvider>
  )
})

export default AppHeader
```

**对应样式**

```js
import styled from 'styled-components'

export const HeaderWrapper = styled.div`
  
  
  &.fixed {
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;
    right: 0;
  }

  .content {
    position: relative;
    z-index: 19;
    background-color: ${props => props.theme.isAlpha ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 1)'};
    border-bottom: 1px solid #eee;
    border-bottom-color: ${props => props.theme.isAlpha ? 'rgba(233, 233, 233, 0)' : 'rgba(233, 233, 233, 1)'};
    transition: all 300ms ease;

    .top {
      display: flex;
      align-items: center;
      height: 80px;
    }

    .search-area {
      height: 100px;
    }
  }

  .cover {
    position: fixed;
    z-index: 9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0,.5);
  }
`
export const SearchAreaWrapper = styled.div`
transition: height 300ms ease;
  height: ${props => props.isSearch ? '100px' : '0'};
`
```

**HeaderLeft对应样式**

```js
import styled from "styled-components"

export const LeftWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  color: ${props => props.theme.isAlpha ? '#fff' : props.theme.color.primaryColor};

  .logo {
    margin-left: 25px;
    cursor: pointer;
  }
`
```

**HeaderRight对应样式**

```js
import styled from 'styled-components'

export const RightWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  color: ${props => props.theme.text.primaryColor};
  font-weight: 600;

  .btns {
    display: flex;
    box-sizing: content-box;
    color: ${props => props.theme.isAlpha ? '#fff' : props.theme.text.primaryColor};

    .btn {
      height: 18px;
      line-height: 18px;
      padding: 12px 15px;
      border-radius: 22px;
      cursor: pointer;
      box-sizing: content-box;

      &:hover {
        background-color: ${props => props.theme.isAlpha ? 'rgba(255, 255, 255, .1)' : '#f5f5f5'};
      }
    }
  }

  .profile {
    position: relative;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 77px;
    height: 42px;
    margin-right: 24px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 25px;
    background-color: #fff;
    cursor: pointer;

    color: ${props => props.theme.text.primaryColor};

    ${props => props.theme.mixin.boxShadow};
    
    .panel {
      position: absolute;
      top: 54px;
      right: 0;
      width: 240px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 6px rgba(0,0,0,.2);
      color: #666;

      .top, .bottom {
        padding: 10px 0;

        .item {
          height: 40px;
          line-height: 40px;
          padding: 0 16px;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }

      .top {
        border-bottom: 1px solid #ddd;
      }
    }
  }
`
```



## 更多页

### 过滤条件区域

记录选中项，再一次点击则该项剔除；

**Entire**

```jsx
import React, { memo } from 'react'

import EntireFilter from './c-cpns/entire-filter'
import EntirePagination from './c-cpns/entire-pagination'
import EntireRooms from './c-cpns/entire-rooms'
import { EntireWrapper } from './style'

const Entire = memo(() => {
  return (
    <EntireWrapper>
      <EntireFilter />
      <EntireRooms />
      <EntirePagination />
    </EntireWrapper>
  )
})

export default Entire
```

**EntireFilter**

```jsx
import React, { memo, useState } from 'react'
import { FilterWrapper } from './style'
import filerData from '@/assets/data/filter_data.json'
import classNames from 'classnames'

const EntireFilter = memo(() => {
  const [selectItems, setSelectItems] = useState([])
  // 事件处理
  function itemClick (item) {
    const newItems = [...selectItems]
    if (newItems.includes(item)) { // 移除
      const itemIndex = newItems.findIndex(filterItem => filterItem === item)
      newItems.splice(itemIndex, 1)
    } else { // 添加
      newItems.push(item)
    }
    setSelectItems(newItems)
  }
  return (
    <FilterWrapper>
      <div className="filter">
        {
          filerData.map(item => {
            return (
              <div
                className={classNames("item", { active: selectItems.includes(item) })}
                key={item}
                onClick={e => itemClick(item)}
              >
                {item}
              </div>
            )
          })
        }
      </div>
    </FilterWrapper>
  )
})

export default EntireFilter
```

**对应样式**

```js
import styled from "styled-components"

export const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  padding-left: 16px;
  border-bottom: 1px solid #f2f2f2;
  background-color: #fff;

  .filter {
    display: flex;
    .item {
      margin: 0 4px 0 8px;
      padding: 6px 12px;
      border: 1px solid #dce0e0;
      border-radius: 4px;
      color: #484848;
      cursor: pointer;

      &.active {
        background: #008489;
        border: 1px solid #008489;
        color: #fff;
      }
    }
  }
`
```

### 房间列表区域

#### **数据获取**

**store的entire模块**

**reducer**

```js
import * as actionType from './constants'

const initialState = {
  currentPage: 0,
  roomList: [],
  totalCount: 0
}

function reducer(state = initialState, action) {
  switch (action.type) { 
    case actionType.CHANGE_CURRENT_PAGE:
      return { ...state, currentPage: action.currentPage }
    case actionType.CHANGE_ROOM_LIST:
      return { ...state, roomList: action.roomList }
    case actionType.CHANGE_TOTAL_COUNT:
      return { ...state, totalCount: action.totalCount } 
    default:
      return state
      
  }
}

export default reducer
```

**constants**

```js
export const CHANGE_CURRENT_PAGE = 'entire/change_current_page'
export const CHANGE_ROOM_LIST = 'entire/change_room_list'
export const CHANGE_TOTAL_COUNT = 'entire/change_total_count'
```

**actionCreators**

```js
/*
 * @Description: 待编辑
 * @Author: SiFeng Zhai
 * @Date: 2022-12-30 11:06:47
 * @LastEditors: SiFeng Zhai
 * @LastEditTime: 2023-01-13 20:37:24
 */
import { getEntireRoomList } from '@/services/modules/entire'
import * as actionType from './constants'

export const changeCurrentPageAction = (currentPage) => ({
  type: actionType.CHANGE_CURRENT_PAGE,
  currentPage
})

export const changeRoomListAction = (roomList) => ({
  type: actionType.CHANGE_ROOM_LIST,
  roomList
})

export const changeTotalCountAction = (totalCount) => ({
  type: actionType.CHANGE_TOTAL_COUNT,
  totalCount
})

export const fetchRoomListAction = () => {
  return async (dispatch, getState) => {
    // 根据页码获取最新数据
    const currentPage = getState().entire.currentPage
    const res = await getEntireRoomList(currentPage * 20)
    // 将最新的数据保存到redux中
    const roomList = res.list
    const totalCount = res.totalCount
    dispatch(changeRoomListAction(roomList))
    dispatch(changeTotalCountAction(totalCount))
  }
}
```

**services的entire模块**

```js
import sfRequest from ".."

export function getEntireRoomList(offset = 0, size = 20) {
  return sfRequest.get({
    url: 'entire/list',
    params: {
      offset,
      size,
    }
  })
}
```

#### 数据展示

**EntireRooms**

```jsx
import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { RoomsWrapper } from './style'
import RoomItem from '@/components/room-item'

const EntireRooms = memo(() => {
  // redux中的数据
  const { roomList, totalCount } = useSelector((state) => ({
    roomList: state.entire.roomList,
    totalCount: state.entire.totalCount
  }))
  return (
    <RoomsWrapper>
      <h2 className='title'>{totalCount}多处住宿</h2>
      <div className='list'>
        {
          roomList.map(item => {
            return (
              <RoomItem itemData={item} itemWidth='20%' key={item.id} />
            )
          })
        }
      </div>
    </RoomsWrapper>
  )
})

export default EntireRooms
```

**对应样式**

```js
import styled from "styled-components"

export const RoomsWrapper = styled.div`
  padding: 30px 20px;
  .title {
    font-weight: 700;
    font-size: 22px;
    color: #222;
    margin: 0 0 10px 10px;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
  }
`
```

#### 图片轮播效果

MUI没有对应的轮播图组件，可以去Ant design里面找，ant design也是引用了一个叫**react-slick**的库；

- 左右箭头**布局样式**
- 左右箭头**点击逻辑**
- 轮播指示器

**RoomItem**

```jsx
import { Rating } from '@mui/material'
import PropTypes from 'prop-types'
import React, { memo, useRef } from 'react'
import { Carousel } from 'antd'

import { ItemWrapper } from './style'
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'

const RoomItem = memo((props) => {
  const { itemData, itemWidth = '25%' } = props
  const swiperRef = useRef()
  // 事件处理
  function controlClick (isRight = true) {
    isRight ? swiperRef.current.next() : swiperRef.current.prev()
  }
  return (
    <ItemWrapper
      verifyColor={itemData?.verify_info?.text_color || '#39576a'}
      itemWidth={itemWidth}
    >
      <div className='inner'>
        {/* 轮播图片区 */}
        <div className='swiper'>
          <div className='control'>
            <div className='btn left' onClick={e => controlClick(false)}>
              <IconArrowLeft width="30" height="30" />
            </div>
            <div className='btn right' onClick={e => controlClick()}>
              <IconArrowRight width="30" height="30" />
            </div>
          </div>
          <Carousel dots={false} ref={swiperRef}>
            {
              itemData?.picture_urls?.map(item => {
                return (
                  <div className='cover' key={item}>
                    <img src={item} alt="" />
                  </div>
                )
              })
            }
          </Carousel>
        </div>

        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
        <div className='bottom'>
          <Rating
            value={itemData.star_rating ?? 5}
            precision={0.5}
            readOnly
            sx={{ fontSize: "12px", color: "#00848A" }}
          />
          <span className='count'>{itemData.reviews_count}</span>
          {
            itemData.bottom_info && (<span className='extra'>·{itemData.bottom_info.content}</span>)
          }
        </div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```

**对应样式**

```js
import styled from 'styled-components'

export const ItemWrapper = styled.div`
  flex-shrink: 0;
  box-sizing: border-box;
  width: ${props => props.itemWidth};
  padding: 8px;
  
  .inner {
    width: 100%;
  }

  .cover {
    position: relative;
    box-sizing: border-box;
    padding: 66.66% 8px 0;
    border-radius: 3px;
    overflow: hidden;

    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .swiper {
    position: relative;
    cursor: pointer;

    &:hover {
      .control {
        display: flex;
      }
    }

    .control {
      position: absolute;
      z-index: 1;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: none;
      justify-content: space-between;
      color: #fff;
      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 83px;
        height: 100%;
        background: linear-gradient(to left, transparent 0%, rgba(0, 0, 0, 0.25) 100%);

        &.right {
          background: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.25) 100%);
        }
      }
    }
  }

  .desc {
    margin: 10px 0 5px;
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.verifyColor};
  }

  .name {
    font-size: 16px;
    font-weight: 700;

    overflow: hidden;  
    text-overflow: ellipsis; 
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical;
  }

  .price {
    margin: 8px 0;
  }

  .bottom {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.text.primaryColor};

    .count {
      margin: 0 2px 0 4px;
    }

    .MuiRating-icon {
      margin-right: -2px;
    }
  }
`
```

##### 轮播指示器

让选中的item居中，也就是算出**选中元素的滚动距离**；

该距离=**选中item.offsetLeft + 选中item.width * 0.5 - content.width** ;

有些**特殊情况是不需要选中item居中**的，比如刚开始选中item是第一个时；

当**distance**小于0时，需要置为0（左边的特殊情况）；

当**distance**大于**content滚动距离与content宽度的差值**时，需要将该差值赋值给distance；

**RoomItem**

```jsx
import { Rating } from '@mui/material'
import PropTypes from 'prop-types'
import React, { memo, useRef, useState } from 'react'
import { Carousel } from 'antd'

import { ItemWrapper } from './style'
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'
import Indicator from '@/base-ui/indicator'
import classNames from 'classnames'

const RoomItem = memo((props) => {
  const { itemData, itemWidth = '25%' } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const swiperRef = useRef()
  // 事件处理
  function controlClick (isRight = true) {
    // 上一张，下一张
    isRight ? swiperRef.current.next() : swiperRef.current.prev()
    // 更新选中item
    let newIndex = isRight ? selectedIndex + 1 : selectedIndex - 1
    const length = itemData.picture_urls.length
    if (newIndex < 0) newIndex = length - 1
    if (newIndex > length - 1) newIndex = 0
    setSelectedIndex(newIndex)
  }
  return (
    <ItemWrapper
      verifyColor={itemData?.verify_info?.text_color || '#39576a'}
      itemWidth={itemWidth}
    >
      <div className='inner'>
        {/* 轮播图片区 */}
        <div className='swiper'>
          {/* 左右箭头 */}
          <div className='control'>
            <div className='btn left' onClick={e => controlClick(false)}>
              <IconArrowLeft width="30" height="30" />
            </div>
            <div className='btn right' onClick={e => controlClick()}>
              <IconArrowRight width="30" height="30" />
            </div>
          </div>
          {/* 图片 */}
          <Carousel dots={false} ref={swiperRef}>
            {
              itemData?.picture_urls?.map(item => {
                return (
                  <div className='cover' key={item}>
                    <img src={item} alt="" />
                  </div>
                )
              })
            }
          </Carousel>
          {/* 指示器 */}
          <div className='indicator'>
            <Indicator selectedIndex={selectedIndex}>
              {
                itemData?.picture_urls?.map((item, index) => {
                  return (
                    <div className='dot-item' key={item}>
                      <span className={classNames('dot', { active: selectedIndex === index })}></span>
                    </div>
                  )
                })
              }
            </Indicator>
          </div>
        </div>

        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
        <div className='bottom'>
          <Rating
            value={itemData.star_rating ?? 5}
            precision={0.5}
            readOnly
            sx={{ fontSize: "12px", color: "#00848A" }}
          />
          <span className='count'>{itemData.reviews_count}</span>
          {
            itemData.bottom_info && (<span className='extra'>·{itemData.bottom_info.content}</span>)
          }
        </div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```

**对应样式**

```js
import styled from 'styled-components'

export const ItemWrapper = styled.div`
  flex-shrink: 0;
  box-sizing: border-box;
  width: ${props => props.itemWidth};
  padding: 8px;
  
  .inner {
    width: 100%;
  }

  .cover {
    position: relative;
    box-sizing: border-box;
    padding: 66.66% 8px 0;
    border-radius: 3px;
    overflow: hidden;

    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .swiper {
    position: relative;
    cursor: pointer;

    &:hover {
      .control {
        display: flex;
      }
    }

    .control {
      position: absolute;
      z-index: 1;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: none;
      justify-content: space-between;
      color: #fff;
      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 83px;
        height: 100%;
        background: linear-gradient(to left, transparent 0%, rgba(0, 0, 0, 0.25) 100%);

        &.right {
          background: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.25) 100%);
        }
      }
    }

    .indicator {
      position: absolute;
      z-index: 99;
      bottom: 10px;
      left: 0;
      right: 0;
      margin: 0 auto;
      width: 30%;

      .dot-item {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20%;

        .dot {
          width: 6px;
          height: 6px;
          background-color: #fff;
          border-radius: 50%;

          &.active {
            width: 8px;
            height: 8px;
          }
        }
      }
    }
  }

  .desc {
    margin: 10px 0 5px;
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.verifyColor};
  }

  .name {
    font-size: 16px;
    font-weight: 700;

    overflow: hidden;  
    text-overflow: ellipsis; 
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical;
  }

  .price {
    margin: 8px 0;
  }

  .bottom {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.text.primaryColor};

    .count {
      margin: 0 2px 0 4px;
    }

    .MuiRating-icon {
      margin-right: -2px;
    }
  }
`
```

**Indicator**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useRef } from 'react'
import { IndicatorWrapper } from './style'

const Indicator = memo((props) => {
  const { selectedIndex = 0 } = props
  const contentRef = useRef()
  useEffect(() => {
    // selectedIndex对应的item
    const selectItemEl = contentRef.current.children[selectedIndex]
    const itemOffsetLeft = selectItemEl.offsetLeft
    const itemWidth = selectItemEl.clientWidth
    // content的宽度
    const contentWidth = contentRef.current.clientWidth
    const contentScroll = contentRef.current.scrollWidth

    // selectedIndex滚动的距离
    let distance = itemOffsetLeft + itemWidth * 0.5 - contentWidth * 0.5
    // 左右两边情况的特殊处理
    if (distance < 0) distance = 0 // 左边情况的特殊处理
    const totalDistance = contentScroll - contentWidth
    if (distance > totalDistance) distance = totalDistance // 右边情况的特殊处理
    // 滚动
    contentRef.current.style.transform = `translate(${-distance}px)`
  }, [selectedIndex])
  return (
    <IndicatorWrapper>
      <div className='i-content' ref={contentRef}>
        {
          props.children
        }
      </div>
    </IndicatorWrapper>
  )
})

Indicator.propTypes = {
  selectedIndex: PropTypes.number
}

export default Indicator
```

**对应样式**

```js
import styled from "styled-components"
export const IndicatorWrapper = styled.div`
  overflow: hidden;

  .i-content {
    display: flex;
    position: relative;
    transition: transform 200ms ease;

    > * {
      flex-shrink: 0;
    }
  }
`
```

#### room-item不同情况下的使用

有些页面需要room-item使用轮播图，有些则不需要，所以需要分类；

当服务器提供多种图片则使用轮播图，否则就展示图片；

**RoomItem**

```jsx
import { Rating } from '@mui/material'
import PropTypes from 'prop-types'
import React, { memo, useRef, useState } from 'react'
import { Carousel } from 'antd'

import { ItemWrapper } from './style'
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'
import Indicator from '@/base-ui/indicator'
import classNames from 'classnames'

const RoomItem = memo((props) => {
  const { itemData, itemWidth = '25%' } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const swiperRef = useRef()
  // 事件处理
  function controlClick (isRight = true) {
    // 上一张，下一张
    isRight ? swiperRef.current.next() : swiperRef.current.prev()
    // 更新选中item
    let newIndex = isRight ? selectedIndex + 1 : selectedIndex - 1
    const length = itemData.picture_urls.length
    if (newIndex < 0) newIndex = length - 1
    if (newIndex > length - 1) newIndex = 0
    setSelectedIndex(newIndex)
  }
  const pictrueEl = (
    <div className='cover'>
      <img src={itemData.picture_url} alt="" />
    </div>
  )

  const swiperEl = (
    <div className='swiper'>
      {/* 左右箭头 */}
      <div className='control'>
        <div className='btn left' onClick={e => controlClick(false)}>
          <IconArrowLeft width="30" height="30" />
        </div>
        <div className='btn right' onClick={e => controlClick()}>
          <IconArrowRight width="30" height="30" />
        </div>
      </div>
      {/* 图片 */}
      <Carousel dots={false} ref={swiperRef}>
        {
          itemData?.picture_urls?.map(item => {
            return (
              <div className='cover' key={item}>
                <img src={item} alt="" />
              </div>
            )
          })
        }
      </Carousel>
      {/* 指示器 */}
      <div className='indicator'>
        <Indicator selectedIndex={selectedIndex}>
          {
            itemData?.picture_urls?.map((item, index) => {
              return (
                <div className='dot-item' key={item}>
                  <span className={classNames('dot', { active: selectedIndex === index })}></span>
                </div>
              )
            })
          }
        </Indicator>
      </div>
    </div>
  )
  return (
    <ItemWrapper
      verifyColor={itemData?.verify_info?.text_color || '#39576a'}
      itemWidth={itemWidth}
    >
      <div className='inner'>
        {/* 轮播图片区 */}
        {!itemData.picture_urls ? pictrueEl : swiperEl}
        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
        <div className='bottom'>
          <Rating
            value={itemData.star_rating ?? 5}
            precision={0.5}
            readOnly
            sx={{ fontSize: "12px", color: "#00848A" }}
          />
          <span className='count'>{itemData.reviews_count}</span>
          {
            itemData.bottom_info && (<span className='extra'>·{itemData.bottom_info.content}</span>)
          }
        </div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```



### 页码区域

**总页数**为totalCount/20向上取整；

**EntirePagination**

```jsx
import React, { memo } from 'react'
import Pagination from '@mui/material/Pagination'
import { PaginationWrapper } from './style'
import { useSelector } from 'react-redux'

const EntirePagination = memo(() => {
  const { totalCount, currentPage, roomList } = useSelector((state) => ({
    totalCount: state.entire.totalCount,
    currentPage: state.entire.currentPage,
    roomList: state.entire.roomList
  }))
  const totalPage = Math.ceil(totalCount / 20)
  const startCount = currentPage * 20 + 1
  const endCount = (currentPage + 1) * 20
  return (
    <PaginationWrapper>
      {
        !!roomList.length && (
          <div className='info'>
            <Pagination count={totalPage} />
            <div className='desc'>
              第 {startCount} - {endCount} 个房源, 共超过{totalCount}个
            </div>
          </div>
        )
      }
    </PaginationWrapper>
  )
})

export default EntirePagination
```

**对应样式**

```js
import styled from "styled-components"

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;

  .info {
    display: flex;
    flex-direction: column;
    align-items: center;

    .MuiPaginationItem-page {
      margin:  0 9px;
      &:hover {
        text-decoration: underline;
      }
    }

    .MuiPaginationItem-page.Mui-selected {
      background-color: #222;
      color: #fff;
    }

    .desc {
      margin-top: 16px;
      color: #222;
    }
  }
`
```

#### 页码改变逻辑

- 重新发起请求
- 回到顶部
- 蒙版

当正在发生网络请求时，需要蒙版；

而需要用一个变量（isLoading）记录是否正在发生网络请求；

保存在store中的entire模块的reducer中；

**EntirePagination**

```jsx
import React, { memo } from 'react'
import Pagination from '@mui/material/Pagination'
import { PaginationWrapper } from './style'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { fetchRoomListAction } from '@/store/modules/entire/createActions'

const EntirePagination = memo(() => {
  const { totalCount, currentPage, roomList } = useSelector((state) => ({
    totalCount: state.entire.totalCount,
    currentPage: state.entire.currentPage,
    roomList: state.entire.roomList
  }), shallowEqual)
  const totalPage = Math.ceil(totalCount / 20)
  const startCount = currentPage * 20 + 1
  const endCount = (currentPage + 1) * 20

  // 事件处理
  const dispatch = useDispatch()
  function pageChangeHandle (evevt, pageCount) {
    // 回到顶部
    window.scrollTo(0, 0)
    // 重新请求
    dispatch(fetchRoomListAction(pageCount - 1))
  }
  return (
    <PaginationWrapper>
      {
        !!roomList.length && (
          <div className='info'>
            <Pagination count={totalPage} onChange={pageChangeHandle} />
            <div className='desc'>
              第 {startCount} - {endCount} 个房源, 共超过{totalCount}个
            </div>
          </div>
        )
      }
    </PaginationWrapper>
  )
})

export default EntirePagination
```

**EntireRooms**

```jsx
import React, { memo } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { RoomsWrapper } from './style'
import RoomItem from '@/components/room-item'

const EntireRooms = memo(() => {
  // redux中的数据
  const { roomList, totalCount, isLoading } = useSelector((state) => ({
    roomList: state.entire.roomList,
    totalCount: state.entire.totalCount,
    isLoading: state.entire.isLoading,
  }), shallowEqual)
  return (
    <RoomsWrapper>
      <h2 className='title'>{totalCount}多处住宿</h2>
      <div className='list'>
        {
          roomList.map(item => {
            return (
              <RoomItem itemData={item} itemWidth='20%' key={item.id} />
            )
          })
        }
      </div>
      {isLoading && <div className='cover'></div>}
    </RoomsWrapper>
  )
})

export default EntireRooms
```

**对应样式**

```js
import styled from "styled-components"

export const RoomsWrapper = styled.div`
  position: relative;
  padding: 30px 20px;
  .title {
    font-weight: 700;
    font-size: 22px;
    color: #222;
    margin: 0 0 10px 10px;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
  }
  > .cover {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, .8);
  }
`
```

**store的entire模块**

**actionCreator**

```js
import { getEntireRoomList } from '@/services/modules/entire'
import * as actionType from './constants'

export const changeCurrentPageAction = (currentPage) => ({
  type: actionType.CHANGE_CURRENT_PAGE,
  currentPage
})

export const changeRoomListAction = (roomList) => ({
  type: actionType.CHANGE_ROOM_LIST,
  roomList
})

export const changeTotalCountAction = (totalCount) => ({
  type: actionType.CHANGE_TOTAL_COUNT,
  totalCount
})

export const changeIsLoadingAction = (isLoading) => ({
  type: actionType.CHANGE_IS_LOADING,
  isLoading
})

export const fetchRoomListAction = (page = 0) => {
  return async (dispatch, getState) => {
    // 修改页码
    dispatch(changeCurrentPageAction(page))
    // 根据页码获取最新数据
    dispatch(changeIsLoadingAction(true))
    const res = await getEntireRoomList(page * 20)
    dispatch(changeIsLoadingAction(false))
    // 将最新的数据保存到redux中
    const roomList = res.list
    const totalCount = res.totalCount
    dispatch(changeRoomListAction(roomList))
    dispatch(changeTotalCountAction(totalCount))
  }
}
```

**reducer**

```js
import * as actionType from './constants'

const initialState = {
  currentPage: 0,
  roomList: [],
  totalCount: 0,
  isLoading: false,
}

function reducer(state = initialState, action) {
  switch (action.type) { 
    case actionType.CHANGE_CURRENT_PAGE:
      return { ...state, currentPage: action.currentPage }
    case actionType.CHANGE_ROOM_LIST:
      return { ...state, roomList: action.roomList }
    case actionType.CHANGE_TOTAL_COUNT:
      return { ...state, totalCount: action.totalCount }
    case actionType.CHANGE_IS_LOADING:
     return { ...state, isLoading: action.isLoading }  
    default:
      return state
      
  }
}

export default reducer
```

**constant**

```js
export const CHANGE_CURRENT_PAGE = 'entire/change_current_page'
export const CHANGE_ROOM_LIST = 'entire/change_room_list'
export const CHANGE_TOTAL_COUNT = 'entire/change_total_count'
export const CHANGE_IS_LOADING = 'entire/change_is_loading'
```

### 详情页跳转

可能首页不需要跳转到详情页，所以跳转逻辑不要再**room-item**内监听；

而是**将事件传递出去**，**通知父组件跳转**；

**EntireRooms**

```jsx
import React, { memo, useCallback } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { RoomsWrapper } from './style'
import RoomItem from '@/components/room-item'
import { useNavigate } from 'react-router-dom'

const EntireRooms = memo(() => {
  // redux中的数据
  const { roomList, totalCount, isLoading } = useSelector((state) => ({
    roomList: state.entire.roomList,
    totalCount: state.entire.totalCount,
    isLoading: state.entire.isLoading,
  }), shallowEqual)

  // 事件处理
  const navigate = useNavigate()
  const click = useCallback(() => {
    navigate('/detail')
  }, [navigate])

  return (
    <RoomsWrapper>
      <h2 className='title'>{totalCount}多处住宿</h2>
      <div className='list'>
        {
          roomList.map(item => {
            return (
              <RoomItem
                itemData={item}
                itemWidth='20%'
                key={item._id}
                itemClick={click}
              />
            )
          })
        }
      </div>
      {isLoading && <div className='cover'></div>}
    </RoomsWrapper>
  )
})

export default EntireRooms
```

**RoomItem**

```jsx
import { Rating } from '@mui/material'
import PropTypes from 'prop-types'
import React, { memo, useRef, useState } from 'react'
import { Carousel } from 'antd'

import { ItemWrapper } from './style'
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'
import Indicator from '@/base-ui/indicator'
import classNames from 'classnames'

const RoomItem = memo((props) => {
  const { itemData, itemWidth = '25%', itemClick } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const swiperRef = useRef()
  // 事件处理
  function controlClick (isRight = true) {
    // 上一张，下一张
    isRight ? swiperRef.current.next() : swiperRef.current.prev()
    // 更新选中item
    let newIndex = isRight ? selectedIndex + 1 : selectedIndex - 1
    const length = itemData.picture_urls.length
    if (newIndex < 0) newIndex = length - 1
    if (newIndex > length - 1) newIndex = 0
    setSelectedIndex(newIndex)
  }

  function itemClickHanlde () {
    if (itemClick) itemClick()
  }
  // 子元素赋值
  const pictrueEl = (
    <div className='cover'>
      <img src={itemData.picture_url} alt="" />
    </div>
  )

  const swiperEl = (
    <div className='swiper'>
      {/* 左右箭头 */}
      <div className='control'>
        <div className='btn left' onClick={e => controlClick(false)}>
          <IconArrowLeft width="30" height="30" />
        </div>
        <div className='btn right' onClick={e => controlClick()}>
          <IconArrowRight width="30" height="30" />
        </div>
      </div>
      {/* 图片 */}
      <Carousel dots={false} ref={swiperRef}>
        {
          itemData?.picture_urls?.map(item => {
            return (
              <div className='cover' key={item}>
                <img src={item} alt="" />
              </div>
            )
          })
        }
      </Carousel>
      {/* 指示器 */}
      <div className='indicator'>
        <Indicator selectedIndex={selectedIndex}>
          {
            itemData?.picture_urls?.map((item, index) => {
              return (
                <div className='dot-item' key={item}>
                  <span className={classNames('dot', { active: selectedIndex === index })}></span>
                </div>
              )
            })
          }
        </Indicator>
      </div>
    </div>
  )
  return (
    <ItemWrapper
      verifyColor={itemData?.verify_info?.text_color || '#39576a'}
      itemWidth={itemWidth}
      onClick={itemClickHanlde}
    >
      <div className='inner'>
        {/* 轮播图片区 */}
        {!itemData.picture_urls ? pictrueEl : swiperEl}
        <div className='desc'>
          {itemData.verify_info.messages.join('·')}
        </div>
        <div className='name'>{itemData.name}</div>
        <div className='price'>￥{itemData.price}/晚</div>
        <div className='bottom'>
          <Rating
            value={itemData.star_rating ?? 5}
            precision={0.5}
            readOnly
            sx={{ fontSize: "12px", color: "#00848A" }}
          />
          <span className='count'>{itemData.reviews_count}</span>
          {
            itemData.bottom_info && (<span className='extra'>·{itemData.bottom_info.content}</span>)
          }
        </div>
      </div>
    </ItemWrapper>
  )
})

RoomItem.propTypes = {
  itemData: PropTypes.object
}

export default RoomItem
```

#### 数据

由于详情页的**数据过大**，无法通过**动态路由**和**query**的形式传递到详情页；

所以可以在**跳转之后**将数据保存到**redux**中，**详情页**共享即可

**EntireRooms**

```jsx
import React, { memo, useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { RoomsWrapper } from './style'
import RoomItem from '@/components/room-item'
import { useNavigate } from 'react-router-dom'
import { changeDetailInfoAction } from '@/store/modules/detail'

const EntireRooms = memo(() => {
  // redux中的数据
  const { roomList, totalCount, isLoading } = useSelector((state) => ({
    roomList: state.entire.roomList,
    totalCount: state.entire.totalCount,
    isLoading: state.entire.isLoading,
  }), shallowEqual)

  // 事件处理
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const click = useCallback((item) => {
    dispatch(changeDetailInfoAction(item))
    navigate('/detail')
  }, [navigate, dispatch])

  return (
    <RoomsWrapper>
      <h2 className='title'>{totalCount}多处住宿</h2>
      <div className='list'>
        {
          roomList.map(item => {
            return (
              <RoomItem
                itemData={item}
                itemWidth='20%'
                key={item._id}
                itemClick={click}
              />
            )
          })
        }
      </div>
      {isLoading && <div className='cover'></div>}
    </RoomsWrapper>
  )
})

export default EntireRooms
```

**store的detail模块**

```js
import { createSlice } from '@reduxjs/toolkit'
const detailSlice = createSlice({
  name: 'detail',
  initialState: {
    detailInfo: {},
  },
  reducers: {
    changeDetailInfoAction(state, { payload }) {
      state.detailInfo = payload
    }
  }
})

export const { changeDetailInfoAction } = detailSlice.actions
export default detailSlice.reducer
```

**store的index.js**

```js
import { configureStore } from '@reduxjs/toolkit'
import homeReducer from './modules/home'
import entireReducer from './modules/entire'
import detailReducer from './modules/detail'

const store = configureStore({
  reducer: {
    home: homeReducer,
    entire: entireReducer,
    detail: detailReducer,
  }
})

export default store
```

#### 展示

- 遮盖层效果

**Detail**

```jsx
import React, { memo } from 'react'
import DetailInfo from './c-cpns/detail-info'
import DetailPictures from './c-cpns/detail-pictures'
import { DetailWrapper } from './style'

const Detail = memo(() => {

  return (
    <DetailWrapper>
      <DetailPictures />
      <DetailInfo />
    </DetailWrapper>
  )
})

export default Detail
```

**DetailPictures**

```jsx
import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { DetailPictureWrapper } from './style'

const DetailPictures = memo((props) => {
  // redux获取数据
  const { detailInfo } = useSelector((state) => ({
    detailInfo: state.detail.detailInfo
  }))
  return (
    <DetailPictureWrapper>
      <div className="pictures">
        <div className="left">
          <div className="item">
            <img src={detailInfo?.picture_urls?.[0]} alt="" />
            <div className="cover"></div>
          </div>
        </div>
        <div className="right">
          {
            detailInfo?.picture_urls?.slice(1, 5).map(item => {
              return (
                <div className="item" key={item}>
                  <img src={item} alt="" />
                  <div className="cover"></div>
                </div>
              )
            })
          }
        </div>
      </div>
    </DetailPictureWrapper>
  )
})

export default DetailPictures
```

**对应样式**

```js
import styled from "styled-components"

export const DetailPictureWrapper = styled.div`
  position: relative;
  > .pictures {
    display: flex;
    height: 600px;
    background-color: #000;

    &:hover {
      .cover {
        opacity: 1 !important;
      }

      .item:hover {
        .cover {
          opacity: 0 !important;
        }
      }
    }    
  }

  .left, .right {
    width: 50%;
    height: 100%;

    .item {
      position: relative;
      height: 100%;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        transition: transform 0.3s ease-in;
      }

      .cover {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0,.3);
        opacity: 0;
        transition: opacity 200ms ease;
      }

      &:hover {
        img {
          transform: scale(1.1);
        }
      }
    }
  }

  .right {
    display: flex;
    flex-wrap: wrap;

    .item {
      width: 50%;
      height: 50%;
      box-sizing: border-box;
      border:  1px solid #000;
    } 
  }

  .show-btn {
    position: absolute;
    z-index: 99;
    right: 15px;
    bottom: 15px;
    line-height: 22px;
    padding: 6px 15px;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
  }
`
```

#### 切换时事件冒泡

点击一个item时进入一个它的详情页，无可厚非；

但是点击轮播图的切换图标时也进入了详情页，因为发生了**事件冒泡**，需要阻止事件冒泡；

## 详情页

### 图片浏览器

#### 顶部和中部

点击任意图片或查看按钮可打开图片浏览器，关闭按钮关闭；

**铺满整个屏幕，没有滚动条**；

由于detail页面内容多产生滚动条，导致打开图片浏览器时也有，需要去掉；

当图片浏览器显示时，需要滚动功能消失，当图片浏览器关闭时恢复；

加上切换图片时的动画，使用**react-transition-group**库；

**PictureBrowser**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { BrowserWrapper } from './style'
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'
import IconClose from '@/assets/svg/icon_close'

const PictureBrowser = memo((props) => {
  const { pictureUrls, closeHandle } = props
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isNext, setIsNext] = useState(false)
  // 当图片浏览器显示时，需要滚动功能消失
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
  // 事件处理
  function closeClick () {
    // 通知父组件关闭图片浏览器
    if (closeHandle) closeHandle()
  }

  function controlClick (isRight = true) {
    let newIndex = isRight ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0) newIndex = pictureUrls.length - 1
    if (newIndex > pictureUrls.length - 1) newIndex = 0
    setCurrentIndex(newIndex)
    setIsNext(isRight)
  }
  return (
    <BrowserWrapper isNext={isNext}>
      <div className="top">
        <div className="close-btn" onClick={closeClick}>
          <IconClose />
        </div>
      </div>
      <div className="slider">
        <div className="control">
          <div className="btn left" onClick={e => controlClick(false)}>
            <IconArrowLeft height="77" width="77" />
          </div>
          <div className="btn right" onClick={e => controlClick(false)}>
            <IconArrowRight height="77" width="77" />
          </div>
        </div>
        <div className="picture">
          <SwitchTransition mode='in-out'>
            <CSSTransition
              key={pictureUrls[currentIndex]}
              classNames='pic'
              timeout={200}
            >
              <img src={pictureUrls[currentIndex]} alt="" />
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
      <div className="preview"></div>
    </BrowserWrapper>
  )
})

PictureBrowser.propTypes = {
  pictureUrls: PropTypes.array
}

export default PictureBrowser
```

**对应样式**

```js
import styled from "styled-components"

export const BrowserWrapper = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #333;

  .top {
    position: relative;
    height: 86px;
    background-color: #333;

    .close-btn {
      position: absolute;
      top: 15px;
      right: 25px;
      cursor: pointer;
    }
  }
  
  .slider {
    display: flex;
    justify-content: center;
    flex: 1;

    .control {
      position: absolute;
      z-index: 1;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      color: #fff;

      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 83px;
        height: 100%;
        cursor: pointer;
      }
    }

    .picture {
      position: relative;
      height: 100%;
      overflow: hidden;
      width: 100%;
      max-width: 105vh;

      img {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        height: 100%;
        user-select: none;
      }

      /* 动画样式 */
      /* 进入 */
      .pic-enter {
        transform: translateX(${props => props.isNext ? '100%' : '-100%'});
        opacity: 0;
      }
      .pic-enter-active {
        transform: translate(0);
        opacity: 1;
        transition: all 200 ease;
      }
      /* 离开 */
      .pic-exit {
        opacity: 1;
      }
      .pic-exit-active {
        opacity: 0;
        transition: all 200 ease;
      }
    }
    
  }

  .preview {
    height: 100px;
    margin-top: 10px;
  }
`
```

#### 底部指示器

**PictureBrowser**

```jsx
import PropTypes from 'prop-types'
import React, { memo, useEffect, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { BrowserWrapper } from './style'
import IconArrowLeft from '@/assets/svg/icon-arrow-left'
import IconArrowRight from '@/assets/svg/icon-arrow-right'
import IconClose from '@/assets/svg/icon_close'
import IconTriangleArrowBottom from '@/assets/svg/icon_triangle_arrow_bottom'
import Indicator from '../indicator'
import classNames from 'classnames'
import IconTriangleArrowTop from '@/assets/svg/icon_triangle_arrow_top'

const PictureBrowser = memo((props) => {
  const { pictureUrls, closeHandle } = props
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isNext, setIsNext] = useState(false)
  const [showList, setShowList] = useState(true)
  // 当图片浏览器显示时，需要滚动功能消失
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
  // 事件处理
  function closeClick () {
    // 通知父组件关闭图片浏览器
    if (closeHandle) closeHandle()
  }

  function controlClick (isRight = true) {
    let newIndex = isRight ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0) newIndex = pictureUrls.length - 1
    if (newIndex > pictureUrls.length - 1) newIndex = 0
    setCurrentIndex(newIndex)
    setIsNext(isRight)
  }

  function bottomClick (index) {
    // 点右侧时图片从右进，点左侧则相反
    setIsNext(index > currentIndex)
    setCurrentIndex(index)
  }
  return (
    <BrowserWrapper isNext={isNext} showList={showList}>
      <div className="top">
        <div className="close-btn" onClick={closeClick}>
          <IconClose />
        </div>
      </div>
      <div className="slider">
        <div className="control">
          <div className="btn left" onClick={e => controlClick(false)}>
            <IconArrowLeft height="77" width="77" />
          </div>
          <div className="btn right" onClick={e => controlClick(false)}>
            <IconArrowRight height="77" width="77" />
          </div>
        </div>
        <div className="picture">
          <SwitchTransition mode='in-out'>
            <CSSTransition
              key={pictureUrls[currentIndex]}
              classNames='pic'
              timeout={200}
            >
              <img src={pictureUrls[currentIndex]} alt="" />
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>
      <div className="preview">
        <div className="info">
          <div className="desc">
            <div className="count">
              <span>{currentIndex + 1}/{pictureUrls.length}:</span>
              <span>room apartment图片{currentIndex + 1}</span>
            </div>
            <div className='toggle' onClick={e => setShowList(!showList)}>
              <span>{showList ? '隐藏' : '显示'}照片列表</span>
              {showList ? <IconTriangleArrowBottom /> : <IconTriangleArrowTop />}
            </div>
          </div>
          <div className="list">
            <Indicator selectedIndex={currentIndex}>
              {
                pictureUrls.map((item, index) => {
                  return (
                    <div
                      className={classNames('item', { active: currentIndex === index })}
                      key={item}
                      onClick={e => bottomClick(index)}
                    >
                      <img src={item} alt="" />
                    </div>
                  )
                })
              }
            </Indicator>
          </div>
        </div>
      </div>
    </BrowserWrapper>
  )
})

PictureBrowser.propTypes = {
  pictureUrls: PropTypes.array
}

export default PictureBrowser
```

**对应样式**

```js
/*
 * @Description: 待编辑
 * @Author: SiFeng Zhai
 * @Date: 2023-02-03 09:28:47
 * @LastEditors: SiFeng Zhai
 * @LastEditTime: 2023-02-04 15:26:25
 */
import styled from "styled-components"

export const BrowserWrapper = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 999;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #333;

  .top {
    position: relative;
    height: 86px;
    background-color: #333;

    .close-btn {
      position: absolute;
      top: 15px;
      right: 25px;
      cursor: pointer;
    }
  }
  
  .slider {
    position: relative;
    display: flex;
    justify-content: center;
    flex: 1;

    .control {
      position: absolute;
      z-index: 1;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      color: #fff;

      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 83px;
        height: 100%;
        cursor: pointer;
      }
    }

    .picture {
      position: relative;
      height: 100%;
      overflow: hidden;
      width: 100%;
      max-width: 105vh;

      img {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        height: 100%;
        user-select: none;
      }

      /* 动画样式 */
      /* 进入 */
      .pic-enter {
        transform: translateX(${props => props.isNext ? '100%' : '-100%'});
        opacity: 0;
      }
      .pic-enter-active {
        transform: translate(0);
        opacity: 1;
        transition: all 200 ease;
      }
      /* 离开 */
      .pic-exit {
        opacity: 1;
      }
      .pic-exit-active {
        opacity: 0;
        transition: all 200 ease;
      }
    }
    
  }

  .preview {
    display: flex;
    justify-content: center;
    height: 100px;
    margin-top: 10px;

    .info {
      position: absolute;
      bottom: 10px;
      max-width: 105vh;
      color: #fff;

      .desc {
        display: flex;
        justify-content: space-between;

        .toggle {
          cursor: pointer;
        }
      }

      .list {
        margin-top: 3px;
        overflow: hidden;
        transition: height 300ms ease;
        height: ${props => props.showList ? '67px' : '0'};

        .item {
          margin-right: 15px;
          cursor: pointer;

          img {
            height: 67px;
            opacity: 0.5;
          }

          &.active {
            img {
              opacity: 1;
            }
          }
        }
      }
    }
  }
`
```



# 待回顾

## React.createRef()

## useImperativeHandle()

## useLocation()

## React.lazy

# style-component

```tsx
export const TreeSelectContainer = styled.div<{
  allowClear?: boolean;
  compactMode: boolean;
  isValid: boolean;
  labelPosition?: LabelPosition;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
}>`

样式规则
`
```

`styled` 函数接受一个参数，该参数是一个对象字面量，用于定义组件的样式规则；

上述几个变量是可以在css使用的props；

以下是一个示例，展示如何使用这个样式化的组件：

```tsx
import React from 'react';
import { TreeSelectContainer } from './TreeSelectContainer';

const MyComponent = () => {
  return (
    <TreeSelectContainer
      allowClear={true}
      compactMode={false}
      isValid={true}
      labelPosition="left"
      borderRadius="4px"
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      accentColor="#ff0000"
    >
      {/* 组件的内容 */}
    </TreeSelectContainer>
  );
};

export default MyComponent;
```



# 经验积累

- 修改组件逻辑前，一定要清楚组件被哪些地方引用到；

# 疑难杂症

## 某个组件被高阶组件包裹，无法访问静态属性

使用hoist-non-react-statics库

## immer

> :question:Error: [Immer] An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.

immer库报出的警告，不能在同一个 producer 函数中既修改 draft 又返回新的值

如何给style-componet的组件添加事件？

## 函数式组件中使用useState的最新状态

```tsx
const [xxx, setXxx] = useState(null);
```

某些情况下，由于React的异步更新机制，`xxx`并不是最新的状态，使用；

可以使用`setXxx` 的函数形式：

```tsx
setGData((prev) => {
    // 在这里，prev 是最新的 xxx，可以在这里处理prev，并返回新的xxx
    // 处理prev
    return 新的xxx;
});
```



## 在函数式组件外部怎么获取某个模块的state

## react中使用svg

- import导入
- 组件导入

导入 SVG 文件并在 React 组件中使用时，SVG 文件内容通常会被解析为一个字符串，而不是直接渲染为图像。这是因为在 React 中，SVG 文件通常被视为一种特殊的 XML 数据，而不是普通的图像。

**使用 `import` 导入 SVG 文件**

导入 SVG 文件并将其分配给一个变量，就像正常导入其他模块一样：

```ts
import React from 'react';
import mySvg from './my-svg-file.svg';

function MyComponent() {
  return (
    <div>
      {/* 使用导入的 SVG 文件 */}
      <img src={mySvg} alt="My SVG" />
    </div>
  );
}

export default MyComponent;

```

**将 SVG 作为组件使用：** 还可以将 SVG 文件作为 React 组件使用，而不是将其直接呈现为图像。为此，需要将 SVG 文件的内容包装在一个组件中，然后在应用程序中使用该组件。这可以更灵活地操作 SVG 内容。以下是一个示例：

```ts
javascriptCopy codeimport React from 'react';
import MySvgComponent from './MySvgComponent';

function MyComponent() {
  return (
    <div>
      {/* 使用 SVG 组件 */}
      <MySvgComponent />
    </div>
  );
}

export default MyComponent;
```

**注意：svg当组件时记得将有连接符-的属性换成驼峰**

报错信息：

```
Warning: 
```

## Warning

**报错信息：**

> Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?

这个警告是因为你试图给一个函数组件（在这个例子中是 `StyledLink`）传递一个 `ref`，但是函数组件默认是不能接收 `ref` 的。

需要使用React.forwardRef()进行ref转发

**报错信息：**

> Encountered two children with the same key, `null`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

在 React 中，当你在渲染一个列表的时候，每个列表项都需要一个唯一的 `key` 属性。这个 `key` 属性帮助 React 识别哪些项有变化、被添加、或被移除。在你的代码中，有两个或以上列表项的 `key` 属性都是 `null`

可以使用index作为备选key

**报错信息：**

> Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.

这个错误通常是因为你在组件卸载后尝试更新其状态,可以在 `useEffect` 钩子的清理函数中取消任何可能导致状态更新的操作;

另一种可能的解决方案是检查组件是否已经卸载，然后再更新状态。

> type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
>
> Check your code at index.tsx:122.



> Prop `style` did not match. Server: "null" Client: "display:"





> An error occurred during hydration. The server HTML was replaced with client content in <div>. 



> Cannot update a component (`GNavigationBarH5`) while rendering a different component (`CommonLayout`). To locate the bad setState() call inside `CommonLayout`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render



> Expected server HTML to contain a matching <div> in <div>.



## TypeError

报错信息：

```
Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.
```

对非类数组对象进行展开运算；

错误信息：

> N is not a function located in the react-dom.production.min.js

错误源：

```tsx
useEffect(() => {
    fetchCaptcha();
}, []);
const fetchCaptcha = async () => {
    const res: any = await UserApi.fetchCaptcha();
    const codeImg = window.URL.createObjectURL(res);
    setCaptchaBlob(codeImg);
};
```

原因：

>  const声明的变量、函数不会提升

修改后：

```tsx
const fetchCaptcha = async () => {
    const res: any = await UserApi.fetchCaptcha();
    const codeImg = window.URL.createObjectURL(res);
    setCaptchaBlob(codeImg);
};
useEffect(() => {
    fetchCaptcha();
}, []);
```

参考：

> https://stackoverflow.com/questions/75646528/react-router-dom-typeerror-n-is-not-a-function-on-route-reloading-page-works

## Uncaught Error

> There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.



> Hydration failed because the initial UI does not match what was rendered on the server

出现这个问题是因为在浏览器中第一次渲染期间呈现的React树(称为水合作用)与从服务器预渲染的React树之间存在不匹配

水合化是React通过附加**事件处理程序**将预渲染的HTML转换为**交互式应用**程序的过程。水合作用问题可能由几种原因引起:

- 使用了**仅浏览器**支持的API（如 `typeof window !== 'undefined` 、`localStorage`）
- 不正确的**元素嵌套**（如a元素包裹a元素等）
- 使用了**浏览器插件**，修改了html内容
- 等

参考：https://nextjs.org/docs/messages/react-hydration-error

## Uncaught SyntaxError

> Unexpected token ':' 

## 修改create-react-app默认启动端口3000

修改启动脚本

```json
"scripts": {
    "start": "set PORT=3001 && react-scripts start",
  },
```

参考链接

- https://create-react-app.dev/docs/adding-custom-environment-variables

## 自定义组件添加回车事件？

如何给一个自定义组件添加回车事件，但是该组件的 `props` 中并没有提供相应的回车事件处理函数？

## antd中Menu组件设置主题

```jsx
import React from 'react';
import { ConfigProvider, Button, Space, Input, Divider } from 'antd';

const App: React.FC = () => (
  <>
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: '#00b96b',
            algorithm: true, // 启用算法
          },
          Input: {
            colorPrimary: '#eb2f96',
            algorithm: true, // 启用算法
          }
        },
      }}
    >
      <Space>
        <div style={{ fontSize: 14 }}>开启算法：</div>
        <Input placeholder="Please Input" />
        <Button type="primary">Submit</Button>
      </Space>
    </ConfigProvider>
  </>
);

export default App;
```

## Objects are not valid as a React child

Uncaught Error: Objects are not valid as a React child (found: object with keys {}). If you meant to render a collection of children, use an array instead.

这个错误通常发生在使用 React 进行渲染时，尝试将一个对象作为 React 子元素进行渲染，而不是有效的 React 元素或组件。

以下是一个导致该错误的示例：

```js
const data = {
  name: 'John',
  age: 30,
};

function App() {
  return (
    <div>
      {data} {/* 错误的用法 */}
    </div>
  );
}
```

为了解决这个问题，你需要将对象转换为有效的 React 元素或组件，或者将对象中的特定属性提取出来进行渲染。以下是两个修正的示例：

将对象转换为字符串进行渲染：

```js
const data = {
  name: 'John',
  age: 30,
};

function App() {
  return (
    <div>
      {JSON.stringify(data)} {/* 将对象转换为字符串进行渲染 */}
    </div>
  );
}
```

提取对象属性进行渲染：

```js
const data = {
  name: 'John',
  age: 30,
};

function App() {
  return (
    <div>
      <p>Name: {data.name}</p>
      <p>Age: {data.age}</p>
    </div>
  );
}
```

## Warning: validateDOMNesting(...): <div> cannot appear as a descendant of <p>.

这个警告是由 React 提供的 DOM 结构验证机制触发的。它表示在 HTML 中，`<div>` 元素不能作为 `<p>` 元素的子元素出现。

以下是一个示例，展示了触发该警告的情况：

```html
<p>
  这是一个段落。
  <div>这是一个 div。</div>
</p>
```

以下是一个修改后的示例，修复了这个警告：

```html
<div>
  <p>这是一个段落。</p>
  <div>这是一个 div。</div>
</div>
```

## 警告

> Image with src "http://120.78.165.27:8087/upload/ttmall/img/20240305/0a078df03c6ea35519add1a0a1335cfc.png=z-250,147_f-png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.



> Do not add <script> tags using next/head (see inline <script>). Use next/script instead. 
> See more info here: https://nextjs.org/docs/messages/no-script-tags-in-head-component



> Third-party cookie will be blocked. Learn more in the Issues tab.



> The domain LOCALHOST is not authorized to show the cookie banner for domain group ID f9c46b56-5a60-4907-b929-105ac2e24049. Please add it to the domain group in the Cookiebot Manager to authorize the domain.



## React does not recognize the `data-widgetId` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `data-widgetid` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
