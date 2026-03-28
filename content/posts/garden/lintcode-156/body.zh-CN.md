**思路**

这是一个经典的“排序 + 扫描”问题。只要按 `start` 对区间完成排序，后续的合并过程就是线性的，也很容易推导清楚。

- 维护一个 `current` 区间。
- 如果下一个区间的起点在 `current.end` 之后，那么这两个区间互不相交，此时把 `current` 放入答案，并将 `current` 重置为下一个区间。
- 否则它们有重叠，就把 `current.end` 扩展为两者中更大的那个终点。

原始笔记的思路基本是对的；真正需要注意的是细节。尤其是，条件 `next.start > current.end` 会把像 `[1,2]` 和 `[2,3]` 这样端点相接的区间视为可合并。这也符合这道题通常的定义。**如果你对区间的定义不同**，那就改这一行。

旧版本还手写了一个 quicksort。在现代 C++ 里，`std::sort` 更简洁、更安全，也能避免不必要的实现风险。

**C++**

```cpp
class Solution {
public:
    vector<Interval> merge(vector<Interval> &intervals) {
        if (intervals.empty()) return {};

        std::sort(intervals.begin(), intervals.end(),
                  [](const Interval& a, const Interval& b) {
                      return a.start < b.start;
                  });

        vector<Interval> result;
        Interval current = intervals[0];

        for (int i = 1; i < static_cast<int>(intervals.size()); ++i) {
            if (intervals[i].start > current.end) {
                result.push_back(current);
                current = intervals[i];
            } else {
                current.end = std::max(current.end, intervals[i].end);
            }
        }

        result.push_back(current);
        return result;
    }
};
```

**复杂度**

排序占主导，为 `O(n log n)`，合并扫描为 `O(n)`。除输出向量外，额外辅助空间为 `O(1)`。最容易漏掉的边界情况只有两个：输入为空，以及循环结束后别忘了把最后一个合并后的区间加入结果。
