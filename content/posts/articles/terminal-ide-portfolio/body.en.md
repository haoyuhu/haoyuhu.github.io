# Why my portfolio wants to feel like an IDE

Many portfolio homepages do the same thing: flatten information, compress experience, and turn expression into a few familiar cards.

I prefer treating a personal site like a readable working environment.

## What the IDE aesthetic gives me

- A natural mental model for files, modules, and context.
- A place where experience, projects, notes, and articles can live together.
- A visual language that feels closer to how I actually work.

## Why this rebuild is config-first

Hardcoding personal information into UI components is fast in the short term, but expensive to maintain over time.

This refactor aims to:

1. Move every maintainable content fragment into YAML and Markdown.
2. Make the page render a generated bundle instead of owning raw personal data.
3. Let the local CLI and Studio GUI handle import, normalization, preview, and release.
4. Run validation, type checking, and browser regression before publishing.

## The outcome

The portfolio stops being a page that merely shows results and becomes a system that produces them.
