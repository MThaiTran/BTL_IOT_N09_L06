# Hệ Thống Phân Quyền - Role-Based Access Control (RBAC)

## Tổng Quan

Hệ thống hỗ trợ 3 vai trò chính:

1. **Admin (Quản trị viên)** - Role ID: 1
2. **Technician (Kỹ thuật viên)** - Role ID: 2  
3. **House Owner / ENDUSER (Chủ nhà)** - Role ID: 3

---

## Quyền Hạn Theo Vai Trò

### 🔴 Admin (Quản trị viên)
**Quyền truy cập đầy đủ:**
- ✅ Quản lý toàn bộ người dùng (thêm, sửa, xóa)
- ✅ Xem và quản lý tất cả thiết bị
- ✅ Xem tất cả logs hệ thống
- ✅ Truy cập Admin Dashboard với thống kê tổng quan
- ✅ Quản lý roles và permissions

**Routes:**
- `/admin/dashboard` - Admin Dashboard
- `/admin/users` - Quản lý người dùng
- `/dashboard` - Dashboard thường (redirect từ admin)
- `/devices` - Quản lý thiết bị (xem tất cả)
- `/logs` - Nhật ký hệ thống

---

### 🟡 Technician (Kỹ thuật viên)
**Quyền quản lý thiết bị và hệ thống:**
- ✅ Xem và quản lý tất cả thiết bị
- ✅ Xem logs hệ thống
- ❌ Không thể quản lý người dùng
- ❌ Không có quyền admin

**Routes:**
- `/dashboard` - Dashboard với thiết bị
- `/devices` - Quản lý thiết bị (xem tất cả)
- `/logs` - Nhật ký hệ thống

---

### 🟢 House Owner / ENDUSER (Chủ nhà)
**Quyền quản lý thiết bị của mình:**
- ✅ Xem và quản lý chỉ thiết bị của mình
- ✅ Xem logs liên quan đến thiết bị của mình
- ❌ Không thể xem thiết bị của người khác
- ❌ Không có quyền admin

**Routes:**
- `/dashboard` - Dashboard với thiết bị của mình
- `/devices` - Quản lý thiết bị (chỉ thiết bị của mình)
- `/logs` - Nhật ký hệ thống

---

## Tài Khoản Test (Mock Data Mode)

### Admin
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Vai trò:** Admin

### House Owner
- **Email:** `owner@test.com`
- **Password:** `owner123`
- **Vai trò:** House Owner (ENDUSER)

### Technician
- **Email:** `tech@test.com`
- **Password:** `tech123`
- **Vai trò:** Technician

---

## Cấu Trúc Code

### Types & Enums
- `src/types/index.ts` - Định nghĩa `UserRole`, `Role`, `User`, etc.

### Utilities
- `src/utils/roles.ts` - Các hàm kiểm tra quyền:
  - `isAdmin()`
  - `isHouseOwner()`
  - `isTechnician()`
  - `canManageUsers()`
  - `canViewAllDevices()`

### Guards
- `src/components/guards/RoleGuard.tsx` - Component bảo vệ routes theo role

### Pages
- `src/pages/admin/AdminDashboardPage.tsx` - Admin dashboard
- `src/pages/admin/UsersManagementPage.tsx` - Quản lý người dùng
- `src/pages/DashboardPage.tsx` - Dashboard cho House Owner/Technician
- `src/pages/DevicesPage.tsx` - Tự động filter devices theo role

### Layout & Navigation
- `src/components/Layout.tsx` - Hiển thị navigation khác nhau theo role
- Sidebar hiển thị menu items dựa trên role của user

---

## Cách Sử Dụng

### Bảo vệ Route theo Role

```tsx
import { RoleGuard } from '../components/guards/RoleGuard';
import { UserRole } from '../types';

<Route
  path="admin/users"
  element={
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <UsersManagementPage />
    </RoleGuard>
  }
/>
```

### Kiểm tra Quyền trong Component

```tsx
import { isAdmin, canViewAllDevices } from '../utils/roles';

if (isAdmin()) {
  // Admin only code
}

if (canViewAllDevices()) {
  // Show all devices
} else {
  // Show only user's devices
}
```

### Filter Data theo Role

```tsx
import { getAuth } from '../utils/auth';
import { canViewAllDevices } from '../utils/roles';

const { user } = getAuth();
const canViewAll = canViewAllDevices();

const devices = canViewAll
  ? allDevices
  : allDevices?.filter((d) => d.userId === user?.id) || [];
```

---

## Mock Data

Mock data bao gồm:
- 3 users với các roles khác nhau
- Devices được phân bổ cho user ID 1 (House Owner)
- System logs với các user/device khác nhau

Khi đăng nhập với các tài khoản test, bạn sẽ thấy:
- **Admin:** Tất cả users, tất cả devices, admin dashboard
- **House Owner:** Chỉ devices của mình (userId = 2)
- **Technician:** Tất cả devices, không có quyền quản lý users

---

## Tính Năng Đã Hoàn Thành

- ✅ Role-based authentication
- ✅ Role-based route protection
- ✅ Dynamic navigation theo role
- ✅ Device filtering theo role (House Owner chỉ thấy devices của mình)
- ✅ Admin dashboard với thống kê
- ✅ User management cho Admin
- ✅ Role display names (tiếng Việt)
- ✅ Mock data với multiple users và roles

---

## Tính Năng Có Thể Mở Rộng

- [ ] Permission-based access control (chi tiết hơn role)
- [ ] Role assignment trong User Management
- [ ] Audit logs cho admin actions
- [ ] Multi-tenant support (nhiều nhà)
- [ ] Custom roles và permissions
- [ ] Role hierarchy system

