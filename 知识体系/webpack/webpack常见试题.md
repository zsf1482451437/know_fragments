# Loader和Plugin 有什么区别

Webpack将**一切文件视为模块**，但是webpack原生是只能解析**js文件**，如果想将其他文件也打包的话，就会用到`loader`。

Loader的作用是让webpack拥有了**加载和解析非JavaScript文件的能力。**

Plugin可以**扩展webpack的功能**，让webpack具有更多的灵活性。 在 Webpack 运行的生命周期中会**广播出许多事件**，**Plugin 可以监听这些事件**，在合适的时机通过 Webpack 提供的 API **改变输出结果。**