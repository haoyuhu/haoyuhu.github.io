## 题目概述
给定`n`门课程，编号从`0`到`n-1`。

部分课程有先修课程要求，用`[a,b]`表示修课程`a`前必须先修课程`b`。

请根据课程数和先修课程列表，返回一个可行的上课顺序，使得所有先修关系满足。如果有多个答案，返回其中任意一个即可。如果存在环依赖导致不可能完成所有课程，则返回空数组。

### 例子
```
输入: n = 2, prerequisites = [[1,0]]
输出: [0,1]
说明: 修1前要先修0，顺序是[0,1]
```
``` 
输入: n = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
输出: [0,1,2,3] 或 [0,2,1,3]
说明: 课程3依赖1和2，1和2都依赖0，故存在多种合法顺序
```

> 注意：输入用边列表表示有向图，非邻接矩阵。

---

## 核心思想：拓扑排序
本题是经典的有向图拓扑排序问题。
- 节点代表课程。
- 边代表先修依赖。

目标是找到节点的**拓扑顺序**。

### 两种常用解法比较
| 方法  | 思路                     | 核心概念                                                             |
|-------|--------------------------|----------------------------------------------------------------------|
| BFS   | Kahn算法                 | 维护入度为0的节点队列，逐步出队更新邻居入度                        |
| DFS   | 深度优先遍历带环检测      | 使用递归栈检测环，完成节点后逆序入栈，形成拓扑排序                    |

---

## 算法流程
### BFS实现要点
1. 统计每个节点入度。
2. 初始化队列，加入入度为0的节点。
3. 队列不空：
   - 出队节点，加入结果序列。
   - 减少邻接节点入度，若入度减为0，入队。
4. 检查结果序列节点数是否等于总课程数，否则说明有环，返回空。

### DFS实现要点
- 使用两个布尔数组：
  - `isVisited`标记访问过的节点。
  - `onStack`标记当前递归路径上的节点，用于检测环。
- 递归访问邻居节点，遇到`onStack`为真说明环。
- 递归结束后，将节点放入栈（形成逆后序），最终得到拓扑序。

## 特殊情况
- 当`numCourses == 1`且无先修课，直接返回`[0]`。
- DFS时确保递归结束后将`onStack[i]`复位为`false`，避免路径混淆。

---

## C++ DFS 代码示例
```cpp
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<pair<int, int>>& prerequisites) {
        vector<int> order;
        if (numCourses == 1 && prerequisites.empty()) {
            order.push_back(0);
            return order;
        }
        vector<vector<int>> graph(numCourses);
        for (auto &pre : prerequisites) {
            graph[pre.second].push_back(pre.first);
        }
        vector<bool> isVisited(numCourses, false);
        vector<bool> onStack(numCourses, false);
        stack<int> reversePostOrder;

        for (int i = 0; i < numCourses; ++i) {
            if (!isVisited[i]) {
                if (hasCycle(graph, i, isVisited, onStack, reversePostOrder)) {
                    return {};
                }
            }
        }

        while (!reversePostOrder.empty()) {
            order.push_back(reversePostOrder.top());
            reversePostOrder.pop();
        }

        return order;
    }

private:
    bool hasCycle(const vector<vector<int>> &graph, int node,
                  vector<bool> &isVisited, vector<bool> &onStack, stack<int> &order) {
        isVisited[node] = true;
        onStack[node] = true;
        for (int next : graph[node]) {
            if (onStack[next]) {
                // 发现环
                return true;
            }
            if (!isVisited[next]) {
                if (hasCycle(graph, next, isVisited, onStack, order))
                    return true;
            }
        }
        onStack[node] = false;
        order.push(node);
        return false;
    }
};
```

---

## 总结
- 此题归结为图的拓扑排序问题。
- BFS和DFS两种方法均可解决，DFS方法可以借助递归栈检测环，并输出顺序。
- 注意边界情况和环检测细节。
- 提供的DFS代码简洁有效，适合用于课程排序等类似场景。

此方案帮助判断课程表的可行性并获得对应的上课顺序。

---
