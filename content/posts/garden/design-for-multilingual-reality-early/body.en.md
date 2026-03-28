One small note I keep relearning: multilingual support is not a translation task, it is a design constraint. If a product starts life assuming one language, the fixes later are always uglier than expected.

A few things I now treat as defaults, not edge cases:

- **Separate content from logic.** Never encode copy in control flow, database enums, or analytics labels.
- **Assume text expands and contracts.** Buttons, tables, nav labels, and email templates need slack.
- **Treat locale as more than language.** Dates, numbers, sorting, names, address formats, and search behavior all shift with locale.
- **Handle pluralization and grammar structurally.** String interpolation is rarely enough.
- **Respect scripts.** UTF-8 everywhere, font coverage, input methods, line breaking, and right-to-left layout need deliberate testing.
- **Design fallbacks.** Missing translations should fail gracefully and visibly.
- **Test with hostile samples.** Long German compounds, CJK text, Arabic, accented search queries, mixed-language content.

The deeper point is architectural: <u>language leaks into the whole system</u>. URL design, slugs, caching, CMS workflows, indexing, observability, and customer support all feel it. A useful discipline falls out of this: stable identifiers internally, localized presentation externally.

I have found that the cheapest time to think about multilingual design is before the first string lands in the UI. Even if the first release is single-language, building with multilingual assumptions produces cleaner boundaries and fewer hidden dependencies. It is one of those constraints that quietly improves the system.
