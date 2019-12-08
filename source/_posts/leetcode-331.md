---
title: LeetCode 331-Verify Preorder Serialization of a Binary Tree
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
* 设置一个栈，栈内的元素有两个状态。
* true状态表示两个孩子均未出现，false表示已经出现过1个孩子。
* 当第i个元素到来时，先判断栈顶元素，为true则置换成false，否则栈顶元素退栈，如当前第i个元素为数字，true入栈。
* 循环过程中如果出现栈为空的状态说明不构成binary tree。

# 注意
* 几个特例。
  * 树根为null，返回true。
  * 有多个元素但头结点为null，返回false。
* preorder字符串需要预处理。

```cpp
class Solution {
public:
    bool isValidSerialization(string preorder) {
        vector<string> ss = preprocess(preorder);
        if (ss.empty()) return false;
        if (ss.size() == 1 && ss[0] == "#") return true;
        if (ss.size() > 1 && ss[0] == "#") return false;
        stack<bool> st;
        st.push(true);
        for (int i = 1; i < ss.size(); ++i) {
            if (st.empty()) return false;
            bool top = st.top();
            st.pop();
            if (top) {
                st.push(false);
            }
            if (ss[i] != "#") {
                st.push(true);
            }
        }
        return st.empty();
    }
    
    vector<string> preprocess(string s) {
        int b = 0;
        vector<string> ret;
        for (int i = 0; i < s.length(); ++i) {
            if (s[i] == ',') {
                ret.push_back(s.substr(b, i - b));
                b = i + 1;
            }
        }
        ret.push_back(s.substr(b, s.length() - b));
        return ret;
    }
};
```