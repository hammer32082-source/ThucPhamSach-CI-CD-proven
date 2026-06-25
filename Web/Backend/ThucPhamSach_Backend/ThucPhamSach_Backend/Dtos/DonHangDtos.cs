using System.ComponentModel.DataAnnotations;

namespace ThucPhamSach_Backend.Dtos;

public class CheckoutRequest
{
    [MaxLength(255)]
    public string? DiaChiGiao { get; set; }

    [Required]
    [MaxLength(50)]
    public string PhuongThucThanhToan { get; set; } = "COD";
}

public class UpdateTrangThaiDonHangRequest
{
    [Required]
    [MaxLength(50)]
    public string TrangThaiMoi { get; set; } = string.Empty;
}

public class DonHangDto
{
    public string MaDonHang { get; set; } = string.Empty;
    public string MaKh { get; set; } = string.Empty;
    public string? HoTenKhachHang { get; set; }
    public string? SdtKhachHang { get; set; }
    public DateTime NgayDat { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThaiDonHang { get; set; } = string.Empty;
    public string? DiaChiGiao { get; set; }
    public ThanhToanDto? ThanhToan { get; set; }
    public List<DonHangItemDto> Items { get; set; } = [];
}

public class DonHangItemDto
{
    public string MaSp { get; set; } = string.Empty;
    public string TenSp { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public decimal DonGia { get; set; }
    public int SoLuong { get; set; }
    public decimal ThanhTien { get; set; }
}

public class ThanhToanDto
{
    public string MaThanhToan { get; set; } = string.Empty;
    public string PhuongThuc { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public DateTime ThoiGian { get; set; }
    public decimal TongTienThanhToan { get; set; }
}
