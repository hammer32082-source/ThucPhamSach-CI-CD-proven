using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ThucPhamSach_Backend.Common;
using ThucPhamSach_Backend.Data;
using ThucPhamSach_Backend.Dtos;
using ThucPhamSach_Backend.Models;

namespace ThucPhamSach_Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ThucPhamSachDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<NguoiDung> _passwordHasher = new();

    public AuthController(ThucPhamSachDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Dữ liệu đăng ký không hợp lệ."));
            }

            var tenDangNhap = request.TenDangNhap.Trim();
            var exists = await _context.NguoiDungs
                .AnyAsync(x => x.TenDangNhap == tenDangNhap);

            if (exists)
            {
                return Conflict(ApiResponse<object>.Fail("Tên đăng nhập đã tồn tại."));
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var maNguoiDung = await GenerateNextCodeAsync(
                _context.NguoiDungs.Select(x => x.MaNguoiDung),
                "ND",
                3);
            var maKh = await GenerateNextCodeAsync(
                _context.KhachHangs.Select(x => x.MaKh),
                "KH",
                3);
            var maGioHang = await GenerateNextCodeAsync(
                _context.GioHangs.Select(x => x.MaGioHang),
                "GH",
                3);

            var nguoiDung = new NguoiDung
            {
                MaNguoiDung = maNguoiDung,
                TenDangNhap = tenDangNhap,
                VaiTro = "KhachHang",
                NgayTao = DateTime.Now
            };
            nguoiDung.MatKhau = _passwordHasher.HashPassword(nguoiDung, request.MatKhau);

            var khachHang = new KhachHang
            {
                MaKh = maKh,
                MaNguoiDung = maNguoiDung,
                HoTen = request.HoTen.Trim(),
                Sdt = NormalizeOptional(request.Sdt),
                Email = NormalizeOptional(request.Email),
                DiaChi = NormalizeOptional(request.DiaChi)
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

            var response = new UserInfoDto
            {
                MaNguoiDung = nguoiDung.MaNguoiDung,
                TenDangNhap = nguoiDung.TenDangNhap,
                VaiTro = nguoiDung.VaiTro,
                MaKh = khachHang.MaKh,
                HoTen = khachHang.HoTen
            };

            return CreatedAtAction(nameof(Register), ApiResponse<UserInfoDto>.Ok(response, "Đăng ký thành công."));
        }
        catch (DbUpdateException ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail(message));
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail(message));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Dữ liệu đăng nhập không hợp lệ."));
            }

            var tenDangNhap = request.TenDangNhap.Trim();
            var nguoiDung = await _context.NguoiDungs
                .Include(x => x.KhachHang)
                .Include(x => x.Admin)
                .FirstOrDefaultAsync(x => x.TenDangNhap == tenDangNhap);

            if (nguoiDung is null || !VerifyPassword(nguoiDung, request.MatKhau))
            {
                return Unauthorized(ApiResponse<object>.Fail("Tên đăng nhập hoặc mật khẩu không đúng."));
            }

            var authResponse = GenerateJwtToken(nguoiDung);

            return Ok(ApiResponse<AuthResponse>.Ok(authResponse, "Đăng nhập thành công."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Đã xảy ra lỗi khi đăng nhập."));
        }
    }

    [HttpPost("reset-all-passwords")]
    public async Task<IActionResult> ResetAllPasswords([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(ApiResponse<object>.Fail("Mật khẩu mới phải có ít nhất 6 ký tự."));
            }

            var users = await _context.NguoiDungs.ToListAsync();
            var resetCount = 0;

            foreach (var user in users)
            {
                user.MatKhau = _passwordHasher.HashPassword(user, request.NewPassword);
                resetCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(null, $"Đã reset mật khẩu cho {resetCount} người dùng thành công."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail($"Lỗi khi reset mật khẩu: {ex.Message}"));
        }
    }

    [HttpPost("fix-corrupted-passwords")]
    public async Task<IActionResult> FixCorruptedPasswords()
    {
        try
        {
            // Lỗi: Tất cả mật khẩu tự nhảy về cùng một chuỗi hash kỳ lạ khi đăng nhập
            // Giải pháp: Reset mật khẩu cho từng user với mật khẩu mặc định khác nhau
            
            var fixedPasswords = new Dictionary<string, string>
            {
                { "ND001", "admin@123" },      // admin01
                { "ND002", "user@123456" },    // nguyenvana
                { "ND003", "user@654321" },    // tranthibi
                { "ND004", "pass@123456" }     // lehoanganh
            };

            var users = await _context.NguoiDungs.ToListAsync();
            var updatedCount = 0;

            foreach (var user in users)
            {
                if (fixedPasswords.TryGetValue(user.MaNguoiDung, out var newPassword))
                {
                    user.MatKhau = _passwordHasher.HashPassword(user, newPassword);
                    updatedCount++;
                }
            }

            if (updatedCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            var result = new
            {
                message = $"Đã cập nhật mật khẩu cho {updatedCount} người dùng",
                details = "Mật khẩu mặc định đã được thiết lập. Hãy yêu cầu người dùng đổi mật khẩu khi đăng nhập lần tới.",
                credentials = fixedPasswords.Select(kvp => new
                {
                    maNguoiDung = kvp.Key,
                    matKhauMacDinh = kvp.Value
                })
            };

            return Ok(ApiResponse<object>.Ok(result, "Đã sửa lỗi mật khẩu thành công."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail($"Lỗi khi sửa mật khẩu: {ex.Message}"));
        }
    }

    private AuthResponse GenerateJwtToken(NguoiDung nguoiDung)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing Jwt:Key configuration.");
        var expireMinutes = int.TryParse(_configuration["Jwt:ExpireMinutes"], out var minutes)
            ? minutes
            : 120;
        var expiresAt = DateTime.UtcNow.AddMinutes(expireMinutes);

        var userInfo = new UserInfoDto
        {
            MaNguoiDung = nguoiDung.MaNguoiDung,
            TenDangNhap = nguoiDung.TenDangNhap,
            VaiTro = nguoiDung.VaiTro,
            MaKh = nguoiDung.KhachHang?.MaKh,
            MaAdmin = nguoiDung.Admin?.MaAdmin,
            HoTen = nguoiDung.KhachHang?.HoTen
        };

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, nguoiDung.MaNguoiDung),
            new(JwtRegisteredClaimNames.UniqueName, nguoiDung.TenDangNhap),
            new(ClaimTypes.NameIdentifier, nguoiDung.MaNguoiDung),
            new(ClaimTypes.Name, nguoiDung.TenDangNhap),
            new(ClaimTypes.Role, nguoiDung.VaiTro),
            new("maNguoiDung", nguoiDung.MaNguoiDung),
            new("tenDangNhap", nguoiDung.TenDangNhap),
            new("vaiTro", nguoiDung.VaiTro)
        };

        if (!string.IsNullOrWhiteSpace(userInfo.MaKh))
        {
            claims.Add(new Claim("maKH", userInfo.MaKh));
        }

        if (!string.IsNullOrWhiteSpace(userInfo.MaAdmin))
        {
            claims.Add(new Claim("maAdmin", userInfo.MaAdmin));
        }

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
            User = userInfo
        };
    }

    private bool VerifyPassword(NguoiDung nguoiDung, string password)
    {
        if (IsIdentityHash(nguoiDung.MatKhau))
        {
            var result = _passwordHasher.VerifyHashedPassword(nguoiDung, nguoiDung.MatKhau, password);
            return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
        }

        // Fallback cho plain text (không nên sử dụng trong production)
        // Nếu mật khẩu là plain text, verify bằng direct comparison
        return nguoiDung.MatKhau == password;
    }

    private static bool IsIdentityHash(string passwordHash)
    {
        // Kiểm tra xem hash có phải là bcrypt hash hợp lệ không
        // Bcrypt hash luôn bắt đầu bằng "AQAAAA" (Base64 encode của Identity v3)
        return !string.IsNullOrEmpty(passwordHash) && passwordHash.StartsWith("AQAAAA", StringComparison.Ordinal);
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
