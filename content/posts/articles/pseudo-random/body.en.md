Most random numbers produced by software are **pseudo-random**: deterministic outputs designed to approximate a target distribution. Classical techniques include direct sampling, inverse transform, and rejection sampling. Two system-minded variants are especially useful in practice: **Pseudo Random Distribution (PRD)** for smoothing game events, and **RSA-based permutation** for generating large, non-repeating shuffled sequences.

## 1. PRD: fairness for player-facing probability

In a normal Bernoulli model, every attack rolls the same fixed chance `p`. That is statistically clean, but it feels rough in games: players remember streaks of five crits in a row, or fifty attacks with no crit at all.

PRD, popularized by **Warcraft III** and later **Dota**, changes the per-attempt chance based on recent history:

```text
chance on the k-th eligible attempt since the last proc = min(1, C × k)
```

- `k` increases after each eligible non-proc.
- On a proc, `k` resets to `0`.
- `C` is a calibrated constant chosen so the **long-run average** matches the design target.

Old engines often precomputed `C` in lookup tables instead of solving it at runtime. Warcraft III used 5% table steps, which was convenient but noticeably inaccurate for higher nominal proc rates, especially above about `15%`. Also, not every action should advance the counter: for example, attacks against towers may be marked as ineligible.

```mermaid
flowchart LR
    A[Action occurs] --> B{Eligible for PRD?}
    B -- No --> A
    B -- Yes --> C[Increment miss counter k]
    C --> D[Roll with p = min(1, C × k)]
    D --> E{Triggered?}
    E -- Yes --> F[Apply effect and reset k = 0]
    E -- No --> G[Keep k for next eligible action]
    F --> A
    G --> A
```

The key benefit is <u>distribution shaping</u>. PRD does **not** increase the average power of an ability; it reduces extreme luck. Wiki measurements show the effect clearly: at a nominal `10%` proc rate, the average interval remains `10` attempts, but the standard deviation drops to about `5.06`, versus `9.50` for plain independent RNG. At `80%`, the average interval is `1.50` attempts, with standard deviation `0.50` under PRD versus `0.87` under plain RNG. Fewer absurd streaks means better perceived fairness.

| Model | Per-attempt rule | Streak behavior | Best use |
|---|---|---|---|
| Plain RNG | Fixed `p` every time | High variance | Simulation, statistical purity |
| PRD | Chance rises after misses, resets on proc | Reduced extremes | Crits, dodges, on-hit effects |
| RSA permutation | Deterministic bijection, not a per-draw probability model | No duplicates | Unique shuffled IDs or ranges |

## 2. RSA as a non-repeating pseudo-random shuffle

A different problem is: how do you generate `100,000,000` **distinct** pseudo-random numbers? Repeatedly sampling and deduplicating is wasteful. This is really a **permutation** problem.

RSA gives a reversible mapping over a modular domain:

```text
N = p × q
φ(N) = (p - 1)(q - 1)

choose e such that gcd(e, φ(N)) = 1
find d such that e × d ≡ 1 (mod φ(N))

permute: y = x^e mod N
inverse: x = y^d mod N
```

With distinct primes `p` and `q`, the mapping `x -> x^e mod N` is a bijection over the residues modulo `N`. That means an ordered sequence can be transformed into a deterministic shuffled sequence with **no repeats**.

Example: let `p = 3`, `q = 5`, so `N = 15` and `φ(N) = 8`. Choose `e = 3`; then `d = 3` because `3 × 3 ≡ 1 (mod 8)`. A few values map like this:

`2 -> 8`, `3 -> 12`, `4 -> 4`, `5 -> 5`, `6 -> 6`, `7 -> 13`, `8 -> 2`, `9 -> 9`

One important correction: this is a permutation over `0..N-1`, **not** a shuffle confined to the original subrange `2..9`. If you need an exact interval such as `1..100,000,000`, choose `N` slightly larger than the interval and skip out-of-range outputs, or use a modern format-preserving permutation such as a Feistel network.

**PRD and RSA solve different problems.** PRD makes repeated events feel fairer to humans; RSA-style modular exponentiation gives you a reversible, collision-free shuffle. Same pseudo-random umbrella, very different system goals.
