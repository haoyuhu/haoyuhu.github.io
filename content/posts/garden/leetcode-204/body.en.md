## Problem Overview
Given an integer n, count the number of prime numbers strictly less than n.

## Key Idea: Sieve of Eratosthenes
The Sieve of Eratosthenes is a classical algorithm to find all primes up to n efficiently in O(n log log n) time.

### Algorithm Description
1. Initialize a list representing numbers from 2 to n-1.
2. Starting from the smallest unmarked number, denote it as prime.
3. Mark all multiples of this prime as non-prime.
4. Repeat until all numbers are processed.

This approach avoids the costly primality test for each number individually.

### Example
For n = 13, we handle the set {2, 3, 4, ..., 12}:

| Step | Prime Selected | Numbers Removed (Multiples)         | Remaining Set             |
|-------|----------------|----------------------------------|---------------------------|
| 1     | 2              | 4, 6, 8, 10, 12                   | {3, 5, 7, 9, 11}          |
| 2     | 3              | 6 (already removed), 9             | {5, 7, 11}                |
| 3     | 5              | 10 (already removed)               | {7, 11}                   |
| 4     | 7              | None in range                     | {11}                      |
| 5     | 11             | None in range                     | {}                        |

Thus, primes found are `{2, 3, 5, 7, 11}`.

---

## Implementation Details & Optimization Notes
- Using a `bool` array to mark whether a number is deleted is more memory-efficient than an unordered set.
- Remember the count is for primes **less than n**, not less or equal.

## Code (C++)
```cpp
class Solution {
public:
    int countPrimes(int n) {
        if (n <= 2) return 0;
        std::vector<bool> isDeleted(n, false);
        int count = 0;
        for (int i = 2; i < n; ++i) {
            if (!isDeleted[i]) {
                ++count;
                for (int multiple = 2 * i; multiple < n; multiple += i) {
                    isDeleted[multiple] = true;
                }
            }
        }
        return count;
    }
};
```

## Notes
- The inner multiple marking starts at `2 * i` to avoid marking the prime itself.
- Using `std::vector<bool>` is preferable for automatic memory management.
- Time complexity: O(n log log n), Space complexity: O(n).

---

### Summary
The Sieve of Eratosthenes remains a fundamental and efficient technique for prime enumeration and related problems like counting primes less than n, well-suited for coding interviews and algorithm design.
