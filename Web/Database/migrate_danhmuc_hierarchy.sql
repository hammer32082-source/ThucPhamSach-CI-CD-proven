-- Migration: add parent-child category hierarchy
-- Run on existing databases that were created before this update.

IF COL_LENGTH('DanhMuc', 'maDanhMucCha') IS NULL
BEGIN
    ALTER TABLE DanhMuc ADD maDanhMucCha VARCHAR(10) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_DanhMuc_DanhMucCha'
)
BEGIN
    ALTER TABLE DanhMuc WITH NOCHECK
    ADD CONSTRAINT FK_DanhMuc_DanhMucCha
        FOREIGN KEY (maDanhMucCha) REFERENCES DanhMuc(maDanhMuc);
END
GO

IF NOT EXISTS (SELECT 1 FROM DanhMuc WHERE maDanhMuc = 'DMP01')
BEGIN
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

    UPDATE SanPham SET maDanhMuc = 'DM021' WHERE maSP = 'SP001';
    UPDATE SanPham SET maDanhMuc = 'DM022' WHERE maSP IN ('SP002', 'SP003');
    UPDATE SanPham SET maDanhMuc = 'DM052' WHERE maSP IN ('SP004', 'SP005');
    UPDATE SanPham SET maDanhMuc = 'DM051' WHERE maSP = 'SP006';
    UPDATE SanPham SET maDanhMuc = 'DM041' WHERE maSP IN ('SP007', 'SP008');
    UPDATE SanPham SET maDanhMuc = 'DM043' WHERE maSP = 'SP009';
    UPDATE SanPham SET maDanhMuc = 'DM011' WHERE maSP = 'SP010';
    UPDATE SanPham SET maDanhMuc = 'DM012' WHERE maSP = 'SP011';
    UPDATE SanPham SET maDanhMuc = 'DM032' WHERE maSP = 'SP012';

    DELETE FROM DanhMuc WHERE maDanhMuc IN ('DM001', 'DM002', 'DM003', 'DM004', 'DM005');
END
GO
