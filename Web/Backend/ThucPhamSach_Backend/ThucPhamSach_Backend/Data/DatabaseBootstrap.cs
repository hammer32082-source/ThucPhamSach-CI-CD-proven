using Microsoft.EntityFrameworkCore;

namespace ThucPhamSach_Backend.Data;

public static class DatabaseBootstrap
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ThucPhamSachDbContext>();
        await EnsureCategoryHierarchyAsync(context);
    }

    private static async Task EnsureCategoryHierarchyAsync(ThucPhamSachDbContext context)
    {
        await context.Database.ExecuteSqlRawAsync("""
            IF COL_LENGTH('DanhMuc', 'maDanhMucCha') IS NULL
            BEGIN
                ALTER TABLE DanhMuc ADD maDanhMucCha VARCHAR(10) NULL;
            END
            """);

        await context.Database.ExecuteSqlRawAsync("""
            IF NOT EXISTS (
                SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_DanhMuc_DanhMucCha'
            )
            BEGIN
                ALTER TABLE DanhMuc WITH NOCHECK
                ADD CONSTRAINT FK_DanhMuc_DanhMucCha
                    FOREIGN KEY (maDanhMucCha) REFERENCES DanhMuc(maDanhMuc);
            END
            """);

        var hasHierarchy = await context.DanhMucs.AnyAsync(x => x.MaDanhMuc == "DMP01");
        if (!hasHierarchy)
        {
            await context.Database.ExecuteSqlRawAsync("""
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
                """);

            await context.Database.ExecuteSqlRawAsync("""
                IF EXISTS (SELECT 1 FROM DanhMuc WHERE maDanhMuc = 'DM001')
                BEGIN
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
                """);
        }

        await CleanupLegacyCategoriesAsync(context);
        // await RepairMissingDefaultChildrenAsync(context); // Disabled to prevent auto-recreating deleted categories
    }

    private static async Task RepairMissingDefaultChildrenAsync(ThucPhamSachDbContext context)
    {
        var defaults = new Dictionary<string, (string Id, string Name, string? MoTa)[]>
        {
            ["DMP01"] =
            [
                ("DM011", "Gao cac loai", "Gao trang, gao lut va gao huu co"),
                ("DM012", "Dau va hat", "Dau phu, dau xanh va cac loai hat"),
                ("DM013", "Ngu coc an sang", "Yen mach, granola va ngu coc instant")
            ],
            ["DMP02"] =
            [
                ("DM021", "Rau an la", "Rau cai, rau muong, xa lach"),
                ("DM022", "Rau cu qua", "Ca chua, khoai tay, ca rot"),
                ("DM023", "Rau gia vi", "Hanh, toi, gung, ot")
            ],
            ["DMP03"] =
            [
                ("DM031", "Sua tuoi", "Sua tuoi nguyen chat"),
                ("DM032", "Sua chua", "Sua chua uong va an"),
                ("DM033", "Sua hat", "Sua dau nanh, sua hat dieu")
            ],
            ["DMP04"] =
            [
                ("DM041", "Thit heo va bo", "Thit heo, thit bo tuoi"),
                ("DM042", "Thit gia cam", "Thit ga, vit va ca tam"),
                ("DM043", "Hai san", "Ca, tom, muc tuoi")
            ],
            ["DMP05"] =
            [
                ("DM051", "Trai cay Viet Nam", "Cam, buoi, xoai, nhan"),
                ("DM052", "Trai cay nhap khau", "Tao, nho, viet quat nhap khau"),
                ("DM053", "Trai cay theo mua", "Trai cay theo mua vung mien")
            ]
        };

        var changed = false;

        foreach (var (parentId, children) in defaults)
        {
            var parentExists = await context.DanhMucs.AnyAsync(x => x.MaDanhMuc == parentId);
            if (!parentExists)
            {
                continue;
            }

            foreach (var (id, name, moTa) in children)
            {
                var exists = await context.DanhMucs.AnyAsync(x => x.MaDanhMuc == id);
                if (exists)
                {
                    continue;
                }

                context.DanhMucs.Add(new Models.DanhMuc
                {
                    MaDanhMuc = id,
                    TenDanhMuc = name,
                    MoTa = moTa,
                    MaDanhMucCha = parentId
                });
                changed = true;
            }
        }

        if (changed)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task CleanupLegacyCategoriesAsync(ThucPhamSachDbContext context)
    {
        await context.Database.ExecuteSqlRawAsync("""
            UPDATE SanPham SET maDanhMuc = 'DM032' WHERE maDanhMuc = 'DM005';
            UPDATE SanPham SET maDanhMuc = 'DM012' WHERE maDanhMuc = 'DM006' AND tenSP LIKE N'%hat%';
            UPDATE SanPham SET maDanhMuc = 'DM013' WHERE maDanhMuc = 'DM006' AND tenSP LIKE N'%ngu%coc%';
            UPDATE SanPham SET maDanhMuc = 'DM032' WHERE maDanhMuc = 'DM006' AND tenSP LIKE N'%sua%';
            UPDATE SanPham SET maDanhMuc = 'DM011' WHERE maDanhMuc = 'DM006';
            UPDATE SanPham SET maDanhMuc = 'DM021' WHERE maDanhMuc = 'DM001';
            UPDATE SanPham SET maDanhMuc = 'DM051' WHERE maDanhMuc = 'DM002';
            UPDATE SanPham SET maDanhMuc = 'DM041' WHERE maDanhMuc = 'DM003';

            DELETE dm
            FROM DanhMuc dm
            WHERE dm.maDanhMuc IN ('DM001', 'DM002', 'DM003', 'DM004', 'DM005', 'DM006')
              AND NOT EXISTS (SELECT 1 FROM SanPham sp WHERE sp.maDanhMuc = dm.maDanhMuc);
            """);
    }
}
