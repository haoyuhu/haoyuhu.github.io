---
title: LeetCode 45&55-Jump Game1/2
date: 2017-12-08 14:06:50
toc: true
categories: 
- 算法
tags:
- LeetCode
---
# Jump Game1
* 代码中far表示目前所能到达的最远处的下标;
* 我们从0出发, 向后扫描, 同时记录当前能到达的最远处far, 如果发现当前下标i比能到达的最远处far还远, 说明无法到达末位
* 空间复杂度为O(1)

```cpp
class Solution {
public:
    bool canJump(int A[], int n) {
        int far = 0;
        for (int i = 0; i < n - 1 && far < n - 1; ++i){
            if (i > far){
                return false;
            }
            if (A[i] + i >= far){
                far = A[i] + i;
            }
        }
        if (far >= n - 1){
            return true;
        }
        else return false;
    }
};
```
使用队列BFS求解, 感觉更好理解, 图的可达性问题。
* 时间复杂度O(n), 空间复杂度O(n)
* 思路就是将所有可达点入队, 同时标记为visited, 直到队列为空
* 此处循环从A[cur]开始, 这样可以稍微优化一些, 如判断已经可达, 就直接return true, 同时能够在visited[cur+i]为true时跳出循环

```cpp
class Solution {
public:
    bool canJump(int A[], int n) {
        if (n == 1)
            return true;
        queue<int> available;
        vector<int> visited(n, false);
        available.push(0); visited[0] = true;
        while (!available.empty()) {
            int cur = available.front(); available.pop();
            for (int i = A[cur]; i != 0; --i) {
                if (cur + i >= n - 1)
                    return true;
                if (visited[cur+i])
                    break;
                available.push(cur + i); visited[cur+i] = true;
            }
        }
        return false;
    }
};
```

# JumpGame2
* 使用辅助数组distance记录当前的最小步数, 初始化为0
* ct代表所能到达的最远下标, 同上面的far
* 空间复杂度为O(n)

```cpp
class Solution {
public:
    int jump(int A[], int n) {
        int distance[n], ct = 1;//ct start 1, important!
        for (int i = 0; i < n; ++i){
            distance[i] = 0;
        }
        for (int i = 0; i < n && !distance[n-1]; ++i){
            if (i && !distance[i]){
                return -1;
            }
            while (ct <= i + A[i] && ct < n){
                distance[ct++] = distance[i] + 1;
            }
        }
        return distance[n-1];
    }
};
```
此处除了使用available记录当前能够到达的点之外, 还需要用count来记录到达各个点时所需的跳跃步数。

```cpp
class Solution {
public:
    int jump(int A[], int n) {
        if (n == 1)
            return 0;
        queue<int> available, count;
        vector<int> visited(n, false);
        available.push(0); visited[0] = true;
        count.push(0);
        while (!available.empty()) {
            int cur = available.front(); available.pop();
            int cnt = count.front(); count.pop();
            for (int i = A[cur]; i != 0; --i) {
                if (cur + i >= n - 1)
                    return cnt + 1;
                if (visited[cur+i])
                    break;
                available.push(cur + i); count.push(cnt + 1);
                visited[cur+i] = true;
            }
        }
        return -1;
    }
};
```