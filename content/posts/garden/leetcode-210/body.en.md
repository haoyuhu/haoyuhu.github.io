## Problem Overview
You are given `n` courses labeled from `0` to `n-1`.
Some courses have prerequisites, expressed as pairs `[a, b]` meaning "to take course `a`, you must first take course `b`."

Given the total number of courses and a list of such prerequisite pairs, your task is to return a valid order of courses to take that satisfies all prerequisite constraints. If multiple valid orders exist, returning any one correct order is acceptable. If it is impossible to finish all courses due to cyclic dependencies, return an empty array.

### Examples
```
Input: n = 2, prerequisites = [[1,0]]
Output: [0,1]
Explanation: To take course 1, you need to finish course 0 first, so the order is [0,1].
```
``` 
Input: n = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0,1,2,3] or [0,2,1,3]
Explanation: Course 3 depends on 1 and 2, which both depend on 0. Multiple valid orders exist.
```

> Note: The prerequisites are given as edges in a directed graph, *not* as an adjacency matrix.

---

## Key Insight: Topological Sorting
This problem is a classic case of finding a **topological order** in a directed graph:
- Nodes represent courses.
- Edges represent prerequisites.

A valid course order corresponds to a topological ordering of the graph.

### Two Standard Approaches:
| Method | Approach                    | Concept                                                                        |
|--------|-----------------------------|--------------------------------------------------------------------------------|
| BFS    | Kahn’s Algorithm             | Maintain a queue of courses with zero incoming edges (no prerequisites).       |
| DFS    | Depth-First Search           | Detect cycles using recursion stack; push nodes onto stack after visiting all neighbors (reverse post-order).

---

## Algorithm Details
### BFS (Kahn's Algorithm)
1. Calculate `inDegree` for each course (number of prerequisites).
2. Initialize a queue with all courses having `inDegree` 0.
3. While queue not empty:
   - Pop a course, add it to the order list.
   - Decrement `inDegree` of adjacent courses by 1.
   - If any adjacent course's `inDegree` drops to 0, enqueue it.
4. If all courses are processed, return the order; else return an empty array indicating a cycle.

### DFS Approach (example implementation below)
- Use two boolean arrays:
  - `isVisited` for visited nodes.
  - `onStack` for nodes currently on recursion stack to detect cycles.
- Recursively traverse:
  - If a cycle is detected (`onStack` == true), return failure.
  - Push finished courses to a stack (`reversePostOrder`) to capture the ordering.

## Edge Cases
- When `numCourses` == 1 and no prerequisites, return `[0]`.
- Make sure to set `onStack[i] = false` after DFS completes for node `i` to unlink the current path.

---

## C++ DFS Implementation
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
                // Cycle detected
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

## Summary
- Problem reduces to **topological sort** on directed graph representing course prerequisites.
- BFS (Kahn’s) and DFS are two powerful, standard methods.
- DFS with cycle detection and reverse post-order traversal outputs a valid course order if it exists.
- Handle edge cases carefully, especially isolated courses and empty prerequisites.

This approach efficiently determines whether a course schedule can be completed and returns a valid ordering when possible.

---
