## 题意
给定一个整型数组 `nums`，判断是否存在两个不同的索引 `i` 和 `j` 满足：

- `|nums[i] - nums[j]| <= t`
- `|i - j| <= k`

需要在较大规模数组中高效判断是否存在满足条件的元素对。

---

## 关键思路
暴力枚举每个元素向前或向后最多 k 个元素，判断值差是否小于等于 t，时间复杂度为 O(nk)，难以通过较大测试。

更优算法先对数组元素及其原始下标一起排序，然后维护一个特殊队列，保证队列中首尾元素值差不大于 t，快速筛选满足条件的元素对。

**步骤如下：**

步骤1：对元素及其原始下标排序

| 原下标 | 0 | 1 | 2 | 3 |
|---------|---|---|---|---|
| 原始值  | 5 | 3 | 1 | 2 |

排序后：

| 排序后索引 | 2 | 3 | 1 | 0 |
|------------|---|---|---|---|
| 排序后值   | 1 | 2 | 3 | 5 |

注意这里的索引是元素的原始位置。

步骤2：使用队列维护窗口

1. 队列为空时直接入队。
2. 如果队列首值和当前元素值差值超过 t，则队首出队。
3. 如果队首与当前元素值差不超过 t，则判断原始索引差是否小于等于 k：
   - 如果满足条件，立即返回 true。
   - 否则将当前元素入队。

该队列保证队列中元素值相差至多 t，方便快速判断满足条件的元素。

---

## 复杂度分析
- 排序时间复杂度：O(n log n)
- 队列元素每个最多入队出队一次，队列操作为 O(n)

总体复杂度：**O(n log n)**。

---

## 示例代码
### 暴力法（超时）
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
*此代码超时，复杂度为 O(nk)。*

### 排序+队列实现
```cpp
class Solution {
public:
    bool containsNearbyAlmostDuplicate(vector<int>& nums, int k, int t) {
        if (nums.empty()) return false;
        int n = nums.size();
        vector<pair<int,int>> arr(n);
        for (int i = 0; i < n; ++i) {
            arr[i] = {nums[i], i};
        }
        sort(arr.begin(), arr.end(), [](const auto& a, const auto& b) {
            return a.first < b.first;
        });

        queue<pair<int,int>> q;
        for (int i = 0; i < n;) {
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

        vector<int> indices;
        while (!q.empty()) {
            indices.push_back(q.front().second);
            q.pop();
        }
        sort(indices.begin(), indices.end());
        for (int i = 1; i < indices.size(); ++i) {
            if (indices[i] - indices[i-1] <= k) return true;
        }
        return false;
    }
};
```

---

## 总结
| 方法            | 时间复杂度   | 适用情况        | 备注                 |
|-----------------|-------------|-----------------|----------------------|
| 暴力枚举        | O(nk)       | 小规模数据      | 大数据超时           |
| 排序 + 队列维护 | O(n log n)  | 大规模数据      | 同时保证值差和索引差条件 |

此题凸显了通过排序结合数据结构维护滑动窗口，降低暴力搜索复杂度的典型思路。
