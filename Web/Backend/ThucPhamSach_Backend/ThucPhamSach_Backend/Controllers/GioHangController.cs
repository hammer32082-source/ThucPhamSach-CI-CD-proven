using System.Security.Claims;
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
[Authorize(Roles = "KhachHang")]
public class GioHangController : ControllerBase
{
    private readonly ThucPhamSachDbContext _context;

    public GioHangController(ThucPhamSachDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCart()
    {
        try
        {
            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var gioHang = await GetOrCreateCartAsync(maKh);
            var dto = await GetCartDtoAsync(gioHang.MaGioHang);

            return Ok(ApiResponse<GioHangDto>.Ok(dto));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay thong tin gio hang."));
        }
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddGioHangItemRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu gio hang khong hop le."));
            }

            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var sanPham = await _context.SanPhams.FirstOrDefaultAsync(x => x.MaSp == request.MaSp);
            if (sanPham is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay san pham."));
            }

            if (sanPham.SoLuongTon <= 0)
            {
                return BadRequest(ApiResponse<object>.Fail("San pham da het hang."));
            }

            var gioHang = await GetOrCreateCartAsync(maKh);
            var item = await _context.ChiTietGioHangs
                .FirstOrDefaultAsync(x => x.MaGioHang == gioHang.MaGioHang && x.MaSp == request.MaSp);

            var newQuantity = request.SoLuong + (item?.SoLuong ?? 0);
            if (newQuantity > sanPham.SoLuongTon)
            {
                return BadRequest(ApiResponse<object>.Fail("So luong trong gio vuot qua so luong ton kho."));
            }

            if (item is null)
            {
                item = new ChiTietGioHang
                {
                    MaGioHang = gioHang.MaGioHang,
                    MaSp = sanPham.MaSp,
                    SoLuong = request.SoLuong,
                    DonGia = sanPham.Gia
                };
                _context.ChiTietGioHangs.Add(item);
            }
            else
            {
                item.SoLuong = newQuantity;
                item.DonGia = sanPham.Gia;
            }

            _context.LichSuHanhVis.Add(new LichSuHanhVi
            {
                MaLog = await GenerateNextCodeAsync(_context.LichSuHanhVis.Select(x => x.MaLog), "LOG", 3),
                MaKh = maKh,
                MaSp = sanPham.MaSp,
                LoaiHanhVi = "ThemGioHang",
                ThoiGian = DateTime.Now
            });

            await _context.SaveChangesAsync();
            await RecalculateCartTotalAsync(gioHang.MaGioHang);

            var dto = await GetCartDtoAsync(gioHang.MaGioHang);
            return Ok(ApiResponse<GioHangDto>.Ok(dto, "Them san pham vao gio hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the luu gio hang vao database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi them san pham vao gio hang."));
        }
    }

    [HttpPut("items/{maSp}")]
    public async Task<IActionResult> UpdateItem(string maSp, [FromBody] UpdateGioHangItemRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu gio hang khong hop le."));
            }

            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var gioHang = await _context.GioHangs.FirstOrDefaultAsync(x => x.MaKh == maKh);
            if (gioHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay gio hang."));
            }

            var item = await _context.ChiTietGioHangs
                .Include(x => x.SanPham)
                .FirstOrDefaultAsync(x => x.MaGioHang == gioHang.MaGioHang && x.MaSp == maSp);

            if (item is null)
            {
                return NotFound(ApiResponse<object>.Fail("San pham khong co trong gio hang."));
            }

            if (request.SoLuong > item.SanPham.SoLuongTon)
            {
                return BadRequest(ApiResponse<object>.Fail("So luong trong gio vuot qua so luong ton kho."));
            }

            item.SoLuong = request.SoLuong;
            item.DonGia = item.SanPham.Gia;
            await _context.SaveChangesAsync();
            await RecalculateCartTotalAsync(gioHang.MaGioHang);

            var dto = await GetCartDtoAsync(gioHang.MaGioHang);
            return Ok(ApiResponse<GioHangDto>.Ok(dto, "Cap nhat so luong thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the cap nhat gio hang trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi cap nhat gio hang."));
        }
    }

    [HttpDelete("items/{maSp}")]
    public async Task<IActionResult> DeleteItem(string maSp)
    {
        try
        {
            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var gioHang = await _context.GioHangs.FirstOrDefaultAsync(x => x.MaKh == maKh);
            if (gioHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay gio hang."));
            }

            var item = await _context.ChiTietGioHangs
                .FirstOrDefaultAsync(x => x.MaGioHang == gioHang.MaGioHang && x.MaSp == maSp);

            if (item is null)
            {
                return NotFound(ApiResponse<object>.Fail("San pham khong co trong gio hang."));
            }

            _context.ChiTietGioHangs.Remove(item);
            await _context.SaveChangesAsync();
            await RecalculateCartTotalAsync(gioHang.MaGioHang);

            var dto = await GetCartDtoAsync(gioHang.MaGioHang);
            return Ok(ApiResponse<GioHangDto>.Ok(dto, "Xoa san pham khoi gio hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the xoa san pham khoi gio hang trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi xoa san pham khoi gio hang."));
        }
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        try
        {
            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var gioHang = await _context.GioHangs
                .Include(x => x.ChiTietGioHangs)
                .FirstOrDefaultAsync(x => x.MaKh == maKh);

            if (gioHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay gio hang."));
            }

            _context.ChiTietGioHangs.RemoveRange(gioHang.ChiTietGioHangs);
            gioHang.TongTien = 0;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<GioHangDto>.Ok(await GetCartDtoAsync(gioHang.MaGioHang), "Xoa toan bo gio hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the xoa gio hang trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi xoa gio hang."));
        }
    }

    private string? GetCurrentMaKh()
    {
        return User.FindFirstValue("maKH");
    }

    private async Task<GioHang> GetOrCreateCartAsync(string maKh)
    {
        var gioHang = await _context.GioHangs.FirstOrDefaultAsync(x => x.MaKh == maKh);
        if (gioHang is not null)
        {
            return gioHang;
        }

        gioHang = new GioHang
        {
            MaGioHang = await GenerateNextCodeAsync(_context.GioHangs.Select(x => x.MaGioHang), "GH", 3),
            MaKh = maKh,
            TongTien = 0
        };

        _context.GioHangs.Add(gioHang);
        await _context.SaveChangesAsync();
        return gioHang;
    }

    private async Task<GioHangDto> GetCartDtoAsync(string maGioHang)
    {
        var gioHang = await _context.GioHangs
            .AsNoTracking()
            .Include(x => x.ChiTietGioHangs)
            .ThenInclude(x => x.SanPham)
            .FirstAsync(x => x.MaGioHang == maGioHang);

        return new GioHangDto
        {
            MaGioHang = gioHang.MaGioHang,
            MaKh = gioHang.MaKh,
            TongTien = gioHang.TongTien,
            Items = gioHang.ChiTietGioHangs
                .OrderBy(x => x.SanPham.TenSp)
                .Select(x => new GioHangItemDto
                {
                    MaSp = x.MaSp,
                    TenSp = x.SanPham.TenSp,
                    HinhAnh = x.SanPham.HinhAnh,
                    DonViTinh = x.SanPham.DonViTinh,
                    DonGia = x.DonGia,
                    SoLuong = x.SoLuong,
                    ThanhTien = x.DonGia * x.SoLuong,
                    SoLuongTon = x.SanPham.SoLuongTon
                })
                .ToList()
        };
    }

    private async Task RecalculateCartTotalAsync(string maGioHang)
    {
        var gioHang = await _context.GioHangs.FirstAsync(x => x.MaGioHang == maGioHang);
        gioHang.TongTien = await _context.ChiTietGioHangs
            .Where(x => x.MaGioHang == maGioHang)
            .SumAsync(x => (decimal?)(x.DonGia * x.SoLuong)) ?? 0;
        await _context.SaveChangesAsync();
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
