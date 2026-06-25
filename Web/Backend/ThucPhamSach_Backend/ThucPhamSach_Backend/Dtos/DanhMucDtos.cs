using System.ComponentModel.DataAnnotations;

namespace ThucPhamSach_Backend.Dtos;

public class DanhMucDto
{
    public string MaDanhMuc { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string? MaDanhMucCha { get; set; }
    public string? TenDanhMucCha { get; set; }
}

public class CreateDanhMucRequest
{
    [Required]
    [MaxLength(100)]
    public string TenDanhMuc { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? MoTa { get; set; }

    [MaxLength(10)]
    public string? MaDanhMucCha { get; set; }
}

public class UpdateDanhMucRequest
{
    [Required]
    [MaxLength(100)]
    public string TenDanhMuc { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? MoTa { get; set; }

    [MaxLength(10)]
    public string? MaDanhMucCha { get; set; }
}
