## Problem Overview
Given an array of integers `nums`, check whether there exist two indices `i` and `j` with the constraints:

- `|nums[i] - nums[j]| <= t`
- `|i - j| <= k`

The problem requires efficient detection of such pairs in potentially large arrays.

---

## Key Idea
A brute-force approach, checking every pair within distance k, runs in O(nk), which is too slow for large inputs.

A more optimal method leverages sorting while retaining original indices, then uses a specialized queue structure to maintain the window of candidates satisfying the value difference constraint.

**Step 1: Sort `nums` with their original indices:**

| Index Before | 0 | 1 | 2 | 3 |
|--------------|---|---|---|---|
| Value Before | 5 | 3 | 1 | 2 |

Sorted by value:

| Index After  | 2 | 3 | 1 | 0 |
|--------------|---|---|---|---|
| Value After  | 1 | 2 | 3 | 5 |

Note: The indices represent original positions.

**Step 2: Use a queue structure to maintain candidates where the difference in values between front and back is at most t. The queue operations are:

1. If empty, enqueue current element.
2. If the value difference between queue front and current element exceeds t, dequeue front.
3. If value difference within t, check original index difference:
   - If indices differ by at most k, return true.
   - Otherwise enqueue current element.

This queue guarantees that elements inside it differ in value by at most t, restricting comparisons to candidates that satisfy the value condition.

---

## Complexity Analysis
- Sorting: O(n log n)
- Queue operations: Each element enters and exits at most once, O(n)

Overall complexity: **O(n log n)**.

---

## Code Examples
### Naive approach (TLE)
```cpp
class Solution {
public:
    bool containsNearbyAlmostDuplicate(vector<int>& nums, int k, int t) {
        for (int i = 1; i < nums.size(); ++i) {
            for (int j = i - 1; j >= 0 && j > i - k; --j) {
                if (abs(nums[i] - nums[j]) <= t) return true;
            }
        }
        return false;
    }
};
```
*This approach times out due to O(nk) complexity.*

### Sorting and queue based approach
```cpp
class Solution {
public:
    bool containsNearbyAlmostDuplicate(vector<int>& nums, int k, int t) {
        if (nums.empty()) return false;
        int n = nums.size();
        // Pair: (value, original index)
        vector<pair<int,int>> arr(n);
        for (int i = 0; i < n; ++i) {
            arr[i] = {nums[i], i};
        }
        // Sort by value
        sort(arr.begin(), arr.end(), [](const auto& a, const auto& b) {
            return a.first < b.first;
        });

        queue<pair<int,int>> q; // stores pairs of (value, index)
        for (int i = 0; i < n; ) {
            if (q.empty()) {
                q.push(arr[i++]);
                continue;
            }
            auto front = q.front();
            if (arr[i].first > front.first + t) {
                q.pop();
            } else {
                if (abs(arr[i].second - front.second) <= k) {
                    return true;
                } else {
                    q.push(arr[i++]);
                }
            }
        }

        // Final check for indices at queue ends
        vector<int> indices;
        while (!q.empty()) {
            indices.push_back(q.front().second);
            q.pop();
        }
        sort(indices.begin(), indices.end());
        for (int i = 1; i < indices.size(); ++i) {
            if (indices[i] - indices[i - 1] <= k) return true;
        }
        return false;
    }
};
```

---

## Summary
| Approach         | Complexity    | Practical Use      | Notes                    |
|------------------|---------------|--------------------|--------------------------|
| Brute-force      | O(nk)         | Simple, small n    | Timeout for large inputs |
| Sorting + Queue  | O(n log n)    | Efficient scaling  | Balances value and index constraints elegantly |

This problem illustrates classic trade-offs between brute force and more subtle sorting+data structure techniques, with queue management crucial for optimized search windows.

---
