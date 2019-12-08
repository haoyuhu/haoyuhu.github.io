---
title: LeetCode 330-Patching Array
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
* miss记录当前集合已经完成[0, miss)所有组合。
* 当前值nums[i]小于等于miss时，表示在集合中增加nums[i]可以使组合范围增大到[0, miss+nums[i])。
* 当前值nums[i]大于miss时，增加nums[i]并不能让集合覆盖[0, miss+nums[i])，此时最好的方法是加miss，使得范围增大到[0, 2 * miss)。

```cpp
class Solution {
public:
    int minPatches(vector<int>& nums, int n) {
        long miss = 1;
        int ret = 0, i = 0;
        while (miss <= n) {
            if (i < nums.size() && nums[i] <= miss) {
                miss += nums[i++];
            } else {
                miss <<= 1;
                ++ret;
            }
        }
        return ret;
    }
};
```