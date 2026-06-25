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
public class DanhMucController : ControllerBase
{
    private readonly ThucPhamSachDbContext _context;

    public DanhMucController(ThucPhamSachDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var danhMucs = await _context.DanhMucs
                .AsNoTracking()
                .Include(x => x.DanhMucCha)
                .OrderBy(x => x.MaDanhMucCha ?? x.MaDanhMuc)
                .ThenBy(x => x.TenDanhMuc)
                .Select(x => ToDto(x))
                .ToListAsync();

            return Ok(ApiResponse<List<DanhMucDto>>.Ok(danhMucs));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay danh sach danh muc."));
        }
    }

    [HttpGet("{maDanhMuc}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string maDanhMuc)
    {
        try
        {
            var danhMuc = await _context.DanhMucs
                .AsNoTracking()
                .Include(x => x.DanhMucCha)
                .Where(x => x.MaDanhMuc == maDanhMuc)
                .Select(x => ToDto(x))
                .FirstOrDefaultAsync();

            if (danhMuc is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay danh muc."));
            }

            return Ok(ApiResponse<DanhMucDto>.Ok(danhMuc));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the lay thong tin danh muc."));
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateDanhMucRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu danh muc khong hop le."));
            }

            var parentError = await ValidateParentAsync(request.MaDanhMucCha);
            if (parentError is not null)
            {
                return BadRequest(ApiResponse<object>.Fail(parentError));
            }

            var maDanhMuc = await GenerateNextCodeAsync(_context.DanhMucs.Select(x => x.MaDanhMuc), "DM", 3);
            var danhMuc = new DanhMuc
            {
                MaDanhMuc = maDanhMuc,
                TenDanhMuc = request.TenDanhMuc.Trim(),
                MoTa = NormalizeOptional(request.MoTa),
                MaDanhMucCha = NormalizeOptional(request.MaDanhMucCha)
            };

            _context.DanhMucs.Add(danhMuc);
            await _context.SaveChangesAsync();

            await _context.Entry(danhMuc).Reference(x => x.DanhMucCha).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { maDanhMuc = danhMuc.MaDanhMuc },
                ApiResponse<DanhMucDto>.Ok(ToDto(danhMuc), "Them danh muc thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the luu danh muc vao database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi them danh muc."));
        }
    }

    [HttpPut("{maDanhMuc}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string maDanhMuc, [FromBody] UpdateDanhMucRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Du lieu danh muc khong hop le."));
            }

            var danhMuc = await _context.DanhMucs.FindAsync(maDanhMuc);
            if (danhMuc is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay danh muc."));
            }

            if (string.Equals(request.MaDanhMucCha, maDanhMuc, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(ApiResponse<object>.Fail("Danh muc khong the la cha cua chinh no."));
            }

            var parentError = await ValidateParentAsync(request.MaDanhMucCha, maDanhMuc);
            if (parentError is not null)
            {
                return BadRequest(ApiResponse<object>.Fail(parentError));
            }

            danhMuc.TenDanhMuc = request.TenDanhMuc.Trim();
            danhMuc.MoTa = NormalizeOptional(request.MoTa);
            danhMuc.MaDanhMucCha = NormalizeOptional(request.MaDanhMucCha);
            await _context.SaveChangesAsync();

            await _context.Entry(danhMuc).Reference(x => x.DanhMucCha).LoadAsync();

            return Ok(ApiResponse<DanhMucDto>.Ok(ToDto(danhMuc), "Cap nhat danh muc thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the cap nhat danh muc trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi cap nhat danh muc."));
        }
    }

    [HttpDelete("{maDanhMuc}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string maDanhMuc)
    {
        try
        {
            var danhMuc = await _context.DanhMucs
                .Include(x => x.SanPhams)
                .Include(x => x.DanhMucCons)
                .FirstOrDefaultAsync(x => x.MaDanhMuc == maDanhMuc);

            if (danhMuc is null)
            {
                return NotFound(ApiResponse<object>.Fail("Khong tim thay danh muc."));
            }

            if (danhMuc.DanhMucCons.Count > 0)
            {
                return Conflict(ApiResponse<object>.Fail("Khong the xoa danh muc dang co danh muc con."));
            }

            if (danhMuc.SanPhams.Count > 0)
            {
                return Conflict(ApiResponse<object>.Fail("Khong the xoa danh muc dang co san pham."));
            }

            _context.DanhMucs.Remove(danhMuc);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(null, "Xoa danh muc thanh cong."));
        }
        catch (DbUpdateException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Khong the xoa danh muc trong database."));
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Da xay ra loi khi xoa danh muc."));
        }
    }

    private async Task<string?> ValidateParentAsync(string? maDanhMucCha, string? currentMaDanhMuc = null)
    {
        if (string.IsNullOrWhiteSpace(maDanhMucCha))
        {
            return null;
        }

        var parent = await _context.DanhMucs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaDanhMuc == maDanhMucCha.Trim());

        if (parent is null)
        {
            return "Danh muc cha khong ton tai.";
        }

        if (!string.IsNullOrWhiteSpace(parent.MaDanhMucCha))
        {
            return "Chi ho tro toi da 2 cap danh muc (cha va con).";
        }

        if (!string.IsNullOrWhiteSpace(currentMaDanhMuc))
        {
            // Check for circular reference - prevent setting a descendant as parent
            if (await IsDescendantAsync(maDanhMucCha.Trim(), currentMaDanhMuc))
            {
                return "Khong the chuyen danh muc cha thanh con cua danh muc con cua no.";
            }

            var hasChildren = await _context.DanhMucs
                .AnyAsync(x => x.MaDanhMucCha == currentMaDanhMuc);

            if (hasChildren)
            {
                return "Danh muc cha khong the chuyen thanh danh muc con.";
            }
        }

        return null;
    }

    private async Task<bool> IsDescendantAsync(string potentialParentId, string currentCategoryId)
    {
        // Check if potentialParentId is a descendant of currentCategoryId
        var current = await _context.DanhMucs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaDanhMuc == currentCategoryId);

        if (current is null || string.IsNullOrWhiteSpace(current.MaDanhMucCha))
        {
            return false;
        }

        // Direct child check
        if (current.MaDanhMucCha == potentialParentId)
        {
            return true;
        }

        // Recursive check for deeper descendants
        return await IsDescendantAsync(potentialParentId, current.MaDanhMucCha);
    }

    private static DanhMucDto ToDto(DanhMuc danhMuc)
    {
        return new DanhMucDto
        {
            MaDanhMuc = danhMuc.MaDanhMuc,
            TenDanhMuc = danhMuc.TenDanhMuc,
            MoTa = danhMuc.MoTa,
            MaDanhMucCha = danhMuc.MaDanhMucCha,
            TenDanhMucCha = danhMuc.DanhMucCha?.TenDanhMuc
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
