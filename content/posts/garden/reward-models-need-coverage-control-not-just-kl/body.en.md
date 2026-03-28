**My working model:** a learned reward model is local. It is mostly accurate near the distribution induced by the reference policy, and increasingly unreliable as optimization pushes the policy into regions with weak coverage.

That makes regularization non-optional. The common move is to add a KL penalty against the reference policy. I think that story is directionally right, but mathematically too soft for the thing we actually fear.

If the real issue is out-of-distribution generalization, then offline coverage theory points to a different object: the density ratio

- `w(x, a) = pi(a|x) / pi_ref(a|x)`

What matters is not just whether `w` is modest <u>on average</u>, but whether it can become huge anywhere important. That is why controls like:

- the max ratio, `||w||_inf`
- or second-moment quantities like `E_ref[w^2]` (closely tied to chi-square divergence)

are often more faithful than KL.

The failure mode of KL is simple: it uses a log. In effect, KL only sees `E_ref[w log w]`, and the log compresses large ratios. So the policy can place very large importance weights on a small set of states or actions, pay only a moderate KL cost, and still wander into places where the reward model is least calibrated.

That is exactly where reward hacking starts to look like progress.

So my current takeaway is:

- **KL is a useful optimization prior, not a coverage certificate.**
- **If I care about reward-model extrapolation, I trust max-ratio or chi-square-style controls more.**
- **'Close on average' is weaker than 'nowhere too far.'**
