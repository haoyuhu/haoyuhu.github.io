---
title: LeetCode 211-Add and Search Word-Data structure design
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Design a data structure that supports the following two operations:

```
void addWord(word)
bool search(word)
```

`search(word)` can search a literal word or a regular expression string containing only letters `a-z` or `.`. A `.` means it can represent any one letter.

For example:

```
addWord("bad")
addWord("dad")
addWord("mad")
search("pad") -> false
search("bad") -> true
search(".ad") -> true
search("b..") -> true
```

Note:
You may assume that all words are consist of lowercase letters `a-z`.

## **题意**
设计一种数据结构支持如下两个操作：

```
void addWord(word)
bool search(word)
```

`search(word)` 可以搜索普通字母 `a-z` 或 `.`。其中， `.` 可以代表任意一个字母。

### 举例如下：

```
addWord("bad")
addWord("dad")
addWord("mad")
search("pad") -> false
search("bad") -> true
search(".ad") -> true
search("b..") -> true
```

### 提示：
提供的所有单词都是由小写字母 `a-z` 组成。

## **分析**
不管用hash还是trie，插入（`addWord(string word)`）的时间复杂度最好就是**`Σni`**，即所有字典集元素的字符个数。而查找（`search(string word)`）的时间复杂度则不同。由于`.`的存在，使得hash的O(1)查找失去了优势。而`Trie Tree`则可以在遇到`.`时递归地搜索对应节点下的每一个letter。

## **AC代码**

```cpp
class TrieNode {
public:
    TrieNode() {
        isTail = false;
        for (TrieNode *&letter : letters) { letter = NULL; }
    }
    bool isTail;
    TrieNode *letters[26];
};

class WordDictionary {
public:
    WordDictionary() { root = new TrieNode(); }
    // Adds a word into the data structure.
    void addWord(string word) {
        TrieNode *curr = root;
        for (char letter : word) {
            int index = find(letter);
            if (!curr->letters[index]) {
                curr->letters[index] = new TrieNode();
            }
            curr = curr->letters[index];
        }
        curr->isTail = true;
    }

    // Returns if the word is in the data structure. A word could
    // contain the dot character '.' to represent any one letter.
    bool search(string word) {
        return dfs_search(word, 0, root);
    }
private:
    TrieNode *root;

    int find(char letter) {
        return static_cast<int>(letter - 'a');
    }

    bool dfs_search(string word, int i, TrieNode *curr) {
        if (!curr) return false;
        if (word.size() == i) { return curr->isTail; }

        if (word[i] != '.') {
            return dfs_search(word, i + 1, curr->letters[find(word[i])]);
        } else {
            for (int k = 0; k != 26; ++k) {
                if (curr->letters[k] && dfs_search(word, i + 1, curr->letters[k])) {
                    return true;
                }
            }
        }
        return false;
    }
};

// Your WordDictionary object will be instantiated and called as such:
// WordDictionary wordDictionary;
// wordDictionary.addWord("word");
// wordDictionary.search("pattern");
```