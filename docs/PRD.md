# PRD — Tiệm Cafe Góc Nhỏ

> Mô tả ngắn: Web App đặt món online cho quán cafe "Tiệm Cafe Góc Nhỏ", cho phép khách xem menu, tùy chỉnh món (size/đường/đá), đặt hàng và thanh toán qua VietQR — không cần tải app, không cần đăng ký.

---

## ① Overview

- **App name:** Tiệm Cafe Góc Nhỏ
- **Tagline:** Gọi món siêu tiện — không chờ, không cài, không đăng ký.
- **Problem:** Khách vào quán giờ cao điểm phải chờ nhân viên ra order, dễ gọi nhầm món (nhầm size, quên ghi chú đường/đá), đặc biệt với khách lần đầu chưa quen menu. Quán nhỏ không có POS chuyên nghiệp, nhân viên không kịp ghi chép và tính tiền chính xác cho từng bàn.
- **Solution:** Một Web App PWA mở trực tiếp trên trình duyệt điện thoại. Khách quét mã QR trên bàn → vào menu trực quan → chọn món & tùy chỉnh → thanh toán bằng cách quét mã VietQR (chuyển khoản ngân hàng) → bếp/nhân viên nhận order ngay lập tức.
- **Platform:** Web (PWA — hoạt động như native app trên mobile, có thể "Add to Home Screen")

---

## ② Target User

**Persona chính: Khách uống cafe — Ngọc, 22 tuổi, sinh viên**
- Tên / độ tuổi / nghề nghiệp: Ngọc, 22, sinh viên đại học
- Họ đang làm gì hàng ngày: Đi học, ngồi cafe học bài/làm việc nhóm, hay ghé quán 2-3 lần/tuần
- Nỗi đau cụ thể:
  - Quán đông phải vẫy tay mãi mới có nhân viên ra order
  - Hay quên dặn "ít đường" rồi nhận ly ngọt quá không uống được
  - Lúc order hay bị nhầm size (gọi M mà ra S)
  - Không biết tổng tiền cho cả nhóm đến lúc tính, ngại chia
  - Không muốn cài thêm app điện thoại
- Họ dùng tool nào hiện tại: Không có — gọi trực tiếp với nhân viên, thanh toán tiền mặt hoặc chuyển khoản thủ công

**Persona phụ: Nhân viên pha chế — Tú, 20 tuổi, part-time**
- Đau: Nhận order bằng giấy, chữ khó đọc, dễ sai, không biết order nào của bàn nào, không theo dõi được đã làm xong chưa.

**Persona phụ: Chủ quán — chị Hương, 30 tuổi**
- Đau: Không có hệ thống quản lý order, không biết món nào bán chạy, dễ thất thoát tiền mặt, không có dữ liệu khách hàng.

---

## ③ Features & User Stories

> Status: 📝 Draft | ⏳ Todo | 🔄 In Progress | ⚠️ Partial | ✅ Done
> Mỗi buổi build: chọn story `⏳ Todo` → `🔄 In Progress` → implement → test → `✅ Done`

---

### 🟢 MUST (bắt buộc có trong MVP)

#### Feature 1: [MEN] ✅ Done — Xem menu và danh mục món
**Story:** [MEN-01] ✅ Done — Là khách Ngọc lần đầu đến quán, tôi muốn xem menu có hình ảnh, giá tiền rõ ràng và phân loại theo nhóm (cafe, trà, sinh tố, bánh...), để dễ dàng chọn món mình thích mà không cần hỏi nhân viên.

**Done khi:**
- ✅ Menu hiển thị theo 7 danh mục: Cà phê, Trà, Sinh tố, Đá xay, Nước ép, Bánh ngọt, Ăn nhẹ
- ✅ Mỗi món có: ảnh, tên, giá, mô tả ngắn (1-2 dòng)
- ✅ Ảnh placeholder tự động: khi `image_url` NULL hoặc load ảnh lỗi → hiển thị placeholder CSS/SVG inline. Mỗi danh mục có 1 màu nền riêng, hiển thị chữ viết tắt tên món (2-3 ký tự đầu) ở giữa. Frontend xử lý bằng `onError` của `<img>` + fallback component
- ✅ Lọc được theo danh mục (tab ngang hoặc dropdown)
- ✅ Tìm kiếm món theo tên (search bar)
- ✅ Responsive — mobile-first, xem đẹp trên điện thoại
- ❌ Không làm ảnh 360° hay video món

**Menu mẫu (seed data — 22 món):**

> Tất cả món nước mặc định có tùy chỉnh: **Đường** (0% / 30% / 50% / 70% / 100%), **Đá** (Không đá / Ít đá / Bình thường).  
> Size S/M/L chỉ áp dụng cho món có ghi giá theo size. Món ghi 1 giá = 1 size duy nhất.  
> Topping (mỗi loại +7,000đ): Trân châu đen, Kem béo, Thạch cà phê, Đào miếng, Thạch dừa, Kem cheese. Ghi "Topping: ✓" = món đó được thêm topping.

| # | Danh mục | Tên món | Giá | Size options | Đường | Đá | Topping | Mô tả |
|---|---|---|---|---|---|---|---|---|
| 1 | Cà phê | Cà phê đen | S: 25K / M: 30K / L: 35K | S/M/L | ✓ | ✓ | — | Cà phê phin nguyên chất, đậm đà. Dành cho tín đồ cafe truyền thống. |
| 2 | Cà phê | Cà phê sữa | S: 28K / M: 33K / L: 38K | S/M/L | ✓ | ✓ | — | Cà phê phin + sữa đặc, vị đắng hậu ngọt — best seller của quán. |
| 3 | Cà phê | Bạc xỉu | S: 28K / M: 33K / L: 38K | S/M/L | ✓ | ✓ | — | Sữa nhiều, cà phê ít — dành cho người thích vị nhẹ nhàng, béo thơm. |
| 4 | Cà phê | Cà phê trứng | 38K | M (1 size) | ✓ | — | — | Cà phê phin phủ kem trứng đánh bông. Không có tùy chọn đá. |
| 5 | Cà phê | Cà phê cốt dừa | 35K | M/L | ✓ | ✓ | Kem béo | Cà phê đen + nước cốt dừa béo ngậy, lắc đều trước khi uống. |
| 6 | Trà | Trà đào | 35K | M/L | ✓ | ✓ | — | Trà đen + đào ngâm, thanh mát, thơm dịu. |
| 7 | Trà | Trà vải | 35K | M/L | ✓ | ✓ | — | Trà xanh + vải ngâm, ngọt thanh tự nhiên. |
| 8 | Trà | Trà chanh mật ong | 30K | M/L | ✓ (0/30/50) | ✓ | — | Trà đen + chanh tươi + mật ong. Chỉ 3 mức đường — không có 70%, 100%. |
| 9 | Trà | Trà sữa ô long | S: 32K / M: 38K / L: 42K | S/M/L | ✓ | ✓ | ✓ | Trà ô long + sữa tươi, thơm tự nhiên, không dùng bột pha sẵn. |
| 10 | Trà | Trà sữa matcha | 40K | M/L | ✓ | ✓ | ✓ | Matcha Nhật + sữa tươi, màu xanh đẹp, vị chát nhẹ hậu ngọt. |
| 11 | Sinh tố | Sinh tố bơ | 40K | M/L | ❌ (không chỉnh đường) | — | — | Bơ sáp + sữa đặc + đá xay mịn. Chỉ chọn size, không chọn đường/đá. |
| 12 | Sinh tố | Sinh tố xoài | 38K | M/L | ❌ (không chỉnh đường) | — | — | Xoài chín tươi + sữa chua + đá xay. |
| 13 | Sinh tố | Sinh tố dâu | 40K | M/L | ❌ (không chỉnh đường) | — | — | Dâu tây Đà Lạt + sữa đặc + đá xay. |
| 14 | Đá xay | Đá xay cà phê | 42K | M/L | ✓ | — | ✓ | Cà phê + đá xay như đá bào, uống mát lạnh ngày nóng. |
| 15 | Đá xay | Đá xay trà xanh | 42K | M/L | ✓ | — | ✓ | Trà xanh matcha + sữa + đá xay mịn. |
| 16 | Đá xay | Đá xay socola | 42K | M/L | ✓ | — | Kem béo | Socola đen + sữa + đá xay, vị đắng nhẹ của cacao. |
| 17 | Nước ép | Nước ép cam tươi | 35K | M/L | ❌ (không chỉnh đường) | ✓ | — | Cam tươi vắt nguyên chất, không đường, không nước pha. |
| 18 | Nước ép | Nước ép ổi | 30K | M/L | ✓ | ✓ | — | Ổi ruột đỏ tươi ép lấy nước, thơm mát. |
| 19 | Nước ép | Nước ép dưa hấu | 30K | M/L | ❌ (không chỉnh đường) | ✓ | — | Dưa hấu tươi ép nguyên chất, ngọt tự nhiên. |
| 20 | Bánh ngọt | Bánh flan | 15K | 1 size | — | — | — | Caramel flan béo mịn, làm từ trứng + sữa tươi. |
| 21 | Bánh ngọt | Tiramisu | 30K | 1 size | — | — | — | Tiramisu chuẩn vị Ý: cà phê + mascarpone + bột cacao. |
| 22 | Ăn nhẹ | Bánh mì nướng muối ớt | 20K | 1 size | — | — | — | Bánh mì giòn tan phết bơ + muối ớt, nướng nóng hổi. |

**Quy tắc tùy chỉnh theo danh mục:**
- **Cà phê, Trà:** luôn có Đường + Đá (trừ Cà phê trứng không đá)
- **Sinh tố:** không có tùy chọn Đường/Đá (nguyên liệu đã chuẩn hóa)
- **Đá xay:** không có tùy chọn Đá (luôn có đá), có Đường
- **Nước ép:** tùy món (cam, dưa hấu — không đường; ổi — có đường)
- **Bánh ngọt, Ăn nhẹ:** không tùy chỉnh gì, chỉ 1 size
- **Topping:** chỉ áp dụng cho các món Trà sữa, Đá xay, và Cà phê cốt dừa (xem cột Topping)

**Màu placeholder ảnh món theo danh mục (CSS class / Tailwind):**
| Danh mục | Màu nền | Chữ viết tắt (ví dụ) |
|---|---|---|
| Cà phê | `#6F4E37` (nâu cafe) | "CĐ" (Cà phê đen), "CS" (Cà phê sữa) |
| Trà | `#C8A951` (vàng trà) | "TĐ" (Trà đào), "TS" (Trà sữa) |
| Sinh tố | `#4CAF50` (xanh lá) | "SB" (Sinh tố bơ), "SX" (Sinh tố xoài) |
| Đá xay | `#00BCD4` (xanh cyan) | "ĐX" (Đá xay cà phê) |
| Nước ép | `#FF9800` (cam) | "NC" (Nước cam), "NỔ" (Nước ổi) |
| Bánh ngọt | `#E91E63` (hồng) | "BF" (Bánh flan) |
| Ăn nhẹ | `#FFC107` (vàng hổ phách) | "BM" (Bánh mì) |

---

#### Feature 2: [TCH] ⏳ Todo — Tùy chỉnh món (size, đường, đá, topping)
**Story:** [TCH-01] ⏳ Todo — Là khách Ngọc, tôi muốn chọn size S/M/L, mức đường (0% - 30% - 50% - 70% - 100%), mức đá (không đá - ít đá - bình thường) và thêm topping nếu có, để món nước ra đúng gu của tôi, không bị ngọt quá hay nhạt quá.

**Done khi:**
- ✅ Mỗi món nước có tùy chọn: Size (S/M/L, mỗi size có giá khác nhau)
- ✅ Mỗi món nước có tùy chọn: Đường (0% / 30% / 50% / 70% / 100%)
- ✅ Mỗi món nước có tùy chọn: Đá (Không đá / Ít đá / Bình thường)
- ✅ Mỗi món có thể có danh sách topping riêng (mỗi topping +giá)
- ✅ Giá cập nhật real-time khi thay đổi tùy chọn
- ✅ Ghi chú thêm nếu khách muốn (text field, max 100 ký tự)
- ❌ Không làm combo phức tạp (chỉ có topping đơn lẻ)
- ❌ Không lưu "món yêu thích" trong MVP

---

#### Feature 3: [GIH] ⏳ Todo — Giỏ hàng & đặt món
**Story:** [GIH-01] ⏳ Todo — Là khách Ngọc đi cùng nhóm 3 người, tôi muốn thêm nhiều món vào giỏ, xem lại danh sách đã chọn, sửa/xóa từng món, và thấy tổng tiền rõ ràng trước khi đặt, để kiểm soát chi tiêu và tránh đặt nhầm.

**Done khi:**
- ✅ Nút "Thêm vào giỏ" ở mỗi món sau khi chọn xong tùy chỉnh
- ✅ Icon giỏ hàng có badge hiển thị số lượng món
- ✅ Màn giỏ hàng: list món kèm tùy chỉnh, giá từng món, tổng tiền
- ✅ Sửa được tùy chỉnh từng món trong giỏ
- ✅ Xóa từng món khỏi giỏ
- ✅ Nút "Đặt món" → gọi API `POST /orders` tạo đơn hàng (status: `pending_payment`), xóa giỏ hàng, redirect sang `/checkout?order=TC-xxx`
- ✅ Giỏ hàng lưu trong localStorage — không mất khi refresh
- ❌ Không chia giỏ theo bàn (sẽ làm ở giai đoạn sau)
- ❌ Không tự động gộp bàn

---

#### Feature 4: [THA] ⏳ Todo — Thanh toán qua VietQR
**Story:** [THA-01] ⏳ Todo — Là khách Ngọc, tôi muốn thanh toán nhanh bằng cách quét mã VietQR qua app ngân hàng trên điện thoại (không cần tiền mặt, không cần thẻ), để tiết kiệm thời gian và không phải chờ nhân viên tính tiền.

**Done khi:**
- ✅ Trang checkout hiển thị thông tin đơn hàng đã tạo (mã đơn, danh sách món, tổng tiền)
- ✅ Phương thức thanh toán: chọn "Chuyển khoản (VietQR)" hoặc "Tiền mặt"
- ✅ Nếu chọn VietQR: hiển thị mã QR với số tiền = tổng đơn, chứa đầy đủ thông tin: STK ngân hàng quán, tên chủ TK, số tiền, nội dung chuyển khoản (mã đơn hàng)
- ✅ Hướng dẫn ngắn gọn: "Mở app ngân hàng → Quét mã QR → Xác nhận chuyển khoản"
- ✅ Sau khi khách bấm "Tôi đã chuyển khoản" → API `PATCH /orders/{id}/confirm-payment` → status chuyển `pending_payment` → `confirmed`, redirect sang màn xác nhận
- ✅ Nếu chọn Tiền mặt: bấm "Xác nhận đặt món (tiền mặt)" → API `PATCH /orders/{id}/confirm-cash` → status chuyển thẳng sang `confirmed`, redirect sang màn xác nhận. Hiển thị "Nhân viên sẽ thu tiền khi mang nước ra"
- ✅ Màn xác nhận (`/order-confirmed/{order_code}`): Icon ✅, mã đơn, danh sách món, bàn số, phương thức thanh toán
- ✅ Sinh mã đơn hàng unique (format: TC-YYYYMMDD-XXXX)
- ❌ Không tích hợp webhook ngân hàng để tự động xác nhận thanh toán trong MVP (dùng manual confirm)
- ❌ Không hỗ trợ ví điện tử (Momo, ZaloPay) trong MVP

---

#### Feature 5: [NVI] ⏳ Todo — Dashboard nhân viên (nhận & xử lý order)
**Story:** [NVI-01] ⏳ Todo — Là nhân viên Tú, tôi muốn thấy order mới hiện lên màn hình ngay lập tức, biết order đó của bàn nào, gồm những món gì với tùy chỉnh ra sao, và bấm "Đã làm xong" khi pha chế xong từng món, để không bỏ sót order và làm đúng yêu cầu khách.

**Done khi:**
- ✅ Màn hình dashboard cho nhân viên (URL riêng: `/staff`)
- ✅ Hệ thống đăng nhập nhân viên bằng staff_code + PIN:
  - Mỗi nhân viên có 1 tài khoản riêng (staff_code duy nhất + tên + PIN 6 chữ số)
  - PIN hash bằng bcrypt, lưu trong bảng `staff` của database
  - Chủ quán tạo & quản lý tài khoản nhân viên trong trang Admin
  - Sai PIN quá 5 lần → lock tài khoản 15 phút (đếm trong Redis, TTL 900s)
  - Session staff có thời hạn 8 tiếng (HttpOnly Session cookie + Redis), sau đó phải nhập lại PIN
  - Chủ quán có thể xóa tài khoản nhân viên (nghỉ việc) trong Admin — xóa mềm (soft delete: `is_active = false`)
- ✅ Order mới tự động hiện lên bằng polling REST API mỗi 3s (không dùng WebSocket trong MVP)
- ✅ Mỗi order hiển thị: mã đơn, bàn số, thời gian đặt, danh sách món + tùy chỉnh, tổng tiền, trạng thái
- ✅ Trạng thái order (single lifecycle): **`pending_payment` → `confirmed` → `preparing` → `completed`** (hoặc `pending_payment` → `expired`)
  - `pending_payment`: vừa tạo từ giỏ hàng, chưa thanh toán
  - `confirmed`: đã thanh toán (CK hoặc tiền mặt), hiển thị ở cột "Mới" trên dashboard
  - `preparing`: nhân viên bấm "Đang làm", hiển thị ở cột "Đang làm"
  - `completed`: nhân viên bấm "Xong", hiển thị ở cột "Xong"
  - `expired`: quá 15 phút không thanh toán (terminal state, không hiển thị trên dashboard)
- ✅ Có thể đánh dấu từng món "đã làm xong"
- ✅ Phân biệt order "chuyển khoản" và "tiền mặt"
- ❌ Không làm thông báo âm thanh trong MVP
- ❌ Không chia thành bếp và quầy riêng

---

### 🔵 SHOULD (nên có, không gấp)

#### Feature 6: [BAN] ⏳ Todo — Chọn bàn qua QR
**Story:** [BAN-01] ⏳ Todo — Là khách Ngọc, tôi muốn quét mã QR dán trên bàn là vào thẳng menu của quán, và hệ thống tự nhận biết tôi đang ngồi bàn số mấy, để nhân viên biết mang nước ra đúng bàn mà tôi không cần nhập thủ công.

**Done khi:**
- ✅ Mỗi bàn có 1 mã QR riêng chứa URL dạng `.../?table=XX`
- ✅ App đọc `table` param từ URL và gán vào order
- ✅ `table` được lưu vào localStorage cùng giỏ hàng → không mất khi refresh, tắt app, mất mạng
- ✅ Nếu vào app không có `table` param VÀ không có trong localStorage → hiển thị popup "Bạn ngồi bàn số mấy?" (chỉ hiện khi checkout hoặc khi bấm thêm món đầu tiên). Khách nhập bàn thủ công hoặc chọn từ danh sách bàn active
- ✅ Khi checkout, nếu vẫn chưa có `table` (khách bỏ qua popup) → bắt buộc chọn bàn trước khi đặt, không cho skip
- ✅ Admin có trang quản lý bàn: thêm từng bàn / thêm hàng loạt, xem QR code trực tiếp, tải từng QR hoặc tải ZIP tất cả QR
- ✅ QR hiển thị inline khi bấm nút xem, có nút tải ảnh PNG riêng từng bàn
- ✅ Nút "Tải tất cả QR (ZIP)" — tải 1 file ZIP chứa toàn bộ QR của tất cả bàn đang active
- ❌ Không làm QR động (static QR cho từng bàn)

---

#### Feature 7: [QLY] ⏳ Todo — Trang quản lý menu cho chủ quán
**Story:** [QLY-01] ⏳ Todo — Là chị Hương (chủ quán), tôi muốn tự thêm/sửa/xóa món trên menu, cập nhật giá, up ảnh mới, và ẩn món hết hàng, để menu luôn chính xác mà không cần gọi developer.

**Done khi:**
- ✅ Trang admin: đăng nhập bằng username/password (bảng riêng `admins`, không dùng chung với bảng `staff` của nhân viên)
- ✅ CRUD danh mục món
- ✅ CRUD món (tên, ảnh, mô tả, danh mục, trạng thái còn/hết hàng). Giá lưu trong bảng `item_sizes` — mỗi size có giá tuyệt đối riêng (VD: cà phê đen có 3 dòng: S=25000, M=30000, L=35000). Món 1 size duy nhất vẫn lưu trong `item_sizes` với size = `null` hoặc `"M"`. Admin nhập giá trực tiếp cho từng size, không dùng % surcharge
- ✅ Toggle "Còn hàng / Hết hàng" cho từng món
- ✅ Quản lý topping (thêm/xóa/sửa, gán vào món) — 6 loại topping: Trân châu đen, Kem béo, Thạch cà phê, Đào miếng, Thạch dừa, Kem cheese
- ✅ Upload ảnh món (validate JPG/PNG/WebP, max 5MB, tự động resize 800px + chuyển WebP)
- ✅ Quản lý nhân viên (CRUD): tạo tài khoản (tên + PIN 6 số), sửa tên, reset PIN, vô hiệu hóa/xóa tài khoản (soft delete `is_active = false`)
- ✅ Trang Cấu hình chung: tên quán, SĐT, địa chỉ, thông tin ngân hàng nhận tiền VietQR (tên NH, chi nhánh/tỉnh, STK, tên chủ TK, mã BIN ngân hàng). Lưu vào bảng `settings` (key-value) trong DB
- ✅ Giao diện admin dạng sidebar (desktop) + hamburger menu (mobile) với 7 mục: Danh mục, Món, Topping, Nhân viên, Bàn & QR, Đơn hàng, Cấu hình
- ✅ Seed tài khoản admin mặc định khi deploy lần đầu: `admin` / `admin123` (hash bcrypt). Script seed chạy trong Alembic migration. Bắt buộc đổi password trong lần đăng nhập đầu tiên (nếu `password_changed_at` IS NULL → redirect đến trang đổi password trước khi vào admin)
- ❌ Không làm quản lý ảnh nâng cao (crop thủ công)

---

### 🟠 NICE TO HAVE (sau này thêm)

- [ ] **[TKH] Tài khoản khách hàng & lịch sử đơn hàng** — Khách đăng ký bằng SĐT, xem lại các lần order trước để order lại nhanh
- [ ] **[YTH] Món yêu thích** — Khách "tim" món hay uống để tìm nhanh ở đầu menu
- [ ] **[TDI] Tích điểm loyalty** — Mỗi đơn tích điểm, đủ 10 ly tặng 1 ly
- [ ] **[DTR] Đặt trước / hẹn giờ** — Khách đặt món trước giờ đến để không phải chờ
- [ ] **[GOY] Gợi ý món (AI)** — Dựa trên lịch sử order và thời tiết để gợi ý món
- [ ] **[DGI] Feedback & đánh giá món** — Khách rate 1-5 sao cho món đã uống
- [ ] **[TBA] Thông báo push** — Báo cho khách khi order đang được làm/xong
- [ ] **[BCA] Báo cáo doanh thu** — Dashboard cho chủ quán: số đơn/ngày, món bán chạy, doanh thu theo giờ
- [ ] **[DNG] Multi-language** — Hỗ trợ tiếng Anh cho khách du lịch
- [ ] **[MIN] Tích hợp máy in** — Tự động in order ra máy in nhiệt ở quầy
- [ ] **[WBS] WebSocket real-time** — Thay polling 3s bằng WebSocket/SSE để cập nhật order tức thì cho dashboard nhân viên

---

## ④ Tech Stack

> **Nguyên tắc chọn:** 100% open-source, tự host được qua Docker, không phụ thuộc dịch vụ bên thứ 3 nào. Chia rõ FE (`docker-compose.fe.yml`) và BE (`docker-compose.be.yml`) để dễ maintain, deploy độc lập. Tất cả container join chung 1 Docker internal network (`cafegocnho-net`) để giao tiếp nội bộ an toàn, chỉ expose Nginx ra ngoài.

| Layer | Tech | Docker Image | Lý do chọn |
|---|---|---|---|
| Frontend | **React 18** (Vite) + **TailwindCSS** + **shadcn/ui** | `node:20-alpine` (build stage) + **Nginx** serve static | React + Vite build ra static files, Nginx serve siêu nhẹ. TailwindCSS CSS utility-first, shadcn/ui copy-paste component — cả 2 đều MIT license, không lock-in. |
| Backend | **FastAPI** (Python 3.11+) + **Pydantic v2** + **Uvicorn** | `python:3.11-slim` (tự build Dockerfile) | FastAPI MIT license, async-native, auto OpenAPI docs. Mọi logic nghiệp vụ đều nằm trong Docker image tự build — không gọi API bên ngoài. |
| Database | **PostgreSQL 16** | `postgres:16-alpine` | PostgreSQL license, DB quan hệ mạnh nhất OSS. Alpine image siêu nhẹ (~80MB). |
| ORM + Migrate | **SQLAlchemy 2.0** (async) + **Alembic** | (cùng image Backend) | SQLAlchemy MIT license, ORM Python phổ biến nhất. Alembic đi kèm, migrate schema qua CLI ngay trong container. |
| Auth (Admin) | **PyJWT** + **OAuth2PasswordBearer** (FastAPI built-in) | (cùng image Backend) | PyJWT MIT license. Admin đăng nhập bằng username/password, hash bcrypt. Bảng riêng: `admins`. JWT session cho admin. |
| Auth (Staff) | **Session cookie** + PIN 6 số (hash bcrypt) + Redis | (cùng image Backend) | Nhân viên đăng nhập bằng staff_code + PIN 6 số qua Session cookie HttpOnly. Bảng riêng: `staff`. Lock sau 5 lần sai (Redis TTL 900s). Cookie session 8 tiếng. |
| Auth (Khách) | **Không cần** — anonymous order | — | MVP không yêu cầu đăng ký/đăng nhập. Giỏ hàng lưu localStorage phía client. |
| File Storage | **MinIO** | `minio/minio:latest` | MinIO AGPL license, S3-compatible, chạy 1 container duy nhất. Lưu ảnh menu + QR code. Sau này cần scale thì migrate lên AWS S3 không sửa code. |
| Cache + Broker | **Redis 7** | `redis:7-alpine` | Redis BSD license, vừa làm Celery broker, vừa cache menu + session. Alpine image ~12MB. |
| Task Queue | **Celery** + **Celery Beat** | (cùng image Backend, entrypoint riêng cho worker và beat) | Celery BSD license. Worker xử lý background tasks. Celery Beat scheduler chạy cron jobs. Cần 2 container: `celery-worker` và `celery-beat`. |
| Reverse Proxy | **Nginx** | `nginx:alpine` | Nginx 2-clause BSD license. Làm reverse proxy cho FastAPI, serve static frontend, terminate SSL qua Certbot. |
| SSL | **Certbot + Let's Encrypt** | `certbot/certbot` (cron job ngoài Docker hoặc image riêng) | Miễn phí, tự động renew, chạy cron trên host hoặc Docker container phụ. |
| Thanh toán | **VietQR** — tự generate QR bằng `qrcode` + `Pillow` | (cùng image Backend) | Chuẩn Napas quốc gia, tự generate QR ngay trong code Python — không gọi API bên thứ 3, không tốn phí. |
| Monitoring (optional) | **Prometheus + Grafana** | `prom/prometheus` + `grafana/grafana` | Apache 2.0 + AGPL license. Theo dõi health check, latency API, số đơn/giờ. Có thể thêm sau MVP. |

---

## ⑤ Integration Points

> Ghi rõ luồng cho mỗi tích hợp bên thứ 3

### VietQR — Thanh toán chuyển khoản

**Luồng:**
1. Khách bấm "Đặt món" từ giỏ hàng → Frontend gọi `POST /orders` tạo đơn (status: `pending_payment`)
2. Backend tạo order trong DB, sinh mã đơn unique (TC-YYYYMMDD-XXXX), generate QR code ngay trong response, trả về `{ order_code, total_amount, qr_code_data, bank_info, ... }`
3. Frontend nhận response → redirect sang `/checkout?order=TC-xxx` — hiển thị thông tin đơn + QR code + chọn phương thức thanh toán
4. QR code đã có sẵn từ bước 2 — không cần gọi thêm API. Backend đọc thông tin ngân hàng từ bảng `settings` (Admin → Cấu hình) và sinh chuỗi VietQR theo chuẩn Napas:
   ```
   00020101021238570010A00000072701270008<Mã-NH-BIN>0113<STK>0208QRIBFTTA53037045405<VND>5802VN62<Tên-quán>08<Tỉnh-TP>08<Mã-đơn>6304<CRC>
   ```
5. Frontend render mã QR (dùng thư viện `qrcode`), kèm số tiền và hướng dẫn
6. Khách mở app ngân hàng, quét mã, chuyển khoản
7. Khách bấm "Tôi đã chuyển khoản" → Frontend gọi `POST /orders/{order_code}/confirm-payment`
8. Backend cập nhật trạng thái: `pending_payment` → `confirmed`, dashboard nhân viên sẽ thấy ở lần poll tiếp theo
9. Nếu khách chọn "Tiền mặt" → gọi `POST /orders/{order_code}/confirm-cash` → status → `confirmed` luôn

**Cấu hình ngân hàng (Admin → Cấu hình):**
| Key | Mô tả | Ví dụ |
|---|---|---|
| `bank_name` | Tên ngân hàng nhận tiền | "VPBank" |
| `bank_bin` | Mã BIN ngân hàng (6 chữ số) | "970432" |
| `bank_account_no` | Số tài khoản | "680180598" |
| `bank_account_name` | Tên chủ tài khoản | "LUU VAN TU" |
| `bank_branch` | Chi nhánh / tỉnh thành | "Hà Nội" |

**❌ Không xử lý:**
- Webhook ngân hàng tự động xác nhận (cần business account + ký hợp đồng với ngân hàng)
- Hoàn tiền tự động nếu khách chuyển nhầm số tiền
- Xác minh giao dịch thực sự đã vào tài khoản (manual đối soát cuối ngày)

### Polling REST API — Cập nhật order cho dashboard nhân viên

**Luồng:**
1. Dashboard nhân viên gọi `GET /api/orders?status=confirmed,preparing` mỗi 3 giây
2. Backend trả về danh sách order theo trạng thái, sắp xếp theo thời gian tạo (mới nhất trước)
3. Frontend hiển thị 3 cột tương ứng: **Mới** (`confirmed`), **Đang làm** (`preparing`), **Xong** (`completed`)
4. Frontend diff với state hiện tại → thêm order mới vào cột "Mới", di chuyển order giữa các cột khi đổi trạng thái
5. Nhân viên cập nhật trạng thái → gọi REST API `PATCH /orders/{id}/status` với body `{ status: "preparing" | "completed" }` → backend lưu DB
6. Lần poll tiếp theo sẽ phản ánh thay đổi

**❌ Không xử lý:**
- WebSocket / Server-Sent Events (để dành cho giai đoạn sau nếu cần real-time thực sự)
- Conflict resolution khi 2 nhân viên cùng cập nhật 1 order (last-write-wins)
- Optimistic update trên frontend (cập nhật UI ngay, rollback nếu API lỗi)

### QR Bàn — Mã QR tĩnh

**Luồng:**
1. Admin vào trang quản lý bàn, nhập số lượng bàn
2. Hệ thống sinh mã QR cho từng bàn (chứa URL: `https://cafegocnho.vn/?table=B01` — domain trỏ về VPS qua Nginx)
3. Admin tải file in ra, dán lên bàn
4. Khách quét → vào app, order tự động gắn với `table=B01`

**❌ Không xử lý:**
- QR hết hạn (static — không expire)
- QR bị hỏng/mờ (in lại từ admin)

### Celery Background Tasks — Xử lý nền

**Container:** 2 container từ cùng image Backend, entrypoint khác nhau:
- `celery-worker`: chạy `celery -A app worker -l info`
- `celery-beat`: chạy `celery -A app beat -l info --scheduler=celery.beat.PersistentScheduler`

**Task 1: `expire-pending-orders`**
- **Schedule:** Mỗi 1 phút (`crontab: */1 * * * *`)
- **Logic:**
  1. Query tất cả order có `status = 'pending_payment'` và `created_at < now() - 15 phút`
  2. Update `status = 'expired'` cho từng order
  3. Log số lượng order đã expire (để debug)
- **Không làm:** hoàn stock, gửi notify, xóa order

**Task 2: `cleanup-temp-files`**
- **Schedule:** Mỗi ngày lúc 3:00 AM (`crontab: 0 3 * * *`)
- **Logic:**
  1. List tất cả object trong MinIO bucket `temp/`
  2. Với mỗi file, kiểm tra xem có được reference bởi bất kỳ record nào trong DB không (ảnh món, QR code bàn, ảnh upload thất bại)
  3. Xóa các file orphan (không còn reference) đã tồn tại > 24h
  4. Log số file đã xóa
- **Lưu ý:** File ảnh món đã upload thành công được lưu trong bucket `menu/`, không nằm trong `temp/` → không bị ảnh hưởng

---

## ⑥ Non-Functional Requirements

- **Performance:** Trang menu load < 2s (First Contentful Paint), API tạo đơn < 500ms, Dashboard nhân viên nhận order mới < 5s kể từ lúc khách đặt
- **Security:** HTTPS only (Let's Encrypt qua Certbot + Nginx), Admin API bảo vệ bằng JWT + OAuth2, PIN cho dashboard nhân viên (fallback nếu không có session), Input validation (Pydantic) cho tất cả API endpoints, Không lộ STK ngân hàng trên client (chỉ mã QR)
- **Responsive:** Mobile-first — 100% khách dùng trên điện thoại. Admin dashboard chấp nhận desktop/tablet.
- **Concurrency:** Hỗ trợ 20-30 khách đặt cùng lúc (giờ cao điểm), dashboard nhân viên chạy mượt với 3-5 nhân viên cùng mở
- **Uptime:** 99% (VPS + Docker Compose), chấp nhận downtime ngắn ngoài giờ cao điểm. Có thể nâng lên 99.9% nếu sau này chạy 2 VPS + load balancer
- **PWA:** Cài được lên màn hình điện thoại (Add to Home Screen), có service worker cache menu + ảnh, hoạt động offline ở mức cơ bản (menu đã xem vẫn hiển thị)
- **Accessibility:** Độ tương phản màu đủ WCAG AA, nút đủ lớn cho ngón tay (min 44x44px touch target)

---

## ⑦ Edge Cases & Error States

> Ghi những tình huống bất thường — AI sẽ xử lý nếu bạn ghi, sẽ bỏ qua nếu bạn không ghi

| Tình huống | Hành vi mong muốn |
|---|---|
| Khách chưa chọn size/đường/đá đã bấm "Thêm vào giỏ" | Hiển thị validation: "Vui lòng chọn size", highlight field còn thiếu bằng viền đỏ |
| Khách bấm "Đặt món" khi giỏ trống | Disable nút "Đặt món" khi giỏ trống. Nếu bypass được, trả về toast "Giỏ hàng trống" |
| Khách đang đặt thì quán hết món đó (admin ẩn) | Nếu đã trong giỏ thì vẫn giữ, nhưng hiển thị badge "Tạm hết" và không cho thêm mới. Nếu khách cố đặt → "Món [X] hiện đã hết, vui lòng xóa khỏi giỏ" |
| Mất mạng giữa lúc đang đặt món | PWA/Service worker giữ lại state giỏ hàng (localStorage). Khi có mạng lại, khách tiếp tục. Hiển thị banner nhỏ "Đang offline" ở đầu trang |
| Khách quét VietQR xong nhưng quên bấm "Đã chuyển khoản" | Order vẫn ở trạng thái `pending_payment`. Sau 15 phút, cron job đánh dấu `expired`. Nhân viên có thể manual confirm nếu khách đưa bill ngân hàng |
| Khách chuyển khoản sai số tiền (thiếu/thừa) | Order vẫn `pending_payment`. Nhân viên đối chiếu cuối ngày và xử lý thủ công. App không tự động xác nhận |
| Khách thoát app sau khi đặt, không thấy confirm | Order vẫn được lưu trong DB. Khách có thể hỏi nhân viên mã đơn. Sau này (NICE TO HAVE) có thể tra cứu đơn bằng SĐT |
| 2 khách cùng bàn cùng đặt riêng (2 đơn) | Bình thường — mỗi đơn là 1 order riêng biệt, đều gắn cùng `table`. Nhân viên giao đúng theo mã đơn |
| Nhân viên mở dashboard trên điện thoại cá nhân (màn nhỏ) | Dashboard responsive xuống mobile. Ưu tiên desktop/tablet, nhưng mobile vẫn scroll xem được |
| Session admin hết hạn giữa lúc đang sửa menu | Chuyển hướng về trang login, hiển thị toast "Phiên làm việc hết hạn". Lưu draft form vào localStorage nếu có thể |
| API ngân hàng / dịch vụ tạo QR bị lỗi | Tự generate QR theo chuẩn VietQR (dùng thuật toán CRC nội bộ) → không phụ thuộc bên thứ 3. Fallback: hiển thị thông tin chuyển khoản dạng text (STK, số tiền, nội dung) để khách nhập tay |
| Chủ quán chưa cấu hình thông tin ngân hàng trong Admin → Cấu hình | Khi bảng `settings` chưa có bank info: API tạo QR trả về lỗi `503 Service Unavailable` kèm message "Quán chưa cấu hình thông tin thanh toán. Vui lòng liên hệ nhân viên." Khách vẫn có thể chọn "Tiền mặt" để đặt món |
| File upload ảnh món quá lớn (>5MB) | Validate ở client + server. Giới hạn 5MB, định dạng JPG/PNG/WebP. Hiển thị lỗi "Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB" |
| Nhân viên nhập sai PIN liên tục | Sau 5 lần sai → lock tài khoản 15 phút (đếm trong Redis với TTL 900s). Trả về thông báo "Tài khoản tạm khóa, thử lại sau X phút". Chủ quán có thể mở khóa thủ công trong Admin |
| Chủ quán xóa nhân viên đang trong ca làm | Soft delete (`is_active = false`) → nhân viên đó không đăng nhập được nữa. Session hiện tại (nếu có) vẫn hoạt động đến khi hết hạn cookie session (max 8 tiếng) |
| Nhân viên đăng nhập trên nhiều thiết bị cùng lúc | Cho phép — mỗi thiết bị có session cookie riêng trong Redis. Không giới hạn số thiết bị trong MVP |
| Khách vào app không qua QR (không có `table`) | Lưu ý: `table` đã được lưu trong localStorage. Nếu mất cả 2 → hiển thị popup chọn bàn trước khi đặt món. Nếu khách bỏ qua popup → đến bước checkout bắt buộc chọn bàn (không cho skip) |
| Khách đổi bàn sau khi đã thêm món vào giỏ | Hiển thị nút "Đổi bàn" trong giỏ hàng (cạnh số bàn hiện tại). Bấm vào → popup chọn bàn mới → cập nhật `table` trong localStorage + order hiện tại |
| Khách refresh trang checkout (`/checkout?order=TC-xxx`) | Gọi lại `GET /orders/{order_code}` lấy trạng thái mới nhất. Nếu `pending_payment` → hiển thị lại giao diện chọn phương thức. Nếu `confirmed` → redirect `/order-confirmed/{order_code}`. Nếu `expired` → hiển thị "Đơn đã hết hạn" + nút "Đặt lại" |
| Khách share link checkout cho người khác | Không chặn được (anonymous order). Hiển thị banner nhỏ: "Đơn này của bàn [X]. Nếu không phải của bạn, hãy tạo đơn mới." |
| Khách vào checkout với order đã expired (>15 phút) | Hiển thị "Đơn hàng #TC-xxx đã hết hạn." + nút "Đặt lại": khôi phục giỏ hàng cũ vào localStorage (đọc từ `order_items`), redirect về menu để khách đặt lại |
| Khách vào checkout với order đã confirmed | Redirect sang `/order-confirmed/{order_code}` |
| Khách bịa order ID không tồn tại | API trả 404. Frontend hiển thị "Không tìm thấy đơn hàng" + nút "Về menu" |
| Khách double-click nút "Tôi đã chuyển khoản" | Backend API `confirm-payment` idempotent: nếu order đã `confirmed` → trả về 200 OK (không lỗi, không đổi trạng thái). Frontend disable nút ngay sau click đầu tiên + redirect về confirm page |
| Khách spam đặt hàng ảo (không thanh toán) | Rate-limit API tạo đơn: max 5 đơn/5 phút/IP. Order `pending_payment` tự động expire sau 15 phút |
| Giỏ hàng localStorage bị clear (đổi browser, xóa cache) | Không làm gì đặc biệt — đây là anonymous session. Khách tạo giỏ mới |

---

## ⑧ Success Metrics

> Sau bao lâu? Đo thế nào?

- **Tuần 1 (chạy thử nội bộ):**
  - 0 lỗi crash hoặc 500 error
  - Menu load được dưới 3s trên 3G
  - Nhân viên làm quen được dashboard trong 1 buổi training
- **Tháng 1 (triển khai thật):**
  - ≥ 60% khách dùng QR đặt món thay vì gọi nhân viên (đo bằng tỉ lệ đơn QR / tổng đơn)
  - Tỉ lệ đơn bị sai (sai món/size/đường/đá) giảm ≥ 80% so với trước
  - Thời gian trung bình từ lúc khách vào đến lúc order xong giảm 50%
- **Tháng 3:**
  - ≥ 85% đơn được thanh toán qua VietQR (không tiền mặt)
  - Tỉ lệ khách quay lại (nhận diện qua SĐT — nếu có tính năng này) ≥ 30%
  - Net Promoter Score (NPS) từ survey cuối tháng ≥ 40

---

## ⑨ Constraints & Assumptions

**Giới hạn:**
- **Budget:** ~300k VNĐ/tháng cho VPS (150k-300k) + tên miền (~300k VNĐ/năm). Không tốn phí dịch vụ third-party nào khác — toàn bộ tự host qua Docker Compose.
- **Timeline:** 3-4 tuần cho MVP (1 developer, làm part-time ~20h/tuần)
- **Team size:** 1 developer full-stack + 1 chủ quán làm product owner/test
- **Tech constraints:**
  - Không dùng app native (React Native/Flutter) — PWA only
  - VietQR tự generate, không qua dịch vụ trung gian trả phí
  - Không tích hợp máy in/máy POS trong MVP
  - Không xử lý hoàn tiền tự động
  - Chỉ hỗ trợ 1 ngân hàng nhận tiền ban đầu (có thể mở rộng sau)

**Assumptions (giả định):**
- Chủ quán đã có tài khoản ngân hàng và Internet Banking để kiểm tra giao dịch cuối ngày
- Quán có WiFi ổn định — không cần offline-first quá sâu trong MVP
- Bàn trong quán đều có mã QR dán cố định, không bị che/mất
- Khách hàng quen dùng app ngân hàng trên điện thoại và biết cách quét QR
- Nhân viên có smartphone hoặc tablet để mở dashboard
- Menu quán không quá 50 món (đủ để load nhanh, không cần phân trang phức tạp)

---

## ⑩ Wireframe / User Flow (Mô tả)

### Luồng chính — Khách đặt món:
```
[Quét QR bàn] → [Menu] → [Chọn món] → [Tùy chỉnh size/đường/đá/topping]
  → [Thêm vào giỏ] → [Giỏ hàng] → [Bấm "Đặt món" → tạo order]
  → [Trang thanh toán: chọn VietQR hoặc Tiền mặt]
  → [Nếu VietQR: quét mã → bấm "Đã chuyển khoản"]
  → [Nếu Tiền mặt: bấm "Xác nhận đặt món"]
  → [Màn confirm: "Đơn #TC-xxx đã được gửi"]
```

### Luồng phụ — Nhân viên:
```
[Dashboard mở sẵn] → [Order mới popup/tự hiện] → [Xem chi tiết]
  → [Bắt đầu làm] → [Đánh dấu từng món xong] → [Mang ra bàn]
  → [Đánh dấu cả đơn "Xong"]
```

### Cấu trúc màn hình MVP:
1. **Menu Page** (`/` hoặc `/?table=B01`): Header logo + tên quán, Tabs danh mục ngang, Search bar, Grid món (ảnh, tên, giá, nút "+"), Giỏ hàng icon góc phải
2. **Tùy chỉnh món** (Bottom sheet / Modal): Ảnh món, Chọn size, Chọn đường, Chọn đá, Topping list, Ghi chú, Giá tổng, Nút "Thêm vào giỏ — XX,000đ"
3. **Giỏ hàng** (`/cart`): Header hiển thị "Bàn B01" + nút "Đổi bàn", List món + tùy chỉnh, Nút +/-/xóa, Tổng tiền, Nút "Đặt món"
4. **Thanh toán** (`/checkout?order=TC-xxx`): 
   - Hiển thị thông tin đơn hàng đã tạo: mã đơn, bàn, danh sách món, tổng tiền
   - **Chọn phương thức:** 2 nút lớn — "Chuyển khoản (VietQR)" và "Tiền mặt (💵)"
   - **Nếu chọn VietQR** → Hiển thị mã QR, thông tin ngân hàng (NH, STK, Chủ TK, Số tiền, Nội dung CK), hướng dẫn 4 bước, nút "Tôi đã chuyển khoản"
   - **Nếu chọn Tiền mặt** → Icon 💵, thông báo "Nhân viên sẽ thu tiền khi mang nước ra", nút "Xác nhận đặt món (tiền mặt)"
5. **Xác nhận** (`/order-confirmed/{order_code}`): Icon ✅ to, Mã đơn, Danh sách món đã đặt, Bàn số, Phương thức thanh toán, Lời nhắn "Nhân viên sẽ mang nước ra bàn của bạn trong ít phút"
6. **Dashboard nhân viên** (`/staff`): PIN login, Grid/List order theo trạng thái, Card mỗi order (mã, bàn, thời gian, món + tùy chỉnh, nút "Đang làm"/"Xong"), Badge màu phân biệt chuyển khoản/tiền mặt
7. **Admin** (`/admin`): Login, Sidebar navigation (desktop) + hamburger (mobile), 7 mục: Danh mục, Món (kèm upload ảnh JPG/PNG/WebP <5MB), Topping, Nhân viên, Bàn & QR (thêm hàng loạt, xem QR inline, tải từng QR PNG, tải ZIP tất cả QR), Đơn hàng (danh sách có filter trạng thái + phân trang + auto-refresh), Cấu hình (thông tin quán + ngân hàng VietQR)

---

## ⑪ Validation Rules

> Quy tắc validate input từ user (khách, nhân viên, admin) — bắt buộc validate ở cả client (UX tốt) và server (bảo mật). Tất cả regex sử dụng Unicode-aware matching.

### Auth & User Management

| Field | Rule | Regex / Logic | Error Message |
|---|---|---|---|
| **PIN nhân viên** | 6 chữ số, không lặp (000000), không liên tiếp (123456) | `^[0-9]{6}$` + check dãy lặp/liên tiếp | "PIN phải gồm 6 chữ số và không được là dãy lặp hoặc liên tiếp" |
| **Tên nhân viên** | 2-50 ký tự, chỉ chữ cái Unicode + khoảng trắng + gạch ngang. Trim khoảng trắng, collapse nhiều space thành 1 | `^[\p{L}\s-]{2,50}$` | "Tên từ 2-50 ký tự, chỉ chữ cái và khoảng trắng" |
| **Admin username** | 4-30 ký tự, bắt đầu bằng chữ cái, chỉ a-z/0-9/_/- | `^[a-z][a-z0-9_-]{3,29}$` | "Username từ 4-30 ký tự, bắt đầu bằng chữ cái, chỉ a-z, 0-9, _, -" |
| **Admin password** | Min 8 ký tự, max 128, bắt buộc 1 chữ hoa + 1 chữ thường + 1 số. Check top 10k common passwords | Zxcvbn hoặc regex + blacklist | "Mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số" |

### Menu Management

| Field | Rule | Regex / Logic | Error Message |
|---|---|---|---|
| **Tên danh mục / món** | 2-100 ký tự, Unicode, số, khoảng trắng, dấu câu cơ bản. Strip HTML tags | Sanitize: strip `<>`;` | "Tên từ 2-100 ký tự, không chứa ký tự đặc biệt" |
| **Mô tả món** | Max 500 ký tự, cho phép line break (max 3 dòng), strip HTML | Strip HTML, giữ `\n` | "Mô tả tối đa 500 ký tự, không chứa HTML" |
| **Giá món (VND)** | 1,000 - 500,000, phải chia hết cho 1,000 | `^[1-9][0-9]{3,5}000$` | "Giá từ 1,000đ đến 500,000đ, là bội số của 1,000" |
| **Giá topping** | 0 - 50,000, chia hết cho 1,000 | `^(0|[1-9][0-9]{3,4}000)$` | "Giá topping từ 0đ đến 50,000đ, là bội số của 1,000" |

### Bàn

| Field | Rule | Regex / Logic | Error Message |
|---|---|---|---|
| **Số bàn (table_number)** | 1-10 ký tự, chữ IN HOA + số + gạch ngang, unique | `^[A-Z0-9-]{1,10}$` | "Số bàn từ 1-10 ký tự, chỉ chữ IN HOA, số, gạch ngang. VD: B01, VIP-1" |

### Order

| Field | Rule | Regex / Logic | Error Message |
|---|---|---|---|
| **Ghi chú order** | Max 200 ký tự, cho phép line break (max 3), strip HTML | Strip HTML | "Ghi chú tối đa 200 ký tự" |
| **Mã đơn hàng** | Auto-gen, format: `TC-YYYYMMDD-XXXX` (XXXX = 0001-9999, reset mỗi ngày), unique | Không cho user nhập | — |

### Settings (Cấu hình quán)

| Field | Rule | Regex / Logic | Error Message |
|---|---|---|---|
| **Tên quán** | 2-100 ký tự, Unicode | — | "Tên quán từ 2-100 ký tự" |
| **Số điện thoại** | 10 chữ số, bắt đầu 0. Normalize trước: bỏ space/`-`/`+84` | `^0[0-9]{9}$` | "Số điện thoại 10 chữ số, bắt đầu 0. VD: 0912345678" |
| **Địa chỉ** | Max 200 ký tự, Unicode | — | "Địa chỉ tối đa 200 ký tự" |
| **Tên ngân hàng** | Max 100 ký tự, Unicode | — | "Tên ngân hàng tối đa 100 ký tự" |
| **Mã BIN ngân hàng** | Chính xác 6 chữ số | `^[0-9]{6}$` | "Mã BIN phải là 6 chữ số. VD: 970432 (VPBank)" |
| **Số tài khoản NH** | 6-19 chữ số | `^[0-9]{6,19}$` | "Số tài khoản từ 6-19 chữ số. VD: 680180598" |
| **Tên chủ tài khoản** | Max 100 ký tự, CHỮ IN HOA, không dấu (chuẩn NH VN) | `^[A-Z\s]{1,100}$` | "Tên chủ TK viết IN HOA, không dấu. VD: LUU VAN TU" |
| **Chi nhánh NH** | Max 100 ký tự, Unicode | — | "Chi nhánh tối đa 100 ký tự" |

### Upload Ảnh

| Rule | Value | Error Message |
|---|---|---|
| **MIME types** | `image/jpeg`, `image/png`, `image/webp` | "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP" |
| **Max size** | 5 MB (5,242,880 bytes) | "Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn" |
| **Min dimensions** | 200x200px | "Ảnh quá nhỏ (tối thiểu 200x200px)" |
| **Max dimensions** | 4000x4000px | "Ảnh quá lớn (tối đa 4000x4000px)" |
| **Auto resize** | 800px (cạnh lớn nhất), giữ aspect ratio, convert WebP | — |

---

## Changelog

| Ngày | Thay đổi | Người cập nhật |
|---|---|---|
| 2026-06-28 | v1 — draft đầu tiên | Claude |
| 2026-06-28 | v1.1 — chuyển toàn bộ backend stack từ Next.js sang FastAPI | Claude |
| 2026-06-28 | v1.2 — nâng cấp File Storage (MinIO) và Task Queue (Celery + Redis) | Claude |
| 2026-06-28 | v1.3 — chuyển toàn bộ hosting về VPS Docker Compose, bỏ Render/Railway/Vercel | Claude |
| 2026-06-28 | v1.4 — chuẩn hóa Tech Stack: 100% open-source, mỗi layer kèm Docker image cụ thể | Claude |
| 2026-06-28 | v1.5 — tách docker-compose riêng FE (fe.yml) và BE (be.yml), deploy độc lập | Claude |
| 2026-07-09 | v1.6 — gán mã ngắn ([MEN], [CUS], [CRT]...) + status (⏳ Todo) cho toàn bộ Feature & User Story | Claude |
| 2026-07-10 | v2.0 — MVP hoàn thành: 7/7 stories Done (5 MUST + 2 SHOULD) | Claude |
| 2026-07-11 | v2.1 — Bổ sung chi tiết: 7 danh mục, 22 món, 6 topping, QR inline + tải ZIP, sidebar admin, checkout 2 bước | Claude |
| 2026-07-11 | v2.2 — Fix conflict: chốt polling 3s cho dashboard, bỏ WebSocket section, thêm WebSocket vào NICE TO HAVE | Claude |
| 2026-07-11 | v2.3 — Add chi tiết: staff auth (PIN 6 số, lock 5 lần/10ph, soft delete), admin vs staff tách 2 bảng riêng, menu seed data 22 món | Claude |
| 2026-07-11 | v2.4 — Thêm trang Cấu hình chung trong admin (thông tin quán + ngân hàng VietQR), lưu bảng settings key-value | Claude |
| 2026-07-11 | v2.5 — Thêm xử lý mất table param: lưu table vào localStorage, popup chọn bàn, bắt buộc chọn bàn khi checkout, nút đổi bàn trong giỏ | Claude |
| 2026-07-11 | v2.6 — Chuẩn hóa luồng tạo order: "Đặt món" từ giỏ → tạo order ngay → redirect checkout. Checkout không tạo order nữa, chỉ hiển thị + confirm payment | Claude |
| 2026-07-11 | v2.7 — Thêm edge cases checkout: refresh, share link, expired, confirmed redirect, 404, double-click idempotent | Claude |
| 2026-07-11 | v2.8 — Chi tiết hóa Celery background tasks: expire-pending-orders (mỗi 1ph), cleanup-temp-files (3h sáng), thêm celery-beat container | Claude |
| 2026-07-11 | v2.9 — Chuẩn hóa order status lifecycle thành 5 trạng thái duy nhất: pending_payment → confirmed → preparing → done (+ expired) | Claude |
| 2026-07-11 | v2.12 — Thêm ảnh placeholder CSS/SVG theo danh mục (7 màu), fallback khi image_url NULL hoặc load lỗi | Claude |
| 2026-07-11 | v2.13 — Thêm section ⑬ Validation Rules: 30+ quy tắc validate cho tất cả input (auth, menu, bàn, order, settings, upload) | Claude |
| 2026-07-11 | v2.14 — Thêm Pagination Standards: default 20, max 100, page từ 1, response format chuẩn, sort order mặc định | Claude |
| 2026-07-11 | v2.15 — Thêm Docker Compose & Environment Variables vào Tech Stack (sau này migrate sang TDD) | Claude |
| 2026-07-11 | v3.0 — Tái cấu trúc PRD theo template: cắt API Endpoints, Data Model, Docker/Env sang TDD; giữ Validation Rules + Wireframes trong PRD. Chuẩn hóa numbering ①→⑪ | Claude |
