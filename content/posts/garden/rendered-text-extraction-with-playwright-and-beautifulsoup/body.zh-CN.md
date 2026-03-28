有些页面在 JavaScript 执行完成之前，实际上并不存在。对于这类页面，`requests` + BeautifulSoup 很优雅，但往往并不完整：页面外壳到了，正文没到。我目前低摩擦的做法是先让 Playwright 把页面渲染出来，拿到最终 HTML，再用 BeautifulSoup 把 `<body>` 展平成文本。

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

我喜欢这种做法的原因：
- **它适用于客户端渲染页面。**
- **它容易检查和调试。**
- **它能快速给我一份可用的文本输出**，通常已经足够用于索引、摘要生成或笔记采集。

但这是一把钝器。它提取的是 <u>全部</u> body 文本，而不是任何语义意义上的“正文”。导航、页脚文本、推荐内容，以及重复的 UI 标签都会被一并带上。对于一次性的抓取，这种权衡完全可以接受。若要更高质量的提取，我会加上定向选择器、样板内容剔除，或者做一遍 Readability 风格的处理。

对我最初草稿做一个小修正：在 Playwright Python 里，`page.text()` 不是我这里想要调用的方法。真正有用的是 `page.content()`，因为页面一旦渲染完成，HTML 才是更稳定的解析对象。

**参考**
- 示例页面: https://36kr.com/p/2689307678240384
