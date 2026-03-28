**Idea**

For an undirected graph, the cleanest tree test is:

- **Edge count must be `n - 1`**
- **A single traversal must visit every node**

These two checks are sufficient. After the `n - 1` test, you do not need separate cycle detection: a connected undirected graph with exactly `n - 1` edges is automatically acyclic.

The original version builds an `n x n` adjacency matrix. That works, but an adjacency list is the better default here: lower memory cost and clearer traversal.

```cpp
class Solution {
public:
    bool validTree(int n, vector<vector<int>>& edges) {
        if (n == 0) return false;
        if (edges.size() != static_cast<size_t>(n - 1)) return false;

        vector<vector<int>> graph(n);
        for (const auto& e : edges) {
            int u = e[0], v = e[1];
            graph[u].push_back(v);
            graph[v].push_back(u);
        }

        vector<bool> visited(n, false);
        dfs(0, graph, visited);

        for (bool seen : visited) {
            if (!seen) return false;
        }
        return true;
    }

private:
    void dfs(int u, const vector<vector<int>>& graph, vector<bool>& visited) {
        visited[u] = true;
        for (int v : graph[u]) {
            if (!visited[v]) dfs(v, graph, visited);
        }
    }
};
```

**Why this works**

- If `edges.size() != n - 1`, the graph cannot be a tree.
- If DFS from node `0` reaches all nodes, the graph is connected.
- Connected + `n - 1` edges implies no cycle, so the graph is a valid tree.

One subtle point: DFS here does not track parent nodes. That is intentional. Parent-aware cycle detection is necessary only when you are checking connectivity and cycles independently. In this version, the edge-count invariant already eliminates the need for that extra logic.

Edge cases: `n == 1` with no edges returns true, while `n == 0` is usually treated as false in interview settings. DFS and BFS are interchangeable here.

<u>Complexity</u>: `O(n + m)` time and `O(n + m)` space, where `m = edges.size()`.
