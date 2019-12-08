---
title: LeetCode187-Repeated DNA Sequences
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 思路
* 由于碱基无非ACGT四种类型，可以使用00 01 10 11四个状态代替ACGT四种碱基，比如AAGCT就是00 00 10 01 11，对任意一个长度为10的子串都可以转化使用20个位的int值hint。这样就可将`unordered_set<string> repeated`转变为`unordered_set<int> repeated`, 一定程度上减少了所需的存储空间。
* 对于如何去重, 其一可以先收集所有答案，再sort，unique去重，当然这样很慢也很麻烦。其二，可以再构造一个unordered_set<int> check，用于存储已经存入answer中的重复子串对应的hint值;
* 值得一提的是，每次从s[i]->s[i+9]变为s[i+1]->s[i+10]，使用了这样一个方法：
```
hint = ((hint & eraser) << 2) + ati[s[i]];
```
其中eraser是一个宏定义, 值为0x3ffff, 二进制是00111111111111111111, 用于擦除hint中的最高2位s[i]碱基对应的值, 再左移2, 最后加上s[i+10]的碱基对应的值。

```cpp
class Solution {
public:
    #define eraser 0x3ffff
    vector<string> findRepeatedDnaSequences(string s) {
        vector<string> answer;
        int hint = 0;//存储长度为10的子串翻译后的int值
        if (s.size() < 10)
            return answer;
        unordered_set<unsigned int> repeated, check;//repeated存储已出现的子串, check用于防止重复答案
        unordered_map<char, unsigned int> ati{{'A', 0}, {'C', 1}, {'G', 2}, {'T', 3}};//此处ati是存储各碱基对应的值00 01 10 11(c++11新语法)
        for (int i = 0; i != 10; ++i) {
            hint = (hint << 2) + ati[s[i]];//用s的前10个碱基构造初始hint值
        }
        repeated.insert(hint);
        for (int i = 10; i != s.size(); ++i) {
            hint = ((hint & eraser) << 2) + ati[s[i]]; //子串变化对应hint值变化
            unordered_set<unsigned int>::iterator it = repeated.find(hint);
            if (it != repeated.end()) {
                it = check.find(hint);
                if (it == check.end()) {
                    answer.push_back(string(s, i - 9, 10));
                    check.insert(hint);
                }
            }
            else
                repeated.insert(hint);
        }
        return answer;
    }
};
```
一开始由于忽略了移位与其他运算符的优先级关系, 一直出问题，郁闷:(