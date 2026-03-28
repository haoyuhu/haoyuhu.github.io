## 可合并优先队列

左偏堆和斜堆都是最小优先队列的二叉树实现。它们相对于基于数组的二叉堆的主要优势在于，<u>`merge` 是一等操作</u>。一旦 `merge` 足够高效，另外两种操作就只是简单封装：`insert` 是把当前堆与单节点堆合并，而 `extract-min` 则是删除根节点后再把它的两棵子树合并。

## 结构不变式

- **堆序**：每个节点的键都小于或等于其子节点的键。
- **左偏堆**：每个节点存储 `dist`，通常称为空路径长度。左孩子的 `dist` 必须 `>=` 右孩子的 `dist`。在下文采用的约定中，叶子节点的 `dist = 0`，因此 `node.dist = node.right ? node.right->dist + 1 : 0`。
- **斜堆**：不存储 `dist`。相反，它会在每一步合并之后交换当前节点的两个孩子，从而完成自调整。

| 结构 | 额外字段 | 如何维持平衡 | 复杂度 |
|---|---|---|---|
| 左偏堆 | `dist` | 仅当 `left.dist < right.dist` 时交换孩子 | `merge`、`insert`、`extract-min`：最坏情况 `O(log n)` |
| 斜堆 | 无 | 每一步 `merge` 都交换孩子 | `O(log n)` 摊还 |

## 为什么左偏性质有用

左偏堆会把最短路径压到树的右侧。结果就是右链会保持很短，而 `merge` 只会沿着这条右链递归。这正是其最坏情况复杂度能保持对数级的原因。

斜堆去掉了显式元数据，并接受更宽松的保证。它的平衡方式是**自调整**：在合并过程中反复进行无条件交换，逐步避免结构长时间维持严重倾斜。你放弃了严格的最坏情况形状控制，但换来了更小的节点和更简单的维护逻辑。

```mermaid
flowchart TD
    A[merge(a, b)] --> B{a 或 b 为空?}
    B -->|是| C[返回非空根]
    B -->|否| D{a.key > b.key?}
    D -->|是| E[交换 a 和 b]
    D -->|否| F[a.right = merge(a.right, b)]
    E --> F
    F --> G{堆类型}
    G -->|左偏堆| H[按需交换孩子并更新 dist]
    G -->|斜堆| I[无条件交换 left 和 right]
    H --> J[返回 a]
    I --> J
```

## 合并驱动一切

两种结构中的 `merge` 例程都遵循同一套模式：

1. 如果任一根为空，返回另一个。
2. 保留较小的根作为新根。
3. 递归合并到它的右子树中。
4. 恢复该结构特有的不变式。
5. 返回结果根节点。

这会直接导出两个结论：

- **插入（`insert`）**：创建一个单节点，再把它合并进堆。
- **取出最小值（`extract-min`）**：删除根节点，然后合并它的左右子树。

这才是关键的思维模型：不同于数组堆，这里你不会从 `sift-up` 或 `sift-down` 的角度思考，而是从“合并两棵树”的角度思考。

## 修正后的现代 C++ 核心代码

这两种结构的本质都在于 `merge` 例程。下面的斜堆版本还修复了旧代码中一个常见错误：最后一次交换必须交换的是 `a->left` 和 `a->right`，而不是 `a->left` 和 `b->right`。

```cpp
#include <algorithm>

struct LeftistNode {
    int key;
    unsigned dist = 0;
    LeftistNode* left = nullptr;
    LeftistNode* right = nullptr;
    explicit LeftistNode(int k) : key(k) {}
};

LeftistNode* merge(LeftistNode* a, LeftistNode* b) {
    if (!a) return b;
    if (!b) return a;
    if (a->key > b->key) std::swap(a, b);

    a->right = merge(a->right, b);

    unsigned leftDist = a->left ? a->left->dist : 0;
    unsigned rightDist = a->right ? a->right->dist : 0;
    if (!a->left || leftDist < rightDist) std::swap(a->left, a->right);

    a->dist = a->right ? a->right->dist + 1 : 0;
    return a;
}

struct SkewNode {
    int key;
    SkewNode* left = nullptr;
    SkewNode* right = nullptr;
    explicit SkewNode(int k) : key(k) {}
};

SkewNode* merge(SkewNode* a, SkewNode* b) {
    if (!a) return b;
    if (!b) return a;
    if (a->key > b->key) std::swap(a, b);

    a->right = merge(a->right, b);
    std::swap(a->left, a->right);
    return a;
}
```

## 实现注意事项

实践中有几个细节很重要：

- `extract-min` 在解引用根节点之前，应先检查它是否为空。
- 递归式 `destroy` 函数应当对空指针安全；更好的做法是在现代 C++ 中直接使用智能指针。
- 不同教材对 `dist` 的约定略有差异。基值具体取什么并没有那么重要，重要的是始终如一地使用同一定义。

如果你需要可预测的结构保证，选择 **左偏堆**。如果你更看重更少的元数据和更简单的自调整节点结构，**斜堆** 往往是更利落的选择。
