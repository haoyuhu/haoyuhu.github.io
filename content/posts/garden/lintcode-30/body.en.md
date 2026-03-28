**Idea**

The input list is already sorted and non-overlapping, so there is no need to re-sort. A single left-to-right pass is enough:

1. Copy intervals that end before `newInterval.start`.
2. Merge every interval whose start is `<= newInterval.end`.
3. Copy the remaining intervals.

This naturally splits the list into **left / overlap / right**. Because the intervals are sorted, once an interval starts after `newInterval.end`, every later interval will also be non-overlapping.

<u>Edge cases</u> are handled without special branching:
- insert at the beginning
- insert at the end
- no overlap at all
- `newInterval` absorbs multiple intervals

A cleaner implementation updates `newInterval` directly during the merge. That avoids awkward boundary logic such as looking back at `i - 1`, and makes correctness easier to reason about.

**Reference implementation**

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

**Complexity**
- Time: `O(n)`
- Extra space: `O(n)` for the returned list

This is the standard production-friendly solution: linear, explicit, and easy to verify.
