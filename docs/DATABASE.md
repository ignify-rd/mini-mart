# Database (Google Sheets)

## Kết nối

File: `src/utils/database/connect.ts` → `initSheets()`  
Khởi tạo Google Sheets client (JWT) từ biến `GOOGLE_*`.

## Sheets service (`src/utils/sheets/`)

| File | Chức năng |
|---|---|
| `client.ts` | Auth JWT + Sheets client |
| `cache.ts` | Cache TTL + loadSheet / clearCache |
| `parse.ts` | parse / serialize / matchRow |
| `operations.ts` | CRUD, getNextId, ensureColumns |
| `index.ts` | Re-exports |

## Models

### Account (`Accounts`)
| Field | Ghi chú |
|---|---|
| `_id` | Tăng dần |
| `username` | Unique (= restaurantID) |
| `email` | Unique |
| `password` | bcrypt hash |
| `profile` | Reference Profiles.`_id` |

Menus được load runtime từ sheet `Menus` theo `restaurantID = username`.

### Profile (`Profiles`)
| Field | Ghi chú |
|---|---|
| `restaurantID` | = Accounts.username |
| `bankId`, `accountNo`, `accountName` | VietQR (optional) |
| `avatar`, `cover`, `name`, `address`, … | Hiển thị cửa hàng |

### Category (`Categories`)
| Field | Ghi chú |
|---|---|
| `name` | Unique theo restaurant |
| `restaurantID` | |

### Menu (`Menus`)
| Field | Ghi chú |
|---|---|
| `restaurantID` | Source of truth cho menu cửa hàng |
| `categoryId` | Categories.`_id` |
| `category` | Chỉ hydrate khi đọc (tên hiển thị) |
| `price`, `stock`, `hidden`, `image`, `restockDate` | |

### Order (`Orders`)
| Field | Ghi chú |
|---|---|
| `restaurantID` | Cửa hàng |
| `customer` | Tên khách nhập lúc đặt (không còn sheet Customers) |
| `state` | Thường `complete` sau confirm |
| `paymentStatus` | `paid` / `pending` |
| `paymentReference`, `paymentAmount`, `paidAt` | |
| `products` | JSON: `{ product, quantity, price, … }` |

### RestockLog (`RestockLogs`)
Lịch sử nhập hàng theo menu.

## Local store

`STORE_ID` (mặc định `minimart`) phải khớp `Accounts.username` và `Menus.restaurantID` / `Profiles.restaurantID`.
