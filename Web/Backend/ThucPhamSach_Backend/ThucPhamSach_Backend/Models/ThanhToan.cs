namespace ThucPhamSach_Backend.Models;

public class ThanhToan
{
    public string MaThanhToan { get; set; } = null!;
    public string MaDonHang { get; set; } = null!;
    public string PhuongThuc { get; set; } = null!;
    public string TrangThai { get; set; } = null!;
    public DateTime ThoiGian { get; set; }
    public decimal TongTienThanhToan { get; set; }

    public DonHang DonHang { get; set; } = null!;
}
