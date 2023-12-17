# 1 异步请求处理方式

场景：

- **调用**一个**函数**，在函数中**发送网络请求**（定时器模拟）
- 如果**请求发送成功**，告知调用者，并**返回相关数据**
- 如果**请求发送失败**，告知调用者，并告知**错误信息**

## 1.1 返回结果问题

```js
// request.js
function requestData(url) {
  // 模拟
  setTimeout(() => {
    // 拿到请求结果
    if (url === 'ok') {
      let names = ['abc', 'ccc', 'cbc']
      
    } else {
      let msg = '请求失败，url错误'
      
    }
  }, 3000);
}

// other.js
// 假设url是ok代表请求成功 bad代表不成功
requestData('ok')
```

不管调用成功还是失败，都**需要有返回结果**;

但是由于requestData内部的**setTimeout是异步函数**，想在if里面return出结果是不可能的;

也就是说**requestData拿不到setTimeout返回的结果**;

## 1.2 **解决方案**

requestData加两个函数参数，**通过回调函数拿到结果**

```js
// request.js
function requestData(url, successCallback, failtureCallback) {
  // 模拟
  setTimeout(() => {
    // 拿到请求结果
    if (url === 'ok') {
      let names = ['abc', 'ccc', 'cbc']
      successCallback(names)
    } else {
      let msg = '请求失败，url错误'
      failtureCallback(msg)
    }
  }, 3000);
}

// other.js
// 假设url是ok代表请求成功 bad代表不成功
requestData('ok', (res) => {
  console.log(res)
}, (err) => {
  console.log(err)
})
```

## 1.3 弊端

- **自己**封装requestData时，必须**设计好callback**名称，并且**好使用**
- **使用别人**封装requestData的或者第三库时，必须**看别人源码或者文档**，**才知道这函数要怎么获取到结果**（第一个参数传什么。第二个参数传什么等等）

# 2 Promise

**es6新增**

**规范好了所有代码的编写规范**，无需查看源码或者文档就可以使用，因为这是**承诺~**

## 2.1 使用

1. 通过new Promise对象时，需要传入一个回调函数，称之为executor
2. 这个**executor会被立即执行**，并且给传入另外两个回调函数resolve、reject
3. **then方法**传入的**回调函数**，会在Promise**执行resolve函数时**，**被回调**
4. **catch方法**传入的**回调函数**，会在Promise**执行reject函数时**，**被回调**
5. 当**then方法放2个参数**时，**第1个参数**是**执行resolve的回调函数**，**第2个参数**是**执行reject的回调函数**

```js
const promise = new Promise(() => {
  console.log(123)
})
```

直接打印123（executor立即执行了）

### **成功时**

```js
const promise = new Promise((resolve, reject) => {
  resolve()
})
promise.then(() => {
  console.log('成功了')
})
```

```js

const promise = new Promise((resolve, reject) => {
  resolve()
})
promise.then(() => {
  console.log('成功了')
}).catch(() => {
  console.log('失败了')
})
```

打印成功了

### 失败时

```js
const promise = new Promise((resolve, reject) => {
  reject()
})
promise.catch(() => {
  console.log('失败了')
})
```

```js
const promise = new Promise((resolve, reject) => {
  reject()
})
promise.then(() => {
  console.log('成功了')
}).catch(() => {
  console.log('失败了')
})
```

打印失败了

## 2.2 **重构**传统异步请求

```js
// request.js
function requestData(url) {
  

  return new Promise((resolve, reject) => {
    // 模拟
    setTimeout(() => {
      // 拿到请求结果
      if (url === 'ok') {
        let names = ['abc', 'ccc', 'cbc']

        resolve(names)
      } else {
        let msg = '请求失败，url错误'

        reject(msg)
      }
    }, 1000)
  })
}

// other.js
// 假设url是ok代表请求成功 bad代表不成功
const promise = new requestData()
promise.then((res) => {
  console.log(res)
}).catch((err) => {
  console.log(err)
})
```

## 2.3 promise3种状态

| Pending            | 待定   | 执行executor，还没有结果 |
| ------------------ | ------ | ------------------------ |
| fulfilled/resolved | 已兑现 | 中执行了resolve          |
| rejected           | 已拒绝 | 中执行了reject           |

**注意：**

**状态**一旦**确定下来**，就是**不可更改**的。也就是说，**当已兑现时，reject是不会执行了**，反之亦然

## 2.4 resolve详解

### 参数

- **普通值或对象**
- **Promise对象**
- **一个对象**，且该对象**有实现then方法**

**传入普通值或对象时**，打印

```js
new Promise((resolve, reject) => {
  resolve({name: 'zsf'})
}).then((res) => {
  console.log('res:', res)
}, (err) => {
  console.log('err:', err)
})
```

**传入Promise对象时**，什么也没打印（**特殊**）

因为**传入Promise对象**时，当前的Promise的**状态由传入的Promise的状态决定**（状态移交）

```js
const newPromise = new Promise((resolve, reject) => {

})
new Promise((resolve, reject) => {
  resolve(newPromise)
}).then((res) => {
  console.log('res:', res)
}, (err) => {
  console.log(':', err)
})
```

**传入一个对象，且该对象有实现then方法**

会**执行then**方法，并且**由then方法决定后续状态** (可以理解为第2种情况的普通情况)

打印**res: 执行obj的then**

```js
new Promise((resolve, reject) => {
  const obj = {
    then (resolve, reject) {
      resolve('执行obj的then')
    }
  }
  resolve(obj)
}).then((res) => {
  console.log('res:', res)
}, (err) => {
  console.log(':', err)
})
```



## 2.5 对象方法

### then方法

它是一个对象方法，放在**Promise的显示原型prototype上**，通过Promise.prototype.then可查看

#### 参数

- 1个回调函数
- 2个回调函数

#### 特点

同一个promise对象可以**调用多次then方法**

**多次调用then方法**会有什么**现象**？

执行resolve时，**所有**传入then方法的回调函数都会**被回调**

```js
const promise = new Promise((resolve, reject) => {
  resolve('hhh')
})

promise.then((res) => {
  console.log('res1:', res )// hhh
})

promise.then((res) => {
  console.log('res2:', res )// hhh
})
```

**注意**

多次调用不是这意思：

```js
promise.then((res) => {
  console.log('res1:', res )
}).then((res) => {
  console.log('res2:', res )
})
```

#### 返回值

then方法**传入的回调函数**是**可以有返回值**的

分情况：

- **没有返回**
- **普通值**或**普通对象**
- 一个**Promise**
- **一个对象**，且该对象**有实现then方法**

**没有返回**

相当于返回undefined(函数特点)

```js
const promise = new Promise((resolve, reject) => {
  resolve('hhh')
})


promise.then((res) => {

}).then((res) => {
  console.log(res)// undefined
})
```

**返回普通值或普通对象**

那这个**普通值**会被包装成**Promise对象**，作为一个**新的Promise的resolve值**（**链式调用**）

```js
const promise = new Promise((resolve, reject) => {
  resolve('hhh')
})


promise.then((res) => {
  return 111
}).then((res) => {
  console.log(111)// 111
})
```

**返回Promise**

```js
const promise = new Promise((resolve, reject) => {
  resolve('hhh')
})


promise.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(111)
    }, 1000);
  })
}).then((res) => {
  console.log('res:', res)// res: 111
})
```

**一个对象，且该对象有实现then方法**

```js
const promise = new Promise((resolve, reject) => {
  resolve('hhh')
})


promise.then((res) => {
  return {
    then (resolve, reject) {
      resolve(111)
    }
  }
}).then((res) => {
  console.log(res)// 111
})
```

### catch方法

then()的第2个参数

```js
const promise = new Promise((resolve, reject) => {
  reject('error')
})


promise.then(undefined, (err) => {
  console.log(err)// error
})
```

**另一个种写法**

当**executor抛出异常**时，也会**调用错误捕获**的**回调函数**（then()的第2个参数），不仅可以捕获reject，也会捕获异常

```
const promise = new Promise((resolve, reject) => {
  throw new Error('error')
})


promise.then(undefined, (err) => {
  console.log('err:', err)
})
```

#### **推荐写法**

es6为了可读性，提出catch方法，

但是这**不符合promise的a+规范**

```js
const promise = new Promise((resolve, reject) => {
  reject(111)
})


promise.then((res) => {
  console.log('res:', res)
}).catch((err) => {
  console.log(err)
})
```

**注意**：

这里的catch**捕获的是promise的异常或reject**，不是promise.then(...)

#### 返回值

**与then一样，同样是包装成新的promise，还是resolve值**

### finally方法

**不管**promise对象是**fulfilled状态还是rejected状态**，最终都会被执行的代码

#### 特点

**无参数**

```js
const promise = new Promise((resolve, reject) => {
  reject(111)
})


promise.then((res) => {
  console.log('res:', res)
}).catch((err) => {
  console.log(err)
}).finally(() => {
  console.log('final')
})
```

#### 应用

**清除工作**

## 2.6 类方法

### resolve

**需求：**

已经有现成内容了，希望将它**转成Promise**来使用

**Promise.resolve**相当于**new Promise**，并且**执行resolve操作**

```js
const promise = Promise.resolve({name: 'zsf'})
```

相当于

```js
const promise2 = new Promise((resolve, reject) => {
  resolve({name: 'zsf'})
})
```

### reject

不同于resolve，**不分情况**，不管传入什么，**直接打印**

### all

创建多个promise

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(111)
  }, 1000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(222)
  }, 2000);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(333)
  }, 3000);
})
```

看这一段代码

**需求:**

所有promise都变成fulfilled状态，再拿到结果，并且结果按照顺序合并一起

如果数组中不是Promise，会自动转换成Promise

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(111)
  }, 1000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(222)
  }, 2000);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(333)
  }, 3000);
})

Promise.all([p1, p2, p3, 'zsf']).then((res) => {
  console.log(res)
})// 等待3秒多 [111, 222, 333, 'zsf']
```

#### 意外情况

**拿到所有结果之前**，有**一个**promise**变成了rejected状态**

那么**整个promise是rejected**

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(111)
  }, 1000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(222)
  }, 2000);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(333)
  }, 3000);
})

Promise.all([p1, p2, p3, 'zsf']).then((res) => {
  console.log(res)
}).catch((err) => {
  console.log(err)
}) //2秒之后，打印222
```

### allSettled

es11新增，**接收一个数组**

**需求：**

不希望rejected的影响其它的结果

### race

**接收一个数组**

只要有一个promise是**fulfilled**，就以**该结果为总结果**

### any

es12新增

**至少**等到一个promise是fulfilled，

就以**该结果为总结果**，如果都是rejected，那就等完所有promise再catch

## 2.7 实现简单promise

### 符合规范

参考Promise/A+

### 封装SFPromise类

函数也行

```js
class SFPromise {
  constructor (executor) {
    const resolve = () => {

    }
    const reject = () => {

    }
    
    executor(resolve, reject)
  }
}
```

这样就可以调用resolve和reject了

但是，调完resolve是不能调reject的

所以

### 确定状态

- pending 待定
- fulfilled 已兑现
- rejected 已拒绝

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'


class SFPromise {
  constructor (executor) {
    // 默认pending
    this.status = PROMISE_STATUS_PENDING

    const resolve = () => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_FULFILLED
        console.log('resolve')
      }
    }
    const reject = () => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_REJECTED
        console.log('reject')
      }
    }

    executor(resolve, reject)
  }
}

const promise = new SFPromise((resolve, reject) => {
  resolve()
})
```

### 参数的传递

```js
class SFPromise {
  constructor (executor) {
    // 默认pending
    this.status = PROMISE_STATUS_PENDING
    // 保存传进来的参数
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_FULFILLED
        this.value = value
        console.log('resolve')
      }
    }
    const reject = (reason) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_REJECTED
        this.reason = reason
        console.log('reject')
      }
    }

    executor(resolve, reject)
  }
}
```

### then方法（难点）

执行resolve或reject后调用then传进来的回调函数

开始的想法

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'


class SFPromise {
  constructor (executor) {
    // 默认pending
    this.status = PROMISE_STATUS_PENDING
    // 保存传进来的参数
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_FULFILLED
        this.value = value
        // 执行then传进来的第1个回调函数
        this.onfulfilled()
        console.log('resolve')
      }
    }
    const reject = (reason) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_REJECTED
        this.reason = reason
        // 执行then传进来的第2个回调函数
        this.onrejected()
        console.log('reject')
      }
    }

    executor(resolve, reject)
  }

  then (onfulfilled, onrejected) {
    this.onfulfilled = onfulfilled
    this.onrejected = onrejected
  }
}

const promise = new SFPromise((resolve, reject) => {
  resolve(111)
})

promise.then((res) => {

}, (err) => {
  
})


```

报错：**Uncaught TypeError: this.onfulfilled is not a function**

因为会**立即执行resolve**方法，这时**还没有执行then**方法，所以**this.onfulfilled还没接收到**传进then的**回调函数**

用**定时器**，将那些代码放进**宏任务**，等**下一次事件循环**再执行，**不会阻塞主线程**的执行

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'


class SFPromise {
  constructor (executor) {
    // 默认pending
    this.status = PROMISE_STATUS_PENDING
    // 保存传进来的参数
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        setTimeout(() => {
          this.status = PROMISE_STATUS_FULFILLED
          this.value = value
          // 执行then传进来的第1个回调函数
          this.onfulfilled(this.value)
          console.log('resolve')
        }, 0);
      }
    }
    const reject = (reason) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        setTimeout(() => {
          this.status = PROMISE_STATUS_REJECTED
          this.reason = reason
          // 执行then传进来的第2个回调函数
          this.onrejected(this.reason)
          console.log('reject')
        }, 0)
      }
    }

    executor(resolve, reject)
  }

  then (onfulfilled, onrejected) {
    this.onfulfilled = onfulfilled
    this.onrejected = onrejected
  }
}

const promise = new SFPromise((resolve, reject) => {
  resolve(111)
})

promise.then((res) => {
  console.log(res)// 111
}, (err) => {

})

```

将那些代码放进**微任务**更好，用**queueMicrotask**

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'


class SFPromise {
  constructor (executor) {
    // 默认pending
    this.status = PROMISE_STATUS_PENDING
    // 保存传进来的参数
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          this.status = PROMISE_STATUS_FULFILLED
          this.value = value
          // 执行then传进来的第1个回调函数
          this.onfulfilled(this.value)
          console.log('resolve')
        }, 0);
      }
    }
    const reject = (reason) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          this.status = PROMISE_STATUS_REJECTED
          this.reason = reason
          // 执行then传进来的第2个回调函数
          this.onrejected(this.reason)
          console.log('reject')
        }, 0)
      }
    }

    executor(resolve, reject)
  }

  then (onfulfilled, onrejected) {
    this.onfulfilled = onfulfilled
    this.onrejected = onrejected
  }
}

const promise = new SFPromise((resolve, reject) => {
  resolve(111)// 111
})

promise.then((res) => {
  console.log(res)
}, (err) => {

})


```

### 完整代码

```js
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'


class SFPromise {
  constructor (executor) {
    // 默认pending
    this.status = PROMISE_STATUS_PENDING
    // 保存传进来的参数
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_FULFILLED
        queueMicrotask(() => {
          this.value = value
          // 执行then传进来的第1个回调函数
          this.onfulfilled(this.value)
          console.log('resolve')
        }, 0);
      }
    }
    const reject = (reason) => {
      // 只有是pending才能改变状态
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_REJECTED
        queueMicrotask(() => {
          this.reason = reason
          // 执行then传进来的第2个回调函数
          this.onrejected(this.reason)
          console.log('reject')
        }, 0)
      }
    }

    executor(resolve, reject)
  }

  then (onfulfilled, onrejected) {
    this.onfulfilled = onfulfilled
    this.onrejected = onrejected
  }
}

const promise = new SFPromise((resolve, reject) => {
  
  reject(222)
  resolve(111)
})

promise.then((res) => {
  console.log(res)
}, (err) => {
  console.log(err)
})


```

那些边界情况edge case就先不考虑啦~（多次调用、链式调用）

### 多次调用

思路：将多次传入的函数放进数组，遍历调用

待补充~

### 链式调用

主要分情况和参数传递问题

待补充~

### catch方法

待补充~

### finally方法

待补充~

### resolve方法

待补充~

### reject方法

待补充~

### all方法

```js
class SFPromise {
  ...
  static all(promises) {
    
  }
}
```

所有promise都变成fulfilled状态，再拿到结果，并且结果按照顺序合并一起

如果数组中不是Promise，会自动转换成Promise

**预期**

```js
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(111)
  }, 1000)
})
const p2 = new Promise((resolve,reject) => {
  setTimeout(() => {
    resolve(222)
  }, 2000)
})
const p3 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(333)
  }, 3000)
})

SFPromise.all([p1, p2, p3]).then((res) => {
  console.log(res)
}).catch((err) => {
  console.log(err)
})
```

all()既然可以调用then，那它必须返回一个promise

```js
static all(promises) {
    return new SFPromise((resolve, reject) => {
      
    })
  }
```

**核心问题--什么时候调resolve呢？**

所有promise都变成fulfilled状态



遍历promises数组

拿到结果，并且结果按照顺序合并一起

```js
static all(promises) {
    return new SFPromise((resolve, reject) => {
      // 收集所有fulfilled状态的promise结果
      const values = []
      promises.forEach((promise) => {
        promise.then((res) => {
          values.push(res)
          // 说明所有promise都fullfilled了
          if (values.length === promises.length) {
            resolve(values)
          }
        }).catch((err) => {
          // 只要有一个rejected就
          reject(err)
        })
      })
    })
  }
```



### allSettled方法

所有promise的结果都要拿到，不管什么状态

**预期**

```js
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(111)
  }, 1000)
})
const p2 = new Promise((resolve,reject) => {
  setTimeout(() => {
    reject(222)
  }, 2000)
})
const p3 = new Promise((resolve) => {
  setTimeout(() => {
    resolve(333)
  }, 3000)
})

SFPromise.allSettled([p1, p2, p3]).then((res) => {
  console.log(res)
})
```

**核心--不管什么状态都要收集结果，收集完就执行resolve**

```js
static allSettled(promises) {
    return new SFPromise((resolve) => {
      // 收集所有promise结果
      const values = []
      promises.forEach(promise => {
        promise.then((res) => {
          values.push({status: PROMISE_STATUS_FULFILLED, value: res})
          // 收集完就执行resolve
          if (values.length === promises.length) {
            resolve(values)
          }
        }).catch((err) => {
          values.push({status: PROMISE_STATUS_REJECTED, value: err})
          // 收集完就执行resolve
          if (values.length === promises.length) {
            resolve(values)
          }
        })
      })
    })
  }
```



### race方法

待补充~

### any方法

待补充~