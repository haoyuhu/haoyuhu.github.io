---
title: LintCode 144-交错正负数
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
* 注意正负总数不同的情况
* 采用2个游标分别指向偶数下标和奇数下标，交换不符合条件的元素

```cpp
class Solution {
public:
    /**
     * @param A: An integer array.
     * @return: void
     */
    void rerange(vector<int> &A) {
        // write your code here
        int tag = 0;
        for (int i = 0; i < A.size(); ++i) {
             if (A[i] > 0) --tag;
             else ++tag;
        }
        if (!tag) tag = 1;
        for (int i = 0, j = 1; i < A.size() && j < A.size(); i += 2, j += 2) {
            while (i < A.size() && tag * A[i] < 0) i += 2;
            while (j < A.size() && tag * A[j] > 0) j += 2;
            if (i < A.size() && j < A.size()) {
                int t = A[i];
                A[i] = A[j];
                A[j] = t;
            }
        }
    }
};
```