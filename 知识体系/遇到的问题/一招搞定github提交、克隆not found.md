这种原因一般是git读取系统缓存的github账号信息错误，清除这个配置文件重新读取即可~

```
git config --system --unset credential.helper
```

如果没用 可以到sourcetree 的文件里面清除密码**配置文件**