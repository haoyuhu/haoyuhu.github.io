## Problem Overview

House Robber II is a variation of the classic House Robber problem, where houses are arranged in a **circle** rather than a line. This means the first and last houses are neighbors, and therefore, **cannot be robbed on the same night** without triggering the alarm.

Given an array `nums` containing non-negative integers representing the amount of money in each house, determine the maximum amount of money the thief can rob **without alerting the police**.

---

## Key Insight: Circular Constraint & State Representation

In the linear House Robber problem, the thief can choose to rob any house as long as adjacent houses aren’t robbed simultaneously.

However, with circular houses, the key challenge is:

- The first and last houses are connected. If both are robbed, the alarm triggers.

To incorporate this, we extend the state representation to track whether the **first house was robbed**.

### Two-Bit State Encoding

Each state at house `i` is encoded using two bits:

| State Bit | Meaning                           | Description                              |
|-----------|----------------------------------|------------------------------------------|
| High Bit  | Whether the **first house** robbed | 0 = not robbed, 1 = robbed               |
| Low Bit   | Whether the **current house (i)** robbed | 0 = not robbed, 1 = robbed              |

This gives four states:

| Binary | State Description                                   |
|--------|----------------------------------------------------|
| `00`   | First house not robbed, current house not robbed  |
| `01`   | First house not robbed, current house robbed      |
| `10`   | First house robbed, current house not robbed      |
| `11`   | First house robbed, current house robbed          |


### Transition Equations

Let `robMoney[i][state]` represent the maximum amount robbed up to house `i` in a specific state. Then:

```cpp
robMoney[i][0] = max(robMoney[i-1][0], robMoney[i-1][1]);
robMoney[i][1] = robMoney[i-1][0] + nums[i];
robMoney[i][2] = max(robMoney[i-1][2], robMoney[i-1][3]);
robMoney[i][3] = robMoney[i-1][2] + nums[i];
```

- States `0` and `1` correspond to scenarios where the first house was not robbed.
- States `2` and `3` correspond to scenarios where the first house was robbed.


## Important Considerations

- At the final house (index `n-1`), the state `11` (both first and last house robbed) is invalid and must be excluded.
- Edge case: When there is only one house, state `11` is valid (rob that house).
- At the first house (index `0`), states `01` and `10` conflict logically and should be assigned `MIN_INT` as invalid.

## Solution Code

```cpp
class Solution {
public:
    static constexpr int MIN_INT = -999999999;

    int max(int x, int y) { return x > y ? x : y; }

    int max(int x, int y, int z) {
        return max(x, max(y, z));
    }

    int rob(const std::vector<int>& nums) {
        int n = nums.size();
        if (n == 0) return 0;
        if (n == 1) return nums[0];

        std::vector<std::vector<int>> robMoney(n, std::vector<int>(4, 0));

        // Initialize for the first house
        robMoney[0][3] = nums[0];       // First house robbed, current house robbed
        robMoney[0][1] = robMoney[0][2] = MIN_INT; // Invalid states

        for (int i = 1; i < n; ++i) {
            robMoney[i][0] = max(robMoney[i-1][0], robMoney[i-1][1]);
            robMoney[i][1] = robMoney[i-1][0] + nums[i];
            robMoney[i][2] = max(robMoney[i-1][2], robMoney[i-1][3]);
            robMoney[i][3] = robMoney[i-1][2] + nums[i];
        }

        // Exclude state 11 at the last house
        return max(robMoney[n-1][0], robMoney[n-1][1], robMoney[n-1][2]);
    }
};
```

---

## Summary Table

| Aspect                  | Details                                     |
|-------------------------|---------------------------------------------|
| Problem                 | Max sum without robbing adjacent houses; houses arranged in a circle |
| Challenge               | First and last houses are neighbors; cannot be robbed simultaneously |
| State Representation    | Two-bit: [First house robbed][Current house robbed] |
| DP Transition           | Update based on previous states while avoiding invalid states |
| Edge Cases              | Single house, invalid states at start/end    |

This approach generalizes the linear problem by explicitly tracking the circular dependency with minimal state complexity, enabling an O(n) dynamic programming solution.

---

*Note:* This methodology cleanly handles the ring structure by separating the state space into two paths: one including the first house, and one excluding it, but optimized to handle both simultaneously in one DP table.
