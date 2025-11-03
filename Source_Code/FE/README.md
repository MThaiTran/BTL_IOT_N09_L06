# Smart Home IoT Frontend

Giao diện web cho hệ thống Nhà Thông Minh Mini - Dự án IoT N12_L06

## Tính năng

- ✅ **Đăng nhập/Đăng ký**: Xác thực người dùng với JWT
- ✅ **Hệ thống phân quyền**: 3 vai trò (Admin, Technician, House Owner)
- ✅ **Dashboard**: Hiển thị nhiệt độ, độ ẩm theo thời gian thực
- ✅ **Điều khiển thiết bị**: Bật/tắt đèn và quạt thủ công hoặc tự động
- ✅ **Quản lý thiết bị**: Thêm, sửa, xóa thiết bị IoT (theo quyền)
- ✅ **Quản lý người dùng** (Admin only): Thêm, sửa, xóa, phân quyền người dùng
- ✅ **Nhật ký hệ thống**: Theo dõi logs và cảnh báo
- ✅ **Giao diện responsive**: Tương thích mobile và desktop
- ✅ **Dark mode**: Hỗ trợ chế độ tối
- ✅ **Role-based navigation**: Menu khác nhau theo vai trò

## Công nghệ sử dụng

- **React 18** với TypeScript
- **Vite** - Build tool nhanh
- **Tailwind CSS** - Styling
- **React Router** - Điều hướng
- **TanStack Query** - Quản lý state và API calls
- **Recharts** - Biểu đồ
- **Lucide React** - Icons
- **React Hot Toast** - Thông báo

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## Cấu hình

### Mock Data Mode (Mặc định)

Ứng dụng đang sử dụng **Mock Data** để test các chức năng mà không cần backend server.

Để chuyển sang sử dụng API thật, mở file `src/config.ts` và đổi:
```typescript
export const USE_MOCK_DATA = false; // Đổi từ true sang false
```

### Mock Accounts để Test

Khi ở chế độ Mock Data, bạn có thể đăng nhập với:

**Admin (Quản trị viên):**
- Email: `admin@test.com`
- Password: `admin123`

**House Owner (Chủ nhà):**
- Email: `owner@test.com`
- Password: `owner123`

**Technician (Kỹ thuật viên):**
- Email: `tech@test.com`
- Password: `tech123`

Hoặc đăng ký tài khoản mới với bất kỳ email/password nào.

> Xem thêm chi tiết về hệ thống phân quyền trong file `ROLE_SYSTEM.md`

### Environment Variables (Khi dùng API thật)

Tạo file `.env` trong thư mục `FE`:

```env
VITE_API_URL=http://localhost:3000
```

## Kết nối với Backend

Frontend được cấu hình để kết nối với backend NestJS tại `http://localhost:3000`.

API endpoints:
- `/api/auth/signin` - Đăng nhập
- `/api/auth/signup` - Đăng ký
- `/api/devices` - Quản lý thiết bị
- `/api/system-logs` - Nhật ký hệ thống
- `/api/device-types` - Loại thiết bị

## Cấu trúc thư mục

```
src/
├── components/        # React components
│   ├── dashboard/    # Dashboard components
│   ├── devices/      # Device management components
│   └── Layout.tsx    # Main layout
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── DevicesPage.tsx
│   └── LogsPage.tsx
├── services/         # API services
│   └── api.ts
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utility functions
│   └── auth.ts
└── styles/           # Global styles
    └── index.css
```

## Tính năng chính

### 1. Dashboard
- Hiển thị nhiệt độ và độ ẩm theo thời gian thực
- Điều khiển đèn và quạt
- Trạng thái hệ thống
- Biểu đồ hoạt động

### 2. Quản lý Thiết bị
- Thêm thiết bị mới
- Chỉnh sửa thông tin thiết bị
- Xóa thiết bị
- Xem trạng thái online/offline

### 3. Nhật ký Hệ thống
- Xem tất cả logs
- Lọc theo loại (INFO, WARNING, ERROR, UPDATE, USER_ACTION)
- Tự động làm mới mỗi 10 giây

## Lưu ý

1. **Real-time Data**: Hiện tại dashboard sử dụng mock data. Để kết nối với Firebase/WebSocket thực tế, cần cập nhật các component trong `components/dashboard/`.

2. **Device Control**: Điều khiển thiết bị hiện tại là mock. Cần tích hợp với Firebase Realtime Database hoặc MQTT để điều khiển thực tế.

3. **Authentication**: Token được lưu trong localStorage. Có thể nâng cấp để sử dụng httpOnly cookies cho bảo mật tốt hơn.

## Phát triển tiếp

- [ ] Tích hợp Firebase Realtime Database cho dữ liệu thời gian thực
- [ ] WebSocket connection cho real-time updates
- [ ] OTA firmware update interface
- [ ] Push notifications cho cảnh báo
- [ ] Export logs
- [ ] Device scheduling/automation rules
- [ ] Multi-language support

## License

Dự án học tập - BTL IoT N12_L06

