# Vì sao Repository Public vẫn bị lỗi 403?

## Giải thích

**Repository Public** chỉ có nghĩa là:
- ✅ Ai cũng có thể **clone** và **xem** code
- ✅ Ai cũng có thể **fork** repository
- ❌ **KHÔNG** có nghĩa là ai cũng có thể **push** trực tiếp

Để **push** vào repository, bạn cần:
1. Là **owner** của repo, hoặc
2. Là **collaborator** được owner thêm vào, hoặc
3. **Fork** repo về tài khoản của bạn và push vào fork đó

---

## Giải Pháp: Fork và Push vào Fork của bạn

### Bước 1: Fork Repository trên GitHub

1. Vào https://github.com/MThaiTran/BTL_IOT_N12_L06
2. Click nút **Fork** ở góc trên bên phải
3. Fork về tài khoản `CrisBui` của bạn

### Bước 2: Đổi Remote URL sang Fork của bạn

```bash
cd D:\Ky 1 nam 4\IOT\BTL_IOT_N12_L06

# Xem remote hiện tại
git remote -v

# Đổi origin sang fork của bạn
git remote set-url origin https://github.com/CrisBui/BTL_IOT_N12_L06.git

# Hoặc nếu muốn giữ original như upstream:
git remote set-url origin https://github.com/CrisBui/BTL_IOT_N12_L06.git
git remote add upstream https://github.com/MThaiTran/BTL_IOT_N12_L06.git
```

### Bước 3: Push vào Fork của bạn

```bash
git push origin Son_FE
```

Bây giờ bạn có thể push vì bạn là owner của fork đó!

---

## Giải Pháp 2: Xác thực lại với GitHub

Có thể credentials đã lưu bị lỗi. Hãy xóa và đăng nhập lại:

### Xóa credentials cũ:

```bash
# Xem credentials đã lưu
cmdkey /list

# Xóa credentials GitHub (nếu có)
cmdkey /delete:git:https://github.com
```

### Đăng nhập lại:

**Cách 1: Dùng GitHub CLI**
```bash
gh auth login
```

**Cách 2: Dùng Personal Access Token**
1. Tạo token trên GitHub (như hướng dẫn trước)
2. Khi push, nhập token thay vì password

**Cách 3: Dùng SSH**
```bash
# Tạo SSH key (nếu chưa có)
ssh-keygen -t ed25519 -C "thaotao768@gmail.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Thêm vào GitHub: Settings → SSH and GPG keys
# Đổi remote sang SSH
git remote set-url origin git@github.com:CrisBui/BTL_IOT_N12_L06.git
```

---

## Giải Pháp 3: Yêu cầu quyền Collaborator

Nếu bạn muốn push trực tiếp vào repo gốc:

1. Liên hệ owner (MThaiTran) yêu cầu thêm bạn làm **collaborator**
2. Owner vào repo → Settings → Collaborators → Add people
3. Sau khi được thêm, bạn có thể push bình thường

---

## Kiểm tra quyền truy cập

Để kiểm tra bạn có quyền push không:

```bash
# Clone lại repo (test)
git clone https://github.com/MThaiTran/BTL_IOT_N12_L06.git test-repo
cd test-repo

# Thử tạo branch và push
git checkout -b test-branch
echo "test" > test.txt
git add test.txt
git commit -m "test"
git push origin test-branch
```

Nếu vẫn lỗi 403 → Bạn không có quyền, cần fork hoặc xin quyền collaborator.

---

## Khuyến nghị

**Nếu làm việc nhóm:**
- Yêu cầu được thêm làm **collaborator**
- Hoặc sử dụng workflow: Fork → Push → Pull Request

**Nếu làm cá nhân:**
- Fork repo về tài khoản của bạn
- Push vào fork đó
- Khi cần merge vào repo chính, tạo Pull Request

