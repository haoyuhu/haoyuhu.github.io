Apple-style AI should start from inputs, not prompts. The real surface area is whatever the user already has in hand: photos, screenshots, long images or video frames converted to text, voice turned into text, clipboard content, links, PDFs, docs, and plain text files.

The main UX rule is simple: reduce path depth. Skip unnecessary explanation, show onboarding once, and let intent be inferred from recent actions. If I just copied a link, the likely next step is summarize or translate. If I captured a chat screenshot, the next step is probably extract, explain, or draft a reply. AI should feel like a contextual verb picker, not a blank chat box.

**Capability layers**
- **General assistant**: web-connected, free-form Q&A, with short multi-turn sessions.
- **Search assistant**: deep search, synthesis, and citations; single-turn by default.
- **Reading / writing assistant**: extract, summarize, polish, brainstorm, critique, then save to Notes.
- **Translator**: detect source language and translate into the user’s preferred target language.
- **Chat helper**: summarize the last N messages, generate reply candidates, rewrite tone, and smooth awkward phrasing.
- **Memory layer**: preferences, long-term memory, and an “Ask Memo” RAG over notes, voice memos, and tasks.

A useful constraint: do not overinvest in local tool calling. Shortcuts already covers a lot of that. The AI value is better spent on interpretation, synthesis, and path compression.

**Supporting utilities**
Long screenshot stitching, quick idea capture with context, and lightweight reminders make the AI layer stickier.

**Operational realities**
Backend-centric auth, regional pricing, quotas, rate limits, upload caps, and behavior analytics are not glamorous, but they are part of the product.
