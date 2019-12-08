---
title: LintCode 30-插入区间
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
```cpp
/**
 * Definition of Interval:
 * class Interval {
 * public:
 *     int start, end;
 *     Interval(int start, int end) {
 *         this->start = start;
 *         this->end = end;
 *     }
 * }
 */
class Solution {
public:
    /**
     * Insert newInterval into intervals.
     * @param intervals: Sorted interval list.
     * @param newInterval: new interval.
     * @return: A new interval list.
     */
    vector<Interval> insert(vector<Interval> &intervals, Interval newInterval) {
        // write your code here
        vector<Interval> ret;
        int i = 0;
        while (i < intervals.size() && intervals[i].end < newInterval.start) {
            ret.push_back(intervals[i]);
            ++i;
        }
        if (i == intervals.size()) {
            ret.push_back(newInterval);
            return ret;
        }
        int start, end;
        start = min(intervals[i].start, newInterval.start);
        while (i < intervals.size() && intervals[i].start <= newInterval.end) {
            ++i;
        }
        end = i > 0 ? max(intervals[i-1].end, newInterval.end) : newInterval.end;
        Interval interval(start, end);
        ret.push_back(interval);
        while (i < intervals.size()) {
            ret.push_back(intervals[i]);
            ++i;
        }
        return ret;
    }
};
```