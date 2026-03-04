# Ezkar QuickLogin

A Chrome extension designed to streamline logging into the GST portal directly from the Ezkar dashboard.

## What it does

This extension bridges the gap between our internal dashboard and the official GST portal. When a user clicks "Login to GST" on an assessee's profile, the extension:

1. Securely receives the GST login credentials from the dashboard.
2. Opens a new tab to the official GST portal login page.
3. Automatically injects the Username and Password into the login form.
4. Leaves the cursor in the CAPTCHA field so the user can quickly type it and hit enter.

## Security Considerations

- **No persistent storage:** Credentials are never saved to `localStorage`, `sessionStorage`, or `chrome.storage`. They are held in memory only for the fraction of a second it takes to pass them from the Dashboard to the GST portal.
- **Scope restriction:** The extension only has permission to run on our specific internal dashboard domain and the official `services.gst.gov.in` domain.
- **Internal Use Only:** This extension is meant to be loaded locally as an unpacked extension on employee machines and will not be published to the Chrome Web Store.

## Installation (Developer Mode)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle the **Developer mode** switch in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `Ezkar-QuickLogin` directory.
5. The extension should now be visible in your list of extensions.

## Architecture Flow

- **Dashboard Content Script:** Listens for a specific custom event (`AUTO_LOGIN_GST`) emitted by the React frontend and passes the payload to the background service worker.
- **Background Script:** Orchestrates the flow. It opens the designated GST portal URL, temporarily stores the credentials in memory, and waits for the new tab to be fully loaded.
- **Portal Content Script:** Wakes up on the GST portal, retrieves the credentials from the background script, fills in the login form, and immediately wipes the credentials from background memory.
