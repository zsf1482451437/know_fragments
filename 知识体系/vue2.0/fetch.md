###  fetch

- Fetch API是新的ajax解决方案 Fetch会返回Promise
- **fetch不是ajax的进一步封装，而是原生js，没有使用XMLHttpRequest对象**。
- fetch(url, options).then(）

```html
  <script type="text/javascript">
    /*
      Fetch API 基本用法
      	fetch(url).then()
     	第一个参数请求的路径   Fetch会返回Promise   所以我们可以使用then 拿到请求成功的结果 
    */
    fetch('http://localhost:3000/fdata').then(function(data){
      // text()方法属于fetchAPI的一部分，它返回一个Promise实例对象，用于获取后台返回的数据
      return data.text();
    }).then(function(data){
      //   在这个then里面我们能拿到最终的数据  
      console.log(data);
    })
  </script>
```

####  fetch API  中的 HTTP  请求

- fetch(url, options).then(）
- HTTP协议，它给我们提供了很多的方法，如POST，GET，DELETE，UPDATE，PATCH和PUT
  - 默认的是 GET 请求
  - 需要在 options 对象中 指定对应的 method       method:请求使用的方法 
  - post 和 普通 请求的时候 需要在options 中 设置  请求头 headers   和  body

```html
   <script type="text/javascript">
        /*
              Fetch API 调用接口传递参数
        */
       #1.1 GET参数传递 - 传统URL  通过url  ？ 的形式传参 
        fetch('http://localhost:3000/books?id=123', {
            	# get 请求可以省略不写 默认的是GET 
                method: 'get'
            })
            .then(function(data) {
            	# 它返回一个Promise实例对象，用于获取后台返回的数据
                return data.text();
            }).then(function(data) {
            	# 在这个then里面我们能拿到最终的数据  
                console.log(data)
            });

      #1.2  GET参数传递  restful形式的URL  通过/ 的形式传递参数  即  id = 456 和id后台的配置有关   
        fetch('http://localhost:3000/books/456', {
            	# get 请求可以省略不写 默认的是GET 
                method: 'get'
            })
            .then(function(data) {
                return data.text();
            }).then(function(data) {
                console.log(data)
            });

       #2.1  DELETE请求方式参数传递      删除id  是  id=789
        fetch('http://localhost:3000/books/789', {
                method: 'delete'
            })
            .then(function(data) {
                return data.text();
            }).then(function(data) {
                console.log(data)
            });

       #3 POST请求传参
        fetch('http://localhost:3000/books', {
                method: 'post',
            	# 3.1  传递数据 
                body: 'uname=lisi&pwd=123',
            	#  3.2  设置请求头 
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(function(data) {
                return data.text();
            }).then(function(data) {
                console.log(data)
            });

       # POST请求传参
        fetch('http://localhost:3000/books', {
                method: 'post',
                body: JSON.stringify({
                    uname: '张三',
                    pwd: '456'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(function(data) {
                return data.text();
            }).then(function(data) {
                console.log(data)
            });

        # PUT请求传参     修改id 是 123 的 
        fetch('http://localhost:3000/books/123', {
                method: 'put',
                body: JSON.stringify({
                    uname: '张三',
                    pwd: '789'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(function(data) {
                return data.text();
            }).then(function(data) {
                console.log(data)
            });
    </script>
```

####  fetchAPI 中 响应格式

- 用fetch来获取数据，如果响应正常返回，我们首先看到的是一个response对象，其中包括返回的一堆原始字节，这些字节需要在收到后，需要我们通过调用方法将其转换为相应格式的数据，比如`JSON`，`BLOB`或者`TEXT`等等

```js
    /*      Fetch响应结果的数据格式    */    fetch('http://localhost:3000/json').then(function(data){      // return data.json();   //  将获取到的数据使用 json 转换对象      return data.text(); //  //  将获取到的数据 转换成字符串     }).then(function(data){      // console.log(data.uname)      // console.log(typeof data)      var obj = JSON.parse(data);      console.log(obj.uname,obj.age,obj.gender)    })
```

