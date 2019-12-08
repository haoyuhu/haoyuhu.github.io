---
title: AC自动机及多模式匹配
date: 2017-12-08 14:29:40
toc: true
categories: 
- 数据结构
tags:
- AC自动机
---
* 在接触AC自动机之前，只仅仅掌握单模式匹配的算法：比如KMP、BMH等算法；经过优化后，KMP和BMH都具有线性时间复杂度，而实际情况下，一般的匹配问题BMH具有亚线性的表现。而昨天接触的AC自动机则是一种结合了字典树和KMP的一种算法，使得在多模式匹配下，时间复杂度达到$O(Σmi + n)$，其中n为原串长度，mi为第i个模式串的长度；
* 匹配过程中类似于KMP，原串不走回头路，利用之前已经匹配过的结果来构造特殊的字典树从而形成AC自动机；
* 创建自动机的过程中，最为重要的是fail指针的构造；我是从这篇文章中学会的，[AC自动机算法详解](http://www.cppblog.com/mythit/archive/2009/04/21/80633.html)；fail指针的作用类似于KMP中的next数组；
* 我的这个模板中并没有考虑对自动机的优化, 比如`ptr->fail->next[i]`与`ptr->next[i]`若同时不存在, 则`ptr->fail`其实是可以直接指向`ptr->fail->fail`的原因很简单, 因为`ptr->next[i]`发生失配时, `ptr = ptr->fail`, 此时肯定仍然失配, 需要继续`ptr->fail`，当然优化的代价是增加对存储空间的占用, fail需要变为`vector<trieTreeNode*> fail`，每个字母都应对应一个fail指针。

```cpp
////////////////////////////////////////////////////////////////////////////////
/*
1 const vector<string> &patterns: several pattern strings;
2 const string &s: original strings;
3 vector<string> &answer: the patterns which are matched in the original strings;
4 return the number of patterns which are matched.
*/
////////////////////////////////////////////////////////////////////////////////
#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <unordered_set>
#define ALPH_NUM 26
using namespace std;

struct trieTreeNode {
    vector<trieTreeNode*> next;
    bool mark;
    trieTreeNode *fail;
    trieTreeNode(): next(26, nullptr), mark(false), fail(nullptr) {}
};

trieTreeNode *createAcAutomation(const vector<string> &patterns);
int findPatterns(vector<string> &answer, trieTreeNode *root, const string &s);
void makeFoundPatterns(vector<string> &answer, unordered_set<trieTreeNode*> &save, trieTreeNode *root, string pattern);
inline char turn_char(int index);
int multiPatternsMatchingByAcAutomation(const vector<string> &patterns, const string &s, vector<string> &answer);

trieTreeNode *createAcAutomation(const vector<string> &patterns) {
    trieTreeNode *root = new trieTreeNode(), *ptr, *cur;
    for (int i = 0; i != patterns.size(); ++i) {
        cur = root;
        for (int k = 0; k != patterns[i].size(); ++k) {
            int index = patterns[i][k] - 'a';
            if (!cur->next[index])
                cur->next[index] = new trieTreeNode();
            cur = cur->next[index];
        }
        cur->mark = true;
    }
    queue<trieTreeNode*> makeFail;
    makeFail.push(root);
    while (!makeFail.empty()) {
        cur = makeFail.front(); makeFail.pop();
        for (int i = 0; i != ALPH_NUM; ++i) {
            if (cur->next[i]) {
                for (ptr = cur->fail; ptr && !ptr->next[i]; ptr = ptr->fail);
                cur->next[i]->fail = ptr ? ptr->next[i] : root;
                makeFail.push(cur->next[i]);
            }
        }
    }
    return root;
}

int findPatterns(vector<string> &answer, trieTreeNode *root, const string &s) {
    int count = 0;
    string pattern;
    unordered_set<trieTreeNode*> save;
    trieTreeNode *cur = root;
    for (int i = 0; i != s.size(); ) {
        int index = s[i] - 'a';
        if (!cur) {
            cur = root; ++i;
        }
        else if (cur->next[index]) {
            cur = cur->next[index];
            if (cur->mark) {
                ++count;
                save.insert(cur);
            }
            ++i;
        }
        else {
            cur = cur->fail;
            if (cur && cur->mark) {
                ++count;
                save.insert(cur);
            }
        }
    }
    makeFoundPatterns(answer, save, root, pattern);
    return count;
}

void makeFoundPatterns(vector<string> &answer, unordered_set<trieTreeNode*> &save,
    trieTreeNode *root, string pattern) {
    unordered_set<trieTreeNode*>::iterator it = save.find(root);
    if (it != save.end())
        answer.push_back(pattern);
    for (int i = 0; i != ALPH_NUM; ++i) {
        if (root->next[i]) {
            string t(pattern);
            t.push_back(turn_char(i));
            makeFoundPatterns(answer, save, root->next[i], t);
        }
    }
}

inline char turn_char(int index) {
    return 'a' + index;
}

int multiPatternsMatchingByAcAutomation(const vector<string> &patterns, const string &s, vector<string> &answer) {
    trieTreeNode *root = createAcAutomation(patterns);
    return findPatterns(answer, root, s);
}

```