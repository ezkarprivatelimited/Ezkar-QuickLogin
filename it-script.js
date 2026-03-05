// it-script.js
console.log("Ezkar QuickLogin: IT portal detected.");

function loginFlowIT(username, password) {
    let step = 1;
    let observer = null;

    // Safety timeout to clean up observer
    const safetyTimeout = setTimeout(() => {
        if (observer) observer.disconnect();
        console.warn("Ezkar QuickLogin: IT login script timed out waiting for DOM elements.");
    }, 25000);

    const checkDomAndInject = () => {
        if (step === 1) {
            const panInput = document.querySelector('input[id="panAdhaarUserId"]');
            const continueBtns = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.trim().toLowerCase().includes('continue'));
            const continueBtn = continueBtns[0];

            if (panInput && continueBtn && !panInput.disabled) {
                // Ensure we don't repeatedly trigger step 1
                step = 1.5;

                panInput.value = username;
                panInput.dispatchEvent(new Event('input', { bubbles: true }));
                panInput.dispatchEvent(new Event('change', { bubbles: true }));
                panInput.dispatchEvent(new Event('blur', { bubbles: true }));

                console.log("Ezkar QuickLogin: Injected PAN (Step 1). Clicking Continue.");

                setTimeout(() => {
                    continueBtn.click();
                    step = 2; // Arm for step 2
                }, 400);
            }
        }
        else if (step === 2) {
            const pswdInput = document.querySelector('input[type="password"]');
            const authCheckbox = document.querySelector('input[type="checkbox"]');

            // Wait until the password field is fully interactive
            if (pswdInput && authCheckbox && !pswdInput.disabled && pswdInput.offsetParent !== null) {
                step = 3; // Done

                if (observer) observer.disconnect();
                clearTimeout(safetyTimeout);

                // Check the consent box
                authCheckbox.checked = true;
                authCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

                // Insert Password
                pswdInput.value = password;
                pswdInput.dispatchEvent(new Event('input', { bubbles: true }));
                pswdInput.dispatchEvent(new Event('change', { bubbles: true }));
                pswdInput.dispatchEvent(new Event('blur', { bubbles: true }));

                console.log("Ezkar QuickLogin: Injected Password and secure checkbox. Ready for manual finalization.");

                // Focus the login button for the user
                setTimeout(() => {
                    const loginBtns = Array.from(document.querySelectorAll('button[type="submit"], button.large-button-primary'));
                    if (loginBtns.length > 0) loginBtns[loginBtns.length - 1].focus();
                }, 300);
            }
        }
    };

    // 1. Initial check immediately
    checkDomAndInject();

    // 2. Set up MutationObserver to watch for React/Angular rendering new parts of the form
    observer = new MutationObserver((mutations) => {
        checkDomAndInject();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true, // Watch for 'disabled' attribute removals
        attributeFilter: ['disabled', 'style', 'class']
    });
}

function initITLogin() {
    chrome.runtime.sendMessage({ action: 'GET_PENDING_CREDENTIALS' }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Ezkar QuickLogin API error:", chrome.runtime.lastError.message);
            return;
        }

        if (response && response.success && response.payload && response.payload.portal === 'IT') {
            const { username, password } = response.payload;
            loginFlowIT(username, password);
        } else {
            console.log("Ezkar QuickLogin: No pending IT credentials found.");
        }
    });
}

// Start sequence
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initITLogin, 1000);
} else {
    window.addEventListener('load', () => { setTimeout(initITLogin, 1000); });
}
