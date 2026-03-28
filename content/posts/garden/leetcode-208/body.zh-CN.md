## 题目概述

字典树（Trie）是一种基于树的数据结构，特别适合于字符串的高效检索，尤其是前缀查询。此实现支持以下三种基本操作：

- `insert(word)`：向字典树中插入一个单词。
- `search(word)`：判断字典树中是否存在该完整单词。
- `startsWith(prefix)`：判断是否存在以指定前缀开始的任何单词。

所有输入均为小写英文字母 `a-z`。

---

## 核心设计

每个节点包含：

- 一个长度为26的指针数组 `child[0]` 对应字母 'a'，`child[25]` 对应字母 'z'，初始化为 `nullptr`。
- 一个布尔类型的标志 `isTail`，表示该节点是否为单词结尾。

根节点初始化时所有指针为 null，`isTail` 为 false。

> **注意：**
>
> - `startsWith(prefix)` 方法只需判断路径是否存在，无需 `prefix` 是完整单词的结尾。
> - `search(word)` 要求匹配的节点必须是单词的结尾节点（`isTail == true`）。


## 操作细节及复杂度

| 操作        | 描述                            | 时间复杂度 |
|-------------|---------------------------------|------------|
| 插入        | 按字符顺序创建或遍历子节点        | O(m), m为单词长度 |
| 搜索        | 按字符遍历节点，最后检查结束标志  | O(m)       |
| 前缀查找    | 按字符遍历，检查路径存在即可       | O(m)       |


## 代码实现（C++）

```cpp
class TrieNode {
public:
    TrieNode() : isTail(false) {
        for (int i = 0; i < 26; ++i) {
            child[i] = nullptr;
        }
    }

    TrieNode* child[26];
    bool isTail;
};

class Trie {
public:
    Trie() {
        root = new TrieNode();
    }

    void insert(const std::string& word) {
        TrieNode* curr = root;
        for (char ch : word) {
            int index = ch - 'a';
            if (!curr->child[index]) {
                curr->child[index] = new TrieNode();
            }
            curr = curr->child[index];
        }
        curr->isTail = true;
    }

    bool search(const std::string& word) {
        TrieNode* curr = root;
        for (char ch : word) {
            int index = ch - 'a';
            if (!curr->child[index]) return false;
            curr = curr->child[index];
        }
        return curr->isTail;
    }

    bool startsWith(const std::string& prefix) {
        TrieNode* curr = root;
        for (char ch : prefix) {
            int index = ch - 'a';
            if (!curr->child[index]) return false;
            curr = curr->child[index];
        }
        return true;
    }

private:
    TrieNode* root;
};
```

## 使用示例

```cpp
Trie trie;
trie.insert("apple");
bool res1 = trie.search("apple");   // 返回 true
bool res2 = trie.search("app");     // 返回 false
bool res3 = trie.startsWith("app"); // 返回 true
trie.insert("app");
bool res4 = trie.search("app");     // 返回 true
```

---

这个代码示例是基于指针的经典实现，适合对内存布局和速度有要求的场景。其结构简单清晰，是理解字典树工作原理的不二参考。
