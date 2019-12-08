---
title: LeetCode 342-Power of Four
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
一共有2种比较巧妙的方法，前提是首先确定是2的幂次。
* 4的幂次减1可以被3整除。
* 检查数字的偶数位是否有1。

```cpp
class Solution {
public:
    bool isPowerOfFour(int num) {
        return num > 0 && (num & (num - 1)) == 0 && (num - 1) % 3 == 0;
    }
};
```

`0xaaaaaaaa`表示二进制数1010 1010 1010 1010 1010 1010 1010 1010，采用&运算可以探测到偶数位是否存在1。
```cpp
class Solution {
public:
    bool isPowerOfFour(int num) {
        return num > 0 && (num & (num - 1)) == 0 && (num & 0xaaaaaaaa) == 0;
    }
};
```