# 1.克隆远程仓库

每个小组成员，在自己本地建立一个目录，作为工作空间，再去git clone 这个远程仓库

```
git clone git@xxxxx:/xxx/xxx.git
```

# 2.建立自己的分支

小组成员需要建立属于自己的分支，每个分支代表着开发不同的功能

```
git branch dev1//创立一个名字叫dev1的分支
git branch //查看分支  你会看到：
*master
dev1
这表示，你有两个分支，一个master(正在使用)，还有一个新建的dev1分支
```

# 3.切换到自己的分支git

小组成员切换到自己分支里进行开发，而不要用master进行开发

```
git checkout dev1 //切换到dev1分支
//然后进行一顿开发操作，开发工作结束之后
git add . 
git commit -m "xxx"
```

# 4.与本地master合并

master是主分支，要与远程保持同步，所以我们的开发分布不要直接推送到远程，
应该先在本地和master合并，再推送到远程

```
git checkout master //切换到主分支
git merge dev1 //合并分支里的操作
git push 
```

# 补充

1，通过上面的步骤推送的自己的修改

2，如果推送失败，说明远程master 已经更新过了，我们需要git pull 尝试合并

3，如果合并有冲突，我们需要在本地解决冲突，提交。然后再去推送

