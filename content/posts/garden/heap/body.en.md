### Overview

Building a heap (heapify) is a fundamental operation in data structures. Although each sift-down operation may appear costly, the total time complexity to build a heap on an array of size **N** is **O(N)** rather than **O(N log N)**. This note presents a rigorous mathematical proof for this time complexity bound by analyzing the heap as a complete binary tree.

---

### Key Idea

Consider a **full binary tree** with height *n* (root at level 0). At level *i*, there are $2^i$ nodes.

- The heap construction process proceeds from the bottom up.
- Each node at level *i* might require at most $(n - i)$ swaps to restore the heap property in the worst case.

Hence, the total number of operations $T(n)$ can be expressed as:

$$
T(n) = \sum_{i=0}^n 2^i \cdot (n - i)
$$

---

### Step-by-Step Proof Using Shifted Subtraction

1. Multiply the entire sum by 2:

$$
2T(n) = \sum_{i=0}^n 2^{i+1} (n - i) = \sum_{i=0}^n (n - i) 2^{i+1}
$$

2. Original sum:

$$
T(n) = \sum_{i=0}^n (n - i) 2^i
$$

3. Subtract original sum from doubled sum:

$$
2T(n) - T(n) = \sum_{i=0}^n (n - i)(2^{i+1} - 2^i) = \sum_{i=0}^n (n - i) 2^i
$$

By re-indexing and carefully separating terms, this simplifies to:

$$
2T(n) - T(n) = -n + 2^1 + 2^2 + ... + 2^n = 2^{n+1} - 2 - n
$$

---

### Interpretation

The total number of nodes in the full binary tree is:

$$
N = 1 + 2 + 4 + ... + 2^n = 2^{n+1} - 1 \approx 2^{n+1}
$$

Substituting back:

$$
T(N) = 2^{n+1} - n - 2 = N - n - 2
$$

Since $n = \log_2(N)$, the terms $n$ and 2 are negligible compared to $N$ for large inputs, yielding:

$$
T(N) = \mathcal{O}(N)
$$

---

### Summary Table

| Variable | Meaning                  | Formula / Value           |
|----------|--------------------------|--------------------------|
| n        | Tree height (levels)      | $\log_2(N)$              |
| $2^i$    | Number of nodes at level i| Exponential growth       |
| $(n - i)$| Max swaps per node at level i | Decreases up the tree   |
| $T(n)$   | Total heapify operations  | $\sum_{i=0}^n 2^i (n - i)$ |


This analysis rigorously confirms that the bottom-up heap construction algorithm completes in linear time with respect to the number of nodes.

---

### Further Reading
- [CLRS - Introduction to Algorithms (Heapify proof section)](https://mitpress.mit.edu/books/introduction-algorithms-third-edition)
