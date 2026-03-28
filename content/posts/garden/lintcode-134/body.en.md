**Idea**

This version models LRU with a plain singly linked list:

- **head** = least recently used
- **tail** = most recently used
- both `get` and successful `set` count as access, so the touched node must be moved to the tail

For a new key, append it to `tail`. If the cache exceeds capacity, evict `head`. Because the list is singly linked, every search must also remember the previous node so the matched node can be removed from the middle and reattached at the end.

This keeps the implementation simple, but it also defines the cost: without a hash table, locating a key requires a full scan. So both `get` and `set` are **O(n)**, while space is **O(capacity)**.

**Important fixes**

The original implementation is correct in spirit, but two details should be tightened:

1. Do not use `ret != -1` to decide whether a node was found. `-1` is the API’s miss value, but it could also be a valid stored value. Use the node pointer or an explicit `found` flag.
2. After evicting the last node—especially when `capacity == 0`—reset both `head` and `tail`, otherwise `tail` becomes a dangling pointer.

A small helper removes repeated pointer manipulation:

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

<u>Takeaway</u>: this is a clean interview-level LRU built from one list. For production-grade **O(1)** operations, use **`unordered_map` + doubly linked list**.
