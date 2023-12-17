- 

# 圣杯/双飞翼布局

圣杯布局和双飞翼布局解决的问题是一样的，**中间栏**要在放在**标准流**前面以优先渲染。

而**双飞翼**是圣杯的**优化版**

## 需求

- 3列布局
- 两侧定宽，中间自适应

**结构**

```html
<div class="main">
    <div class="center">中间自适应</div>
    <div class="left">左列定宽</div>
    <div class="right">右列定宽</div>
  </div>
```

**样式**

```css
.center {
      float: left;
      width: 100%;
      height: 500px;
      background: lightgray;
    }
    .left {
      float: left;
      width: 200px;
      height: 500px;
      background: lightpink;
    }
    .right {
      float: left;
      width: 300px;
      height: 500px;
      background: lightgreen; 
    }
```

由于中间栏占满父容器，所以左右两栏换行排

![image-20220314164928756](../../知识体系/秋招记录/面试准备.assets/image-20220314164928756.png)

**如何使他们同一行并排？**

```css
.left {
      margin-left: -100%;
}
.right {
      margin-left: -300px;
}
```

参考文章https://www.cnblogs.com/2050/archive/2012/08/13/2636467.html，具体原理后面再看~

**问题**

“中间自适应”几个字不见了，这是因为 left 和 right 已经盖在了 center 上边。如果 center 中有更多内容，依然将无法显示。

## 圣杯布局

**float+margin负值+父元素margin+相对定位**

1、给三列的父元素（main）， 加上 左margin 和 右margin（也可以使用 padding），将三列挤到中间来，这样左边和右边就会预留出位置。

```css
.main { 
    margin-left: 200px;
    margin-right: 300px;
}
```

2、给 left 和 right 设置相对定位，将它们移动到相应的位置。

```css
.left {
    position: relative;
    left: -200px;
}
.right {
    position: relative;
    right: -300px;
}
```

这时，你可以放大或缩小，看看中间栏是否自适应

![image-20220314123222306](../../知识体系/秋招记录/面试准备.assets/image-20220314123222306.png)

## 双飞翼

**float+margin负值+子元素margin**

1、给 center 加一个子元素 inner。

```css
<div class="center">
     <div class="inner">中间自适应</div>
</div>
```

2、给 inner 设置 左margin 和 右 margin，将 inner 挤到中间显示。

```css
.inner {
      /* 为了突出显示 inner 元素，给它加上了 height 和 border 以及 上margin */
      height: 300px;
      border: 1px solid red;
      margin-top: 10px;

      /* 以下是设置的 margin */
      margin-left: 200px;
      margin-right: 300px;
}
```

## 总结

**圣杯布局**和**双飞翼布局**解决问题的方案在前一半是相同的：**三栏全部float浮动**，但左右两栏加上**负margin**让其跟中间栏div**并排**，以形成**三栏布局**

不同在于解决”**中间栏div内容不被遮挡**“问题的思路不一样：

1）**圣杯布局**为了中间div内容不被遮挡，将**父容器**设置了左右margin-left和margin-right后，将左右两个div用**相对定位**position: relative并分别配合right和left属性，以便**左右两栏div移动后不遮挡**中间div；

2）**双飞翼布局**为了中间div内容不被遮挡，直接在中间div内部**创建子div**用于放置内容，在子div里用**margin-left和margin-right**为左右两栏div留出位置。

# flex布局

## 两个重要的概念

- flex container（开启flex的元素）
- flex items（直接子元素）

## 开启

`display: flex;`

## flex-container上的css属性

| 属性-值                                           | 默认       |            |            |                |              |              |
| ------------------------------------------------- | ---------- | ---------- | ---------- | -------------- | ------------ | ------------ |
| flex-derection（决定主轴）                        | row        | row-revers | column     | column-reverse |              |              |
| justify-content（决定item在主轴上的对齐方式）     | flex-start | flex-end   | center     | space-between  | space-evenly | space-around |
| align-content（决定多行item在交叉轴上的对齐方式） | 类似       |            |            |                |              |              |
| align-items（决定item在交叉轴上的对齐方式）       | normal     | stretch    | flex-start | flex-end       | **center**   | **baseline** |
| flex-wrap                                         | no-wrap    | wrap       |            |                |              |              |

## flex items上的css属性

### flex

**是flex-grow || flex-shrink || flex-basis的简写**

### flex-grow

决定了flex items如何拓展

- 默认值 0
- 当**flex container**在**main axis**方向上有**剩余size**时，**flex-grow**属性才会**有效**
- flex-grow总和**大于等于1**时，等比拓展（加上乘以size的值，用完剩余size）；**小于1**时，各自乘以小数（有剩余size）

### flex-shrink

决定了flex items如何收缩

- 默认 1
- 当flex items在**main axis**方向上超过了**flex container**的**size**时（oversize），**flex-grow**属性才会**有效**
- 当flex items 的**flex-shrink总和大于1时，**等比收缩（减去乘以oversize的值）；小于1时就用得少，因为还是溢出

### flex-basis

决定**flex items**在**main axis**主轴上的**base  size**

- auto 自身宽/高
- 具体值

**决定flex items在main axis主轴上的base  size的优先级**

- max-size...
- flex-base
- size
- 内容本身的size

### order

决定flex items的**排布顺序**，值越**小**，排越**前**

- **默认是0**

### flex实现圣杯布局

**思路**

1. **header、content、footer**垂直flex，其中header、footer高度固定，**content高度flex:1**（**高度自适应**）
2. content里面的**nav、main、aside**水平flex，其中nav、aside宽度固定，flex的收缩和拓展属性设为0，**main的宽度flex:1**（**宽度自适应**）
3. 最后别忘了nav的f**lex-order:-1**，将它**排在main前面**



**html**

```html
<header>
    header
  </header>
  <div class="content">
    <main>main</main>
    <nav>nav</nav>
    <aside>aside</aside>
  </div>
  <footer>
    footer
  </footer>
```

**css**

```css
html,
    body {
      display: flex;
      flex-direction: column;
      min-height: 600px;
      height: 100%;
      font-size: 28px;
      font-weight: bolder;
    }
    header,
    footer {
      height: 150px;
      background-color: #666;
      /* 子元素水平、垂直居中三件套 */
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .content {
      flex: 1; /* 高度自适应 */
      display: flex;
    }
    nav,
    aside {
      background-color: #eb6f43;
      flex: 0 0 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    main {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1; /* 宽度自适应 */
      background-color: #d6d6d6;
    }
    nav {
      order: -1; /* 调整顺序在main前面 */
    }
```



# 定位



# 清除浮动

**为什么要清除浮动？**

真实开发**父元素高度**是**不确定**的（auto），但是**浮动**会使子元素**脱标**，**不再**向父元素**汇报高度**，这时父元素**计算总高度**时，就**不会计算浮动子元素**的高度，导致了**高度坍塌**问题

而解决父元素高度坍塌问题的过程，叫**清除浮动**

**如何清除浮动?**（推荐方案）

**伪元素**

```css
.clear-fix::after {
    content: "";
    clear: both;
    display: block;
}
```

给需要的元素加上**clear-fix类**即可

# margin负值

# 盒子模型

盒模型分两种：**标准盒模型**、**IE盒模型**（替代盒模型、怪异盒模型）

标准盒模型：如果你给盒子设置`width`和`height`，设置的是`content`，盒子的实际宽高是`border+padding+content`

IE盒模型：如果给盒子设置`width`和`height`，设置的是 `border+padding+content`

**默认**使用的是**标准盒模型**，如果想使用IE盒模型，使用 `box-sizing: border-box` 切换

# 常见的水平和垂直居中方式有哪些？

**方式一，flex布局**

```html
<div class="father">
    <div class="son"></div>
  </div>
```

```css
.father {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100px;
      height: 100px;
      background-color: skyblue;
    }
    .son {
      width: 50px;
      height: 50px;
      background-color: grey;
    }
```

**方式二，父相子绝+translate**

先将元素的**左上角**定位到父元素中间，然后再将子元素的**中心点**移动到父元素的中间

```html
<div class="father">
    <div class="son"></div>
  </div>
```

```css
.father {
      position: relative;
      width: 100px;
      height: 100px;
      background-color: skyblue;
    }
    .son {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      background-color: grey;
    }
```



# 哪些属性不可以继承

display：none（而visiblity是可继承的）

opacity：0；



# 属性百分比问题

background-size的百分比相对于谁

相对于父元素相关：
position:absolute的top/bottom/right/left
width和height
margin和padding
font-size
text-indent

相对于自身相关：
position:relative的top/bottom/right/left
border-radius
**background-size**（自身宽度）
background-position（自身宽高 - 背景图片宽高）
transform:translate()
transform-origin
zoom
line-height