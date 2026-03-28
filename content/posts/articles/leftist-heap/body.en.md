## Mergeable priority queues

Leftist heaps and skew heaps are both binary-tree implementations of a min-priority queue. Their main advantage over an array-based binary heap is that **merge is a first-class operation**. Once merge is efficient, two other operations become simple wrappers: `insert` is a merge with a single-node heap, and `extract-min` removes the root and merges its two subtrees.

## Structural invariants

- **Heap order**: every node key is less than or equal to the keys of its children.
- **Leftist heap**: each node stores `dist`, often called the null-path length. The left child must have `dist >=` the right child. In the convention used below, a leaf has `dist = 0`, so `node.dist = node.right ? node.right->dist + 1 : 0`.
- **Skew heap**: no `dist` is stored. Instead, the heap self-adjusts by swapping the current node's children after each merge step.

| Structure | Extra field | How balance is maintained | Complexity |
|---|---|---|---|
| Leftist heap | `dist` | Swap children only when `left.dist < right.dist` | `merge`, `insert`, `extract-min`: `O(log n)` worst case |
| Skew heap | none | Swap children on every merge step | `O(log n)` amortized |

## Why the leftist property helps

A leftist heap pushes the shortest path toward the right side of the tree. As a result, the right spine stays short, and merge only recurses along that spine. That is the reason the worst-case bound is logarithmic.

A skew heap removes the explicit metadata and accepts a looser guarantee. Its balancing is **self-adjusting**: repeated unconditional swaps during merge gradually prevent the structure from remaining badly skewed for long. You give up strict worst-case shape control, but gain a smaller node and simpler bookkeeping.

```mermaid
flowchart TD
    A[merge(a, b)] --> B{a or b is null?}
    B -->|yes| C[return the non-null root]
    B -->|no| D{a.key > b.key?}
    D -->|yes| E[swap a and b]
    D -->|no| F[a.right = merge(a.right, b)]
    E --> F
    F --> G{Heap type}
    G -->|Leftist| H[swap children if needed and update dist]
    G -->|Skew| I[swap left and right unconditionally]
    H --> J[return a]
    I --> J
```

## Merge drives everything

The merge routine follows the same pattern in both structures:

1. If either root is empty, return the other.
2. Keep the smaller root as the new root.
3. Recursively merge into its right subtree.
4. Restore the structure-specific invariant.
5. Return the resulting root.

That gives two immediate corollaries:

- **Insert**: create a singleton node, then merge it into the heap.
- **Extract-min**: remove the root, then merge its left and right subtrees.

This is the key mental model: unlike an array heap, you do not think in terms of sift-up or sift-down. You think in terms of merging trees.

## Corrected modern C++ core

The essence of both structures is the merge routine. The skew-heap version below also fixes a common bug in legacy code: the final swap must exchange `a->left` and `a->right`, not `a->left` and `b->right`.

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

## Implementation notes

A few details matter in practice:

- `extract-min` should check for an empty root before dereferencing it.
- Recursive `destroy` functions should be null-safe, or better, replaced with smart pointers in modern C++.
- Textbooks use slightly different `dist` conventions. The exact base value matters less than applying one definition consistently.

If you want predictable structural guarantees, choose a **leftist heap**. If you prefer less metadata and a simpler self-adjusting node structure, a **skew heap** is often the cleaner choice.
