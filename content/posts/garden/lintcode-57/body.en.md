**Idea**
Keep the original hash-first approach. Fix `nums[i]`, then reduce the problem to a `Two Sum` search on the suffix `i+1..n-1`: find two numbers whose sum is `-nums[i]`. Instead of storing values already seen, store the complements you are waiting for. When `nums[j]` is already in that set, a valid triplet has been found.

The subtle part is deduplication. The same value triplet can appear from different index orders, so dedupe must be **global**, not just local to one anchor. The legacy note used a tiny polynomial hash; that is compact but collision-prone. A safer modern variant is to sort each triplet and encode it as a stable key.

```cpp
vector<vector<int>> threeSum(vector<int>& nums) {
    vector<vector<int>> result;
    unordered_set<string> used;
    const int n = static_cast<int>(nums.size());

    for (int i = 0; i + 2 < n; ++i) {
        unordered_set<int> need;
        const int target = -nums[i];

        for (int j = i + 1; j < n; ++j) {
            if (need.count(nums[j])) {
                vector<int> t{nums[i], nums[j], target - nums[j]};
                sort(t.begin(), t.end());
                string key = to_string(t[0]) + "," +
                             to_string(t[1]) + "," +
                             to_string(t[2]);
                if (!used.count(key)) {
                    used.insert(key);
                    result.push_back(t);
                }
            } else {
                need.insert(target - nums[j]);
            }
        }
    }
    return result;
}
```

**Why it works**
- `need` records the exact value required to complete the current pair.
- Sorting normalizes `[a, b, c]`, so permutations map to one key.
- Global dedupe prevents repeated triplets across different anchors.

**Complexity**
- Time: `O(n^2)`
- Extra space: `O(n)` per anchor, plus the dedupe set

**If sorting the input is allowed**, the classic two-pointer solution is usually cleaner. If constraints are extreme, promote arithmetic to `int64_t`.
