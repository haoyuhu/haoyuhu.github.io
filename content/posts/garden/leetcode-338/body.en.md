**Core idea**

For a single integer `x`, repeatedly doing `x &= x - 1` clears its lowest set bit. The number of iterations is exactly the popcount of `x`.

So the direct solution is simple: compute that count for every number from `0` to `num`.

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

**Why `x & (x - 1)` works**

Subtracting `1` flips the lowest `1` bit in `x` to `0`, and changes the bits to its right. After the `&`, that lowest `1` disappears while higher bits stay unchanged.

Example:

- `x = 1011000`
- `x - 1 = 1010111`
- `x & (x - 1) = 1010000`

One loop removes one `1`.

**Complexity**

- Time: `O(total set bits from 0..num)`; commonly treated as `O(n log n)` in the worst case for this per-number method
- Space: `O(1)` extra, excluding the output

<u>Heuristic</u>: this is the right first answer if you recognize the bit trick quickly. For LeetCode 338’s linear-time follow-up, switch to DP, such as `ans[i] = ans[i & (i - 1)] + 1` or `ans[i] = ans[i >> 1] + (i & 1)`.
