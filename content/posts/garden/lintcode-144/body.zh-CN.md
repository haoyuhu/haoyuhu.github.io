一旦确定了**起始符号**，重排就很直接。出现次数更多的那一类符号应该占据偶数下标（`0, 2, 4, ...`）；否则，不匹配会比必要情况更早出现。若两者数量相同，两种布局都合法。这个实现选择**负数优先**。

`balance = negatives - positives` 有两个作用：
- 它的绝对值能看出两类数量是否失衡，
- 它的正负号告诉你偶数位置应放哪一类符号。

**原地策略**
- 用 `even` 扫描 `0, 2, 4, ...`
- 用 `odd` 扫描 `1, 3, 5, ...`
- 跳过那些已经符合该奇偶位置预期符号的值
- 当两个指针都停在放错位置的元素上时进行交换

巧妙之处在于这两个符号判断：
- `balance * nums[even] < 0` 表示偶数位置已经正确
- `balance * nums[odd] > 0` 表示奇数位置已经正确

因此，每次交换都会同时修复一个错误的偶数位和一个错误的奇数位。不需要额外缓冲区，不需要稳定分区，也不需要回退扫描。

**为什么可行**
循环不变式很简单：`even` 和 `odd` 各自之前的位置，都已经按下标奇偶性检查完毕。每次交换都会把两个元素放回正确的交错位置，因此整体扫描保持线性。如果某一种符号更多，多出来的那些元素自然会落到尾部，这已经是能做到的最好排列。

<u>假设：</u>所有值都严格为正或严格为负。如果允许 `0`，在使用此方法之前必须先明确将其归类。

```cpp
class Solution {
public:
    void rerange(vector<int>& nums) {
        const int n = static_cast<int>(nums.size());
        int balance = 0; // 负数个数 - 正数个数

        for (int x : nums) {
            if (x > 0) {
                --balance;
            } else {
                ++balance;
            }
        }

        if (balance == 0) balance = 1; // 数量相同：选择让负数占据偶数下标

        for (int even = 0, odd = 1; even < n && odd < n; even += 2, odd += 2) {
            while (even < n && balance * nums[even] < 0) even += 2;
            while (odd < n && balance * nums[odd] > 0) odd += 2;

            if (even < n && odd < n) {
                std::swap(nums[even], nums[odd]);
            }
        }
    }
};
```
