namespace ThucPhamSach_Backend.Models;

public class LichSuHanhVi
{
    public string MaLog { get; set; } = null!;
    public string MaKh { get; set; } = null!;
    public string? MaSp { get; set; }
    public string LoaiHanhVi { get; set; } = null!;
    public DateTime ThoiGian { get; set; }

    public KhachHang KhachHang { get; set; } = null!;
    public SanPham? SanPham { get; set; }
}
