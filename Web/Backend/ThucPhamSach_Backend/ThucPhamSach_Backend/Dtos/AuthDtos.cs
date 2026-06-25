using System.ComponentModel.DataAnnotations;

namespace ThucPhamSach_Backend.Dtos;

public class RegisterRequest
{
    [Required]
    [MaxLength(50)]
    public string TenDangNhap { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string MatKhau { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string HoTen { get; set; } = string.Empty;

    [MaxLength(15)]
    public string? Sdt { get; set; }

    [EmailAddress]
    [MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(255)]
    public string? DiaChi { get; set; }
}

public class LoginRequest
{
    [Required]
    [MaxLength(50)]
    public string TenDangNhap { get; set; } = string.Empty;

    [Required]
    public string MatKhau { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserInfoDto User { get; set; } = null!;
}

public class UserInfoDto
{
    public string MaNguoiDung { get; set; } = string.Empty;
    public string TenDangNhap { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public string? MaKh { get; set; }
    public string? MaAdmin { get; set; }
    public string? HoTen { get; set; }
}
