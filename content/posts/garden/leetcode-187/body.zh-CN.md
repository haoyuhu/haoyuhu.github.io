### 概述
题目要求找出长度为10的DNA序列中，所有重复出现的子串。由于DNA字符串仅由{A, C, G, T}组成，可以利用这一特性优化存储和搜索过程。

### 核心思路：DNA编码为位序列
将每个碱基编码为2位二进制数：
- A → 00
- C → 01
- G → 10
- T → 11

因此，长度为10的子串对应20位整数（10 * 2位）。用`unordered_set<int>`替代`unordered_set<string>`，节省空间并加快比较速度。

### 滑动窗口与位掩码
利用滚动哈希思想维护一个`hint`变量：
- 初始化时，用前10个碱基构造整数。
- 每向后滑动一位，将最高的2位去除（使用掩码），左移2位并加入新碱基对应位。

代码为：
```cpp
hint = ((hint & eraser) << 2) + ati[s[i]];
```
其中
- `eraser = 0x3FFFF`（二进制：0011 1111 1111 1111 1111）用于擦除最高的2位,
- `ati`为碱基到数值的映射。

### 去重逻辑
维护两个集合：
| 集合       | 功能                           |
|------------|------------------------------|
| `repeated` | 保存出现过的子串 hint 值       |
| `check`    | 保存已加入结果的 hint，防止重复 |

当`hint`在`repeated`中出现但未在`check`中时，将对应子串加入结果。

---

### 代码示例
```cpp
class Solution {
public:
    #define eraser 0x3FFFF // 20位掩码，清除最高2位

    std::vector<std::string> findRepeatedDnaSequences(std::string s) {
        std::vector<std::string> answer;
        if (s.size() < 10) return answer;

        std::unordered_map<char,unsigned int> ati{{'A',0}, {'C',1}, {'G',2}, {'T',3}};
        std::unordered_set<unsigned int> repeated, check;

        unsigned int hint = 0;
        for(int i = 0; i < 10; ++i) {
            hint = (hint << 2) + ati[s[i]];
        }
        repeated.insert(hint);

        for(int i = 10; i < s.size(); ++i) {
            hint = ((hint & eraser) << 2) + ati[s[i]];
            if (repeated.count(hint)) {
                if (!check.count(hint)) {
                    answer.emplace_back(s.substr(i - 9, 10));
                    check.insert(hint);
                }
            } else {
                repeated.insert(hint);
            }
        }
        return answer;
    }
};
```

### 注意事项
- 运算符优先级容易出错，需要多加注意。
- 利用位编码减少了内存开销和比较时间。

---

### 对比总结
| 方面           | 字符串方式                     | 位掩码优化                    |
|----------------|-------------------------------|-------------------------------|
| 内存           | 存储完整序列字符串             | 存储紧凑的20位整数            |
| 查询效率       | 字符串哈希，较慢               | 整数哈希，更快                 |
| 实现难度       | 较为简单                      | 需要准确的位运算               |
| 时间复杂度     | 大约O(n*10)字符串比较          | O(n)滑动窗口 + 哈希           |

总结，这一方法充分利用了DNA字符集的有限特性，实现了算法的空间和时间双重优化。
