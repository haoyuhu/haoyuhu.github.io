## Problem Overview
LeetCode 207 "Course Schedule" requires determining if it is possible to finish all courses given a list of prerequisite pairs. This is a classic problem of detecting whether a directed graph contains any cycles. If a cycle exists, it is impossible to complete all courses.

## Key Idea: Detect Cycles in a Directed Graph
- Represent courses as nodes in a graph.
- Edges represent prerequisite relationships (directed edges).
- Detect if the directed graph has any cycle.

## Graph Representation
Using an **adjacency list** is preferred here for efficiency compared to an adjacency matrix, especially when the graph is sparse.

## Algorithm: Depth-First Search (DFS) Cycle Detection
We use DFS with two auxiliary boolean arrays:
- `isVisited`: marks nodes that have already been fully explored.
- `onStack`: marks nodes currently on the recursion stack (the path from the DFS root), to detect back edges indicating cycles.

If during DFS, we reach a node already on the stack, a cycle exists.

---

### Code Implementation (C++)

```cpp
class Solution {
public:
    bool canFinish(int numCourses, const vector<vector<int>>& prerequisites) {
        if (prerequisites.empty()) return true;

        // Build adjacency list: map[course] = list of prerequisites
        vector<vector<int>> adjList(numCourses);
        for (const auto& pair : prerequisites) {
            adjList[pair[0]].push_back(pair[1]);
        }

        vector<bool> isVisited(numCourses, false);
        vector<bool> onStack(numCourses, false);

        for (int course = 0; course < numCourses; ++course) {
            if (!isVisited[course]) {
                if (hasCycle(adjList, course, isVisited, onStack))
                    return false;  // Cycle found
            }
        }
        return true;  // No cycles found
    }

private:
    bool hasCycle(const vector<vector<int>>& adjList, int node, vector<bool>& isVisited, vector<bool>& onStack) {
        isVisited[node] = true;
        onStack[node] = true;

        for (int prereq : adjList[node]) {
            if (onStack[prereq]) {
                return true;  // Cycle detected
            }
            if (!isVisited[prereq] && hasCycle(adjList, prereq, isVisited, onStack)) {
                return true;  // Cycle found downstream
            }
        }

        onStack[node] = false;
        return false;
    }
};
```

---

## Summary Table: DFS Cycle Detection State

| State Variable | Purpose                                         |
|----------------|------------------------------------------------|
| isVisited      | Marks nodes completely explored, avoid repeats |
| onStack        | Marks nodes in current DFS recursion stack     |

If during DFS, a neighbor is found **onStack**, a cycle exists.

---

This approach ensures the algorithm runs in O(N + E) time (N = number of courses, E = number of edges/prerequisites), making it efficient for large inputs.
