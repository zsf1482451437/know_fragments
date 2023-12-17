# 技术特点

**非技术方面**

- 由**facebook**来维护和更新，它是大量优秀程序员的**思想结晶**；
- **react hooks**是**开创性**的新功能；
- **vue composition api**学习**react hooks**的思想；

**技术方面**

- **声明式**---它允许只需要维护**自己的状态**，当状态改变时，React可以根据**最新的状态**去渲染UI界面
- **组件化开发**---复杂页面拆分成一个个**小组件**
- **跨平台**---Web、ReactNative（或Flutter）、ReactVR



# 三个开发依赖

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

# **hello案例**

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

# jsx

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

## 书写规范

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

## 嵌入内容

插入**变量为子元素**时

- 若是**Number、String、Array**类型时，可以直接显示；
- 若是**null、undefined、Boolean**类型时，内容为空，要想显示**需要转换**为字符串；
- **object对象类型**不能作为子元素（not valid as a react child）

插入**表达式**时

类似插值表达式

- 运算表达式
- 三元运算符
- 执行一个函数

## 绑定属性

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

## 事件绑定

**原生DOM有个监听事件，可以如何操作？**

- 获取节点，添加监听事件
- 节点上绑定onxxx

**在React中是如何操作的呢？**

- 事件命名采用**小驼峰**（camelCase）；
- 通过**{}**传入事件处理函数，这函数会在事件发生时被执行；

### **this的绑定问题**

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

### 参数传递问题

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

## 条件渲染

- 条件判断语句（逻辑较多的情况）
- 三元运算符（简单逻辑）
- 与运算符&&（条件成立渲染某个组件，不成立什么也不渲染）

## jsx转化js本质

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

## 虚拟DOM

通过React.createElement最终创建出来一个**ReactElement**对象；

一个个ReactElement对象组成**JavaScript对象树**；

这个对象树就是**虚拟DOM**；

**虚拟DOM有什么作用？**

- 可以快速进行**diff**算法，更新节点；
- 它只是js对象，渲染成什么真实节点由**平台**决定，**跨平台**；
- **声明式**编程，你只需要告诉React希望UI是什么状态，不需要直接进行DOM操作，从手动修改DOM、属性操作、事件处理中解放出来

## 协调

可以通过**ReactDOM.render**让虚拟DOM和真实DOM的同步起来，这个过程叫**协调**；



# 列表案例

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

# 计数器案例

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

# 购物车案例

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

