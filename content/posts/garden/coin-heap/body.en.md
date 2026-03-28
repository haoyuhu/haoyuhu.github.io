Classic case

There are 23 coins on the table, 10 of them heads up. You are blindfolded and cannot tell heads from tails by touch. Split the coins into two piles so that both piles contain the same number of heads.

Method
- Take any 10 coins as pile A.
- Put the remaining 13 coins into pile B.
- Flip every coin in pile A.

Why it works

For the general case with $n$ coins and $k$ heads up:
- choose any $k$ coins for pile A;
- put the remaining $n-k$ coins into pile B;
- flip all coins in pile A.

Let pile A initially contain $x$ heads.
- Then pile A also contains $k-x$ tails.
- Since the total number of heads on the table is $k$, pile B must contain $k-x$ heads.
- After flipping pile A, its $x$ heads become tails, and its $k-x$ tails become heads.

So pile A ends with $k-x$ heads, exactly the same as pile B.

Takeaway

**The hidden invariant is this: make one pile's size equal to the total number of heads.** Flipping that pile converts its tails into the precise complement of the other pile's heads.

No inspection is needed. The construction works completely blind.
