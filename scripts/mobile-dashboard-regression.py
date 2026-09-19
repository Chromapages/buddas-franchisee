import argparse
import base64
import hashlib
import hmac
import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


def signed_session(location_id="HNL-014", location_name="La'ie Origin Grill", managed=None, expires_in=3600, role="franchisee"):
    managed = managed or [location_id]
    payload = {
        "sessionId": f"regression-{location_id}",
        "userId": "regression-operator",
        "email": "regression@local.invalid",
        "displayName": "Regression Operator",
        "role": role,
        "locationId": location_id,
        "locationName": location_name,
        "managedLocationIds": managed,
        "expiresAt": int(time.time() * 1000) + expires_in * 1000,
    }
    encoded = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(hmac.new(b"local-development-portal-session-secret", encoded.encode(), hashlib.sha256).digest()).decode().rstrip("=")
    return f"{encoded}.{signature}"


def cart_cookie(location_id, quantity):
    return json.dumps({location_id: [{"sku": "PKG-RB12", "quantity": quantity}]}, separators=(",", ":"))


def add_session(context, base_url, **session):
    context.add_cookies([{"name": "buddas_portal_session", "value": signed_session(**session), "url": base_url, "httpOnly": True, "sameSite": "Lax"}])


def inspect_page(page):
    return page.evaluate("""() => {
      const visible = (element) => element && element.getClientRects().length > 0;
      const rect = (element) => element ? element.getBoundingClientRect() : null;
      const header = document.querySelector('.portal-shell-header');
      const locationBlock = document.querySelector('.portal-mobile-location');
      const cart = document.querySelector('.portal-header-cart');
      const nav = document.querySelector('.portal-mobile-tabbar');
      const smallTargets = [...document.querySelectorAll('a,button,input,select,textarea')]
        .filter(visible).map((el) => ({name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 50), ...rect(el)}))
        .filter((item) => item.width < 44 || item.height < 44);
      const resources = performance.getEntriesByType('resource').map((entry) => entry.name);
      return {
        url: window.location.href,
        title: document.title,
        viewport: [innerWidth, innerHeight],
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        headerOverlap: Boolean(visible(locationBlock) && cart && rect(locationBlock).right > rect(cart).left),
        header: rect(header), location: rect(locationBlock), cart: rect(cart), nav: rect(nav),
        locationText: locationBlock?.innerText || '',
        locationClippedOutsideHeader: Boolean(visible(locationBlock) && header && (rect(locationBlock).left < rect(header).left || rect(locationBlock).right > rect(header).right)),
        smallTargets,
        visibleLevelOneHeadings: [...document.querySelectorAll('h1,[role=heading][aria-level="1"]')].filter(visible).map((el) => el.textContent.trim()),
        devOverlay: Boolean(document.querySelector('#next-logo,[data-nextjs-toast],[data-next-badge-root]')),
        foodImages: resources.filter((url) => /buddas-(hero|about)|classic-budda-roll/i.test(url)),
        statusText: document.querySelector('.home-brief-status-stack')?.innerText || '',
        metrics: window.__operatorRegressionMetrics || {},
      };
    }""")


def install_metrics(context):
    context.add_init_script("""(() => {
      const metrics = { cls: 0, lcp: null, inp: null };
      window.__operatorRegressionMetrics = metrics;
      try { new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) metrics.cls += entry.value; }).observe({type:'layout-shift', buffered:true}); } catch {}
      try { new PerformanceObserver((list) => { const entries=list.getEntries(); if (entries.length) metrics.lcp=entries[entries.length-1].startTime; }).observe({type:'largest-contentful-paint', buffered:true}); } catch {}
      try { new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (entry.interactionId && (metrics.inp === null || entry.duration > metrics.inp)) metrics.inp=entry.duration; }).observe({type:'event', buffered:true, durationThreshold:16}); } catch {}
    })();""")


def open_dashboard(browser, base_url, viewport, output, name, session=None, cart_quantity=0, reduced_motion="no-preference"):
    context = browser.new_context(viewport=viewport, device_scale_factor=1, reduced_motion=reduced_motion)
    install_metrics(context)
    add_session(context, base_url, **(session or {}))
    if cart_quantity:
        location_id = (session or {}).get("location_id", "HNL-014")
        context.add_cookies([{"name": "buddas_portal_cart", "value": cart_cookie(location_id, cart_quantity), "url": base_url, "httpOnly": True, "sameSite": "Lax"}])
    page = context.new_page()
    page.goto(base_url + "/portal", wait_until="networkidle")
    page.screenshot(path=str(output / f"{name}.png"), full_page=True)
    result = inspect_page(page)
    result["scenario"] = name
    context.close()
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:3100")
    parser.add_argument("--output-dir", required=True)
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for width, height in [(320, 568), (360, 800), (366, 898), (390, 844), (393, 852), (430, 932), (568, 320), (667, 375)]:
            results.append(open_dashboard(browser, args.base_url, {"width": width, "height": height}, output, f"hnl-{width}x{height}", {"managed": ["HNL-014", "OAH-207", "SLC-302"]}))
        results.append(open_dashboard(browser, args.base_url, {"width": 390, "height": 844}, output, "slc-all-clear-single-location", {"location_id": "SLC-302", "location_name": "Sugar House Bakery & Grill", "managed": ["SLC-302"]}))
        results.append(open_dashboard(browser, args.base_url, {"width": 390, "height": 844}, output, "oah-single-location", {"location_id": "OAH-207", "location_name": "Kaka'ako Urban Kitchen", "managed": ["OAH-207"]}))
        results.append(open_dashboard(browser, args.base_url, {"width": 320, "height": 568}, output, "long-location", {"location_id": "HNL-014", "location_name": "La'ie Origin Restaurant Bakery and Community Grill", "managed": ["HNL-014"]}))
        results.append(open_dashboard(browser, args.base_url, {"width": 390, "height": 844}, output, "cart-one", {"managed": ["HNL-014"]}, 1))
        results.append(open_dashboard(browser, args.base_url, {"width": 390, "height": 844}, output, "cart-nine", {"managed": ["HNL-014"]}, 9))
        results.append(open_dashboard(browser, args.base_url, {"width": 390, "height": 844}, output, "reduced-motion", {"managed": ["HNL-014"]}, reduced_motion="reduce"))
        results.append(open_dashboard(browser, args.base_url, {"width": 195, "height": 422}, output, "browser-zoom-200", {"managed": ["HNL-014", "OAH-207", "SLC-302"]}))

        context = browser.new_context(viewport={"width": 390, "height": 844})
        install_metrics(context)
        add_session(context, args.base_url, managed=["HNL-014", "OAH-207", "SLC-302"])
        page = context.new_page()
        browser_errors = []
        page.on("pageerror", lambda error: browser_errors.append(str(error)))
        page.on("console", lambda message: browser_errors.append(f"console:{message.type}:{message.text}") if message.type == "error" else None)
        page.goto(args.base_url + "/portal", wait_until="networkidle")
        page.wait_for_timeout(750)
        page.locator(".portal-mobile-location .portal-location-trigger").click()
        page.screenshot(path=str(output / "multiple-location-selector.png"), full_page=True)
        page.keyboard.press("Escape")
        assert page.locator(".portal-mobile-location .portal-location-trigger").get_attribute("aria-expanded") == "false"
        assert page.evaluate("document.activeElement === document.querySelector('.portal-mobile-location .portal-location-trigger')")
        for _ in range(24):
            page.keyboard.press("Tab")
            page.wait_for_timeout(220)
            focus = page.evaluate("""() => { const e=document.activeElement; const r=e?.getBoundingClientRect(); const n=document.querySelector('.portal-mobile-tabbar')?.getBoundingClientRect(); const m=document.querySelector('#portal-main-content'); const s=getComputedStyle(e); return {name:e?.getAttribute('aria-label')||e?.textContent?.trim().slice(0,40), bottom:r?.bottom, navTop:n?.top, visible:!!r&&r.bottom<=innerHeight&&r.top>=0, obscured:!!r&&!!n&&r.bottom>n.top, mainContains:m?.contains(e), focusable:e?.matches('a,button,input,select,textarea,[tabindex]'), focusIndicator:(parseFloat(s.outlineWidth)>=2&&s.outlineStyle!=='none')||s.boxShadow!=='none'}; }""")
            if focus["obscured"]:
                focus["scroll"] = page.evaluate("""() => { const w=document.querySelector('.portal-shell-workspace'); const m=document.querySelector('.portal-shell-main'); return {windowY:scrollY, documentHeight:document.documentElement.scrollHeight, documentClient:document.documentElement.clientHeight, workspaceTop:w?.scrollTop, workspaceHeight:w?.scrollHeight, workspaceClient:w?.clientHeight, workspaceOverflow:getComputedStyle(w).overflowY, mainPaddingBottom:getComputedStyle(m).paddingBottom}; }""")
                focus["browserErrors"] = browser_errors
            assert not (focus["mainContains"] and focus["obscured"]), f"Focused main control hidden by navigation: {focus}"
            if focus["focusable"]:
                assert focus["focusIndicator"], f"Focused control has no visible indicator: {focus}"
        cdp_accessibility = context.new_cdp_session(page)
        ax_nodes = cdp_accessibility.send("Accessibility.getFullAXTree")["nodes"]
        ax_roles = [node.get("role", {}).get("value") for node in ax_nodes if not node.get("ignored")]
        ax_headings = [node.get("name", {}).get("value") for node in ax_nodes if not node.get("ignored") and node.get("role", {}).get("value") == "heading"]
        results.append({"scenario": "accessibility-tree", "mainCount": ax_roles.count("main"), "navigationCount": ax_roles.count("navigation"), "dashboardHeadingCount": ax_headings.count("Dashboard"), "statusCount": ax_roles.count("status")})
        assert ax_roles.count("main") == 1
        assert ax_headings.count("Dashboard") == 1
        context.set_offline(True)
        page.evaluate("window.dispatchEvent(new Event('offline'))")
        page.wait_for_timeout(100)
        page.screenshot(path=str(output / "offline-retained.png"), full_page=True)
        offline = inspect_page(page)
        offline["scenario"] = "offline-retained"
        results.append(offline)
        context.set_offline(False)
        page.evaluate("window.dispatchEvent(new Event('online'))")
        page.wait_for_timeout(100)
        page.screenshot(path=str(output / "background-refreshing.png"), full_page=False)
        background = inspect_page(page)
        background.update({"scenario": "background-refreshing", "loadingShell": page.locator('[aria-label="Loading operator workspace"]').count() > 0})
        results.append(background)
        page.wait_for_timeout(1000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(200)
        page.emulate_media(reduced_motion="reduce")
        reduced = page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        enlarged_style = page.add_style_tag(content="html{font-size:200%!important}")
        page.screenshot(path=str(output / "text-200-percent.png"), full_page=True)
        page.screenshot(path=str(output / "text-200-percent-viewport.png"), full_page=False)
        zoom_result = inspect_page(page)
        zoom_result.update({"scenario": "text-200-percent", "reducedMotion": reduced})
        results.append(zoom_result)
        enlarged_style.evaluate("element => element.remove()")
        page.add_style_tag(content="p,h1,h2,h3,span,a,button{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}")
        page.screenshot(path=str(output / "text-spacing.png"), full_page=True)
        spacing_result = inspect_page(page)
        spacing_result["scenario"] = "text-spacing"
        results.append(spacing_result)
        context.close()

        context = browser.new_context(viewport={"width": 390, "height": 844})
        install_metrics(context)
        add_session(context, args.base_url, managed=["HNL-014", "OAH-207", "SLC-302"])
        page = context.new_page()
        cdp = context.new_cdp_session(page)
        cdp.send("Network.enable")
        cdp.send("Network.emulateNetworkConditions", {
            "offline": False,
            "latency": 250,
            "downloadThroughput": 187500,
            "uploadThroughput": 93750,
            "connectionType": "cellular3g",
        })
        started = time.perf_counter()
        page.goto(args.base_url + "/portal", wait_until="domcontentloaded")
        page.screenshot(path=str(output / "slow-initial.png"), full_page=False)
        initial = inspect_page(page)
        initial.update({"scenario": "slow-initial", "loadingModules": page.locator('[data-dashboard-state="loading"]').count()})
        results.append(initial)
        page.wait_for_load_state("networkidle")
        slow = inspect_page(page)
        slow.update({"scenario": "slow-connection", "navigationMs": round((time.perf_counter() - started) * 1000), "resourceCount": page.evaluate("performance.getEntriesByType('resource').length")})
        results.append(slow)
        page.screenshot(path=str(output / "slow-connection.png"), full_page=True)
        context.close()

        for name, session in [
            ("expired-session", {"expires_in": -60}),
            ("unauthorized-location", {"location_id": "NO-ACCESS", "location_name": "Unauthorized", "managed": ["HNL-014"]}),
            ("insufficient-role", {"role": "viewer"}),
        ]:
            context = browser.new_context(viewport={"width": 390, "height": 844})
            install_metrics(context)
            add_session(context, args.base_url, **session)
            page = context.new_page()
            response = page.goto(args.base_url + "/portal", wait_until="networkidle")
            results.append({"scenario": name, "status": response.status if response else None, "url": page.url})
            context.close()

        context = browser.new_context(viewport={"width": 390, "height": 844})
        install_metrics(context)
        add_session(context, args.base_url, managed=["HNL-014", "OAH-207", "SLC-302"])
        page = context.new_page()
        page.goto(args.base_url + "/portal", wait_until="networkidle")
        page.get_by_role("button", name="More").click()
        assert page.get_by_role("dialog", name="More").is_visible()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.wait_for_timeout(100)
        results.append({
            "scenario": "more-resize-to-desktop",
            "dialogCount": page.get_by_role("dialog", name="More").count(),
            "mainInert": page.locator("#portal-main-content").get_attribute("inert") is not None,
            "headerInert": page.locator(".portal-shell-header").get_attribute("inert") is not None,
        })
        assert page.locator("#portal-main-content").get_attribute("inert") is None
        context.close()

        results.append(open_dashboard(browser, args.base_url, {"width": 1280, "height": 800}, output, "desktop-shared", {"managed": ["HNL-014", "OAH-207", "SLC-302"]}))
        browser.close()
    (output / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(str(output / "results.json"))


if __name__ == "__main__":
    main()
