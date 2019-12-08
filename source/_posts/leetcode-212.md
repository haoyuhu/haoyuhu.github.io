---
title: LeetCode 212-Word Search II
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Given a 2D board and a list of words from the dictionary, find all words in the board.

Each word must be constructed from letters of sequentially adjacent cell, where "adjacent" cells are those horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

For example,
Given **words** = `["oath","pea","eat","rain"]` and **board** =

```
[
  ['o','a','a','n'],
  ['e','t','a','e'],
  ['i','h','k','r'],
  ['i','f','l','v']
]
```

Return `["eat","oath"]`.

**Note:**

You may assume that all inputs are consist of lowercase letters `a-z`.

## 分析
参照Word Search，我先尝试使用类似的方法。由于查询单词需要从board的某个坐标点(i, j)出发，如果查询每个单词都得遍历一遍board显然效率太低。因此我使用**一个哈希表**纪录了board中不同**字母起点**的坐标，比如例子中`‘a’`的起点有`[[0,1],[0,2],[1,2]]`。由此，在查询过程中可以直接从哈希表中取起点，无需遍历board。

但最后这个算法**`Time Limit Exceeded`**，原因如下：对于**相同前缀**的words中的若干个单词，我们机械地查找了多次，实际上只需要查询一次即可。如`["aaaaaa", "aaaaab", "aaaaac"]`，它们都具有相同的前缀`“aaaaa”`。改进方法后面再分析，先给出这个TLE的算法：

### TLE代码

```cpp
class Solution {
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        vector<string> answer;
        int row = board.size();
        int col = board[0].size();
        vector<vector<pair<int, int>>> store(26);

        for (int i = 0; i != row; ++i) {
            for (int j = 0; j != col; ++j) {
                int index = find(board[i][j]);
                store[index].push_back(make_pair(i, j));
            }
        }

        for (string word : words) {
            if (!word.size()) {
                answer.push_back("");
                break;
            }
            int index = find(word[0]);
            for (auto pair : store[index]) {
                if (search(board, pair.first, pair.second, word, 0)) {
                    answer.push_back(word);
                }
            }
        }
        return answer;
    }

    int find(char letter) { return static_cast<int> (letter - 'a'); }

    bool search(vector<vector<char>>& board, int i, int j, string word, int k) {
        if (++k == word.size()) return true;
        board[i][j] = 'X';
        int dx[] = {1, 0, -1, 0};
        int dy[] = {0, 1, 0, -1};
        for (int s = 0; s != 4; ++s) {
            int new_i = i + dy[s], new_j = j + dx[s];
            if (inBoard(board, new_i, new_j) 
                && board[new_i][new_j] == word[k] 
                && search(board, new_i, new_j, word, k)) {
                board[i][j] = word[--k];
                return true;
            }
        }
        board[i][j] = word[--k];
        return false;
    }

    bool inBoard(vector<vector<char>>& board, int i, int j) {
        int row = board.size(), col = board[0].size();
        return i < row && i >= 0 && j < col && j >= 0;
    }
};
```

正如上面分析的那样，这种基于哈希表的算法，每次**只查询一个单词**，显然这会导致重复工作。所以正确的做法是构造一个**字典树（Trie Tree）**，将字典树作为一个待查询的字符串集，在board中进行查找。

毋庸置疑，基于字典树的算法每次都查询整个字符串集，**避免了相同前缀多次搜索的问题**。字典树的实现请见[Leetcode208-Implement Trie (Prefix Tree)](http://www.huhaoyu.com/leetcode-implement-trie/)。

这里我在**Leetcode208**的基础上做了一些变化：

* 不使用`bool`类型的`isTail`来标识`word`的末尾。而用`string*`指针指向`words`中的单词。原因在于，当知道到达一个待查询单词的末尾时，需要将它加入`answer`中，显然`isTail`只能告诉我们到了末尾，却不能告诉我们单词是什么。
* 本题构造的字典树不需要`search(key)`方法。因为此处的字典树是待查询的字符串集，而非被查询的字典。
* 使用了新的c++语法。
* 搜索路径上同一个字母不能多次使用。因此经过一个`board`上的节点，都将其标记为`‘X’`，因为本题承诺所有的输入都是小写字母，所以这样没有问题。在**递归结束**时需要将`board`上标记为`'X'`的点都**复原**。

### AC代码

```cpp
int find(char letter) { return static_cast<int> (letter - 'a'); }

class TrieNode {
public:
    string * wordLocation;
    TrieNode * letters[26];

    TrieNode() {
        wordLocation = NULL;
        for (int i = 0; i != 26; ++i) { letters[i] = NULL; }
    }
};

class WordsDictionary {
public:
    WordsDictionary(): root(new TrieNode()) {}

    void addWord(string& word) {
        TrieNode * curr = root;

        for (int i = 0; i != word.size(); ++i) {
            int index = find(word[i]);
            if (!curr->letters[index]) {
                curr->letters[index] = new TrieNode();
            }
            curr = curr->letters[index];
        }
        curr->wordLocation = &word;
    }

    TrieNode* root;
};

class Solution {
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        vector<string> answer;
        WordsDictionary wordsDict;
        unordered_set<string> check;
        int row = board.size(), col = board[0].size();

        for (string& word : words) {
            wordsDict.addWord(word);
        }

        for (int i = 0; i != row; ++i) {
            for (int j = 0; j != col; ++j) {
                findWordsInBoard(board, i, j, wordsDict.root, answer, check);
            }
        }

        return answer;
    }

    void findWordsInBoard(vector<vector<char>>& board, int i, int j, TrieNode * curr, vector<string>& answer, unordered_set<string>& check) {
        if (!inBoard(board, i, j) || board[i][j] == 'X') return;

        char currentLetter = board[i][j];
        int dx[] = {1, 0, -1, 0};
        int dy[] = {0, 1, 0, -1};
        int index = find(currentLetter);
        board[i][j] = 'X';

        if (curr->letters[index]) {
            string * location = curr->letters[index]->wordLocation;
            if (location && check.find(*location) == check.end()) {
                answer.push_back(*curr->letters[index]->wordLocation);
                check.insert(*location);
            }
            for (int k = 0; k != 4; ++k) {
                findWordsInBoard(board, i + dy[k], j + dx[k], curr->letters[index], answer, check);
            }
        }
        board[i][j] = currentLetter;
    }

    bool inBoard(vector<vector<char>>& board, int i, int j) {
        int row = board.size();
        int col = board[0].size();

        return i >= 0 && i < row && j >= 0 && j < col;
    }
};
```