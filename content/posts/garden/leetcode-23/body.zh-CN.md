## 问题概述

合并 **k** 个已排序的链表，输出合并后的一个完整排序链表。这里的 **k** 是链表数目，可以动态变化。

---

## 自定义最小堆设计

为了高效合并，设计了一个基于数组的**自定义最小堆**，其核心成员如下：

| 成员          | 说明                                  |
|---------------|-------------------------------------|
| `vector<ListNode*> heap` | 存放当前堆中的节点，维护最小堆性质（按节点值排序）。|
| `vector<int> indexHeap`  | 与 `heap` 一一对应，记录节点所属的原始链表编号。|

### 堆的核心操作

- **构造函数 `Heap(vector<ListNode*>& lists)`**：
  - 将每个非空链表的头节点插入堆中，并将指针后移准备下一次插入。

- **`void push(ListNode* node, int listIndex)`**：
  - 插入节点及对应链表编号，堆内进行向上调整以维护最小堆。

- **`int pop()`**：
  - 弹出堆顶最小节点，用堆尾节点填充堆顶，进行向下调整，返回弹出节点所属链表编号以便利后续节点插入。

- **`ListNode* front()`**：
  - 获得当前堆顶节点但不删除。

- **`bool empty()`**：
  - 判断堆是否为空。

- **堆调整函数**：
  - `adjustUp(int index)`: 向上调节保持堆结构。
  - `adjustDown(int index)`: 向下调节维护堆性质。

---

## 时间复杂度分析

设所有链表节点总数为 \(N = \sum_{i=1}^k n_i\)。

- 每个节点恰好被插入和弹出堆一次。
- 每次插入和弹出调整堆，复杂度为 \(O(\log k)\)。

总体时间复杂度为：

\[
O(N \log k)
\]

适合 k 较大时高效合并多链表。

---

## 注意事项

- 合并过程中避免向堆中插入 `NULL` 指针。
- `adjustDown` 中循环要保证子节点索引和当前索引不相同，防止死循环。

---

## 代码实现（C++）

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

        ListNode* mergedHead = dummy->next;
        delete dummy;
        return mergedHead;
    }
};
```

---

此方案逻辑清晰，结构合理，适合学习堆的原理与链表合并的实践，具备较好的推广性与实用性。
