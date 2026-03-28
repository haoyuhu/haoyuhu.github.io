## 问题概述
给定一个已排序的正整数数组 `nums` 和一个整数 `n`，目标是保证范围 `[1, n]` 内的每个整数都能表示为数组中某些元素的和。求最少需要补充多少个数（patch）才能实现这一点。

---

## 核心思想与不变量
- 维护一个变量 `miss`，表示在当前数组及补充的元素下，最小的无法组成的整数。初始 `miss = 1`。
- 如果当前数组元素 `nums[i]` 不超过 `miss`，说明它可以扩展可覆盖范围，使得范围变为 `[0, miss + nums[i])`。
- 如果 `nums[i]` 大于 `miss`，单纯加它无法填补 `miss` 这个缺口，最佳做法是补充 `miss`，使覆盖范围扩大到 `[0, 2 * miss)`。

该贪心策略能保证补丁数最少，复杂度为 O(m)，m 为数组长度。

---

## 算法流程

```mermaid
flowchart TD
    Start[开始，miss = 1，i = 0，patches = 0]
    CheckNum{i < len(nums) 且 nums[i] ≤ miss ?}
    UseNum[使用 nums[i]，扩展覆盖: miss = miss + nums[i], i++]
    Patch[补充 miss，补丁数 +1，miss = miss * 2]
    Continue[当 miss ≤ n 时继续]
    End[返回补丁数]

    Start --> Continue
    Continue --> CheckNum
    CheckNum -- 是 --> UseNum --> Continue
    CheckNum -- 否 --> Patch --> Continue
    Continue -- 否 --> End
```

---

## C++ 代码实现
```cpp
class Solution {
public:
    int minPatches(vector<int>& nums, int n) {
        long miss = 1; // 当前最小无法组成的数字
        int patches = 0, i = 0;
        while (miss <= n) {
            if (i < nums.size() && nums[i] <= miss) {
                miss += nums[i++];
            } else {
                // 补充 miss 自身
                miss <<= 1; // 等价于 miss *= 2
                ++patches;
            }
        }
        return patches;
    }
};
```

---

## 总结
| 情况                  | 动作               | 覆盖范围变为       |
|-----------------------|--------------------|--------------------|
| 下一个数字 ≤ miss     | 直接使用该数字     | [0, miss + nums[i]) |
| 下一个数字 > miss     | 补充 miss 自身     | [0, 2 * miss)       |

该算法简洁且高效，确保达到 `[1, n]` 范围内所有整数都能由数组及补丁构成。
