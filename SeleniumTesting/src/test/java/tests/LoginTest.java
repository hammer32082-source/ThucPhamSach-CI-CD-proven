package tests;

import core.BaseTest;
import core.ReportAssert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.LoginPage;

public class LoginTest extends BaseTest {

    private LoginPage loginPage;

    @BeforeMethod
    public void navigateToLogin() {
        openPage("/login/login.html");
        loginPage = new LoginPage(driver);
    }

    @Test(description = "TC-DN-01: Đăng nhập thành công với dữ liệu hợp lệ")
    public void TC_DN_01() {
        loginPage.enterTenDangNhap("admin"); // Dùng tài khoản admin có sẵn trong DB
        loginPage.enterMatKhau("123456");
        loginPage.clickSubmit();

        String status = loginPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi thông báo đăng nhập thành công", "thành công", "chuyển trang");
    }

    @Test(description = "TC-DN-02: Đăng nhập thất bại do sai Mật khẩu")
    public void TC_DN_02() {
        loginPage.enterTenDangNhap("admin"); // Dùng tài khoản admin có sẵn
        loginPage.enterMatKhau("saipassword");
        loginPage.clickSubmit();

        String status = loginPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Tên đăng nhập hoặc mật khẩu không đúng.", "không đúng", "lỗi", "sai", "thất bại");
    }

    @Test(description = "TC-DN-03: Đăng nhập thất bại do để trống Mật khẩu")
    public void TC_DN_03() {
        loginPage.enterTenDangNhap("admin"); // Dùng tài khoản admin có sẵn
        loginPage.enterMatKhau(""); // Bỏ trống hoàn toàn
        loginPage.clickSubmit();

        String validationMsg = loginPage.getValidationMessage("matKhau");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Mong đợi trình duyệt chặn do required");
    }

    @Test(description = "TC-DN-04: Đăng nhập thất bại do Tên đăng nhập không tồn tại")
    public void TC_DN_04() {
        loginPage.enterTenDangNhap("taikhoan_khong_cothat_999");
        loginPage.enterMatKhau("123456");
        loginPage.clickSubmit();

        String status = loginPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Tên đăng nhập hoặc mật khẩu không đúng.", "không đúng", "lỗi", "sai", "thất bại");
    }

    @Test(description = "TC-DN-05: Đăng nhập thất bại do để trống Tên đăng nhập")
    public void TC_DN_05() {
        loginPage.enterTenDangNhap("   "); // 3 khoảng trắng
        loginPage.enterMatKhau("123456");
        loginPage.clickSubmit();

        String status = loginPage.getStatusMessage();
        ReportAssert.assertContainsAnyVi(status, "Mong đợi API báo dữ liệu gửi lên không hợp lệ", "không hợp lệ", "lỗi", "không đúng", "thất bại");
    }
}
