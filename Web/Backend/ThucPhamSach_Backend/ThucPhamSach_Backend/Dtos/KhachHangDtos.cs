namespace ThucPhamSach_Backend.Dtos;

public class KhachHangDto
{
    public string MaKh { get; set; } = string.Empty;
    public string MaNguoiDung { get; set; } = string.Empty;
    public string TenDangNhap { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string? Sdt { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
}

public class CreateKhachHangRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string HoTen { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string TenDangNhap { get; set; } = string.Empty;

    public string? Email { get; set; }
    public string? Sdt { get; set; }
}

public class UpdateKhachHangRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string HoTen { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required]
    public string TenDangNhap { get; set; } = string.Empty;

    public string? Email { get; set; }
    public string? Sdt { get; set; }
}
