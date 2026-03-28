One quota idea I want to keep simple: make the daily limit adaptive, not fixed. The shape is basically **additive increase, multiplicative decrease**, which is usually a good sign for anything that needs to self-correct.

**Rule**
- If a user exceeds today’s quota, tomorrow’s quota becomes **1/2 of the current value**.
- If a user stays within quota, tomorrow’s quota increases by **+n**.
- Always clamp the result to a configured floor and ceiling.

Tentative bounds:
- upper bound: **32 / 64**
- lower bound: **4 / 8**

The paired numbers are placeholders for different buckets, plans, or action types. I do not need that mapping fully decided yet; I do need the system to support it.

What I like about this approach:
- spikes are punished quickly
- recovery is gradual
- the behavior is explainable to product, support, and ops
- it avoids a rigid one-size-fits-all quota model

Two constraints feel non-negotiable from day one:
- **Per-user configuration.** Different users may need different starting quotas, caps, or step sizes.
- **Backend adjustability.** Admins should be able to override or tune quota without a deploy.

So the stored state should probably include: current quota, min quota, max quota, increment **n**, last reset date, and an override field with reason or audit trail.

The main tuning question is **n**. Too large, and users bounce back to max too fast. Too small, and recovery feels unnecessarily punitive. But the mechanism itself feels solid: simple, tunable, and easy to reason about.
