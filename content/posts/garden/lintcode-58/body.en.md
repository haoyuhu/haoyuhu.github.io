**Idea**

The legacy solution had the right instinct: **sort first**, then use ordering to search and deduplicate. The main weakness was the custom hash used to reject repeated quadruplets:

`a + 10*b + 100*c + 35937*d`

That hash is not collision-safe, so distinct quadruplets can map to the same value and be dropped.

**Modern rewrite**

A cleaner version keeps the same `O(n^3)` target but replaces the hash-and-set trick with the canonical **two-pointer** scan.

1. Sort `nums`.
2. Fix `i` as the first element; skip duplicate `i` values.
3. Fix `j` as the second element; skip duplicate `j` values.
4. Search the remaining suffix with `left = j + 1` and `right = n - 1`.
5. Compare the four-number sum with `target`:
   - too small: move `left`
   - too large: move `right`
   - equal: record one quadruplet, then advance both pointers past duplicates

This is easier to reason about because sorted order gives a clear invariant: moving `left` increases the sum, while moving `right` decreases it. The original inner `unordered_set` complement scan worked in spirit, but it hid that monotonic structure.

**Why this version is safer**

- **Correct deduplication** without collision-prone hashing
- Same asymptotic complexity: `O(n^3)`
- `O(1)` extra space beyond the output
- Simple early pruning using minimum and maximum possible sums for each fixed `i` and `j`
- In C++, prefer `long long` for the running sum to avoid overflow

**Takeaway**: sorting is still the core idea. The modern solution just makes uniqueness explicit, removes the ad hoc hash, and turns a clever but fragile implementation into a standard, reliable 4Sum template.
