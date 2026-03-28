## Problem Overview
Given an array `nums` of n positive integers and a positive integer `s`, find the minimal length of a **continuous** subarray such that the sum of its elements is greater than or equal to `s`. If no such subarray exists, return 0.

**Example:**
```
Input: nums = [2,3,1,2,4,3], s = 7
Output: 2
Explanation: The subarray [4,3] has the minimal length under the problem constraint.
```

---

## Key Ideas
- Use a **two-pointer sliding window** technique to maintain a window of elements.
- Expand the right pointer to increase the window until the sum ≥ s.
- Once the sum ≥ s, shrink the window from the left to find the minimal length.

---

## O(n) Sliding Window Algorithm

| Variables   | Description                      |
|-------------|--------------------------------|
| `bottom`   | Left bound index of the window  |
| `top`      | Right bound index of the window |
| `sum`      | Sum of elements in the current window |
| `len`      | Minimal length found satisfying sum ≥ s |

### Algorithm Flow

```mermaid
flowchart TD
    A[Initialize bottom=0, top=-1, sum=0, len=0]
    B{sum < s}
    C[Move top right: top++, sum += nums[top]]
    D{sum ≥ s}
    E[Update minimal length: len = min(len, top - bottom + 1)]
    F[Shrink from left: sum -= nums[bottom], bottom++]
    G{top == nums.size() or bottom > top}
    H[Return len]

    A --> B
    B -- Yes --> C
    B -- No --> D
    D -- Yes --> E
    E --> F
    F --> G
    G -- No --> B
    G -- Yes --> H
```

### Complexity Analysis
- Both pointers traverse the array at most once.
- **Time complexity: O(n)**.

---

## O(n log n) Divide and Conquer Approach

### Idea
- Recursively divide the array into two halves.
- For each half, find the minimal subarray length with sum ≥ s.
- Also find the minimal subarray that crosses the middle boundary.
- The minimal length over these three values is the solution for the current segment.

### Complexity
- Recurrence: T(n) = 2T(n/2) + O(n) (for merging)
- By the Master Theorem, time complexity is **O(n log n)**.

---

## Implementation

```cpp
// O(n) Sliding Window Solution
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

// O(n log n) Divide and Conquer Solution
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

        // Find minimal subarray crossing the midpoint
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

        if (sum < s) return 0; // No valid subarray crossing mid

        int cross_len = right - left - 1;
        int left_len = findMinLen(s, nums, bottom, mid);
        int right_len = findMinLen(s, nums, mid + 1, top);

        return minValue(left_len, right_len, cross_len);
    }

    int minValue(int x, int y, int z) {
        x = x == 0 ? MAX_INT : x;
        y = y == 0 ? MAX_INT : y;
        int res = x < y ? x : y;
        return res < z ? res : z;
    }
};
```

---

This problem offers a clear demonstration of sliding window efficiency along with an alternative divide-and-conquer perspective, enriching algorithmic adaptability.
