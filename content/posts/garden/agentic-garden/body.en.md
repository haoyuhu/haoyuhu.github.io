It is easy to treat a portfolio as a static page, but that usually means the content slowly leaks back into hardcoded UI strings.

I want this project to act more like a local-first content operating system:

- The page should only render a generated bundle.
- Resumes, notes, and articles should come from shared YAML and Markdown sources.
- The CLI, Skill, and Studio GUI should reuse the same schema and services.
- Every release should pass validation, type checks, and browser regression coverage.

That turns each update from “editing the page” into “running a reliable content workflow”.
