package tests; 

import core.BaseTest;
import core.ReportAssert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.RegisterPage;

public class RegisterTest extends BaseTest {

    private RegisterPage registerPage;

    @BeforeMethod
    public void navigateToRegister() {
        openPage("/register/register.html");
        registerPage = new RegisterPage(driver);
    }

    @Test(description = "TC-DK-01: Đăng ký thành công với dữ liệu hợp lệ")
    public void TC_DK_01() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana_test" + System.currentTimeMillis()); // Đảm bảo duy nhất
        registerPage.enterMatKhau("123456");
        registerPage.enterSdt("0123456789");
        registerPage.enterEmail("nguyenvana@gmail.com");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi thông báo đăng ký thành công", "thành công", "thành viên");
    }

    @Test(description = "TC-DK-02: Đăng ký thất bại do Email không hợp lệ")
    public void TC_DK_02() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana1");
        registerPage.enterMatKhau("123456");
        registerPage.enterSdt("0123456789");
        registerPage.enterEmail("abc"); // Sai format
        registerPage.clickSubmit();

        // Trình duyệt sẽ chặn vì input type="email"
        String validationMsg = registerPage.getValidationMessage("email");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Mong đợi trình duyệt hiển thị thông báo lỗi HTML5 cho email");
    }

    @Test(description = "TC-DK-03: Đăng ký thành công khi để trống Email")
    public void TC_DK_03() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana_test_email" + System.currentTimeMillis());
        registerPage.enterMatKhau("123456");
        registerPage.enterSdt("0123456789");
        registerPage.enterEmail(""); // Để trống
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi thông báo đăng ký thành công khi email null", "thành công", "thành viên");
    }

    @Test(description = "TC-DK-04: Đăng ký thất bại do SĐT lố ký tự")
    public void TC_DK_04() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana_sdt_test");
        registerPage.enterMatKhau("123456");
        registerPage.enterSdt("0123456789012345"); // 16 ký tự
        registerPage.enterEmail("abc@gmail.com");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi API báo dữ liệu gửi lên không hợp lệ", "không hợp lệ", "lỗi", "thất bại", "trống");
    }

    @Test(description = "TC-DK-05: Đăng ký thành công khi để trống SĐT")
    public void TC_DK_05() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana_test_sdt" + System.currentTimeMillis());
        registerPage.enterMatKhau("123456");
        registerPage.enterSdt(""); // Bỏ trống
        registerPage.enterEmail("abc@gmail.com");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi đăng ký thành công", "thành công", "thành viên");
    }

    @Test(description = "TC-DK-06: Đăng ký thất bại do Mật khẩu không hợp lệ")
    public void TC_DK_06() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana2");
        registerPage.enterMatKhau("12345"); // 5 ký tự
        registerPage.enterSdt("0123456789");
        registerPage.enterEmail("abc@gmail.com");
        registerPage.clickSubmit();

        String validationMsg = registerPage.getValidationMessage("matKhau");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Mong đợi trình duyệt chặn do HTML minlength=6");
    }

    @Test(description = "TC-DK-07: Đăng ký thất bại do để trống Mật khẩu")
    public void TC_DK_07() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana2");
        registerPage.enterMatKhau(""); // Bỏ trống
        registerPage.enterSdt("0123456789");
        registerPage.enterEmail("abc@gmail.com");
        registerPage.clickSubmit();

        String validationMsg = registerPage.getValidationMessage("matKhau");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Mong đợi trình duyệt chặn do required");
    }

    @Test(description = "TC-DK-08: Đăng ký thất bại do Trùng tên đăng nhập")
    public void TC_DK_08() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("nguyenvana"); // Tài khoản admin đã có
        registerPage.enterMatKhau("123456");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Tên đăng nhập đã tồn tại.", "tồn tại", "trùng", "lỗi", "sử dụng");
    }

    @Test(description = "TC-DK-09: Đăng ký thất bại do để trống Tên Đăng Nhập (nhập dấu cách)")
    public void TC_DK_09() {
        registerPage.enterHoTen("Nguyen Van A");
        registerPage.enterTenDangNhap("   "); // 3 khoảng trắng lọt qua required html
        registerPage.enterMatKhau("123456");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi API báo dữ liệu gửi lên không hợp lệ", "không hợp lệ", "lỗi", "thất bại", "trống");
    }

    @Test(description = "TC-DK-10: Đăng ký thất bại do Họ tên lố ký tự")
    public void TC_DK_10() {
        registerPage.enterHoTen("a".repeat(101)); 
        registerPage.enterTenDangNhap("nguyenvana3");
        registerPage.enterMatKhau("123456");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi API báo Dữ liệu gửi lên không hợp lệ.", "không hợp lệ", "lỗi", "thất bại", "trống");
    }

    @Test(description = "TC-DK-11: Đăng ký thất bại do để trống Họ tên (nhập dấu cách)")
    public void TC_DK_11() {
        registerPage.enterHoTen("   "); // 3 khoảng trắng lọt qua html required
        registerPage.enterTenDangNhap("nguyenvana3");
        registerPage.enterMatKhau("123456");
        registerPage.clickSubmit();

        String status = registerPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi API báo dữ liệu gửi lên không hợp lệ", "không hợp lệ", "lỗi", "thất bại", "trống");
    }
} 
