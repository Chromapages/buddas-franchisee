import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright


source = Path("scripts/create-demo-operator.ts").read_text(encoding="utf-8")
email = re.search(r'email: "([^"]+)"', source).group(1)
password = re.search(r'password: "([^"]+)"', source).group(1)


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    unauthenticated = browser.new_context(viewport={"width": 390, "height": 844})
    unauthenticated_page = unauthenticated.new_page()
    unauthenticated_page.goto("http://localhost:3000/portal/supplies", wait_until="networkidle")
    assert "/franchise/login" in unauthenticated_page.url, "Private Supplies must redirect unauthenticated visitors."
    unauthenticated.close()

    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.add_init_script("window.__operatorEvents = []; window.addEventListener('buddas:analytics', event => window.__operatorEvents.push(event.detail));")
    page.goto("http://localhost:3000/franchise/login", wait_until="networkidle")
    page.get_by_label("Email Address *").fill(email)
    page.get_by_label("Password *").fill(password)
    page.get_by_role("button", name="Sign In", exact=True).click()
    page.wait_for_url("**/portal", timeout=30000)
    page.goto("http://localhost:3000/portal/supplies", wait_until="networkidle")

    page.get_by_role("heading", name="Supplies", level=1).wait_for()
    assert page.get_by_role("heading", level=1).count() == 1
    assert page.get_by_role("search").is_visible()
    scope = page.get_by_label("Catalog scope")
    assert "Ordering for" in scope.inner_text()
    assert "Salt Lake City #1" in scope.inner_text()
    assert "Unit SLC-001" in scope.inner_text()

    cards = page.locator(".catalog-grid > li > article")
    cards.first.wait_for()
    assert cards.count() == 1, "Demo operator must expose its real one-product catalog."
    card = cards.first
    assert card.locator(".catalog-category-placeholder, img").count() == 1
    assert card.get_by_text("SKU: APRON", exact=True).is_visible()
    assert card.get_by_text("Pack of 5", exact=True).is_visible()
    assert card.get_by_text("Available to order", exact=True).is_visible()
    assert card.get_by_text("$12.00 each", exact=True).is_visible()
    assert not page.get_by_text("Sort by", exact=True).count(), "One-product catalog must not render sort noise."
    assert not page.get_by_label("Refine approved supplies").count(), "One-product catalog must not render inert facets."

    add_quantity = card.get_by_label("Apron quantity to add")
    add_quantity.get_by_role("button", name="Increase Apron pack quantity to add").click()
    assert add_quantity.get_by_text("2 packs", exact=True).is_visible()
    assert card.get_by_role("button", name="Add 2 packs of Apron to order").is_visible()
    add_quantity.get_by_role("button", name="Decrease Apron pack quantity to add").click()
    assert add_quantity.get_by_text("1 pack", exact=True).is_visible()

    sku_search = page.get_by_role("searchbox", name="Search approved supplies")
    sku_search.fill("  APRON  ")
    page.get_by_text("Exact SKU match", exact=True).wait_for()
    assert cards.count() == 1
    sku_search.fill("not-an-approved-sku")
    page.get_by_role("heading", name=re.compile("No approved supplies found")).wait_for()
    page.get_by_label("Clear search").click()
    cards.first.wait_for()

    card.get_by_role("button", name="Add 1 pack of Apron to order").click()
    current_order = page.get_by_role("complementary", name="Current supply order")
    current_order.wait_for()
    assert "1 item" in current_order.inner_text()
    current_order.get_by_role("button", name=re.compile("Review order")).click()
    drawer = page.get_by_role("dialog", name="Supply order")
    drawer.wait_for()
    assert "1 pack" in drawer.inner_text()
    page.keyboard.press("Escape")
    drawer.wait_for(state="hidden")
    quantity = card.get_by_role("textbox", name="Quantity of Apron packs in cart")
    quantity.fill("0")
    quantity.press("Enter")
    card.get_by_role("button", name="Add 1 pack of Apron to order").wait_for()
    current_order.wait_for(state="hidden")

    for width, height in [(320, 568), (430, 932), (768, 1024), (1024, 844), (1280, 844), (1366, 900), (1440, 900), (1600, 1000), (1920, 1080)]:
        page.set_viewport_size({"width": width, "height": height})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), f"Horizontal overflow at {width}px"

    page.set_viewport_size({"width": 320, "height": 844})
    enlarged = page.add_style_tag(content="html { font-size: 200% !important; }")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Horizontal overflow at 200% zoom"
    enlarged.evaluate("node => node.remove()")

    events = page.evaluate("window.__operatorEvents || []")
    names = {event.get("event") for event in events}
    for event in ["operator_supplies_viewed", "operator_supply_search_submitted", "operator_supply_search_no_results", "operator_supply_added", "operator_supply_removed", "operator_supply_current_order_opened"]:
        assert event in names, f"Missing Supplies analytics event: {event}"
    payload = json.dumps(events).lower()
    for forbidden in ["operator typed private", "email", "unit_id", "invoice_id", "token", "payment"]:
        assert forbidden not in payload, f"Unsafe analytics field leaked: {forbidden}"

    Path("design-qa").mkdir(exist_ok=True)
    page.set_viewport_size({"width": 1280, "height": 844})
    page.screenshot(path="design-qa/supplies-production-qa-1280.png", full_page=False)
    print({"authenticatedRoute": page.url, "catalogCards": cards.count(), "events": sorted(names)})
    context.close()
    browser.close()
