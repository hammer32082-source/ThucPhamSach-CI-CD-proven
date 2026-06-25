using Microsoft.EntityFrameworkCore;
using ThucPhamSach_Backend.Models;

namespace ThucPhamSach_Backend.Data;

public class ThucPhamSachDbContext : DbContext
{
    public ThucPhamSachDbContext(DbContextOptions<ThucPhamSachDbContext> options)
        : base(options)
    {
    }

    public DbSet<NguoiDung> NguoiDungs => Set<NguoiDung>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<KhachHang> KhachHangs => Set<KhachHang>();
    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<SanPham> SanPhams => Set<SanPham>();
    public DbSet<GioHang> GioHangs => Set<GioHang>();
    public DbSet<ChiTietGioHang> ChiTietGioHangs => Set<ChiTietGioHang>();
    public DbSet<DonHang> DonHangs => Set<DonHang>();
    public DbSet<ChiTietDonHang> ChiTietDonHangs => Set<ChiTietDonHang>();
    public DbSet<ThanhToan> ThanhToans => Set<ThanhToan>();
    public DbSet<LichSuHanhVi> LichSuHanhVis => Set<LichSuHanhVi>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.ToTable("NguoiDung");
            entity.HasKey(e => e.MaNguoiDung).HasName("PK_NguoiDung");

            entity.HasIndex(e => e.TenDangNhap)
                .IsUnique()
                .HasDatabaseName("UQ_NguoiDung_TenDangNhap");

            entity.Property(e => e.MaNguoiDung)
                .HasColumnName("maNguoiDung")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TenDangNhap)
                .HasColumnName("tenDangNhap")
                .HasMaxLength(50);
            entity.Property(e => e.MatKhau)
                .HasColumnName("matKhau")
                .HasMaxLength(255);
            entity.Property(e => e.VaiTro)
                .HasColumnName("vaiTro")
                .HasMaxLength(20);
            entity.Property(e => e.NgayTao)
                .HasColumnName("ngayTao")
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETDATE()");
        });

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.ToTable("Admin");
            entity.HasKey(e => e.MaAdmin).HasName("PK_Admin");

            entity.HasIndex(e => e.MaNguoiDung)
                .IsUnique()
                .HasDatabaseName("UQ_Admin_NguoiDung");

            entity.Property(e => e.MaAdmin)
                .HasColumnName("maAdmin")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaNguoiDung)
                .HasColumnName("maNguoiDung")
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.HasOne(e => e.NguoiDung)
                .WithOne(e => e.Admin)
                .HasForeignKey<Admin>(e => e.MaNguoiDung)
                .HasConstraintName("FK_Admin_NguoiDung")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<KhachHang>(entity =>
        {
            entity.ToTable("KhachHang");
            entity.HasKey(e => e.MaKh).HasName("PK_KhachHang");

            entity.HasIndex(e => e.MaNguoiDung)
                .IsUnique()
                .HasDatabaseName("UQ_KhachHang_NguoiDung");

            entity.Property(e => e.MaKh)
                .HasColumnName("maKH")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaNguoiDung)
                .HasColumnName("maNguoiDung")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.HoTen)
                .HasColumnName("hoTen")
                .HasMaxLength(100);
            entity.Property(e => e.Sdt)
                .HasColumnName("sdt")
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(100);
            entity.Property(e => e.DiaChi)
                .HasColumnName("diaChi")
                .HasMaxLength(255);

            entity.HasOne(e => e.NguoiDung)
                .WithOne(e => e.KhachHang)
                .HasForeignKey<KhachHang>(e => e.MaNguoiDung)
                .HasConstraintName("FK_KhachHang_NguoiDung")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DanhMuc>(entity =>
        {
            entity.ToTable("DanhMuc");
            entity.HasKey(e => e.MaDanhMuc).HasName("PK_DanhMuc");

            entity.Property(e => e.MaDanhMuc)
                .HasColumnName("maDanhMuc")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TenDanhMuc)
                .HasColumnName("tenDanhMuc")
                .HasMaxLength(100);
            entity.Property(e => e.MoTa)
                .HasColumnName("moTa")
                .HasMaxLength(500);
            entity.Property(e => e.MaDanhMucCha)
                .HasColumnName("maDanhMucCha")
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.HasOne(e => e.DanhMucCha)
                .WithMany(e => e.DanhMucCons)
                .HasForeignKey(e => e.MaDanhMucCha)
                .HasConstraintName("FK_DanhMuc_DanhMucCha")
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<SanPham>(entity =>
        {
            entity.ToTable("SanPham");
            entity.HasKey(e => e.MaSp).HasName("PK_SanPham");

            entity.HasIndex(e => e.MaDanhMuc).HasDatabaseName("IX_SanPham_DanhMuc");
            entity.HasIndex(e => e.Gia).HasDatabaseName("IX_SanPham_Gia");

            entity.Property(e => e.MaSp)
                .HasColumnName("maSP")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaDanhMuc)
                .HasColumnName("maDanhMuc")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TenSp)
                .HasColumnName("tenSP")
                .HasMaxLength(200);
            entity.Property(e => e.Gia)
                .HasColumnName("gia")
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.SoLuongTon)
                .HasColumnName("soLuongTon")
                .HasDefaultValue(0);
            entity.Property(e => e.DonViTinh)
                .HasColumnName("donViTinh")
                .HasMaxLength(50);
            entity.Property(e => e.NguonGoc)
                .HasColumnName("nguonGoc")
                .HasMaxLength(100);
            entity.Property(e => e.HinhAnh)
                .HasColumnName("hinhAnh");
            entity.Property(e => e.MoTa)
                .HasColumnName("moTa")
                .HasMaxLength(4000);
            entity.Property(e => e.HanSuDung)
                .HasColumnName("hanSuDung")
                .HasColumnType("date");

            entity.HasOne(e => e.DanhMuc)
                .WithMany(e => e.SanPhams)
                .HasForeignKey(e => e.MaDanhMuc)
                .HasConstraintName("FK_SanPham_DanhMuc");
        });

        modelBuilder.Entity<GioHang>(entity =>
        {
            entity.ToTable("GioHang");
            entity.HasKey(e => e.MaGioHang).HasName("PK_GioHang");

            entity.HasIndex(e => e.MaKh)
                .IsUnique()
                .HasDatabaseName("UQ_GioHang_KhachHang");

            entity.Property(e => e.MaGioHang)
                .HasColumnName("maGioHang")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaKh)
                .HasColumnName("maKH")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TongTien)
                .HasColumnName("tongTien")
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0m);

            entity.HasOne(e => e.KhachHang)
                .WithOne(e => e.GioHang)
                .HasForeignKey<GioHang>(e => e.MaKh)
                .HasConstraintName("FK_GioHang_KhachHang")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChiTietGioHang>(entity =>
        {
            entity.ToTable("ChiTietGioHang");
            entity.HasKey(e => new { e.MaGioHang, e.MaSp }).HasName("PK_ChiTietGioHang");

            entity.Property(e => e.MaGioHang)
                .HasColumnName("maGioHang")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaSp)
                .HasColumnName("maSP")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.SoLuong)
                .HasColumnName("soLuong")
                .HasDefaultValue(1);
            entity.Property(e => e.DonGia)
                .HasColumnName("donGia")
                .HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.GioHang)
                .WithMany(e => e.ChiTietGioHangs)
                .HasForeignKey(e => e.MaGioHang)
                .HasConstraintName("FK_CTGioHang_GioHang")
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SanPham)
                .WithMany(e => e.ChiTietGioHangs)
                .HasForeignKey(e => e.MaSp)
                .HasConstraintName("FK_CTGioHang_SanPham");
        });

        modelBuilder.Entity<DonHang>(entity =>
        {
            entity.ToTable("DonHang");
            entity.HasKey(e => e.MaDonHang).HasName("PK_DonHang");

            entity.HasIndex(e => e.MaKh).HasDatabaseName("IX_DonHang_KhachHang");
            entity.HasIndex(e => e.TrangThaiDonHang).HasDatabaseName("IX_DonHang_TrangThai");

            entity.Property(e => e.MaDonHang)
                .HasColumnName("maDonHang")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaKh)
                .HasColumnName("maKH")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.NgayDat)
                .HasColumnName("ngayDat")
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.TongTien)
                .HasColumnName("tongTien")
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.TrangThaiDonHang)
                .HasColumnName("trangThaiDonHang")
                .HasMaxLength(50)
                .HasDefaultValue("Cho xac nhan");
            entity.Property(e => e.DiaChiGiao)
                .HasColumnName("diaChiGiao")
                .HasMaxLength(255);

            entity.HasOne(e => e.KhachHang)
                .WithMany(e => e.DonHangs)
                .HasForeignKey(e => e.MaKh)
                .HasConstraintName("FK_DonHang_KhachHang");
        });

        modelBuilder.Entity<ChiTietDonHang>(entity =>
        {
            entity.ToTable("ChiTietDonHang");
            entity.HasKey(e => new { e.MaDonHang, e.MaSp }).HasName("PK_ChiTietDonHang");

            entity.Property(e => e.MaDonHang)
                .HasColumnName("maDonHang")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaSp)
                .HasColumnName("maSP")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.SoLuong)
                .HasColumnName("soLuong");
            entity.Property(e => e.DonGia)
                .HasColumnName("donGia")
                .HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.DonHang)
                .WithMany(e => e.ChiTietDonHangs)
                .HasForeignKey(e => e.MaDonHang)
                .HasConstraintName("FK_CTDonHang_DonHang")
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SanPham)
                .WithMany(e => e.ChiTietDonHangs)
                .HasForeignKey(e => e.MaSp)
                .HasConstraintName("FK_CTDonHang_SanPham");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.ToTable("ThanhToan");
            entity.HasKey(e => e.MaThanhToan).HasName("PK_ThanhToan");

            entity.HasIndex(e => e.MaDonHang)
                .IsUnique()
                .HasDatabaseName("UQ_ThanhToan_DonHang");

            entity.Property(e => e.MaThanhToan)
                .HasColumnName("maThanhToan")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaDonHang)
                .HasColumnName("maDonHang")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.PhuongThuc)
                .HasColumnName("phuongThuc")
                .HasMaxLength(50);
            entity.Property(e => e.TrangThai)
                .HasColumnName("trangThai")
                .HasMaxLength(50)
                .HasDefaultValue("Cho thanh toan");
            entity.Property(e => e.ThoiGian)
                .HasColumnName("thoiGian")
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.TongTienThanhToan)
                .HasColumnName("tongTienThanhToan")
                .HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.DonHang)
                .WithOne(e => e.ThanhToan)
                .HasForeignKey<ThanhToan>(e => e.MaDonHang)
                .HasConstraintName("FK_ThanhToan_DonHang")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LichSuHanhVi>(entity =>
        {
            entity.ToTable("LichSuHanhVi");
            entity.HasKey(e => e.MaLog).HasName("PK_LichSuHanhVi");

            entity.HasIndex(e => e.MaKh).HasDatabaseName("IX_LichSu_KhachHang");
            entity.HasIndex(e => e.MaSp).HasDatabaseName("IX_LichSu_SanPham");
            entity.HasIndex(e => e.ThoiGian)
                .IsDescending()
                .HasDatabaseName("IX_LichSu_Thoigian");

            entity.Property(e => e.MaLog)
                .HasColumnName("maLog")
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.MaKh)
                .HasColumnName("maKH")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaSp)
                .HasColumnName("maSP")
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.LoaiHanhVi)
                .HasColumnName("loaiHanhVi")
                .HasMaxLength(50);
            entity.Property(e => e.ThoiGian)
                .HasColumnName("thoiGian")
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.KhachHang)
                .WithMany(e => e.LichSuHanhVis)
                .HasForeignKey(e => e.MaKh)
                .HasConstraintName("FK_LichSu_KhachHang")
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SanPham)
                .WithMany(e => e.LichSuHanhVis)
                .HasForeignKey(e => e.MaSp)
                .HasConstraintName("FK_LichSu_SanPham")
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
