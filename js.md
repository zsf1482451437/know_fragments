# 常见函数

## 数组

- concat 连接

### concat

**`concat()`** 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。

等效于 `[...arr1, arr2]`

## 类型

如何给一个第三方库的类型添加属性？比如Tree组件的DataNode添加属性

```ts
type DataNodeWithExtraProperty = DataNode & {
  extraProperty: string;
};

// 示例用法
const node: DataNodeWithExtraProperty = {
  id: 1,
  name: "Node 1",
  extraProperty: "Extra Data",
};
```

