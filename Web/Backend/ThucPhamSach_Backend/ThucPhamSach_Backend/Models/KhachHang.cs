namespace ThucPhamSach_Backend.Models;

public class KhachHang
{
    public string MaKh { get; set; } = null!;
    public string MaNguoiDung { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }

    public NguoiDung NguoiDung { get; set; } = null!;
    public GioHang? GioHang { get; set; }
    public ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();
    public ICollection<LichSuHanhVi> LichSuHanhVis { get; set; } = new List<LichSuHanhVi>();
}
