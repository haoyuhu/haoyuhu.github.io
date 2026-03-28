**Core idea**

This solution encodes a binary tree with two traversals: **inorder** and **preorder**. Concatenate them as `inorder#preorder`, where each traversal is a space-separated integer list. During deserialization, rebuild the tree from those two sequences.

The key fact is: **preorder + inorder uniquely determine a binary tree** **only when node values are unique**. That assumption is implicit in the original note and should be stated clearly.

**Encoding**

- Empty tree -> `"#"`
- Non-empty tree -> `join(inorder) + "#" + join(preorder)`
- Example: `"4 2 5 1 3#1 2 4 5 3"`

**Deserialization**

1. Split the string at `#`.
2. Parse both integer lists.
3. The first preorder value is the root.
4. Find that value in inorder to determine the left and right subtree ranges.
5. Recurse on the corresponding slices.

**Implementation cleanups**

- Use stream extraction to parse integers; do not count spaces manually.
- Let the recursive builder return `TreeNode*` directly instead of mutating `TreeNode*&`.
- Fix the base case to `if (inL > inR || preL > preR) return nullptr;`.
- Build a hash map from inorder value to index to avoid repeated linear scans.

With the index map, both serialization and deserialization run in **O(n)** time and use **O(n)** extra space.

This is not the most compact production serializer—preorder with null markers is usually simpler—but it is a neat reconstruction-based approach and fits LintCode’s “design your own format” requirement well. If duplicates are allowed, this encoding is no longer sufficient.
