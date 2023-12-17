# 学习目标：



# 1.项目概述

## 基本业务概述

根据不同的应用场景，电商系统一般提供了PC端、移动APP、微信小程序等多种终端访问方式



## 后台管理系统的功能



## 开发模式

前后端分离

## 技术选型

### 前端项目技术栈

- vue
- vue-router
- element-UI 前端UI图形库
- axios 发起网络处理请求
- echarts 绘制图形报表

### 后端项目技术栈

- node.js
- express
- jwt 状态保持 模拟session登录记录功能
- mysql
- sequelize 操作数据库的框架



# 2.项目初始化

## 前端项目初始化步骤

1. 安装vue脚手架

2. 通过vue脚手架创建项目

3. 配置vue路由

4. 配置element-UI组件库

5. 配置axios库

6. 初始化git远程仓库

7. 将本地项目托管到github或码云中

## 后台项目的环境安装配置

1. 安装MySQL数据库
2. 安装Node.js环境
3. 配置项目相关信息
4. 启动项目
5. 使用Postman测试后台项目是否正常

# 3.登陆/退出功能

## 登陆业务流程

1. 在登陆页面输入用户和密码
2. 调用后台接口进行验证
3. 通过验证之后，根据后台的响应状态跳转到项目主页

## 登陆业务相关技术点

- http是无状态的
- 通过cookies在客户端记录状态
- 通过session在服务器记录状态
- 通过token方式维持状态

前端和后台接口不存在跨域问题时可用cookies和session

存在跨域问题时用token

## 登陆-token原理分析

![image-20210526201210965](vue电商项目.assets/image-20210526201210965-1622031132025.png)

## 登陆功能实现

### 登陆页面的布局

![image-20210526201440176](vue电商项目.assets/image-20210526201440176-1622031294977.png)

通过Element-UI组件实现布局

- el-form
- el-form-item
- el-input
- el-button
- 字体图标

#### 删除不必要的组件

打开项目的src目录，点击

##### main.js文件（入口文件）

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

Vue.config.productionTip = false


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

```

再打开

##### App.vue(根组件)

将根组件的内容进行操作梳理(template中留下根节点，script中留下默认导出，去掉组件，style中去掉所有样式

```js
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
</style>
```

再打开

##### router.js(路由)

将routes数组中的路由规则清除，然后将views删除，将components中的helloworld.vue删除

```js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    
  ]
})
```

#### 创建登陆组件

在components文件夹中

##### 新建Login.vue组件

添加template，script，style标签,style标签中的scoped可以防止组件之间的样式冲突，没有scoped则样式是全局的

```js
<template>
    <div class="login_container">
        
    </div>
</template>

<script>
export default {
  
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b5b6b;
  height: 100%;
}

</style>
```

##### 在router.js中

导入组件并设置规则

```js
import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login }
  ]
})
```

##### 在App.vue中加路由占位符

```js
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
</style>
```

#### 登陆组件布局

然后需要添加公共样式，在assets文件夹下面添加css文件夹

##### 创建global.css文件

添加全局样式

```js
/* 全局样式表 */
html,body,#app{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0; 
}
```

##### 在main.js导入全局样式

```js
// 导入全局样式表
import './assets/css/global.css'
```

在components文件下的

##### Login.vue中

```js
//结构
<template>
  <div class="login_container">
    <div class="login_box">
  
    </div>
  </div>
</template>

//逻辑

<script>
export default {

}
</script>

//样式
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  }
}
</style>
```

##### 效果

![image-20210528201623779](vue电商项目.assets/image-20210528201623779-1622204184686.png)

#### 登陆组件头部布局

在components文件下的

##### Login.vue中

```js
//结构
<template>
  <div class="login_container">
    <div class="login_box">
        <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
    </div>
  </div>
</template>

//逻辑

<script>
export default {

}
</script>

//样式
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  }
   .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
}
</style>
```

##### 效果

![image-20210528202650776](vue电商项目.assets/image-20210528202650776-1622204812053.png)

#### 登陆组件表单布局

在plugins文件下的

##### element.js

```js
import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
```

在components文件下的

##### Login.vue中

```js
//结构
<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
	  <!-- 登录表单区域 -->
      <el-form :model="loginForm" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary">登陆</el-button>
          <el-button type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

//逻辑

<script>
export default {

}
</script>

//样式
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  }
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
```

##### 效果

![image-20210528203927954](vue电商项目.assets/image-20210528203927954-1622205569176.png)

#### 登陆组件表单小组件

##### 在main.js中导入字体图标

```js
import './assets/fonts/iconfont.css'
```

在components文件下的

##### Login.vue中的

el-input组件添加prefix-icon属性和值，一定要有iconfont前缀



```js
 <el-input prefix-icon="iconfont icon-user"></el-input>
```

```js
<el-input prefix-icon="iconfont icon-3702mima"></el-input>
```

##### 效果

![image-20210528205140166](vue电商项目.assets/image-20210528205140166-1622206301438.png)

#### 登陆组件的数据绑定

在components文件下的

##### Login.vue中的

el-form组件

添加:model="loginForm"属性

```js
 <el-form :model="loginForm" label-width="0px" class="login_form">
```

在el-input组件

添加属性v-model="loginForm.username"

```js
<el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
```

添加属性v-model="loginForm.password"

```js
<el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
```

在Login.vue逻辑部分

添加data(){}

```js
<script>
export default {
  data() {
    return {
      // 这是登陆表单的数据绑定对象
      loginForm: {
        username: 'zs',
        password: '123'
      }
    }
  }
}
</script>
```

##### 效果

![image-20210528210028707](vue电商项目.assets/image-20210528210028707-1622206829834.png)



# 主页布局

# 用户管理模块

# 权限管理模块

# 分类管理模块

# 参数管理模块

# 商品管理模块

# 订单管理模块

# 数据统计模块