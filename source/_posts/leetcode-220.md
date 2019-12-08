---
title: LeetCode 220-Contains Duplicate III
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Given an array of integers, find out whether there are two distinct indices i and j in the array such that the difference between `nums[i]` and `nums[j]` is at most t and the difference between i and j is at most k.

## 题意
给一个整型数组，找到数组中是否存在两个元素，它们的下标差不超过k，元素值差不超过t。

## 分析
一开始对于每个元素，查找它后面k个元素是否与其值相差t以内。这样时间复杂度为`O(kn)`，不能过超长数组的测试。所以可能存在`O(nlogn)`的算法。我的做法如下：

* 首先给数组元素排序，并保留原有下标。示例如下：

| 0 | 1 | 2 | 3 | --> | 2 | 3 | 1 | 5 |
|---|---|---|---|-----|---|---|---|---|
| 5 | 3 | 1 | 2 | 排序 | 1 | 2 | 3 | 5 |

* 维护一个**特殊的队列**（包括一个元素队列和下标队列）。该队列要求队首和队尾的元素值相差不超过t。具体操作：
* (1) 如队列为空则当前元素入队。
* (2) 如队头元素值与当前待入队元素值的差超过t，队头元素出队(因为经排序后，后面入队的元素值只会比当前元素更大，不可能出现与队首元素值差小于t的情况，所以队首元素已经没有继续存在在队列中的必要了)。
* (3) 如对头元素值与当前待入队元素值的差不超过t，则检查二者的下标差，如小于k，返回true，否则当前元素入队。
* (4) 最后队中剩余的元素只需比较队首与队尾的下标值即可。
* **时间复杂度**。显然是排序的时间复杂度为`O(nlogn)`，维护队列的过程每个元素出入队列一次。为`O(n)`。故总时间复杂度`O(nlogn)`。

## TLE代码及AC代码

```cpp
class Solution {
public:
    bool containsNearbyAlmostDuplicate(vector<int>& nums, int k, int t) {
        for (int i = 1; i < nums.size(); ++i) {
            for (int j = i - 1; j >= 0 && j > i - k; --j) {
                if (abs(nums[i] - nums[j]) <= t) { return true; }
            }
        }
        return false;
    }
};
//Time Limit Exceeded
class Solution {
public:
    bool containsNearbyAlmostDuplicate(vector<int>& nums, int k, int t) {
        if (nums.empty()) return false;
        vector<int> order(nums.size());
        for (int i = 0; i != order.size(); ++i) {
            order[i] = i;
        }
        //sort nums and orders
        sortNumbers(nums, order, 0, nums.size() - 1);
        //push and pop
        queue<int> numsque;
        queue<int> orderque;
        //initialize queue
        numsque.push(nums[0]);
        orderque.push(order[0]);

        for (int i = 1; i < nums.size();) {
            if (numsque.empty()) {
                numsque.push(nums[i]);
                orderque.push(order[i]);
                ++i; continue;
            }
            int num = numsque.front();
            int ord = orderque.front();
            if (nums[i] > num + t) {
                numsque.pop();
                orderque.pop();

            } else {
                if (isOrderRangeSatisfactory(order[i], ord, k)) {
                    return true;
                } else {
                    numsque.push(nums[i]);
                    orderque.push(order[i]);
                    ++i;
                }
            }
        }

        int backOrder = orderque.back();
        int frontOrder = orderque.front();
        while (backOrder != frontOrder) {
            if (isOrderRangeSatisfactory(backOrder, frontOrder, k)) {
                break;
            }
            orderque.pop();
            frontOrder = orderque.front();
        }
        if (backOrder == frontOrder) {
            return false;
        } else {
            return true;
        }
    }

    bool isOrderRangeSatisfactory(int i, int j, int k) {
        return i <= j + k && i >= j - k;
    }

    void sortNumbers(vector<int> &nums, vector<int> &order, int bottom, int top) {
        if (bottom >= top) return;
        int i = bottom, j = top;
        int saveValue = nums[i];
        int saveIndex = order[i];
        while (i < j) {
            for (; i < j && nums[j] >= saveValue; --j);
            nums[i] = nums[j];
            order[i] = order[j];
            for (; i < j && nums[i] <= saveValue; ++i);
            nums[j] = nums[i];
            order[j] = order[i];
        }
        nums[i] = saveValue;
        order[i] = saveIndex;
        sortNumbers(nums, order, bottom, i - 1);
        sortNumbers(nums, order, i + 1, top);
    }
};
```