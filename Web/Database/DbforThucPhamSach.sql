-- ================================================================
--  DATABASE: DbforThucPhamSach
--  Designed for: SQL Server Management Studio (T-SQL)
--  Based on: Class Diagram + Use Case (Khach Hang & Admin)
--  Tables: NguoiDung, Admin, KhachHang, DanhMuc, SanPham,
--          GioHang, ChiTietGioHang, DonHang, ChiTietDonHang,
--          ThanhToan, LichSuHanhVi
-- ================================================================

-- Tao database
CREATE DATABASE DbforThucPhamSach;
GO

USE DbforThucPhamSach;
GO

-- ================================================================
-- BANG 1: NGUOIDUNG (Lop cha - ke thua boi Admin & KhachHang)
-- ================================================================
CREATE TABLE NguoiDung (
    maNguoiDung     VARCHAR(10)     NOT NULL,
    tenDangNhap     NVARCHAR(50)    NOT NULL,
    matKhau         NVARCHAR(255)   NOT NULL,   -- nen ma hoa bcrypt
    vaiTro          NVARCHAR(20)    NOT NULL
        CONSTRAINT CK_NguoiDung_VaiTro
            CHECK (vaiTro IN (N'Admin', N'KhachHang')),
    ngayTao         DATETIME        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_NguoiDung PRIMARY KEY (maNguoiDung),
    CONSTRAINT UQ_NguoiDung_TenDangNhap UNIQUE (tenDangNhap)
);
GO

-- ================================================================
-- BANG 2: ADMIN (extends NguoiDung)
-- Khong co thuoc tinh rieng, chi luu FK de phan biet vai tro
-- ================================================================
CREATE TABLE Admin (
    maAdmin         VARCHAR(10)     NOT NULL,
    maNguoiDung     VARCHAR(10)     NOT NULL,

    CONSTRAINT PK_Admin PRIMARY KEY (maAdmin),
    CONSTRAINT UQ_Admin_NguoiDung UNIQUE (maNguoiDung),
    CONSTRAINT FK_Admin_NguoiDung
        FOREIGN KEY (maNguoiDung) REFERENCES NguoiDung(maNguoiDung)
        ON DELETE CASCADE
);
GO

-- ================================================================
-- BANG 3: KHACHHANG (extends NguoiDung)
-- ================================================================
CREATE TABLE KhachHang (
    maKH            VARCHAR(10)     NOT NULL,
    maNguoiDung     VARCHAR(10)     NOT NULL,
    hoTen           NVARCHAR(100)   NOT NULL,
    sdt             VARCHAR(15)     NULL,
    email           NVARCHAR(100)   NULL,
    diaChi          NVARCHAR(255)   NULL,

    CONSTRAINT PK_KhachHang PRIMARY KEY (maKH),
    CONSTRAINT UQ_KhachHang_NguoiDung UNIQUE (maNguoiDung),
    CONSTRAINT FK_KhachHang_NguoiDung
        FOREIGN KEY (maNguoiDung) REFERENCES NguoiDung(maNguoiDung)
        ON DELETE CASCADE
);
GO

-- ================================================================
-- BANG 4: DANHMUC
-- ================================================================
CREATE TABLE DanhMuc (
    maDanhMuc       VARCHAR(10)     NOT NULL,
    tenDanhMuc      NVARCHAR(100)   NOT NULL,
    moTa            NVARCHAR(500)   NULL,
    maDanhMucCha    VARCHAR(10)     NULL,

    CONSTRAINT PK_DanhMuc PRIMARY KEY (maDanhMuc),
    CONSTRAINT FK_DanhMuc_DanhMucCha
        FOREIGN KEY (maDanhMucCha) REFERENCES DanhMuc(maDanhMuc)
);
GO

-- ================================================================
-- BANG 5: SANPHAM
-- ================================================================
CREATE TABLE SanPham (
    maSP            VARCHAR(10)     NOT NULL,
    maDanhMuc       VARCHAR(10)     NOT NULL,
    tenSP           NVARCHAR(200)   NOT NULL,
    gia             DECIMAL(18,2)   NOT NULL
        CONSTRAINT CK_SanPham_Gia CHECK (gia >= 0),
    soLuongTon      INT             NOT NULL DEFAULT 0
        CONSTRAINT CK_SanPham_SoLuong CHECK (soLuongTon >= 0),
    donViTinh       NVARCHAR(50)    NULL,
    nguonGoc        NVARCHAR(100)   NULL,
    hinhAnh         NVARCHAR(500)   NULL,
    moTa             NVARCHAR(4000)  NULL,
    hanSuDung       DATE            NULL,

    CONSTRAINT PK_SanPham PRIMARY KEY (maSP),
    CONSTRAINT FK_SanPham_DanhMuc
        FOREIGN KEY (maDanhMuc) REFERENCES DanhMuc(maDanhMuc)
        ON UPDATE CASCADE
);
GO

-- ================================================================
-- BANG 6: GIOHANG (1 KhachHang co dung 1 GioHang)
-- ================================================================
CREATE TABLE GioHang (
    maGioHang       VARCHAR(10)     NOT NULL,
    maKH            VARCHAR(10)     NOT NULL,
    tongTien        DECIMAL(18,2)   NOT NULL DEFAULT 0
        CONSTRAINT CK_GioHang_TongTien CHECK (tongTien >= 0),

    CONSTRAINT PK_GioHang PRIMARY KEY (maGioHang),
    CONSTRAINT UQ_GioHang_KhachHang UNIQUE (maKH),
    CONSTRAINT FK_GioHang_KhachHang
        FOREIGN KEY (maKH) REFERENCES KhachHang(maKH)
        ON DELETE CASCADE
);
GO

-- ================================================================
-- BANG 7: CHITIETGIOHANG (Composition voi GioHang)
-- Khoa chinh la cap (maGioHang, maSP)
-- ================================================================
CREATE TABLE ChiTietGioHang (
    maGioHang       VARCHAR(10)     NOT NULL,
    maSP            VARCHAR(10)     NOT NULL,
    soLuong         INT             NOT NULL DEFAULT 1
        CONSTRAINT CK_CTGioHang_SoLuong CHECK (soLuong > 0),
    donGia          DECIMAL(18,2)   NOT NULL
        CONSTRAINT CK_CTGioHang_DonGia CHECK (donGia >= 0),

    CONSTRAINT PK_ChiTietGioHang PRIMARY KEY (maGioHang, maSP),
    CONSTRAINT FK_CTGioHang_GioHang
        FOREIGN KEY (maGioHang) REFERENCES GioHang(maGioHang)
        ON DELETE CASCADE,
    CONSTRAINT FK_CTGioHang_SanPham
        FOREIGN KEY (maSP) REFERENCES SanPham(maSP)
);
GO

-- ================================================================
-- BANG 8: DONHANG
-- ================================================================
CREATE TABLE DonHang (
    maDonHang           VARCHAR(10)     NOT NULL,
    maKH                VARCHAR(10)     NOT NULL,
    ngayDat             DATETIME        NOT NULL DEFAULT GETDATE(),
    tongTien            DECIMAL(18,2)   NOT NULL
        CONSTRAINT CK_DonHang_TongTien CHECK (tongTien >= 0),
    trangThaiDonHang    NVARCHAR(50)    NOT NULL DEFAULT N'Cho xac nhan'
        CONSTRAINT CK_DonHang_TrangThai
            CHECK (trangThaiDonHang IN (
                N'Cho xac nhan',
                N'Da xac nhan',
                N'Dang giao hang',
                N'Da giao',
                N'Da huy'
            )),
    diaChiGiao          NVARCHAR(255)   NULL,

    CONSTRAINT PK_DonHang PRIMARY KEY (maDonHang),
    CONSTRAINT FK_DonHang_KhachHang
        FOREIGN KEY (maKH) REFERENCES KhachHang(maKH)
);
GO

-- ================================================================
-- BANG 9: CHITIETDONHANG (Composition voi DonHang)
-- Khoa chinh la cap (maDonHang, maSP)
-- ================================================================
CREATE TABLE ChiTietDonHang (
    maDonHang       VARCHAR(10)     NOT NULL,
    maSP            VARCHAR(10)     NOT NULL,
    soLuong         INT             NOT NULL
        CONSTRAINT CK_CTDonHang_SoLuong CHECK (soLuong > 0),
    donGia          DECIMAL(18,2)   NOT NULL
        CONSTRAINT CK_CTDonHang_DonGia CHECK (donGia >= 0),

    CONSTRAINT PK_ChiTietDonHang PRIMARY KEY (maDonHang, maSP),
    CONSTRAINT FK_CTDonHang_DonHang
        FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang)
        ON DELETE CASCADE,
    CONSTRAINT FK_CTDonHang_SanPham
        FOREIGN KEY (maSP) REFERENCES SanPham(maSP)
);
GO

-- ================================================================
-- BANG 10: THANHTOAN (1 DonHang co dung 1 ThanhToan)
-- ================================================================
CREATE TABLE ThanhToan (
    maThanhToan         VARCHAR(10)     NOT NULL,
    maDonHang           VARCHAR(10)     NOT NULL,
    phuongThuc          NVARCHAR(50)    NOT NULL
        CONSTRAINT CK_ThanhToan_PhuongThuc
            CHECK (phuongThuc IN (N'COD', N'VNPay', N'MoMo', N'BankTransfer')),
    trangThai           NVARCHAR(50)    NOT NULL DEFAULT N'Cho thanh toan'
        CONSTRAINT CK_ThanhToan_TrangThai
            CHECK (trangThai IN (
                N'Cho thanh toan',
                N'Thanh toan thanh cong',
                N'Thanh toan that bai',
                N'Da hoan tien'
            )),
    thoiGian            DATETIME        NOT NULL DEFAULT GETDATE(),
    tongTienThanhToan   DECIMAL(18,2)   NOT NULL
        CONSTRAINT CK_ThanhToan_TongTien CHECK (tongTienThanhToan >= 0),

    CONSTRAINT PK_ThanhToan PRIMARY KEY (maThanhToan),
    CONSTRAINT UQ_ThanhToan_DonHang UNIQUE (maDonHang),
    CONSTRAINT FK_ThanhToan_DonHang
        FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang)
        ON DELETE CASCADE
);
GO

-- ================================================================
-- BANG 11: LICHSUHANHVI (phuc vu HeGoiYLogic)
-- ================================================================
CREATE TABLE LichSuHanhVi (
    maLog           VARCHAR(15)     NOT NULL,
    maKH            VARCHAR(10)     NOT NULL,
    maSP            VARCHAR(10)     NULL,
    loaiHanhVi      NVARCHAR(50)    NOT NULL
        CONSTRAINT CK_LichSu_LoaiHanhVi
            CHECK (loaiHanhVi IN (
                N'XemSanPham',
                N'TimKiem',
                N'ThemGioHang',
                N'DatHang',
                N'DanhGia'
            )),
    thoiGian        DATETIME        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_LichSuHanhVi PRIMARY KEY (maLog),
    CONSTRAINT FK_LichSu_KhachHang
        FOREIGN KEY (maKH) REFERENCES KhachHang(maKH)
        ON DELETE CASCADE,
    CONSTRAINT FK_LichSu_SanPham
        FOREIGN KEY (maSP) REFERENCES SanPham(maSP)
        ON DELETE SET NULL
);
GO

-- ================================================================
-- INDEX (tang toc truy van thuong gap)
-- ================================================================
CREATE INDEX IX_SanPham_DanhMuc    ON SanPham(maDanhMuc);
CREATE INDEX IX_SanPham_Gia        ON SanPham(gia);
CREATE INDEX IX_DonHang_KhachHang  ON DonHang(maKH);
CREATE INDEX IX_DonHang_TrangThai  ON DonHang(trangThaiDonHang);
CREATE INDEX IX_LichSu_KhachHang   ON LichSuHanhVi(maKH);
CREATE INDEX IX_LichSu_SanPham     ON LichSuHanhVi(maSP);
CREATE INDEX IX_LichSu_Thoigian    ON LichSuHanhVi(thoiGian DESC);
GO

-- ================================================================
-- STORED PROCEDURES
-- ================================================================

-- SP1: Tim kiem san pham theo tu khoa
CREATE PROCEDURE sp_TimKiemSanPham
    @tuKhoa NVARCHAR(200)
AS
BEGIN
    SELECT maSP, tenSP, gia, soLuongTon, hinhAnh
    FROM SanPham
    WHERE tenSP LIKE N'%' + @tuKhoa + N'%'
      AND soLuongTon > 0
    ORDER BY tenSP;
END;
GO

-- SP2: Loc san pham theo gia
CREATE PROCEDURE sp_LocTheoGia
    @giaMin DECIMAL(18,2),
    @giaMax DECIMAL(18,2)
AS
BEGIN
    SELECT maSP, tenSP, gia, soLuongTon, hinhAnh
    FROM SanPham
    WHERE gia BETWEEN @giaMin AND @giaMax
      AND soLuongTon > 0
    ORDER BY gia ASC;
END;
GO

-- SP3: Loc san pham theo danh muc
CREATE PROCEDURE sp_LocTheoDanhMuc
    @maDanhMuc VARCHAR(10)
AS
BEGIN
    SELECT sp.maSP, sp.tenSP, sp.gia, sp.soLuongTon, sp.hinhAnh,
           dm.tenDanhMuc
    FROM SanPham sp
    JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
    WHERE sp.maDanhMuc = @maDanhMuc
      AND sp.soLuongTon > 0
    ORDER BY sp.tenSP;
END;
GO

-- SP4: Tao don hang tu gio hang
CREATE PROCEDURE sp_TaoDonHang
    @maDonHang  VARCHAR(10),
    @maKH       VARCHAR(10),
    @diaChiGiao NVARCHAR(255)
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lay tong tien tu gio hang
        DECLARE @tongTien DECIMAL(18,2);
        SELECT @tongTien = tongTien FROM GioHang WHERE maKH = @maKH;

        -- Tao don hang
        INSERT INTO DonHang (maDonHang, maKH, tongTien, diaChiGiao)
        VALUES (@maDonHang, @maKH, @tongTien, @diaChiGiao);

        -- Chuyen chi tiet gio hang -> chi tiet don hang
        INSERT INTO ChiTietDonHang (maDonHang, maSP, soLuong, donGia)
        SELECT @maDonHang, maSP, soLuong, donGia
        FROM ChiTietGioHang
        WHERE maGioHang = (SELECT maGioHang FROM GioHang WHERE maKH = @maKH);

        -- Tru ton kho
        UPDATE sp
        SET sp.soLuongTon = sp.soLuongTon - ctg.soLuong
        FROM SanPham sp
        JOIN ChiTietGioHang ctg ON sp.maSP = ctg.maSP
        JOIN GioHang g ON ctg.maGioHang = g.maGioHang
        WHERE g.maKH = @maKH;

        -- Xoa gio hang sau khi dat hang
        DELETE FROM ChiTietGioHang
        WHERE maGioHang = (SELECT maGioHang FROM GioHang WHERE maKH = @maKH);

        UPDATE GioHang SET tongTien = 0 WHERE maKH = @maKH;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- SP5: Cap nhat trang thai don hang (Admin)
CREATE PROCEDURE sp_CapNhatTrangThaiDonHang
    @maDonHang       VARCHAR(10),
    @trangThaiMoi    NVARCHAR(50)
AS
BEGIN
    UPDATE DonHang
    SET trangThaiDonHang = @trangThaiMoi
    WHERE maDonHang = @maDonHang;
END;
GO

-- SP6: Goi y san pham theo lich su mua hang
CREATE PROCEDURE sp_GoiYTheoLichSuMua
    @maKH VARCHAR(10)
AS
BEGIN
    -- Goi y cac san pham cung danh muc ma khach da mua
    SELECT DISTINCT sp.maSP, sp.tenSP, sp.gia, sp.hinhAnh
    FROM SanPham sp
    WHERE sp.maDanhMuc IN (
        SELECT DISTINCT sp2.maDanhMuc
        FROM LichSuHanhVi lshv
        JOIN SanPham sp2 ON lshv.maSP = sp2.maSP
        WHERE lshv.maKH = @maKH
          AND lshv.loaiHanhVi IN (N'DatHang', N'XemSanPham')
    )
    AND sp.maSP NOT IN (
        -- Loai tru san pham da mua
        SELECT DISTINCT ctdh.maSP
        FROM ChiTietDonHang ctdh
        JOIN DonHang dh ON ctdh.maDonHang = dh.maDonHang
        WHERE dh.maKH = @maKH
    )
    AND sp.soLuongTon > 0
    ORDER BY sp.gia;
END;
GO

-- SP7: Tim kiem khach hang (Admin)
CREATE PROCEDURE sp_TimKiemKhachHang
    @tuKhoa NVARCHAR(100)
AS
BEGIN
    SELECT kh.maKH, kh.hoTen, kh.sdt, kh.email, kh.diaChi
    FROM KhachHang kh
    WHERE kh.hoTen  LIKE N'%' + @tuKhoa + N'%'
       OR kh.email  LIKE N'%' + @tuKhoa + N'%'
       OR kh.sdt    LIKE N'%' + @tuKhoa + N'%';
END;
GO

-- ================================================================
-- DU LIEU MAU (Sample Data) - He thong Thuc Pham Sach
-- ================================================================

-- NguoiDung
-- NOTE: Mật khẩu phải được hash bằng PasswordHasher<NguoiDung> trước khi insert
-- Để fix lỗi mật khẩu, vui lòng:
-- 1. Chạy script ResetPasswordForAllUsers.cs (GeneratePasswordHash tool)
-- 2. Hoặc sử dụng endpoint POST /api/Auth/reset-all-passwords
INSERT INTO NguoiDung VALUES
('ND001', 'admin01',    'AQAAAAIAAYagAAAAEFG4VmB2JkK3mN6jL9opPqRsNgU4xW8yZ5A7bHjCqQ==', N'Admin',     GETDATE()),
('ND002', 'nguyenvana', 'AQAAAAIAAYagAAAAEJlmN3oPqRsT4uVwX5yZaBc2dDeF3gH4iJ5kL6mM7N==', N'KhachHang', GETDATE()),
('ND003', 'tranthibi',  'AQAAAAIAAYagAAAAENZ4oQrStUvWxY2aZbC3dEfG4hI5jK6lL7mM8nN9oO==', N'KhachHang', GETDATE()),
('ND004', 'lehoanganh', 'AQAAAAIAAYagAAAAEOa5pRsUwVxYZ3bZcD4efGhI6kL7mL8nN9oO0pP9qQ==', N'KhachHang', GETDATE());

-- Admin
INSERT INTO Admin VALUES ('AD001', 'ND001');

-- KhachHang
INSERT INTO KhachHang VALUES
('KH001', 'ND002', N'Nguyen Van An',   '0912345678', 'nguyenvanan@email.com',  N'123 Nguyen Trai, Ha Noi'),
('KH002', 'ND003', N'Tran Thi Bich',   '0987654321', 'tranthibich@email.com',  N'456 Le Van Sy, TP HCM'),
('KH003', 'ND004', N'Le Hoang Anh',    '0909112233', 'lehoanganh@email.com',   N'78 Tran Phu, Da Nang');

-- DanhMuc (5 danh muc cha, moi danh muc co 3 danh muc con)
INSERT INTO DanhMuc (maDanhMuc, tenDanhMuc, moTa, maDanhMucCha) VALUES
('DMP01', N'Ngu coc',           N'Ngu coc va hat dinh duong tu nhien', NULL),
('DMP02', N'Rau cu',            N'Rau cu tuoi sach hang ngay', NULL),
('DMP03', N'Sua cac loai',      N'Sua tuoi, sua chua va sua hat', NULL),
('DMP04', N'Thit',              N'Thit tuoi sach va hai san', NULL),
('DMP05', N'Trai cay',          N'Trai cay tuoi trong nuoc va nhap khau', NULL);

INSERT INTO DanhMuc (maDanhMuc, tenDanhMuc, moTa, maDanhMucCha) VALUES
('DM011', N'Gao cac loai',      N'Gao trang, gao lut va gao huu co', 'DMP01'),
('DM012', N'Dau va hat',        N'Dau phu, dau xanh va cac loai hat', 'DMP01'),
('DM013', N'Ngu coc an sang',   N'Yen mach, granola va ngu coc instant', 'DMP01'),
('DM021', N'Rau an la',         N'Rau cai, rau muong, xa lach', 'DMP02'),
('DM022', N'Rau cu qua',        N'Ca chua, khoai tay, ca rot', 'DMP02'),
('DM023', N'Rau gia vi',        N'Hanh, toi, gung, ot', 'DMP02'),
('DM031', N'Sua tuoi',          N'Sua tuoi nguyen chat', 'DMP03'),
('DM032', N'Sua chua',          N'Sua chua uong va an', 'DMP03'),
('DM033', N'Sua hat',           N'Sua dau nanh, sua hat dieu', 'DMP03'),
('DM041', N'Thit heo va bo',    N'Thit heo, thit bo tuoi', 'DMP04'),
('DM042', N'Thit gia cam',      N'Thit ga, vit va ca tam', 'DMP04'),
('DM043', N'Hai san',           N'Ca, tom, muc tuoi', 'DMP04'),
('DM051', N'Trai cay Viet Nam', N'Cam, buoi, xoai, nhan', 'DMP05'),
('DM052', N'Trai cay nhap khau',N'Tao, nho, viet quat nhap khau', 'DMP05'),
('DM053', N'Trai cay theo mua', N'Trai cay theo mua vung mien', 'DMP05');

-- SanPham
INSERT INTO SanPham (maSP, maDanhMuc, tenSP, gia, soLuongTon, donViTinh, nguonGoc, hinhAnh, moTa, hanSuDung) VALUES
('SP001', 'DM021', N'Rau cai xanh huu co Da Lat',      25000,  200, N'Bun 500g',  N'Viet Nam', NULL, NULL, '2026-05-28'),
('SP002', 'DM022', N'Ca chua bi VietGAP Da Lat',        35000,  150, N'Hop 500g',  N'Viet Nam', NULL, NULL, '2026-05-27'),
('SP003', 'DM022', N'Khoai lang tim Nhat Ban',          45000,   80, N'Kg',        N'Nhat Ban',  NULL, NULL, '2026-06-10'),
('SP004', 'DM052', N'Tao Fuji Nhat Ban loai 1',        120000,   60, N'Kg',        N'Nhat Ban',  NULL, NULL, '2026-06-05'),
('SP005', 'DM052', N'Viet quat tuoi Uc nhap khau',     180000,   40, N'Hop 125g',  N'Uc',        NULL, NULL, '2026-05-29'),
('SP006', 'DM051', N'Cam sach VietGAP Vinh',            30000,  300, N'Kg',        N'Viet Nam', NULL, NULL, '2026-06-01'),
('SP007', 'DM041', N'Thit bo Uc phi le nguyen mieng',  350000,   30, N'Kg',        N'Uc',        NULL, NULL, '2026-05-27'),
('SP008', 'DM041', N'Thit lon sach chan thoa VietGAP',  95000,   50, N'Kg',        N'Viet Nam', NULL, NULL, '2026-05-26'),
('SP009', 'DM043', N'Ca hoi Na Uy cat khuc tuoi',      280000,   25, N'Kg',        N'Na Uy',     NULL, NULL, '2026-05-27'),
('SP010', 'DM011', N'Gao lut huyet rong huu co',        55000,  100, N'Tui 1kg',   N'Viet Nam', NULL, NULL, '2027-05-01'),
('SP011', 'DM012', N'Hat chia huu co Mexico',           95000,   70, N'Tui 200g',  N'Mexico',    NULL, NULL, '2027-03-01'),
('SP012', 'DM032', N'Sua chua thuan chay Vinamilk Organic', 28000, 120, N'Hop 100g', N'Viet Nam', NULL, NULL, '2026-06-15');

-- GioHang (moi khach 1 gio hang)
INSERT INTO GioHang VALUES
('GH001', 'KH001', 0),
('GH002', 'KH002', 0),
('GH003', 'KH003', 0);

-- ChiTietGioHang (KH003 dang co hang trong gio)
INSERT INTO ChiTietGioHang VALUES
('GH003', 'SP001', 2, 25000),
('GH003', 'SP004', 1, 120000);

-- Cap nhat tong tien gio hang KH003
UPDATE GioHang SET tongTien = 170000 WHERE maGioHang = 'GH003';

-- DonHang
INSERT INTO DonHang VALUES
('DH001', 'KH001', GETDATE(), 455000,  N'Da giao',      N'123 Nguyen Trai, Ha Noi'),
('DH002', 'KH001', GETDATE(), 180000,  N'Dang giao hang', N'123 Nguyen Trai, Ha Noi'),
('DH003', 'KH002', GETDATE(), 375000,  N'Da xac nhan',  N'456 Le Van Sy, TP HCM'),
('DH004', 'KH002', GETDATE(),  83000,  N'Cho xac nhan', N'456 Le Van Sy, TP HCM');

-- ChiTietDonHang
INSERT INTO ChiTietDonHang VALUES
('DH001', 'SP007', 1, 350000),
('DH001', 'SP001', 2,  25000),  -- 2 bun rau x 25k = 50k; tong DH001 = 400k (lam tron 455k co phi ship)
('DH001', 'SP010', 1,  55000),
('DH002', 'SP005', 1, 180000),
('DH003', 'SP009', 1, 280000),
('DH003', 'SP006', 3,  30000),  -- 3 kg cam x 30k = 90k; tong DH003 = 370k
('DH004', 'SP002', 1,  35000),
('DH004', 'SP012', 2,  28000);  -- 2 hop sua x 28k = 56k; tong DH004 = 91k (lam tron)

-- ThanhToan
INSERT INTO ThanhToan VALUES
('TT001', 'DH001', N'VNPay', N'Thanh toan thanh cong', GETDATE(), 455000),
('TT002', 'DH002', N'MoMo',  N'Thanh toan thanh cong', GETDATE(), 180000),
('TT003', 'DH003', N'COD',   N'Cho thanh toan',        GETDATE(), 375000),
('TT004', 'DH004', N'COD',   N'Cho thanh toan',        GETDATE(),  83000);

-- LichSuHanhVi
INSERT INTO LichSuHanhVi VALUES
('LOG001', 'KH001', 'SP007', N'XemSanPham',  GETDATE()),
('LOG002', 'KH001', 'SP007', N'ThemGioHang', GETDATE()),
('LOG003', 'KH001', 'SP007', N'DatHang',     GETDATE()),
('LOG004', 'KH001', 'SP005', N'XemSanPham',  GETDATE()),
('LOG005', 'KH001', 'SP005', N'DatHang',     GETDATE()),
('LOG006', 'KH002', 'SP009', N'XemSanPham',  GETDATE()),
('LOG007', 'KH002', 'SP009', N'ThemGioHang', GETDATE()),
('LOG008', 'KH002', 'SP009', N'DatHang',     GETDATE()),
('LOG009', 'KH002', 'SP002', N'XemSanPham',  GETDATE()),
('LOG010', 'KH003', 'SP001', N'XemSanPham',  GETDATE()),
('LOG011', 'KH003', 'SP004', N'XemSanPham',  GETDATE()),
('LOG012', 'KH003', 'SP001', N'ThemGioHang', GETDATE()),
('LOG013', 'KH003', 'SP004', N'ThemGioHang', GETDATE());
GO

-- ================================================================
-- KIEM TRA (Chay thu de xac nhan database hoat dong)
-- ================================================================

-- Xem tat ca san pham
SELECT * FROM SanPham;

-- Tim kiem san pham theo tu khoa
EXEC sp_TimKiemSanPham N'sach';

-- Loc theo gia (20.000 - 100.000 VND)
EXEC sp_LocTheoGia 20000, 100000;

-- Loc theo danh muc Rau cu sach
EXEC sp_LocTheoDanhMuc 'DM001';

-- Goi y san pham cho KH001 dua tren lich su
EXEC sp_GoiYTheoLichSuMua 'KH001';

-- Tim kiem khach hang
EXEC sp_TimKiemKhachHang N'Nguyen';

-- Xem don hang cua KH001
SELECT dh.*, kh.hoTen
FROM DonHang dh
JOIN KhachHang kh ON dh.maKH = kh.maKH
WHERE dh.maKH = 'KH001';
GO
