
import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to capture more content
        context = browser.new_context(viewport={'width': 1280, 'height': 2000})
        page = context.new_page()

        # Load the index file
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Create verification directory
        output_dir = os.path.abspath("verification")
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        print(f"Output directory: {output_dir}")

        # 1. Screenshot Hero Section
        print("Capturing Hero Section...")
        page.screenshot(path=os.path.join(output_dir, "hero_section.png"))

        # 2. Screenshot Trust Strip (specifically targeting the container)
        print("Capturing Trust Strip...")
        trust_strip = page.locator('.trust-strip')
        if trust_strip.count() > 0:
            trust_strip.screenshot(path=os.path.join(output_dir, "trust_strip.png"))
        else:
            print("Trust strip not found!")

        # 3. Screenshot Manager Panel
        print("Capturing Manager Panel...")
        manager_panel = page.locator('.manager-panel')
        if manager_panel.count() > 0:
            manager_panel.scroll_into_view_if_needed()
            manager_panel.screenshot(path=os.path.join(output_dir, "manager_panel.png"))

            # 4. Interact: Toggle "Freeze Trades"
            print("Toggling Freeze Trades...")
            freeze_toggle = manager_panel.locator('[data-toggle="freeze"]')
            if freeze_toggle.count() > 0:
                freeze_toggle.click()
                # Wait for animation/transition
                page.wait_for_timeout(1000)
                manager_panel.screenshot(path=os.path.join(output_dir, "manager_panel_frozen.png"))
            else:
                print("Freeze toggle not found!")
        else:
            print("Manager panel not found!")

        browser.close()

if __name__ == "__main__":
    run()
