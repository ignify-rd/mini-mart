# OrderWorder — Tổng quan

Ứng dụng đặt hàng mini mart nội bộ: khách xem menu, thêm giỏ, thanh toán VietQR (xác nhận thủ công), admin quản lý đơn / tồn kho / thực đơn / danh mục.

- **Stack:** Next.js App Router, React, NextAuth, SWR, Google Sheets, bcrypt, xtreme-ui
- **Một cửa hàng** qua `STORE_ID` (mặc định `minimart`)

## Tính năng

1. Menu khách + tìm kiếm + lọc danh mục
2. Giỏ hàng + QR thanh toán
3. Dashboard admin: đơn hàng, tồn kho, thực đơn, danh mục, thanh toán, đổi mật khẩu
4. Hóa đơn PDF

## Không còn trong sản phẩm

- AI chatbot / multi-restaurant demo / sheet Customers & AIConfig / MongoDB

## Scripts

| Script | Mô tả |
|---|---|
| `pnpm play` | Dev không Doppler |
| `pnpm dev` | Dev với Doppler |
| `pnpm build` / `pnpm start` | Production |
| `pnpm lint` | Biome |
