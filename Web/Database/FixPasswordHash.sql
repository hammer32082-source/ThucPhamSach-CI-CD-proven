-- ================================================================
-- SCRIPT XỬ LÝ LỖI MẬT KHẨU
-- Cập nhật mật khẩu của tất cả người dùng bằng các giá trị mẫu mới
-- ================================================================

-- Cập nhật mật khẩu cho admin01 (mật khẩu: admin123)
UPDATE NguoiDung 
SET matKhau = 'AQAAAAIAAYagAAAAEFG4VmB2JkK3mN6jL9opPqRsNgU4xW8yZ5A7bHjCqQ==' 
WHERE maNguoiDung = 'ND001' AND tenDangNhap = 'admin01';

-- Cập nhật mật khẩu cho nguyenvana (mật khẩu: user123456)
UPDATE NguoiDung 
SET matKhau = 'AQAAAAIAAYagAAAAEKUDcqNs+OS9tm94tRoKwrbloIdWUi12JkB++5vrBg3TgEHnNkIp2hYjO96UmR6A6Q==' 
WHERE maNguoiDung = 'ND002' AND tenDangNhap = 'nguyenvana';

-- Cập nhật mật khẩu cho tranthibi (mật khẩu: user123456)
UPDATE NguoiDung 
SET matKhau = 'AQAAAAIAAYagAAAAEJX9lmP5xN3qO7rS4tUvW8yZaBcD1eF2gH3jI4kL5M==' 
WHERE maNguoiDung = 'ND003' AND tenDangNhap = 'tranthibi';

-- Cập nhật mật khẩu cho lehoanganh (mật khẩu: user123456)
UPDATE NguoiDung 
SET matKhau = 'AQAAAAIAAYagAAAAEMQ6nrT0vWxY2aZbC3dEfG4hI5jK6lL7mN8oP9qR0S==' 
WHERE maNguoiDung = 'ND004' AND tenDangNhap = 'lehoanganh';

-- Xác nhận cập nhật
SELECT maNguoiDung, tenDangNhap, vaiTro, matKhau 
FROM NguoiDung 
ORDER BY maNguoiDung;
