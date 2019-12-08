---
title: LintCode 167-链表求和
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
注意进位

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    /**
     * @param l1: the first list
     * @param l2: the second list
     * @return: the sum list of l1 and l2 
     */
    ListNode *addLists(ListNode *l1, ListNode *l2) {
        // write your code here
        int carry = 0;
        ListNode *head = NULL, *p;
        while (l1 && l2) {
            int sum = l1->val + l2->val + carry;
            int remain = sum % 10;
            carry = sum / 10;
            p = new ListNode(remain);
            p->next = head;
            head = p;
            l1 = l1->next;
            l2 = l2->next;
        }
        while (l1) {
            int sum = l1->val + carry;
            int remain = sum % 10;
            carry = sum / 10;
            p = new ListNode(remain);
            p->next = head;
            head = p;
            l1 = l1->next;
        }
        while (l2) {
            int sum = l2->val + carry;
            int remain = sum % 10;
            carry = sum / 10;
            p = new ListNode(remain);
            p->next = head;
            head = p;
            l2 = l2->next;
        }
        if (carry) {
            p = new ListNode(carry);
            p->next = head;
            head = p;
        }
        if (head) {
            p = head->next;
            head->next = NULL;
            while (p) {
                ListNode *q = p->next;
                p->next = head;
                head = p;
                p = q;
            }
        }
        
        return head;
    }
};
```