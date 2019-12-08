---
title: LintCode 57-三数之和
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
注意hash去重

```cpp
class Solution {
public:    
    /**
     * @param numbers : Give an array numbers of n integer
     * @return : Find all unique triplets in the array which gives the sum of zero.
     */
    vector<vector<int> > threeSum(vector<int> &nums) {
        // write your code here
        vector<vector<int>> ret;
        unordered_set<long long> d;
        for (int i = 0; i < nums.size() - 2; ++i) {
            int sum = -nums[i];
            unordered_set<int> s;
            for (int j = i + 1; j < nums.size(); ++j) {
                if (s.find(nums[j]) != s.end()) {
                    vector<int> ans;
                    ans.push_back(nums[i]);
                    ans.push_back(nums[j]);
                    ans.push_back(-(nums[i] + nums[j]));
                    sort(ans.begin(), ans.end());
                    long long t = 33 * 33 * ans[0] + 33 * ans[1] + ans[2];
                    if (d.find(t) == d.end()) {
                        ret.push_back(ans);
                        d.insert(t);
                    }
                } else {
                    s.insert(sum - nums[j]);
                }
            }
        }
        return ret;
    }
};
```