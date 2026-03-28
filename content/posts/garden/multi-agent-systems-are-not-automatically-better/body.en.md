**Multi-agent systems are not automatically an upgrade.** I keep seeing teams spend months building elaborate agent swarms, only to discover that a well-prompted single agent, equipped with the right tools, gets surprisingly close.

The real advantage shows up in only a few cases:

- **Context isolation.** If a subtask generates lots of irrelevant detail, separate agents can prevent context pollution and keep each thread focused.
- **Parallel exploration.** When research or search needs to branch across many directions at once, multiple agents buy coverage. This is usually about **completeness**, not raw speed; total wall-clock time may even go up.
- **Specialization.** Distinct agents can be tuned for different tools, domains, or operating styles, which can improve local decision quality.

The catch is coordination cost. In practice, multi-agent systems often consume **3–10x** the tokens of a comparable single-agent setup. Most of that overhead comes from:

- duplicated context in each agent,
- coordination messages between agents,
- summaries and handoff packaging between stages.

That cost hurts twice: higher spend, and higher complexity. More moving parts means more brittle routing, weaker observability, and harder debugging.

My default now is simple: **start with a single agent**. Give it strong prompts, useful tools, and clear stopping criteria. Only introduce multiple agents when you can point to one of the three advantages above and measure the gain.

One more thing: the boundary keeps moving. As models improve, the range of tasks a single agent can handle expands. Architecture choices that made sense a year ago may already deserve a fresh look.
