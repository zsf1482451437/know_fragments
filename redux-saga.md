# 轻度练习

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



## 创建项目

1.使用create-react-app创建react项目

```bash
npx create-react-app redux-saga-todo
```

2.安装 Redux 和 Redux Saga。

```
npm install redux react-redux redux-saga
```

## redux配置

创建一个 reducer 来处理任务的状态。这个 reducer 应该定义了应用的初始状态和如何处理不同的 action 类型。

```js
// taskReducer.js
// 初始状态
const initialState = {
  tasks: [],
};

// 任务 reducer
const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'COMPLETE_TASK':
      // 处理完成任务的逻辑
      // ...
      return state;
    case 'DELETE_TASK':
      // 处理删除任务的逻辑
      // ...
      return state;
    default:
      return state;
  }
};

export default taskReducer;
```

使用 Redux 提供的 `createStore` 函数来创建 Redux store。将 reducer 传递给 `createStore` 函数以初始化 store。

```js
// configureStore.js

import { createStore } from 'redux';
import taskReducer from './taskReducer';

const store = createStore(taskReducer);

export default store;
```

redux4以上createStore就失效了，可以换一种方式

安装@reduxjs/toolkit

```bash
npm install @reduxjs/toolkit
```

修改后的逻辑

```js
// configureStore.js

import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskReducer';

const store = configureStore({
  reducer: {
    tasks: taskReducer, // 在 reducer 对象中配置任务 reducer
  },
});

export default store;
```

## saga配置

```js
// taskSaga.js

import { takeLatest, put, call } from 'redux-saga/effects';
import { TaskService } from '../services/taskService';
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

## 启动saga

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



## **连接应用**

使用 `react-redux` 库中的 `Provider` 组件将 Redux store 与应用连接起来。

```js
// index.js
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
import TaskInput from './components/TaskInput';

const App = () => {
  return (
    <div>
      <h1>Task Management App</h1>
      <TaskInput />
      <TaskList />
    </div>
  );
};

export default App;

```

## 组件行为

在组件中使用 `connect` 函数从 Redux store 获取任务状态并触发任务相关的 actions。

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

 在组件中触发任务相关的 actions，以更新任务状态。

```js
// TaskInput.js

import React, { useState } from 'react';
import { connect } from 'react-redux';

const TaskInput = ({ dispatch }) => {
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask) {
      dispatch({ type: 'ADD_TASK', payload: newTask });
      setNewTask('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button onClick={addTask}>Add Task</button>
    </div>
  );
};

export default connect()(TaskInput);
```

