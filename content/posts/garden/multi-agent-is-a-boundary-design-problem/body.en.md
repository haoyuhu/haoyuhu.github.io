Anthropic's January 23, 2026 piece on multi-agent systems sharpened one thing I already suspected: the useful question is not **"should I use many agents?"** It is **"where is the boundary that deserves another agent?"**

I only reach for more agents when one of three things is true:

- **Context contamination** is getting expensive. One thread is polluting another.
- **Parallel search** is genuinely useful. I need coverage, not just speed theater.
- **Specialization** improves local quality. Different workers really do need different tools or operating styles.

Without one of those, multi-agent usually means more transcripts, more token burn, more coordination bugs, and more false confidence.

The hidden cost is that every extra agent adds a translation layer:

- someone has to summarize,
- someone has to hand off,
- someone has to reconcile contradictions.

That is why I now treat multi-agent design as **boundary design**.

If the boundary is real, the system gets cleaner.
If the boundary is fake, the system gets noisier.

My default remains simple: start with one strong worker, give it a clear oracle, and only split the work when the split has a defensible reason.

**Reference**

- [Building effective multi-agent systems](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
