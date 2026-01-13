# Rucoy Ledger

Website Catatan Transaksi Perdagangan Game Rucoy Online - Sebagai Catatan Seller di Game Rucoy Online untuk mencatat Penjualan dan Pembelian Barang baik Quantity maupun Equity.

## Fitur

### Halaman Portfolio (Index)
- Menampilkan semua asset dari berbagai akun
- **Card 1**: Net Asset Value (Total kekayaan semua akun)
- **Card 2**: Total Summary (I Amount, G Amount, D Amount dari semua akun)
- **Card 3**: Tabel akun dengan:
  - **I Amount** (blue): Total Gold Coins yang digunakan untuk membeli items (kecuali Diamonds)
  - **G Amount** (green): Equity (Gold Coins yang tersisa)
  - **D Amount** (orange): Total Gold Coins yang digunakan untuk membeli Diamonds
  - **Total Value**: I Amount + G Amount + D Amount
- Fitur: Add Account, Edit Account, Delete Account (dengan konfirmasi), Export CSV
- Navigasi ke Inventory dan Add Transaction per akun

### Halaman Add Transaction
- **Card Kiri**: Form untuk menambah transaksi
  - Tanggal, Aksi (BUY/SELL), Nama Barang, Tier, Quantity, Total Harga/Equity, Catatan
- **Card Kanan**: Tabel transaksi dengan:
  - Filter: All/Buy/Sell
  - Summary: Total transaksi, Equity, Profit Terealisasi
  - Fitur: Edit, Delete transaksi
- Import/Export CSV

### Halaman Inventory
- Menampilkan items yang sudah dibeli namun belum terjual (Holdings)
- Tabel dengan: Nama Item, Tier, Quantity, Average Value
- Search functionality
- Total barang dan total value
- Export CSV
- Tidak bisa diedit langsung (hanya melalui Add Transaction)

### Halaman Credits
- Contact Support: haryantomini@gmail.com

### Halaman Advance
- **Card 1 & 2**: Charts data pembelian dan penjualan semua akun
- **Card 3 & 4**: Charts data pembelian dan penjualan per akun (dengan selector)
- Forecasting dengan Moving Average (7-day)
- Toggle forecasting on/off


## Struktur File

```
rucoy-ledger/
├── assets/
|   ├── icon-192.png
|   └── icon-512.png
|
├── css
|   └── styles.css            # Styling utama
|
├── js
|   ├── data-manager.js       # Data management & calculations
|   ├── portfolio.js          # Logic halaman Portfolio
|   ├── add-transaction.js    # Logic halaman Add Transaction
|   ├── inventory.js          # Logic halaman Inventory
|   └── advance.js            # Logic halaman Advance
|
├── index.html                # Halaman Portfolio
├── add-transaction.html      # Halaman Add Transaction
├── inventory.html            # Halaman Inventory
├── credits.html              # Halaman Credits
├── advance.html              # Halaman Advance dengan Charts
├── manifest.json             # PWA Manifest
├── sw.js                     # Service Worker
├── LICENSE                   # MIT License
└── README.md                 # Dokumentasi ini
```

## Cara Penggunaan

1. **Membuat Akun Baru**:
   - Buka halaman Portfolio
   - Klik "Add New Account"
   - Isi nama akun, label (opsional), dan initial equity
   - Klik "Add Account"

2. **Menambah Transaksi**:
   - Klik "Add/Edit Transaksi" pada akun yang diinginkan
   - Isi form transaksi (tanggal, aksi, nama barang, tier, quantity, total harga, catatan)
   - Klik "Add to List"
   - Transaksi akan muncul di tabel kanan

3. **Melihat Inventory**:
   - Klik "View Inventory" pada akun yang diinginkan
   - Akan menampilkan semua items yang belum terjual

4. **Export Data**:
   - Portfolio: Klik "Export CSV" di halaman Portfolio
   - Transactions: Klik "Export CSV" di halaman Add Transaction
   - Inventory: Klik "Export CSV" di halaman Inventory

5. **Import Transaksi**:
   - Di halaman Add Transaction, klik "Import CSV"
   - Pilih file CSV dengan format yang sesuai
   - Transaksi akan diimport otomatis

## Catatan Penting

- **Diamonds**: Item dengan nama "Diamond's" atau "Diamonds" akan dihitung sebagai D Amount, bukan I Amount
- **FIFO**: Sistem menggunakan First In First Out untuk menghitung profit dan inventory
- **Data Storage**: Semua data disimpan di browser localStorage
- **Equity**: Menunjukkan sisa Gold Coins setelah semua transaksi
- **I Amount**: Total value items yang dibeli (kecuali Diamonds), berkurang saat items terjual
- **G Amount**: Equity (Gold Coins tersisa)
- **D Amount**: Total Gold Coins yang digunakan untuk membeli Diamonds

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

## License

MIT License - Lihat file LICENSE untuk detail lengkap.

## Support

Untuk pertanyaan atau bantuan, hubungi: edhanstore@gmail.com
