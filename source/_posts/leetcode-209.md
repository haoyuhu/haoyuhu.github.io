---
title: LeetCode 209-Minimum Size Subarray Sum
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Given an array of n positive integers and a positive integer s, find the minimal length of a subarray of which the sum ≥ s. If there isn't one, return 0 instead.

For example, given the array [2,3,1,2,4,3] and s = 7,
the subarray [4,3] has the minimal length under the problem constraint.

## 题意
给出一个包含n个正整数的数组和一个正整数s，找到长度最小的（**连续**）子数组使其和大于等于s。如果不存在这样的子数组，返回0。

比如数组为[2, 3, 1, 2, 4, 3]，s = 7。子数组[4, 3]是长度最小的子数组，其和4+3≥7。

## 分析
使用一种在线处理的方法，类似“数组的最大子数组和”的**O(n)**解法。
### 步骤
* 我们设置bottom和top控制子数组的头部和尾部。
* 初始化bottom=0，top为-1，表示一个**空的子数组**。
* 子数组和sum=0，最小长度len=0。
* 当sum < s时，在当前子数组的尾部增加一个元素bottom[++top]。
* 当sum ≥ s时，去掉当前子数组的头部元素，并++bottom。
* **退出循环的条件**：top == nums.size() 或 bottom>top（此时已经存在最小len为1，不可能更小，可以退出）。

### 算法复杂度
由于top和bottom至多遍历一次数组nums，因此算法复杂度为O(n)。

## 更多练习
题目要求再给出一种**O(nlogn)**的解法。

### 简略分析
采用**分治法**的思想。每次将区间A一分为二，成为A1和A2。**子问题**是求两个子区间A1和A2中的各自的最小子数组长度len1和len2，以及区间A的最小子数组长度len中的最小值，即min{len1, len2, len}。

### 算法复杂度
由**主定理**（[**master定理**](http://zh.wikipedia.org/wiki/%E4%B8%BB%E5%AE%9A%E7%90%86)）可知：T(n) = 2*T(n/2) + n，故算法复杂度为**O(nlogn)**。

## AC代码
**O(n)及O(nlogn)算法**

```cpp
//O(n)
class Solution {
public:
    int minSubArrayLen(int s, vector<int>& nums) {
        if (!nums.size()) return 0;
        int bottom = 0, top = -1;
        int sum = 0, len = 0;
        while (true) {
            if (sum < s) {
                ++top;
                if (top != nums.size())
                    sum += nums[top];
                else
                    break;
            } else {
                sum -= nums[bottom]; ++bottom;
                if (bottom > top)
                    break;
            }
            if (sum >= s) {
                int new_len = top - bottom + 1;
                if (!len || len && new_len < len)
                    len = new_len;
            }
        }
        return len;
    }
};

//O(nlogn)
class Solution {
public:
    int MAX_INT = 999999999;
    int minSubArrayLen(int s, vector<int>& nums) {
        if (!nums.size()) return 0;
        return findMinLen(s, nums, 0, nums.size() - 1);
    }
    int findMinLen(int s, vector<int>& nums, int bottom, int top) {
        if (top == bottom) return nums[top] >= s ? 1 : 0;
        int mid = (bottom + top) / 2;
        int left = mid, right = mid + 1, sum = 0, len;
        while (sum < s && (right <= top || left >= bottom)) {
            if  (right > top) {
                sum += nums[left]; --left;
            }
            else if (left < bottom) {
                sum += nums[right]; ++right;
            }
            else if (nums[left] > nums[right]) {
                sum += nums[left]; --left;
            }
            else {
                sum += nums[right]; ++right;
            }
        }
        if (sum >= s) {
            len = right - left - 1;
            int leftLen = findMinLen(s, nums, bottom, mid);
            int rightLen = findMinLen(s, nums, mid + 1, top);
            return minValue(leftLen, rightLen, len);
        }
        else {
            return 0;
        }
    }
    int minValue(int x, int y, int z) {
        if (!x) x = MAX_INT;
        if (!y) y = MAX_INT;
        if (x <= y && x <= z) return x;
        if (y <= x && y <= z) return y;
        return z;
    }
};
```