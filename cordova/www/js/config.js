/*
    config.js — Cordova WWW configuration for API endpoints

    How it works:
    - There are three API modes stored in localStorage under key 'API_MODE':
            'local'  -> use relative paths (../php/) — good for running in browser with XAMPP/local server
            'remote' -> use REMOTE_API_BASE (must be configured) — good for device builds that call a central server
            'auto'   -> choose 'local' when running in browser (http/localhost), choose 'remote' when running from file:// (device)

    - By default mode is 'auto'. You can change it at runtime using setApiMode('local'|'remote'|'auto').
    - The app exposes: window.API_BASE (string), window.getApiUrl(endpoint) helper and setApiMode(mode).

    IMPORTANT: Replace REMOTE_API_BASE with your real server URL when you have the domain.
        Example: const REMOTE_API_BASE = 'https://mi-dominio.com/proyectoJardin-main/php/';

*/
(function(){
    // Default values — edit REMOTE_API_BASE when you have your domain/server ready
const REMOTE_API_BASE = 'http://192.168.0.14/proyectoJardin-main/php/';    
const LOCAL_RELATIVE = '../php/';

    // Read persisted mode or default to 'auto'
    function readMode() {
        try { return localStorage.getItem('API_MODE') || 'auto'; } catch(e) { return 'auto'; }
    }

    function writeMode(m) {
        try { localStorage.setItem('API_MODE', m); } catch(e) {}
    }

    // Determine API base given mode and runtime environment
    function resolveBase(mode) {
        if (mode === 'local') return LOCAL_RELATIVE;
        if (mode === 'remote') return REMOTE_API_BASE;
        // auto
        // If running from file:// (device) prefer remote, otherwise prefer local
        if (location.protocol === 'file:') return REMOTE_API_BASE;
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '') return LOCAL_RELATIVE;
        // otherwise, default to relative
        return LOCAL_RELATIVE;
    }

    function getApiBase() {
        const mode = readMode();
        const base = resolveBase(mode);
        return { mode, base, remote: REMOTE_API_BASE, local: LOCAL_RELATIVE };
    }

    // Public helpers
    window.getApiConfig = getApiBase; // returns {mode, base, remote, local}

    window.getApiUrl = function(endpoint) {
        const c = getApiBase();
        // ensure trailing slash on base
        const b = c.base.endsWith('/') ? c.base : c.base + '/';
        return b + endpoint;
    };

    // Synchronous accessor for legacy code: returns the current base URL string
    window.getBaseURL = function() {
        return window.API_BASE;
    };

    // Try to detect the best API base automatically (remote vs local).
    // This runs asynchronously and updates window.API_BASE if it finds a reachable remote.
    // It does NOT change the persisted API_MODE; it only adjusts the runtime base so
    // other scripts can benefit without needing to change stored mode.
    window.ensureBestApiBase = async function(timeoutMs = 1500) {
        try {
            const cfg = getApiBase();
            // Only attempt network probe when mode is 'auto' or when current base looks like remote
            if (cfg.mode !== 'auto') return cfg.base;

            // If running from file:// (device) prefer remote straight away
            if (location.protocol === 'file:') {
                window.API_BASE = cfg.remote;
                return window.API_BASE;
            }

            // Probe the remote endpoint with a small timeout using a light endpoint.
            const testEndpoint = 'test_connection.php';
            const url = cfg.remote.endsWith('/') ? cfg.remote + testEndpoint : cfg.remote + '/' + testEndpoint;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const r = await fetch(url, { method: 'GET', signal: controller.signal });
                clearTimeout(id);
                if (r.ok) {
                    window.API_BASE = cfg.remote;
                    console.info('ensureBestApiBase: remote reachable — using', window.API_BASE);
                    return window.API_BASE;
                }
            } catch (e) {
                // fallthrough to local
            }
            // fallback to local
            window.API_BASE = cfg.local;
            console.info('ensureBestApiBase: remote not reachable — falling back to', window.API_BASE);
            return window.API_BASE;
        } catch (e) {
            return window.API_BASE;
        }
    };

    window.setApiMode = function(mode) {
        if (!['local','remote','auto'].includes(mode)) throw new Error('Invalid API mode');
        writeMode(mode);
        // update global API_BASE for scripts that read it (legacy)
        const c = getApiBase();
        window.API_BASE = c.base;
        console.info('API mode set to', c.mode, ' — API base =', c.base);
        return c;
    };

    // Initialize API_BASE global (legacy scripts use window.API_BASE)
    const cfg = getApiBase();
    window.API_BASE = cfg.base;
    console.info('API config:', cfg);

    // Optional: small helper to test a single endpoint quickly (returns boolean)
    window.testApiEndpoint = async function(endpoint, timeoutMs = 3000) {
        const url = window.getApiUrl(endpoint);
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch(url, { method: 'GET', signal: controller.signal });
            clearTimeout(id);
            return res.ok;
        } catch (e) {
            return false;
        }
    };

})();
