我的**React**项目，采用`create-react-app`脚手架开发。

**【组件】**想发起请求：

```js
useEffect(() => {
    // 中国奖牌
    fetch(
      '/api/List/getHandDataList?id=TDAT1719213513235359&serviceId=tvcctv&n=100&p=1'
    )
      .then((response) => response.json())
      .then((json) => {
        const { itemList } = json?.data;
        const goldList = itemList
          .filter((item) => item.mark === 'jin')
          .map(({ brief, image, operate_time, title, url }) => ({
            id: url,
            // 项目
            category: brief,
            // 运动员图片
            img: image,
            // 运动员姓名
            sporterName: title,
            // 时间
            time: operate_time,
            // 回放链接
            url: url,
          }));
        setGoldSportList(goldList);
      })
      .catch((error) => {
        console.error('请求失败', error);
      });
  }, []);
```

我**本地**设置代理的手段是：**package.json**加上`“proxy”`字段：

```json
{
    "proxy": "https://api.cntv.cn"
}
```

> 参考：https://create-react-app.dev/docs/proxying-api-requests-in-development/

**vercel**部署上去后，代理不生效。

查阅文档得知，vercel部署到生产，需要**代理**的话，**项目根目录**下添加**vercel.json**,并使用以下配置：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.cntv.cn/:path*"
    }
  ]
}
```

其中 `:path*`是为了捕获`/api`后面的所有路径部分，并将其传递到目标 URL，类似于**动态路由**，path只是一个命名，可以起其他名字。

> 参考：https://vercel.com/docs/projects/project-configuration#rewrites

线上体验地址： https://react-playground-xi.vercel.app/page

![image-20240817112324045](D:\workspace\know_fragments\blog\image-20240817112324045.png)