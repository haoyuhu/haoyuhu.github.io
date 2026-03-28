## 题目概述

设计一个数据结构，支持如下两个核心操作：

```cpp
void addWord(string word);
bool search(string word);
```

其中，`search` 支持搜索普通字符串或包含通配符`.`的模式，`.`可匹配任意一个字母。

### 示例

```cpp
addWord("bad");
addWord("dad");
addWord("mad");

search("pad"); // 返回 false
search("bad"); // 返回 true
search(".ad"); // 返回 true
search("b.."); // 返回 true
```

题中所有单词均由小写字母 `a-z` 组成。

---

## 核心思路及数据结构选择

- **插入时间复杂度：**每次添加单词为 O(L)，L 为单词长度。
- **查询时间复杂度：**无通配符时，哈希查询可达 O(1)；但当有`.`通配符，需要支持遍历多条路径。
- **为何选择Trie树？**Trie适合前缀匹配，也方便处理`.`通配符，通过递归回溯完成多分支搜索。

---

## 算法设计

Trie节点包含26个子节点，分别代表字符`a`至`z`，及一个标识单词结束的布尔值。

- **addWord：**沿路径插入字符节点，缺少则新建；单词末尾节点标记结束。
- **search：**递归查找：
  - 非`.`字符对应单一路径下探；
  - 遇到`.`字符时，递归遍历所有非空子节点，直至匹配完成。

该递归策略确保正确搜索所有通配符可能匹配路径。

---

## 代码实现

```cpp
class TrieNode {
public:
    bool isEndOfWord = false;
    TrieNode* children[26] = {nullptr};
};

class WordDictionary {
private:
    TrieNode* root;

    int charToIndex(char c) { return c - 'a'; }

    bool dfsSearch(const std::string& word, int pos, TrieNode* node) {
        if (!node) return false;
        if (pos == word.size()) return node->isEndOfWord;

        char c = word[pos];
        if (c != '.') {
            return dfsSearch(word, pos + 1, node->children[charToIndex(c)]);
        } else {
            for (int i = 0; i < 26; i++) {
                if (node->children[i] && dfsSearch(word, pos + 1, node->children[i])) {
                    return true;
                }
            }
            return false;
        }
    }

public:
    WordDictionary() {
        root = new TrieNode();
    }

    void addWord(const std::string& word) {
        TrieNode* curr = root;
        for (char c : word) {
            int idx = charToIndex(c);
            if (!curr->children[idx]) {
                curr->children[idx] = new TrieNode();
            }
            curr = curr->children[idx];
        }
        curr->isEndOfWord = true;
    }

    bool search(const std::string& word) {
        return dfsSearch(word, 0, root);
    }
};
```

---

## 复杂度总结

| 操作       | 时间复杂度               | 备注                   |
|------------|-------------------------|------------------------|
| addWord    | O(L)                    | L为单词长度            |
| search     | 最坏O(26^k * L)         | k为`.`通配符个数       |

> *最坏复杂度主要由于多通配符导致分支爆炸，要注意输入场景限制。

---

## 总结

此设计基于Trie的结构，兼顾了插入的高效性和对通配符的灵活支持，适合有限字母集的复杂模式匹配，是此题的经典解决方案。
