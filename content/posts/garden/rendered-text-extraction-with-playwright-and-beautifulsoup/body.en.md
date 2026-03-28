Some pages do not really exist until JavaScript finishes. For those, `requests` + BeautifulSoup is elegant but often incomplete: the shell arrives, the article does not. My current low-friction pattern is to let Playwright render the page, grab the final HTML, and then flatten the `<body>` into text with BeautifulSoup.

```python
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def fetch_text(url: str) -> str:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")
        html = page.content()
        browser.close()
    soup = BeautifulSoup(html, "html.parser")
    body = soup.body or soup
    return "\n".join(body.stripped_strings)
```

Why I like this approach:
- **It works on client-rendered pages.**
- **It is easy to inspect and debug.**
- **It gives me a usable text dump quickly**, which is often enough for indexing, summarization, or note capture.

But this is a blunt tool. It extracts **all** body text, not the “main article” in any semantic sense. Navigation, footer text, recommendations, and repeated UI labels will come along for the ride. For a one-off scrape, that tradeoff is fine. For higher-quality extraction, I would add targeted selectors, boilerplate removal, or a Readability-style pass.

One small correction to my original sketch: in Playwright Python, `page.text()` is not the call I want here. The useful step is `page.content()`, because once the page is rendered, HTML is the stable thing to parse.

**Reference**
- Example page: https://36kr.com/p/2689307678240384
