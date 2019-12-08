---
title: LintCode 140-快速幂
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
注意溢出

```cpp
class Solution {
public:
    /*
     * @param a, b, n: 32bit integers
     * @return: An integer
     */
    int fastPower(int a, int b, int n) {
        // write your code here
        return dfs(a % b, b, n);
    }
    
    long long dfs(int a, int b, int n) {
        if (!n) return 1 % b;
        int r = n / 2;
        long long t = dfs(a, b, r);
        if (n % 2 == 0) {
            return t * t % b;
        } else {
            return (t * t % b) * a % b;
        }
    }
};
```