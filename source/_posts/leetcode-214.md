---
title: LeetCode 214-Shortest Palindrome
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Given a string S, you are allowed to convert it to a palindrome by adding characters in front of it. Find and return the shortest palindrome you can find by performing this transformation.

For example:

Given `"aacecaaa"`, return `"aaacecaaa"`.

Given `"abcd"`, return `"dcbabcd"`.

## 题意
给一个字符串S，只允许在字符串头部增加字符，使之成为一个**最短的回文字符串**。

## 分析
一开始没有注意是**`hard`**难度，以为只需要取得s的逆向字符串reverse\_s，将s作为模式串，reverse\_s作为主串。即找到reverse_s中**能匹配到最后一个字母的前提**下的最长的s中的子串。因此就如普通的模式串匹配一样，复杂度是O(n^2)。

比如：

|reverse_s| d | c | b | **a** | - | - | - |
|---|---|---|---|---|---|---|---|
| s | - | - | - | **a** | b | c | d |

又如：

|reverse_s| a | a | a | c | e | c | a | a | - |
|---|---|---|---|---|---|---|---|---|---|
| s | - | **a** | **a** | **c** | **e** | **c** | **a** | **a** | a |

后来发现其实用**kmp字符串匹配算法**就可以完美地完成**O(n)复杂度**的算法。只需对kmp做一点点调整：

* **判断匹配结束的时机**：是reverse\_s串匹配到了尾部，且匹配成功。
* **用mark记录匹配到结尾时s串的下标位置**：为了从s串尾部截取子串接到reverse\_s后形成回文字符串。
* **如何保证最短**：由于第一次成功匹配到reverse_s尾部后就结束循环，此时的mark标记的位置所形成的**回文段（字符串s从0到mark下标所形成的子串）**应该是最长的。
* **使用c++自带stl函数**：reverse操作，substr操作。

## AC代码

```cpp
class Solution {
public:
    string shortestPalindrome(string s) {
        if (s.empty()) return s;
        string reverse_s(s);
        reverse(reverse_s.begin(), reverse_s.end());
        int mark;
        vector<int> next(s.size());
        makeNext(s, next);

        for (int i = 0, j = 0; i < reverse_s.size(); ) {
            if (j == -1 || reverse_s[i] == s[j]) {
                ++i; ++j;
                if (i == reverse_s.size()) {
                    mark = j;
                }
            } else {
                j = next[j];
            }
        }

        return mark == s.size() ? reverse_s : reverse_s + s.substr(mark);
    }

    void makeNext(string& s, vector<int>& next) {
        next[0] = -1;
        for (int i = 0, j = -1; i < s.size(); ) {
            if (j == -1 || s[i] == s[j]) {
                ++i; ++j;
                if (i != s.size()) {
                    if (s[i] == s[j]) {
                        next[i] = next[j];
                    } else {
                        next[i] = j;
                    }
                }
            } else {
                j = next[j];
            }
        }
    }
};
```