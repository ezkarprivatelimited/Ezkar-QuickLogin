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

            // Check if this is actually an MFA/OTP screen instead of a password screen
            // IT portal usually has text like "Select an option to authenticate" or radio buttons for OTP
            const isOtpScreen = document.body.innerText.toLowerCase().includes('otp') ||
                document.querySelector('input[type="radio"]') !== null;

            if (isOtpScreen && !pswdInput) {
                step = 3; // Done
                if (observer) observer.disconnect();
                clearTimeout(safetyTimeout);

                console.warn("Ezkar QuickLogin: Detected MFA/OTP selection screen instead of a password field. Bailing out of auto-password injection.");
                setTimeout(() => {
                    alert("Ezkar QuickLogin: PAN inserted! This account has Extra Security (OTP) enabled. Please complete the login manually.");
                }, 100);
            }
            // Wait until the password field is fully interactive for the standard flow
            else if (pswdInput && authCheckbox && !pswdInput.disabled && pswdInput.offsetParent !== null) {
                step = 3; // Done

                if (observer) observer.disconnect();
                clearTimeout(safetyTimeout);

                // Insert Password
                pswdInput.value = password;
                pswdInput.dispatchEvent(new Event('input', { bubbles: true }));
                pswdInput.dispatchEvent(new Event('change', { bubbles: true }));
                pswdInput.dispatchEvent(new Event('blur', { bubbles: true }));

                console.log("Ezkar QuickLogin: Injected Password. User must manually confirm the secure access message checkbox.");

                // Focus the checkbox for the user to easily check it
                setTimeout(() => {
                    authCheckbox.focus();
                    const loginBtns = Array.from(document.querySelectorAll('button[type="submit"], button.large-button-primary'));
                    if (loginBtns.length > 0) loginBtns[loginBtns.length - 1].focus();

                    // Notify the user after allowing the UI to paint
                    setTimeout(() => {
                        alert("Ezkar QuickLogin: Credentials autofilled successfully! Now check the secure access message checkbox and click continue.");
                    }, 500); // 500ms for safety paint
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
