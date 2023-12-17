React Router6.x发生了较大的变化，目前它已经非常稳定，可以放心使用；

# 基本使用

## 安装

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

## 包裹组件

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

## 路由映射配置

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

## 切换路由

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

## **not found**页面

在映射关系里面，当所有路径都匹配不到时，使用**通配符**，然后渲染出**notfound**页面；

```jsx
<Routes>
   <Route path='/login' element={<Login />}></Route>
   <Route path='/home' element={<Home />}></Route>
   <Route path='*' element={<NotFound />}></Route>
 </Routes>
```



# 路由重定向

**Navigate**用于**路由重定向**，当这个组件出现时，就会执行跳转到对应的**to**的路径中；

## **案例**

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

## 常见应用场景

- **首次进入**网页重定向

**首次进入网页重定向**

```jsx
<Routes>
  <Route path='/login' element={<Navigate to='/home'/>}></Route>
  <Route path='/home' element={<Home />}></Route>
</Routes>
```

# 路由嵌套

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

## 手动路由跳转

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

## 封装withRouter

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

# 路由传参

react-router-dom提供了一个hook函数，**useParams**，可以获取跳转参数；

- 方式一，**动态路由**，在映射关系那拼接上  `:name`；
- 方式二，**查询字符串**

## 动态路由

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

## 查询字符串

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

# 配置文件

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

## 懒加载

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

