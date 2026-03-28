**思路**
保留最初“哈希优先”的做法。固定 `nums[i]`，然后把问题化简为在后缀 `i+1..n-1` 上做一次 `Two Sum` 搜索：找出两个数，使它们的和等于 `-nums[i]`。与其存已经见过的值，不如存当前还在等待的补数。当 `nums[j]` 已经出现在这个集合里时，就找到了一个合法三元组。

真正微妙的地方在于去重。同一组数值三元组，可能因为索引顺序不同而被重复找到，所以去重必须是**全局**的，不能只对某一个固定元素做局部处理。旧笔记里用了一个很小的多项式哈希；它很紧凑，但也更容易发生冲突。更稳妥的现代写法是：先对每个三元组排序，再把它编码成稳定的键。

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

**为什么可行**
- `need` 记录了补齐当前数对所需的确切值。
- 排序会把 `[a, b, c]` 规范化，因此不同排列都会映射到同一个键。
- 全局去重可以避免在不同固定元素下重复加入同一个三元组。

**复杂度**
- 时间：`O(n^2)`
- 额外空间：每个固定元素需要 `O(n)`，再加上去重集合

**如果允许对输入排序**，经典的双指针解法通常更简洁。若约束非常极端，建议把算术提升到 `int64_t`。
