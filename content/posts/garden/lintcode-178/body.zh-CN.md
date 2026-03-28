**思路**

对于无向图，最简洁的树判断方式是：

- **边数必须是 `n - 1`**
- **一次遍历必须访问到所有节点**

这两个检查就足够了。在通过 `n - 1` 的判断后，你不需要再单独做环检测：一个恰好有 `n - 1` 条边的连通无向图天然无环。

原始版本构建了一个 `n x n` 的邻接矩阵。这样当然可行，但这里更推荐默认使用邻接表：内存开销更低，遍历也更清晰。

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

**为什么这样可行**

- 如果 `edges.size() != n - 1`，这张图不可能是树。
- 如果从节点 `0` 开始的 DFS 能到达所有节点，图就是连通的。
- 连通 + `n - 1` 条边意味着不存在环，因此该图是一棵有效树。

有一个容易忽略的细节：这里的 DFS 没有记录父节点。这是刻意为之。只有在你需要分别独立检查“是否连通”和“是否有环”时，才需要基于父节点的环检测。在这个版本里，边数这个不变量已经让那部分额外逻辑变得多余。

边界情况：当 `n == 1` 且没有边时，返回 `true`；而 `n == 0` 在面试场景中通常视为 `false`。这里用 DFS 或 BFS 都可以。

**复杂度**：时间 `O(n + m)`，空间 `O(n + m)`，其中 `m = edges.size()`。
