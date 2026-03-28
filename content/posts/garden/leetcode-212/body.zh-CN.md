## 问题描述

给定一个二维字符网格和一个单词列表，从字典中找出所有能在网格中按规则连续匹配的单词。

**规则说明：**

- 单词必须由相邻细胞中字母按顺序构成。
- 相邻细胞指的是水平或垂直相邻。
- 同一个单元格中的字母不允许重复使用。

**示例：**

```plaintext
单词列表：["oath","pea","eat","rain"]
网格：
[
  ['o','a','a','n'],
  ['e','t','a','e'],
  ['i','h','k','r'],
  ['i','f','l','v']
]
结果：["eat","oath"]
```

输入保证全为小写字母。

---

## 初始朴素解法：基于字母起点哈希

以单词搜索 I 的思路为参考，最直观的做法是针对每个单词独立进行全局搜索。为减少遍历次数，可以先遍历 board，将每个字母对应的位置存入哈希表。查询单词时直接根据首字母找到起点进行 DFS 搜索。

然而该方法依然存在效率瓶颈，如果多个单词拥有相同前缀，将重复搜索相似路径，严重浪费时间。

### TLE 代码策略回顾

- 对每个单词，遍历所有首字母坐标启动 DFS。
- 搜索过程中合理标记访问，避免重复使用同一格子。
- 搜索路径没有共享——对于相同前缀局部多次搜索。

### 性能瓶颈

词组如 `["aaaaaa", "aaaaab", "aaaaac"]`大面积重复 DFS。

---

## 优化方案：引入字典树（Trie）

构建词典中所有单词的 Trie，然后以 Trie 根节点为起点，从网格每个单元格开始 DFS：

- 每次 DFS 只探索 Trie 中的子节点。
- 遇到单词末尾即记录答案。
- 避免重复单词记录。

这一思路核心优势是单次遍历能涵盖所有词，不重复走共同前缀路径。

## 实现细节

### Trie 节点结构

- 长度固定的26元素指针数组表示子节点。
- 利用字符串指针指向该节点对应的单词（若存在），方便快速访问。

### 算法流程解读

```mermaid
flowchart TD
    A[构造Trie树] --> B{遍历board每个格子(i,j)}
    B --> C[以Trie根节点为起点的DFS]
    C --> D{board字母匹配Trie子节点?}
    D -- 是 --> E{是否构成单词末尾?}
    E -- 是 --> F[加入结果集]
    E --> G[继续遍历相邻格]
    D -- 否 --> H[回溯]
    G --> H
    H --> I[继续下一个格子搜索]
```

### DFS细节

- 越界或访问过的直接终止。
- 从Trie节点的children中匹配当前字母。
- 访问当前格子标记为已用，递归遍历四个邻居。
- DFS完成时回复现场。

---

## 代码示例

### Trie和插入操作

```cpp
class TrieNode {
public:
    string* word = nullptr;
    TrieNode* children[26] = {nullptr};
    TrieNode() = default;
};

class Trie {
public:
    Trie() : root(new TrieNode()) {}

    void insert(string &word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx])
                node->children[idx] = new TrieNode();
            node = node->children[idx];
        }
        node->word = &word;
    }

    TrieNode* root;
};
```

### 主解法和DFS

```cpp
class Solution {
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        Trie trie;
        for (auto &word : words) trie.insert(word);

        vector<string> result;
        unordered_set<string> found;
        int rows = board.size(), cols = board[0].size();

        for (int i = 0; i < rows; ++i) {
            for (int j = 0; j < cols; ++j) {
                backtrack(board, i, j, trie.root, result, found);
            }
        }

        return result;
    }

private:
    void backtrack(vector<vector<char>>& board, int i, int j, TrieNode* node,
                   vector<string>& result, unordered_set<string>& found) {
        if (i < 0 || i >= board.size() || j < 0 || j >= board[0].size()) return;
        char c = board[i][j];
        if (c == 'X') return;

        TrieNode* nextNode = node->children[c - 'a'];
        if (!nextNode) return;

        if (nextNode->word && found.find(*nextNode->word) == found.end()) {
            result.push_back(*nextNode->word);
            found.insert(*nextNode->word);
        }

        board[i][j] = 'X';

        int directions[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
        for (auto &d : directions) {
            backtrack(board, i + d[0], j + d[1], nextNode, result, found);
        }

        board[i][j] = c; // 恢复
    }
};
```

---

## 总结

Trie树作为多模式串匹配的数据结构，能有效共享搜索前缀，极大减少Word Search II中冗余DFS调用次数。该方法已成为处理此类问题的标准范式。

---

## 标签
LeetCode，算法，字典树，回溯，深度优先搜索
