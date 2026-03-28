**Heuristic**

For modular exponentiation, the algorithm is standard; the bug is usually **overflow before `% b` is applied**.

- Reduce the base first
- Square and multiply in `long long`
- `n == 0` should return `1 % b`
- `dfs` is a misleading name here; this is just `powMod`

```cpp
class Solution {
public:
    int fastPower(int a, int b, int n) {
        // Problem constraint: b > 0
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

**Why it works**

- If the current bit of `n` is `1`, multiply the answer by the current base.
- Each round squares the base, so the exponent is consumed bit by bit.
- Time complexity: `O(log n)`
- Space complexity: `O(1)`

If you prefer the recursive form, the recurrence is the same. The important fix is still the same: **all intermediate products must be 64-bit**.
