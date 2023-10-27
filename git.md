# 问题

**本地仓库已经新建了很多文件，怎么和新建的Github远程仓库建立关联？**

1.添加远程地址

```
git remote add origin 远程地址
```

2.获取远程更新并合并

```
git fetch origin
```

```
git merge origin/master
```

执行 `git merge origin/master` 时会报错提示 `fatal: refusing to merge unrelated histories`

 表示 **你尝试将两个没有共同祖先的 Git 仓库历史（unrelated histories）合并**

3.本地分支和远程分支建立关联

```
git branch --set-upstream-to=origin/master master
```

然后合并远程分支

```
git pull origin master --allow-unrelated-histories
```

之后解决冲突完commit，接着就可以push到远程了

```
git push origin master
```

（还有一直方案是新建一个分支，后续若有需要，可以补充）

**这种方案不用新建分支，但是可能会破坏远程分支的内容，需要擦亮眼睛；**

养成好习惯: **先远程新建仓库，再克隆至本地**