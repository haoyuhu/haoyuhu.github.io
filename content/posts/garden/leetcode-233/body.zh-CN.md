## 题目概述
给定一个非负整数 n，统计所有小于等于 n 的非负整数中数字 '1' 出现的总次数。

**示例：** 对于 n = 13，数字 '1' 出现在数字序列 1、10、11、12、13 中，共出现 6 次。

---

## 暴力枚举法
最初的思路是遍历 1 到 n 的所有数，然后逐个计算它们数字中 '1' 的个数。

```cpp
class Solution {
public:
    int countDigitOne(int n) {
        int count = 0;
        for (int i = 1; i <= n; ++i) {
            int num = i;
            while (num) {
                if (num % 10 == 1) ++count;
                num /= 10;
            }
        }
        return count;
    }
};
```

- **时间复杂度：** O(n log n)，这里的 log n 是数字位数。
- **缺点：** 当 n 较大时，遍历所有数字导致超时。

---

## 位数分析法
效率更高的思路是针对每个位进行分析，而不是针对每个数。

设数字 n 有 \( m+1 \) 位，表示为 \( a_m a_{m-1} ... a_0 \)，第 i 位数字为 \( a_i \) ，从右往左计数（0 为个位）。

定义：
- \( p \)：第 i 位左边的数字组合
- \( k = a_i \)：当前位数字
- \( q \)：第 i 位右边的数字组合

该位中数字 '1' 出现次数计算公式为：

\[
count_i = p \times 10^i + \begin{cases}
q + 1 & k = 1 \\
10^i & k > 1 \\
0 & k = 0
\end{cases}
\]

**举例**：n=83121，分析百位（i=2，数字为 1）时：
- \( p=83 \)
- \( q=21 \)
- \( k=1 \)

对应位置 '1' 出现次数：\( 83 \times 100 + 21 + 1 = 8322 \)

---

## 时间复杂度
- 时间复杂度：\( O(\log n) \)，只需遍历数字的每个位。
- 空间复杂度：\( O(1) \)

---

## 代码实现
```cpp
class Solution {
public:
    int countDigitOne(int n) {
        int count = 0;
        int previous = 0;  // 右侧数字的组合 q
        int coef = 1;      // 位权 10^i

        while (n > 0) {
            int remain = n % 10;       // 当前位 k
            int over = n / 10;         // 左侧数字 p

            if (remain > 1) {
                count += coef;
            } else if (remain == 1) {
                count += previous + 1;
            }
            count += coef * over;

            previous += coef * remain;
            coef *= 10;
            n /= 10;
        }

        return count;
    }
};
```

---

## 变量说明表
| 变量       | 含义           | 作用                    |
|------------|----------------|-------------------------|
| n          | 输入数字       | 每轮迭代取当前位数字     |
| remain     | 当前位数字 k   | 决定当前位 '1' 出现次数 |
| over       | 左侧数字 p     | 完整循环次数乘数        |
| previous   | 右侧数字 q     | 当前位为1时额外计数     |
| coef       | 10 的幂         | 当前位的权重            |

---

通过对每个位独立统计数字 '1' 的出现次数，极大地减少了计算次数，实现高效解决方案。
