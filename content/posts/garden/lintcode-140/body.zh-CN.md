**经验点**

模幂的思路本身并不难，真正常见的 bug 是：<u>还没 `% b`，中间乘法就已经溢出了</u>。

- 先把底数收进模空间
- 平方和乘法都用 `long long`
- `n == 0` 时返回 `1 % b`
- 这里叫 `dfs` 不准确，本质只是 `powMod`

```cpp
class Solution {
public:
    int fastPower(int a, int b, int n) {
        // 题目通常保证 b > 0
        long long base = ((long long)a % b + b) % b;
        long long ans = 1 % b;

        while (n > 0) {
            if (n & 1) ans = ans * base % b;
            base = base * base % b;
            n >>= 1;
        }

        return (int)ans;
    }
};
```

**为什么这样写**

- `n` 当前二进制位是 `1`，就把当前底数乘进答案。
- 每轮把底数平方，相当于按位消费指数。
- 时间复杂度：`O(log n)`
- 空间复杂度：`O(1)`

如果你更喜欢递归写法，递推关系并没有变化。真正要守住的点只有一个：**所有中间乘积都必须用 64 位**。
