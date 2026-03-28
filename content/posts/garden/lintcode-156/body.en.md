**Idea**

This is a classic sort-and-scan problem. Once the intervals are ordered by `start`, the merge step is linear and easy to reason about.

- Keep a `current` interval.
- If the next interval starts after `current.end`, the two intervals are disjoint, so push `current` into the answer and reset it.
- Otherwise they overlap, so extend `current.end` to the larger end.

The original note is basically correct; the main work is in the details. In particular, the condition `next.start > current.end` treats touching intervals such as `[1,2]` and `[2,3]` as mergeable. That matches the usual interpretation for this problem. <u>If your interval definition is different</u>, this is the line to change.

The legacy version also used a handwritten quicksort. In modern C++, `std::sort` is cleaner, safer, and avoids unnecessary implementation risk.

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

**Complexity**

Sorting dominates at `O(n log n)`, and the merge scan is `O(n)`. Extra auxiliary space is `O(1)` beyond the output vector. The only easy-to-miss edge cases are empty input and remembering to push the final merged interval after the loop.
