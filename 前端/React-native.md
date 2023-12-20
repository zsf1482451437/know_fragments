# 基础语法



## 简介

React Native 是一个使用 **react**  和 **应用平台的原生功能** 来构建Android和iOS应用的开源框架。通过RN，开源使用JavaScript来访问**移动平台的API**，以及使用**React组件**来描述UI的**外观**和**行为**.

Q1，组件在React Native中是如果工作的？

### 视图

在移动开发中，一个**视图**是UI的基本组成部分：屏幕上一个小矩形元素、文本、图像或响应用户输入。某些类型的视图可以包含其它视图。

### 原生组件

在Android开发中是使用kotlin或Java来编写视图；

在iOS开发中是使用Swift或Object-C来编写视图；

在RN中，则使用React组件通过**JavaScript**来调用这些视图。在运行时，RN为这些组件创建相应的Android和iOS视图。由于RN组件就是**对原生视图的封装**，因此使用React Native编写应用外观、感觉性能和其他任何原生应用一样；

我们将这些平台支持的组件称为**原生组件**；

React Native允许你为Android和iOS构建自己的native components（原生组件），RN还包括一组基本，随时可用的原生组件，这些是**核心组件**。

### 核心组件

React Native 具有许多核心组件，从表单控件到活动指示器，应有尽有。将主要使用以下核心组件：

| REACT NATIVE UI 组件 | ANDROID 原生视图 | IOS 原生视图     | WEB 标签                | 说明                                                         |
| :------------------- | :--------------- | :--------------- | :---------------------- | :----------------------------------------------------------- |
| `<View>`             | `<ViewGroup>`    | `<UIView>`       | A non-scrolling `<div>` | 一个支持使用flexbox布局、样式、一些触摸处理和无障碍性控件的容器 |
| `<Text>`             | `<TextView>`     | `<UITextView>`   | `<p>`                   | 显示、样式和嵌套文本字符串，甚至处理触摸事件                 |
| `<Image>`            | `<ImageView>`    | `<UIImageView>`  | `<img>`                 | 显示不同类型的图片                                           |
| `<ScrollView>`       | `<ScrollView>`   | `<UIScrollView>` | `<div>`                 | 一个通用的滚动容器，可以包含多个组件和视图                   |
| `<TextInput>`        | `<EditText>`     | `<UITextField>`  | `<input type="text">`   | 使用户可以输入文本                                           |

### 自定义组件

例子

```jsx
import React from 'react';
import { Text, TextInput, View } from 'react-native';

const Cat = () => {
  return (
    <View>
      <Text>Hello, I am...</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1
        }}
        defaultValue="Name me!"
      />
    </View>
  );
}

export default Cat;
```

tips：在 Android 上，常见的做法是把视图放入`LinearLayout`, `FrameLayout`或是`RelativeLayout`等布局容器中来定义子元素如何排列。在 React Native 中， `View` 使用弹性盒模型（Flexbox）来为子元素布局。详情请参考使用 **Flexbox** 布局。

**注意**：

请留意在指定`style`属性的宽高时所用到的双层括号`{{ }}`。在 JSX 中，引用 JS 值时需要使用`{}`括起来。在你需要传递非字符串值（比如数组或者数字）的时候会经常用到这种写法：`<Cat food={["fish", "kibble"]} age={2} /> `。然而我们在 JS 中定义一个对象时，本来也需要用括号括起来：`{width: 200, height: 200}`。因此要在 JSX 中传递一个 JS 对象值的时候，就必须用到两层括号：`{{width: 200, height: 200}}`。

**与react 组件关系**

**react 组件**包含以下组件：

- 原生组件
- 核心组件
- 社区组件
- 自定义原生组件

### demo

使用各种原生组件的案例

```jsx
import React from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';

const App = () => {
  return (
    <ScrollView>
      <Text>Some text</Text>
      <View>
        <Text>Some more text</Text>
        <Image
          source={{
            uri: 'https://reactnative.dev/docs/assets/p_cat2.png',
          }}
          style={{ width: 200, height: 200 }}
        />
      </View>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1
        }}
        defaultValue="You can type in me"
      />
    </ScrollView>
  );
}

export default App;
```

使用{}的案例

```jsx
import React from 'react';
import { Text } from 'react-native';

const getFullName = (firstName, secondName, thirdName) => {
  return firstName + " " + secondName + " " + thirdName;
}

const Cat = () => {
  return (
    <Text>
      Hello, I am {getFullName("Rum", "Tum", "Tugger")}!
    </Text>
  );
}

export default Cat;
```

你可以把括号`{}`想象成在 JSX 中打开了一个可以调用 JS 功能的传送门！

在 **React Native 0.71** 版本之前，JSX 语法糖的实质是调用`React.createElement`方法，所以你必须在文件头部引用`import React from 'react'`。但在 React Native 0.71 版本之后，官方引入了**新的 JSX 转换**，可以**不用**在文件头部写`import React from 'react'`。

### 新的jsx转换

在浏览器中无法直接使用 **JSX**，所以大多数 React 开发者需依靠 **Babel** 或 **TypeScript** 来**将 JSX 代码转换为 JavaScript**。许多包含预配置的工具，例如 Create React App 或 Next.js，在其内部也引入了 JSX 转换。

**新旧转换有什么不同？**

当你使用 JSX 时，编译器会将其转换为浏览器可以理解的 React 函数调用；

**旧的 JSX 转换**会把 JSX 转换为 `React.createElement(...)` 调用。

例如

```jsx
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

旧的 JSX 转换会将上述代码变成普通的 JavaScript 代码：

```js
import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

然而，这并不完美：

- 如果使用 JSX，则需在 `React` 的环境下，因为 JSX 将被编译成 `React.createElement`。
- 有一些 `React.createElement` 无法做到的 **性能优化和简化**。

为了解决这些问题，React 17 在 React 的 package 中引入了两个新入口，这些入口只会被 Babel 和 TypeScript 等编译器使用。新的 JSX 转换**不会将 JSX 转换为 `React.createElement`**，而是自动从 React 的 package 中引入新的入口函数并调用

假设你的代码是

```js
function App() {
  return <h1>Hello World</h1>;
}
```

新 JSX 转换编译后的结果：

```jsx
// 由编译器引入（禁止自己引入！）
import {jsx as _jsx} from 'react/jsx-runtime';

function App() {
  return _jsx('h1', { children: 'Hello world' });
}
```

## **搭建环境**

- node.js
- react native cli
- 模拟器或设备

# 核心组件

## 处理用户输入

### TextInput

**TextInput**是一个允许用户输入文本的**基础组件**。

- onChangeText属性，接收函数，该函数在文本变化时调用
- onSubmitEditing属性，接收函数，文本被提交后调用

案例：实时将其以单词为单位翻译为另一种文字。

```jsx
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

const PizzaTranslator = () => {
  const [text, setText] = useState('');
  return (
    <View style={{padding: 10}}>
      <TextInput
        style={{height: 40}}
        placeholder="Type here to translate!"
        onChangeText={text => setText(text)}
        defaultValue={text}
      />
      <Text style={{padding: 10, fontSize: 42}}>
        {text.split(' ').map((word) => word && '🍕').join(' ')}
      </Text>
    </View>
  );
}

export default PizzaTranslator;
```

在上面的例子里，我们把`text`保存到 state 中，因为它会随着时间变化；

对于 `text.split(' ').map((word) => word && '🍕').join(' ')`，**split(' ')**将文本**字符串**以空格进行分割，将字符串转化为单词**数组**；**map**遍历每个单词，示如果单词存在（不为假值），则返回一个🍕表情符号，否则返回原单词。这意味着每个单词都将被替换为🍕；**join(' ')**使用空格将处理后的单词数组拼接起来，形成一个新的字符串

总体思路：旧字符串--->单词数组---->替换（新数组）---->新字符串

## 滚动视图

### scrollView

是一个通用的可滚动的容器，可以在其中放入多个组件和视图

- horizontal属性，控制滚动方向，垂直或水平
- pagingEnabled属性，允许使用滑动手势对视图进行分页

**案例**

```jsx
import React from 'react';
import { Image, ScrollView, Text } from 'react-native';

const logo = {
  uri: 'https://reactnative.dev/img/tiny_logo.png',
  width: 64,
  height: 64
};

export default App = () => (
  <ScrollView>
    <Text style={{ fontSize: 96 }}>Scroll me plz</Text>
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Text style={{ fontSize: 96 }}>If you like</Text>
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Text style={{ fontSize: 96 }}>Scrolling down</Text>
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Text style={{ fontSize: 96 }}>What's the best</Text>
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Text style={{ fontSize: 96 }}>Framework around?</Text>
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Image source={logo} />
    <Text style={{ fontSize: 80 }}>React Native</Text>
  </ScrollView>
);
```

#### Android

ScrollView可以通过使用 **pagingEnabled** 属性来允许使用滑动手势对视图进行分页，在Android上可以利用 **ViewPager** 组件水平滑动视图

#### ios

在 iOS 上包含单个子元素的 ScrollViews 可以允许用户对内容进行**缩放**，通过设置`maximumZoomScale`和`minimumZoomScale`两者的属性, 用户能够利用手势来放大或缩小。

ScrollView适合用来显示**数量不多**的滚动元素。ScrollView中所有的组件都会被渲染，哪怕有些组件因为太长被挤出了屏幕外；如果需要**显示较长**的滚动列表，那么应该使用功能差不多但性能更好的**FlatList**组件。

### 长列表

#### FlatList

用于显示一个**垂直**的滚动列表，其中的元素之间结构近似而仅仅数据不同。

FlatList更适于长列表数据，且元素个数可以**增删**。和ScrollView不同的是，FlatList并不立即渲染所有元素，而是优先渲染屏幕上可见的元素。

必须的两个属性：

- data
- renderItem

案例

```jsx
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

const FlatListBasics = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={[
          {key: 'Devin'},
          {key: 'Dan'},
          {key: 'Dominic'},
          {key: 'Jackson'},
          {key: 'James'},
          {key: 'Joel'},
          {key: 'John'},
          {key: 'Jillian'},
          {key: 'Jimmy'},
          {key: 'Julie'},
        ]}
        renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
      />
    </View>
  );
}

export default FlatListBasics;
```

#### SectionList

如果要渲染的是一组需要分组的数据，也许还带有分组标签的，那么`SectionList`将是个不错的选择

```jsx
import React from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})

const SectionListBasics = () => {
    return (
      <View style={styles.container}>
        <SectionList
          sections={[
            {title: 'D', data: ['Devin', 'Dan', 'Dominic']},
            {title: 'J', data: ['Jackson', 'James', 'Jillian', 'Jimmy', 'Joel', 'John', 'Julie']},
          ]}
          renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
}

export default SectionListBasics;
```

