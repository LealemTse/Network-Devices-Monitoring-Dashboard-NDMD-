const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

// --- AUTH UTILS ---
function getToken() {
    return localStorage.getItem("token");
}

function checkAuth() {
    if (!getToken()) {
        window.location.href = '/login.html';
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = '/login.html';
}

// --- THEME UTILS ---
function initTheme() {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
    const current = localStorage.getItem("theme") || "light";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
}

// --- NAVBAR ---
function renderNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = `
        <h2 class="logo">NDMD</h2>
        <div style="display: flex; align-items: center; gap: 20px;">
             <button id="theme-btn" class="theme-btn" title="Toggle Theme">🌙</button>
             <button class="menu-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
        </div>
        <ul class="nav-links">
           <li class="link"><a href="/index.html">Home</a></li>
           <li class="link"><a href="/dashboard.html">Dashboard</a></li>
           <li class="link"><a href="/logs.html">Logs</a></li>
           <li class="link"><a href="/settings.html">Settings</a></li>
           <li class="link"><button class="logout" onclick="logout()">Logout</button></li>
        </ul>
        <button class="logout desktop-only" onclick="logout()">Logout</button>
    `;

    // Insert at top of body
    document.body.prepend(nav);

    // Bind Theme Button
    const btn = document.getElementById('theme-btn');
    if (btn) {
        btn.onclick = () => {
            toggleTheme();
            btn.innerText = localStorage.getItem("theme") === 'light' ? '🌙' : '☀️';
        };
        btn.innerText = localStorage.getItem("theme") === 'light' ? '🌙' : '☀️';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    // Don't render navbar on login/forgot-pw pages
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('forgot-password')) {
        checkAuth();
        renderNavbar();
    }
});

// --- TOAST UTILS ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
