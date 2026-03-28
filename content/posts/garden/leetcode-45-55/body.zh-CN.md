## 核心思路

把 `nums[i]` 视为从下标 `i` 出发时的最大跳跃长度。
- **跳跃游戏 I（55）：** 能否到达最后一个下标？
- **跳跃游戏 II（45）：** 最少需要跳几次？

### 跳跃游戏 I

最干净的解法是贪心。维护 `farthest`，表示当前为止能够到达的最远下标。然后从左到右扫描：
- 如果 `i > farthest`，说明中间出现了断层，因此无法到达终点；
- 否则更新 `farthest = max(farthest, i + nums[i])`。

```cpp
bool canJump(vector<int>& nums) {
    int farthest = 0;
    for (int i = 0; i < (int)nums.size() && i <= farthest; ++i)
        farthest = max(farthest, i + nums[i]);
    return farthest >= (int)nums.size() - 1;
}
```

这个解法的时间复杂度是 **O(n)**，空间复杂度是 **O(1)**。

### 跳跃游戏 II

基于队列的 BFS 很直观：每个下标都是一个节点，所有可达位置都是边。这样当然可行，但现在更常见的做法是把每一层 BFS 压缩成一个区间。

需要维护：
- `end`：当前层的右边界
- `farthest`：下一层的右边界
- `steps`：已经使用的跳跃次数

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

这个解法同样是 **O(n)** 时间、**O(1)** 空间。如果题目不保证一定可达，需要补一个 `i > farthest` 的判断，并返回 `-1`。

**BFS 仍然是正确的心智模型**；贪心只是更紧凑的实现。如果你还保留旧版的 `distance` 数组写法，优先使用 `vector<int>`，不要用非标准的 `int distance[n]`。
