using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThucPhamSach_Backend.Common;
using ThucPhamSach_Backend.Data;
using ThucPhamSach_Backend.Dtos;
using ThucPhamSach_Backend.Models;
using Microsoft.AspNetCore.SignalR;
using ThucPhamSach_Backend.Hubs;

namespace ThucPhamSach_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonHangController : ControllerBase
{
    private static readonly HashSet<string> PaymentMethods = ["COD", "VNPay", "MoMo", "BankTransfer"];

    private readonly ThucPhamSachDbContext _context;
    private readonly IHubContext<OrderHub> _hubContext;

    public DonHangController(ThucPhamSachDbContext context, IHubContext<OrderHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost]
    [Authorize(Roles = "KhachHang")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu dat hang khong hop le."));
            }

            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var paymentMethod = NormalizePaymentMethod(request.PhuongThucThanhToan);
            if (paymentMethod is null)
            {
                return BadRequest(ApiResponse<object>.Fail("Phuong thuc thanh toan khong hop le."));
            }

            var gioHang = await _context.GioHangs
                .Include(x => x.ChiTietGioHangs)
                .ThenInclude(x => x.SanPham)
                .FirstOrDefaultAsync(x => x.MaKh == maKh);

            if (gioHang is null || gioHang.ChiTietGioHangs.Count == 0)
            {
                return BadRequest(ApiResponse<object>.Fail("Gio hang dang trong, khong the dat hang."));
            }

            foreach (var item in gioHang.ChiTietGioHangs)
            {
                if (item.SoLuong > item.SanPham.SoLuongTon)
                {
                    return BadRequest(ApiResponse<object>.Fail($"San pham {item.SanPham.TenSp} khong du ton kho."));
                }
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var tongTien = gioHang.ChiTietGioHangs.Sum(x => x.DonGia * x.SoLuong);
            var maDonHang = await GenerateNextCodeAsync(_context.DonHangs.Select(x => x.MaDonHang), "DH", 3);
            var maThanhToan = await GenerateNextCodeAsync(_context.ThanhToans.Select(x => x.MaThanhToan), "TT", 3);
            var nextLogNumber = await GetNextNumberAsync(_context.LichSuHanhVis.Select(x => x.MaLog), "LOG");

            var donHang = new DonHang
            {
                MaDonHang = maDonHang,
                MaKh = maKh,
                NgayDat = DateTime.Now,
                TongTien = tongTien,
                TrangThaiDonHang = "Cho xac nhan",
                DiaChiGiao = NormalizeOptional(request.DiaChiGiao)
            };

            _context.DonHangs.Add(donHang);

            foreach (var item in gioHang.ChiTietGioHangs)
            {
                _context.ChiTietDonHangs.Add(new ChiTietDonHang
                {
                    MaDonHang = maDonHang,
                    MaSp = item.MaSp,
                    SoLuong = item.SoLuong,
                    DonGia = item.DonGia
                });

                item.SanPham.SoLuongTon -= item.SoLuong;

                _context.LichSuHanhVis.Add(new LichSuHanhVi
                {
                    MaLog = $"LOG{nextLogNumber++.ToString("D3")}",
                    MaKh = maKh,
                    MaSp = item.MaSp,
                    LoaiHanhVi = "DatHang",
                    ThoiGian = DateTime.Now
                });
            }

            _context.ThanhToans.Add(new ThanhToan
            {
                MaThanhToan = maThanhToan,
                MaDonHang = maDonHang,
                PhuongThuc = paymentMethod,
                TrangThai = paymentMethod == "COD" ? "Cho thanh toan" : "Thanh toan thanh cong",
                ThoiGian = DateTime.Now,
                TongTienThanhToan = tongTien
            });

            _context.ChiTietGioHangs.RemoveRange(gioHang.ChiTietGioHangs);
            gioHang.TongTien = 0;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var created = await GetOrderDtoQuery()
                .FirstAsync(x => x.MaDonHang == maDonHang);

            await _hubContext.Clients.Group("AdminGroup").SendAsync("ReceiveNewOrder", created);

            return CreatedAtAction(nameof(GetMyOrders), ApiResponse<DonHangDto>.Ok(created, "Dat hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the luu don hang vao database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi dat hang."));
        }
    }

    [HttpGet("me")]
    [Authorize(Roles = "KhachHang")]
    public async Task<IActionResult> GetMyOrders()
    {
        try
        {
            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var orders = await GetOrderDtoQuery()
                .Where(x => x.MaKh == maKh)
                .OrderByDescending(x => x.NgayDat)
                .ToListAsync();

            return Ok(ApiResponse<List<DonHangDto>>.Ok(orders));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay lich su don hang."));
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var orders = await GetOrderDtoQuery()
                .OrderByDescending(x => x.NgayDat)
                .ToListAsync();

            return Ok(ApiResponse<List<DonHangDto>>.Ok(orders));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay danh sach don hang."));
        }
    }

    [HttpPut("{maDonHang}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Confirm(string maDonHang)
    {
        try
        {
            var donHang = await _context.DonHangs.FindAsync(maDonHang);
            if (donHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay don hang."));
            }

            if (donHang.TrangThaiDonHang == "Da huy")
            {
                return BadRequest(ApiResponse<object>.Fail("Khong the xac nhan don hang da huy."));
            }

            donHang.TrangThaiDonHang = "Da xac nhan";
            await _context.SaveChangesAsync();

            var updated = await GetOrderDtoQuery().FirstAsync(x => x.MaDonHang == maDonHang);
            await _hubContext.Clients.Group($"CustomerGroup_{donHang.MaKh}").SendAsync("ReceiveOrderStatusUpdate", updated);
            return Ok(ApiResponse<DonHangDto>.Ok(updated, "Xac nhan don hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the cap nhat don hang trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi xac nhan don hang."));
        }
    }

    [HttpPut("{maDonHang}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(string maDonHang, [FromBody] UpdateTrangThaiDonHangRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu trang thai don hang khong hop le."));
            }

            var normalizedStatus = NormalizeOrderStatus(request.TrangThaiMoi);
            if (normalizedStatus is null)
            {
                return BadRequest(ApiResponse<object>.Fail("Trang thai don hang khong hop le."));
            }

            var donHang = await _context.DonHangs.FindAsync(maDonHang);
            if (donHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay don hang."));
            }

            donHang.TrangThaiDonHang = normalizedStatus;
            await _context.SaveChangesAsync();

            var updated = await GetOrderDtoQuery().FirstAsync(x => x.MaDonHang == maDonHang);
            await _hubContext.Clients.Group($"CustomerGroup_{donHang.MaKh}").SendAsync("ReceiveOrderStatusUpdate", updated);
            return Ok(ApiResponse<DonHangDto>.Ok(updated, "Cap nhat trang thai don hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the cap nhat trang thai don hang trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi cap nhat trang thai don hang."));
        }
    }

    [HttpPut("{maDonHang}/cancel")]
    [Authorize(Roles = "KhachHang")]
    public async Task<IActionResult> CancelOrder(string maDonHang)
    {
        try
        {
            var maKh = GetCurrentMaKh();
            if (maKh is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Token khong chua thong tin khach hang."));
            }

            var donHang = await _context.DonHangs.FindAsync(maDonHang);
            if (donHang is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay don hang."));
            }

            if (donHang.MaKh != maKh)
            {
                return Forbid("Ban khong co quyen huy don hang nay.");
            }

            if (donHang.TrangThaiDonHang == "Da huy")
            {
                return BadRequest(ApiResponse<object>.Fail("Don hang da bi huy."));
            }

            if (donHang.TrangThaiDonHang == "Da xac nhan" || donHang.TrangThaiDonHang == "Dang giao hang" || donHang.TrangThaiDonHang == "Da giao")
            {
                return BadRequest(ApiResponse<object>.Fail("Khong the huy don hang da duoc xu ly."));
            }

            donHang.TrangThaiDonHang = "Da huy";
            await _context.SaveChangesAsync();

            var updated = await GetOrderDtoQuery().FirstAsync(x => x.MaDonHang == maDonHang);
            await _hubContext.Clients.Group($"CustomerGroup_{donHang.MaKh}").SendAsync("ReceiveOrderStatusUpdate", updated);
            await _hubContext.Clients.Group("AdminGroup").SendAsync("ReceiveOrderStatusUpdate", updated);
            return Ok(ApiResponse<DonHangDto>.Ok(updated, "Huy don hang thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the huy don hang trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi huy don hang."));
        }
    }

    private IQueryable<DonHangDto> GetOrderDtoQuery()
    {
        return _context.DonHangs
            .AsNoTracking()
            .Select(x => new DonHangDto
            {
                MaDonHang = x.MaDonHang,
                MaKh = x.MaKh,
                HoTenKhachHang = x.KhachHang.HoTen,
                SdtKhachHang = x.KhachHang.Sdt,
                NgayDat = x.NgayDat,
                TongTien = x.TongTien,
                TrangThaiDonHang = x.TrangThaiDonHang,
                DiaChiGiao = x.DiaChiGiao,
                ThanhToan = x.ThanhToan == null
                    ? null
                    : new ThanhToanDto
                    {
                        MaThanhToan = x.ThanhToan.MaThanhToan,
                        PhuongThuc = x.ThanhToan.PhuongThuc,
                        TrangThai = x.ThanhToan.TrangThai,
                        ThoiGian = x.ThanhToan.ThoiGian,
                        TongTienThanhToan = x.ThanhToan.TongTienThanhToan
                    },
                Items = x.ChiTietDonHangs
                    .Select(i => new DonHangItemDto
                    {
                        MaSp = i.MaSp,
                        TenSp = i.SanPham.TenSp,
                        HinhAnh = i.SanPham.HinhAnh,
                        DonGia = i.DonGia,
                        SoLuong = i.SoLuong,
                        ThanhTien = i.DonGia * i.SoLuong
                    })
                    .ToList()
            });
    }

    private string? GetCurrentMaKh()
    {
        return User.FindFirstValue("maKH");
    }

    private static string? NormalizePaymentMethod(string value)
    {
        var method = value.Trim();
        return PaymentMethods.Contains(method) ? method : null;
    }

    private static string? NormalizeOrderStatus(string value)
    {
        return value.Trim() switch
        {
            "Cho xac nhan" => "Cho xac nhan",
            "Dang xu ly" => "Da xac nhan",
            "Da xac nhan" => "Da xac nhan",
            "Dang giao" => "Dang giao hang",
            "Dang giao hang" => "Dang giao hang",
            "Da giao" => "Da giao",
            "Huy" => "Da huy",
            "Da huy" => "Da huy",
            _ => null
        };
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
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
