---
title: LeetCode204-Count Primes
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
这个题相当于求小于n的所有质数，曾在**编程之美**中看到过一个求一组质数的算法，叫**厄拉多塞筛法**，时间复杂度仅有O(nloglogn)，这是一个相当好的算法（如果从1到n-1分别判断质数，时间复杂度为O(nsqrt(n))）。
厄拉多塞筛法的步骤：建立从2到n的集合G={2, 3, 4, ..., n}，每次从集合中取出最小的数A，这个数就是质数；然后将数A * times从集合中删除，其中1<=times<=n/A。得到一个新的集合G'，重复上述步骤直到集合为空，就取出了所有质数。
举例一个集合{2, 3, 4, ..., 12}：
stp1：最小值为2，取出2并删除2，4，6，8，10，12，集合变为{3, 5, 7, 9, 11}；
stp2：最小值为3，取出3并删除3，6，9，集合变为{5, 7, 11}
...
最后得到质数为2，3，5，7，11。

# 注意
1. 一开始我用unordered_set来标记一个数是否被删除，后来内存使用超出要求。后来改用**bool数组**来记录就AC了。
2. 注意是**小于n**，而非小于等于n。

```cpp
class Solution {
public:
    int countPrimes(int n) {
        bool isDeleted[n];
        for (unsigned i = 0; i < n; ++i)
            isDeleted[i] = false;

        int count = 0;
        for (unsigned i = 2; i < n; ++i) {
            if (!isDeleted[i]) {
                ++count;
                for (unsigned times = 1; i * times <= n; ++times) {
                    isDeleted[i*times] = true;
                }
            }
        }
        return count;
    }
};
```