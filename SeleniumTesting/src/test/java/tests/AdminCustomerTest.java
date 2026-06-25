package tests;

import core.BaseTest;
import core.ReportAssert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.AdminCustomerPage;
import pages.LoginPage;

public class AdminCustomerTest extends BaseTest {

    private AdminCustomerPage adminCustomerPage;

    @BeforeMethod
    public void setupAdminLogin() {
        // Cần đăng nhập tài khoản admin trước khi truy cập trang Quản trị
        openPage("/login/login.html");
        try { Thread.sleep(1000); } catch (InterruptedException e) {} // Đợi JS load xong
        
        LoginPage loginPage = new LoginPage(driver);
        loginPage.enterTenDangNhap("admin");
        loginPage.enterMatKhau("123456");
        loginPage.clickSubmit();
        
        // Đợi login xử lý + redirect (login.js redirect sau 450ms)
        try { Thread.sleep(3000); } catch (InterruptedException e) {}

        openPage("/admin/admin.html");
        try { Thread.sleep(2000); } catch (InterruptedException e) {} // Đợi admin.js load API
        adminCustomerPage = new AdminCustomerPage(driver);
        adminCustomerPage.openCustomerTab();
        try { Thread.sleep(1000); } catch (InterruptedException e) {} // Đợi customer tab load
    }

    @Test(description = "TC-KH-01: Thêm thành công (Tất cả dữ liệu hợp lệ)")
    public void TC_KH_01() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("khachhang_moi123" + System.currentTimeMillis());
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        boolean isSuccess = adminCustomerPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm khách hàng thành công, khách hàng mới xuất hiện trên danh sách.");
    }

    @Test(description = "TC-KH-02: Lỗi do nhập Họ tên toàn khoảng trắng")
    public void TC_KH_02() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("     ");
        adminCustomerPage.enterTenDangNhap("khachhang_moi123" + System.currentTimeMillis());
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        boolean isError = adminCustomerPage.isToastMessageDisplayed("lỗi", "không hợp lệ", "trống", "thất bại", "bắt buộc"); // hoặc tương tự từ Backend 500
        ReportAssert.assertTrue(isError, "Hệ thống từ chối lưu và hiện lỗi do tên bị rỗng sau khi bị hệ thống tự động cắt bỏ dấu cách thừa.");
    }

    @Test(description = "TC-KH-03: Lỗi do bỏ trống Họ và tên")
    public void TC_KH_03() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("");
        adminCustomerPage.enterTenDangNhap("khachhang_moi123");
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        String validationMsg = adminCustomerPage.getValidationMessage("new-customer-name");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web tự động chặn lại, không cho thao tác lưu và hiện khung cảnh báo yêu cầu điền vào ô Họ tên.");
    }

    @Test(description = "TC-KH-04: Lỗi do Tài khoản đã bị trùng")
    public void TC_KH_04() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("admin"); // Trùng
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        boolean isError = adminCustomerPage.isToastMessageDisplayed("tồn tại", "trùng", "sử dụng", "lỗi"); 
        ReportAssert.assertTrue(isError, "Hệ thống chặn lại, không cho lưu và hiện thông báo lỗi: \"Tên đăng nhập đã tồn tại\".");
    }

    @Test(description = "TC-KH-05: Lỗi do bỏ trống Tài khoản")
    public void TC_KH_05() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("");
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        String validationMsg = adminCustomerPage.getValidationMessage("new-customer-username");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web tự động chặn lại, không cho thao tác lưu và hiện khung cảnh báo yêu cầu điền vào ô Tài khoản.");
    }

    @Test(description = "TC-KH-06: Lỗi do sai định dạng Email")
    public void TC_KH_06() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("khachhang_moi123");
        adminCustomerPage.enterEmail("khachmoi.gmail.com"); // Thiếu @
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        String validationMsg = adminCustomerPage.getValidationMessage("new-customer-email");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web tự động chặn lại và hiện dòng nhắc nhở: Vui lòng bao gồm chữ '@' trong địa chỉ email.");
    }

    @Test(description = "TC-KH-07: Thêm thành công khi bỏ trống Email")
    public void TC_KH_07() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("khachhang_moi" + System.currentTimeMillis());
        adminCustomerPage.enterEmail(""); // Null
        adminCustomerPage.enterPhone("0901234567");
        adminCustomerPage.clickSave();

        boolean isSuccess = adminCustomerPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm khách hàng thành công bình thường vì Email là trường thông tin không bắt buộc.");
    }

    @Test(description = "TC-KH-08: [BUG] Lưu thành công dù nhập chữ cái vào Số điện thoại")
    public void TC_KH_08() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("khachhang_moi_bug" + System.currentTimeMillis());
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone("abcdef"); // Chữ cái
        adminCustomerPage.clickSave();

        // Pass vì thực tế nó đang là BUG như mô tả
        boolean isSuccess = adminCustomerPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống bị lỗi phần mềm: Vẫn cho phép lưu thẳng chuỗi chữ cái 'abcdef' vào thông tin liên lạc và báo thêm khách hàng thành công.");
    }

    @Test(description = "TC-KH-09: Thêm thành công khi bỏ trống Số điện thoại")
    public void TC_KH_09() {
        adminCustomerPage.clickAddCustomer();
        adminCustomerPage.enterHoTen("Nguyen Van Khach");
        adminCustomerPage.enterTenDangNhap("khachhang_moi_phone" + System.currentTimeMillis());
        adminCustomerPage.enterEmail("khachmoi@gmail.com");
        adminCustomerPage.enterPhone(""); // Bỏ trống
        adminCustomerPage.clickSave();

        boolean isSuccess = adminCustomerPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm khách hàng thành công bình thường vì Số điện thoại là trường thông tin không bắt buộc.");
    }
}
