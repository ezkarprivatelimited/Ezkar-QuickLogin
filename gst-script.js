// gst-script.js
console.log("Ezkar QuickLogin: GST portal detected.");

function fillGstForm() {
    chrome.runtime.sendMessage({ action: 'GET_PENDING_CREDENTIALS' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Ezkar QuickLogin API error:", chrome.runtime.lastError.message);
            return;
        }

        if (response && response.success && response.payload) {
            const { username, password } = response.payload;

            // Selectors for the GST Portal (Double-checked structure)
            const usernameInput = document.querySelector('#username');
            const passwordInput = document.querySelector('#user_pass');
            const captchaInput = document.querySelector('#captcha');

            if (usernameInput && passwordInput) {
                // Fill the fields
                usernameInput.value = username;
                passwordInput.value = password;

                // Dispatch input events so React/Angular/Vue running on the page registers the change
                usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

                // GST Portal uses AngularJS (ng-model, etc.)
                // Dispatching blur helps trigger validation
                usernameInput.dispatchEvent(new Event('blur', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('blur', { bubbles: true }));

                console.log("Ezkar QuickLogin: Successfully injected credentials.");

                // Focus the captcha field for convenience
                if (captchaInput) {
                    captchaInput.focus();
                }

                // Notify the user after a brief delay to allow the browser to paint the input values visually
                setTimeout(() => {
                    alert("Ezkar QuickLogin: Credentials autofilled successfully!");
                }, 100);
            } else {
                console.warn("Ezkar QuickLogin: Form fields not found on the page.");
                // Sometimes the form loads dynamically. We might need to retry in a robust setup.
            }
        } else {
            console.log("Ezkar QuickLogin:", response ? response.reason : "No payload.");
        }
    });
}

// Check if document is already loaded or wait for it
if (document.readyState === "complete" || document.readyState === "interactive") {
    // Add a slight delay to ensure React/Angular on their end has attached
    setTimeout(fillGstForm, 1000);
} else {
    // Wait for the window to finish loading
    window.addEventListener('load', () => {
        setTimeout(fillGstForm, 1000);
    });
}
