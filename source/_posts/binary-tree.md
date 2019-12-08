---
title: 二叉树与森林的转换
date: 2017-12-08 14:29:40
toc: true
categories: 
- 数据结构
tags:
- 二叉树
- 森林
---
# 思路
* 利用递归建立节点完成转换。首先我们观察二叉树的结构，包含第一个孩子，及其兄弟。**关键在于：那么我们在构造递归时，每层recursion中都必须找到对应sibling和firstchild。**对于双亲表示法，我们很难找到孩子，对于孩子表示法，我们很难找到双亲（因为找到双亲是找到本节点兄弟的唯一方法，或在传参时也传入父节点指针）。
* 不同形式间转换的技巧。对于要被转换的结构，需要传入针对它单次recursion完成结构内部所有成员构造对应的转换的结构的信息。就能完成一层递归。同时应注意递归结束的条件。

# 孩子表示法生成二叉树算法

```cpp
typedef struct BiTree{
    ElemType data;
    struct BiTree *firstchild, *sibling;
}BTnode, *BTree;

typedef struct Lnode{
    int child;
    struct Lnode *next;
}Lnode, *CList;
typedef struct Cbox{
    ElemType data;
    CList firstchild;
}Cbox, *Cnode;
typedef struct CTnode{
    Cnode node;
    int n, r;
}CTree;

void TransformChildTreeToBinaryTree(CTree CT, BTree &BT, int preroot, int root){
    if (root == -1){
        BT = NULL; return;
    }
    BT = (BTree)malloc(sizeof(BTnode));
    BT->data = CT.node[root].data;
    int rsave;
    if (CT.node[root].firstchild){
        rsave = CT.node[root].firstchild->child;
    }
    else{
        rsave = -1;
    }
    TransformChildTreeToBinaryTree(CT, BT->firstchild, root, rsave);
    if (preroot == -1){
        BT->sibling = NULL; return;
    }
    CList p = CT.node[preroot].firstchild;
    while (p && p->data != root){
        p = p->next;
    }
    if (p->next){
        rsave = p->next->child;
    }
    else{
        rsave = -1;
    }
    TransformChildTreeToBinaryTree(CT, BT->sibling, preroot, rsave);
    return;
}
```

# 孩子双亲表示法生成二叉树(类似于孩子表示法)

```cpp
typedef struct BTnode{
    ElemType data;
    struct BTnode *firstchild, *sibling;
}BTnode, *BTree;

typedef struct Cnode{
    int child;
    struct Cnode *next;
}Cnode, *CList;
typedef struct CTnode{
    int parent;
    ElemType data;
    CList firstchild;
}CTnode, *CTbox;
typedef struct PCTnode{
    CTbox node;
    int r, n;
}PCTree;

void TransformPCTreeToBiTree(PCTree PC, BTree &BT, int root){
    if (root == -1){
        BT = NULL; return;
    }
    BT = (BTree)malloc(sizeof(BTnode));
    BT->data = PC.node[root].data;
    int rsave, tmp;
    if (PC.node[root].firstchild){
        rsave = PC.node[root].firstchide->child;
    }
    else{
        rsave = -1;
    }
    TransformPCTreeToBiTree(PC, BT->firstchild, rsave);
    tmp = PC.node[root].parent;
    if (tmp == -1){
        BT->sibling = NULL; return;
    }
    else{
        LList p = PC.node[tmp].firstchild;
        while (p && p->child != root){
            p = p->next;
        }
        if (p->next){
            rsave = p->next->child;
        }
        else{
            rsave = -1;
        }
        TransformPCTreeToBiTree(PC, BT->sibling, rsave);
        return;
    }
}
```

# 同构链式孩子表示法生成二叉树

```cpp
typedef struct BTnode{
    ElemType data;
    struct BTnode *firstchild, *sibling;
}BTnode, *BTree;

#define DEGREE 5
typedef struct LCTnode{
    ElemType data;
    struct LCTnode *child[DEGREE];
}LCTnode, *LCTree;


BTree InitialTransLCTree2BiTree(LCTree root){
    if (!root){
        return NULL;
    }
    BTree BTroot = (BTree)malloc(sizeof(BTnode));
    BTroot->data = LCTree->data;
    BTroot->sibling = NULL;
    TransformLinkedChildTreeToBinaryTree(BTroot->firstchild, root, 0);
    return BTroot;
}
void TransformLinkedChildTreeToBinaryTree(BTree &BT, LCTree LCT, int i){
    if (i >= DEGREE || !LCT->child[i]){
        BT = NULL; return;
    }
    BT = (BTree)malloc(sizeof(BTnode));
    BT->data = LCT->child[i]->data;
    TransformLinkedChildTreeToBinaryTree(BT, LCT->sibling, i + 1);
    TransformLinkedChildTreeToBinaryTree(BT->child[i], LCT->firstchild, 0);
    return;
}
```

# 异构链式孩子表示法生成二叉树

```cpp
typedef struct BTnode{
    ElemType data;
    struct BTnode *firstchild, *sibling;
}BTnode, *BTree;

#ifdef DEGREE
#undef DEGREE
#define DEGREE 5
#endif

typedef struct LCTnode{
    ElemType data;
    struct LCTnode * *child;
    int degree;
}LCTnode, *LCTree;

void TransformLCTree2BinaryTree(LCTree LCT, BTree &BT, int i){
    if (i >= LCT->degree || !LCT->child[i]){
        BT = NULL; return;
    }
    BT = (BTree)malloc(sizeof(BTnode));
    BT->data = LCT->child[i]->data;
    TransformLCTree2BinaryTree(LCT, BT->sibling, i + 1);
    TransformLCTree2BinaryTree(LCT->child[i], BT->firstchild, 0);
    return;
}

//Another Method:
void TransformLCTree2BinaryTree2(LCTree LCT, BTree &BT){
    if (!LCT->child[0]){
        BT = NULL; return;
    }
    BTree p, q;
    for (int i = 0; i < LCT->degree && LCT->child[i]; ++i){
        BTree q = (BTree)malloc(sizeof(BTnode));
        q->data = LCT->child[i]->data;
        q->sibling = NULL;
        q->firstchild = NULL;
        if (!BT){
            BT = q;
            p = q;
        }
        else{
            q->sibling = p->sibling; p->sibling = q;
            p = q;
        }
        TransformLCTree2BinaryTree2(LCT->child[i], q->firstchild);
        return;
    }
}
```
有两种方法的思路不同：前者是按单个节点完成递归，而后者则是按照层来递归(虽然二者都是深度优先)，后者更像是图的遍历方法。