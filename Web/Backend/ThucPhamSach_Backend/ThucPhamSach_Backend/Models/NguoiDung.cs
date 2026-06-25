namespace ThucPhamSach_Backend.Models;

public class NguoiDung
{
    public string MaNguoiDung { get; set; } = null!;
    public string TenDangNhap { get; set; } = null!;
    public string MatKhau { get; set; } = null!;
    public string VaiTro { get; set; } = null!;
    public DateTime NgayTao { get; set; }

    public Admin? Admin { get; set; }
    public KhachHang? KhachHang { get; set; }
}
