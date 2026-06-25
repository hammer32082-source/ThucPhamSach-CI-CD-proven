namespace ThucPhamSach_Backend.Models;

public class DonHang
{
    public string MaDonHang { get; set; } = null!;
    public string MaKh { get; set; } = null!;
    public DateTime NgayDat { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThaiDonHang { get; set; } = null!;
    public string? DiaChiGiao { get; set; }

    public KhachHang KhachHang { get; set; } = null!;
    public ThanhToan? ThanhToan { get; set; }
    public ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();
}
