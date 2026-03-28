## 题目概述
给定一个由n个正整数组成的数组`nums`和一个正整数`s`，找到和大于等于`s`的**连续**子数组的最小长度。如果不存在，返回0。

**示例：**
```
输入: nums = [2,3,1,2,4,3], s = 7
输出: 2
解释: 子数组[4,3]是满足条件的最短子数组。
```

---

## 核心思路
- 使用**双指针滑动窗口**维护当前子数组。
- 右指针不断右移，扩大窗口，直到窗口内元素和≥ s。
- 然后左指针右移，尽可能缩小窗口，得到最小长度。

---

## O(n)滑动窗口算法详解

| 变量       | 描述                      |
|------------|---------------------------|
| `bottom`  | 子数组左边界索引           |
| `top`     | 子数组右边界索引           |
| `sum`     | 当前窗口元素和             |
| `len`     | 满足条件的最小子数组长度   |

### 算法流程图

```mermaid
flowchart TD
    A[初始化 bottom=0, top=-1, sum=0, len=0]
    B{sum < s}
    C[右移 top，sum += nums[top]]
    D{sum ≥ s}
    E[更新最小长度 len = min(len, top - bottom + 1)]
    F[左移 bottom，sum -= nums[bottom]]
    G{top == nums.size() 或 bottom > top}
    H[返回 len]

    A --> B
    B -- 是 --> C
    B -- 否 --> D
    D -- 是 --> E
    E --> F
    F --> G
    G -- 否 --> B
    G -- 是 --> H
```

### 复杂度分析
- bottom和top指针各自最多遍历数组一次。
- **时间复杂度：O(n)**。

---

## O(n log n)分治法思路

### 关键点
- 将区间划分为两个子区间，递归求解各自的最小长度。
- 同时求跨越中点的满足和≥ s的子数组最小长度。
- 返回三者中的最小值。

### 复杂度分析
- 递推式：T(n) = 2T(n/2) + O(n)
- 根据主定理，时间复杂度为**O(n log n)**。

---

## 代码实现

```cpp
// O(n) 滑动窗口解法
class Solution {
public:
    int minSubArrayLen(int s, vector<int>& nums) {
        if (nums.empty()) return 0;
        int bottom = 0, top = -1;
        int sum = 0, len = 0;
        while (true) {
            if (sum < s) {
                ++top;
                if (top != nums.size()) sum += nums[top];
                else break;
            } else {
                sum -= nums[bottom++];
                if (bottom > top) break;
            }
            if (sum >= s) {
                int new_len = top - bottom + 1;
                if (len == 0 || new_len < len) len = new_len;
            }
        }
        return len;
    }
};

// O(n log n) 分治法
class Solution {
    const int MAX_INT = 999999999;
public:
    int minSubArrayLen(int s, vector<int>& nums) {
        if (nums.empty()) return 0;
        return findMinLen(s, nums, 0, nums.size() - 1);
    }

private:
    int findMinLen(int s, vector<int>& nums, int bottom, int top) {
        if (bottom == top) return nums[bottom] >= s ? 1 : 0;

        int mid = (bottom + top) / 2;

        // 找跨中点的最短子数组
        int left = mid, right = mid + 1, sum = 0;
        while (sum < s && (right <= top || left >= bottom)) {
            if (right > top) {
                sum += nums[left--];
            } else if (left < bottom) {
                sum += nums[right++];
            } else if (nums[left] > nums[right]) {
                sum += nums[left--];
            } else {
                sum += nums[right++];
            }
        }

        if (sum < s) return 0; // 无跨区间满足条件的子数组

        int cross_len = right - left - 1;
        int left_len = findMinLen(s, nums, bottom, mid);
        int right_len = findMinLen(s, nums, mid + 1, top);

        return minValue(left_len, right_len, cross_len);
    }

    int minValue(int x, int y, int z) {
        x = (x == 0) ? MAX_INT : x;
        y = (y == 0) ? MAX_INT : y;
        int temp = x < y ? x : y;
        return temp < z ? temp : z;
    }
};
```

---

此题充分展示了滑动窗口的高效性和分治法的另一种思路，助力算法多样性提升。
