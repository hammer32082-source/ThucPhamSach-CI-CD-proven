\# DỰ ÁN WEBSITE BÁN THỰC PHẨM SẠCH



\## 1. KIẾN TRÚC HỆ THỐNG (DECOUPLED ARCHITECTURE)

Dự án bắt buộc phải tách rời 100% giữa Frontend và Backend.

\- \*\*Backend:\*\* ASP.NET Core Web API (.NET 8). Sử dụng Entity Framework Core (Database First). Trả về dữ liệu chuẩn JSON. Yêu cầu cấu hình CORS để Frontend gọi tới và dùng JWT Token để bảo mật.

\- \*\*Frontend:\*\* Chỉ sử dụng HTML5, CSS3 Grid/Flexbox và JavaScript thuần. Gọi API bằng `fetch` hoặc `axios`. TUYỆT ĐỐI KHÔNG sử dụng Bootstrap, Tailwind, React, hay Vue.



\## 2. THIẾT KẾ GIAO DIỆN (UI/UX - Dành cho Frontend)

\- \*\*Phong cách:\*\* Glassmorphism (Kính mờ ảo). Bắt buộc dùng CSS: `backdrop-filter: saturate(180%) blur(20px);` với nền màu trong suốt (rgba).

\- \*\*Tông màu chủ đạo:\*\* Xanh lá nhạt (chiếm 60% diện tích, thể hiện sự tươi mát).

\- \*\*Màu điểm xuyết:\*\* Đỏ nhạt (Nút mua/Sale), Cam nhạt, Xanh dương nhạt (Nhãn tag, icon).

\- \*\*Responsive:\*\* Phải hiển thị tốt trên cả Mobile và Desktop.



\## 3. CƠ SỞ DỮ LIỆU

\- Dựa hoàn toàn vào cấu trúc trong file đính kèm: `DbforThucPhamSach.sql`.



\## 4. LUỒNG NGHIỆP VỤ HỆ THỐNG (USE CASE)

Hệ thống có 2 Actor (Người dùng) chính là: Khách hàng và Admin (Phân biệt qua cột `vaiTro` trong bảng `NguoiDung`).



\*\*4.1. Use Case Phân rã - Dành cho Khách Hàng:\*\*

\- \*\*Tìm kiếm và lọc sản phẩm:\*\* Bao gồm các chức năng mở rộng như Tìm theo từ khóa, Lọc theo danh mục, Lọc theo giá, và Xem chi tiết sản phẩm.

\- \*\*Giỏ hàng và đặt hàng:\*\* Bắt buộc phải thông qua bước Đăng nhập (`<<include>>`). Bao gồm các thao tác mở rộng: Thêm sản phẩm, Cập nhật số lượng sản phẩm, Xóa sản phẩm, và Thanh toán.

\- \*\*Gợi ý sản phẩm thông minh:\*\* Mở rộng thành các tính năng: Gợi ý theo danh mục, Gợi ý theo hành vi mua sắm, và Gợi ý theo lịch sử mua hàng.

\- \*\*Đăng ký \& Đăng nhập:\*\* Chức năng cơ bản.



\*\*4.2. Use Case Phân rã - Dành cho Admin:\*\*

Tất cả các nghiệp vụ quản lý của Admin đều bắt buộc phải thông qua bước Đăng nhập (`<<include>>`).

\- \*\*Quản lý danh mục và sản phẩm:\*\* Bao gồm các thao tác: Quản lý danh mục, Thêm sản phẩm, Sửa sản phẩm, Xóa sản phẩm.

\- \*\*Quản lý khách hàng:\*\* Có chức năng mở rộng là Tìm kiếm khách hàng.

\- \*\*Quản lý đơn hàng:\*\* Bao gồm các thao tác: Xem thông tin đơn hàng, Xác nhận đơn hàng, và Cập nhật trạng thái đơn hàng.

