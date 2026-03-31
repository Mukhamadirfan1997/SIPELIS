// Google Apps Script — SiPeLis
// Deploy sebagai: Web App > Execute as: Me > Access: Anyone
const SPREADSHEET_ID = "1nFVrMzCXfI-ZVn96vye17A5MsAtWr1KJpoODxSKp4hs";

// ══════════════════════════════════════════════════════════════
// INISIALISASI OTOMATIS — Jalankan fungsi ini 1x dari editor
// (klik ▶ pada fungsi initSheets) untuk membuat semua tabel
// ══════════════════════════════════════════════════════════════
function initSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const struktur = {
    users: ["username", "password"],
    listrik: [
      "no",
      "sekolah",
      "id_pelanggan",
      "bulan",
      "jenis",
      "spj",
      "realisasi",
      "admin",
      "selisih",
    ],
    internet: [
      "no",
      "sekolah",
      "id_pelanggan",
      "bulan",
      "provider",
      "spj",
      "realisasi",
      "admin",
      "selisih",
      "kecepatan",
    ],
    profil: [
      "nama",
      "npsn",
      "alamat",
      "kepsek",
      "nip",
      "tahun",
      "jenjang",
      "kota",
      "provinsi",
      "email",
      "telp",
    ],
  };

  const created = [];

  for (const [name, headers] of Object.entries(struktur)) {
    let sh = ss.getSheetByName(name);

    if (!sh) {
      // Sheet belum ada → buat baru + header
      sh = ss.insertSheet(name);
      sh.appendRow(headers);
      created.push(name + " (baru)");
    } else if (sh.getLastRow() === 0) {
      // Sheet ada tapi kosong → tambahkan header
      sh.appendRow(headers);
      created.push(name + " (header ditambahkan)");
    } else {
      created.push(name + " (sudah ada, dilewati)");
    }

    // ── Format header: bold, warna, freeze ──
    const headerRange = sh.getRange(1, 1, 1, headers.length);
    headerRange
      .setFontWeight("bold")
      .setBackground("#1e40af")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
    sh.setFrozenRows(1);

    // Auto-resize kolom
    for (let c = 1; c <= headers.length; c++) {
      sh.autoResizeColumn(c);
    }
  }

  // ── Tambahkan akun default jika sheet users masih kosong ──
  const usersSheet = ss.getSheetByName("users");
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow(["admin", "admin123"]);
  }

  // ── Hapus sheet default "Sheet1" jika masih ada ──
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log("✅ Inisialisasi selesai: " + created.join(", "));
  SpreadsheetApp.getUi().alert(
    "✅ Inisialisasi SiPeLis Selesai!\n\n" +
      created.map((c) => "• " + c).join("\n") +
      "\n\nAkun default: admin / admin123",
  );
}

// ══════════════════════════════════════════════════════════════
// WEB APP HANDLERS
// ══════════════════════════════════════════════════════════════

function doGet(e) {
  // Guard: jika dijalankan dari editor (bukan sebagai Web App)
  if (!e || !e.parameter) {
    return jsonResponse({
      error:
        "Fungsi ini harus diakses melalui URL Web App. Untuk inisialisasi, jalankan fungsi initSheets().",
    });
  }

  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ── INIT: bisa dipanggil via URL juga ──
  if (action === "init") {
    initSheets();
    return jsonResponse({ success: true, message: "Semua sheet berhasil diinisialisasi." });
  }

  if (action === "login") {
    const loginSheet = ss.getSheetByName("users") || ss.insertSheet("users");
    const data = loginSheet.getDataRange().getValues();
    const match = data.find(
      (r) => r[0] == e.parameter.user && r[1] == e.parameter.pass,
    );
    return jsonResponse({ success: !!match });
  }

  if (action === "get") {
    const sh = ss.getSheetByName(sheet);
    if (!sh) return jsonResponse([]);
    const rows = sh.getDataRange().getValues();
    if (rows.length === 0) return jsonResponse([]);
    const headers = rows[0];
    const result = rows.slice(1).map((r) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });
    return jsonResponse(result);
  }

  return jsonResponse({ error: "Unknown action" });
}

function doPost(e) {
  // Guard: jika dijalankan dari editor
  if (!e || !e.postData) {
    return jsonResponse({
      error:
        "Fungsi ini harus diakses melalui URL Web App. Untuk inisialisasi, jalankan fungsi initSheets().",
    });
  }

  const body = JSON.parse(e.postData.contents);
  const { action, sheet, data, key, value } = body;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ── UPDATE: hapus semua data lama lalu insert ulang (untuk profil) ──
  if (action === "update") {
    let sh = ss.getSheetByName(sheet);
    if (!sh) sh = ss.insertSheet(sheet);
    sh.clear();
    sh.appendRow(Object.keys(data));
    sh.appendRow(Object.values(data));

    // Re-format header
    const headerRange = sh.getRange(1, 1, 1, Object.keys(data).length);
    headerRange
      .setFontWeight("bold")
      .setBackground("#1e40af")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
    sh.setFrozenRows(1);

    return jsonResponse({ success: true });
  }

  // ── DELETE: hapus baris berdasarkan key & value ──
  if (action === "delete") {
    let sh = ss.getSheetByName(sheet);
    if (!sh) return jsonResponse({ success: false, error: "Sheet not found" });
    const rows = sh.getDataRange().getValues();
    const headers = rows[0];
    const keyIndex = headers.indexOf(key);
    if (keyIndex < 0)
      return jsonResponse({ success: false, error: "Key not found" });

    // Cari dari bawah ke atas agar index tidak bergeser saat delete
    let deleted = 0;
    for (let i = rows.length - 1; i >= 1; i--) {
      if (String(rows[i][keyIndex]) == String(value)) {
        sh.deleteRow(i + 1);
        deleted++;
        break;
      }
    }
    return jsonResponse({ success: true, deleted: deleted });
  }

  // ── DEFAULT: APPEND (tambah data baru) ──
  let sh = ss.getSheetByName(sheet);
  if (!sh) sh = ss.insertSheet(sheet);

  if (sh.getLastRow() === 0) {
    sh.appendRow(Object.keys(data));
  }
  sh.appendRow(Object.values(data));
  return jsonResponse({ success: true });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
