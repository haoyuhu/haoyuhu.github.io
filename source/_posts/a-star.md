---
title: A-star算法概述及其在游戏开发中的应用分析
date: 2016-12-07 16:17:31
toc: true
categories: 
- 来自新世界
tags:
- A-star
---
首先需要感谢[Amit's A star Page](http://dev.gameres.com/Program/Abstract/Arithmetic/AmitAStar.mht)和[A-star算法中译本](http://blog.csdn.net/b2b160/article/details/4057781)，让我能够全面地了解A-star算法，下面大部分内容也是由原文及中译文中提炼而得。

# 1. 从Dijkstra算法和最佳优先搜索到A-star算法
## 1.1 Dijkstra算法
### 核心思想：
每次都选取距离起始点最近的点，并加入完成列表。算法的效率并不高，但对于**没有负数权值边**的情况能够得到从起始点到大部分点的最短路径。Dijkstra算法相当于启发式函数h(x) = 0的A-star算法（在后面会详细说明）。
### 适用领域：
相对于A-star算法，Dijkstra算法也有它适用的领域。当移动单位需要找到从其当前位置出发到N个分散目的地中的一个的最短路径（比如盟军只需抢占N个据点中的任意一个就能取胜，此时盟军需要选择一个离自己最近的据点i即可），Dijkstra算法会比A-star算法更为合适。

原因在于，Dijkstra对所有中间节点一视同仁，并不考虑它们到目的地的实际代价，这就导致该算法会偏执地选择离起点最近的节点，而当当前扩展节点集中出现了任意一个目的地i，算法就可以终止，而得到的目的地i就是N个目的地中距起始点最近的目的地。相反地，A-star算法则需要找到从起始点出发到所有目的地的最短路径，通过比较得到所有最短路径中的最小值。而实际上我们并不需要知道除了最近的目的地之外的其他目的地的路径就是如何。

总而言之，A-star算法更适用于单点对单点的寻径；Dijkstra算法更适用于单点到多点的寻径。

<!--more-->

## 1.2 最佳优先搜索算法（Best-fit）
### 核心思想：
最佳优先搜索算法的思想恰恰与Dijkstra算法相反，它忽略了从起始点到当前节点所花费的实际代价，而偏执地选择当前节点集中**“它认为”**距目的地最近的节点并进行拓展。之所以称为“它认为”，那是因为当前节点并不知道它到目的地的距离，而是通过一个**评价函数**（或称启发式函数）来估计从当前位置到达目的地的距离。由此可知，评价函数的选择对结果和效率会有较大的影响。
### 适用领域：
不可否认，最佳优先搜索算法拓展的节点具有明显的方向性（没有障碍时方向会始终指向目的地），从而忽略了很多远离目的地的节点，只有当迫不得已时，才会去拓展那些节点。这样优秀的品质使得Best-fit算法的效率比Dijkstra算法要高很多。但速度快也是要付出相应代价的，很可惜Best-fit算法很多时候并不能找到最短路径。同时，最佳优先搜索算法一般也只适用于单点对单点的寻径。

## 1.3 A-star算法
### 核心思想：
A-star算法很巧妙地结合了Dijkstra算法和Best-fit算法的优点，一方面通过设定**代价函数g(x****)**来考虑从起始点到当前点的实际代价，另一方面通过设定**启发式函数h(x****)**来考虑从当前点到目的地的估计代价，f(x) = g(x) + h(x)。它是从当前点击中取出f值最小的节点并进行拓展。因此A-star算法具备了Best-fit算法的效率，同时又兼顾Dijkstra算法的最短寻径能力。
###适用范围：
适用于单点对单点的寻径。而且可以得到最短路径，效率较高。

# 2 A-star算法的核心思想
## 2.1 代价函数和启发式函数的权衡
* **代价函数g：**g代表从起始点到当前节点的实际代价，每次拓展时将当前节点的g值加上从当前节点走向拓展节点所花费的实际代价，就是拓展节点的实际代价（从起始点到拓展节点）。
* **启发式函数h：**h代表从当前节点到目的地的估计代价，可以采用**曼哈顿距离、对角线距离、欧几里得距离**来估计，但一般不建议使用欧几里得距离（因为欧几里得距离比另外两种距离要小，虽然仍可以得到最短路径，但计算的时间开销更大）。
* **g和h的权衡：**代价函数g和启发式函数h的相对关系会影响到效率。当g比h占据更多权重时，A-star算法更贴近于Dijkstra算法，算法效率降低。当g比h占据更少权重时，A-star算法更贴近于Best-fit算法，算法效率提高，但可能在寻找最优解的路上走得更加曲折。此外应注意，只有当启发式函数h估计的代价**小于等于**真实代价时，才一定能得到最短路径；否则，必须在代码中做一些修改才可以得到最短路径（后面详细说明）。

## 2.2 代价函数和启发式函数的修正
上一节已经说明g和h的相对关系会影响效率和结果。因此也发展出了一系列调整代价函数和启发式函数的方法。权衡和修正代价函数和启发式函数是一个很tricky的过程，当我们增加g的权重，那么我们会得到最短路径但计算速度变慢；如果我们增加h则可能放弃了最短路径，同时使得A-star算法更快。

但反观我们使用A-star算法的初衷，我们**只是希望得到一个较好的路径使得游戏玩家到达目的地**，而且游戏玩家通过主观也无法精确判定他所走的路径是否是最佳路径。因此我们可以在修正中略微增加启发式函数h的比重，从而使得A-star算法更快。

但应注意，g和h的衡量单位必须一致，其中任意一个值过分的大都有可能造成A-star退化为Best-fit或Dijkstra算法。

* **a) g'(n) = 1 + α * (g(n) - 1)：**
代价函数g可以是1到实际g(n)间的一个数，这个数取决于你对效率的要求。
当α=0时，g'(n)=1，相当于
但不能过分的小，否则会退化为Best-fit算法。
* **b) f(n) = g(n) + w(n) * h(n)：**
w(n)≥1且随着当前点接近目的地而减小。设置这个系数的目的：在游戏寻径过程中，响应速度较为重要。因此在寻径初期增加w(n)值能够使其寻径速度增加，而且此时的寻径准确度实际上并不重要。而当接近目的地时，减小w(n)使得寻径更为准确。
* **c) h(n) = h(n) * (1 + l/p)：**
其中，p为所能接受的最大路径长度，l为移动一步的最小代价。
* **d) 向量叉积修正法：**
  * ①我们首先构造两个向量：第一个向量是从**起始点->目的地**的向量vector1(dx1, dy1)，第二个向量是从**当前点->目的地**的向量vector2(dx2, dy2)。
  * ②现在我们对vector1和vector2求叉积：crossProduct = vector1 x vector2 = |dx1*dy2 - dx2*dy1|
  * ③h += crossProduct * 0.001
crossProduct实际上度量了路径偏离vector1的程度，也就是说这个调整使得算法更倾向于选择靠近起始点到目的地连线上的路径。
印象中，上次使用叉积是在凸包算法中使用叉积来获取2个向量间左偏或右偏的关系。
* **e) 导航点法：**
对于地图障碍较多的情况，启发式函数h会过分地低估从当前点到目的地的实际代价，因此算法的计算速度会受到一定的影响。此时如果在图中事先增加一些导航点（waypoints），而这些导航点间的实际代价已经事先计算好。那么我们的启发式函数可以改写成：
h(curr, dest) = h'(curr, wp1) + distance(wp1, wp2) + h'(wp2, dest)
上式中h'(A, B)是估计A到B的代价的评价函数，可以采用曼哈顿距离等。wp1和wp2分别是距当前点和目的地最近的导航点。由此我们使得从当前点到目的地的实际代价不会被过分低估，从而提高了计算的速度。

# 3 A-star算法的数据结构实现
下面是拷贝自[Amit's A star Page](http://dev.gameres.com/Program/Abstract/Arithmetic/AmitAStar.mht)原本的算法伪代码：
```
OPEN = priority queue containing START
 CLOSED = empty set while lowest rank in OPEN is not the GOAL:
   current = remove lowest rank item from OPEN
   add current to CLOSED
   for neighbors of current:
     cost = g(current) + movementcost(current, neighbor)
     if neighbor in OPEN and cost less than g(neighbor):
       remove neighbor from OPEN, because new path is better
     if neighbor in CLOSED and cost less than g(neighbor):
        remove neighbor from CLOSED
     if neighbor not in OPEN and neighbor not in CLOSED:
       set g(neighbor) to cost
       add neighbor to OPEN
       set priority queue rank to g(neighbor) + h(neighbor)
 reconstruct reverse path from goal to start
 by following parent pointers
```
## 核心思想：
* ①维护一个**关闭列表**和一个**开放列表**。关闭列表初始为空，开放列表初始包含起始点。
* ②取开放列表中f值最小的节点v。如v为目的地则退出循环，否则将节点v放入关闭列表（表示节点v**暂时**为最优）。
* ③对节点k的所有邻接节点w：
  * i) w既不在开放列表也不在关闭列表：计算w的g、h和f值，并将节点w放入开放列表；
  * ii) w在开放列表：计算w的g并与开放列表中的旧节点w的g值比较，如新g小于旧g，则更新开放列表中的旧g值和旧f值；
  * iii) w在关闭列表：计算w的g并与关闭列表中的旧节点w的g值比较，如新g小于旧g，则将w从关闭列表中取出并放入开放列表，并使用新的g、h和f值；
  * ④返回步骤②；

## 注意：
* 步骤③中iii)并不一定是必要的。**当启发式函数h(n)没有高估从当前节点到目的地的代价，iii的情况是不会发生的**。但在游戏中移动单位寻径时，为了加快计算速度，h函数高估代价是很有可能发生的。

## 3.1 数组或链表
普通的数组或链表由于没有次序，数组扫描、查找最小f值节点、删除都需要O(n)，插入和更新为O(1)；链表扫描、查找最小f值节点需要O(n)，插入、删除和更新为O(1)。除此之外，还有诸如已排序数组、已排序链表、排序跳表等。但都不是适用于A-star算法的数据结构，此处不再深究。

## 3.2 索引数组
索引数组是将所有网格按次序编号，各数组下标下存储对应的各类数值。索引数组的扫描和查找最小f值节点为O(n)，插入、更新、删除为O(1)。较好的插入和删除性能使得它能够完成一部分的操作。但索引数组只能用在那些网格较少的A-star算法中，对于网格数量太过庞大的情况，实际上被使用的网格只占所有网格中的一小部分。造成存储空间的浪费。

## 3.3 散列表
散列表是索引数组的改进版本。索引数组作为无冲突的哈希表会造成存储空间的浪费。散列表需要解决冲突，hash函数和冲突的处理方法会影响到散列表的性能。

## 3.4 堆
堆无疑是比较适用于A-star算法的一种数据结构。且在C++的STL中有二叉堆的实现（priority_queue）。堆查找最小f值节点为O(1)，删除或调整为O(logn)，插入为O(logn)，扫描为O(n)。

## 3.5 伸展树
伸展树Splay使用了**90-10原则**，一般认为庞大的数据中经常被使用的数据只占总数据的10%。伸展树查找最小f值节点为O(logn)，删除为O(logn)，插入为O(logn)，扫描+调整为O(logn)。各方面性能均衡。但纵观Splay树的实现过程可以发现，伸展树的核心操作Splay每次将需要操作的节点提升至根节点。这就意味着，每次查找和删除最小f值节点都需要将节点从伸展树的底部搬运到树根，这样的做法似乎很麻烦，并没有很好地契合每次取最小值点的这个要求。从这一点来看，它并没有比堆更优秀。

## 3.6 HOT队列
在看这篇文档前，我并未深入学习过**HOT队列（Heap on Top）**，最多只是知道名字和原理。在文档中提出，HOT队列是比堆更优秀，更适用于A-star算法的数据结构。它用桶来取代普通二叉堆中的节点，每个桶中有若干元素。但只有堆顶桶内的节点们按照堆建立关系，而其余的桶内都是无序的节点。这一点非常契合A-star算法的要求，因为拓展的一部分节点由于f值较大实际上根本不会被使用，那就可以让它呆在下面的桶中，不参与堆化。
考察A-star算法，实际上每次取出的总是f值最小的节点，而插入的节点的f'值只可能是f ≤ f' ≤ f + df。此处df是一步移动造成代价增加的最大值。这样我们就可以利用df来划分各个桶，堆顶的桶使用的频率最高。当堆顶桶空时，将下面的桶提升上来，并使其堆化，这个操作叫做**heapify**。假设共有k个桶，这就使得HOT队列的查找为O(1)。对堆顶桶，插入和删除为O(log(n/k))；对其他桶，插入为O(1)。heapify操作为O(n/k)。

## 3.7 数据结构的选择和实现
对网格数不多的情况，一方面使用**索引数组**确保O(1)检查是否需要调整或确定节点是否在开放/关闭列表中；另一方面使用**堆（或HOT队列）**来实现对数时间复杂度的插入和删除操作。

# 4 游戏开发中的应用
游戏中的寻径相比于理想化的寻径要复杂得多。需要考虑各方面因素，如区域搜索、群运动、响应和延迟、移动障碍物、位置或方向信息的存储等。针对不同的游戏特点，需要不同的算法策略。
## 4.1 区域搜索
只需规划从起始点到区域中心的路径。当从开放列表中取出任意一个区域内的节点时，就认为已经到达该区域。
## 4.2 群运动
游戏中有时会让多个游戏单位移动到同一处目的地，比如魔兽争霸这类即时战略游戏。如果为群中的每一个游戏单位使用A-star算法单独规划路径，那这会使时间开销成倍的增长，而且游戏单位的路径会有明显的重叠或平行的现象。
* a) 使用A-star算法规划从群体中心到目的地中心的路径，所有**移动单位共享大部分的路径**。比如移动单位自己规划前N步的移动路径，此后使用共享路径。接近目的地时，移动单位结束使用共享路径，转而使用自己规划的移动路径。在移动过程中可以增加一些扰动，让各个单位的移动方向看起来不是那么相同。
* b) 在群众设定一个领导个体，**只为领导个体规划路径**，而其余个体采用**flocking算法**以组的形式运动。
## 4.3 响应与延迟
一般游戏中我们关心的是**响应时间**。也就是说我们不希望看到，当按下导航按键后，游戏单位却迟迟没有开始移动。因此我们需要在响应时间（计算速度）和路径优化之间做一个权衡。那我们如何在确保路径最优化的同时保证较短的响应时间呢？有以下几个办法：
* a) 在路径搜索初期的几次循环中，可以快速地确定先前的N步移动。此时我们可以让游戏单位先动起来，即使他们走的并不是真正的最短路径。这样在初始的几步移动中就为A-star算法计算后续路径提供了较为充裕的计算时间。有时，我们甚至可以让游戏单位在一开始就向着起始点->目的地的直线运动，直到计算出路径。
* b) 地图地形复杂会使得A-star算法的计算时间变长。所以对于由地形（如道路、草地、山地，不同地形的移动代价不同）引起的计算时间延长。这样我们可以适当减小地形的影响，比如山地移动的代价为3、草地为2、道路为1，就可以变更为山地1.2、草地1.1、道路1，使A-star算法先快速计算出一条比较合理的路径让游戏单位先移动起来。此后再按照设定的代价进行精确计算。
* c) 在空旷的野外场地，适当增大网格的划分，可以有效缩短计算时间。当靠近目的地或复杂的城市地形时，减小网格划分，使路径更为合理。
* d) 设置导航点。在游戏地图上事先布置好导航点，在导航点之间的路径已经预先规划并保存。因此寻径时只需规划从起始点到最近的导航点wp1，从目的地到最近的导航点wp2之间的路径。整个路径就被划分为start->wp1->wp2->dest，而wp1到wp2是已有的。
## 4.4 其他算法
这里就不仔细介绍了。比如双向搜索、带宽搜索、Potential Field算法等。双向搜索能并行计算，加快寻径速度，当两头相连时寻径成功；带宽搜索能够在用户可忍受的路径代价范围内按照一定策略舍弃一些较差的节点，加快计算速度；Potential Field作为一个有趣的算法，是参考了势能场和电荷运动的规律。适合场地较为宽阔的游戏地图，而且该算法能保证不重叠。
## 4.5 移动障碍物
* a) 当游戏单位附近的世界改变时，或游戏单位到达一个导航点时，或每隔一定步数后，重新计算路径。
* b) 在发现规划路径上走不通后，比如A->B的路径被阻挡。重新规划从A->B的路径。B之后的部分仍保留原来的路径。
* c) 对于多个游戏单位存在的情况。当物体接近时，改变其中一部分物体在已规划好的路径上的移动代价，从而让一些移动单位避开其他单位。
## 4.6 位置和方向的存储
路径的存储有时候是必须的。那位置和方向我们应该选择存储哪一个？显然位置的存储会消耗更多的空间。但存储位置的优点在于我们可以快速查询路径上任意的位置和方向，不需要沿着路径移动。
### 路径压缩：
* a) 如果存储方向，我们可以用这种存储的方式。如(UP, 5), (LEFT, 3), (DOWN, 3), (RIGHT, 4)表示上移5，左移3，下移3，右移4。
* b) 如果存储位置，那么可以存储每一个转折点，转折点之间使用直线相连。

```
//////////////////////////////////////////////////////////////////////
// Amit's Path-finding (A*) code.
//
// Copyright (C) 1999 Amit J. Patel
//
// Permission to use, copy, modify, distribute and sell this software
// and its documentation for any purpose is hereby granted without fee,
// provided that the above copyright notice appear in all copies and
// that both that copyright notice and this permission notice appear
// in supporting documentation.  Amit J. Patel makes no
// representations about the suitability of this software for any
// purpose.  It is provided "as is" without express or implied warranty.
//
//
// This code is not self-contained.  It compiles in the context of
// my game (SimBlob) and will need modification to work in another
// program.  I am providing it as a base to work from, and not as
// a finished library.
//
// The main items of interest in my code are:
// 
// 1. I'm using a hexagonal grid instead of a square grid.  Since A*
//    on a square grid works better with the "Manhattan" distance than with
//    straight-line distance, I wrote a "Manhattan" distance on a hexagonal
//    grid.  I also added in a penalty for paths that are not straight
//    lines.  This makes lines turn out straight in the simplest case (no
//    obstacles) without using a straight-line distance function (which can
//    make the path finder much slower).
//
//    To see the distance function, search for UnitMovement and look at
//    its 'dist' function.
//
// 2. The cost function is adjustable at run-time, allowing for a
//    sort of "slider" that varies from "Fast Path Finder" to "Good Path
//    Quality".  (My notes on A* have some ways in which you can use this.)
//
// 3. I'm using a data structure called a "heap" instead of an array
//    or linked list for my OPEN set.  Using lists or arrays, an
//    insert/delete combination takes time O(N); with heaps, an
//    insert/delete combination takes time O(log N).  When N (the number of
//    elements in OPEN) is large, this can be a big win.  However, heaps
//    by themselves are not good for one particular operation in A*.
//    The code here avoids that operation most of the time by using
//    a "Marking" array.  For more information about how this helps
//    avoid a potentially expensive operation, see my Implementation
//    Nodes in my notes on A*.
//
//  Thanks to Rob Rodrigues dos santos Jr for pointing out some
//  editing bugs in the version of the code I put up on the web.
//////////////////////////////////////////////////////////////////////

#include "Path.h"

// The mark array marks directions on the map.  The direction points
// to the spot that is the previous spot along the path.  By starting
// at the end, we can trace our way back to the start, and have a path.
// It also stores 'f' values for each space on the map.  These are used
// to determine whether something is in OPEN or not.  It stores 'g'
// values to determine whether costs need to be propagated down.
struct Marking
{
    HexDirection direction:4;    // !DirNone means OPEN || CLOSED
    int f:14;                    // >= 0 means OPEN
    int g:14;                    // >= 0 means OPEN || CLOSED
    Marking(): direction(DirNone), f(-1), g(-1) {}
};
static MapArray<Marking>& mark = *(new MapArray<Marking>(Marking()));

// Path_div is used to modify the heuristic.  The lower the number,
// the higher the heuristic value.  This gives us worse paths, but
// it finds them faster.  This is a variable instead of a constant
// so that I can adjust this dynamically, depending on how much CPU
// time I have.  The more CPU time there is, the better paths I should
// search for.
int path_div = 6;

struct Node
{
    HexCoord h;        // location on the map, in hex coordinates
    int gval;        // g in A* represents how far we've already gone
    int hval;        // h in A* represents an estimate of how far is left

    Node(): h(0,0), gval(0), hval(0) {}
    ~Node() {}
};

bool operator < ( const Node& a, const Node& b )
{
    // To compare two nodes, we compare the `f' value, which is the
    // sum of the g and h values.
    return (a.gval+a.hval) < (b.gval+b.hval);
}

bool operator == ( const Node& a, const Node& b )
{
    // Two nodes are equal if their components are equal
    return (a.h == b.h) && (a.gval == b.gval) && (a.hval == b.hval);
}

inline HexDirection ReverseDirection( HexDirection d )
{
    // With hexagons, I'm numbering the directions 0 = N, 1 = NE,
    // and so on (clockwise).  To flip the direction, I can just
    // add 3, mod 6.
    return HexDirection( ( 3+int(d) ) % 6 );
}

// greater<Node> is an STL thing to create a 'comparison' object out of
// the greater-than operator, and call it comp.
typedef vector<Node> Container;
greater<Node> comp;

// I'm using a priority queue implemented as a heap.  STL has some nice
// heap manipulation functions.  (Look at the source to `priority_queue'
// for details.)  I didn't use priority_queue because later on, I need
// to traverse the entire data structure to update certain elements; the
// abstraction layer on priority_queue wouldn't let me do that.
inline void get_first( Container& v, Node& n )
{
    n = v.front();
    pop_heap( v.begin(), v.end(), comp );
    v.pop_back();
}

// Here's the class that implements A*.  I take a map, two points
// (A and B), and then output the path in the `path' vector, when
// find_path is called.
template <class Heuristic>
struct AStar
{
    PathStats stats;
    Heuristic& heuristic;
    // Remember which nodes are in the OPEN set
    Container open;
    // Remember which nodes we visited, so that we can clear the mark array
    // at the end.  This is the 'CLOSED' set plus the 'OPEN' set.
    Container visited;
    Map& map;
    HexCoord A, B;
    
    AStar( Heuristic& h, Map& m, HexCoord a, HexCoord b )
        : heuristic(h), map(m), A(a), B(b) {}
    ~AStar();

    // Main function:
    void find_path( vector<HexCoord>& path );

    // Helpers:
    void propagate_down( Node H );
    Container::iterator find_in_open( HexCoord h );
    inline bool in_open( const HexCoord& h )
    {
        return mark.data[h.m][h.n].f != -1;
    }
};

template<class Heuristic>
AStar<Heuristic>::~AStar()
{
    // Erase the mark array, for all items in open or visited
    for( Container::iterator o = open.begin(); o != open.end(); ++o )
    {
        HexCoord h = (*o).h;
        mark.data[h.m][h.n].direction = DirNone;
        mark.data[h.m][h.n].f = -1;
        mark.data[h.m][h.n].g = -1;
    }
    for( Container::iterator v = visited.begin(); v != visited.end(); ++v )
    {
        HexCoord h = (*v).h;
        mark.data[h.m][h.n].direction = DirNone;
        mark.data[h.m][h.n].g = -1;
        assert( !in_open( h ) );
    }
}

template <class Heuristic>
Container::iterator AStar<Heuristic>::find_in_open( HexCoord hn )
{
    // Only search for this node if we know it's in the OPEN set
    if( Map::valid(hn) && in_open(hn) ) 
    {
        for( Container::iterator i = open.begin(); i != open.end(); ++i )
        {
            stats.nodes_searched++;
            if( (*i).h == hn )
                return i;
        }
    }
    return open.end();
}

// This is the 'propagate down' stage of the algorithm, which I'm not
// sure I did right.
template <class Heuristic>
void AStar<Heuristic>::propagate_down( Node H )
{
    // Keep track of the nodes that we still have to consider
    Container examine;
    examine.push_back(H);
    while( !examine.empty() )
    {
        // Remove one node from the list
        Node N = examine.back();
        examine.pop_back();

        // Examine its neighbors
        for( int dir = 0; dir < 6; ++dir )
        {
            HexDirection d = HexDirection(dir);
            HexCoord hn = Neighbor( N.h, d );
            if( in_open(hn) )
            {
                // This node is in OPEN                
                int new_g = N.gval + heuristic.kost( map, N.h, d, hn );

                // Compare this `g' to the stored `g' in the array
                if( new_g < mark.data[hn.m][hn.n].g )
                {
                    Container::iterator i = find_in_open( hn );
                    assert( i != open.end() );
                    assert( mark.data[hn.m][hn.n].g == (*i).gval );
                    
                    // Push this thing UP in the heap (only up allowed!)
                    (*i).gval = new_g;
                    push_heap( open.begin(), i+1, comp );

                    // Set its direction to the parent node
                    mark.data[hn.m][hn.n].g = new_g;
                    mark.data[hn.m][hn.n].f = new_g + (*i).hval;
                    mark.data[hn.m][hn.n].direction = ReverseDirection(d);
                        
                    // Now reset its parent 
                    examine.push_back( (*i) );
                }
                else
                {
                    // The new node is no better, so stop here
                }
            }
            else
            {
                // Either it's in closed, or it's not visited yet
            }
        }
    }
}

template <class Heuristic>
void AStar<Heuristic>::find_path( vector<HexCoord>& path )
{
    Node N;
    {
        // insert the original node
        N.h = A;
        N.gval = 0;
        N.hval = heuristic.dist(map,A,B);
        open.push_back(N);
        mark.data[A.m][A.n].f = N.gval+N.hval;
        mark.data[A.m][A.n].g = N.gval;
        stats.nodes_added++;
    }

    // * Things in OPEN are in the open container (which is a heap),
    //   and also their mark[...].f value is nonnegative.
    // * Things in CLOSED are in the visited container (which is unordered),
    //   and also their mark[...].direction value is not DirNone.

    // While there are still nodes to visit, visit them!
    while( !open.empty() )
    {
        get_first( open, N );
        mark.data[N.h.m][N.h.n].f = -1;
        visited.push_back( N );
        stats.nodes_removed++;
        
        // If we're at the goal, then exit
        if( N.h == B )
            break;

        // If we've looked too long, then exit
        if( stats.nodes_removed >= heuristic.abort_path )
        {
            // Select a good element of OPEN
            for( Container::iterator i = open.begin(); i != open.end(); ++i )
            {
                if( (*i).hval*2 + (*i).gval < N.hval*2 + N.gval )
                    N = *i;
            }
            
            B = N.h;
            break;
        }

        // Every other column gets a different order of searching dirs
        // (Alternatively, you could pick one at random).  I don't want
        // to be too biased by my choice of order in which I look at the
        // neighboring grid spots.
        int directions1[6] = {0,1,2,3,4,5};
        int directions2[6] = {5,4,3,2,1,0};
        int *directions;
        if( (N.h.m+N.h.n) % 2 == 0 )
            directions = directions1;
        else
            directions = directions2;

        // Look at your neighbors.
        for( int dci = 0; dci < 6; ++dci )
        {
            HexDirection d = HexDirection(directions[dci]);
            HexCoord hn = Neighbor( N.h, d );
            // If it's off the end of the map, then don't keep scanning
            if( !map.valid(hn) )
                continue;

            int k = heuristic.kost(map, N.h, d, hn);
            Node N2;
            N2.h = hn;
            N2.gval = N.gval + k;
            N2.hval = heuristic.dist( map, hn, B );
            // If this spot (hn) hasn't been visited, its mark is DirNone
            if( mark.data[hn.m][hn.n].direction == DirNone )
            {
                // The space is not marked
                mark.data[hn.m][hn.n].direction = ReverseDirection(d);
                mark.data[hn.m][hn.n].f = N2.gval+N2.hval;
                mark.data[hn.m][hn.n].g = N2.gval;
                open.push_back( N2 );
                push_heap( open.begin(), open.end(), comp );
                stats.nodes_added++;
            }
            else
            {                
                // We know it's in OPEN or CLOSED...
                if( in_open(hn) )
                {
                    // It's in OPEN, so figure out whether g is better
                    if( N2.gval < mark.data[hn.m][hn.n].g )
                    {
                        // Search for hn in open
                        Container::iterator find1 = find_in_open( hn );
                        assert( find1 != open.end() );
                        
                        // Replace *find1's gval with N2.gval in the list&map
                        mark.data[hn.m][hn.n].direction = ReverseDirection(d);
                        mark.data[hn.m][hn.n].g = N2.gval;
                        mark.data[hn.m][hn.n].f = N2.gval+N2.hval;
                        (*find1).gval = N2.gval;
                        // This is allowed but it's not obvious why:
                        push_heap( open.begin(), find1+1, comp );
                        // (ask Amit if you're curious about it)

                        // This next step is not needed for most games
                        propagate_down( *find1 );
                    }
                }
            }
        }
    }

    if( N.h == B && N.gval < MAXIMUM_PATH_LENGTH )
    {
        stats.path_cost = N.gval;
        // We have found a path, so let's copy it into `path'
        HexCoord h = B;
        while( h != A )
        {
            HexDirection dir = mark.data[h.m][h.n].direction;
            path.push_back( h );
            h = Neighbor( h, dir );
            stats.path_length++;
        }
        path.push_back( A );
        // path now contains the hexes in which the unit must travel ..
        // backwards (like a stack)
    }
    else
    {
        // No path
    }

    stats.nodes_left = open.size();
    stats.nodes_visited = visited.size();
}

////////////////////////////////////////////////////////////////////////
// Specific instantiations of A* for different purposes

// UnitMovement is for moving units (soldiers, builders, firefighters)
struct UnitMovement
{
    HexCoord source;
    Unit* unit;
    int abort_path;
    
    inline static int dist( const HexCoord& a, const HexCoord& b )
    {
        // The **Manhattan** distance is what should be used in A*'s heuristic
        // distance estimate, *not* the straight-line distance.  This is because
        // A* wants to know the estimated distance for its paths, which involve
        // steps along the grid.  (Of course, if you assign 1.4 to the cost of
        // a diagonal, then you should use a distance function close to the
        // real distance.)

        // Here I compute a ``Manhattan'' distance for hexagons.  Nifty, eh?
        int a1 = 2*a.m;
        int a2 =  2*a.n+a.m%2 - a.m;
        int a3 = -2*a.n-a.m%2 - a.m; // == -a1-a2
        int b1 = 2*b.m;
        int b2 =  2*b.n+b.m%2 - b.m;
        int b3 = -2*b.n-b.m%2 - b.m; // == -b1-b2

        // One step on the map is 10 in this function
        return 5*max(abs(a1-b1), max(abs(a2-b2), abs(a3-b3)));
    }

    inline int dist( Map& m, const HexCoord& a, const HexCoord& b )
    {
        double dx1 = a.x() - b.x();
        double dy1 = a.y() - b.y();
        double dx2 = source.x() - b.x();
        double dy2 = source.y() - b.y();
        double cross = dx1*dy2-dx2*dy1;
        if( cross < 0 ) cross = -cross;

        return dist( a, b ) + int(cross/20000);
    }
    
    inline int kost( Map& m, const HexCoord& a, 
                     HexDirection d, const HexCoord& b, int pd = -1 )
    {
        // This is the cost of moving one step.  To get completely accurate
        // paths, this must be greater than or equal to the change in the
        // distance function when you take a step.

        if( pd == -1 ) pd = path_div;
        
        // Check for neighboring moving obstacles
        int occ = m.occupied_[b];
        if( ( occ != -1 && m.units[occ] != unit ) &&
            ( !m.units[occ]->moving() || ( source == a && d != DirNone ) ) )
                return MAXIMUM_PATH_LENGTH;

        // Roads are faster (twice as fast), and cancel altitude effects
        Terrain t1 = m.terrain(a);
        Terrain t2 = m.terrain(b);
        //        int rd = int((t2==Road||t2==Bridge)&&(t1==Road||t2==Bridge));
        // It'd be better theoretically for roads to work only when both
        // hexes are roads, BUT the path finder works faster when
        // it works just when the destination is a road, because it can
        // just step onto a road and know it's going somewhere, as opposed
        // to having to step on the road AND take another step.
        int rd = int(t2==Road || t2==Bridge);
        int rdv = ( 5 - 10 * rd ) * (pd - 3) / 5;
        // Slow everyone down on gates, canals, or walls
        if( t2 == Gate || t2 == Canal )
            rdv += 50;
        if( t2 == Wall )
            rdv += 150;
        // Slow down everyone on water, unless it's on a bridge
        if( t2 != Bridge && m.water(b) > 0 )
            rdv += 30;
        // If there's no road, I take additional items into account
        if( !rd )
        {
            // One thing we can do is penalize for getting OFF a road
            if( t1==Road || t1==Bridge )
                rdv += 15;
            // I take the difference in altitude and use that as a cost,
            // rounded down, which means that small differences cost 0
            int da = (m.altitude(b)-m.altitude(a))/ALTITUDE_SCALE;
            if( da > 0 )
                rdv += da * (pd-3);
        }
        return 10 + rdv;
    }
};

// Some useful functions are exported to be used without the pathfinder

int hex_distance( HexCoord a, HexCoord b )
{
    return UnitMovement::dist( a, b );
}

int movement_cost( Map& m, HexCoord a, HexCoord b, Unit* unit )
{
    UnitMovement um;
    um.unit = unit;
    return um.kost( m, a, DirNone, b, 8 );
}

// BuildingMovement is for drawing straight lines (!)
struct BuildingMovement
{
    HexCoord source;
    int abort_path;
    
    inline int dist( Map& m, const HexCoord& a, const HexCoord& b )
    {
        double dx1 = a.x() - b.x();
        double dy1 = a.y() - b.y();
        double dd1 = dx1*dx1+dy1*dy1;
        // The cross product will be high if two vectors are not colinear
        // so we can calculate the cross product of [current->goal] and
        // [source->goal] to see if we're staying along the [source->goal]
        // vector.  This will help keep us in a straight line.
        double dx2 = source.x() - b.x();
        double dy2 = source.y() - b.y();
        double cross = dx1*dy2-dx2*dy1;
        if( cross < 0 ) cross = -cross;
        return int( dd1 + cross );
    }

    inline int kost( Map& m, const HexCoord& a, 
                     HexDirection d, const HexCoord& b )
    {
        return 0;
    }
};

// Flat Canal movement tries to find a path for a canal that is not too steep
struct FlatCanalPath: public UnitMovement
{
    int kost( Map& m, const HexCoord& a, 
                     HexDirection d, const HexCoord& b )
    {
        // Try to minimize the slope
        int a0 = m.altitude(a);
        int bda = 0;
        for( int dir = 0; dir < 6; ++dir )
        {            
            int da = a0-m.altitude( Neighbor(a,HexDirection(dir)) );
            if( da > bda ) bda = da;
        }
        return 1 + 100*bda*bda;
    }
};

//////////////////////////////////////////////////////////////////////
// These functions call AStar with the proper heuristic object

PathStats FindUnitPath( Map& map, HexCoord A, HexCoord B, 
                        vector<HexCoord>& path, Unit* unit, int cutoff )
{
    UnitMovement um;    
    um.source = A;
    um.unit = unit;
    um.abort_path = cutoff * hex_distance(A,B) / 10;

    AStar<UnitMovement> finder( um, map, A, B );

    // If the goal node is unreachable, don't even try
    if( um.kost( map, A, DirNone, B ) == MAXIMUM_PATH_LENGTH )
    {
        // Check to see if a neighbor is reachable.  This is specific
        // to SimBlob and not something for A* -- I want to find a path
        // to a neighbor if the original goal was unreachable (perhaps it
        // is occupied or unpassable).
        int cost = MAXIMUM_PATH_LENGTH;
        HexCoord Bnew = B;
        for( int d = 0; d < 6; ++d )
        {
            HexCoord hn = Neighbor( B, HexDirection(d) );
            int c = um.kost( map, A, DirNone, hn );
            if( c < cost )
            {
                // This one is closer, hopefully
                Bnew = B;
                cost = c;
            }
        }
        // New goal
        B = Bnew;

        if( cost == MAXIMUM_PATH_LENGTH )
        {
            // No neighbor was good
            return finder.stats;
        }
    }

    finder.find_path( path );
    return finder.stats;
}

PathStats FindBuildPath( Map& map, HexCoord A, HexCoord B,
                         vector<HexCoord>& path )
{
    BuildingMovement bm;
    bm.source = A;

    AStar<BuildingMovement> finder( bm, map, A, B );
    finder.find_path( path );
    return finder.stats;
}

PathStats FindCanalPath( Map& map, HexCoord A, HexCoord B,
                         vector<HexCoord>& path )
{
    FlatCanalPath fcp;
    fcp.source = A;

    AStar<FlatCanalPath> finder( fcp, map, A, B );
    finder.find_path( path );
    return finder.stats;
}
```