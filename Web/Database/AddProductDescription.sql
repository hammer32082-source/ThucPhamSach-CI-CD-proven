USE DbforThucPhamSach;
GO

IF COL_LENGTH('dbo.SanPham', 'moTa') IS NULL
BEGIN
    ALTER TABLE dbo.SanPham
    ADD moTa NVARCHAR(4000) NULL;
END;
GO
