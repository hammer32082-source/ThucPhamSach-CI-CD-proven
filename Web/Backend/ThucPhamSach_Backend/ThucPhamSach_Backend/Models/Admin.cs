namespace ThucPhamSach_Backend.Models;

public class Admin
{
    public string MaAdmin { get; set; } = null!;
    public string MaNguoiDung { get; set; } = null!;

    public NguoiDung NguoiDung { get; set; } = null!;
}
