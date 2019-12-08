---
title: LeetCode 213-House Robber II
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Note: This is an extension of [House Robber](https://leetcode.com/problems/house-robber/).

After robbing those houses on that street, the thief has found himself a new place for his thievery so that he will not get too much attention. This time, all houses at this place are **arranged in a circle**. That means the first house is the neighbor of the last one. Meanwhile, the security system for these houses remain the same as for those in the previous street.

Given a list of non-negative integers representing the amount of money of each house, determine the maximum amount of money you can rob tonight **without alerting the police**.

## 分析
类似于之前的House Robber，唯一的区别在于房屋排列是环形的，而非线性，这样头和尾的房屋是不能同时被偷窃的。因此在原有的基础上**增加一个状态**，即第一间房屋是否被偷窃。

采用两位**二进制数**表示偷窃到第i家时的状态，**高位**表示是否在**第1家**偷窃，**低位**表示是否在**第i家**偷窃。比如：

| 00 | 01 |
|:----|:----|
|不在第1家偷窃，也不在第i家偷窃|不在第1家偷窃，但在第i家偷窃|
| **10** | **11** |
|在第1家偷窃，但不在第i家偷窃|在第1家偷窃，也在第i家偷窃|

由此，到达第i家时的状态如下：


```cpp
robMoney[i][0] = max(robMoney[i-1][0], robMoney[i-1][1]);
robMoney[i][1] = robMoney[i-1][0] + nums[i];
robMoney[i][2] = max(robMoney[i-1][2], robMoney[i-1][3]);
robMoney[i][3] = robMoney[i-1][2] + nums[i];
```

## 注意

* 应特别注意的是，最后一家只能有状态**`00, 01, 10`**。
* 同时，应特殊处理只有1家的情况，此时**`11`**才是正确的状态。
* 第1家时，**`01, 10`**是矛盾的状态，`robMoney`设为`MIN_INT`。

## AC代码

```cpp
class Solution {
public:
    const static int MIN_INT = -999999999;

    int rob(vector<int>& nums) {
        int houseNumber = nums.size();
        if (!houseNumber) return 0;
        if (houseNumber == 1) return nums[0];
        int robMoney[houseNumber][4];

        for (int i = 0; i != houseNumber; ++i) {
            for (int j = 0; j != 4; ++j) {
                robMoney[i][j] = 0;
            }
        }

        robMoney[0][3] = nums[0];
        robMoney[0][1] = robMoney[0][2] = MIN_INT;

        for (int i = 1; i < houseNumber; ++i) {
            robMoney[i][0] = max(robMoney[i-1][0], robMoney[i-1][1]);
            robMoney[i][1] = robMoney[i-1][0] + nums[i];
            robMoney[i][2] = max(robMoney[i-1][2], robMoney[i-1][3]);
            robMoney[i][3] = robMoney[i-1][2] + nums[i];
        }

        return max(robMoney[houseNumber-1][0], robMoney[houseNumber-1][1], robMoney[houseNumber-1][2]);
    }

    int max(int x, int y) { return x > y ? x : y; }

    int max(int x, int y, int z) {
        if (x >= y && x >= z) return x;
        if (y >= x && y >= z) return y;
        return z;
    }
};
```