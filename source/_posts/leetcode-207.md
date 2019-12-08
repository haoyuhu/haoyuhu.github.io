---
title: LeetCode 207-Course Schedule
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# 分析
很显然，这是一个**有向无环图的判断**问题。只要所有课程中出现了环，就不可能修满所有课程。有向无环图的判断可采用dfs或bfs，至于生成图的形式可以是邻接矩阵，也可以是邻接表。为了减小时间复杂度，本题考虑采用邻接表的方法。

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        if (!prerequisites.size()) return true;
        vector<vector<int>> map(numCourses, vector<int>());
        for (int i = 0; i < prerequisites.size(); ++i) {
            map[prerequisites[i][0]].push_back(prerequisites[i][1]);
        }
        vector<bool> isVisited(numCourses, false);
        for (int i = 0; i < numCourses; ++i) {
            if (!isVisited[i]) {
                vector<bool> onStack(numCourses, false);
                if (hasCycle(map, i, isVisited, onStack))
                    return false;
            }
        }
        return true;
    }
    bool hasCycle(vector<vector<int>> &map, int i, vector<bool> &isVisited, vector<bool> &onStack) {
        isVisited[i] = true;
        onStack[i] = true;
        for (int k : map[i]) {
            if (onStack[k])
                return true;
            else
                if (hasCycle(map, k, isVisited, onStack))
                    return true;
        }
        onStack[i] = false;
        return false;
    }
};
```