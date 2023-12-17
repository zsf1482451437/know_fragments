css的设计并不是为组件化而生的，目前**组件化框架**中都需要一种合适的**css解决方案**；

在组件化中选择合适的css解决方案应该符合以下条件：

- 局部css：具备**独立作用域**，不会污染其它组件样式；
- **动态css**：可以获取当前组件的一些状态，根据状态的变化生成不同的css样式（某些值是来自**js的变量**）；
- 支持所有的**css特性**：伪类、动画、媒体查询等；
- 编写起来符合**css风格**特点

# css解决方案

## 内联样式

- style接收**小驼峰**命名的**js对象**，而不是字符串；
- 也可以引用**state**中的状态来设置相关样式；

### 优点

- 样式之间不会冲突；
- 可以动态获取当前state中的状态；

### 缺点

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

## 普通的css

- 通常会编写到一个**单独的文件**，之后再进行引入；
- 但是这样的css属于**全局css，**样式之间会相互影响；
- 这种编写方式最大的问题是样式之间会**相互层叠**；

## css modules

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

### 缺点

- 类名**不能使用连接符**（比如.home-title）,这在js中是不识别的；
- 所有的className都必须使用（**style.className**）的形式来编写；
- **不方便动态修改样式**，依然**需要使用内联样式**的方式；

### React项目中使用less

想在React项目中使用less，得安装less-loader并进行相关的配置；

#### 安装

而webpack配置在React项目中是隐藏的，如果想改可以安装一个工具**craco**（将webpack源码暴露出来修改不推荐）；

```
npm install @craco/craco@alpha
```

如果安装出现脚手架版本不兼容，可以去github上的issue部分，查看人家怎么解决的；

查到的资料是安装alpha的版本

```
npm install @craco/craco
```

#### 修改命令

在**package.json**里的scripts修改运行项目的命令，将**react-scripts都替换成craco**，不再是react-scripts帮我吗启动项目了，交给carco；

#### 安装craco-less

使用craco-less代替less-loader

```
npm install craco-less
```



#### 新建文件

新建一个叫**craco.config.js**的文件，里面的配置会合并到webpack配置中；

## CSS in JS

css in js模式是一种将**样式也写入JavaScript中**的方式，并且可以方便使用JavaScript的**状态**；

css in js 通过JavaScript来为css赋予一些能力，包括**类似css预处理器**一样的**样式嵌套**、**函数定义**、**逻辑复用**、**动态修改状态**等等；

虽然css预处理器也具备某些能力，但**获取动态状态**依然是不好处理的点；

所以，目前可以说css-in-js是React编写css**最为受欢迎**的一种解决方案；

目前比较流行的css-in-js的库有哪些？

- style-components
- emotion
- glamorous

### styled-components

安装

```
npm install styled-components
```

#### 基本使用

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

#### 引用js状态

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

#### 共享状态

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

#### 样式继承

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

# 动态添加class

在Vue中添加class很简单，你可以

- 传入一个对象
- 传入一个数组
- 甚至是对象数组混合使用

而在React中添加class，可以通过一下**逻辑判断**来添加某些class（适合添加简单的class）；

但要是class复杂起来，这添加起来变得复杂；

这是就可以使用一个叫**classnames**的库了；

## classnames

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