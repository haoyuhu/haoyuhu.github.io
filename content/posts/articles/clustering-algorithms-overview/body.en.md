## Introduction to Clustering
Clustering is an unsupervised learning method that partitions data into clusters where intra-cluster similarity is high while inter-cluster similarity is low. It is widely used for discovering intrinsic groupings in data.

### Key Definitions
- **Hierarchical vs Partitioning:** Hierarchical clustering organizes data into a tree structure representing nested clusters, while partitioning methods assign data into a fixed number of disjoint subsets.
- **Mutually Exclusive, Overlapping, and Fuzzy Clustering:** Points may belong strictly to one cluster (hard clustering) or partially (fuzzy clustering) with membership degrees summing to one.
- **Complete vs Partial Clustering:** Complete clustering assigns all points to clusters. Partial clustering allows for noise points that do not belong to any cluster.

### Cluster Types
- **Clearly Separated Clusters:** Inter-cluster distances are greater than any intra-cluster distances.
- **Prototype-based Clusters:** Each point is closer to its own cluster center than to other centers.
- **Graph-based Clusters:** Data points as graph nodes with edge weights representing similarity.
- **Density-based Clusters:** Clusters defined by regions with higher point density, effective for irregularly shaped clusters and noise detection.

## Algorithmic Families
| Algorithm               | Type                | Need prior k? | Noise-robust? | Handles arbitrary shapes? | Typical Complexity  | Suitable For                 |
|-------------------------|---------------------|---------------|---------------|---------------------------|---------------------|-----------------------------|
| **k-Means++**            | Partitioning         | Yes           | No            | Generally no              | Time O(nkt); Space O(n + k) | Well-separated, spherical clusters |
| **Fuzzy C-Means (FCM)**  | Soft Partitioning    | Yes           | No            | Generally no              | Time O(nkt); Space O(nk)    | Overlapping clusters with soft memberships |
| **Agglomerative Hierarchical** | Hierarchical     | No fixed k    | Limited       | Sometimes                | Time approx O(n^3); Space O(n^2) | Small datasets, hierarchical insight |
| **DBSCAN**               | Density-based        | No            | Yes           | Yes                       | Time approx O(n^2); Space O(n^2)  | Arbitrary shapes, noise detection |

## Detailed Algorithm Overviews

### 1. k-Means++ (Hard c-Means Clustering)
k-Means++ improves the initial selection of cluster centers to promote convergence to better minima than random initialization.

**Algorithm Steps:**
1. Choose the first center randomly.
2. Select subsequent centers with probability proportional to their squared distance from the nearest existing center.
3. Assign points to their nearest center.
4. Update centers based on cluster means.
5. Repeat assignment and update steps until centers stabilize.

**Pros:** Simple, fast, intuitive results for spherical clusters.

**Cons:** Requires pre-specified cluster count. Sensitive to noise and outliers.

**Core Python Snippet Example:**
```python
import random
import math

def distance_squared(p1, p2):
    return (p1[0] - p2[0])**2 + (p1[1] - p2[1])**2

def initialize_centers_pp(points, k):
    centers = [random.choice(points)]
    for _ in range(1, k):
        dist_sq = [min(distance_squared(p, c) for c in centers) for p in points]
        cumulative = [sum(dist_sq[:i+1]) for i in range(len(dist_sq))]
        r = random.uniform(0, cumulative[-1])
        for i, val in enumerate(cumulative):
            if val >= r:
                centers.append(points[i])
                break
    return centers
```

### 2. Fuzzy c-Means (FCM)
FCM generalizes k-means by allowing partial memberships between points and clusters via membership degrees, controlled by a fuzziness parameter `m > 1`.

**Workflow:**
- Initialize cluster centers (often using k-Means++).
- Calculate membership degrees with formula:

  \[ u_{i,j} = \left( \sum_{k=1}^c \left( \frac{d(x_j, v_i)}{d(x_j, v_k)} \right)^{\frac{2}{m-1}} \right)^{-1} \]

- Update cluster centers as weighted averages:

  \[ v_i = \frac{\sum_{j=1}^n u_{i,j}^m x_j}{\sum_{j=1}^n u_{i,j}^m} \]

- Repeat until convergence.

**Pros:** Captures overlapping clusters with soft memberships.

**Cons:** Like k-means, requires known cluster count and is sensitive to noise.

### 3. Agglomerative Hierarchical Clustering
Starts with each point as a singleton cluster. Iteratively merges the two nearest clusters based on a linkage criterion (single, complete, average, or centroid distance) until a stopping criterion is met.

**Pros:** No need to pre-specify the number of clusters during merging; offers a dendrogram representing nested cluster hierarchies.

**Cons:** High computational complexity and memory usage; merging is irreversible and may produce noise clusters.

### 4. DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
DBSCAN clusters points based on density connectivity.

**Key parameters:**
- `eps`: radius for neighborhood search.
- `minPts`: minimum number of points in an eps-radius neighborhood to qualify as a core point.

**Point Types:**
- Core points: dense neighborhood.
- Border points: within neighborhood of a core point but not dense.
- Noise points: neither core nor border.

**Clustering process:**
- All core points connected via density reachable paths form clusters.
- Border points are assigned to their reachable core cluster.
- Noise points remain unassigned.

**Pros:** Handles noise and arbitrary-shaped clusters without specifying cluster count.

**Cons:** Parameter sensitivity; higher computational cost for large datasets.

## Summary of Parameter Impacts
| Algorithm                | Key Parameters                          | Larger Values Lead To                  | Smaller Values Lead To                |
|--------------------------|---------------------------------------|--------------------------------------|-------------------------------------|
| k-Means++                | Number of clusters, convergence tolerance | Finer partitioning, earlier stopping | Coarser clusters, longer convergence |
| Fuzzy C-Means            | Number of clusters, fuzziness parameter m  | Softer memberships                   | Approaches hard partitioning         |
| Agglomerative Hierarchical | Number of clusters, linkage criteria         | More clusters retained               | More aggressive merging              |
| DBSCAN                   | eps, minPts                           | Larger clusters, fewer noise points  | Smaller clusters, more noise points  |

## References
- Original blog posts: [K-Means, Hierarchical Clustering and DBSCAN](http://blog.sina.com.cn/s/blog_62186b460101ard2.html), [Fuzzy C-Means Algorithm](http://www.sjsjw.com/kf_other/article/030919ABA018874.asp)
- [Clustering Playbook: Modern Python tutorials](https://github.com/HaoyuHu/clusterAnalysis)

---

![Cluster Types and Algorithms](/legacy/clustering-playbook/overview.png)

This article reflects clustering fundamentals circa early 2010s with updates connecting to a modern educational repository featuring up-to-date implementations and extensions.
