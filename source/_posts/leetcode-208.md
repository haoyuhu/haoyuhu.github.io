---
title: LeetCode 208-Implement Trie (Prefix Tree)
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Implement a trie with insert, search, and startsWith methods.   
Note:   
You may assume that all inputs are consist of lowercase letters a-z.

### 题意
实现一个字典树，包含插入、查找和前缀查找功能。所有的输入都是小写字母a-z。

### 分析
就是一个正常的字典树实现，每个节点包含26个指向孩子节点的指针，和标识字典中单词结尾的isTail标识。初始化时26个指针`child[i]`为`NULL`，`isTail`为`false`。

### 注意
* `startsWith(prefix)`方法不需要待检查的`prefix`是字典树中单词的结尾；
* `search(key)`方法要求待检查`key`是字典树中单词的结尾；
* 对指针数组的声明应该是`TrieNode *child[26]`。

### AC代码

```c++
class TrieNode {
public:
    // Initialize your data structure here.
    TrieNode() {
        for (int i = 0; i != 26; ++i) {
            child[i] = NULL;
            isTail = false;
        }
    }
    TrieNode *child[26];
    bool isTail;
};

class Trie {
public:
    Trie() {
        root = new TrieNode();
    }

    // Inserts a word into the trie.
    void insert(string s) {
        TrieNode *curr = root;
        for (int i = 0; i != s.size(); ++i) {
            int index = find(s[i]);
            if (!curr->child[index]) {
                curr->child[index] = new TrieNode();
            }
            curr = curr->child[index];
        }
        curr->isTail = true;
    }

    // Returns if the word is in the trie.
    bool search(string key) {
        TrieNode *curr = root;
        for (int i = 0; i != key.size(); ++i) {
            int index = find(key[i]);
            if (!curr->child[index]) return false;
            curr = curr->child[index];
        }
        if (!curr->isTail) return false;
        return true;
    }

    // Returns if there is any word in the trie
    // that starts with the given prefix.
    bool startsWith(string prefix) {
        TrieNode *curr = root;
        for (int i = 0; i != prefix.size(); ++i) {
            int index = find(prefix[i]);
            if (!curr->child[index]) return false;
            curr = curr->child[index];
        }
        return true;
    }

private:
    TrieNode* root;
    int find(char ch) { return ch - 'a'; }
};

// Your Trie object will be instantiated and called as such:
// Trie trie;
// trie.insert("somestring");
// trie.search("key");
```