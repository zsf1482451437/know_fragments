# 待回顾

## React.createRef()

## useImperativeHandle()

## useLocation()

## React.lazy

# style-component

```tsx
export const TreeSelectContainer = styled.div<{
  allowClear?: boolean;
  compactMode: boolean;
  isValid: boolean;
  labelPosition?: LabelPosition;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
}>`

样式规则
`
```

`styled` 函数接受一个参数，该参数是一个对象字面量，用于定义组件的样式规则；

上述几个变量是可以在css使用的props；

以下是一个示例，展示如何使用这个样式化的组件：

```tsx
import React from 'react';
import { TreeSelectContainer } from './TreeSelectContainer';

const MyComponent = () => {
  return (
    <TreeSelectContainer
      allowClear={true}
      compactMode={false}
      isValid={true}
      labelPosition="left"
      borderRadius="4px"
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      accentColor="#ff0000"
    >
      {/* 组件的内容 */}
    </TreeSelectContainer>
  );
};

export default MyComponent;
```



# Redux-saga

## 轻度练习

项目预期结构

```
redux-saga-todo/
├── src/
│   ├── actions/
│   │   ├── taskActions.js
│   │   └── ...
│   ├── components/
│   │   ├── TaskList.js
│   │   ├── TaskInput.js
│   │   └── ...
│   ├── reducers/
│   │   ├── taskReducer.js
│   │   └── ...
│   ├── sagas/
│   │   ├── taskSaga.js
│   │   └── ...
│   ├── store/
│   │   ├── configureStore.js
│   │   └── ...
│   ├── App.js
│   └── index.js
├── package.json
└── ...

```



### 创建项目

1.使用create-react-app创建react项目

```bash
npx create-react-app redux-saga-todo
```

2.安装 Redux 和 Redux Saga。

```
npm install redux react-redux redux-saga
```

### redux配置

创建一个 reducer 来处理任务的状态。这个 reducer 应该定义了应用的初始状态和如何处理不同的 action 类型。

```js
// taskReducer.js
import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { tasks: [] },
  reducers: {
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    completeTask: (state, action) => {
      // 处理完成任务的逻辑
      // ...
    },
    deleteTask: (state, action) => {
      // 在 action.payload 中假设有一个任务的唯一标识符，例如任务的 ID
      const taskIdToDelete = action.payload;

      // 使用 Array.prototype.filter 来过滤出不包括要删除任务的新任务数组
      state.tasks = state.tasks.filter((task) => task.id !== taskIdToDelete);
    },
  },
});

export const { addTask, completeTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
```

使用 Redux 提供的 `configureStore` 函数来创建 Redux store。将 reducer 和 需要使用的中间件 传递给 `configureStore` 函数以初始化 store。

```js
// configureStore.js
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import taskReducer from '../reducers/taskReducer';
import taskSaga from '../sagas/taskSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: taskReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(taskSaga);

export default store;
```

安装@reduxjs/toolkit

```bash
npm install @reduxjs/toolkit
```

### saga配置

```js
// taskSaga.js

import { takeLatest, put, call } from 'redux-saga/effects';
import TaskService from '../services/taskService';
import { addTaskSuccess, addTaskFailure, deleteTaskSuccess, deleteTaskFailure, ReduxActionTypes } from '../actions/taskActions';

// 添加任务的 Saga
function* addTaskSaga(action) {
  try {
    // 调用任务服务以添加任务
    const newTask = yield call(TaskService.addTask, action.payload);

    // 分发成功操作
    yield put(addTaskSuccess(newTask));
  } catch (error) {
    // 分发失败操作
    yield put(addTaskFailure(error));
  }
}

// 删除任务的 Saga
function* deleteTaskSaga(action) {
  try {
    // 调用任务服务以删除任务
    yield call(TaskService.deleteTask, action.payload);

    // 分发成功操作
    yield put(deleteTaskSuccess(action.payload));
  } catch (error) {
    // 分发失败操作
    yield put(deleteTaskFailure(error));
  }
}

// 监听添加任务和删除任务的动作
function* taskSaga() {
  yield takeLatest(ReduxActionTypes.ADD_TASK_REQUEST, addTaskSaga);
  yield takeLatest(ReduxActionTypes.DELETE_TASK_REQUEST, deleteTaskSaga);
}

export default taskSaga;
```



```js
// taskActions.js

// 定义动作类型
export const ReduxActionTypes = {
  ADD_TASK_REQUEST: 'ADD_TASK_REQUEST',
  DELETE_TASK_REQUEST: 'DELETE_TASK_REQUEST',
  ADD_TASK_SUCCESS: 'ADD_TASK_SUCCESS',
  ADD_TASK_FAILURE: 'ADD_TASK_FAILURE',
  DELETE_TASK_SUCCESS: 'DELETE_TASK_SUCCESS',
  DELETE_TASK_FAILURE: 'DELETE_TASK_FAILURE',
};

// 创建动作生成器函数
export const addTaskRequest = (task) => ({
  type: ReduxActionTypes.ADD_TASK_REQUEST,
  payload: task,
});

export const deleteTaskRequest = (taskId) => ({
  type: ReduxActionTypes.DELETE_TASK_REQUEST,
  payload: taskId,
});

export const addTaskSuccess = (task) => ({
  type: ReduxActionTypes.ADD_TASK_SUCCESS,
  payload: task,
});

export const addTaskFailure = (error) => ({
  type: ReduxActionTypes.ADD_TASK_FAILURE,
  payload: error,
});

export const deleteTaskSuccess = (taskId) => ({
  type: ReduxActionTypes.DELETE_TASK_SUCCESS,
  payload: taskId,
});

export const deleteTaskFailure = (error) => ({
  type: ReduxActionTypes.DELETE_TASK_FAILURE,
  payload: error,
});
```

### services（待补充）

```js
// taskService.js

const tasks = []; // 用于存储任务的模拟数据库

class TaskService {
  // 添加任务
  static addTask(task) {
    return new Promise((resolve, reject) => {
      // 模拟异步操作，例如向服务器发送请求
      setTimeout(() => {
        try {
          const newTask = {
            id: tasks.length + 1,
            text: task.text,
          };
          tasks.push(newTask);
          resolve(newTask);
        } catch (error) {
          reject(error);
        }
      }, 1000); // 模拟1秒的延迟
    });
  }

  // 删除任务
  static deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      // 模拟异步操作，例如向服务器发送请求
      setTimeout(() => {
        try {
          const index = tasks.findIndex((task) => task.id === taskId);
          if (index !== -1) {
            tasks.splice(index, 1);
            resolve(taskId);
          } else {
            reject(new Error('Task not found'));
          }
        } catch (error) {
          reject(error);
        }
      }, 1000); // 模拟1秒的延迟
    });
  }
}

export default TaskService;

```

### 启动saga

使用saga中间件，在创建store时添加进去；

```js
// configureStore.js
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import taskReducer from '../reducers/taskReducer';
import taskSaga from '../sagas/taskSaga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: taskReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(taskSaga);

export default store;

```



### **连接应用**

使用 `react-redux` 库中的 `Provider` 组件将 Redux store 与应用连接起来。

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/configureStore';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

```js
// App.js

import React from 'react';
import TaskList from './components/TaskList';

const App = () => {
  return (
    <div>
      <h1>Task Management App</h1>
      <TaskList />
    </div>
  );
};

export default App;
```

### 组件行为

1.在组件中使用 `connect` 函数从 Redux store 获取任务状态并触发任务相关的 actions。

```js
// TaskList.js

import React from 'react';
import { connect } from 'react-redux';

const TaskList = ({ tasks }) => {
  // 渲染任务列表
  return (
    <ul>
      {tasks.map((task, index) => (
        <li key={index}>{task}</li>
      ))}
    </ul>
  );
};

// 从 Redux store 获取任务状态
const mapStateToProps = (state) => {
  return {
    tasks: state.tasks,
  };
};

export default connect(mapStateToProps)(TaskList);
```

其中，**connect**函数的作用是将 **组件** 和 **全局状态** 连接在一起，使组件能够使用全局状态；

要是使用redux/tookit写法的话，使用 **useSelector**去获取全局状态中的某一项；

在组件中触发任务相关的 actions，以更新任务状态；

```js
// TaskList.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, deleteTask } from '../reducers/taskReducer'; // 导入相应的 actions

const TaskList = () => {
  const [taskText, setTaskText] = useState('');
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks); // 使用 selector 获取任务列表

  const handleAddTask = () => {
    if (taskText) {
      dispatch(addTask(taskText)); // 调用 addTask action
      setTaskText('');
    }
  };

  const handleDeleteTask = (task) => {
    dispatch(deleteTask(task)); // 调用 deleteTask action
  };

  return (
    <div>
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            {task}
            <button onClick={() => handleDeleteTask(task)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
```





# 经验积累

- 修改组件逻辑前，一定要清楚组件被哪些地方引用到；

# 疑难杂症

如何给style-componet的组件添加事件？

## react中使用svg

- import导入
- 组件导入

导入 SVG 文件并在 React 组件中使用时，SVG 文件内容通常会被解析为一个字符串，而不是直接渲染为图像。这是因为在 React 中，SVG 文件通常被视为一种特殊的 XML 数据，而不是普通的图像。

**使用 `import` 导入 SVG 文件**

导入 SVG 文件并将其分配给一个变量，就像正常导入其他模块一样：

```ts
import React from 'react';
import mySvg from './my-svg-file.svg';

function MyComponent() {
  return (
    <div>
      {/* 使用导入的 SVG 文件 */}
      <img src={mySvg} alt="My SVG" />
    </div>
  );
}

export default MyComponent;

```

**将 SVG 作为组件使用：** 还可以将 SVG 文件作为 React 组件使用，而不是将其直接呈现为图像。为此，需要将 SVG 文件的内容包装在一个组件中，然后在应用程序中使用该组件。这可以更灵活地操作 SVG 内容。以下是一个示例：

```ts
javascriptCopy codeimport React from 'react';
import MySvgComponent from './MySvgComponent';

function MyComponent() {
  return (
    <div>
      {/* 使用 SVG 组件 */}
      <MySvgComponent />
    </div>
  );
}

export default MyComponent;
```

**注意：svg当组件时记得将有连接符-的属性换成驼峰**

## refs

报错信息：

```
Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
```

## TypeError

报错信息：

```
TypeError: Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.
```

对非类数组对象进行展开运算；

## React.jsx: type is invalid

```
Warning: React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check your code at index.tsx:122.
```



## 修改create-react-app默认启动端口3000

修改启动脚本

```json
"scripts": {
    "start": "set PORT=3001 && react-scripts start",
  },
```

参考链接

- https://create-react-app.dev/docs/adding-custom-environment-variables

## 自定义组件添加回车事件？

如何给一个自定义组件添加回车事件，但是该组件的 `props` 中并没有提供相应的回车事件处理函数？

## antd中Menu组件设置主题

```jsx
import React from 'react';
import { ConfigProvider, Button, Space, Input, Divider } from 'antd';

const App: React.FC = () => (
  <>
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: '#00b96b',
            algorithm: true, // 启用算法
          },
          Input: {
            colorPrimary: '#eb2f96',
            algorithm: true, // 启用算法
          }
        },
      }}
    >
      <Space>
        <div style={{ fontSize: 14 }}>开启算法：</div>
        <Input placeholder="Please Input" />
        <Button type="primary">Submit</Button>
      </Space>
    </ConfigProvider>
  </>
);

export default App;
```

## Objects are not valid as a React child

Uncaught Error: Objects are not valid as a React child (found: object with keys {}). If you meant to render a collection of children, use an array instead.

这个错误通常发生在使用 React 进行渲染时，尝试将一个对象作为 React 子元素进行渲染，而不是有效的 React 元素或组件。

以下是一个导致该错误的示例：

```js
const data = {
  name: 'John',
  age: 30,
};

function App() {
  return (
    <div>
      {data} {/* 错误的用法 */}
    </div>
  );
}
```

为了解决这个问题，你需要将对象转换为有效的 React 元素或组件，或者将对象中的特定属性提取出来进行渲染。以下是两个修正的示例：

将对象转换为字符串进行渲染：

```js
const data = {
  name: 'John',
  age: 30,
};

function App() {
  return (
    <div>
      {JSON.stringify(data)} {/* 将对象转换为字符串进行渲染 */}
    </div>
  );
}
```

提取对象属性进行渲染：

```js
const data = {
  name: 'John',
  age: 30,
};

function App() {
  return (
    <div>
      <p>Name: {data.name}</p>
      <p>Age: {data.age}</p>
    </div>
  );
}
```

## Warning: validateDOMNesting(...): <div> cannot appear as a descendant of <p>.

这个警告是由 React 提供的 DOM 结构验证机制触发的。它表示在 HTML 中，`<div>` 元素不能作为 `<p>` 元素的子元素出现。

以下是一个示例，展示了触发该警告的情况：

```html
<p>
  这是一个段落。
  <div>这是一个 div。</div>
</p>
```

以下是一个修改后的示例，修复了这个警告：

```html
<div>
  <p>这是一个段落。</p>
  <div>这是一个 div。</div>
</div>
```

## Warning: validateDOMNesting(...): <button> cannot appear as a descendant of <button>.

button不能嵌套，想方法让button不嵌套



## React does not recognize the `data-widgetId` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `data-widgetid` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
