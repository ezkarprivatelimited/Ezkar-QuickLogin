// background.js

// Variables to temporarily store credentials in memory
let pendingLogin = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'INITIATE_GST_LOGIN') {
        const { username, password } = message.payload;

        // Store temporarily with portal identifier
        pendingLogin = { username, password, portal: 'GST' };
        console.log("Ezkar QuickLogin: Received credentials, opening GST portal...");

        // Open the new tab
        chrome.tabs.create({ url: 'https://services.gst.gov.in/services/login' }, (tab) => {
            // We don't do anything immediately here; we wait for the content script
            // on the newly opened tab to ask for the credentials.
        });

        // Auto-clear credentials after 30 seconds just in case the process fails
        // or the user closes the tab before the injection happens.
        setTimeout(() => {
            if (pendingLogin) {
                console.warn("Ezkar QuickLogin: Timeout reached. Wiping pending credentials.");
                pendingLogin = null;
            }
        }, 30000);

        sendResponse({ success: true });
    }

    if (message.action === 'INITIATE_IT_LOGIN') {
        const { username, password } = message.payload;

        // Store temporarily with portal identifier
        pendingLogin = { username, password, portal: 'IT' };
        console.log("Ezkar QuickLogin: Received credentials, opening IT portal...");

        // Open the new tab
        chrome.tabs.create({ url: 'https://eportal.incometax.gov.in/iec/foservices/#/login' });

        // Auto-clear
        setTimeout(() => {
            if (pendingLogin) {
                console.warn("Ezkar QuickLogin: Timeout reached. Wiping pending credentials.");
                pendingLogin = null;
            }
        }, 30000);

        sendResponse({ success: true });
    }

    // The popup script will ask for the current status
    if (message.action === 'GET_STATUS') {
        sendResponse({
            hasPending: !!pendingLogin,
            username: pendingLogin ? pendingLogin.username : null,
            portal: pendingLogin ? pendingLogin.portal : null
        });
    }

    if (message.action === 'CANCEL_LOGIN') {
        pendingLogin = null;
        console.log("Ezkar QuickLogin: Pending login cancelled by user.");
        sendResponse({ success: true });
    }

    // The GST & IT Content Scripts will send this message when they're ready to fill the form
    if (message.action === 'GET_PENDING_CREDENTIALS') {
        if (pendingLogin) {
            // Send the credentials back to the content script
            sendResponse({ success: true, payload: pendingLogin });

            // IMPORTANT SECURITY STEP: Wipe the variable from memory immediately
            pendingLogin = null;
            console.log("Ezkar QuickLogin: Credentials injected. Memory wiped.");
        } else {
            sendResponse({ success: false, reason: "No pending login found." });
        }
    }

    // Required for async sendResponse
    return true;
});
