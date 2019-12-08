---
title: LeetCode 210-Course Schedule II
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
There are a total of n courses you have to take, labeled from `0` to `n - 1`.

Some courses may have prerequisites, for example to take course 0 you have to first take course 1, which is expressed as a pair: `[0,1]`

Given the total number of courses and a list of prerequisite pairs, return the ordering of courses you should take to finish all courses.

There may be multiple correct orders, you just need to return one of them. If it is impossible to finish all courses, return an empty array.

For example:

```
2, [[1,0]]
```

There are a total of 2 courses to take. To take course 1 you should have finished course 0. So the correct course order is `[0,1]`

```
4, [[1,0],[2,0],[3,1],[3,2]]
```

There are a total of 4 courses to take. To take course 3 you should have finished both courses 1 and 2. Both courses 1 and 2 should be taken after you finished course 0. So one correct course order is `[0,1,2,3]`. Another correct ordering is`[0,2,1,3]`.

Note:
The input prerequisites is a graph represented by a list of edges, not adjacency matrices. Read more about how a graph is represented.

## 题意
共有n节课程，课程编号从0至n－1。一些课程可能有先修要求，比如修0号课程前需要先修1号课程，表示为`［0,1］`。题目给出课程数和先后修课程对，要求返回完成所有课程的顺序。可能有很多正确的上课顺序，你只需返回其中一种。如果不可能完成，则返回空数组。

比如：

```
2, [[1,0]]
```

共有2节课程。选修1号课程前需要先修0号课程，故上课顺序为`[0,1]`。

```
4, [[1,0],[2,0],[3,1],[3,2]]
```

共有4节课程。正确的上课顺序为`[0,2,1,3]`。

### 提示：
输入的prerequisites是由边表示的图，而非邻接矩阵。

## 分析
此题是[Leetcode207-Course Schedule](http://www.huhaoyu.com/leetcode-course-schedule/)的进阶版，前者只需得出能否完成所有课程即可，本题还需要给出上课顺序。实际上这是一个求拓扑排序的题（至于是拓扑全序还是拓扑偏序，是不一定的）。可以有2种求解方法。

* **第一种：采用bfs。**前处理时得到每个节点的入度。每次将入度为0的节点入队。出队时将出队节点的邻接节点的入度减1，并将出队节点编号计入answer数组中。循环该过程直到队列为空。如仍有节点未被访问，则说明课程关系图中出现了环，不可能完成所有课程。否则，answer中的编号顺序就是上课顺序。

* **第二种：采用dfs。**需要一个onStack数组纪录dfs的路径上的节点，用于判断环的存在。而isVisited数组责纪录dfs中访问过的节点。而其reversePostOrder就是上课顺序。具体可以google搜索reversePostOrder。这种方法比较难理解，但很有意思。最终给出的AC代码也是第二种方法。

## 注意
* 值得注意的是，特殊情况输入numCourses ＝ 1，prereqisities为**空数组**时，答案为`[0]`，只有1个节点，并没有边的存在。

* 第二种方法中onStack在每次结束本次递归时，需要变为false，表示这条路径上后面的节点在后面的判断环中，不会被认为是同一路径上的节点。（感觉好绕）

## AC代码

```cpp
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<pair<int, int>>& prerequisites) {
        vector<int> answer;
        if (numCourses == 1) {
            answer.push_back(0); return answer;
        }
        vector<vector<int>> map(numCourses, vector<int>());
        stack<int> reversePostOrder;
        for (int i = 0; i < prerequisites.size(); ++i) {
            map[prerequisites[i].second].push_back(prerequisites[i].first);
        }
        vector<bool> isVisited(numCourses, false);
        for (int i = 0; i < numCourses; ++i) {
            if (!isVisited[i]) {
                vector<bool> onStack(numCourses, false);
                if (hasCycle(map, i, isVisited, onStack, reversePostOrder))
                    return answer;
            }
        }
        while (!reversePostOrder.empty()) {
            int index = reversePostOrder.top(); reversePostOrder.pop();
            answer.push_back(index);
        }
        return answer;
    }
    bool hasCycle(vector<vector<int>> &map, int i, vector<bool> &isVisited, vector<bool> &onStack, stack<int> &reversePostOrder) {
        isVisited[i] = true;
        onStack[i] = true;
        for (int k : map[i]) {
            if (onStack[k])
                return true;
            else if (!isVisited[k])
                if (hasCycle(map, k, isVisited, onStack, reversePostOrder))
                    return true;
        }
        onStack[i] = false;
        reversePostOrder.push(i);
        return false;
    }
};
```