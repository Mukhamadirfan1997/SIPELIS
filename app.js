/**
 * SiPeLis — app.js
 * Shared utilities, auth guard, Google Apps Script integration
 * ─────────────────────────────────────────────────────────────
 * SETUP:
 *   1. Deploy Google Apps Script as Web App (see template below)
 *   2. GAS_URL otomatis tersimpan di localStorage
 *   3. All pages auto-import this script
 */

// ── CONFIG ────────────────────────────────────────────────────
// Default URL GAS — akan di-override jika user sudah set di Dashboard/Profil
const DEFAULT_GAS_URL =
  "https://script.google.com/macros/s/AKfycbzVaXNpbWCur65u8Fbx3bP2KmeFt2INZ4AFBWDThcK39zfzT7YeKhoqz_-uSEcvCQQ/exec";
const GAS_URL = localStorage.getItem("gasUrl") || DEFAULT_GAS_URL;
// Demo data flag (true = use local demo data when GAS fails)
const DEMO_MODE = true;

// Auto-set URL ke localStorage jika belum ada
if (!localStorage.getItem("gasUrl")) {
  localStorage.setItem("gasUrl", DEFAULT_GAS_URL);
}

// ── AUTH GUARD ────────────────────────────────────────────────
function requireLogin() {
  if (!sessionStorage.getItem("siPelisUser")) {
    window.location.href = "login.html";
  }
}
function logout() {
  sessionStorage.removeItem("siPelisUser");
  window.location.href = "login.html";
}
function getUser() {
  return sessionStorage.getItem("siPelisUser") || "Admin";
}

// ── GAS API ───────────────────────────────────────────────────
async function gasGet(sheet) {
  try {
    const res = await fetch(
      `${GAS_URL}?action=get&sheet=${encodeURIComponent(sheet)}`,
    );
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (e) {
    if (DEMO_MODE) return getDemoData(sheet);
    throw e;
  }
}

async function gasPost(sheet, data) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet, data }),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (e) {
    if (DEMO_MODE) {
      // Save to localStorage as demo
      const key = `demo_${sheet}`;
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push({ ...data, _id: Date.now() });
      localStorage.setItem(key, JSON.stringify(arr));
      return { success: true, demo: true };
    }
    throw e;
  }
}

// ── UPDATE: Hapus data lama, insert ulang (untuk profil) ──────
async function gasUpdate(sheet, data) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", sheet, data }),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (e) {
    if (DEMO_MODE) {
      localStorage.setItem(`demo_${sheet}`, JSON.stringify([data]));
      return { success: true, demo: true };
    }
    throw e;
  }
}

// ── DELETE: Hapus baris dari Spreadsheet berdasarkan key ──────
async function gasDelete(sheet, key, value) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", sheet, key, value }),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (e) {
    if (DEMO_MODE) {
      // Remove from localStorage demo data
      const storageKey = `demo_${sheet}`;
      const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const filtered = arr.filter((r) => String(r[key]) !== String(value));
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return { success: true, demo: true };
    }
    throw e;
  }
}

// ── DEMO DATA ─────────────────────────────────────────────────
function getDemoData(sheet) {
  const local = localStorage.getItem(`demo_${sheet}`);
  if (local) return JSON.parse(local);

  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  if (sheet === "listrik") {
    return bulan.slice(0, 8).map((b, i) => ({
      no: i + 1,
      sekolah: "SDN Maju Bersama",
      id_pelanggan: "531234567890",
      bulan: b,
      jenis: i % 2 === 0 ? "Pascabayar" : "Prabayar",
      spj: 850000 + i * 50000,
      realisasi: 820000 + i * 48000,
      admin: 5000,
      selisih: 850000 + i * 50000 - (820000 + i * 48000),
    }));
  }
  if (sheet === "internet") {
    return bulan.slice(0, 8).map((b, i) => ({
      no: i + 1,
      sekolah: "SDN Maju Bersama",
      id_pelanggan: "INT-0012345",
      bulan: b,
      spj: 350000,
      realisasi: 345000,
      admin: 2500,
      selisih: 5000,
    }));
  }
  if (sheet === "profil") {
    return [
      {
        nama: "SDN Maju Bersama",
        npsn: "12345678",
        alamat: "Jl. Pendidikan No.1, Bondowoso, Jawa Timur",
        kepsek: "Drs. Ahmad Sudirman, M.Pd",
        tahun: "2024",
      },
    ];
  }
  return [];
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
function toast(msg, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.cssText =
      "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };
  t.style.cssText = `
    background:white; border-left:4px solid ${colors[type]};
    padding:14px 18px; border-radius:10px;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);
    font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem;
    display:flex; align-items:center; gap:10px;
    animation:slideInRight 0.3s ease; min-width:280px; max-width:360px;
    color:#334155;
  `;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = "slideOutRight 0.3s ease forwards";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ── FORMAT CURRENCY ───────────────────────────────────────────
function formatRp(n) {
  if (isNaN(n) || n === "" || n === null) return "Rp 0";
  return "Rp " + Number(n).toLocaleString("id-ID");
}
function parseRp(s) {
  if (typeof s === "number") return s;
  return parseInt(String(s).replace(/[^0-9]/g, "")) || 0;
}

// ── MONTH ORDER ───────────────────────────────────────────────
const BULAN_ORDER = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function bulanIndex(b) {
  return BULAN_ORDER.indexOf(b);
}

// ── TABLE UTILS ───────────────────────────────────────────────
function renderPagination(total, page, perPage, onPage) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return "";
  let html = `<div class="pagination">`;
  html += `<button onclick="(${onPage})(${page - 1})" ${page <= 1 ? "disabled" : ""}>‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === page ? "active" : ""}" onclick="(${onPage})(${i})">${i}</button>`;
  }
  html += `<button onclick="(${onPage})(${page + 1})" ${page >= pages ? "disabled" : ""}>›</button>`;
  html += `</div>`;
  return html;
}

// ── INJECT GLOBAL CSS ─────────────────────────────────────────
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  @keyframes slideInRight {
    from { opacity:0; transform:translateX(30px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes slideOutRight {
    from { opacity:1; transform:translateX(0); }
    to   { opacity:0; transform:translateX(30px); }
  }
  .pagination {
    display:flex; gap:6px; align-items:center; justify-content:center;
    margin-top:16px; flex-wrap:wrap;
  }
  .pagination button {
    width:34px; height:34px; border:1px solid #e2e8f0; border-radius:8px;
    background:white; cursor:pointer; font-family:inherit; font-size:0.875rem;
    color:#475569; transition:all 0.15s;
  }
  .pagination button:hover:not(:disabled) { background:#dbeafe; border-color:#3b82f6; color:#1d4ed8; }
  .pagination button.active { background:#2563eb; color:white; border-color:#2563eb; }
  .pagination button:disabled { opacity:0.4; cursor:not-allowed; }
`;
document.head.appendChild(globalStyle);

// ── SIDEBAR ACTIVE STATE ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const current = window.location.pathname.split("/").pop() || "dashboard.html";
  document.querySelectorAll(".nav-link").forEach((el) => {
    const href = el.getAttribute("href") || "";
    if (href === current) el.classList.add("active");
    else el.classList.remove("active");
  });
  // Set user display
  const userEl = document.getElementById("userName");
  if (userEl) userEl.textContent = getUser();
});
