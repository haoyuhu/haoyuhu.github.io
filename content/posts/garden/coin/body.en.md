## Problem Statement

Start with **n** coins all heads up. Each move, you must flip exactly **p** coins (where 1 ≤ p ≤ n). Determine the minimum number of moves to get all coins tails up.

---

## Key Insight

- Perform \( \lceil\frac{n}{p}\rceil - 1 \) moves flipping **p** coins each, flipping \( (\lceil\frac{n}{p}\rceil - 1) \times p \) coins to tails.
- Define \( r = n \bmod p \). After this, the remaining coins include \( r + p \).
- Consider flipping \( x \) tails-up coins and \( p - x \) heads-up coins in the next move.
- The new count of heads-up coins after flipping:
  \[
  x + r + p - (p - x) = r + 2x
  \]
- To get exactly \( p \) heads-up coins, solve:
  \[
  r + 2x = p \implies x = \frac{p - r}{2}
  \]

Since \( x \) must be an integer, \( p \) and \( r \) must have the same parity (both even or both odd).

---

## Parity Analysis and Feasibility

| Case                  | Feasibility                             | Notes                                                       |
|-----------------------|---------------------------------------|-------------------------------------------------------------|
| n odd, p odd          | If \( k = \lceil\frac{n}{p}\rceil \) is odd, feasible; else no | Since each move flips an odd number of coins, the parity of heads flips each time. |
| n even, p even        | Always feasible                        | Parity aligns naturally                                      |
| n odd, p even         | No solution                           | Parity mismatch                                            |
| n even, p odd         | If \( k = \lceil\frac{n}{p}\rceil \) is even, feasible; else no | Opposite parity condition compared to n odd/p odd         |

Special note: When \( \frac{n}{p} \) is between 1 and 2, further considerations apply.

---

## Minimal Moves Summary

- If feasible according to parity rules:
  - When \( 1 < \frac{n}{p} < 2 \), minimum moves = 3
  - When \( \frac{n}{p} \geq 2 \), minimum moves = \( \lceil \frac{n}{p} \rceil \)
- Otherwise, there is no solution.

---

## Diagram: Decision Flow

```mermaid
flowchart TD
    A[Start with n coins all heads]
    B[Check parity of n and p]
    C{n odd, p odd?}
    D{n even, p even?}
    E{n odd, p even?}
    F{n even, p odd?}
    G[No solution]
    H{Calculate k = ceil(n/p)}
    I{k odd?}
    J{k even?}
    K[Feasible]
    L[Determine minimal moves]
    M{1 < n/p < 2?}
    N[Answer = 3]
    O[Answer = k]

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    C -- Yes --> H
    C -- No --> G
    D -- Yes --> K
    D -- No --> G
    E -- Yes --> G
    E -- No --> G
    F -- Yes --> H
    F -- No --> G
    H --> I
    I -- Yes --> K
    I -- No --> G
    K --> L
    L --> M
    M -- Yes --> N
    M -- No --> O
