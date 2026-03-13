from pathlib import Path
from playwright.sync_api import sync_playwright

url = Path(r"d:\iirest\landing\index.html").resolve().as_uri()
out = Path(r"d:\iirest\landing\.agent\qa-slider-5-dots.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100})
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_timeout(800)
    page.evaluate("document.getElementById('visuals').scrollIntoView({block:'start'})")
    page.wait_for_timeout(400)

    for i in range(5):
        page.click(f"[data-slider-dot='{i}']")
        page.wait_for_timeout(160)
        active = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")
        print(f"dot={i} active={active}")

    page.screenshot(path=str(out), full_page=False)
    browser.close()
