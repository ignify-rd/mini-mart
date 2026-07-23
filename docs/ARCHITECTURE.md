# Kiến trúc chi tiết

## 1. Routing (Next.js App Router)

| Route | Type | Chức năng |
|---|---|---|
| `/` | Page | Menu khách + giỏ hàng + thanh toán QR |
| `/dashboard` | Page (auth) | Admin dashboard |
| `/login` | Page | Đăng nhập admin |
| `/logout` | Page | Đăng xuất |

## 2. API Routes

| Endpoint | Method | Chức năng |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Authentication (NextAuth.js) |
| `/api/menu` | GET | Menu + profile cửa hàng (`STORE_ID`) |
| `/api/order/checkout` | POST | Tạo preview thanh toán (QR) |
| `/api/order/payment/confirm` | POST | Xác nhận đã thanh toán → tạo đơn + trừ kho |
| `/api/order` | GET | Lấy đơn theo id |
| `/api/admin` | GET | Profile + menus (admin) |
| `/api/admin/categories` | CRUD | Quản lý danh mục |
| `/api/admin/menu` | POST, PUT | Thêm/sửa sản phẩm |
| `/api/admin/menu/hidden` | POST | Ẩn/hiện sản phẩm |
| `/api/admin/menu/restock` | POST | Nhập hàng |
| `/api/admin/order` | GET | Danh sách đơn |
| `/api/admin/restock-logs` | GET | Lịch sử nhập hàng |
| `/api/admin/payment/config` | POST | Cấu hình VietQR |
| `/api/admin/password/check` | POST | Kiểm tra mật khẩu hiện tại |
| `/api/admin/password/change` | POST | Đổi mật khẩu (bcrypt) |

## 3. Authentication

- **Strategy:** JWT (NextAuth)
- **Provider:** `restaurant` — admin login (username/email + password)
- **Password:** bcrypt (hash khi tạo/đổi mật khẩu)

## 4. State Management

- `RestaurantContext` — menu + profile (SWR)
- `OrderContext` — checkout / confirm payment
- `AdminContext` — profile, menus, orders (SWR)

## 5. Database — Google Sheets

Một spreadsheet với các sheet:

| Sheet | Mục đích |
|---|---|
| `Accounts` | Tài khoản admin (password hashed). Menus **không** lưu trên Accounts. |
| `Profiles` | Thông tin cửa hàng + cấu hình thanh toán |
| `Categories` | Danh mục sản phẩm |
| `Menus` | Sản phẩm (`restaurantID` = username cửa hàng) |
| `Orders` | Đơn hàng (`customer` = tên khách nhập tay, `restaurantID`) |
| `RestockLogs` | Lịch sử nhập hàng |

### Layer

```
API / Pages
  → Models (src/utils/database/models/)
    → Sheets (src/utils/sheets/: cache, parse, operations)
      → Google Sheets API
```

### Notes
- `_id` tăng dần dạng string (`1`, `2`, …)
- Cache in-memory TTL ~20s; invalidate khi ghi
- Menu thuộc cửa hàng qua `Menus.restaurantID`, không qua `Accounts.menus`

## 6. Path Aliases

| Alias | Target |
|---|---|
| `#api/*` | `./src/app/api/*` |
| `#components/*` | `./src/components/*` |
| `#utils/*` | `./src/utils/*` |
