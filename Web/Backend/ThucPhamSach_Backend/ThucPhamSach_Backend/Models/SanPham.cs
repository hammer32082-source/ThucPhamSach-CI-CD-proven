namespace ThucPhamSach_Backend.Models;

public class SanPham
{
    public string MaSp { get; set; } = null!;
    public string MaDanhMuc { get; set; } = null!;
    public string TenSp { get; set; } = null!;
    public decimal Gia { get; set; }
    public int SoLuongTon { get; set; }
    public string? DonViTinh { get; set; }
    public string? NguonGoc { get; set; }
    public string? HinhAnh { get; set; }
    public string? MoTa { get; set; }
    public DateOnly? HanSuDung { get; set; }

    public DanhMuc DanhMuc { get; set; } = null!;
    public ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();
    public ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();
    public ICollection<LichSuHanhVi> LichSuHanhVis { get; set; } = new List<LichSuHanhVi>();
}
