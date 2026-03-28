这道题唯一容易漏掉的细节是 **进位传递**。由于每个链表都按 **逆序** 存储数字，我们可以像小学竖式加法那样逐位相加：从低位到高位，每次处理一个节点。

旧写法是正确的，但它通过 **头插法** 构造答案，最后再把链表反转。这样当然能做出来，但这一步反转其实没必要。更现代的实现会使用一个哑节点和尾指针，代码更短，也更容易推导正确性。

**核心思路**
- 同时遍历两个链表。
- 缺失的节点按 `0` 处理。
- 计算 `sum = x + y + carry`。
- 将 `sum % 10` 追加到结果链表末尾。
- 更新 `carry = sum / 10`。
- 只要 `l1`、`l2` <u>或</u> `carry` 仍然存在，就继续循环。

```cpp
class Solution {
public:
    ListNode* addLists(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        int carry = 0;

        while (l1 || l2 || carry) {
            int x = l1 ? l1->val : 0;
            int y = l2 ? l2->val : 0;
            int sum = x + y + carry;

            carry = sum / 10;
            tail->next = new ListNode(sum % 10);
            tail = tail->next;

            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
        }

        return dummy.next;
    }
};
```

**复杂度**
- 时间：`O(max(m, n))`
- 空间：`O(max(m, n))`，用于输出链表

如果你只记住这道题的一件事，那就是：**循环必须把最后一次进位也处理掉**。
