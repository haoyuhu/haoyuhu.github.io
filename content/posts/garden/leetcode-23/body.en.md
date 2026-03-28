## Problem Overview

Given **k** sorted linked lists, the task is to merge them into one sorted linked list efficiently. Here, **k** is variable, representing the number of lists to merge.

---

## Custom Min-Heap Design

To efficiently merge these lists, a **custom min-heap** is designed with the following structure:

| Member        | Description                                    |
|---------------|------------------------------------------------|
| `vector<ListNode*> heap` | Stores current nodes forming the heap, organized by node values (min-heap property). |
| `vector<int> indexHeap` | Parallel to `heap`, records which original list each node belongs to.   |

### Heap Operations Explained

- **Constructor `Heap(vector<ListNode*>& lists)`**:
  - Inserts the head node of each non-empty list into the heap.
  - Advances pointers in `lists` for subsequent extractions.

- **`void push(ListNode* node, int listIndex)`**:
  - Inserts a new node and its originating list index.
  - Calls `adjustUp` to maintain min-heap property.

- **`int pop()`**:
  - Removes the root node (smallest element).
  - Replaces root with the last node, adjusts downwards with `adjustDown`.
  - Returns the original list index of the popped node for next extraction.

- **`ListNode* front()`**:
  - Returns the root node without removing it.

- **`bool empty()`**:
  - Checks if the heap is empty.

- **Heap Adjustment Methods**:
  - `adjustUp(int index)`: Bubble a node upwards while maintaining heap order.
  - `adjustDown(int index)`: Sink a node downwards while maintaining heap order.

---

## Time Complexity Analysis

Let the total number of nodes across all lists be \( N = \sum_{i=1}^k n_i \). Each of the \( N \) nodes is inserted once and extracted once from the heap.

- Each insertion and extraction requires \( O(\log k) \) due to heap adjustments.
- Total complexity:

\[
O(N \log k)
\]

This makes the heap approach efficient when merging multiple sorted lists.

---

## Important Caveats

- **Avoid inserting `NULL` nodes** into the heap once a list is exhausted.
- In `adjustDown`, ensure the loop terminates correctly by checking that the child index `s` differs from the current `index` to prevent infinite loops.

---

## Code Implementation (C++)

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
    Heap(std::vector<ListNode*>& lists) {
        for (int i = 0; i < lists.size(); ++i) {
            if (lists[i]) {
                push(lists[i], i);
                lists[i] = lists[i]->next;
            }
        }
    }

    bool empty() const {
        return heap.empty();
    }

    void push(ListNode* node, int index) {
        heap.push_back(node);
        indexHeap.push_back(index);
        adjustUp((int)heap.size() - 1);
    }

    int pop() {
        int idx = indexHeap.front();
        heap[0] = heap.back();
        indexHeap[0] = indexHeap.back();
        heap.pop_back();
        indexHeap.pop_back();
        adjustDown(0);
        return idx;
    }

    ListNode* front() const {
        return heap.front();
    }

private:
    std::vector<ListNode*> heap;
    std::vector<int> indexHeap;

    void adjustDown(int idx) {
        if (heap.empty()) return;
        ListNode* tempNode = heap[idx];
        int tempIndex = indexHeap[idx];
        int size = (int)heap.size();

        for (int child = idx * 2 + 1; child < size; child = child * 2 + 1) {
            if (child + 1 < size && heap[child + 1]->val < heap[child]->val) {
                ++child;
            }
            if (heap[child]->val < tempNode->val) {
                heap[idx] = heap[child];
                indexHeap[idx] = indexHeap[child];
                idx = child;
            } else {
                break;
            }
        }
        heap[idx] = tempNode;
        indexHeap[idx] = tempIndex;
    }

    void adjustUp(int idx) {
        ListNode* tempNode = heap[idx];
        int tempIndex = indexHeap[idx];
        while (idx > 0) {
            int parent = (idx - 1) / 2;
            if (heap[parent]->val > tempNode->val) {
                heap[idx] = heap[parent];
                indexHeap[idx] = indexHeap[parent];
                idx = parent;
            } else {
                break;
            }
        }
        heap[idx] = tempNode;
        indexHeap[idx] = tempIndex;
    }
};

class Solution {
public:
    ListNode* mergeKLists(std::vector<ListNode*>& lists) {
        Heap heap(lists);
        ListNode* dummy = new ListNode(0);
        ListNode* current = dummy;

        while (!heap.empty()) {
            current->next = heap.front();
            current = current->next;

            int idx = heap.pop();
            if (lists[idx]) {
                heap.push(lists[idx], idx);
                lists[idx] = lists[idx]->next;
            }
        }

        ListNode* result = dummy->next;
        delete dummy;
        return result;
    }
};
```

---

This implementation balances clarity and efficiency, supporting scalable merging of multiple sorted linked lists with a controlled memory footprint and optimal time complexity.
