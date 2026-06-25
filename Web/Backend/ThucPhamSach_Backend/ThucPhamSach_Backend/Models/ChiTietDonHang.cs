namespace ThucPhamSach_Backend.Models;

public class ChiTietDonHang
{
    public string MaDonHang { get; set; } = null!;
    public string MaSp { get; set; } = null!;
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }

    public DonHang DonHang { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
}
