While testing the video pipeline, I noticed a simple but important failure mode: **a single request can fully occupy one CPU core**, and **memory usage rises with video size**.

That observation matters because it rules out a common excuse. This is not just a concurrency problem. Even at request count = 1, the pipeline is already expensive. In other words, the baseline cost is too high.

The immediate question is where the pressure actually comes from: **ffmpeg** or **the algorithm**.

If the hotspot is ffmpeg, the optimization path is mostly systems work:
- avoid unnecessary transcoding or format conversion
- stream data instead of buffering too much in memory
- check whether decode / resize steps are creating extra copies
- tune invocation parameters rather than treating ffmpeg as a black box

If the hotspot is the algorithm, then the focus shifts:
- reduce the number of frames processed
- downsample earlier
- shrink intermediate tensors or buffers
- tighten memory lifecycle and reuse allocations where possible

So the next step is not “optimize the whole pipeline.” It is to put a clean breakpoint in the flow and measure each stage separately. **Find the dominant cost first, then optimize with intent.**

Two guardrails are worth adding immediately, even before deep tuning:
- **limit upload file size**
- **downsample input video before analysis**

This feels like a good reminder for video systems in general: before discussing scale, make sure the single-request path is sane. If one request can already pin a core and grow memory with input size, the architecture is telling you where to look.
