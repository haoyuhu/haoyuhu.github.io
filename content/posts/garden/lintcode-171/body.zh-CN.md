**思路**

使用哈希表将具有相同字符频次签名的单词分到同一组。对于只包含小写字母的字符串，一个长度为 26 的计数数组就足够了：当且仅当 26 个位置上的计数都相同，两个单词才是字母异位词。

相比对每个字符串排序，这样可以避开每个单词 `O(k log k)` 的开销，并将整体复杂度保持在 **O(n * k)**，其中 `n` 是字符串数量，`k` 是平均长度。

**关键点**

除非你确实需要那种结构，否则不要通过把键映射到第二个容器的下标来组织数据。直接使用 `unordered_map<string, vector<string>>` 更简洁，也更容易维护。

**C++ 实现**

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

**这个版本为什么更好**

- **数据流更清晰**：直接构建分组。
- **签名更安全**：使用 `#` 这样的分隔符可以避免意外歧义。
- **核心思路不变**：按字符计数做哈希。

<u>结论</u>：对于字母异位词分组，频次签名是一种紧凑且高效的规范形式。
