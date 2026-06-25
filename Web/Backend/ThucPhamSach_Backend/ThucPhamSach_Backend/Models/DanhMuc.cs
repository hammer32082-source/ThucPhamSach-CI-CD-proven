namespace ThucPhamSach_Backend.Models;

public class DanhMuc
{
    public string MaDanhMuc { get; set; } = null!;
    public string TenDanhMuc { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? MaDanhMucCha { get; set; }

    public DanhMuc? DanhMucCha { get; set; }
    public ICollection<DanhMuc> DanhMucCons { get; set; } = new List<DanhMuc>();
    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
