---
title: LeetCode202-Happy Number
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
题目中已经给了提示，当能出现1时，即退出循环返回true；如出现了一个不为1的循环则返回false（如4, 16, 37, 58, 89, 145, 42, 20, 4, ...）。对happy number的详细描述见wiki百科：[Happy Number](http://en.wikipedia.org/wiki/Happy_number)。wiki还对Happy primes和Harshad number做了一些解释。为了快速确定是否发生非1的重复，使用unordered_set来记录已经出现过的数（我们并不关心数字的顺序，因此用hash效率更高）。

```cpp
class Solution {
public:
    bool isHappy(int n) {
        int sum;
        unordered_set<int> check;
        check.insert(n);
        while (n != 1) {
            sum = 0;
            while (n) {
                int t = n % 10;
                n /= 10;
                sum += t * t;
            }
            if (check.find(sum) != check.end())
                return false;
            check.insert(sum);
            n = sum;
        }
        return true;
    }
};
```