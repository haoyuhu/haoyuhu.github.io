### Overview
The challenge is to detect all 10-letter-long DNA sequences that appear more than once in a given string. DNA characters limited to {A, C, G, T} can be represented efficiently, enabling a more memory- and time-efficient solution.

### Key Idea: Encoding DNA as Bits
Each DNA base is encoded as 2 bits:
- A → 00
- C → 01
- G → 10
- T → 11

A 10-letter DNA substring translates into a 20-bit integer (`10 * 2 = 20 bits`). This allows the use of `unordered_set<int>` instead of expensive `unordered_set<string>`, reducing both memory footprint and comparison overhead.

### Sliding Window With Bitmasking
We use a rolling hash like approach:
- Generate the integer hint for the first 10 letters.
- For each subsequent sequence, remove the 2 high bits corresponding to the leftmost character, then left shift by 2 and add the new character’s bits.

This is efficiently achieved by:
```cpp
hint = ((hint & eraser) << 2) + ati[s[i]];
```
where 
- `eraser = 0x3FFFF` (binary: 0011 1111 1111 1111 1111) which masks the lowest 18 bits, effectively removing the highest 2 bits of the 20-bit integer,
- `ati` maps chars to bits.

### De-duplication Strategy
We keep two sets:
| Set          | Purpose                                   |
|--------------|-------------------------------------------|
| `repeated`   | Stores all seen sequence bit representations |
| `check`      | Keeps track of sequences already added to the answer (to avoid duplicates) |

When a sequence's hint is found in `repeated` but not in `check`, the substring is pushed to the result.

---

### Code Example
```cpp
class Solution {
public:
    #define eraser 0x3FFFF  // 20-bit mask with highest 2 bits cleared

    std::vector<std::string> findRepeatedDnaSequences(std::string s) {
        std::vector<std::string> answer;
        if (s.size() < 10) return answer;

        std::unordered_map<char,unsigned int> ati{{'A',0}, {'C',1}, {'G',2}, {'T',3}};
        std::unordered_set<unsigned int> repeated, check;

        unsigned int hint = 0;
        for(int i = 0; i < 10; ++i) {
            hint = (hint << 2) + ati[s[i]];
        }
        repeated.insert(hint);

        for(int i = 10; i < s.size(); ++i) {
            hint = ((hint & eraser) << 2) + ati[s[i]];
            if (repeated.count(hint)) {
                if (!check.count(hint)) {
                    answer.emplace_back(s.substr(i - 9, 10));
                    check.insert(hint);
                }
            } else {
                repeated.insert(hint);
            }
        }
        return answer;
    }
};
```

### Notes
- Careful with operator precedence to avoid bugs in shifting and masking.
- Using bit encoding reduces memory and improves lookup speed compared with raw strings.

---

### Summary Table
| Aspect          | String-based Approach        | Bitmask Optimization          |
|-----------------|------------------------------|-------------------------------|
| Memory          | Stores full strings          | Stores compact 20-bit ints    |
| Lookup          | Expensive string hashing     | Integer hashing (faster)      |
| Implementation  | Simple but slower            | Needs careful bit operations  |
| Time Complexity | ~O(n * 10) string compares   | O(n) sliding window + hashing |

This approach demonstrates how domain knowledge (fixed DNA alphabet) enables compact and efficient algorithms.
