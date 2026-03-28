## 问题概述
LeetCode 第 207 题“课程表”要求判断，给定课程及其先修课程关系，是否能完成所有课程。这是一个判断有向图中是否存在环的问题。如果存在环，则说明有课程间循环依赖，不可能完成所有课程。

## 核心思路：有向图环检测
- 将课程视为图中的节点。
- 边表示课程之间的先修关系（有向边）。
- 判断该有向图中是否存在环。

## 图的表示
采用**邻接表**的形式，特别适用于稀疏图，能够节省空间和时间开销。

## 算法：基于深度优先搜索（DFS）的环检测
使用两个辅助布尔数组：
- `isVisited`：标记节点是否已被完全访问过。
- `onStack`：标记当前节点是否在递归栈上，用于检测回边。

如果在 DFS 过程中访问到一个已经在栈上的节点，说明发现了环。

---

### 代码实现（C++）

```cpp
class Solution {
public:
    bool canFinish(int numCourses, const vector<vector<int>>& prerequisites) {
        if (prerequisites.empty()) return true;

        // 构建邻接表：map[课程] = 该课程的先修课程列表
        vector<vector<int>> adjList(numCourses);
        for (const auto& pair : prerequisites) {
            adjList[pair[0]].push_back(pair[1]);
        }

        vector<bool> isVisited(numCourses, false);
        vector<bool> onStack(numCourses, false);

        for (int course = 0; course < numCourses; ++course) {
            if (!isVisited[course]) {
                if (hasCycle(adjList, course, isVisited, onStack))
                    return false;  // 发现环
            }
        }
        return true;  // 无环
    }

private:
    bool hasCycle(const vector<vector<int>>& adjList, int node, vector<bool>& isVisited, vector<bool>& onStack) {
        isVisited[node] = true;
        onStack[node] = true;

        for (int prereq : adjList[node]) {
            if (onStack[prereq]) {
                return true;  // 检测到环
            }
            if (!isVisited[prereq] && hasCycle(adjList, prereq, isVisited, onStack)) {
                return true;  // 递归中检测到环
            }
        }

        onStack[node] = false;
        return false;
    }
};
```

---

## 状态变量总结表

| 状态变量 | 作用                      |
|----------|---------------------------|
| isVisited | 标记节点是否已访问完成    |
| onStack   | 标记当前递归栈中的节点    |

在 DFS 中，如果发现邻居节点已在 `onStack` 中，则说明存在环。

---

该算法时间复杂度为 O(N + E)，N 为课程数，E 为先修关系边数。适合处理大规模输入，效率较高。
