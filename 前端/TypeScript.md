## 关键字

### Omit

省略类型中某个属性

> 场景：想复用现有的某个类型，但是其中一个属性不想要

```ts
type OriginalType = {
  property1: string;
  property2: number;
  unwantedProperty: boolean;
};

// 创建一个省略 unwantedProperty 的新类型
type NewType = Omit<OriginalType, 'unwantedProperty'>;

// 现在 NewType 就是省略 unwantedProperty 的类型
```

## 函数

### 参数数量不一致

```ts
// 定义
export const getShouldFocusPropertyPath = createSelector(
  [
    getFocusablePropertyPaneField,
    (_state: AppState, key: string | undefined) => key,
  ],
  (focusableField: string | undefined, key: string | undefined): boolean => {
    return !!(key && focusableField === key);
  },
);
```

```ts
// 调用
getShouldFocusPropertyPath(
    state,
    dataTreePath,
    hasDispatchedPropertyFocus.current,
),
```

提示：应有 2 个参数，但获得 3 个。

## 泛型

```tsx
class SingleSelectTreeWidget extends BaseWidget<
SingleSelectTreeWidgetProps,
WidgetState>
```

这段代码是 TypeScript 中的类定义，它定义了一个名为 `SingleSelectTreeWidget` 的类，该类继承自 `BaseWidget` 并接受两个**泛型参数：**`SingleSelectTreeWidgetProps` 和 `WidgetState`;

- `BaseWidget`：这是 `SingleSelectTreeWidget` 类的父类或基类，通过 `extends` 关键字将其作为父类进行继承。继承允许子类继承父类的属性和方法，并且可以在子类中添加自己的属性和方法，或者覆盖父类的属性和方法。
- `SingleSelectTreeWidgetProps`：这是一个泛型参数，用于指定 `SingleSelectTreeWidget` 类接受的属性的类型。泛型参数允许在类或函数**定义中**使用**不具体**指定类型的占位符，以便在实际**使用时**指定**具体**类型。
- `WidgetState`：这是另一个泛型参数，用于指定 `SingleSelectTreeWidget` 类的状态的类型。状态通常用于存储组件内部的数据，并在组件渲染和交互过程中进行管理和更新。

通过使用泛型参数，`SingleSelectTreeWidget` 类可以在实例化时指定具体的属性和状态类型，以符合特定的需求和使用场景。这样可以增加代码的可复用性和类型安全性，同时提供更好的开发和维护体验。

**举例**

```ts
class Container<T> {
  private value: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  getValue(): T {
    return this.value;
  }

  setValue(newValue: T): void {
    this.value = newValue;
  }
}
```

- `Container` 类有一个私有属性 `value`，其类型是泛型参数 `T`。这意味着 `value` 可以是任意类型，具体的类型由在实例化时传入的参数决定。
- 构造函数 `constructor` 接受一个初始值 `initialValue`，类型为 `T`，并将其赋值给 `value` 属性。
- `getValue` 方法返回 `value` 属性的值，类型为 `T`。
- `setValue` 方法接受一个新值 `newValue`，类型为 `T`，并将 `value` 属性更新为新值。

```ts
const numberContainer = new Container<number>(10);
console.log(numberContainer.getValue()); // 输出：10
numberContainer.setValue(20);
console.log(numberContainer.getValue()); // 输出：20

const stringContainer = new Container<string>("Hello");
console.log(stringContainer.getValue()); // 输出：Hello
stringContainer.setValue("World");
console.log(stringContainer.getValue()); // 输出：World
```

在这个示例中，我们首先创建了一个 `Container` 实例 `numberContainer`，并指定泛型参数为 `number`。然后，我们使用 `getValue` 方法打印出初始值。接着，我们使用 `setValue` 方法将值更新为 20，并再次打印出新值。

类似地，我们还创建了一个 `Container` 实例 `stringContainer`，并指定泛型参数为 `string`，然后进行相应的操作。

```ts
export interface TreeSelectProps
extends Required<
Pick<
SelectProps,
"disabled" | "placeholder" | "loading" | "dropdownStyle" | "allowClear"
>
```

- `Required<T>` 是 TypeScript 中的类型操作符，用于将接口或类型 `T` 中的所有属性标记为必需属性，即不能为 `undefined` 或 `null`。
- `Pick<SelectProps, "disabled" | "placeholder" | "loading" | "dropdownStyle" | "allowClear">` 表示从 `SelectProps` 接口中选择特定的属性，形成一个新的类型。在这里，我们选择了 `"disabled"`、`"placeholder"`、`"loading"`、`"dropdownStyle"` 和 `"allowClear"` 这些属性。

## 疑难杂症

### Function components cannot be given refs

```tsx
const AppsmithLink = styled(
    (props) => {
        // we are removing non input related props before passing them in the components
        return <Link {...props} />;
    }),
      `
  height: 24px;
  min-width: 24px;
  width: 24px;
  display: inline-block;
  img {
    min-width: 24px;
    width: 24px;
    height: 24px;
  }
`;
```

> 这样使用时，会有Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
>
> 在使用 `styled` 函数时，如果要在样式化组件中访问 `ref` 属性，您需要使用 `React.forwardRef` 方法来包装组件。

可以这么写

```tsx
type LinkProps = {
    to: string;
};

const AppsmithLink = styled(
    React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
        // we are removing non input related props before passing them in the components
        return <Link ref={ref} {...props} />;
    }),
)`
  /* your styles here */
`;

<AppsmithLink to={APPLICATIONS_URL}>
    <PagePlugLogoImg
        alt="PagePlug logo"
        className="t--appsmith-logo"
        src={PagePlugLogo}
        />
</AppsmithLink>
```

- `HTMLAnchorElement` 指定了 `ref` 的类型为 `HTMLAnchorElement`，这表示 `ref` 应该是一个指向 `<a>` 元素的引用。
- `LinkProps` 指定了 `props` 的类型为 `LinkProps`，这表示组件的其余属性应符合 `LinkProps` 类型的要求。

使用

```tsx
<AppsmithLink to={APPLICATIONS_URL}>
    <PagePlugLogoImg
        alt="PagePlug logo"
        className="t--appsmith-logo"
        src={PagePlugLogo}
        />
</AppsmithLink>
```

> 这样会提示 No overload matches this call.

可以这样使用：

```tsx
<AppsmithLink to={APPLICATIONS_URL} as={Link}>
  <PagePlugLogoImg
    alt="PagePlug logo"
    className="t--appsmith-logo"
    src={PagePlugLogo}
  />
</AppsmithLink>
```

> 通过 `as` 属性，你在使用 `styled-components` 包装的组件时，可以明确告诉 TypeScript 实际使用的组件类型。

排除某个类型？

### 参数不匹配

> 使用时传的参数少