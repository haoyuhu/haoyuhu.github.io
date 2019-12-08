---
title: 大数乘法(Multiply Strings)
date: 2017-12-08 14:29:40
toc: true
categories: 
- 数据结构
tags:
- 大数乘法
---
## 大数乘法的算法

大数乘法的关键在于如何用字符串来模拟大数乘法。方法有如下几种：**模拟普通的手算乘法、利用代数方法优化的乘法、快速傅立叶变换FFT**。

### 各算法的优点

* **模拟普通手算乘法**：算法简单、空间复杂度小。时间复杂度为**`O(n^2)`**。
* **利用代数方法优化的乘法**：使用递归求解，空间复杂度较大。算法复杂，需要定义**大数加法**，**大数减法**。时间复杂度降低到**`O(n^1.5)`**。
* **快速傅立叶变换FFT**：基于FFT的大数乘法时间复杂度**`O(nlogn)`**。快速傅立叶变换据数值分析老师说是本世纪最为伟大的算法。

下边主要对利用**代数方法优化的乘法**进行介绍。

## 分析
### 代数优化

* 假设大数P、Q的长度为m和n，`P = (A * 10^k + B)`，`Q = (C * 10^k + D)`。
* `k = min(m / 2, n / 2)`。
* `PQ = (A * 10^k + B)(C * 10^k + D) = AC * 10 ^2k + (AD + BC) * 10^k + BD`。
* 以**乘法操作**作为主要操作，采用**master定理**可知，时间复杂度为**`O(n^2)`**。此时与普通的手算乘法并没有不同。
* **用于减少时间复杂度的关键**，`(A - B)(C - D) = AC - AD - BC + BD`
* 带入后得，`AC * 10 ^2k + (AC + BD - (A-B)(C-D)) * 10^k + BD`。
* 由于我们以乘法操作作为主要操作，因此每一层递归中只需要3次乘法。因此时间复杂度减少为**`O(n^1.5)`**。

<!--more-->

### 大数加法

```cpp
string add(string num1, string num2) {
    string answer;
    bool need = false;
    for (int i = num1.length() - 1, j = num2.length() - 1; i >= 0 || j >= 0; --i, --j) {
        int n1 = i >= 0 ? charToInt(num1[i]) : 0, n2 = j >= 0 ? charToInt(num2[j]) : 0;
        int r = 0;
        if (need) {
            r += 1;
            need = false;
        }
        r += n1 + n2;
        if (r >= 10) {
            need = true;
            answer.push_back(intToChar(r - 10));
        } else {
            need = false;
            answer.push_back(intToChar(r));
        }
    }
    if (need) {
        answer.push_back('1');
    }
    reverse(answer.begin(), answer.end());
    return answer;
}
```

* 采用`need`作为进位标志。
* 注意循环结束后`need`为`true`时需要再进位。
* 最后需要给`answer`做`reverse`操作。

### 大数减法

```cpp
string minus(string num1, string num2, bool& isPositive) {
    if (num1.length() > num2.length()) {
        isPositive = true;
    } else if (num1.length() < num2.length()) {
        isPositive = false;
    } else {
        for (int i = 0; i != num1.length(); ++i) {
            int n1 = charToInt(num1[i]), n2 = charToInt(num2[i]);
            if (n1 > n2) {
                isPositive = true;
                break;
            } else if (n1 < n2) {
                isPositive = false;
                break;
            } else {
                continue;
            }
        }
    }

    if (!isPositive) {
        string tp(num2);
        num2 = num1;
        num1 = tp;
    }

    bool need = false;
    string answer;
    int i, j;
    for (i = num1.length() - 1, j = num2.length() - 1; i >= 0; --i, --j) {
        int n1 = charToInt(num1[i]), n2 = j >= 0 ? charToInt(num2[j]) : 0;
        if (need) {
            n1 -= 1;
            need = false;
        }
        if (n1 >= n2) {
            answer.push_back(intToChar(n1 - n2));
        } else {
            need = true;
            answer.push_back(intToChar(n1 + 10 - n2));
        }
    }

    for (int i = answer.length() - 1; i >= 0; --i) {
        if (answer[i] == '0') {
            answer.erase(answer.end() - 1);
        } else {
            break;
        }
    }

    if (answer.empty()) {
        answer.push_back('0');
    }

    reverse(answer.begin(), answer.end());
    return answer;
}
```

* 大数减法最麻烦的是需要判断减后的正负情况。因此需要一个引用的`isPositive`来保存正负情况。
* 预处理判断两个字符串数字的大小，并将计算的正负结果保存到`isPositive`中。
* 同样用`need`作为借位标志，模拟手算减法。
* 应注意，减后高位可能有0存在，需要处理。
* 最后同样需要对`answer`做`reverse`操作。

## AC代码

```cpp
class Solution {
public:
    string multiply(string num1, string num2) {
        return multiplyNumbers(num1, num2);
    }
private:
    void preprocessing(string& str) {
        while (str.begin() != str.end() && *str.begin() == '0') {
            str.erase(str.begin());
        }
        if (str.empty()) {
            str.push_back('0');
        }
    }
    string multiplyNumbers(string num1, string num2) {
        if (num1.length() == 1) {
            return mulitplySingleNumber(num2, num1);
        }
        if (num2.length() == 1) {
            return mulitplySingleNumber(num1, num2);
        }
        int halfLen = min(num1.length() / 2, num2.length() / 2);
        string front1(num1, 0, num1.length() - halfLen), rear1(num1, num1.length() - halfLen, halfLen);
        string front2(num2, 0, num2.length() - halfLen), rear2(num2, num2.length() - halfLen, halfLen);
        preprocessing(front1); preprocessing(front2); preprocessing(rear1); preprocessing(rear2);
        string AC = multiplyNumbers(front1, front2);
        string BD = multiplyNumbers(rear1, rear2);
        bool isPositive1, isPositive2;
        isPositive1 = isPositive2 = true;
        string AmB = minus(front1, rear1, isPositive1), CmD = minus(front2, rear2, isPositive2);
        string AmBmCmD = multiplyNumbers(AmB, CmD);
        string answer = addAll(AC, BD, AmBmCmD, halfLen, isPositive1 && isPositive2 || !isPositive1 && !isPositive2);
        return answer;
    }
    string mulitplySingleNumber(string number, string single) {
        int t = charToInt(single[0]);
        if (t == 0) {
            return string ("0");
        }
        int need = 0;
        string answer;
        for (int i = number.length() - 1; i >= 0; --i) {
            int cur = charToInt(number[i]);
            int tp = cur * t + need;
            answer.push_back(intToChar(tp % 10));
            need = tp / 10;
        }
        if (need) {
            answer.push_back(intToChar(need));
        }
        reverse(answer.begin(), answer.end());
        return answer;
    }
    string minus(string num1, string num2, bool& isPositive) {
        if (num1.length() > num2.length()) {
            isPositive = true;
        } else if (num1.length() < num2.length()) {
            isPositive = false;
        } else {
            for (int i = 0; i != num1.length(); ++i) {
                int n1 = charToInt(num1[i]), n2 = charToInt(num2[i]);
                if (n1 > n2) {
                    isPositive = true;
                    break;
                } else if (n1 < n2) {
                    isPositive = false;
                    break;
                } else {
                    continue;
                }
            }
        }

        if (!isPositive) {
            string tp(num2);
            num2 = num1;
            num1 = tp;
        }

        bool need = false;
        string answer;
        int i, j;
        for (i = num1.length() - 1, j = num2.length() - 1; i >= 0; --i, --j) {
            int n1 = charToInt(num1[i]), n2 = j >= 0 ? charToInt(num2[j]) : 0;
            if (need) {
                n1 -= 1;
                need = false;
            }
            if (n1 >= n2) {
                answer.push_back(intToChar(n1 - n2));
            } else {
                need = true;
                answer.push_back(intToChar(n1 + 10 - n2));
            }
        }

        for (int i = answer.length() - 1; i >= 0; --i) {
            if (answer[i] == '0') {
                answer.erase(answer.end() - 1);
            } else {
                break;
            }
        }

        if (answer.empty()) {
            answer.push_back('0');
        }

        reverse(answer.begin(), answer.end());
        return answer;
    }
    string addAll(string AC, string BD, string AmBmCmD, int len, bool isPositive) {
        string mid = add(AC, BD);
        if (isPositive) {
            mid = minus(mid, AmBmCmD, isPositive);
        } else {
            mid = add(mid, AmBmCmD);
        }

        for (int i = 0; i != len; ++i) {
            AC += "00";
            mid.push_back('0');
        }

        string answer;
        answer = add(AC, mid);
        answer = add(answer, BD);
        return answer;
    }
    string add(string num1, string num2) {
        string answer;
        bool need = false;
        for (int i = num1.length() - 1, j = num2.length() - 1; i >= 0 || j >= 0; --i, --j) {
            int n1 = i >= 0 ? charToInt(num1[i]) : 0, n2 = j >= 0 ? charToInt(num2[j]) : 0;
            int r = 0;
            if (need) {
                r += 1;
                need = false;
            }
            r += n1 + n2;
            if (r >= 10) {
                need = true;
                answer.push_back(intToChar(r - 10));
            } else {
                need = false;
                answer.push_back(intToChar(r));
            }
        }
        if (need) {
            answer.push_back('1');
        }
        reverse(answer.begin(), answer.end());
        return answer;
    }
    int charToInt(char ch) {
        return static_cast<int> (ch - '0');
    }
    char intToChar(int ix) {
        return static_cast<char> ('0' + ix);
    }
};
//(A * 10^k + B)(C * 10^k + D) = AC * 10 ^2k + (AD + BC) * 10^k + BD = AC * 10 ^2k + (AC + BD - (A-B)(C-D)) * 10^k + BD

```

### 缺陷

* 应在大数乘法之初，将string类型的数字转换为vector<int>形式的数字，每个元素代表一位数字。这样避免了计算中的char和int转换。
* 注意，递归过程中截取的子串也可能在**高位包含0**，因此需要处理，代码中用**`preprocessing`**方法做预处理。