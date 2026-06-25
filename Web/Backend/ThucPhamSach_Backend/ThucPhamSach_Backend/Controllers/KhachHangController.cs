using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using ThucPhamSach_Backend.Common;
using ThucPhamSach_Backend.Data;
using ThucPhamSach_Backend.Dtos;
using ThucPhamSach_Backend.Models;

namespace ThucPhamSach_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class KhachHangController : ControllerBase
{
    private readonly ThucPhamSachDbContext _context;

    public KhachHangController(ThucPhamSachDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tuKhoa)
    {
        try
        {
            var query = _context.KhachHangs
                .AsNoTracking()
                .Include(x => x.NguoiDung)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(tuKhoa))
            {
                var keyword = tuKhoa.Trim();
                var normalizedPhone = keyword.Replace(" ", "").Replace("-", "");
                query = query.Where(x =>
                    x.HoTen.Contains(keyword)
                    || (x.Email != null && x.Email.Contains(keyword))
                    || (x.Sdt != null
                        && x.Sdt.Replace(" ", "").Replace("-", "").Contains(normalizedPhone)));
            }

            var khachHangs = await query
                .OrderBy(x => x.HoTen)
                .Select(x => new KhachHangDto
                {
                    MaKh = x.MaKh,
                    MaNguoiDung = x.MaNguoiDung,
                    TenDangNhap = x.NguoiDung.TenDangNhap,
                    HoTen = x.HoTen,
                    Sdt = x.Sdt,
                    Email = x.Email,
                    DiaChi = x.DiaChi
                })
                .ToListAsync();

            return Ok(ApiResponse<List<KhachHangDto>>.Ok(khachHangs));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay danh sach khach hang."));
        }
    }

    [HttpGet("{maKh}")]
    public async Task<IActionResult> GetById(string maKh)
    {
        try
        {
            var khachHang = await _context.KhachHangs
                .AsNoTracking()
                .Include(x => x.NguoiDung)
                .Where(x => x.MaKh == maKh)
                .Select(x => new KhachHangDto
                {
                    MaKh = x.MaKh,
                    MaNguoiDung = x.MaNguoiDung,
                    TenDangNhap = x.NguoiDung.TenDangNhap,
                    HoTen = x.HoTen,
                    Sdt = x.Sdt,
                    Email = x.Email,
                    DiaChi = x.DiaChi
                })
                .FirstOrDefaultAsync();

            if (khachHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay khach hang."));
            }

            return Ok(ApiResponse<KhachHangDto>.Ok(khachHang));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay thong tin khach hang."));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateKhachHangRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu khong hop le."));
            }

            var tenDangNhap = request.TenDangNhap.Trim();
            var exists = await _context.NguoiDungs.AnyAsync(x => x.TenDangNhap == tenDangNhap);
            if (exists)
            {
                return BadRequest(ApiResponse<object>.Fail("Ten dang nhap da ton tai."));
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var maNguoiDung = await GenerateNextCodeAsync(_context.NguoiDungs.Select(x => x.MaNguoiDung), "ND", 3);
            var maKh = await GenerateNextCodeAsync(_context.KhachHangs.Select(x => x.MaKh), "KH", 3);
            var maGioHang = await GenerateNextCodeAsync(_context.GioHangs.Select(x => x.MaGioHang), "GH", 3);

            var nguoiDung = new NguoiDung
            {
                MaNguoiDung = maNguoiDung,
                TenDangNhap = tenDangNhap,
                VaiTro = "KhachHang",
                NgayTao = DateTime.Now
            };
            var hasher = new PasswordHasher<NguoiDung>();
            nguoiDung.MatKhau = hasher.HashPassword(nguoiDung, "123456");

            var khachHang = new KhachHang
            {
                MaKh = maKh,
                MaNguoiDung = maNguoiDung,
                HoTen = request.HoTen.Trim(),
                Sdt = string.IsNullOrWhiteSpace(request.Sdt) ? null : request.Sdt.Trim(),
                Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim()
            };

            var gioHang = new GioHang
            {
                MaGioHang = maGioHang,
                MaKh = maKh,
                TongTien = 0
            };

            _context.NguoiDungs.Add(nguoiDung);
            _context.KhachHangs.Add(khachHang);
            _context.GioHangs.Add(gioHang);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(ApiResponse<object>.Ok(null, "Tao khach hang thanh cong."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail("Khong the tao khach hang."));
        }
    }

    [HttpPut("{maKh}")]
    public async Task<IActionResult> Update(string maKh, [FromBody] UpdateKhachHangRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu khong hop le."));
            }

            var khachHang = await _context.KhachHangs.Include(x => x.NguoiDung).FirstOrDefaultAsync(x => x.MaKh == maKh);
            if (khachHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay khach hang."));
            }

            var tenDangNhap = request.TenDangNhap.Trim();
            if (khachHang.NguoiDung.TenDangNhap != tenDangNhap)
            {
                var exists = await _context.NguoiDungs.AnyAsync(x => x.TenDangNhap == tenDangNhap);
                if (exists)
                {
                    return BadRequest(ApiResponse<object>.Fail("Ten dang nhap da ton tai."));
                }
                khachHang.NguoiDung.TenDangNhap = tenDangNhap;
            }

            khachHang.HoTen = request.HoTen.Trim();
            khachHang.Sdt = string.IsNullOrWhiteSpace(request.Sdt) ? null : request.Sdt.Trim();
            khachHang.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(null, "Cap nhat khach hang thanh cong."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail("Khong the cap nhat khach hang."));
        }
    }

    [HttpDelete("{maKh}")]
    public async Task<IActionResult> Delete(string maKh)
    {
        try
        {
            var khachHang = await _context.KhachHangs.Include(x => x.NguoiDung).FirstOrDefaultAsync(x => x.MaKh == maKh);
            if (khachHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay khach hang."));
            }

            var hasOrders = await _context.DonHangs.AnyAsync(x => x.MaKh == maKh);
            if (hasOrders)
            {
                return BadRequest(ApiResponse<object>.Fail("Không thể xóa khách hàng đã có đơn hàng."));
            }

            // Xóa giỏ hàng liên kết
            var gioHang = await _context.GioHangs.Include(g => g.ChiTietGioHangs).FirstOrDefaultAsync(x => x.MaKh == maKh);
            if (gioHang != null)
            {
                _context.ChiTietGioHangs.RemoveRange(gioHang.ChiTietGioHangs);
                _context.GioHangs.Remove(gioHang);
            }

            _context.KhachHangs.Remove(khachHang);
            _context.NguoiDungs.Remove(khachHang.NguoiDung);

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(null, "Xoa khach hang thanh cong."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail("Khong the xoa khach hang."));
        }
    }

    private static async Task<string> GenerateNextCodeAsync(IQueryable<string> source, string prefix, int digits)
    {
        var nextNumber = await GetNextNumberAsync(source, prefix);
        return $"{prefix}{nextNumber.ToString($"D{digits}")}";
    }

    private static async Task<int> GetNextNumberAsync(IQueryable<string> source, string prefix)
    {
        var codes = await source.ToListAsync();
        return codes
            .Where(code => code.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            .Select(code => int.TryParse(code[prefix.Length..], out var number) ? number : 0)
            .DefaultIfEmpty(0)
            .Max() + 1;
    }
}
