# SIPINTAR V3 — Sistem Penilaian Terintegrasi (KHUSUS MODUL UJIAN)

Arsitektur baru:

```
SIPINTAR-UJIAN/
├── gas/
│   └── code.gs            ← SATU-SATUNYA file di Google Apps Script (API JSON murni)
└── web/                   ← SEMUA file frontend (di-upload ke GitHub → deploy Vercel)
    ├── index.html            Aplikasi lengkap (login, ujian, admin, PWA)
    ├── config.js             ⚙️ Tempel URL Web App /exec di sini (1x)
    ├── manifest.webmanifest  Data PWA (nama, ikon, install ke HP/laptop)
    ├── sw.js                 Service worker (network-first, API tidak di-cache)
    ├── vercel.json           Konfigurasi cache/header Vercel
    ├── logo.png              Logo SIPINTAR (burung hantu)
    └── icon-192 / 512 / 1024.png   Ikon aplikasi
```

## Apa yang berubah dari versi sebelumnya

| Hal | Sebelum | Sekarang |
|---|---|---|
| File di Apps Script | code.gs + index.html | **hanya code.gs** (API JSON) |
| Frontend | dilayani Apps Script (HtmlService) | **GitHub + Vercel** (PWA penuh) |
| Komunikasi | `google.script.run` internal | **API fetch JSON** — pola pemanggilan di kode TIDAK berubah (jembatan kompatibel) |
| Akses pengguna | muncul halaman izin Google | **tanpa halaman izin** — langsung terbuka di semua laptop/HP |
| Modul | Ujian + Data + Belajar + Sistem | **khusus ujian**: Materi Pembelajaran, Penugasan, Gamefikasi, Jurnal **dihapus** |
| Tema | biru | **biru navy + aksen emas** |
| Penyimpanan | Spreadsheet | tetap **Spreadsheet** (ID baru sudah terpasang) |

Modul yang dipertahankan: Dashboard, Jadwal Ujian, Bank Soal, Kisi-Kisi, AI Generator Soal,
Hermes AI Agent, Hasil & Nilai, Ujian—Pengawas, Koreksi Jawaban, Capaian Pembelajaran,
Pengawas, Template Laporan, Manajemen User, Profil Siswa, Kartu Ujian, Folder Gambar,
Folder Musik, Konfigurasi, Data Master. Alur login (UserID + password + token sesi),
PIN ujian, soal acak, anti-curang, dan penilaian **tidak berubah**.

ID yang sudah terpasang di `gas/code.gs`:
- Spreadsheet: `1RgENl31epSuzVmSUUg_z7BF1QMJ77neMgfn9OMNmzYs`
- Folder Drive induk: `1-G8qk26pWTwfxbhmgNH4KZiQMPHwPa46`

---

## 📋 LANGKAH PELAKSANAAN (± 15 menit)

### Langkah 1 — Pasang code.gs di Apps Script
1. Buka Spreadsheet (`1RgENl31epSuzVmSUUg_z7BF1QMJ77neMgfn9OMNmzYs`) → **Extensions → Apps Script**.
2. **Hapus semua file lama** di proyek (termasuk index.html lama) hingga tersisa satu file `Code.gs` kosong.
3. Salin-tempel seluruh isi `gas/code.gs` → Simpan (Ctrl+S).

### Langkah 2 — Inisialisasi & bersih-bersih (jalankan sekali)
1. Di editor Apps Script pilih fungsi **`initializeSheets`** → **Run** → izinkan otorisasi (hanya Anda sebagai pemilik yang melakukan ini, pengguna tidak).
2. Pilih fungsi **`hapusSheetModulBelajar`** → **Run** — menghapus sheet `Materi_Pembelajaran`, `Penugasan`, `Penugasan_Kumpul`, `Gamefikasi`, `Gamefikasi_Hasil`, `Jurnal_Pembelajaran` bila ada.

### Langkah 3 — Deploy sebagai Web App (API)
1. **Deploy → New deployment → ⚙️ Web app**
   - *Execute as*: **Me** (akun Anda)
   - *Who has access*: **Anyone**
2. Klik **Deploy**, salin URL `https://script.google.com/macros/s/XXXX/exec`.
3. Uji: buka URL itu di browser → harus muncul JSON `{"ok":true,"service":"SIPINTAR API",...}`.

> ⚠️ Setiap kali mengubah code.gs: **Deploy → Manage deployments → ✏️ Edit → New version** — URL tetap sama.

### Langkah 4 — Isi URL di `web/config.js`
```js
window.APP_CONFIG = {
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/XXXX/exec",
  ...
};
```

### Langkah 5 — Upload ke GitHub & hubungkan Vercel
1. GitHub → repo baru (mis. `sipintar-v3`) → upload seluruh isi folder ini.
2. Vercel → **Add New → Project** → import repo.
3. Framework: **Other** · Build Command: *(kosong)* · **Output Directory: `web`**.
4. **Deploy** → dapat URL `https://sipintar-v3.vercel.app`.

### Langkah 6 — Uji & install
- Buka URL Vercel → halaman login SIPINTAR langsung muncul (tanpa halaman izin Google).
- Android (Chrome): ⋮ → *Install app* · iPhone (Safari): *Share → Add to Home Screen* · Desktop: ikon install di address bar.

---

## 🔒 Konsep keamanan API
- `doPost`/`doGet` hanya meneruskan fungsi yang terdaftar di **whitelist `SIPINTAR_API_FUNCTIONS`** (118 fungsi); fungsi internal (berakhiran `_`) dan fungsi berbahaya (mis. `initializeSheets`) **tidak dapat dipanggil dari luar**.
- Setiap fungsi sensitif tetap memverifikasi **UserID + SessionToken** di server (alur lama, tidak berubah).
- POST memakai `Content-Type: text/plain` → *simple request* tanpa preflight CORS → berfungsi di semua perangkat/jaringan sekolah.
- Service worker **tidak pernah meng-cache** panggilan API, sehingga data ujian selalu real-time.

## ⚡ Catatan performa
- Cache server (CacheService) untuk data Users/soal tetap aktif seperti sebelumnya.
- Frontend dilayani CDN Vercel (cepat), API hanya membawa JSON ringkas.
- Jika URL /exec berubah (deployment baru), cukup perbarui `config.js` → push → Vercel auto-deploy. Pengguna juga dapat menyetel cepat lewat `?api=URL_EXEC`.
