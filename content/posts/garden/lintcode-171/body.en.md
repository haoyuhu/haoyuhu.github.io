**Idea**

Use a hash map to group words that share the same character-frequency signature. For lowercase strings, a 26-slot count array is enough: two words are anagrams iff all 26 counts match.

Compared with sorting each string, this avoids the `O(k log k)` cost per word and keeps the solution at **O(n * k)**, where `n` is the number of strings and `k` is the average length.

**Key point**

Do not build the map with an index into a second container unless you need that structure. A direct `unordered_map<string, vector<string>>` is cleaner and easier to maintain.

**C++ implementation**

```cpp
class Solution {
public:
    vector<string> anagrams(vector<string> &strs) {
        unordered_map<string, vector<string>> groups;

        for (const string& s : strs) {
            groups[encodeKey(s)].push_back(s);
        }

        vector<string> result;
        for (auto& [key, group] : groups) {
            if (group.size() > 1) {
                result.insert(result.end(), group.begin(), group.end());
            }
        }
        return result;
    }

private:
    string encodeKey(const string& s) {
        vector<int> freq(26, 0);
        for (char c : s) {
            ++freq[c - 'a'];
        }

        string key;
        for (int count : freq) {
            key += '#' + to_string(count);
        }
        return key;
    }
};
```

**Why this version is better**

- **Clearer data flow**: build groups directly.
- **Safer signature**: separators like `#` avoid accidental ambiguity.
- **Same core idea**: hash by character counts.

<u>Takeaway</u>: for anagram grouping, a frequency signature is a compact and efficient canonical form.
