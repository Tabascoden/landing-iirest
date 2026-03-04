from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(r"d:\\iirest\\landing")
URL = (ROOT / "index.html").resolve().as_uri()
OUT = ROOT / ".agent"
OUT.mkdir(parents=True, exist_ok=True)


def run_desktop(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 2200})
    page = context.new_page()

    logs = []
    page.on("console", lambda msg: logs.append((msg.type, msg.text)))

    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1600)

    page.screenshot(path=str(OUT / "qa-desktop-full.png"), full_page=True)

    for name, anchor in [
        ("Решение", "solution"),
        ("Как это работает", "how"),
        ("Тарифы", "pricing"),
        ("FAQ", "faq"),
    ]:
        page.get_by_role("link", name=name).first.click()
        page.wait_for_timeout(450)
        current_hash = page.evaluate("window.location.hash")
        top = page.evaluate(f"Math.round(document.getElementById('{anchor}').getBoundingClientRect().top)")
        print(f"NAV {anchor}: hash={current_hash} top={top}")

    page.locator("summary", has_text="Нужна ли регистрация поставщиков?").click()
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUT / "qa-desktop-faq.png"), full_page=False)

    page.locator("a[href='#how']").first.click()
    page.wait_for_timeout(350)
    page.locator("a[href='#visuals']").count()

    page.evaluate("document.getElementById('visuals').scrollIntoView({behavior:'instant', block:'start'})")
    page.wait_for_timeout(450)

    before = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")
    page.click("[data-slider-next]")
    page.wait_for_timeout(300)
    after_next = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")

    page.click("[data-slider-dot='2']")
    page.wait_for_timeout(280)
    after_dot = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")

    slider_box = page.locator(".slider").bounding_box()
    if slider_box:
        cx = slider_box["x"] + slider_box["width"] * 0.75
        cy = slider_box["y"] + slider_box["height"] * 0.5
        page.mouse.move(cx, cy)
        page.mouse.down()
        page.mouse.move(cx - 180, cy)
        page.mouse.up()
        page.wait_for_timeout(300)

    after_swipe = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")

    page.screenshot(path=str(OUT / "qa-desktop-slider.png"), full_page=False)

    page.evaluate("document.getElementById('pricing').scrollIntoView({behavior:'instant', block:'start'})")
    page.wait_for_timeout(320)
    page.screenshot(path=str(OUT / "qa-desktop-pricing.png"), full_page=False)

    overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")

    print(f"SLIDER before={before} after_next={after_next} after_dot={after_dot} after_swipe={after_swipe}")
    print(f"OVERFLOW_DESKTOP={overflow}")
    print(f"CONSOLE_COUNT={len(logs)}")
    for t, text in logs[:8]:
        print(f"CONSOLE {t}: {text[:200]}")

    context.close()
    browser.close()


def run_mobile(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=3,
        is_mobile=True,
        has_touch=True,
        user_agent=(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
            "Mobile/15E148 Safari/604.1"
        ),
    )
    page = context.new_page()

    logs = []
    page.on("console", lambda msg: logs.append((msg.type, msg.text)))

    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1400)

    page.screenshot(path=str(OUT / "qa-mobile-full.png"), full_page=True)

    page.evaluate("document.getElementById('visuals').scrollIntoView({behavior:'instant', block:'start'})")
    page.wait_for_timeout(350)
    before = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")
    page.tap("[data-slider-next]")
    page.wait_for_timeout(280)
    after = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")

    slider = page.locator(".slider")
    slider.hover()
    box = slider.bounding_box()
    if box:
        start_x = box["x"] + box["width"] * 0.8
        y = box["y"] + box["height"] * 0.5
        end_x = box["x"] + box["width"] * 0.2
        page.touchscreen.tap(start_x, y)
        page.mouse.move(start_x, y)
        page.mouse.down()
        page.mouse.move(end_x, y)
        page.mouse.up()
        page.wait_for_timeout(280)

    after_swipe = page.locator(".slider-dot.active").first.get_attribute("data-slider-dot")

    page.screenshot(path=str(OUT / "qa-mobile-slider.png"), full_page=False)

    overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
    print(f"MOBILE_SLIDER before={before} after_tap={after} after_swipe={after_swipe}")
    print(f"OVERFLOW_MOBILE={overflow}")
    print(f"MOBILE_CONSOLE_COUNT={len(logs)}")
    for t, text in logs[:8]:
        print(f"MOBILE_CONSOLE {t}: {text[:200]}")

    context.close()
    browser.close()


with sync_playwright() as p:
    run_desktop(p)
    run_mobile(p)
