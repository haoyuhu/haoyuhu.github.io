## Problem Overview
Given a sorted positive integer array `nums` and an integer `n`, the goal is to ensure that every number in the range `[1, n]` can be formed as a sum of some subset of the array elements. We want to find the minimum number of patches (additional numbers) needed to achieve this.

---

## Key Idea and Invariants
- Maintain a variable `miss` representing the smallest value in `[1, n]` that **cannot** be formed by the array and the patches added so far. Initially, `miss = 1`.
- If the next number `nums[i]` in the array is within the current coverage (i.e., `nums[i] <= miss`), we can extend coverage to `[0, miss + nums[i])` by adding that number to the subset sums.
- If `nums[i]` is greater than `miss`, adding it doesn't fill the gap at `miss`. The optimal fix is to patch the array by adding `miss` itself, thereby doubling the coverage range to `[0, 2 * miss)`.

This greedy approach ensures minimal patches and runs in O(m) time, where m is the length of `nums`.

---

## Algorithm Flow

```mermaid
flowchart TD
    Start[Start with miss = 1, i = 0, patches = 0]
    CheckNum{Is i < len(nums) and nums[i] <= miss?}
    UseNum[Extend coverage: miss = miss + nums[i], i = i + 1]
    Patch[Patch with miss: miss = miss * 2, patches = patches + 1]
    Continue[Continue while miss <= n]
    End[Return patches]

    Start --> Continue
    Continue --> CheckNum
    CheckNum -- Yes --> UseNum --> Continue
    CheckNum -- No --> Patch --> Continue
    Continue -- No --> End
```

---

## Code Implementation (C++)
```cpp
class Solution {
public:
    int minPatches(vector<int>& nums, int n) {
        long miss = 1; // smallest missing sum
        int patches = 0, i = 0;
        while (miss <= n) {
            if (i < nums.size() && nums[i] <= miss) {
                miss += nums[i++];
            } else {
                // Patch by adding 'miss' itself
                miss <<= 1; // equivalent to miss *= 2
                ++patches;
            }
        }
        return patches;
    }
};
```

---

## Summary
| Scenario               | Action                 | Coverage Range After |
|------------------------|------------------------|---------------------|
| Next number ≤ miss     | Use next number         | [0, miss + nums[i])  |
| Next number > miss     | Patch with miss itself  | [0, 2 * miss)        |

This approach elegantly ensures all integers in `[1, n]` become reachable sums with minimal patches.
