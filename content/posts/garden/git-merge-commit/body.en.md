**Why `rebase -i`**

`git reset --soft` + recommit can flatten recent history, but it is a blunt tool. In collaborative work, you often rebase onto `upstream` before pushing. Once that happens, your local branch may already include other people's commits. If you reset to an older point and commit again, you can accidentally bundle those upstream changes into a commit that should represent only your own edits.

`git rebase -i` solves the right problem: rewrite only the commits you want to clean up.

**Squash adjacent commits**

1. Find the commit immediately before the range you want to rewrite:

```bash
git log --oneline
```

2. Start interactive rebase from that commit's **SHA**:

```bash
git rebase -i <base-sha>
# or, for recent history
git rebase -i HEAD~3
```

3. In the todo list:
   - keep the first target commit as `pick`
   - change later commits to `squash` (`s`) or `fixup` (`f`)

```text
pick   a1b2c3d feat: add parser
squash d4e5f6a fix: handle empty input
fixup  b7c8d9e style: rename variable
```

- `squash`: merge and edit the combined commit message
- `fixup`: merge and discard that commit's message

4. Save and exit. Git will replay the commits.
5. If you used `squash`, edit the new commit message. Lines starting with `#` are comments.
6. Verify the result:

```bash
git log --oneline
```

**Non-adjacent commits**

If the commits are not next to each other, do it in two passes:

1. Run `git rebase -i` once to reorder them until the target commits are adjacent.
2. Run it again to squash them.

Keep the logical order intact. Reordering history can change both meaning and conflict behavior.

**A cleaner flow: `--fixup` + `--autosquash`**

When a small patch clearly belongs in an earlier commit:

```bash
git commit --fixup <target-sha>
git rebase -i --autosquash <base-sha>
```

Git will move the fixup commit next to its target and mark it for merging automatically.

**After rewriting history**

If the branch has already been pushed, update the remote with:

```bash
git push --force-with-lease
```

Prefer this over `git push -f`. It is safer and less likely to overwrite remote work you have not seen. Avoid rewriting public history on shared mainline branches.

**Rule of thumb**: `reset --soft` moves pointers; `rebase -i` curates history.
