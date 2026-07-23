# Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `GOOGLE_SHEETS_ID` | ✅ | ID Google Spreadsheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ✅ | Email service account |
| `GOOGLE_PRIVATE_KEY` | ✅ | Private key (giữ `\n` trong dấu ngoặc kép) |
| `NEXTAUTH_SECRET` | ✅ | Secret JWT |
| `NEXTAUTH_URL` | ✅ | URL app (local: `http://localhost:3000`, Vercel: domain production) |
| `NEXT_PUBLIC_SITE_URL` | ❌ | Public URL (SEO/OG) |
| `STORE_ID` | ❌ | Username cửa hàng cho homepage/`/api/menu` (mặc định `minimart`) |
| `PORT` | ❌ | Chỉ local; Vercel không cần |

## Doppler (tùy chọn)

```bash
pnpm dev    # với Doppler
pnpm play   # không Doppler
```

## Lưu ý

- `.env` trong `.gitignore`
- Share spreadsheet cho service account với quyền **Editor**
- Trên Vercel: set `NEXTAUTH_URL` và `NEXT_PUBLIC_SITE_URL` thành domain production
