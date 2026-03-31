/**
 * layout.js — Injects shared sidebar + topbar HTML
 * Include AFTER app.js on every page except login.html
 */

function injectLayout(pageTitle) {
  const navItems = [
    { href: 'dashboard.html', icon: 'fa-gauge-high',   label: 'Dashboard' },
    { href: 'listrik.html',   icon: 'fa-bolt',          label: 'Listrik' },
    { href: 'internet.html',  icon: 'fa-wifi',          label: 'Internet' },
    { href: 'profil.html',    icon: 'fa-school',        label: 'Profil Sekolah' },
    { href: 'laporan.html',   icon: 'fa-file-export',   label: 'Laporan & Export' },
  ];

  const current = window.location.pathname.split('/').pop();

  const navHtml = navItems.map(n => `
    <a href="${n.href}" class="nav-link ${current===n.href?'active':''}">
      <i class="fas ${n.icon}"></i>
      <span>${n.label}</span>
    </a>
  `).join('');

  const sidebar = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo"><i class="fas fa-bolt"></i></div>
      <div>
        <div class="sidebar-title">SiPeLis</div>
        <div class="sidebar-sub">Dashboard Sekolah</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">MENU UTAMA</div>
      ${navHtml}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar"><i class="fas fa-user"></i></div>
        <div>
          <div class="user-name" id="userName">Admin</div>
          <div class="user-role">Administrator</div>
        </div>
      </div>
      <button class="btn-logout" onclick="logout()" title="Keluar">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </aside>
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>`;

  const topbar = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="hamburger" id="hamburger" onclick="toggleSidebar()">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="page-title">${pageTitle}</h1>
    </div>
    <div class="topbar-right">
      <div class="topbar-date">${new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
    </div>
  </header>`;

  // Create wrapper
  const originalBody = document.body.innerHTML;
  document.body.innerHTML = `
    <div class="app-shell">
      ${sidebar}
      <div class="main-area">
        ${topbar}
        <main class="main-content" id="mainContent">
          ${originalBody}
        </main>
      </div>
    </div>
  `;

  injectLayoutStyles();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

function injectLayoutStyles() {
  const s = document.createElement('style');
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    :root {
      --blue-900: #0f2a5e;
      --blue-700: #1a4096;
      --blue-600: #1d4ed8;
      --blue-500: #2563eb;
      --blue-400: #3b82f6;
      --blue-100: #dbeafe;
      --blue-50:  #eff6ff;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-500: #64748b;
      --slate-400: #94a3b8;
      --slate-300: #cbd5e1;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50:  #f8fafc;
      --white: #ffffff;
      --accent: #06b6d4;
      --success: #10b981;
      --warning: #f59e0b;
      --danger:  #ef4444;
      --sidebar-w: 260px;
    }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--slate-100); color: var(--slate-700); }
    .app-shell { display:flex; min-height:100vh; }

    /* SIDEBAR */
    .sidebar {
      width: var(--sidebar-w);
      background: linear-gradient(180deg, var(--blue-900) 0%, #162d6b 100%);
      display: flex; flex-direction: column;
      position: fixed; top:0; left:0; bottom:0; z-index:200;
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .sidebar-overlay {
      display:none; position:fixed; inset:0; z-index:199;
      background:rgba(0,0,0,0.4);
    }
    .sidebar-overlay.visible { display:block; }
    .sidebar-brand {
      padding: 22px 20px;
      display: flex; align-items:center; gap:12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sidebar-logo {
      width:42px; height:42px;
      background: linear-gradient(135deg, var(--blue-500), var(--accent));
      border-radius:12px;
      display:flex; align-items:center; justify-content:center;
      font-size:18px; color:white; flex-shrink:0;
    }
    .sidebar-title { font-size:1.1rem; font-weight:800; color:white; }
    .sidebar-sub { font-size:0.7rem; color:rgba(255,255,255,0.45); margin-top:1px; }
    .sidebar-nav { flex:1; padding:16px 12px; overflow-y:auto; }
    .nav-section {
      font-size:0.65rem; font-weight:700; letter-spacing:1px;
      color:rgba(255,255,255,0.3); padding:0 8px 8px;
      text-transform:uppercase; margin-top:8px;
    }
    .nav-link {
      display:flex; align-items:center; gap:12px;
      padding:11px 14px; border-radius:10px;
      color:rgba(255,255,255,0.65); text-decoration:none;
      font-size:0.875rem; font-weight:500;
      transition:all 0.2s; margin-bottom:2px;
    }
    .nav-link i { width:18px; text-align:center; font-size:0.9rem; }
    .nav-link:hover { background:rgba(255,255,255,0.08); color:white; }
    .nav-link.active {
      background: linear-gradient(135deg, rgba(37,99,235,0.8), rgba(59,130,246,0.6));
      color:white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .sidebar-footer {
      padding:16px; border-top:1px solid rgba(255,255,255,0.08);
      display:flex; align-items:center; gap:10px;
    }
    .sidebar-user { flex:1; display:flex; align-items:center; gap:10px; min-width:0; }
    .user-avatar {
      width:34px; height:34px; border-radius:10px;
      background:rgba(255,255,255,0.1);
      display:flex; align-items:center; justify-content:center;
      color:rgba(255,255,255,0.7); font-size:14px; flex-shrink:0;
    }
    .user-name { font-size:0.8rem; font-weight:700; color:white; }
    .user-role { font-size:0.68rem; color:rgba(255,255,255,0.4); }
    .btn-logout {
      width:32px; height:32px; border-radius:8px;
      background:rgba(239,68,68,0.15);
      border:none; color:rgba(239,68,68,0.8);
      cursor:pointer; transition:all 0.2s;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
    }
    .btn-logout:hover { background:rgba(239,68,68,0.3); color:#ef4444; }

    /* MAIN AREA */
    .main-area {
      flex:1;
      margin-left: var(--sidebar-w);
      display:flex; flex-direction:column; min-height:100vh;
    }

    /* TOPBAR */
    .topbar {
      background:white; border-bottom:1px solid var(--slate-200);
      padding:0 28px; height:64px;
      display:flex; align-items:center; justify-content:space-between;
      position:sticky; top:0; z-index:100;
      box-shadow:0 1px 4px rgba(0,0,0,0.06);
    }
    .topbar-left { display:flex; align-items:center; gap:14px; }
    .hamburger {
      display:none; width:36px; height:36px;
      background:var(--slate-100); border:none; border-radius:8px;
      cursor:pointer; font-size:1rem; color:var(--slate-600);
      align-items:center; justify-content:center;
    }
    .page-title { font-size:1.1rem; font-weight:700; color:var(--slate-800); }
    .topbar-right { display:flex; align-items:center; gap:16px; }
    .topbar-date { font-size:0.78rem; color:var(--slate-500); }

    /* MAIN CONTENT */
    .main-content { padding:28px; flex:1; }

    /* CARDS */
    .card {
      background:white; border-radius:16px;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
      border:1px solid var(--slate-200);
    }
    .card-header {
      padding:20px 24px; border-bottom:1px solid var(--slate-100);
      display:flex; align-items:center; justify-content:space-between;
    }
    .card-title { font-size:1rem; font-weight:700; color:var(--slate-800); }
    .card-body { padding:24px; }

    /* STAT CARDS */
    .stat-card {
      background:white; border-radius:16px; padding:22px;
      border:1px solid var(--slate-200);
      box-shadow:0 2px 8px rgba(0,0,0,0.05);
      display:flex; align-items:flex-start; justify-content:space-between;
    }
    .stat-icon {
      width:48px; height:48px; border-radius:14px;
      display:flex; align-items:center; justify-content:center;
      font-size:1.2rem; flex-shrink:0;
    }
    .stat-icon.blue  { background:var(--blue-100); color:var(--blue-600); }
    .stat-icon.green { background:#d1fae5; color:#059669; }
    .stat-icon.amber { background:#fef3c7; color:#d97706; }
    .stat-icon.red   { background:#fee2e2; color:#dc2626; }
    .stat-icon.cyan  { background:#cffafe; color:#0891b2; }
    .stat-label { font-size:0.78rem; color:var(--slate-500); font-weight:500; }
    .stat-value { font-size:1.45rem; font-weight:800; color:var(--slate-800); margin:6px 0 4px; line-height:1; }
    .stat-sub   { font-size:0.72rem; color:var(--slate-400); }

    /* GRID */
    .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
    .grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; }
    .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
    .gap-20 { margin-bottom:20px; }
    .gap-24 { margin-bottom:24px; }

    /* TABLES */
    .table-toolbar {
      display:flex; gap:12px; align-items:center;
      padding:16px 20px; border-bottom:1px solid var(--slate-100);
      flex-wrap:wrap;
    }
    .search-input {
      flex:1; min-width:200px;
      padding:9px 14px 9px 38px; border:1px solid var(--slate-200);
      border-radius:10px; font-family:inherit; font-size:0.875rem;
      color:var(--slate-700); outline:none;
      background: var(--slate-50) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .search-input:focus { border-color:var(--blue-400); box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; font-size:0.875rem; }
    thead th {
      padding:12px 16px; text-align:left;
      background:var(--slate-50); color:var(--slate-600);
      font-size:0.75rem; font-weight:700; letter-spacing:0.3px;
      text-transform:uppercase;
      border-bottom:1px solid var(--slate-200);
      cursor:pointer; user-select:none; white-space:nowrap;
    }
    thead th:hover { color:var(--blue-600); }
    tbody tr { border-bottom:1px solid var(--slate-100); transition:background 0.15s; }
    tbody tr:last-child { border-bottom:none; }
    tbody tr:hover { background:var(--blue-50); }
    tbody td { padding:13px 16px; color:var(--slate-700); vertical-align:middle; }
    .badge {
      display:inline-flex; align-items:center; padding:3px 10px;
      border-radius:20px; font-size:0.72rem; font-weight:600;
    }
    .badge-blue   { background:var(--blue-100); color:var(--blue-700); }
    .badge-green  { background:#d1fae5; color:#065f46; }
    .badge-amber  { background:#fef3c7; color:#92400e; }
    .badge-red    { background:#fee2e2; color:#991b1b; }
    .badge-gray   { background:var(--slate-100); color:var(--slate-600); }

    /* BUTTONS */
    .btn {
      display:inline-flex; align-items:center; gap:7px;
      padding:9px 18px; border-radius:10px;
      font-family:inherit; font-size:0.875rem; font-weight:600;
      cursor:pointer; border:none; transition:all 0.15s;
    }
    .btn-primary { background:var(--blue-500); color:white; }
    .btn-primary:hover { background:var(--blue-600); box-shadow:0 4px 12px rgba(37,99,235,0.3); }
    .btn-success { background:var(--success); color:white; }
    .btn-success:hover { background:#059669; }
    .btn-danger  { background:var(--danger); color:white; }
    .btn-danger:hover  { background:#dc2626; }
    .btn-outline {
      background:white; color:var(--slate-600);
      border:1px solid var(--slate-200);
    }
    .btn-outline:hover { background:var(--slate-50); border-color:var(--slate-300); }
    .btn-sm { padding:6px 12px; font-size:0.8rem; border-radius:8px; }
    .btn-icon {
      width:32px; height:32px; padding:0;
      border-radius:8px; justify-content:center;
    }

    /* FORMS */
    .form-grid { display:grid; gap:18px; }
    .form-grid-2 { grid-template-columns:1fr 1fr; }
    .form-grid-3 { grid-template-columns:1fr 1fr 1fr; }
    .form-group label {
      display:block; font-size:0.78rem; font-weight:600;
      color:var(--slate-600); margin-bottom:7px;
      text-transform:uppercase; letter-spacing:0.3px;
    }
    .form-control {
      width:100%; padding:10px 14px;
      border:1.5px solid var(--slate-200); border-radius:10px;
      font-family:inherit; font-size:0.9rem; color:var(--slate-700);
      background:var(--white); outline:none;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .form-control:focus {
      border-color:var(--blue-400);
      box-shadow:0 0 0 3px rgba(59,130,246,0.1);
    }
    select.form-control { cursor:pointer; }

    /* LOADING OVERLAY */
    .loading-overlay {
      display:none; position:fixed; inset:0; z-index:9998;
      background:rgba(255,255,255,0.75); backdrop-filter:blur(4px);
      align-items:center; justify-content:center; flex-direction:column; gap:14px;
    }
    .loading-overlay.show { display:flex; }
    .loader {
      width:44px; height:44px;
      border:3px solid var(--blue-100);
      border-top-color:var(--blue-500);
      border-radius:50%; animation:spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
    .loader-text { font-size:0.875rem; color:var(--slate-500); font-weight:500; }

    /* SECTION TITLE */
    .section-title {
      font-size:1.5rem; font-weight:800; color:var(--slate-800);
      margin-bottom:6px;
    }
    .section-sub { font-size:0.875rem; color:var(--slate-500); margin-bottom:24px; }

    /* RESPONSIVE */
    @media (max-width: 1024px) {
      .grid-4 { grid-template-columns:repeat(2,1fr); }
      .grid-3 { grid-template-columns:repeat(2,1fr); }
    }
    @media (max-width: 768px) {
      .sidebar { transform:translateX(-100%); }
      .sidebar.open { transform:translateX(0); }
      .main-area { margin-left:0; }
      .hamburger { display:flex; }
      .grid-4, .grid-3, .grid-2 { grid-template-columns:1fr; }
      .main-content { padding:18px; }
      .topbar { padding:0 16px; }
      .form-grid-2, .form-grid-3 { grid-template-columns:1fr; }
    }
  `;
  document.head.appendChild(s);
}
