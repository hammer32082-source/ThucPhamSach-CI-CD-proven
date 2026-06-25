namespace ThucPhamSach_Backend.Models;

public class ChiTietGioHang
{
    public string MaGioHang { get; set; } = null!;
    public string MaSp { get; set; } = null!;
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }

    public GioHang GioHang { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
}
