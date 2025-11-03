# Hướng Dẫn Xác Thực Git với GitHub

## Vấn đề
Lỗi `403 Permission denied` xảy ra khi:
- Tài khoản Git hiện tại (`CrisBui`) không có quyền push vào repo `MThaiTran/BTL_IOT_N12_L06`
- Credentials đã hết hạn hoặc không đúng

---

## Giải Pháp 1: Sử dụng GitHub Personal Access Token (Khuyến nghị)

### Bước 1: Tạo Personal Access Token trên GitHub

1. Đăng nhập GitHub: https://github.com
2. Vào **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Đặt tên token (ví dụ: "BTL_IOT_Access")
5. Chọn quyền (scopes):
   - ✅ **repo** (full control of private repositories)
   - ✅ **workflow** (nếu cần)
6. Click **Generate token**
7. **SAO CHÉP TOKEN NGAY** (chỉ hiện 1 lần!)

### Bước 2: Sử dụng Token khi push

Khi Git hỏi password, **KHÔNG nhập password**, mà **nhập Personal Access Token** vừa tạo.

```bash
# Khi push, Git sẽ hỏi:
Username: CrisBui  (hoặc tài khoản GitHub của bạn)
Password: [Paste Personal Access Token ở đây]
```

### Bước 3: Lưu credentials (Tùy chọn)

Để không phải nhập lại mỗi lần:

**Windows (sử dụng Git Credential Manager):**
```bash
git config --global credential.helper wincred
```

Hoặc lưu trong URL:
```bash
git remote set-url origin https://[USERNAME]:[TOKEN]@github.com/MThaiTran/BTL_IOT_N06.git
```

---

## Giải Pháp 2: Sử dụng GitHub CLI (gh)

### Cài đặt GitHub CLI (nếu chưa có):
```bash
winget install GitHub.cli
```

### Đăng nhập:
```bash
gh auth login
```

Chọn:
- GitHub.com
- HTTPS
- Login with a web browser
- Follow hướng dẫn trên trình duyệt

Sau khi đăng nhập, thử push lại:
```bash
git push origin Son_FE
```

---

## Giải Pháp 3: Chuyển sang SSH (An toàn hơn)

### Bước 1: Tạo SSH key (nếu chưa có)
```bash
ssh-keygen -t ed25519 -C "thaotao768@gmail.com"
# Nhấn Enter để dùng default location
# Nhấn Enter 2 lần (không đặt passphrase hoặc đặt nếu muốn)
```

### Bước 2: Copy public key
```bash
cat ~/.ssh/id_ed25519.pub
# Copy toàn bộ output
```

### Bước 3: Thêm SSH key vào GitHub

1. Vào GitHub → **Settings** → **SSH and GPG keys**
2. Click **New SSH key**
3. Paste public key đã copy
4. Click **Add SSH key**

### Bước 4: Đổi remote URL sang SSH
```bash
cd D:\Ky 1 nam 4\IOT\BTL_IOT_N12_L06
git remote set-url origin git@github.com:MThaiTran/BTL_IOT_N12_L06.git
```

### Bước 5: Test SSH connection
```bash
ssh -T git@github.com
```

### Bước 6: Push lại
```bash
git push origin Son_FE
```

---

## Giải Pháp 4: Kiểm tra quyền truy cập

Nếu bạn **KHÔNG phải** là owner/collaborator của repo `MThaiTran/BTL_IOT_N12_L06`:

1. **Yêu cầu quyền truy cập** từ owner (MThaiTran)
2. Hoặc **Fork** repo về tài khoản của bạn
3. Push vào repo đã fork

---

## Lệnh Git hữu ích

```bash
# Xem user hiện tại
git config --global user.name
git config --global user.email

# Đổi user (nếu cần)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Xem remote URLs
git remote -v

# Xóa credentials đã lưu (nếu cần đăng nhập lại)
git credential-manager-core erase https://github.com

# Hoặc trên Windows:
cmdkey /list
cmdkey /delete:git:https://github.com
```

---

## Khuyến nghị

1. **Nếu là dự án cá nhân:** Dùng SSH (Giải pháp 3) - an toàn và tiện lợi nhất
2. **Nếu cần nhanh:** Dùng Personal Access Token (Giải pháp 1)
3. **Nếu dùng nhiều repo:** Dùng GitHub CLI (Giải pháp 2)

