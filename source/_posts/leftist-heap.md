---
title: 左偏树和斜堆
date: 2017-12-08 14:29:40
toc: true
categories: 
- 数据结构
tags:
- 斜堆
- 左偏树
---
# 左偏树的性质
* 本节点的键值key小于其左右子节点键值key(与二叉堆相同);
* 本节点的左子节点的距离大于等于本节点的右子节点(这意味着每个节点中除了要存储键值外, 还需要一个额外的dist存储距离);
* 节点的距离是其右子节点的距离+1(这意味着, 一个节点的dist是从它出发到达最近终端节点的距离);

# 斜堆的性质
* 本节点的键值key小于其左右子节点键值key;
* 斜堆节点不存储距离dist值, 取而代之的是在每次合并操作时都做swap处理(节省了存储空间);

<!--more-->

# 核心操作
* 合并操作
* 插入操作
* 取最小操作

# 实现
## 左偏树(堆)merge函数具体实现
* 采用递归实现;
* 每层递归中, 当`roota->val > rootb->val`时, 交换`roota`和`rootb`;
* 向下递归;
* 如左子节点距离小于右子节点距离, 交换左右子节点;
* 更新本节点距离值;
* 返回本节点指针;

## 斜堆merge函数具体实现
--采用递归实现(也有非递归算法);
--每层递归中, 当roota->val > rootb->val时, 交换roota和rootb;
--向下递归;
--交换左右子节点;
--返回本节点指针;

# 代码
## 左偏树

```cpp
typedef int elemType;
struct leftistTreeNode {
    elemType data;
    unsigned int dist;
    leftistTreeNode *lchild, *rchild;
    leftistTreeNode(const elemType &val): data(val), dist(0), lchild(NULL), rchild(NULL) {}
};
template <typename type>
void swapPtr(type &x, type &y) {
    type t = x;
    x = y; y = t;
}

leftistTreeNode *createLeftistTree(const vector<elemType> &vec);
void destroyLeftistTree(leftistTreeNode *&root);
leftistTreeNode *mergeLeftistTree(leftistTreeNode *&roota, leftistTreeNode *&rootb);
void insertLeftistTreeNode(leftistTreeNode *&root, const elemType &dt);
leftistTreeNode *extractMinNode(leftistTreeNode *&root);

leftistTreeNode *createLeftistTree(const vector<elemType> &vec) {
    leftistTreeNode *root = NULL;
    for (int i = 0; i != vec.size(); ++i)
        insertLeftistTreeNode(root, vec[i]);
    return root;
}
void destroyLeftistTree(leftistTreeNode *&root) {
    leftistTreeNode *left = root->lchild, *right = root->rchild;
    delete(root); root = NULL;
    if (left) destroyLeftistTree(left);
    if (right) destroyLeftistTree(right);
}
leftistTreeNode *mergeLeftistTree(leftistTreeNode *&roota, leftistTreeNode *&rootb) {//核心部分
    if (!roota || !rootb)
        return roota ? roota : rootb;
    if (roota->data > rootb->data)
        swapPtr<leftistTreeNode*>(roota, rootb);//注意: 此处交换的是指针值
    roota->rchild = mergeLeftistTree(roota->rchild, rootb);
    if (!roota->lchild || roota->lchild->dist < roota->rchild->dist)
        swapPtr<leftistTreeNode*>(roota->lchild, roota->rchild);
    if (!roota->rchild)
        roota->dist = 0;
    else
        roota->dist = roota->rchild->dist + 1;
    return roota;
}
void insertLeftistTreeNode(leftistTreeNode *&root, const elemType &dt) {
    leftistTreeNode *cur = new leftistTreeNode(dt);
    root = mergeLeftistTree(root, cur);
}
leftistTreeNode *extractMinNode(leftistTreeNode *&root) {
    leftistTreeNode *min = root;
    root = mergeLeftistTree(root->lchild, root->rchild);
    return min;
}
```

## 斜堆

```cpp
typedef int elemType;
struct skewHeapNode {
    elemType data;
    skewHeapNode *lchild, *rchild;
    skewHeapNode(const elemType &val): data(val), lchild(NULL), rchild(NULL) {}
};

template <typename type>
void swapPtr(type &x, type &y) {
    type t = x;
    x = y; y = t;
}

skewHeapNode *createskewHeap(const vector<elemType> &vec);
void destroyskewHeap(skewHeapNode *&root);
skewHeapNode *mergeskewHeap(skewHeapNode *&roota, skewHeapNode *&rootb);
void insertskewHeapNode(skewHeapNode *&root, const elemType &dt);
skewHeapNode *extractMinNode(skewHeapNode *&root);

skewHeapNode *createskewHeap(const vector<elemType> &vec) {
    skewHeapNode *root = NULL;
    for (int i = 0; i != vec.size(); ++i)
        insertskewHeapNode(root, vec[i]);
    return root;
}
void destroyskewHeap(skewHeapNode *&root) {
    skewHeapNode *left = root->lchild, *right = root->rchild;
    delete(root); root = NULL;
    if (left) destroyskewHeap(left);
    if (right) destroyskewHeap(right);
}
skewHeapNode *mergeskewHeap(skewHeapNode *&roota, skewHeapNode *&rootb) {//此处与左偏堆不同, 不判断左右子节点距离
    if (!roota || !rootb)
        return roota ? roota : rootb;
    if (roota->data > rootb->data)
        swapPtr<skewHeapNode*>(roota, rootb);
    roota->rchild = mergeskewHeap(roota->rchild, rootb);
    swapPtr(roota->lchild, rootb->rchild);
    return roota;
}
void insertskewHeapNode(skewHeapNode *&root, const elemType &dt) {
    skewHeapNode *cur = new skewHeapNode(dt);
    root = mergeskewHeap(root, cur);
}
skewHeapNode *extractMinNode(skewHeapNode *&root) {
    skewHeapNode *min = root;
    root = mergeskewHeap(root->lchild, root->rchild);
    return min;
}
```