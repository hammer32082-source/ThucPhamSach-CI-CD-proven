namespace ThucPhamSach_Backend.Models;

public class GioHang
{
    public string MaGioHang { get; set; } = null!;
    public string MaKh { get; set; } = null!;
    public decimal TongTien { get; set; }

    public KhachHang KhachHang { get; set; } = null!;
    public ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();
}
