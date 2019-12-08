---
title: LeetCode174-Dungeon Game
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
The demons had captured the princess (**P**) and imprisoned her in the bottom-right corner of a dungeon. The dungeon consists of **`M x N`** rooms laid out in a 2D grid. Our valiant knight (**K**) was initially positioned in the top-left room and must fight his way through the dungeon to rescue the princess.

The knight has an initial health point represented by a positive integer. If at any point his health point drops to 0 or below, he dies immediately.

Some of the rooms are guarded by demons, so the knight loses health (**negative** integers) upon entering these rooms; other rooms are either empty (0's) or contain magic orbs that increase the knight's health (**positive** integers).

In order to reach the princess as quickly as possible, the knight decides to move only rightward or downward in each step.


**Write a function to determine the knight's minimum initial health so that he is able to rescue the princess.**

For example, given the dungeon below, the initial health of the knight must be at least 7 if he follows the optimal path **`RIGHT-> RIGHT -> DOWN -> DOWN`**.

|-2(K)| -3  | 3 |
|:-----|:-----|:---|
|-5 |-10    | 1 |
|10 |30 |-5(P) |

**Notes:**

* The knight's health has no upper bound.
* Any room can contain threats or power-ups, even the first room the knight enters and the bottom-right room where the princess is imprisoned.

## 分析
骑士只能向下或向右移动，每个方格如果是正数表示加血，如果是负数表示扣血。血量等于或低于0时骑士死亡。求骑士从左上角出发并顺利到达右下角条件下的最小初始血量。

初步分析本题采用**动态规划**。分别从**正向**和**反向**考虑。

### 正向
按正向考虑，`dp[i][j]`表示从起点出发到`(i, j)`点所需的**最小初始血量**。但发现计算`dp[i][j]`时不能单纯地取`dp[i-1][j]`和`dp[i][j-1]`的较小值。原因在于，当前到达`(i, j)`位置时的**剩余血量**会对后面的结果产生影响。

简单地说，比如`A＝dp[i-1][j]`，`B＝dp[i][j-1]`，**remainA**和**remainB**分别对应A和B的剩余血量。当`A>B`同时`remainA>remainB`时，如果我们选择B，在后续路径中如果有较大的负值出现，那么B较小的优势并不能传递，此时剩余血量反而更重要。

但引入剩余血量对路径的选择又会使算法变的复杂。所以从反向考虑。

### 反向
按反向考虑，`dp[i][j]`表示从`(i, j)`点出发到达右下角点所需的**踏入`(i, j)`点前的最小剩余血量**。那么，状态转移方程如下：

```
dp[i][j]=max{ min{ dp[i+1][j], dp[i][j+1] } - dungeon[i][j], 0 }
```

在边界上的情况需要做简单的处理。

由于反向时考虑了从当前点到终点的路径，因此`dp[0][0]`就是踏入`(0,0)`点前的最小剩余血量，即最小初始血量。这里可以发现，正向考虑时纠结的剩余血量，在这里就是求的`dp[i][j]`。反向求解过程非常自然，最重要的就是**正确选择了dp的目标**。

## AC代码

```cpp
class Solution {
public:
    int calculateMinimumHP(vector<vector<int>>& dungeon) {
        int row = dungeon.size();
        int col = dungeon[0].size();
        for (int i = row - 1; i >= 0; --i) {
            for (int j = col - 1; j >= 0; --j) {
                solveCurrentMinValue(dungeon, row, col, i, j);
            }
        }
        return dungeon[0][0] + 1;
    }

    void solveCurrentMinValue(vector<vector<int>>& dungeon, int row, int col, int i, int j) {
        pair<int, int> rightPoint(make_pair(i, j + 1)), lowerPoint(make_pair(i + 1, j));
        int lower, right, min, MAX_INT;
        bool hasLower, hasRight;
        lower = right = 0;
        hasLower = hasRight = true;
        MAX_INT = 999999999;

        if (rightPoint.first < row && rightPoint.second < col) {
            right = dungeon[rightPoint.first][rightPoint.second];
        } else {
            hasRight = false;
        }
        if (lowerPoint.first < row && lowerPoint.second < col) {
            lower = dungeon[lowerPoint.first][lowerPoint.second];
        } else {
            hasLower = false;
        }

        if (!hasLower && !hasRight) {
            min = 0;
        } else {
            min = minValue(hasLower ? lower : MAX_INT, hasRight ? right : MAX_INT);
        }

        int current = min - dungeon[i][j];
        dungeon[i][j] = current >= 0 ? current : 0;
    }

    int minValue(int x, int y) {
        return x < y ? x : y;
    }
};

```