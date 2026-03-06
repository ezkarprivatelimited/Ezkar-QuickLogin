// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'INITIATE_GST_LOGIN') {
        const { username, password } = message.payload;

        // Store temporarily with portal identifier
        chrome.storage.session.set({ pendingLogin: { username, password, portal: 'GST' } }).then(() => {
            console.log("Ezkar QuickLogin: Received credentials, opening GST portal...");

            // Open the new tab
            chrome.tabs.create({ url: 'https://services.gst.gov.in/services/login' });

            // Auto-clear credentials after 30 seconds
            setTimeout(() => {
                chrome.storage.session.remove('pendingLogin');
                console.warn("Ezkar QuickLogin: Timeout reached. Wiping pending credentials from session storage.");
            }, 30000);

            sendResponse({ success: true });
        });

        return true;
    }

    if (message.action === 'INITIATE_IT_LOGIN') {
        const { username, password } = message.payload;

        // Store temporarily with portal identifier
        chrome.storage.session.set({ pendingLogin: { username, password, portal: 'IT' } }).then(() => {
            console.log("Ezkar QuickLogin: Received credentials, opening IT portal...");

            // Open the new tab
            chrome.tabs.create({ url: 'https://eportal.incometax.gov.in/iec/foservices/#/login' });

            // Auto-clear
            setTimeout(() => {
                chrome.storage.session.remove('pendingLogin');
                console.warn("Ezkar QuickLogin: Timeout reached. Wiping pending credentials from session storage.");
            }, 30000);

            sendResponse({ success: true });
        });

        return true;
    }

    // The popup script will ask for the current status
    if (message.action === 'GET_STATUS') {
        chrome.storage.session.get(['pendingLogin']).then((result) => {
            const pendingLogin = result.pendingLogin;
            sendResponse({
                hasPending: !!pendingLogin,
                username: pendingLogin ? pendingLogin.username : null,
                portal: pendingLogin ? pendingLogin.portal : null
            });
        });
        return true;
    }

    if (message.action === 'CANCEL_LOGIN') {
        chrome.storage.session.remove('pendingLogin').then(() => {
            console.log("Ezkar QuickLogin: Pending login cancelled by user.");
            sendResponse({ success: true });
        });
        return true;
    }

    // The GST & IT Content Scripts will send this message when they're ready to fill the form
    if (message.action === 'GET_PENDING_CREDENTIALS') {
        chrome.storage.session.get(['pendingLogin']).then((result) => {
            const pendingLogin = result.pendingLogin;
            if (pendingLogin) {
                // Send the credentials back to the content script
                sendResponse({ success: true, payload: pendingLogin });

                // IMPORTANT SECURITY STEP: Wipe the variable from memory immediately
                chrome.storage.session.remove('pendingLogin').then(() => {
                    console.log("Ezkar QuickLogin: Credentials injected. Session Memory wiped.");
                });
            } else {
                sendResponse({ success: false, reason: "No pending login found." });
            }
        });
        return true;
    }

    // Unhandled messages
    return false;
});
