---
title: LintCode 134-LRU缓存策略
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LintCode
---
# 分析
* 链表实现即可
* set和get操作命中时都认为是使用过，必须移到队尾

```
class LRUCache{
public:
    struct ListNode {
        ListNode *next;
        int key, value;
        
        ListNode(int k, int v) {
            key = k;
            value = v;
            next = NULL;
        }
    };
    // @param capacity, an integer
    int count, cap;
    ListNode *head, *tail;
    LRUCache(int capacity) {
        // write your code here
        count = 0;
        cap = capacity;
        head = tail = NULL;
    }
    
    // @return an integer
    int get(int key) {
        // write your code here
        ListNode *p = head, *front = NULL;
        int ret = -1;
        while (p) {
            if (p->key == key) {
                ret = p->value;
                break;
            }
            front = p;
            p = p->next;
        }
        if (ret != -1 && p != tail) {
            if (front) {
                front->next = p->next;
            } else {
                head = p->next;
            }
            p->next = NULL;
            tail->next = p;
            tail = p;
        }
        return ret;
    }

    // @param key, an integer
    // @param value, an integer
    // @return nothing
    void set(int key, int value) {
        // write your code here
        ListNode *p = head, *front = NULL;
        bool found = false;
        while (p) {
            if (p->key == key) {
                found = true;
                p->value = value;
                break;
            }
            front = p;
            p = p->next;
        }
        if (!found) {
            ++count;
            ListNode *q = new ListNode(key, value);
            if (!tail) {
                head = tail = q;
            } else {
                tail->next = q;
                tail = q;
            }
            if (count > cap) {
                --count;
                ListNode *q = head;
                head = q->next;
                delete q;
            }
        } else {
            if (p != tail) {
                if (front) {
                    front->next = p->next;
                } else {
                    head = p->next;
                }
                p->next = NULL;
                tail->next = p;
                tail = p;
            }
        }
    }
};
```