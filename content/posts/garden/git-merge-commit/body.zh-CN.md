**为什么用 `rebase -i`**

`git reset --soft` 再重新提交，确实能把最近几次提交“压扁”，但它太粗暴了。团队协作里，push 之前通常会先把本地分支 `rebase` 到 `upstream` 上。此时你的本地历史里，往往已经带上了其他人的提交。如果你再回退到旧状态重新 `commit`，很容易把这些 upstream 改动也一起打进新的提交里。

这就偏离了目标：你只是想整理**自己的**提交历史，而不是粗暴重写一整段历史。

`git rebase -i` 才是更精确的工具：只改你想改的那些 commit。

**合并相邻的 commit**

1. 先找到目标区间之前的那个 commit：

```bash
git log --oneline
```

2. 用这个 commit 的 **SHA**（提交哈希）作为起点，启动交互式 rebase：

```bash
git rebase -i <base-sha>
# 最近几次提交也可以直接写
git rebase -i HEAD~3
```

3. 在弹出的 todo 列表里：
   - 第一条目标 commit 保持为 `pick`
   - 后面的改成 `squash`（`s`）或 `fixup`（`f`）

```text
pick   a1b2c3d feat: add parser
squash d4e5f6a fix: handle empty input
fixup  b7c8d9e style: rename variable
```

- `squash`：合并，并让你编辑新的 commit message
- `fixup`：合并，但丢弃这条 commit 自己的 message

4. 保存退出后，Git 会按新的规则重放这些提交。
5. 如果用了 `squash`，Git 会再打开编辑器让你整理新的 commit message。以 `#` 开头的行都是注释。
6. 最后检查结果：

```bash
git log --oneline
```

**非相邻的 commit 怎么办**

如果要合并的 commit 不是挨着的，分两次做：

1. 先执行一次 `git rebase -i`，只调整顺序，让目标 commit 变成相邻。
2. 再执行一次 `git rebase -i`，把它们 squash 掉。

注意不要随意破坏逻辑顺序。提交重排不只是“好看”，它也可能改变冲突行为和历史语义。

**更顺手的做法：`--fixup` + `--autosquash`**

如果你一开始就知道某个小修补应该并回之前的某个提交：

```bash
git commit --fixup <target-sha>
git rebase -i --autosquash <base-sha>
```

Git 会自动把 fixup commit 挪到目标提交旁边，并标记成待合并状态。

**重写历史之后**

如果这个分支已经推到远端，更新时用：

```bash
git push --force-with-lease
```

尽量不要直接用 `git push -f`。`--force-with-lease` 更安全，它不会盲目覆盖你还没看到的远端更新。共享主干分支上的公开历史，也应尽量避免重写。

<u>经验法则</u>：`reset --soft` 更像是在移动指针；`rebase -i` 才是在整理历史。
