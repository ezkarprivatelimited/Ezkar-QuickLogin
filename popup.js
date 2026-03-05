document.addEventListener('DOMContentLoaded', () => {
    const statusBadge = document.getElementById('status-badge');
    const detailsMsg = document.getElementById('details-msg');
    const usernameCard = document.getElementById('username-card');
    const usernameVal = document.getElementById('username-val');
    const actionBtn = document.getElementById('action-btn');

    function checkStatus() {
        chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
            if (response && response.hasPending) {
                // UI for when there is a pending login
                statusBadge.textContent = 'Ready';
                statusBadge.className = 'status-badge ready';

                const portalName = response.portal === 'IT' ? 'Income Tax' : 'GST';

                detailsMsg.innerHTML = `Credentials safely loaded in memory.<br/>Waiting for the <strong>${portalName} Portal</strong> tab to open...`;

                usernameCard.classList.add('visible');
                usernameVal.textContent = response.username;

                actionBtn.textContent = 'Cancel Auto-Login';
                actionBtn.className = 'btn btn-cancel';

                // Add cancel logic
                actionBtn.onclick = () => {
                    chrome.runtime.sendMessage({ action: 'CANCEL_LOGIN' }, () => {
                        checkStatus(); // Refresh UI
                    });
                };
            } else {
                // UI for Idle state
                statusBadge.textContent = 'Standing By';
                statusBadge.className = 'status-badge idle';

                detailsMsg.innerHTML = 'No pending credentials found. Please click <strong>"Login"</strong> from your Ezkar Dashboard to initiate auto-login.';

                usernameCard.classList.remove('visible');
                usernameVal.textContent = '---';

                actionBtn.textContent = 'Open Dashboard';
                actionBtn.className = 'btn';

                // Open dashboard link logic
                actionBtn.onclick = () => {
                    chrome.tabs.create({ url: 'http://localhost:5173/' });
                    // NOTE: You can change the URL to your production domain once deployed
                };
            }
        });
    }

    // Initial check when popup opens
    checkStatus();
});
