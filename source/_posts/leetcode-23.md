---
title: LeetCode 23-Merge k Sorted Lists
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
Merge **k** sorted linked lists and return it as one sorted list. **Analyze and describe its complexity**.

## 分析
合并k个已排序的链表，并分析**时间复杂度**。k为可大可小的参数，表示需要合并的链表数目。
**自定义一个Heap类：**

* `vector<ListNode*> heap`成员变量作为最小堆。
* `vector<ListNode*> indexHeap`记录最小堆内各元素来自于`lists`中的那个链表。与最小堆`heap`内的元素一一对应。
* `Heap(vector<ListNode*>& lists);`构造`Heap`对象，抽取**`lists`**各链表头部的第一个元素。
* `void push(ListNode*, int);`向`heap`中插入一个元素，对应地向`indexHeap`中插入其链表编号。
* `int pop();`删除堆顶元素并调整堆，同时返回删除元素所在的链表编号，下一步可以在该链表中抽取下一个元素。
* `ListNode* front();`返回堆顶元素(不删除)。
* `bool empty();`返回堆是否为空。
* `adjustUp(int index);`将堆中编号为`index`的元素向上调整。
* `adjustDown(int index);`将堆中编号为`index`的元素向下调整。

**时间复杂度**：设第i个链表的长度为**`ni`**，则时间复杂度为**`O(sum(ni)*logk)`**。每从堆中取出一个节点，需要`O(logk)`调整堆，最坏情况总共需要`sum(ni)`次调整。

## 注意
* 当`lists`中某链表已经完全插入到合并链表中时，应避免向堆中插入`NULL`。
* `adjustDown`中循环体应注意`s != index`，否则会进入死循环，详见代码。

## AC代码

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */

class Heap {
public:
    Heap(vector<ListNode*>& lists) {
        for (int i = 0; i != lists.size(); ++i) {
            if (lists[i]) {
                push(lists[i], i);
                lists[i] = lists[i]->next;
            }
        }
        // for (int i = heap.size() - 1; i >= 0; --i) {
        //  adjustDown(i);
        // }
    }
    int size() {
        return heap.size();
    }
    bool empty() {
        return heap.empty() && indexHeap.empty();
    }
    void push(ListNode* pointer, int index) {
        heap.push_back(pointer);
        indexHeap.push_back(index);
        adjustUp(heap.size() - 1);
    }
    int pop() {
        int index = indexHeap.front();
        heap.front() = heap.back();
        indexHeap.front() = indexHeap.back();
        heap.pop_back();
        indexHeap.pop_back();
        adjustDown(0);
        return index;
    }
    ListNode* front() {
        return heap.front();
    }
private:
    vector<ListNode*> heap;
    vector<int> indexHeap;
    void adjustDown(int index) {
        if (heap.empty()) {
            return;
        }
        ListNode* save = heap[index];
        int saveIndex = indexHeap[index];
        for (int s = index * 2 + 1; s < heap.size(); s = s * 2 + 1) {
            if (s + 1 < heap.size() && heap[s]->val > heap[s+1]->val) {
                s += 1;
            }
            if (heap[s]->val < save->val) {
                heap[index] = heap[s];
                indexHeap[index] = indexHeap[s];
                index = s;
            } else {
                break;
            }
        }
        heap[index] = save;
        indexHeap[index] = saveIndex;
    }
    void adjustUp(int index) {
        ListNode* save = heap[index];
        int saveIndex = indexHeap[index];
        for (int s = (index - 1) / 2; s >= 0 && s != index; s = (s - 1) / 2) {
            if (heap[s]->val > save->val) {
                heap[index] = heap[s];
                indexHeap[index] = indexHeap[s];
                index = s;
            } else {
                break;
            }
        }
        heap[index] = save;
        indexHeap[index] = saveIndex;
    }
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        ListNode* root = NULL, *current;
        Heap heap(lists);
        while (!heap.empty()) {
            if (root) {
                current->next = heap.front();
                current = current->next;
            } else {
                root = current = heap.front();
            }
            int index = heap.pop();
            if (lists[index]) {
                heap.push(lists[index], index);
                lists[index] = lists[index]->next;
            }
        }
        return root;
    }
};

```