# 样式积累

## 子元素写>与不写的区别

```css
li>a
```

表示li的直接子元素a

```css
li a
```

表示li的**间距**子元素（有可能是子孙）

## flex控制顺序

**order**，数字越小越靠前；

## 遮罩层

```html
<div class="container">
  <!-- 其他内容 -->
  <div class="overlay"></div>
</div>
```



```css
/* 初始时，遮罩层不可见 */
.overlay {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
}

/* 当包含遮罩层的容器被悬停时，显示遮罩层 */
.container:hover .overlay {
    display: block;
}

/* 假设要悬停的元素位于一个包含遮罩层的容器中 */
.container {
    position: relative;
    width: 300px;
    height: 200px;
    background-color: #ccc;
}
```



```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    
  </style>
</head>
<body>



</body>
</html>

```



## hint效果

```css
.hint {
  background-color: #f5f7f9;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
  border-left: 4px solid #346ddb;
  padding: 20px;
  margin: 10px 0;
}
```

使用

```html
<div class="hint" markdown="1">

</div>
```

## 白天/黑夜模式切换，匹配内容不同样式

**方案一**

两种文件，监听切换事件，切换link的href

假设是react

```jsx
import React, { useState } from 'react';

const ExamplePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleModeChange = () => {
    setIsDarkMode(!isDarkMode);
    const themeLink = document.getElementById('theme-link');
    themeLink.href = isDarkMode ? '/path/to/light.css' : '/path/to/dark.css';
  };

  return (
    <div>
      <h1>Example Page</h1>
      <button onClick={handleModeChange}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </div>
  );
};

export default ExamplePage;
```

使用了 React 的 `useState` 钩子来管理当前的模式状态，初始状态为白天模式（`isDarkMode` 为 `false`）；

`handleModeChange` 函数会在按钮点击时触发，它会根据当前模式状态切换到相应的模式，并更新样式文件的链接。

接下来，你需要在你的项目中的某个布局文件（比如说是 `src/theme/Layout.js`）中添加以下代码，以引入样式文件：

```jsx
import React from 'react';

const Layout = () => {
  return (
    <div>
      <head>
        <link id="theme-link" rel="stylesheet" href="/path/to/light.css" />
      </head>
      {/* 布局的其他内容 */}
    </div>
  );
};

export default Layout;
```

在上述代码中，我们在 `<head>` 元素中添加了一个带有 `id` 为 `"theme-link"` 的链接标签，初始时它的 `href` 属性指向白天模式的样式文件。

现在，当你在浏览器中打开该示例页面时，你会看到一个标题和一个切换模式的按钮。点击按钮时，样式文件的链接将会根据当前模式状态切换。

需要将 `/path/to/light.css` 和 `/path/to/dark.css` 替换为实际的样式文件路径。

**方案二**

使用html的属性切换（data-theme）

这是light模式下

```css
.hint {
  background-color: #f5f7f9;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
  border-left: 4px solid #346ddb;
  padding: 20px;
  margin: 10px 0;
}
```

这是dark模式

```
html[data-theme='dark'] .hint {
  background-color: #a1bba8;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
  border-left: 4px solid #346ddb;
  padding: 20px;
  margin: 10px 0;
}
```

## 修改滚动条背景

```css
::-webkit-scrollbar-track: transparent;
```

## 样式文件

- 如果在元素里找不到应该出现的类，那很有可能没有导入样式文件；

## 背景图

1. **JPEG（.jpg）**:
   - 适用于照片和图像，特别是具有丰富颜色和渐变的图像。
   - 支持压缩，可以减小文件大小，但可能会降低图像质量。
   - 不支持透明度。适用于不需要透明背景的情况。
2. **PNG（.png）**:
   - 适用于具有透明度（透明背景）需求的图像，如图标和图形。
   - 支持无损压缩，图像质量不会受损。
   - 文件大小通常较大，对于复杂的图像可能不是最佳选择。
3. **GIF（.gif）**:
   - 适用于简单的动画和图像，如小图标和动画徽标。
   - 支持透明度和动画。
   - 文件大小相对较小，但色彩深度有限。
4. **WebP（.webp）**:
   - 一种现代的图像格式，支持无损和有损压缩。
   - 通常提供较小的文件大小和较好的图像质量。
   - 适用于网页性能优化。
5. **SVG（.svg）**:
   - 适用于矢量图形，如图标和简单的图形，而不是照片。
   - 可无限缩放而不失真，因为它们是基于矢量的。
   - 通常是文本文件，因此文件大小较小。

当选择背景图像格式时，考虑图像的内容、质量需求和性能要求。对于照片背景，JPEG通常是一个不错的选择。对于需要透明度的图像，PNG可能更合适。对于图标和图形，SVG或WebP可能是更好的选择，以提供较小的文件大小和高质量。根据您的具体需求，您还可以选择其他格式。

# 动画

## 使用json渲染动画（react项目）

1.安装lottie库

```
npm install lottie-react
```

2.使用

```tsx
import React from 'react';
import Lottie from 'lottie-react';

function MyLottieAnimation() {
  return (
    <div>
      <Lottie
        options={{
          animationData: yourAnimationData, // JSON动画数据
          loop: true, // 是否循环播放
          autoplay: true, // 是否自动播放
        }}
      />
    </div>
  );
}

export default MyLottieAnimation;
```



# 疑难杂症

## img不受盒子高度拉伸？

```css
{
    object-fit: contain;
}
```

保持图像的纵横比，确保整个图像都可见，图像将被**缩放**以适应容器。

而cover，保持图像的纵横比，尽量填充整个容器，图像将在垂直或水平方向上被**裁剪**。

## 如何覆盖掉用户代理样式表中输入框自动填充后的样式