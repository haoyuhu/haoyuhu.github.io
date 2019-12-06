---
title: CRC循环冗余校验码
toc: true
categories: 
- 来自新世界
tags:
- CRC
mathjax: true
---
# [Cyclic redundancy check](https://en.wikipedia.org/wiki/Cyclic_redundancy_check)
A **cyclic redundancy check** (**CRC**) is an [error-detecting code](https://en.wikipedia.org/wiki/Error_detection_and_correction) commonly used in digital [networks](https://en.wikipedia.org/wiki/Telecommunications_network) and storage devices to detect accidental changes to raw data. Blocks of data entering these systems get a short *check value* attached, based on the remainder of a [polynomial division](https://en.wikipedia.org/wiki/Polynomial_long_division) of their contents. On retrieval, the calculation is repeated and, in the event the check values do not match, corrective action can be taken against data corruption.

# [循环冗余校验CRC简介](http://colobu.com/2014/10/22/CRC-introduction/)
* CRC为校验和的一种，是两个字节数据流采用二进制除法（没有借位和进位，使用**异或**来代替减法）相除所得到的余数。
* 其中被除数是需要计算校验和的信息数据流的二进制表示；除数是一个长度为(n+1)的预定义二进制数，通常用多项式的系数来表示。
* 在做除法之前，要在信息数据之后先加上n个0。冗余码的位数是n位。冗余码的计算方法是，先将信息码后面补0，补0的个数是生成多项式最高次幂；将补零之后的信息码用模二除法（非二进制除法）除以G(X)对应的2进制码，注意除法过程中所用的减法是模2减法（注意是高位对齐），即没有借位的减法，也就是异或运算。
* 当被除数逐位除完时，得到比除数少一位的余数。此余数即为冗余位,将其添加在信息位后便构成CRC码字。

例如，假设信息码字为11100011，生成多项式$G(X)=X^5+X^4+X+1$，计算CRC码字。$G(X)=X^5+X^4+X+1$,也就是110011，因为最高次是5，所以，在信息码字后补5个0，变为1110001100000。

用1110001100000模二除法除以110011，余数为11010，即为所求的冗余位。因此发送出去的CRC码字为原始码字11100011末尾加上冗余位11010，即 1110001111010。

接收端收到码字后，采用同样的方法验证，即将收到的码字用模二除法除以110011（是$G(X)$对应的二进制生成码），发现余数是0，则认为码字在传输过程中没有出错。

尽管在错误检测中非常有用，CRC并不能可靠地校验数据完整性（即数据没有发生任何变化），这是因为CRC多项式是线性结构，可以非常容易地故意改变量据而维持CRC不变。