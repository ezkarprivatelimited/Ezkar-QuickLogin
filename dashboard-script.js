// dashboard-script.js
console.log("Ezkar QuickLogin content script loaded on dashboard.");

// Listen for the custom event dispatched by the React application
window.addEventListener('AUTO_LOGIN_GST', (event) => {
    const { username, password } = event.detail;

    if (!username || !password) {
        console.error("Ezkar QuickLogin: Missing username or password in event detail");
        return;
    }

    // Send the credentials to the background script
    chrome.runtime.sendMessage({
        action: 'INITIATE_GST_LOGIN',
        payload: { username, password }
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Ezkar QuickLogin:", chrome.runtime.lastError);
            return;
        }
        console.log("Ezkar QuickLogin: Credentials securely sent to extension background.");
    });
});

window.addEventListener('AUTO_LOGIN_IT', (event) => {
    const { username, password } = event.detail;

    if (!username || !password) {
        console.error("Ezkar QuickLogin: Missing PAN (username) or password in event detail for IT");
        return;
    }

    // Send the credentials to the background script
    chrome.runtime.sendMessage({
        action: 'INITIATE_IT_LOGIN',
        payload: { username, password }
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Ezkar QuickLogin:", chrome.runtime.lastError);
            return;
        }
        console.log("Ezkar QuickLogin: IT credentials securely sent to extension background.");
    });
});
