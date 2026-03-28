## Problem Overview
The problem sets a dungeon represented by an MxN grid where each cell contains an integer:
- Negative values represent damage inflicted by demons.
- Zero indicates an empty room.
- Positive values represent health orbs that boost the knight's health.

The knight starts at the top-left corner (*0,0*) and must rescue the princess imprisoned in the bottom-right corner (*M-1,N-1*). He can only move **right** or **down**. Health drops to zero or below at any time means death.

The task: **Determine the knight's minimum initial health such that he can reach the princess alive.**

### Constraints
- The knight's initial health is positive and unbounded above.
- The rooms, including the start and princess's cell, can contain any integer.

---

## Key Insight: Dynamic Programming Formulation

### Forward Approach: Why It Fails
Define `dp[i][j]` as the minimum initial health needed to reach `(i,j)` safely from the start.

However, unlike classic shortest path problems, the knight's remaining health at `(i,j)` depends on the path taken, making it insufficient to pick the minimum between the top or left cells without considering the state of the remaining health.

This complexity arises because a path with a smaller required initial health might have very low remaining health mid-way, risking death on negative next steps.

### Reverse Approach: The Elegant Solution
Define `dp[i][j]` as the minimum health **to have upon entering** cell `(i,j)` so the knight can safely reach the princess.

This transforms the problem into:

```cpp
// State transition:
dp[i][j] = max( min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j], 0 );
```

- The term `min(dp[i+1][j], dp[i][j+1])` represents the minimum health needed from the next steps.
- Subtracting the current cell value adjusts for damage or healing.
- Values are clamped to zero since health can never be below 1 on entry (considering we add 1 afterwards).

At the boundaries, cells outside grid are considered to require an infinite health, except the princess's cell where the base case is 0.

`
The answer is obtained from `dp[0][0] + 1` since the knight must have at least 1 HP upon entering the first room.

---

## Algorithm Flow in Mermaid Diagram

```mermaid
graph LR
  Start((Princess Cell dp[M-1][N-1]))
  FromRight[dp[i][j+1]]
  FromDown[dp[i+1][j]]
  CurrentCell[dp[i][j]]

  Start --> CurrentCell
  FromRight --> CurrentCell
  FromDown --> CurrentCell

  style Start fill:#f9f,stroke:#333,stroke-width:2px
  style CurrentCell fill:#bbf,stroke:#333,stroke-width:2px
```


---

## Code Implementation (C++)

```cpp
class Solution {
public:
    int calculateMinimumHP(vector<vector<int>>& dungeon) {
        int rows = dungeon.size();
        int cols = dungeon[0].size();
        
        // dp[i][j] stores minimum health required to enter dungeon[i][j]
        vector<vector<int>> dp(rows + 1, vector<int>(cols + 1, INT_MAX));

        // Base case: the knight needs at least 1 HP to survive beyond princess cell
        dp[rows][cols - 1] = 1;
        dp[rows - 1][cols] = 1;

        for (int i = rows - 1; i >= 0; --i) {
            for (int j = cols - 1; j >= 0; --j) {
                int requiredHp = min(dp[i + 1][j], dp[i][j + 1]) - dungeon[i][j];
                dp[i][j] = requiredHp <= 0 ? 1 : requiredHp;
            }
        }

        return dp[0][0];
    }
};
```

---

## Summary
- The key is defining DP states as the minimum health to have on entering each cell, working backwards from the princess.
- This avoids the ambiguity in remaining health and guarantees a minimal initial health calculation.
- The approach runs in O(M*N) time with O(M*N) space.

This method exemplifies how redefining DP state objectives and working backward simplifies complex path-dependent health constraints in grid-based problems.
