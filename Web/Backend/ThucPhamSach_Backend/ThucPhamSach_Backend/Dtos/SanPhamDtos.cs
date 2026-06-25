using System.ComponentModel.DataAnnotations;

namespace ThucPhamSach_Backend.Dtos;

public class SanPhamDto
{
    public string MaSp { get; set; } = string.Empty;
    public string MaDanhMuc { get; set; } = string.Empty;
    public string? TenDanhMuc { get; set; }
    public string? MaDanhMucCha { get; set; }
    public string? TenDanhMucCha { get; set; }
    public string TenSp { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public int SoLuongTon { get; set; }
    public string? DonViTinh { get; set; }
    public string? NguonGoc { get; set; }
    public string? HinhAnh { get; set; }
    public string? MoTa { get; set; }
    public DateOnly? HanSuDung { get; set; }
}

public class CreateSanPhamRequest
{
    [Required]
    [MaxLength(10)]
    public string MaDanhMuc { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TenSp { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Gia { get; set; }

    [Range(0, int.MaxValue)]
    public int SoLuongTon { get; set; }

    [MaxLength(50)]
    public string? DonViTinh { get; set; }

    [MaxLength(100)]
    public string? NguonGoc { get; set; }

    public string? HinhAnh { get; set; }

    [MaxLength(4000)]
    public string? MoTa { get; set; }

    public DateOnly? HanSuDung { get; set; }
}

public class UpdateSanPhamRequest
{
    [Required]
    [MaxLength(10)]
    public string MaDanhMuc { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string TenSp { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Gia { get; set; }

    [Range(0, int.MaxValue)]
    public int SoLuongTon { get; set; }

    [MaxLength(50)]
    public string? DonViTinh { get; set; }

    [MaxLength(100)]
    public string? NguonGoc { get; set; }

    public string? HinhAnh { get; set; }

    [MaxLength(4000)]
    public string? MoTa { get; set; }

    public DateOnly? HanSuDung { get; set; }
}
