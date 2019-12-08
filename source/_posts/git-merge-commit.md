---
title: git合并多个commit的方法：git rebase -i
date: 2016-12-08 13:49:08
toc: true
categories: 
- 实践小能手
tags:
- Github
- Github Page
---
# 前言
虽然看到博主都写了有关git rebase -i合并commit的博文，但为巩固知识也在自己的博客中稍微做一些解释。
过去总是使用git reset --soft回退到之前的状态，再commit后push -f强推到远程库，能够覆盖掉之前的commit。

但在团队协作时，每次commit前还需要rebase upstream，这会自动将一些其他人做的修改也自动merge到本地的源码中。如果此时希望覆盖前一次commit，reset到之前的状态后，再次commit的内容就包含了其他人的修改，这不是我们希望看到的。
因此，我们需要使用git rebase -i。

# 基本步骤
* 1 git log查看所有commit的情况，找到自己想要合并的commit之前的那个commit的ssh码，比如43jk2l3ba343；
* 2 git rebase -i 43jk2l3ba343，这样会弹出一个文本编辑器；
* 3 修改pick为squash会将这个commit合并到前一个commit中，保存退出；
* 4 提示写下新的commit message，之前的message可以用#注释掉，保存退出；
* 5 此时再git log就会发现，两个commit被合并到一个commit中。

# 补充
* 如果两个或多个commit不是相邻关系，可以先git rebase -i一次，这次只调整commit的顺序而不做修改，时所有要修改的commit相邻，同时必须保持原有的先后顺序。第二次rebase与上面基本步骤相同。
* 当然可以git commit --fixup结合git rebase -i --autosquash，食用风味更佳:)