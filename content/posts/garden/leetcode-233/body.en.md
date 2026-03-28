## Problem Overview
Given an integer n, count the total occurrences of the digit '1' in all non-negative integers less than or equal to n.

**Example:** For n = 13, the digit '1' appears 6 times in these numbers: 1, 10, 11, 12, 13.

---

## Naive Approach: Enumerate and Count
A straightforward method involves iterating through every number from 1 to n, and for each number, count the digit '1's explicitly.

```cpp
class Solution {
public:
    int countDigitOne(int n) {
        int count = 0;
        for (int i = 1; i <= n; ++i) {
            int num = i;
            while (num) {
                if (num % 10 == 1) ++count;
                num /= 10;
            }
        }
        return count;
    }
};
```

- **Time Complexity:** O(n log n), where log n accounts for digit counting per number.
- **Issue:** This method times out for large n due to excessive computations.

---

## Efficient Approach: Digit Position Analysis
The key insight is to count '1's based on individual digit positions rather than enumerating numbers.

Assume a number n has digits \( a_m a_{m-1} ... a_0 \), where \( a_i \) is the digit at the i-th position (0-based from the right). For each digit position i, define:

- \( p \) as the number formed by digits left to position i (higher digits).
- \( k = a_i \) as the digit at position i.
- \( q \) as the number formed by digits right to position i (lower digits).

The count of '1's contributed by position i can be computed by:

\[
\text{count}_i = p \times 10^i + \begin{cases}
q + 1 & \text{if } k = 1 \\
10^i & \text{if } k > 1 \\
0 & \text{if } k = 0
\end{cases}
\]

**Example:** For n = 83121 and digit position i=2 (hundreds place, digit = 1):
- \( p = 83 \) (digits to the left)
- \( q = 21 \) (digits to the right)
- \( k = 1 \)

Then, count = \( 83 	imes 100 + (21 + 1) = 8300 + 22 = 8322 \) ones at hundreds place.

---

## Algorithm Complexity
- Time: \( O(\log n) \) — iterating through digit positions.
- Space: \( O(1) \) — constant extra space.

---

## Implementation
```cpp
class Solution {
public:
    int countDigitOne(int n) {
        int count = 0;
        int previous = 0;  // represents q
        int coef = 1;      // represents 10^i

        while (n > 0) {
            int remain = n % 10;       // k
            int over = n / 10;         // p

            if (remain > 1) {
                count += coef;
            } else if (remain == 1) {
                count += previous + 1;
            }
            count += coef * over;

            previous += coef * remain;
            coef *= 10;
            n /= 10;
        }

        return count;
    }
};
```

---

## Summary Table
| Variable | Meaning                      | Use Case                              |
|----------|------------------------------|-------------------------------------|
| n        | Input number                 | Reduce in each loop for digit extract |
| remain   | Digit at current position k  | Decide contribution to count         |
| over     | Digits left to position i (p)| Multiplier for full cycles            |
| previous | Digits right to position i (q)| Partial count if digit equals 1      |
| coef     | Powers of 10 (10^i)          | Weight of current digit position      |

---

This digit-based counting technique elegantly solves the problem within efficient runtime and avoids brute-force limitations.
