# DESIGN.md - LunexSMP

## 1. Identitas & Karakter
* **Nama Server:** LunexSMP
* **Genre / Tipe:** Economy PvP & Crystal PvP (CPvP)
* **Karakter Visual:** Gelap, tegas, tajam, kompetitif. Atmosfer arena pertarungan berisiko tinggi tanpa elemen kartun atau gamer-neon murahan.
* **Dial Antislop:** ENERGY 2 / RHYTHM 2 / MOTION 1

---

## 2. Palet Warna (R-29: 2-3 Warna Inti + 1 Aksen)
* **Warna Netral Utama (Background Base):** `#0b0c0e` (Deep Obsidian)
* **Warna Netral Sekunder (Surface / Card):** `#14171d` (Dark Iron)
* **Warna Border / Garis Pemisah:** `#222632` (Muted Slate)
* **Warna Teks Primer:** `#f3f4f6` (Off-white, rasio kontras 16.5:1 terhadap background)
* **Warna Teks Sekunder:** `#9ca3af` (Muted Grey, rasio kontras 7.5:1 terhadap background - lolos WCAG AA)
* **Satu Aksen Terarah (Accent Flame):** `#ff462b` (Ember Crimson - fokus pada tombol aksi utama dan indikator aktif)
* **Indikator Status:** `#22c55e` (Online Emerald), `#ef4444` (Offline Ruby)

---

## 3. Tipografi (R-06)
* **Font Display / Judul:** `Chakra Petch` (Google Fonts, 600/700)
  * *Alasan:* Potongan sudut geometris yang tajam memberikan kesan arena taktis dan kompetitif yang kuat.
* **Font Konten / Body:** `Plus Jakarta Sans` (Google Fonts, 400/500/600)
  * *Alasan:* Sans-serif modern dengan legibilitas tinggi untuk membaca aturan dan spesifikasi ekonomi dengan nyaman.
* **Font Monospace / IP & Angka:** `JetBrains Mono` (Google Fonts, 500)
  * *Alasan:* Kejelasan membaca alamat port dan IP server tanpa salah tafsir karakter.

---

## 4. Ritme Layout (RHYTHM 2)
* **Hero:** Asimetris dengan fokus pada alamat IP server yang siap salin dan badge status live.
* **Fitur:** Modul flagship CPvP berukuran lebar diikuti 3 kolom breakdown sistem ekonomi (Spawner, Shard, Auction House).
* **Store:** Grid perbandingan tier rank yang terstruktur dengan badge harga transparan.
* **Aturan:** Accordion vertikal interaktif yang ringkas dan nyaman dinavigasi keyboard.
* **Cara Join:** Tab switcher dua mode (Java vs Bedrock) dengan instruksi langkah demi langkah.

---

## 5. Gerakan & Transisi (MOTION 1)
* Gerakan terbatas pada hover state tombol, fokus keyboard, dan feedback klik tombol salin.
* Seluruh animasi dinonaktifkan secara otomatis jika pengguna mengaktifkan `prefers-reduced-motion`.

---

## 6. Pembenaran Keputusan Desain (R-31)
* **Warna `#ff462b`:** Digunakan secara terukur hanya pada CTA penting agar hierarki visual langsung mengarahkan mata ke aksi utama (Salin IP / Join).
* **Tata Letak Fitur Asimetris:** Menempatkan CPvP sebagai fitur unggulan utama di atas pilar ekonomi, menghindari kebosanan kartu seragam 3x3.
* **Pemisah Garis Padat (Tanpa Glow Berlebih):** Menjaga keterbacaan tinggi di layar gelap tanpa silau visual AI-slop.
* **Placeholder Screenshot Transparan:** Menghindari ilustrasi 3D generik yang tidak menggambarkan gameplay Minecraft asli.
