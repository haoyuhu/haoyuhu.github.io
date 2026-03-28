## Overview

A *Trie* (or prefix tree) is a tree-based data structure commonly used for efficient retrieval of strings, especially suited for prefix queries. This implementation supports three primary operations:

- `insert(word)`: Inserts a word into the trie.
- `search(word)`: Returns `true` if the exact word is in the trie.
- `startsWith(prefix)`: Returns `true` if there is any word in the trie that starts with the given prefix.

All inputs contain only lowercase English letters `a-z`.

---

## Core Design

Each node in the trie contains:

- An array of 26 pointers (`child[0]` for 'a', ..., `child[25]` for 'z'), initialized to `nullptr`.
- A boolean flag `isTail` indicating whether the node represents the end of a stored word.

The root node starts with all pointers null and `isTail` set to false.

> **Note:**
> - `startsWith(prefix)` only verifies if the prefix path exists; it does not require `prefix` to be a complete word.
> - `search(word)` requires that `word` correspond to a node marked `isTail`.


## Operation Details and Complexity

| Operation    | Description                                     | Time Complexity |
|--------------|-------------------------------------------------|-----------------|
| insert       | Insert each character sequentially, create nodes if missing | O(m) where m = word length |
| search       | Traverse nodes character by character, verify end flag | O(m) |
| startsWith   | Traverse nodes character by character without checking end flag | O(m) |


## Implementation (C++)

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

## Usage Example

```cpp
Trie trie;
trie.insert("apple");
bool search1 = trie.search("apple");   // returns true
bool search2 = trie.search("app");     // returns false
bool prefix1 = trie.startsWith("app"); // returns true
trie.insert("app");
bool search3 = trie.search("app");     // returns true
```

---

This direct implementation offers a clean, pointer-based solution suitable for embedded environments or high-performance scenarios where auxiliary data structures like hash maps are less ideal. It exemplifies foundational data structure design for string retrieval tasks.
