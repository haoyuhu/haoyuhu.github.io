**思路**

这个版本用一个普通的单向链表来模拟 LRU：

- **head** = 最久未使用
- **tail** = 最近刚使用
- `get` 和成功的 `set` 都算一次访问，因此被访问到的节点都必须移动到 `tail`

对于新键，直接追加到 `tail`。如果缓存超过容量，就淘汰 `head`。由于这是单向链表，每次查找时还必须额外记住前一个节点，这样才能把命中的节点从中间摘下，再重新挂到末尾。

这样做让实现非常直接，但代价也很明确：没有哈希表时，定位一个键必须完整扫描链表。因此 `get` 和 `set` 的时间复杂度都是 **O(n)**，空间复杂度是 **O(capacity)**。

**关键修正**

原始实现的整体思路是对的，但有两个细节需要收紧：

1. 不要用 `ret != -1` 来判断是否找到了节点。`-1` 是 API 约定的未命中返回值，但它也可能是一个合法的已存储值。应该改用节点指针，或显式的 `found` 标记。
2. 在淘汰掉最后一个节点之后——尤其是 `capacity == 0` 时——要同时重置 `head` 和 `tail`，否则 `tail` 会变成悬空指针。

一个小的辅助函数可以去掉重复的指针操作：

```cpp
void moveToTail(Node* prev, Node* cur) {
    if (cur == tail) return;
    if (prev) prev->next = cur->next;
    else head = cur->next;
    cur->next = nullptr;
    if (tail) tail->next = cur;
    else head = cur;
    tail = cur;
}
```

<u>结论</u>：这是一个用单链表搭出来的、很干净的面试级 LRU。若要获得生产环境级别的 **O(1)** 操作，请使用 **`unordered_map` + 双向链表**。
