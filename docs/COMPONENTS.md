# Components & Modules

## Customer homepage (`src/app/`)

- `page.tsx` — orchestration: cart state, filter, checkout flow
- `_components/StoreHeader.tsx` — cover / avatar / tên cửa hàng
- `_components/MenuToolbar.tsx` — search + category chips
- `_components/CartSheet.tsx` — giỏ hàng + CartBar
- `_components/CheckoutViews.tsx` — QR payment + success

## Admin dashboard (`src/app/dashboard/`)

Tabs: Đơn hàng, Tồn kho, Thực đơn, Danh mục, Cài đặt

- `Orders/` — lịch sử đơn + chi tiết + PDF
- `Inventory/` — tồn kho
- `Menu/` — CRUD sản phẩm, ẩn/hiện, nhập hàng
- `Categories/` — CRUD danh mục (dialog)
- `Settings/` — tài khoản, đổi mật khẩu, VietQR

## Shared (`src/components/`)

### base/
FormField, LoadingGate, AdminSearchBar, QuantityButton, SideSheet, SettingsCard, …

### layout/
ItemCard, Invoice (PDF), Modal, NavSideBar, NoContent, Collapsible

### context/
Restaurant, Order, Admin, GlobalProvider (Session + XProvider)
