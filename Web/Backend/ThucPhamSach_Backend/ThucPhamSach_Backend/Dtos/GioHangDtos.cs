using System.ComponentModel.DataAnnotations;

namespace ThucPhamSach_Backend.Dtos;

public class GioHangDto
{
    public string MaGioHang { get; set; } = string.Empty;
    public string MaKh { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public List<GioHangItemDto> Items { get; set; } = [];
}

public class GioHangItemDto
{
    public string MaSp { get; set; } = string.Empty;
    public string TenSp { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public string? DonViTinh { get; set; }
    public decimal DonGia { get; set; }
    public int SoLuong { get; set; }
    public decimal ThanhTien { get; set; }
    public int SoLuongTon { get; set; }
}

public class AddGioHangItemRequest
{
    [Required]
    [MaxLength(10)]
    public string MaSp { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int SoLuong { get; set; } = 1;
}

public class UpdateGioHangItemRequest
{
    [Range(1, int.MaxValue)]
    public int SoLuong { get; set; }
}
