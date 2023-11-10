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

## 如何覆盖掉用户代理样式表中输入框自动填充后的样式