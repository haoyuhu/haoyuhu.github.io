Reordering is straightforward once the **leading sign** is decided. The sign that appears more often should occupy the even indices (`0, 2, 4, ...`); otherwise mismatches show up earlier than necessary. When the counts are equal, either layout is valid. This implementation chooses **negative first**.

`balance = negatives - positives` plays two roles:
- its magnitude tells whether the counts differ,
- its sign tells which sign should appear at even positions.

**In-place strategy**
- Use `even` to scan `0, 2, 4, ...`
- Use `odd` to scan `1, 3, 5, ...`
- Skip values that already match the expected sign for that parity
- Swap when both pointers stop on misplaced elements

The neat trick is the sign test:
- `balance * nums[even] < 0` means the even position is already correct
- `balance * nums[odd] > 0` means the odd position is already correct

So every swap repairs one bad even slot and one bad odd slot at the same time. No extra buffer, no stable partition, and no backward movement.

**Why it works**
The loop invariant is simple: everything before `even` and `odd` has already been checked for its parity. Each exchange places two elements into the correct alternating groups, so the scan remains linear. If one sign is more frequent, the leftovers naturally drift to the tail, which is the best possible arrangement.

**Assumption:** values are strictly positive or strictly negative. If `0` is allowed, classify it explicitly before using this method.

```cpp
class Solution {
public:
    void rerange(vector<int>& nums) {
        const int n = static_cast<int>(nums.size());
        int balance = 0; // negatives - positives

        for (int x : nums) {
            if (x > 0) {
                --balance;
            } else {
                ++balance;
            }
        }

        if (balance == 0) balance = 1; // tie: choose negative at even indices

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
