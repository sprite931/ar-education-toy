// PWA Installation Prompt
// Handles "Add to Home Screen" install prompt

let deferredPrompt;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt triggered');
    
    // DON'T prevent default - let Chrome show native banner immediately
    // e.preventDefault();
    
    // Stash the event for later custom use if needed
    deferredPrompt = e;
    
    console.log('[PWA] Native install banner will show automatically');
});

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
});

// Detect if running as installed PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[PWA] Running as installed app');
}

// Check for updates
if ('serviceWorker' in navigator) {
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
        if (confirm('Налична е нова версия на приложението. Презареди сега?')) {
            window.location.reload();
        }
    });
}

console.log('[PWA] Install handler loaded');
