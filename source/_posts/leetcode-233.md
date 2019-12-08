---
title: LeetCode 233-Number of Digit One
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Given an integer n, count the total number of digit 1 appearing in all non-negative integers less than or equal to n.

For example:

Given n = 13,

Return 6, because digit 1 occurred in the following numbers: 1, 10, 11, 12, 13.

## 分析
**题意如下**：给定一个非负整数n，输出`1,2,3,4,...,n`这n个数中出现1的次数。

一开始的思路是遍历从1到n这n个数，数出每个数中1的个数，时间复杂度**`O(nlogn)`**。看到较低的通过率，估计这种思路行不通。测试发现当n较大时会超时。代码如下：

```cpp
class Solution {
public:
    int countDigitOne(int n) {
        int count = 0;
        for (int i = 1; i <= n; ++i) {
            int num = i;
            while (num) {
                if (num % 10 == 1) {
                    ++count;
                }
                num /= 10;
            }
        }
        return count;
    }
};
```

**因此换一种思路**：

先从中找规律。比如`n=121`。我们可以试图逐位数出1的个数。

* 首先是个位。
* `1,11,21,31,41,51,61,71,81,91,101,111,121`。不难发现是12+1个“个位”的1。
* 十位。
* `10,11,12,13,14,15,16,17,18,19,110,111,112,113,114,115,116,117,118,119`。2*10个“十位”的1。
* ...
* 不难发现对于第i位。
* 我们记数字`n = a(m) * 10^m + a(m-1) * 10^(m-1) + ... + a(0) * 10^0`。
* 并记p和q分别为第i位前的数和第i位后的数。
* `p = a(m) * 10^(m-i-1) + ... + a(i+1) * 10^0`。
* `q = a(i-1) * 10^(i-1) + ... + a(0) * 1`。
* 再记第i位数字为k。
* 第i位的1的个数：p * 10^(i-1) + if (k == 1) { (q+1); } + if (k > 1) { 10^(i-1); }
* 如数字`83121＝8 * 10000 + 3 * 1000 + 1*100 + 2 * 10 + 1 * 1`, 对第三位（第三位为1）有p＝83，q=21，k=1。第3位的1的个数为`83 * 100 + 21 + 1 ＝ 8322`。
* **不难发现时间复杂度为`O(logn)`。**

## AC代码
```cpp
class Solution {
public:
    int countDigitOne(int n) {
        int count = 0, previous = 0, coef = 1;
        while (n) {
            int remain = n % 10;
            int over = n / 10;
            if (remain > 1) {
                count += coef;
            } else if (remain == 1) {
                count += previous + 1;
            }
            count += coef * over;
            previous += coef * remain;
            coef *= 10;
            n /= 10;
        }
        return count;
    }
};
```