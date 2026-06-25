using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThucPhamSach_Backend.Common;
using ThucPhamSach_Backend.Data;
using ThucPhamSach_Backend.Dtos;
using ThucPhamSach_Backend.Models;

namespace ThucPhamSach_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoiYController : ControllerBase
{
    private const int RecommendationLimit = 8;

    private readonly ThucPhamSachDbContext _context;

    public GoiYController(ThucPhamSachDbContext context)
    {
        _context = context;
    }

    [HttpGet("khach-hang")]
    [Authorize(Roles = "KhachHang")]
    public async Task<IActionResult> GetRecommendationsForCustomer()
    {
        try
        {
            var user = HttpContext.User;
            var maKH = user.FindFirst("maKH")?.Value;

            if (string.IsNullOrEmpty(maKH))
            {
                return BadRequest(ApiResponse<object>.Fail("Không tìm thấy thông tin khách hàng."));
            }

            var recommendations = await GetRecommendationsAsync(maKH);
            return Ok(ApiResponse<object>.Ok(recommendations));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Không thể lấy gợi ý sản phẩm."));
        }
    }

    [HttpGet("khach-hang/{maKH}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetRecommendationsForCustomerById(string maKH)
    {
        try
        {
            var recommendations = await GetRecommendationsAsync(maKH);
            return Ok(ApiResponse<object>.Ok(recommendations));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Không thể lấy gợi ý sản phẩm."));
        }
    }

    private async Task<object> GetRecommendationsAsync(string maKH)
    {
        // 1. Gợi ý theo lịch sử mua hàng (sản phẩm cùng danh mục đã mua)
        var purchaseHistoryRecommendations = await GetRecommendationsByPurchaseHistory(maKH);

        // 2. Gợi ý theo hành vi mua sắm (sản phẩm đã xem, tìm kiếm, thêm giỏ)
        var behaviorRecommendations = await GetRecommendationsByBehavior(maKH);

        // 3. Gợi ý theo danh mục phổ biến
        var categoryRecommendations = await GetRecommendationsByCategory(maKH);

        var fallbackRecommendations = new List<SanPhamDto>();

        // Fallback: Nếu không có gợi ý nào, gợi ý sản phẩm bán chạy
        if (!purchaseHistoryRecommendations.Any() && !behaviorRecommendations.Any() && !categoryRecommendations.Any())
        {
            fallbackRecommendations = await GetFallbackRecommendations();
        }

        return new {
            LichSuMuaHang = purchaseHistoryRecommendations,
            HanhViMuaSam = behaviorRecommendations,
            TheoDanhMuc = categoryRecommendations,
            Fallback = fallbackRecommendations
        };
    }

    private async Task<List<SanPhamDto>> GetRecommendationsByPurchaseHistory(string maKH)
    {
        // Lấy danh sách sản phẩm khách đã mua, xếp theo số lượng đã mua (mua nhiều ưu tiên)
        var purchasedProductIds = await _context.ChiTietDonHangs
            .Join(_context.DonHangs, ct => ct.MaDonHang, dh => dh.MaDonHang, (ct, dh) => new { ct, dh })
            .Where(x => x.dh.MaKh == maKH)
            .GroupBy(x => x.ct.MaSp)
            .OrderByDescending(g => g.Sum(x => x.ct.SoLuong))
            .Select(g => g.Key)
            .Take(RecommendationLimit / 2) // Lấy tối đa nửa số lượng là hàng mua lại
            .ToListAsync();

        var result = new List<SanPhamDto>();

        if (purchasedProductIds.Any())
        {
            var purchasedProducts = await _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .Where(x => purchasedProductIds.Contains(x.MaSp) && x.SoLuongTon > 0)
                .ToListAsync();

            result.AddRange(purchasedProductIds
                .Select(id => purchasedProducts.FirstOrDefault(r => r.MaSp == id))
                .Where(r => r != null)
                .Select(x => ToDto(x!)));
        }

        // Nếu chưa đủ, tìm sản phẩm bán chạy nhất trong CÁC danh mục khách đã mua
        if (result.Count < RecommendationLimit && purchasedProductIds.Any())
        {
            var purchasedCategories = await _context.SanPhams
                .Where(x => purchasedProductIds.Contains(x.MaSp))
                .Select(x => x.MaDanhMuc)
                .Distinct()
                .ToListAsync();

            var existingIds = result.Select(x => x.MaSp).ToList();

            var topSellingRelatedIds = await _context.ChiTietDonHangs
                .Join(_context.SanPhams, ct => ct.MaSp, sp => sp.MaSp, (ct, sp) => new { ct, sp })
                .Where(x => purchasedCategories.Contains(x.sp.MaDanhMuc) && !existingIds.Contains(x.sp.MaSp))
                .GroupBy(x => x.sp.MaSp)
                .OrderByDescending(g => g.Sum(x => x.ct.SoLuong))
                .Select(g => g.Key)
                .Take(RecommendationLimit - result.Count)
                .ToListAsync();

            if (topSellingRelatedIds.Any())
            {
                var relatedProducts = await _context.SanPhams
                    .AsNoTracking()
                    .Include(x => x.DanhMuc)
                        .ThenInclude(x => x.DanhMucCha)
                    .Where(x => topSellingRelatedIds.Contains(x.MaSp) && x.SoLuongTon > 0)
                    .ToListAsync();

                result.AddRange(topSellingRelatedIds
                    .Select(id => relatedProducts.FirstOrDefault(r => r.MaSp == id))
                    .Where(r => r != null)
                    .Select(x => ToDto(x!)));
            }
        }

        return result;
    }

    private async Task<List<SanPhamDto>> GetRecommendationsByBehavior(string maKH)
    {
        // Lấy danh sách sản phẩm khách hàng đã xem, tìm kiếm, thêm giỏ, nhóm theo MaSp và lấy ThoiGian lớn nhất
        var behaviorProductIds = await _context.LichSuHanhVis
            .Where(x => x.MaKh == maKH 
                && (x.LoaiHanhVi == "XemSanPham" || x.LoaiHanhVi == "TimKiem" || x.LoaiHanhVi == "ThemGioHang")
                && x.MaSp != null)
            .GroupBy(x => x.MaSp)
            .Select(g => new { MaSp = g.Key, LastTime = g.Max(x => x.ThoiGian) })
            .OrderByDescending(x => x.LastTime)
            .Select(x => x.MaSp!)
            .Take(RecommendationLimit)
            .ToListAsync();

        if (!behaviorProductIds.Any())
            return new List<SanPhamDto>();

        // Lấy thông tin các sản phẩm này
        var recommendations = await _context.SanPhams
            .AsNoTracking()
            .Include(x => x.DanhMuc)
                .ThenInclude(x => x.DanhMucCha)
            .Where(x => behaviorProductIds.Contains(x.MaSp) && x.SoLuongTon > 0)
            .Select(x => ToDto(x))
            .ToListAsync();

        // Sắp xếp lại theo thứ tự thời gian xem (mới nhất trước)
        return behaviorProductIds
            .Select(id => recommendations.FirstOrDefault(r => r.MaSp == id))
            .Where(r => r != null)
            .ToList()!;
    }

    private async Task<List<SanPhamDto>> GetRecommendationsByCategory(string maKH)
    {
        // Lấy danh mục khách hàng quan tâm nhất (dựa trên số lượng tương tác)
        var favoriteCategory = await _context.LichSuHanhVis
            .Join(_context.SanPhams, lshv => lshv.MaSp, sp => sp.MaSp, (lshv, sp) => new { lshv, sp })
            .Where(x => x.lshv.MaKh == maKH && x.lshv.MaSp != null)
            .GroupBy(x => x.sp.MaDanhMuc)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        if (string.IsNullOrEmpty(favoriteCategory))
            return new List<SanPhamDto>();

        // Lấy sản phẩm bán chạy nhất trong danh mục yêu thích
        var topSellingInCategoryIds = await _context.ChiTietDonHangs
            .Join(_context.SanPhams, ct => ct.MaSp, sp => sp.MaSp, (ct, sp) => new { ct, sp })
            .Where(x => x.sp.MaDanhMuc == favoriteCategory)
            .GroupBy(x => x.sp.MaSp)
            .OrderByDescending(g => g.Sum(x => x.ct.SoLuong))
            .Select(g => g.Key)
            .Take(RecommendationLimit)
            .ToListAsync();

        var recommendations = await _context.SanPhams
            .AsNoTracking()
            .Include(x => x.DanhMuc)
                .ThenInclude(x => x.DanhMucCha)
            .Where(x => topSellingInCategoryIds.Contains(x.MaSp) && x.SoLuongTon > 0)
            .ToListAsync();

        var result = topSellingInCategoryIds
            .Select(id => recommendations.FirstOrDefault(r => r.MaSp == id))
            .Where(r => r != null)
            .Select(x => ToDto(x!))
            .ToList();

        // Điền thêm bằng sản phẩm ngẫu nhiên trong danh mục nếu chưa đủ (trường hợp ít dữ liệu bán)
        if (result.Count < RecommendationLimit)
        {
            var existingIds = result.Select(x => x.MaSp).ToList();
            var additional = await _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .Where(x => x.MaDanhMuc == favoriteCategory && !existingIds.Contains(x.MaSp) && x.SoLuongTon > 0)
                .OrderBy(x => Guid.NewGuid())
                .Take(RecommendationLimit - result.Count)
                .Select(x => ToDto(x))
                .ToListAsync();
            
            result.AddRange(additional);
        }

        return result;
    }

    private async Task<List<SanPhamDto>> GetFallbackRecommendations()
    {
        // Gợi ý sản phẩm bán chạy nhất toàn hệ thống
        var topSellingProductIds = await _context.ChiTietDonHangs
            .GroupBy(x => x.MaSp)
            .OrderByDescending(g => g.Sum(x => x.SoLuong))
            .Select(g => g.Key)
            .Take(RecommendationLimit)
            .ToListAsync();

        var recommendations = await _context.SanPhams
            .AsNoTracking()
            .Include(x => x.DanhMuc)
                .ThenInclude(x => x.DanhMucCha)
            .Where(x => topSellingProductIds.Contains(x.MaSp) && x.SoLuongTon > 0)
            .ToListAsync();

        // Sắp xếp lại theo thứ tự bán chạy
        var result = topSellingProductIds
            .Select(id => recommendations.FirstOrDefault(r => r.MaSp == id))
            .Where(r => r != null)
            .Select(x => ToDto(x!))
            .ToList();

        // Nếu chưa đủ RecommendationLimit (do database mới/ít đơn), lấy thêm ngẫu nhiên
        if (result.Count < RecommendationLimit)
        {
            var existingIds = result.Select(x => x.MaSp).ToList();
            var additional = await _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .Where(x => !existingIds.Contains(x.MaSp) && x.SoLuongTon > 0)
                .OrderBy(x => Guid.NewGuid()) 
                .Take(RecommendationLimit - result.Count)
                .Select(x => ToDto(x))
                .ToListAsync();
            
            result.AddRange(additional);
        }

        return result;
    }

    private static SanPhamDto ToDto(SanPham sanPham)
    {
        return new SanPhamDto
        {
            MaSp = sanPham.MaSp,
            MaDanhMuc = sanPham.MaDanhMuc,
            TenDanhMuc = sanPham.DanhMuc.TenDanhMuc,
            MaDanhMucCha = sanPham.DanhMuc.MaDanhMucCha,
            TenDanhMucCha = sanPham.DanhMuc.DanhMucCha?.TenDanhMuc,
            TenSp = sanPham.TenSp,
            Gia = sanPham.Gia,
            SoLuongTon = sanPham.SoLuongTon,
            DonViTinh = sanPham.DonViTinh,
            NguonGoc = sanPham.NguonGoc,
            HinhAnh = sanPham.HinhAnh,
            MoTa = sanPham.MoTa,
            HanSuDung = sanPham.HanSuDung
        };
    }
}
