**核心思路**

对单个整数 `x`，不断执行 `x &= x - 1`，每次都会清掉最低位的一个 `1`。循环执行了多少次，`x` 的二进制里就有多少个 `1`。

因此，最直接的做法就是：把 `0` 到 `num` 每个数都单独统计一遍。

```cpp
class Solution {
public:
    vector<int> countBits(int num) {
        vector<int> ans;
        ans.reserve(num + 1);

        for (int i = 0; i <= num; ++i) {
            ans.push_back(popcount(i));
        }
        return ans;
    }

private:
    static int popcount(int x) {
        int bits = 0;
        while (x != 0) {
            x &= (x - 1);
            ++bits;
        }
        return bits;
    }
};
```

**为什么 `x & (x - 1)` 有效**

对 `x` 减 `1` 时，最低位的那个 `1` 会变成 `0`，它右边的位会发生翻转。再与原数做一次 `&`，就能把这个最低位的 `1` 精确抹掉，而更高位保持不变。

例子：

- `x = 1011000`
- `x - 1 = 1010111`
- `x & (x - 1) = 1010000`

一次循环，恰好去掉一个 `1`。

**复杂度**

- 时间：`O(0..num 区间内所有数的置位总数)`；按单个数分别统计时，最坏情况通常可记作 `O(n log n)`
- 空间：`O(1)` 额外空间，不计输出数组

**经验判断**：如果你第一眼就想到这个位运算技巧，这通常是最自然的基线解。但 LeetCode 338 还追问严格线性时间，这时更适合改成 DP，例如 `ans[i] = ans[i & (i - 1)] + 1`，或 `ans[i] = ans[i >> 1] + (i & 1)`。
