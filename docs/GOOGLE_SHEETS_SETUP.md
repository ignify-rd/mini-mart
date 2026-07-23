# Hướng dẫn Setup Google Sheets

## Bước 1–4

1. Tạo Google Cloud project, bật **Google Sheets API**
2. Tạo Service Account + JSON key → lấy `client_email` và `private_key`
3. Tạo Spreadsheet, lấy ID từ URL
4. Share spreadsheet cho service account (**Editor**)

## Bước 5: Sheet tabs

Tạo các sheet (tên đúng chữ hoa/thường):

### 1. Accounts
| _id | username | email | password | verified | accountActive | subscriptionActive | profile | createdAt | updatedAt |

> Không cần cột `menus`. Menu lấy từ sheet Menus theo `restaurantID`.

### 2. Profiles
| _id | name | restaurantID | description | address | themeColor | avatar | cover | bankId | accountNo | accountName | createdAt | updatedAt |

### 3. Categories
| _id | name | restaurantID | createdAt | updatedAt |

### 4. Menus
| _id | name | restaurantID | categoryId | price | image | hidden | stock | restockDate | createdAt | updatedAt |

### 5. Orders
| _id | restaurantID | customer | state | orderTotal | paymentStatus | paymentReference | paymentAmount | paidAt | products | createdAt | updatedAt |

### 6. RestockLogs
| _id | menuId | menuName | quantity | stockBefore | stockAfter | note | createdBy | createdAt |

**Lưu ý:**
- Header ở row 1; data từ row 2
- `products` lưu JSON string
- `customer` trên Orders là **tên khách** nhập lúc đặt hàng

### Mẫu minimart (tối thiểu)

- Accounts: `username = minimart`, password đã hash bcrypt
- Profiles / Categories / Menus: `restaurantID = minimart`
- `STORE_ID=minimart` trong `.env`

Chi tiết mẫu dữ liệu: giữ headers đúng và tạo account qua app hoặc hash password bằng bcrypt trước khi ghi sheet.

## Bước 6: `.env`

```env
GOOGLE_SHEETS_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STORE_ID=minimart
```
