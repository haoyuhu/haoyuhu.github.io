**Heuristic**

`4^k` is just a stricter form of power of two.

First, verify that `n` has exactly one set bit:

```cpp
n > 0 && (n & (n - 1)) == 0
```

After that, the only remaining question is whether that single `1` is in the right place.

**Method 1: `mod 3`**

- Since `4 ≡ 1 (mod 3)`, we get `4^k - 1 ≡ 0 (mod 3)`.
- So among powers of two, a number is a power of four iff `(n - 1) % 3 == 0`.

```cpp
class Solution {
public:
    bool isPowerOfFour(int n) {
        return n > 0 && (n & (n - 1)) == 0 && (n - 1) % 3 == 0;
    }
};
```

**Method 2: bit-position mask**

- Powers of four look like `1`, `100`, `10000`, `1000000`, ...
- With zero-based indexing, the lone `1` always sits at bit positions `0, 2, 4, ...`.
- On a 32-bit integer, `0xAAAAAAAA` is `10101010 10101010 10101010 10101010`, which marks the odd bit positions.
- If `n` is already known to be a power of two, then `(n & 0xAAAAAAAA) == 0` guarantees that the only `1` is not on an odd position.

```cpp
class Solution {
public:
    bool isPowerOfFour(int n) {
        return n > 0 && (n & (n - 1)) == 0 && (n & 0xAAAAAAAA) == 0;
    }
};
```

**Practical notes**

- The `mod 3` version is usually the most readable.
- The mask version is a pure bit trick, but the mask depends on integer width. For 64-bit values, use `0xAAAAAAAAAAAAAAAAULL`.
- Bit-position wording depends on indexing: zero-based means the `1` is on an even position; one-based means it is on an odd position.
