## Core idea

Treat `nums[i]` as the maximum jump length from index `i`.
- **Jump Game I (55):** can we reach the last index?
- **Jump Game II (45):** what is the minimum number of jumps?

### Jump Game I

The cleanest solution is greedy. Maintain `farthest`, the furthest index reachable so far. Scan from left to right:
- if `i > farthest`, there is a gap, so the end is unreachable;
- otherwise update `farthest = max(farthest, i + nums[i])`.

```cpp
bool canJump(vector<int>& nums) {
    int farthest = 0;
    for (int i = 0; i < (int)nums.size() && i <= farthest; ++i)
        farthest = max(farthest, i + nums[i]);
    return farthest >= (int)nums.size() - 1;
}
```

This is **O(n)** time and **O(1)** space.

### Jump Game II

A queue-based BFS is intuitive: each index is a node, and all reachable positions are edges. That works, but the modern solution compresses each BFS layer into a range.

Track:
- `end`: right boundary of the current layer
- `farthest`: right boundary of the next layer
- `steps`: number of jumps used

```cpp
int jump(vector<int>& nums) {
    int steps = 0, end = 0, farthest = 0;
    for (int i = 0; i < (int)nums.size() - 1; ++i) {
        farthest = max(farthest, i + nums[i]);
        if (i == end) { ++steps; end = farthest; }
    }
    return steps;
}
```

This is also **O(n)** time and **O(1)** space. If reachability is not guaranteed, add a guard for `i > farthest` and return `-1`.

<u>BFS is still the right mental model</u>; greedy is just the tighter implementation. If you keep the older `distance`-array version, prefer `vector<int>` over the non-standard `int distance[n]`.
