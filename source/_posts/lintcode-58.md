---
title: LintCode 58-四数之和
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
```cpp
class Solution {
public:
    /**
     * @param numbers: Give an array numbersbers of n integer
     * @param target: you need to find four elements that's sum of target
     * @return: Find all unique quadruplets in the array which gives the sum of 
     *          zero.
     */
    vector<vector<int> > fourSum(vector<int> nums, int target) {
        // write your code here
        vector<vector<int>> ret;
        set<int> dup;
        sort(nums.begin(), nums.end());
        for (int i = 0; i < nums.size(); ++i) {
            for (int j = i + 1; j < nums.size(); ++j) {
                unordered_set<int> s;
                for (int k = j + 1; k < nums.size(); ++k) {
                    int r = target - nums[i] - nums[j] - nums[k];
                    if (r < nums[j]) break;
                    if (r <= nums[k] && s.find(nums[k]) != s.end()) {
                        int h = hash(nums[i], nums[j], r, nums[k]);
                        if (dup.find(h) == dup.end()) {
                            vector<int> ans({nums[i], nums[j], r, nums[k]});
                            ret.push_back(ans);
                            dup.insert(h);
                        }
                    } else {
                        s.insert(r);
                    }
                }
            }
        }
        return ret;
    }
    
    int hash(int a, int b, int c, int d) {
        return a + 10 * b + 100 * c + 35937 * d;
    }
};
```