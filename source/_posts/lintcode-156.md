---
title: LintCode 156-合并区间
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
注意细节处理就好

```cpp
/**
 * Definition of Interval:
 * class Interval {
 *     int start, end;
 *     Interval(int start, int end) {
 *         this->start = start;
 *         this->end = end;
 *     }
 */
class Solution {
public:
    /**
     * @param intervals: interval list.
     * @return: A new interval list.
     */
    vector<Interval> merge(vector<Interval> &intervals) {
        // write your code here
        sort(intervals, 0, intervals.size() - 1);
        vector<Interval> ret;
        if (intervals.empty()) return ret;
        Interval interval(intervals[0].start, intervals[0].end);
        for (int i = 1; i < intervals.size(); ++i) {
            if (intervals[i].start > interval.end) {
                ret.push_back(interval);
                interval.start = intervals[i].start;
                interval.end = intervals[i].end;
            } else {
                interval.end = max(interval.end, intervals[i].end);
            }
        }
        ret.push_back(interval);
        return ret;
    }
    
    void sort(vector<Interval> &v, int bottom, int top) {
        if (bottom >= top) return;
        int i, j;
        Interval interval = v[bottom];
        i = bottom;
        j = top;
        while (i < j) {
            for (; i < j && v[j].start >= interval.start; --j);
            v[i] = v[j];
            for (; i < j && v[i].start <= interval.start; ++i);
            v[j] = v[i];
        }
        v[i] = interval;
        sort(v, bottom, i - 1);
        sort(v, i + 1, top);
    }
};
```