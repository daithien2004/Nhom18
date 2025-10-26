# ZaloUTE

ZaloUTE là một ứng dụng web chat mô phỏng Zalo, được phát triển bởi nhóm **Nhóm 18**. Dự án này nhằm mục đích học tập và thực hành phát triển ứng dụng full-stack với các công nghệ hiện đại.

---

## 🚀 Tính năng chính

- Đăng nhập / đăng ký người dùng
- Gửi/nhận tin nhắn thời gian thực
- Danh sách bạn bè, phòng chat riêng
- Giao diện đẹp, responsive với Tailwind CSS
- Fetch dữ liệu qua REST API từ backend
- Thông báo, hình ảnh gửi kèm, emoji, trạng thái online/offline

---

## 🛠️ Công nghệ sử dụng

| Phần         | Công nghệ                                   |
| ------------ | ------------------------------------------- |
| **Backend**  | Node.js, Express.js, MongoDB (qua Mongoose) |
| **Frontend** | React.js, Tailwind CSS, Axios               |
| **Realtime** | Socket.io                                   |
| **Xác thực** | JWT (JSON Web Token)                        |

---

## 📂 Cấu trúc thư mục

```
/
├─ backend/      ← mã nguồn phía server
└─ frontend/     ← mã nguồn phía client
```

## 🧑‍💻 Hướng dẫn chạy dự án (Local)

### 1. Clone repository

```bash
git clone https://github.com/daithien2004/Nhom18.git
cd Nhom18
```

### 2. Cài đặt và chạy backend

```bash
cd backend
npm install
# cấu hình file env (.env) với thông số kết nối PORT, MongoDB, EMAIL_USER, EMAIL_PASS, JWT_SECRET, JWT_EXPIRE, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
npm run dev
```

### 3. Cài đặt và chạy frontend

```bash
cd ../frontend
npm install
# cấu hình base URL của API (VITE_BACKEND_URL) trong file (.env)
npm run dev
```

### 4. Truy cập ứng dụng

Mở trình duyệt và truy cập `http://localhost:5173`

---

## ✅ Hướng tiếp theo / nâng cấp

- Tối ưu UI/UX: dark-mode, animation, trạng thái người dùng
- Viết kiểm thử: Unit tests (frontend + backend) và e2e testing
- Triển khai production: dùng Docker, CI/CD, SSL, domain riêng

---

## 👥 Nhóm phát triển

- Thành viên: [Quảng Đại Thiện]
- Thành viên: [Nguyễn Tuấn Thành]
- Thành viên: [Huỳnh Thái Toàn]

---
