---
title: LintCode 171-乱序字符串
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
hash的使用

```cpp
class Solution {
public:    
    /**
     * @param strs: A list of strings
     * @return: A list of strings
     */
    vector<string> anagrams(vector<string> &strs) {
        // write your code here
        unordered_map<string, int> index;
        unordered_map<string, int>::iterator it;
        vector<string> ret;
        vector<vector<string>> save;
        for (int i = 0; i < strs.size(); ++i) {
            vector<int> h(26, 0);
            for (int j = 0; j < strs[i].length(); ++j) {
                int dist = strs[i][j] - 'a';
                ++h[dist];
            }
            string s = hash(h);
            it = index.find(s);
            if (it != index.end()) {
                int id = it->second;
                save[id].push_back(strs[i]);
            } else {
                vector<string> vs;
                vs.push_back(strs[i]);
                save.push_back(vs);
                index.insert(make_pair(s, save.size() - 1));
            }
        }
        for (int i = 0; i < save.size(); ++i) {
            if (save[i].size() > 1) {
                for (int j = 0; j < save[i].size(); ++j) {
                    ret.push_back(save[i][j]);
                }
            }
        }
        return ret;
    }
    
    string hash(const vector<int> &h) {
        stringstream ss;
        for (int i = 0; i < 26; ++i) {
            if (h[i]) {
                char ch = 'a' + i;
                ss << ch;
                if (h[i] > 1) {
                    ss << h[i];
                }
            }
        }
        return ss.str();
    }
};
```