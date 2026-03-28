## Problem Overview

Given a 2D board of characters and a list of words, the goal is to find all words on the board constructed from sequentially adjacent cells (horizontally or vertically), with no reuse of the same cell for a single word.

**Example:**

```plaintext
Words: ["oath","pea","eat","rain"]
Board:
[
  ['o','a','a','n'],
  ['e','t','a','e'],
  ['i','h','k','r'],
  ['i','f','l','v']
]

Result: ["eat","oath"]
```

All inputs consist solely of lowercase English letters ('a'-'z').

---

## Initial Naive Approach: Starting Point Hashing

The brute force method mimics Word Search I, but querying each word independently by scanning the board results in excessive redundant search, especially for words sharing prefixes.

To mitigate scanning the whole board repeatedly, we preprocess the board to build a hash map storing starting coordinates for each letter:

- For each letter `c` in the board, store all positions `(i, j)` where it appears.

On searching a word, lookup the starting letter's positions directly to begin searches.

However, this approach still exceeds time limits because words with common prefixes cause repetitive exploration of overlapping search paths.

### TLE Version (Simplified Explanation)

- For each word, start DFS from every occurrence of its first letter.
- Mark visited cells as used during search.
- No sharing of search paths between words.

### Key Inefficiency

Repeated DFS traversals for words like `["aaaaaa", "aaaaab", "aaaaac"]` where large prefixes overlap.

---

## Optimized Solution: Using a Trie (Prefix Tree)

Build a Trie to represent **all words collectively**. Then, traverse the board once per cell, performing DFS with Trie guidance:

- Each step validates whether the current letter matches a Trie child node.
- When hitting a Trie node representing a complete word, add it to the result set.
- Mark visited board cells to avoid reuse.

This approach effectively:

- Eliminates redundant prefix searches.
- Searches all words simultaneously in one DFS traversal.

## Implementation Details

### Trie Node Structure

- Each node contains pointers to 26 children (for letters 'a' to 'z').
- Stores a `string*` pointer to the complete word terminating at that node (if any), enabling direct retrieval when a word is found.

### Algorithm Flow

```mermaid
flowchart TD
    A[Build Trie from words] --> B{For each cell (i,j) on board}
    B --> C[DFS from cell with Trie root]
    C --> D{Current board letter matches Trie child?}
    D -- Yes --> E{Is node a word end?}
    E -- Yes --> F[Add word to answer set]
    E --> G[Explore neighbors with DFS]
    D -- No --> H[Backtrack]
    G --> H
    H --> I[Continue to next cell]
```

### DFS Procedure

- Check bounds and whether the cell is visited ('X' marks visited).
- Retrieve corresponding child Trie node.
- Mark current cell as visited.
- If a word is found, add it to results and mark as found to prevent duplicates.
- Recursively explore 4 adjacent cells.
- Backtrack by restoring the original letter.

---

## Code Snippets

### Trie Structure and Insertion

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
        node->word = &word; // Store pointer for retrieval
    }

    TrieNode* root;
};
```

### Solution: Board DFS with Trie

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

        board[i][j] = 'X'; // mark visited

        int directions[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
        for (auto &d : directions) {
            backtrack(board, i + d[0], j + d[1], nextNode, result, found);
        }

        board[i][j] = c; // restore
    }
};
```

---

## Conclusion

Using a Trie allows simultaneous multi-word searching on the board without redundant DFS calls for common prefixes, overcoming the naive hash-based method's time limit issues. This is a canonical optimization pattern for word search problems involving multiple lookups.

---

## Tags
LeetCode, Algorithms, Trie, Backtracking, DFS
