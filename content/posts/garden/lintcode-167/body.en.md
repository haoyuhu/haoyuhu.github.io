The only easy-to-miss detail in this problem is **carry propagation**. Since each list stores digits in **reverse order**, we can add them exactly like grade-school addition: from low digit to high digit, one node at a time.

The legacy solution is correct, but it builds the answer by **head insertion** and then reverses the list at the end. That works, yet the reversal is unnecessary. A more modern implementation uses a dummy head and a tail pointer, which makes the code shorter and easier to reason about.

**Core idea**
- Traverse both lists together.
- Treat a missing node as `0`.
- Compute `sum = x + y + carry`.
- Append `sum % 10` to the result list.
- Update `carry = sum / 10`.
- Continue while `l1`, `l2`, <u>or</u> `carry` still exists.

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

**Complexity**
- Time: `O(max(m, n))`
- Space: `O(max(m, n))` for the output list

If you remember one thing from this problem, remember this: **the loop must continue for the final carry**.
