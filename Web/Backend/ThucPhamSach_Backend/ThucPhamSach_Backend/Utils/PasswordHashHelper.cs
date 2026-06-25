using Microsoft.AspNetCore.Identity;
using ThucPhamSach_Backend.Models;

namespace ThucPhamSach_Backend.Utils;

/// <summary>
/// Helper class để generate và verify password hash
/// Dùng cho debugging và fix lỗi mật khẩu
/// </summary>
public static class PasswordHashHelper
{
    private static readonly PasswordHasher<NguoiDung> Hasher = new();

    /// <summary>
    /// Generate hash cho mật khẩu
    /// </summary>
    public static string GenerateHash(string plainPassword, string? maNguoiDung = null)
    {
        var dummyUser = new NguoiDung
        {
            MaNguoiDung = maNguoiDung ?? "TEMP",
            TenDangNhap = "temp",
            VaiTro = "Temp",
            MatKhau = string.Empty
        };

        return Hasher.HashPassword(dummyUser, plainPassword);
    }

    /// <summary>
    /// Verify password against hash
    /// </summary>
    public static bool VerifyHash(NguoiDung user, string plainPassword, string hash)
    {
        var result = Hasher.VerifyHashedPassword(user, hash, plainPassword);
        return result is PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded;
    }

    /// <summary>
    /// Tạo test data với các mật khẩu hash đúng cách
    /// </summary>
    public static void PrintTestCredentials()
    {
        var testUsers = new[]
        {
            ("ND001", "admin01", "admin@123"),
            ("ND002", "nguyenvana", "user@123456"),
            ("ND003", "tranthibi", "user@654321"),
            ("ND004", "lehoanganh", "pass@123456")
        };

        Console.WriteLine("=== PASSWORD HASH TEST DATA ===");
        Console.WriteLine();

        foreach (var (id, username, password) in testUsers)
        {
            var hash = GenerateHash(password, id);
            Console.WriteLine($"ID: {id}");
            Console.WriteLine($"Username: {username}");
            Console.WriteLine($"Plain Password: {password}");
            Console.WriteLine($"Hash: {hash}");
            Console.WriteLine();
        }

        Console.WriteLine("=== SQL UPDATE SCRIPT ===");
        Console.WriteLine();

        foreach (var (id, _, password) in testUsers)
        {
            var hash = GenerateHash(password, id);
            Console.WriteLine($"UPDATE NguoiDung SET matKhau = '{hash}' WHERE maNguoiDung = '{id}';");
        }
    }
}
