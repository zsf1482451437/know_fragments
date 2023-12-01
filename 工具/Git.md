## 修改remote

先用

```bash
git remote -v
```

检查下现有的远程出库地址

确认之后修改

```bash
git remote set-url origin https://gitee.com/zhai-sifeng/docs.git
```

## 删除

```bash
git remote rm origin
```

## 切换remote

```bash
git remote set-url origin <new-url>
```

## 查看配置

```bash
查看全局配置信息：
git config --global --list
这将显示全局配置的所有信息，包括用户名、电子邮件、默认编辑器等。

查看当前仓库的配置信息：
git config --list
在仓库目录下执行此命令，将显示当前仓库的配置信息。

查看特定配置项的值：
git config <key>
将 <key> 替换为要查看的特定配置项的名称，例如：
git config user.name
git config core.editor
查看 Git 的所有配置信息：

git config --list --show-origin
此命令将显示所有 Git 配置项及其来源（配置文件和命令行选项等）。
```

## 团队协作

私仓+公仓+merge request模式

1.在公仓那fork出来，此时创建了私仓；

2.clone私仓到本地，添加私仓和公仓的remote；

```bash
git remote add origin 私仓地址
git remote add upstream 公仓地址
```

tip: origin 和 upstream命名看团队要求或者个人习惯；

3.执行 `git remote -v` 查看验证；

4.每次负责模块开发完，fetch公仓的更新，若有conflict得解决再merge；

```bash
git fetch upstream
git merge upstream/分支名
```

5.提交更新到私仓

```bash
git push origin 分支名
```

6.接着去公仓提交merge request，由项目的maintainer合并你的跟新（一般是developer，当然，优秀的你迟早maintainer）

## 合并

合并其他分支的某次提交

> git cherry-pick 该提交的hash值

git log 可查看提交hash值

## 疑难杂症

**本地仓库已经新建了很多文件，怎么和新建的Github远程仓库建立关联？**

1.添加远程地址

```bash
git remote add origin 远程地址
```

2.获取远程更新并合并

```bash
git fetch origin
```

```bash
git merge origin/master
```

执行 `git merge origin/master` 时会报错提示 `fatal: refusing to merge unrelated histories`

 表示 **你尝试将两个没有共同祖先的 Git 仓库历史（unrelated histories）合并**

3.本地分支和远程分支建立关联

```bash
git branch --set-upstream-to=origin/master master
```

然后合并远程分支

```bash
git pull origin master --allow-unrelated-histories
```

之后解决冲突完commit，接着就可以push到远程了

```bash
git push origin master
```

（还有一直方案是新建一个分支，后续若有需要，可以补充）

**这种方案不用新建分支，但是可能会破坏远程分支的内容，需要擦亮眼睛；**

养成好习惯: **先远程新建仓库，再克隆至本地**