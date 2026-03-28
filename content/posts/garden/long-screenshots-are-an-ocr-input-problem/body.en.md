Very tall screenshots are a weird failure mode for OCR on iPhone. The first instinct is to send them to a server and use a “better” model. In practice, that often does not help.

What seems to break is not only the recognizer but the image geometry. In a long screenshot, each line of text becomes relatively tiny inside one huge canvas. By the time OCR runs, the problem is already baked into the pixels: the glyphs are small, spacing is compressed, and layout heuristics get worse. A backend model cannot reliably recover detail that is no longer there.

The workaround I trust is much simpler: **slice the long screenshot, then run OCR on the iPhone again**.

A few rules of thumb:
- Keep the original width.
- Split vertically into smaller crops, roughly 2–4 screen heights each.
- Add a little overlap between slices so lines near boundaries are not lost.
- If one section is especially dense, cut it even smaller.

Why this works:
- each crop gives the recognizer a more normal page shape
- text occupies more of the frame
- Live Text / on-device OCR gets another chance with better local context
- privacy and latency stay better than a server round-trip

So my current takeaway is: this is often an **image preprocessing** problem, not an “OCR model quality” problem. Before reaching for a server pipeline, try making the input less pathological. For long screenshots, a dumb tiling step can beat a supposedly smarter OCR stack.
