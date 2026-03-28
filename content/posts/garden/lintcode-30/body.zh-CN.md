**思路**

输入列表已经按顺序排好，且彼此不重叠，因此没必要重新排序。从左到右扫描一遍就够了：

1. 先复制所有在 `newInterval.start` 之前结束的区间。
2. 合并所有起点 `<= newInterval.end` 的区间。
3. 再复制剩余区间。

这样就很自然地把列表分成了 **左侧 / 重叠 / 右侧** 三部分。由于区间本身有序，一旦某个区间的起点大于 `newInterval.end`，后面的所有区间也一定都不会重叠。

**边界情况** 不需要额外分支就能自然处理：
- 插入到开头
- 插入到末尾
- 完全没有重叠
- `newInterval` 吞并多个区间

更干净的实现方式是在合并过程中直接更新 `newInterval`。这样可以避免诸如回看 `i - 1` 之类别扭的边界判断，也更容易推导和验证正确性。

**参考实现**

```cpp
vector<Interval> insert(vector<Interval>& intervals, Interval newInterval) {
    vector<Interval> result;
    int i = 0, n = intervals.size();

    while (i < n && intervals[i].end < newInterval.start) {
        result.push_back(intervals[i++]);
    }

    while (i < n && intervals[i].start <= newInterval.end) {
        newInterval.start = min(newInterval.start, intervals[i].start);
        newInterval.end = max(newInterval.end, intervals[i].end);
        ++i;
    }
    result.push_back(newInterval);

    while (i < n) {
        result.push_back(intervals[i++]);
    }
    return result;
}
```

**复杂度**
- 时间：`O(n)`
- 额外空间：`O(n)`，用于返回结果列表

这是标准、适合生产环境的解法：线性、直观，而且很容易验证。
