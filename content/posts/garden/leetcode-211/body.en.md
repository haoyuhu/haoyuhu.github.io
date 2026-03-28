## Problem Overview

Implement a data structure with two core operations:

```cpp
void addWord(string word);
bool search(string word);
```

The `search` operation supports searching for literal strings or strings containing a wildcard `.` that matches any single letter.

### Examples

```cpp
addWord("bad");
addWord("dad");
addWord("mad");

search("pad"); // returns false
search("bad"); // returns true
search(".ad"); // returns true
search("b.."); // returns true
```

All words contain only lowercase letters `a-z`.

---

## Key Insights and Data Structure Choice

- **Insertion Complexity:** For adding words, complexity is O(L) per word, where L is word length.
- **Search Complexity:** Without wildcards, hash-based lookup is O(1); however, the `.` wildcard requires the ability to explore multiple candidates.
- **Why Trie?** Trie supports prefix-based traversal and easily accommodates wildcard searches through recursive backtracking.

---

## Algorithm Design

Using a Trie node containing 26 children representing letters 'a' to 'z' and a boolean flag indicating whether a node marks the end of a valid word.

- **addWord:** Traverse the Trie nodes corresponding to each character; create new nodes as needed. Mark the last node as the end of the word.
- **search:** Recursively traverse based on the characters:
  - If character is not `.`, move down the corresponding child.
  - If `.`, recursively search all non-null children at this node.

This recursive search approach enables thorough exploration where wildcards exist.

---

## Implementation

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

## Complexity Summary

| Operation   | Time Complexity           | Notes                        |
|-------------|---------------------------|------------------------------|
| addWord     | O(L)                      | L = length of the word       |
| search      | O(26^k * L) worst-case*   | k = count of wildcards `.`   |

> *The worst-case exponential complexity arises if multiple wildcards appear consecutively since we explore all branches.

---

## Conclusion

This Trie-based design effectively balances insertion efficiency with flexible wildcard-enabled searching. It is the standard approach for problems requiring pattern matching with limited alphabet sets and customizable query rules.

---
