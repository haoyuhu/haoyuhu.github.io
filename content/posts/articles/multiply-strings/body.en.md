## Problem framing

When built-in integer types overflow, the practical fallback is to treat numbers as decimal strings and implement arithmetic manually. The original post surveyed three families of algorithms. That structure still holds, but the middle approach deserves a more precise name: it is essentially **Karatsuba-style multiplication**.

| Approach | Core idea | Time complexity | Best use case |
| --- | --- | --- | --- |
| Schoolbook multiplication | Simulate pen-and-paper multiplication | `O(n^2)` | Interviews, short and reliable implementations |
| Karatsuba-style divide and conquer | Reduce 4 sub-multiplications to 3 | `O(n^{log_2 3}) ≈ O(n^1.585)` | Learning algorithmic optimization |
| FFT / NTT | Treat multiplication as polynomial convolution | `O(n log n)` | Very large inputs, specialized libraries |

## Karatsuba-style split

Let

`P = A * 10^k + B`  
`Q = C * 10^k + D`

where `k` is the number of digits in the low half. If the lengths differ, a practical choice is `k = min(len(P), len(Q)) / 2`.

A direct divide-and-conquer expansion gives:

`PQ = AC * 10^(2k) + (AD + BC) * 10^k + BD`

But that still requires **four** recursive multiplications: `AC`, `AD`, `BC`, and `BD`, so the asymptotic complexity remains `O(n^2)`.

The useful identity is:

`(A - B)(C - D) = AC - AD - BC + BD`

So we can rewrite the middle term as:

`AD + BC = AC + BD - (A - B)(C - D)`

which leads to:

`PQ = AC * 10^(2k) + (AC + BD - (A - B)(C - D)) * 10^k + BD`

Now each level performs only **three** recursive multiplications: `AC`, `BD`, and `(A-B)(C-D)`. The recurrence becomes:

`T(n) = 3T(n/2) + O(n)`

By the Master Theorem, this is **`O(n^{log_2 3}) ≈ O(n^1.585)`**, not `O(n^1.5)`.

```mermaid
flowchart TD
    S[Normalize inputs] --> Z{Zero or one digit?}
    Z -- yes --> D[Direct digit multiply]
    Z -- no --> P[Split into high and low parts]
    P --> M1[AC]
    P --> M2[BD]
    P --> M3[(A-B)(C-D)]
    M1 --> R[Recombine with powers of 10]
    M2 --> R
    M3 --> R
```

## Helper routines that make or break the implementation

The multiplication formula is concise; the real engineering effort is in the helpers.

- **`addStrings`**: scan from right to left, keep a carry, append digits in reverse, then reverse once.
- **`subtractStrings`**: compare magnitudes first, swap if needed, then borrow digit by digit. Return both the absolute result and the sign.
- **`multiplyByDigit`**: the simplest base case when one operand has length `1`.
- **`trimLeadingZeros`**: essential after slicing substrings during recursion; otherwise values like `"00012"` keep leaking into later steps.
- **`shift10(s, k)`**: append `k` zeros to represent multiplication by `10^k` instead of constructing large numeric powers.

A few upgrades make the original code cleaner and safer:

1. Rename vague helpers like `minus` to `subtractStrings`, and fix typos such as `mulitplySingleNumber`.
2. Handle equal-number subtraction explicitly: if the magnitudes are the same, return `"0"` immediately.
3. When combining the signs of `(A-B)` and `(C-D)`, use `sameSign = (sign1 == sign2)` instead of a long boolean expression.
4. Trim leading zeros after every split and after final recombination.
5. If performance matters, store digits in a reversed `vector<int>` rather than converting between `char` and `int` throughout the recursion.

## Practical takeaway

For the actual **LeetCode `Multiply Strings`** problem, the schoolbook `O(n^2)` solution is usually the best trade-off: shorter code, fewer edge cases, and strong performance on interview-sized inputs. But if the goal is to understand how multiplication scales, the Karatsuba-style rewrite is the right next step. It preserves the same decimal-string model while showing that **most of the complexity lives in representation, normalization, and helper operations—not in the final algebraic identity itself**.
