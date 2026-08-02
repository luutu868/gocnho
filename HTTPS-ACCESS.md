# ✅ HTTPS đã sẵn sàng!

## 🎉 Truy cập ứng dụng

Mở browser và truy cập: **https://localhost**

## 🔒 Accept Self-Signed Certificate

### Bước 1: Truy cập https://localhost

Browser sẽ hiển thị cảnh báo: **"Your connection is not private"** hoặc **"NET::ERR_CERT_AUTHORITY_INVALID"**

### Bước 2: Accept Certificate

#### Chrome / Edge / Brave
1. Click **"Advanced"** hoặc **"Chi tiết"**
2. Click **"Proceed to localhost (unsafe)"** hoặc **"Tiếp tục đến localhost (không an toàn)"**

#### Firefox
1. Click **"Advanced"** hoặc **"Nâng cao"**
2. Click **"Accept the Risk and Continue"** hoặc **"Chấp nhận rủi ro và tiếp tục"**

### Bước 3: Tận hưởng!

Trang web sẽ load với HTTPS 🔒

## ℹ️ Tại sao có cảnh báo?

Đây là certificate **tự ký (self-signed)** cho môi trường development, không được ký bởi một Certificate Authority (CA) chính thức.

**Trong development:** Hoàn toàn bình thường và an toàn!

**Trong production:** Sẽ dùng Let's Encrypt để có SSL certificate chính thức (miễn phí).

## 🚀 Kiểm tra kết nối

Sau khi accept cert, kiểm tra:
- ✅ URL bar hiển thị ổ khóa 🔒
- ✅ Protocol: `https://`
- ✅ Tất cả ảnh sản phẩm hiển thị
- ✅ API calls hoạt động

## 🔧 Troubleshooting

### Vẫn không vào được?

```powershell
# Kiểm tra frontend container
docker ps --filter "name=cafegocnho-fe"

# Xem logs
docker compose -f docker-compose.fe.yml logs frontend

# Restart frontend
docker compose -f docker-compose.fe.yml restart frontend
```

### Test HTTPS từ command line

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://localhost" -SkipCertificateCheck

# hoặc
curl -k https://localhost
```

## 📝 Thông tin SSL Certificate

- **Type:** Self-signed
- **Valid for:** 365 days (từ 2026-08-02)
- **Algorithm:** RSA 2048-bit
- **Location:** `frontend/ssl/localhost.crt` & `localhost.key`
- **Mount:** Bind volume (không trong image)

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend (HTTPS) | https://localhost |
| Frontend (HTTP) | http://localhost → redirect to HTTPS |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

**🎊 Chúc mừng! Bạn đã setup thành công Docker Compose + HTTPS!**
