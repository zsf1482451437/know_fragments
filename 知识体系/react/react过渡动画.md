过渡动画增加用户体验；

可以通过**原生css**实现；

不过React社区也提供了**react-transition-group**用来完成过渡动画；

# react-transition-group

主要是 **入场** 和 **离场** 动画

安装

```
npm install react-transition-group
```

## 四个组件

- Transition（不一定要结合css）
- CSSTransition（结合css）
- SwitchTransition（两个组件显示和隐藏**切换**时使用）
- TransitionGroup（将**多个动画**组件包裹其中，一般用于**列表**中的动画）

### CSSTransition

CSSTransition是基于Transition组件构建的；

CSSTransition执行过程中有**三个状态**：appear（第一次加载）、enter、exit；

**in**传Boolean值，**必传timeout**，单位毫秒，动画持续时间，**必传unmountOnExit**，结束动画时是否卸载，布尔值；

如果想要**第一次加载**时也希望有动画，可以给CSSTransition组件加appear属性，布尔值；

#### 执行过程

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

#### 钩子函数

主要为了检测动画执行过程，来完成一些js操作

- onEnter：在进入动画之前被触发
- onEntering： 在应用进入动画时被触发
- onEntered：在应用进入动画结束后被触发

### SwitchTransition

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

### TransitionGroup

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

