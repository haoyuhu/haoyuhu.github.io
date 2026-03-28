## Overview

Maintaining a clean, well-structured commit history is an essential skill in collaborative software development. When working on substantial features or refactoring, your initial commits may be messy — scattered with minor fixes, unrelated changes, or incomplete thoughts. This guide covers a systematic approach to refining commit history using Git's powerful features.

The key workflow leverages **branching**, **interactive rebase**, **soft reset**, and **stash**, followed by careful incremental recommit.

---

## Key Steps and Command Overview

| Command                            | Purpose                                                       |
|----------------------------------|---------------------------------------------------------------|
| `git checkout -b <new_branch>`   | Create a new branch to isolate the cleanup work                |
| `git rebase -i <working_base>`   | Interactive rebase to combine scattered commits into one       |
| `git reset --soft HEAD~1`         | Revert to previous commit but keep all changes staged         |
| `git stash save "stash message"` | Save the combined changes into stash for incremental commits |

This initial consolidation reduces complex histories into a single staged snapshot, preparing for the next step of granular commits.

---

## Analyzing and Splitting Changes

Inspect the stash to understand the composition of changes:

```bash
$ git diff stash
```

**Example scenario:**

| File | Purpose                           |
|-------|-----------------------------------|
| a     | Purpose I                        |
| b     | Purpose II                       |
| c     | Purposes II & III                |
| d     | Purposes II & IV                 |
| e     | Purpose III                     |

You can organize commits by these distinct purposes:

| Commit | Purpose    | Files Included                |
|---------|------------|------------------------------|
| 1       | Purpose I  | a                            |
| 2       | Purpose II | b, part of c and d           |
| 3       | Purpose III| rest of c, e                 |
| 4       | Purpose IV | remainder of d               |

---

## Detailed Workflow for Each Commit

### Commit 1

| Command                        | Explanation                                  |
|-------------------------------|----------------------------------------------|
| `git checkout stash -- a`      | Extract file 'a' from stash to the working tree (staged) |
| `git commit -s`                | Finalize commit with sign-off                  |

### Commit 2

| Command                       | Explanation                                                        |
|------------------------------|--------------------------------------------------------------------|
| `git checkout stash .`         | Retrieve all files from stash (careful: don't use `git stash pop`) |
| `git reset HEAD`               | Unstage all files but keep changes in working directory            |
| `git add b`                   | Stage all changes in file 'b'                                      |
| `git add -p c`                | Interactively stage parts of file 'c'                              |
| `git add -p d`                | Interactively stage parts of file 'd'                              |
| `git commit -s`               | Commit the staged changes                                          |
| `git clean -dfx`              | Clean untracked files/directories cleaning leftover changes         |

#### Notes on `git add -p`

This interactive mode lets you selectively stage hunks within files:

```
  Stage this hunk [y,n,e,?]? 
  y - stage this hunk
  n - skip
  e - manually edit this hunk by splitting
```

Manual edit is useful to further split changes for granular commits.

### Subsequent commits

Follow a similar procedure: checkout from stash, reset, selectively stage, commit, and clean.

---

## Troubleshooting and Tips

| Scenario                                  | Remedy                                                                       |
|-------------------------------------------|------------------------------------------------------------------------------|
| Need to amend commits after checkpoint     | Use `git rebase -i <commit>~1` with 'edit'; adjust staged files; `git rebase --continue` |
| Need to split an earlier commit             | Interactive rebase with 'edit'; `git reset --mixed HEAD~1`; split changes and commit incrementally |
| Conflicts during rebase                     | Manually resolve conflicts; `git add <file>`; `git rebase --continue`         |
| Viewing history per file                    | `git log <file>`, `git log -p <file>`, or `git diff <commit> <commit> -- <file>`|

---

## Summary Diagram

```mermaid
flowchart TD
    A[Start: messy commits] --> B[Create new branch]
    B --> C[Interactive rebase]
    C --> D[Soft reset to base]
    D --> E[Stash changes]
    E --> F[Analyze stash diff]
    F --> G[Selectively checkout & stage files (git add -p)]
    G --> H[Commit 1]
    H --> I[Repeat for Commit 2..N]
    I --> J[Clean working directory]
    J --> K[Finished: clean commit history]
```

This structured approach ensures manageable, readable, and semantically clear commits suitable for long-term maintenance and collaboration.
