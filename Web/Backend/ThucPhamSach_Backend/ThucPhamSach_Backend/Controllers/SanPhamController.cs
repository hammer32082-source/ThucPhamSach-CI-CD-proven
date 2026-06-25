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
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class SanPhamController : ControllerBase
{
    private readonly ThucPhamSachDbContext _context;

    public SanPhamController(ThucPhamSachDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? tuKhoa,
        [FromQuery] string? maDanhMuc,
        [FromQuery] string? maDanhMucCha,
        [FromQuery] decimal? giaMin,
        [FromQuery] decimal? giaMax)
    {
        try
        {
            if (giaMin.HasValue && giaMax.HasValue && giaMin > giaMax)
            {
                return BadRequest(ApiResponse<object>.Fail("Khoang gia khong hop le."));
            }

            var query = _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(tuKhoa))
            {
                var keyword = tuKhoa.Trim();
                query = query.Where(x => x.TenSp.Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(maDanhMuc))
            {
                var categoryId = maDanhMuc.Trim();
                query = query.Where(x => x.MaDanhMuc == categoryId);
            }
            else if (!string.IsNullOrWhiteSpace(maDanhMucCha))
            {
                var parentId = maDanhMucCha.Trim();
                var childCategoryIds = await _context.DanhMucs
                    .AsNoTracking()
                    .Where(x => x.MaDanhMucCha == parentId)
                    .Select(x => x.MaDanhMuc)
                    .ToListAsync();

                if (childCategoryIds.Count == 0)
                {
                    return Ok(ApiResponse<List<SanPhamDto>>.Ok(new List<SanPhamDto>()));
                }

                query = query.Where(x => childCategoryIds.Contains(x.MaDanhMuc));
            }

            if (giaMin.HasValue)
            {
                query = query.Where(x => x.Gia >= giaMin.Value);
            }

            if (giaMax.HasValue)
            {
                query = query.Where(x => x.Gia <= giaMax.Value);
            }

            var sanPhams = await query
                .OrderBy(x => x.TenSp)
                .Select(x => ToDto(x))
                .ToListAsync();

            return Ok(ApiResponse<List<SanPhamDto>>.Ok(sanPhams));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay danh sach san pham."));
        }
    }

    [HttpGet("{maSp}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string maSp)
    {
        try
        {
            var sanPham = await _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .Where(x => x.MaSp == maSp)
                .Select(x => ToDto(x))
                .FirstOrDefaultAsync();

            if (sanPham is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay san pham."));
            }

            return Ok(ApiResponse<SanPhamDto>.Ok(sanPham));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay thong tin san pham."));
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSanPhamRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu san pham khong hop le."));
            }

            var danhMuc = await _context.DanhMucs
                .Include(x => x.DanhMucCons)
                .FirstOrDefaultAsync(x => x.MaDanhMuc == request.MaDanhMuc.Trim());
            if (danhMuc is null)
            {
                return BadRequest(ApiResponse<object>.Fail("Danh muc san pham khong ton tai."));
            }

            if (string.IsNullOrWhiteSpace(danhMuc.MaDanhMucCha))
            {
                return BadRequest(ApiResponse<object>.Fail("San pham phai gan vao danh muc con."));
            }

            if (danhMuc.DanhMucCons.Count > 0)
            {
                return BadRequest(ApiResponse<object>.Fail("San pham phai gan vao danh muc con cuoi cung."));
            }

            var maSp = await GenerateNextCodeAsync(_context.SanPhams.Select(x => x.MaSp), "SP", 3);
            var sanPham = new SanPham
            {
                MaSp = maSp,
                MaDanhMuc = request.MaDanhMuc.Trim(),
                TenSp = request.TenSp.Trim(),
                Gia = request.Gia,
                SoLuongTon = request.SoLuongTon,
                DonViTinh = NormalizeOptional(request.DonViTinh),
                NguonGoc = NormalizeOptional(request.NguonGoc),
                HinhAnh = NormalizeOptional(request.HinhAnh),
                MoTa = NormalizeOptional(request.MoTa),
                HanSuDung = request.HanSuDung
            };

            _context.SanPhams.Add(sanPham);
            await _context.SaveChangesAsync();

            var created = await _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .Where(x => x.MaSp == sanPham.MaSp)
                .Select(x => ToDto(x))
                .FirstAsync();

            return CreatedAtAction(nameof(GetById), new { maSp = sanPham.MaSp },
                ApiResponse<SanPhamDto>.Ok(created, "Them san pham thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the luu san pham vao database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi them san pham."));
        }
    }

    [HttpPut("{maSp}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string maSp, [FromBody] UpdateSanPhamRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu san pham khong hop le."));
            }

            var sanPham = await _context.SanPhams.FindAsync(maSp);
            if (sanPham is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay san pham."));
            }

            var danhMuc = await _context.DanhMucs
                .Include(x => x.DanhMucCons)
                .FirstOrDefaultAsync(x => x.MaDanhMuc == request.MaDanhMuc.Trim());
            if (danhMuc is null)
            {
                return BadRequest(ApiResponse<object>.Fail("Danh muc san pham khong ton tai."));
            }

            if (string.IsNullOrWhiteSpace(danhMuc.MaDanhMucCha))
            {
                return BadRequest(ApiResponse<object>.Fail("San pham phai gan vao danh muc con."));
            }

            if (danhMuc.DanhMucCons.Count > 0)
            {
                return BadRequest(ApiResponse<object>.Fail("San pham phai gan vao danh muc con cuoi cung."));
            }

            sanPham.MaDanhMuc = request.MaDanhMuc.Trim();
            sanPham.TenSp = request.TenSp.Trim();
            sanPham.Gia = request.Gia;
            sanPham.SoLuongTon = request.SoLuongTon;
            sanPham.DonViTinh = NormalizeOptional(request.DonViTinh);
            sanPham.NguonGoc = NormalizeOptional(request.NguonGoc);
            sanPham.HinhAnh = NormalizeOptional(request.HinhAnh);
            sanPham.MoTa = NormalizeOptional(request.MoTa);
            sanPham.HanSuDung = request.HanSuDung;

            await _context.SaveChangesAsync();

            var updated = await _context.SanPhams
                .AsNoTracking()
                .Include(x => x.DanhMuc)
                    .ThenInclude(x => x.DanhMucCha)
                .Where(x => x.MaSp == maSp)
                .Select(x => ToDto(x))
                .FirstAsync();

            return Ok(ApiResponse<SanPhamDto>.Ok(updated, "Cap nhat san pham thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the cap nhat san pham trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi cap nhat san pham."));
        }
    }

    [HttpDelete("{maSp}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string maSp)
    {
        try
        {
            var sanPham = await _context.SanPhams.FindAsync(maSp);
            if (sanPham is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay san pham."));
            }

            _context.SanPhams.Remove(sanPham);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(null, "Xoa san pham thanh cong."));
        }
        catch (DbUpdateException)
        {
            return Conflict(ApiResponse<object>.Fail("Khong the xoa san pham da phat sinh gio hang, don hang hoac lich su hanh vi."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi xoa san pham."));
        }
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

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static async Task<string> GenerateNextCodeAsync(IQueryable<string> source, string prefix, int digits)
    {
        var codes = await source.ToListAsync();
        var maxNumber = codes
            .Where(code => code.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            .Select(code => int.TryParse(code[prefix.Length..], out var number) ? number : 0)
            .DefaultIfEmpty(0)
            .Max();

        return $"{prefix}{(maxNumber + 1).ToString($"D{digits}")}";
    }
}
