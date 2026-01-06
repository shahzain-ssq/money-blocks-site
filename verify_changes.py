from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        # Reduced motion is KEY to stopping infinite animations from blocking load
        browser = p.chromium.launch(
            headless=True,
            args=["--force-prefers-reduced-motion"]
        )
        context = browser.new_context(
            reduced_motion="reduce",
            forced_colors="active",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        print("Navigating to: file:///app/index.html")
        page.goto("file:///app/index.html")

        # Verify static elements
        try:
            page.get_by_text("Zero Risk").scroll_into_view_if_needed(timeout=2000)
            print("Zero Risk text found.")
        except Exception as e:
            print(f"Warning: Zero Risk text not found or scroll failed: {e}")

        try:
            page.get_by_text("Try breaking the market").scroll_into_view_if_needed(timeout=2000)
            print("Visual guidance doodle found.")
        except:
            print("Warning: Visual guidance not found.")

        # Trigger Crash
        trigger_btn = page.locator("#trigger-crash")
        trigger_btn.click()

        # Wait for transition
        time.sleep(1)

        # Check 'uh oh' note visibility
        crash_note = page.locator("#crash-note")
        opacity = crash_note.evaluate("el => getComputedStyle(el).opacity")
        print(f"Uh oh note opacity after crash: {opacity}")

        if float(opacity) > 0.5:
            print("SUCCESS: Crash note is visible.")
        else:
            print("FAILURE: Crash note is not visible.")

        page.screenshot(path="/home/jules/verification/crashed_state.png")

        # Stabilize
        stabilize_btn = page.locator("#stabilize-market")
        stabilize_btn.click()

        time.sleep(1)

        # Check 'calm' note
        calm_note = page.locator("#calm-note")
        opacity_calm = calm_note.evaluate("el => getComputedStyle(el).opacity")
        print(f"Calm note opacity after stabilize: {opacity_calm}")

        if float(opacity_calm) > 0.5:
             print("SUCCESS: Calm note is visible.")
        else:
             print("FAILURE: Calm note is not visible.")

        browser.close()

if __name__ == "__main__":
    run()
