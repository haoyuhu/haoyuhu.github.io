**What changed**

I finished the first meaningful optimization in the media pipeline: moving the compatibility path from direct video handling to **video -> GIF**.

This was less about aesthetics and more about survival. A single video job can easily push memory usage past **5 GB**. The GIF path behaves much better: memory stays stable, CPU usage is lower, and processing is noticeably faster. In practice, that makes GIF a much safer default for constrained machines and bursty workloads.

The downside is real: **GIF loses detail**. There is visible distortion, so this is a stability-first trade, not a quality win.

**What I want to improve next**

- **Keyframe replacement** to recover some resolution and perceived sharpness after GIF generation.
- **I-frame + a small number of P-frames** as a middle ground. That should preserve more detail than GIF alone, but it likely depends on having the full source video uploaded.
- **Network-aware adaptation**: choose GIF dimensions, whether to upload the original video, and transfer rate based on current network conditions instead of using one fixed policy.
- **Multi-channel matching**: the current matcher is single-channel; expanding it may improve robustness.
- **Stream directly from ffmpeg** so decoding and transformation happen incrementally, which should avoid another memory blow-up.

**Product guardrails**

If this becomes a real service, I probably need limits at three levels:

- daily quota
- hourly quota
- minute-level burst control

Pricing also seems straightforward:

- **subscription** with a fixed allowance
- **usage-based billing** for overflow or heavier users

The pattern is becoming clear: use GIF as the safe baseline, then spend complexity only where quality actually matters.
