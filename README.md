### About 🗿
Dibuat khusus untuk Deotgg9000 untuk automatisasi check in harian di suatu situs web 🗿

### Penggunaan
```bash
$ git clone https://github.com/egoletter/daily-checkin-automation.git
$ cd daily-checkin-automation
$ npm install
```
Jalankan dengan:
```bash
$ npm run checkin path/to/file.txt
```
*atau*

```bash
$ npm run checkin <enter>
Enter filename.txt: path/to/file.txt <enter>
```

### Konfigurasi
Buat file `.env` di root folder dan isi
```.env
BASE_URL=https://example.com
CAPTCHA_URI=/api/example/captcha
AUTH_URI=/api/example/authorizations
CHECKIN_URI=/api/example/activities
AREA=62
```
Default area: 62 (Indonesia).<br>

### Format file accounts.txt
Masukkan list nomor no hp dan password.<br>
NOTE: No HP dan password harus sama karena saat ini hanya support password yang sama dengan no HP.<br>
Jadi cukup masukkan daftar no HP seperti:
```txt
87611796651 
87611791272
87611796651
87661912867
```

### Percobaan login yang gagal
Default percobaan login yang gagal adalah 5 kali. Bisa diubah di file `config.js` sesuai kebutuhan:
```js
export const config = {
	// ...
	maxRetries: 5 // default 5 kali
};
```
