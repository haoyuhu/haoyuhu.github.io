## Problem Overview
Given a string `S`, the goal is to add the minimum number of characters **in front of `S`** to transform it into a palindrome. The output should be the shortest palindrome formed this way.

### Examples
- Input: `"aacecaaa"`
  - Output: `"aaacecaaa"`

- Input: `"abcd"`
  - Output: `"dcbabcd"`

## Initial Analysis
A naive approach involves taking the reverse string `reverse_s` and trying to find the longest prefix of `S` that is a suffix of `reverse_s`. This can be thought of as pattern matching where `S` is the pattern and `reverse_s` is the text. The complexity of such a brute-force matching is O(n²).

For instance, with `S = "abcd"` and `reverse_s = "dcba"`, the longest matching substring ends at `a`:

| reverse_s | d | c | b | **a** | - | - | - |
| --------- | - | - | - | --- | - | - | - |
| S         | - | - | - | **a** | b | c | d |

Similarly, for `S = "aacecaaa"` and `reverse_s = "aaacecaa"`:

| reverse_s | a | a | a | c | e | c | a | a | - |
| --------- | - | - | - | - | - | - | - | - | - |
| S         | - | **a** | **a** | **c** | **e** | **c** | **a** | **a** | a |

## Optimal Approach: Modified KMP Algorithm
The key insight is that using the **Knuth–Morris–Pratt (KMP)** algorithm allows solving the problem in **O(n)** time by leveraging prefix-function computations.

### Key Modifications
- Use `reverse_s` as the text and `S` as the pattern for KMP searching.
- Track the matching progress and stop when the end of `reverse_s` is reached with a successful match.
- The index at which the final match ends in `S` corresponds to the longest palindromic prefix.
- Prepending the reverse of the suffix (beyond this prefix) in `S` to the front yields the shortest palindrome.

### Algorithm Steps

```mermaid
flowchart TD
    A[Start]
    B[Reverse string -> reverse_s]
    C[Build KMP "next" array for S]
    D[Match reverse_s against S using KMP]
    E[Find longest prefix substring ending at last char of reverse_s]
    F[Prepend reverse of suffix not in prefix]
    G[Return shortest palindrome]
    
    A --> B --> C --> D --> E --> F --> G
```

## Code Implementation (C++)

```cpp
class Solution {
public:
    string shortestPalindrome(string s) {
        if (s.empty()) return s;
        string reverse_s(s);
        reverse(reverse_s.begin(), reverse_s.end());
        int mark = 0;
        vector<int> next(s.size());
        makeNext(s, next);

        int j = 0;
        for (int i = 0; i < reverse_s.size(); ) {
            if (j == -1 || reverse_s[i] == s[j]) {
                ++i; ++j;
                if (i == reverse_s.size()) {
                    mark = j; // longest prefix matched
                }
            } else {
                j = next[j];
            }
        }
        return mark == s.size() ? s : reverse_s + s.substr(mark);
    }

private:
    void makeNext(const string& s, vector<int>& next) {
        next[0] = -1;
        int j = -1;
        for (int i = 0; i < (int)s.size() - 1; ) {
            if (j == -1 || s[i] == s[j]) {
                ++i; ++j;
                next[i] = (s[i] == s[j]) ? next[j] : j;
            } else {
                j = next[j];
            }
        }
    }
};
```

### Notes
- The `next` array is a modified KMP failure function used to speed up matching.
- `mark` records the length of the longest palindromic prefix.
- Appending the unmatched suffix reversed (from `reverse_s`) in front guarantees the minimum addition for palindrome.

This approach capitalizes on KMP's linear-time pattern matching to quickly find the longest palindromic prefix and build the shortest palindrome efficiently.
