# Hướng Dẫn Chạy Frontend

## Cách 1: Chạy Development Server (Khuyến nghị)

### Bước 1: Mở Terminal/PowerShell
Di chuyển vào thư mục Frontend:
```bash
cd Source_Code/FE
```

### Bước 2: Cài đặt Dependencies (Chỉ cần làm 1 lần đầu)
```bash
npm install
```

### Bước 3: Chạy Development Server
```bash
npm run dev
```

Sau khi chạy, bạn sẽ thấy thông báo:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Bước 4: Mở trình duyệt
Mở trình duyệt và truy cập: **http://localhost:5173**

---

## Cách 2: Build và Preview Production

### Build cho production:
```bash
npm run build
```

### Preview build:
```bash
npm run preview
```

---

## Thông Tin Đăng Nhập (Mock Data Mode)

Khi đang ở chế độ Mock Data (mặc định), bạn có thể:

**Đăng nhập với tài khoản test:**
- Email: `user@test.com`
- Password: `password123`

**Hoặc đăng ký tài khoản mới** với bất kỳ email/password nào.

---

## Tắt Mock Data Mode

Nếu muốn kết nối với Backend thật:

1. Mở file `src/config.ts`
2. Đổi `USE_MOCK_DATA = false`
3. Đảm bảo Backend đang chạy tại `http://localhost:3000`

---

## Các Lệnh Khác

- **Lint code:** `npm run lint`
- **Kiểm tra lỗi TypeScript:** `npm run build` (sẽ báo lỗi nếu có)

---

## Xử Lý Lỗi Thường Gặp

### Lỗi: "Cannot find module"
- Chạy lại: `npm install`

### Lỗi: Port 5173 đã được sử dụng
- Vite sẽ tự động chọn port khác (5174, 5175, ...)
- Hoặc dừng process đang dùng port 5173

### Lỗi: Node modules chưa được cài
- Xóa thư mục `node_modules` và `package-lock.json`
- Chạy lại: `npm install`

