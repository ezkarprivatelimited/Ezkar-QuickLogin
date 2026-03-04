# Ezkar QuickLogin

An internal Chrome extension built specifically for the Ezkar Dashboard (`*.ezkar.in`). It bridges the gap between our internal dashboard and the official GST portal by securely passing dynamically decrypted credentials between tabs, allowing for seamless one-click logins.

## Features

- **Push-to-Login:** Clicking the `Login to GST` button on the Assessee Details modal opens the GST portal and autofills the username and password.
- **AngularJS Support:** The extension natively dispatches `blur`, `input`, and `change` events during credential injection to properly trigger the GST portal's AngularJS validation state.
- **Session-Based Security:** Credentials are never written to disk (`localStorage` or `chrome.storage`). They are held entirely in the background Service Worker's active memory.
- **Auto Cleanup:** If the user clicks login but closes the target tab, or if injection fails, credentials are automatically wiped from memory after 30 seconds.
- **Status UI:** Clicking the extension icon in the Chrome toolbar opens a popup UI displaying the current credential state (Ready/Idle) and the target username, giving users the ability to cancel an accidental auto-login.

## Architecture

1. **Host App (`dashboard-script.js`)**: Runs on `localhost:5173` and `*.ezkar.in`. Listens for a custom window event (`AUTO_LOGIN_GST`) dispatched by our React frontend and forwards the payload to the background script.
2. **Orchestrator (`background.js`)**: Actively manages the target URL tab creation, holds the decrypted credentials in memory, and responds to polling from the GST script and the UI popup.
3. **Injector (`gst-script.js`)**: Wakes up only on `services.gst.gov.in`. Requests payload from the background script, identifies the Angular inputs (`#username`, `#user_pass`), injects the values, forces Angular rendering, and focuses the `#captcha` input.

## Installation (Developer Mode)

Because this extension operates on sensitive decrypted credentials, it is **not published** to the Chrome Web Store. It must be sideloaded.

1. Clone or download this directory.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle the **Developer mode** switch in the top right.
4. Click **Load unpacked** and select the `Ezkar-QuickLogin` folder.
