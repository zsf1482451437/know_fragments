# 动态增删

## 结构

```html
<el-tag
  :key="tag"
  v-for="tag in dynamicTags"
  closable
  :disable-transitions="false"
  @close="handleClose(tag)">
  {{tag}}
</el-tag>
<el-input
  class="input-new-tag"
  v-if="inputVisible"
  v-model="inputValue"
  ref="saveTagInput"
  size="small"
  @keyup.enter.native="handleInputConfirm"
  @blur="handleInputConfirm">
</el-input>
<el-button v-else size="small" @click="showInput">+ 添加具体要求</el-button>
```

**ref**

ref 加在普通元素上，用this.$refs.name 获取到的是dom元素

**@keyup.enter.native**

@是v-on的语法糖，vue规定v-on要想监听原生事件（比如这个回车按下后）需要添加`.native`修饰符

## 数据

```js
data () {
  return {
    dynamicTags: ['标签一', '标签二', '标签三'],
    inputVisible: false,
    inputValue: ''
  }
}
```

## 方法

```js
methods: {
  // 删除当前具体要求标签
  handleClose (tag) {
    this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
  },
  // 生成新标签并聚焦
  showInput () {
    this.inputVisible = true
    this.$nextTick(_ => {
      this.$refs.saveTagInput.$refs.input.focus()
    })
  },
  // 保存用户输入
  handleInputConfirm () {
    const inputValue = this.inputValue
    if (inputValue) {
      this.reqTags.push(inputValue)
    }
    this.inputVisible = false
    this.inputValue = ''
  }
}
```

### **indexOf()**方法

返回可以在数组中找到**给定元素**的**第一个索引**，如果**不存在则返回 -1**

### splice()方法

#### 两个参数时：

第一个参数表示开始的位置（start）

第二参数表示截取的数量（deleteCount）

如果第二个参数为0，则表示不截取，返回的空数组，原来的数组不变

```js
var arr = [2,4,6,7,8,9]; 
console.log(arr);//[2,4,6,7,8,9]
var n = arr.splice(2,3);//表示从下标位置为2开始截取3个数
console.log(n);//[6, 7, 8]
```

所以`this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)`表示删去当前点击下标的元素

### this.$nextTick

Vue是异步执行dom更新的(要是每一次修改dom都更新，那样性能会很差)，当有dom被修改之后，vue会把它放到一个特定队列中，vue会在某个时间点，更新所有的dom；当同一个dom被修改多次，只会被推送到队列一次。这种缓冲行为可以有效的去掉重复数据造成的不必要的计算和dom操作。

当更新一个dom的数据时（由于vue异步更新dom，还不能拿到该dom,需要等待dom更新），要想获取到这个dom的数据

**需要用到this.$nextTick(callback)，等到下一次更新dom**

**当新增一个标签时，此时dom树上并没有更新出el-input（下一次更新才有），要想通过this.$refs.saveTagInput拿到el-input，需要通过this.$nextTick把那些操作放到callback函数中，等到下一次更新dom后才能执行那些操作**

**因此，可以把this.$nextTick(callback)理解成一个定时器，等到下一次更新dom后再执行里面的回调函数**

### 箭头函数参数下划线_

当箭头函数不需要参数时可以用**下划线_**代替**括号()**

### this.$refs.saveTagInput.$refs.input.focus()

this.$refs.saveTagInput拿到el-input元素

el-input是input封装过的父组件，所以el-input.$refs.input可以拿到input的方法focus()

# 组件通信

## 没关系的组件间通信

假如组件A和组件B是兄弟组件

组件A需要给组件B发送数据data

### 1.建立一个公用模块bus.js

```js
import Vue from 'vue'
const Event = new Vue()
export default Event
```

### 2.组件A发送

```js
<script>
import bus from 'xxx/bus'
export default {
  ...
  data () {
    return {
    	data: A
    }
  }
  methods: {
    sendMessage () {
      // 给GradReqBody发送信息
      bus.$emit('data-A', this.data)
    }
  }
}
</script>
```

### 3.组件B接收

```js
<script>
import bus from 'xxx/bus'

export default {
  ...
  mounted () {
    // 接收A传来的信息
    bus.$on('data-A', value => {
      console.log(value)// A
    })
  }
}
</script>
```

也可以在main.js里面全局挂载$bus

```js
Vue.protoType.$bus = new Vue()
```



# 引入echarts

## 获取

`npm install echarts --save`

## 引入

### 按需引入

```js
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core';
// 引入柱状图图表，图表后缀都为 Chart
import { CustomChart } from 'echarts/charts';
// 引入标题，组件后缀都为 Component
import {
  TitleComponent,
} from 'echarts/components';
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  CustomChart
  TitleComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// 接下来的使用就跟之前一样，初始化图表，设置配置项
var myChart = echarts.init(document.getElementById('main'));
myChart.setOption({
  // ...
});
```

### 全部引入

```js
import * as echarts from 'echarts';

// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));
// 绘制图表
myChart.setOption({
  title: {
    text: 'ECharts 入门示例'
  },
  tooltip: {},
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
});
```

