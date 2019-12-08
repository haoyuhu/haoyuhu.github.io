---
title: LeetCode 215-Kth Largest Element in an Array
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Find the **k**th largest element in an unsorted array. Note that it is the kth largest element in the sorted order, not the kth distinct element.

For example,
Given `[3,2,1,5,6,4]` and `k = 2`, return `5`.

Note: 
You may assume k is always valid, **`1 ≤ k ≤ array's length`**.

## 题意
找到一个**无序数组**中第**k**大的数。

## 分析
类似**快速排序**一样。每层递归中，对当前的nums区段内的元素进行操作：

* 保存当前区段的第一个元素`nums[bottom]`为`save`。
* 类似**快排**，将大于`save`的元素移到**左侧**，小于`save`的移到**右侧**。
* 通过**下标相减**得知`save`在当前区段中的次序`rank`。
* 如`rank == k`，则save就是第k大的数。
* 如`rank < k`，则第k大的数在save所在位置的**右侧**，进入下一层递归。
* 如`rank > k`，则第k大的数在save所在位置的**左侧**，进入下一层递归。

## AC代码

```cpp
class Solution {
public:
    int answer;
    int findKthLargest(vector<int>& nums, int k) {
        find(nums, 0, nums.size() - 1, k);
        return answer;
    }

    void find(vector<int>& nums, int bottom, int top, int k) {
        int i = bottom, j = top, save = nums[bottom];
        while (i < j) {
            for (; i < j && nums[j] <= save; --j);
            nums[i] = nums[j];
            for (; i < j && nums[i] >= save; ++i);
            nums[j] = nums[i];
        }

        int rank = j - bottom + 1;
        if (rank == k) {
            answer = save; return;
        }
        if (rank > k) {
            find(nums, bottom, j - 1, k);
        } else {
            find(nums, j + 1, top, k - rank);
        }
    }
};
```