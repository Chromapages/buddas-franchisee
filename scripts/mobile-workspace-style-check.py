"""Visual fixture checks; run against a separately configured local seed server."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("regression", Path(__file__).with_name("mobile-dashboard-regression.py"))
regression = module_from_spec(spec)
spec.loader.exec_module(regression)
output = Path("design-qa/mobile-workspace-styles")
output.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for width, enlarged in [(320, False), (430, False), (320, True), (1280, False)]:
        context = browser.new_context(viewport={"width": width, "height": 900})
        regression.add_session(context, "http://localhost:3100", managed=["HNL-014", "OAH-207", "SLC-302"])
        context.add_cookies([{"name": "buddas_portal_cart", "value": regression.cart_cookie("HNL-014", 1), "url": "http://localhost:3100", "httpOnly": True}])
        page = context.new_page()
        for route in ["supplies", "orders", "support", "support?new=1", "cart", "checkout", "resources", "bulletins", "account", "expansion"]:
            response = page.goto("http://localhost:3100/portal/" + route, wait_until="networkidle", timeout=60000)
            if route == "support?new=1":
                page.get_by_role("button", name="Open New Ticket").click()
            if enlarged:
                page.add_style_tag(content="html { font-size: 200% !important; }")
            label = route.replace("?", "-").replace("=", "-") + f"-{width}" + ("-text200" if enlarged else "")
            page.screenshot(path=str(output / (label + ".png")), full_page=True)
            result = page.evaluate("""() => ({overflow: document.documentElement.scrollWidth-innerWidth,
              title: document.title, heading: document.querySelector('main h1')?.textContent,
              inputSize: document.querySelector('main input:not([type=hidden])') ? getComputedStyle(document.querySelector('main input:not([type=hidden])')).fontSize : null,
              gutter: getComputedStyle(document.querySelector('#portal-main-content')).paddingLeft})""")
            results.append({"scenario": label, "status": response.status, **result})
        context.close()
    browser.close()
(output / "results.json").write_text(json.dumps(results, indent=2))
print(json.dumps({"scenarios": len(results), "issues": [r for r in results if r["overflow"] > 1 or r["status"] != 200]}, indent=2))
