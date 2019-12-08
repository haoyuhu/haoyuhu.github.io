---
title: LeetCode 338-Counting Bits
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
给每个数循环做`x & (x - 1)`并计数就是它二进制数中1的个数。

```cpp
class Solution {
public:
    vector<int> countBits(int num) {
        vector<int> ret;
        for (int i = 0; i <= num; ++i) {
            ret.push_back(count(i));
        }
        return ret;
    }
    
    int count(int x) {
        int ret = 0;
        while (x) {
            x = x & (x - 1);
            ++ret;
        }
        return ret;
    }
};
```