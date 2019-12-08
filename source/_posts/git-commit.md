---
title: git整理commit的基本方法
date: 2016-12-08 13:46:30
toc: true
categories: 
- 实践小能手
tags:
- Git
---
觉得整理commit还是非常重要的一种技能，看到有人已经很好地整理过了，也搬运到自己的博客中，以备不时之需。本文转载自：[Git整理Patch的一些经验](https://codemelody.wordpress.com/2013/01/18/git整理patch的一些经验/)。

U-Boot升级到了最后，需要将之前比较杂乱的commit重新整理，**有的需要整合，有的需要拆分**。在这个过程中深刻的体会到了git的强大和灵活性。这里总结一下大的步骤和中间用到的各种小技巧。

## 步骤
| commands | usage |
|:---------|:------|
|git checkout –b <new_branch> | 新建一个branch来做整理的工作，保持原来的branch作为工作记录|
|git rebase –i <working_base> | 在新建的branch上，用rebase -i接squash的方法，将所有零碎的commit合成一个 |
|git reset –soft HEAD~1 |   这一步只将object store还原到working_base上。所有需要整理的改动都留在index上，以备下一步做stash |
|git stash save “stash message” | 将所有的改动放进stash中|

至此，我们有了一个工作的基础，**所有杂乱的commit被合成一个，并被放进stash中**，以备后面一点点的commit进去。

<!--more-->

接下来，最好过一遍所有的改动。记录下每个文件的改动包含了那些内容。以备后一步的按照不同的改动内容来合并commit。

```
git diff stash
```

举个简单的例子，假如总共有5个改动的文件a~e，分析它们的改动内容包含了四个不同的目的I~IV，如下所示：

```
文件a --- 目的I
文件b --- 目的II
文件c --- 目的II, 目的III
文件d --- 目的II, 目的IV
文件e --- 目的III
```

现在考虑按照不同的目的来组织不同的commit:

```
commit 1 - 目的I   - 文件a
commit 2 - 目的II  - 文件b，文件c和文件d的一部分
commit 3 - 目的III - 文件c的一部分，文件e
commit 4 - 目的IV  - 文件d的一部分
```

### commit 1

| commands | usage |
|:---------|:------|
|git checkout stash <file_a>    | 将stash中的文件a checkout出来，此时改动已放入index，我们可以直接commit|
|git commit –s | 完成commit 1|

### commit 2

| commands | usage |
|:---------|:------|
|git checkout stash .|  将stash中的所有文件checkout出来。**这里不能用git stash pop，因为一旦pop了，stash也就消失了，也就无法进行后续的工作**。也不能用git stash apply，因为apply是尝试merge，有时候反而会引起conflict，这不是我们想要的结果|
|git reset HEAD |   将所有改动移出index，但保留在working目录中|
|git add b  | 将b的所有改动放入index |
|git add -p c | 以**interactive的方式**，将c的部分改动放进index|
|git add -p d   |同前|
|git commit -s  |完成commit 2|
|git clean -dfx | 由于工作目录是dirty的，所以这一步用以清空空座目录，与object store保持严格一致，用来进行测试。很容易想到git reset –hard HEAD，但是这个命令不会将add的文件清空，比如这个例子中的文件e，所以用clean -dfx是最彻底的，但运行前请确保目录中没有需要保存而未保存的文件。|

#### git add -p的用法

```
    * add -p 会逐个显示文件中的每组改动，并询问是否要加入index
        – y : 放入index
        – n : 不要放入index
        – e : 手动编辑需要加入index的部分，常用来拆分一个改动块
            – “+”行，增加
            – “-”行，删除
            – “ “行，保持原样
```

第三个commit和第二个类似。不赘述。到第四个commit时，只剩下文件d，并且虽说d只有一部分与commit 4的目的相关，但由于d的其他部分在之前的commit已经放入object store了，所以又退化成和第一个commit类似的情况。

## 错误及补救措施

### 1. Commit到某个点以后，需要增减

* **`git rebase -i <targetCommit>~1`**: 对出错的commit，用e来表示需要更改
* **修改**: 
```
这里常用的git命令有
    git checkout stash <file> 增加一个文件
    git diff stash <file> 某个文件需要改动
    git reset HEAD~1 <file> 将某个文件移出这次commit
```
无论如何，保证最后index中是修改过的正确改动。
* **`git rebase –continue`**: 结束修改。

### 2. Commit到某个点后，发现前面某个commit需要拆分

* **`git rebase -i <targetCommit>~1`**: 回到拆分点，用e来表示需要更改
* **`git reset –mixed HEAD~1`**: 将这个targetCommit的改动放回working directory，object store和index都还原成这个commit尚未放入的状态。
* **拆分进行commit**: 将这些改动拆分的进行commit。
* **`git rebase –continue`**    : 结束修改。

### 3. rebase -i遇到conflict

* **手动修改**: 通常是先改成A，后改成B，此时改成B。也有先加上A，后加上B，这时需要取并集。有时A和B有相同的代码段时，这个代码段会被吃掉，修改的时候需要重新加上。
* **`git add <file> `**: 将修改完的文件放入index。
* **`git rebase –continue`**    : 继续rebase。

### 4. <path>在git command中的运用

* **`git log <path>`**: 只显示修改了某个文件commits。
* **`git log -p <path>`**   : 同上，并且显示这个文件被修改的内容。commit中其他文件的修改则不被显示。
* **`git diff … <path>  `**: 只比较某个文件的改动。