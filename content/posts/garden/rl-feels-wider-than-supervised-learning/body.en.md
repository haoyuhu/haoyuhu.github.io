A contrast I keep returning to:

In **supervised learning**, the high-level recipe is surprisingly fixed. We pick a loss, minimize empirical risk, and then argue about generalization, optimization, and robustness around that core. At the optimization layer, there is room to move—SGD, Adam, Muon, better schedules, better regularization—but statistically the game is relatively constrained. Most variants still orbit the same basic objective: fit the training data well.

In **reinforcement learning**, the situation feels much more open. Changing the algorithm is not just an implementation choice; it can change the data you collect, the bias-variance tradeoff, the exploration pattern, and ultimately the kind of statistical guarantee you can hope for. Different algorithmic designs can induce genuinely different learning problems. That makes RL theory feel like a broader design space rather than a refinement of a fixed template.

What I find especially interesting is this: many clean theoretical guarantees in RL rely on strong assumptions. My current suspicion is that these assumptions are not merely technical scaffolding for proofs—they may also be part of why some theoretically motivated algorithms behave poorly in practice. If the guarantee only appears under a narrow world model, the resulting algorithm may inherit that narrowness.

That shifts the role of theory. Instead of being mainly **explanatory**—rationalizing what already works—it can be **normative**: a way to propose new algorithmic principles under assumptions we actually want to live with.

That, to me, is part of what makes RL theory exciting: the theorem is not just about understanding an algorithm. It can point toward a different one.
