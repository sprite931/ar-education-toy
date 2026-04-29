// PWA Installation Prompt
// Handles "Add to Home Screen" install prompt

let deferredPrompt;
let installButton;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt triggered');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install prompt after user starts AR
    showInstallPromotion();
});

// Show custom install UI
function showInstallPromotion() {
    // Only show if not already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] Already installed');
        return;
    }
    
    // Create install prompt after 30 seconds of use
    setTimeout(() => {
        if (!deferredPrompt) return;
        
        const installPrompt = document.createElement('div');
        installPrompt.id = 'install-prompt';
        installPrompt.innerHTML = `
            <div style="
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: slideUp 0.3s ease-out;
            ">
                <span style="font-size: 16px; font-weight: 600;">📲 Инсталирай приложението</span>
                <button id="install-btn" style="
                    background: rgba(255,255,255,0.2);
                    border: 2px solid white;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 15px;
                    font-weight: bold;
                    cursor: pointer;
                ">Инсталирай</button>
                <button id="dismiss-btn" style="
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0 5px;
                ">✕</button>
            </div>
        `;
        
        document.body.appendChild(installPrompt);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translateX(-50%); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Install button handler
        document.getElementById('install-btn').addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // Show the install prompt
            deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] User response:', outcome);
            
            // Clear the deferred prompt
            deferredPrompt = null;
            
            // Remove the prompt UI
            installPrompt.remove();
        });
        
        // Dismiss button handler
        document.getElementById('dismiss-btn').addEventListener('click', () => {
            installPrompt.remove();
            
            // Don't show again for 7 days
            localStorage.setItem('pwa-install-dismissed', Date.now());
        });
    }, 30000); // Show after 30 seconds
}

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Hide any install prompts
    const prompt = document.getElementById('install-prompt');
    if (prompt) prompt.remove();
});

// Detect if running as installed PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[PWA] Running as installed app');
    
    // Track analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_installed', {
            event_category: 'PWA',
            event_label: 'App Running'
        });
    }
}

// Check for updates
if ('serviceWorker' in navigator) {
    // Check for service worker updates every 60 seconds
    setInterval(() => {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) reg.update();
        });
    }, 60000);
}

// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New version available');
        
        // Show update notification
        if (confirm('Налична е нова версия на приложението. Презареди сега?')) {
            window.location.reload();
        }
    });
}

console.log('[PWA] Install handler loaded');