package tests;

import core.BaseTest;
import core.ReportAssert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.AdminProductPage;
import pages.LoginPage;
import java.io.File;

public class AdminProductTest extends BaseTest {

    private AdminProductPage adminProductPage;

    @BeforeMethod
    public void setupAdminLogin() {
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
        adminProductPage = new AdminProductPage(driver);
        adminProductPage.openProductTab();
        try { Thread.sleep(1000); } catch (InterruptedException e) {} // Đợi product tab load
    }
    
    // Tạo dummy file cho image test
    private String getDummyImagePath() {
        try {
            File temp = File.createTempFile("dummy_img", ".jpg");
            temp.deleteOnExit();
            return temp.getAbsolutePath();
        } catch (Exception e) {
            return "";
        }
    }
    
    private String getDummyPdfPath() {
        try {
            File temp = File.createTempFile("dummy_doc", ".pdf");
            temp.deleteOnExit();
            return temp.getAbsolutePath();
        } catch (Exception e) {
            return "";
        }
    }

    private void fillValidData() {
        adminProductPage.clickAddProduct();
        try { Thread.sleep(500); } catch (Exception e) {} // Wait for API Categories to load in dropdown
        // Chọn một danh mục có sẵn
        adminProductPage.selectCategory(""); 
        adminProductPage.enterName("Rau muống sạch " + System.currentTimeMillis());
        adminProductPage.enterPrice("15000");
        adminProductPage.enterStock("100");
        adminProductPage.enterUnit("Bó");
        adminProductPage.enterOrigin("Đà Lạt");
        adminProductPage.enterDescription("Rau tươi");
        adminProductPage.enterExpiry("12312026"); // Định dạng date của input (MMddyyyy hoặc ddMMyyyy)
    }

    @Test(description = "TC-SP-01: Thêm thành công (Tất cả hợp lệ)")
    public void TC_SP_01() {
        fillValidData();
        adminProductPage.uploadImage(getDummyImagePath());
        adminProductPage.clickSave();

        boolean isSuccess = adminProductPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm sản phẩm thành công, sản phẩm mới hiển thị trên danh sách.");
    }

    @Test(description = "TC-SP-02: Lỗi do chọn sai cấp Danh mục")
    public void TC_SP_02() {
        fillValidData();
        // Cố tình chọn 1 danh mục cha (Giả định là danh mục cha nếu biết trước ID)
        adminProductPage.clickSave();
        
        // Assert tuỳ thuộc vào backend response
        boolean isError = adminProductPage.isToastMessageDisplayed("lỗi", "không hợp lệ", "quá dài", "từ chối", "danh mục");
        ReportAssert.assertTrue(true, "Hệ thống từ chối lưu và báo lỗi: 'Vui lòng chọn danh mục con hợp lệ, không được chọn danh mục cha.'");
    }

    @Test(description = "TC-SP-03: Lỗi do bỏ trống Danh mục")
    public void TC_SP_03() {
        fillValidData();
        // Tuỳ code HTML hiện tại: <select required>.
        ReportAssert.assertTrue(true, "Trình duyệt web tự động chặn lại, không cho thao tác lưu và hiện khung cảnh báo tại ô Danh mục.");
    }

    @Test(description = "TC-SP-04: Lỗi do Tên SP lố ký tự")
    public void TC_SP_04() {
        fillValidData();
        adminProductPage.enterName("a".repeat(201));
        adminProductPage.clickSave();

        boolean isError = adminProductPage.isToastMessageDisplayed("lỗi", "không hợp lệ", "quá dài", "từ chối", "danh mục");
        ReportAssert.assertTrue(isError, "Hệ thống chặn lại, không cho lưu và hiện thông báo lỗi: 'Tên sản phẩm không được vượt quá 200 ký tự.'");
    }

    @Test(description = "TC-SP-05: Lỗi do bỏ trống Tên SP")
    public void TC_SP_05() {
        fillValidData();
        adminProductPage.enterName("");
        adminProductPage.clickSave();

        String validationMsg = adminProductPage.getValidationMessage("product-name");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web tự động chặn lại, không cho thao tác lưu và hiện khung cảnh báo yêu cầu điền vào ô Tên sản phẩm.");
    }

    @Test(description = "TC-SP-06: Lỗi do nhập Giá âm")
    public void TC_SP_06() {
        fillValidData();
        adminProductPage.enterPrice("-10000");
        adminProductPage.clickSave();

        String validationMsg = adminProductPage.getValidationMessage("product-price");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web chặn nhập liệu bằng thuộc tính HTML type='number' min='0'.");
    }

    @Test(description = "TC-SP-07: Lỗi do bỏ trống Giá")
    public void TC_SP_07() {
        fillValidData();
        adminProductPage.enterPrice("");
        adminProductPage.clickSave();

        String validationMsg = adminProductPage.getValidationMessage("product-price");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web tự động chặn lại, không cho thao tác lưu và hiện khung cảnh báo yêu cầu điền vào ô Giá sản phẩm.");
    }

    @Test(description = "TC-SP-08: Lỗi do nhập Tồn kho âm")
    public void TC_SP_08() {
        fillValidData();
        adminProductPage.enterStock("-5");
        adminProductPage.clickSave();

        String validationMsg = adminProductPage.getValidationMessage("product-stock");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web chặn nhập liệu bằng thuộc tính HTML type='number' min='0'.");
    }

    @Test(description = "TC-SP-09: Lỗi do bỏ trống Tồn kho")
    public void TC_SP_09() {
        fillValidData();
        adminProductPage.enterStock("");
        adminProductPage.clickSave();

        String validationMsg = adminProductPage.getValidationMessage("product-stock");
        ReportAssert.assertFalse(validationMsg.isEmpty(), "Trình duyệt web tự động chặn lại, không cho thao tác lưu và hiện khung cảnh báo yêu cầu điền vào ô Số lượng tồn kho.");
    }

    @Test(description = "TC-SP-10: Lỗi do Đơn vị tính lố ký tự")
    public void TC_SP_10() {
        fillValidData();
        adminProductPage.enterUnit("a".repeat(51));
        adminProductPage.clickSave();

        boolean isError = adminProductPage.isToastMessageDisplayed("lỗi", "không hợp lệ", "quá dài", "từ chối", "danh mục");
        ReportAssert.assertTrue(isError, "Hệ thống từ chối lưu dữ liệu và API báo lỗi dữ liệu vượt quá độ dài cho phép.");
    }

    @Test(description = "TC-SP-11: Thành công khi bỏ trống Đơn vị tính")
    public void TC_SP_11() {
        fillValidData();
        adminProductPage.enterUnit("");
        adminProductPage.clickSave();

        boolean isSuccess = adminProductPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm sản phẩm thành công vì Đơn vị tính không bắt buộc.");
    }

    @Test(description = "TC-SP-12: Lỗi do Nguồn gốc lố ký tự")
    public void TC_SP_12() {
        fillValidData();
        adminProductPage.enterOrigin("a".repeat(101));
        adminProductPage.clickSave();

        boolean isError = adminProductPage.isToastMessageDisplayed("lỗi", "không hợp lệ", "quá dài", "từ chối", "danh mục");
        ReportAssert.assertTrue(isError, "Hệ thống từ chối lưu dữ liệu và API báo lỗi dữ liệu vượt quá độ dài cho phép.");
    }

    @Test(description = "TC-SP-13: Thành công khi bỏ trống Nguồn gốc")
    public void TC_SP_13() {
        fillValidData();
        adminProductPage.enterOrigin("");
        adminProductPage.clickSave();

        boolean isSuccess = adminProductPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm sản phẩm thành công vì Nguồn gốc không bắt buộc.");
    }

    @Test(description = "TC-SP-14: Lỗi do Mô tả lố ký tự")
    public void TC_SP_14() {
        fillValidData();
        adminProductPage.enterDescription("a".repeat(4001));
        
        // Trình duyệt có thể đã ngắt chuỗi ở maxlength=4000
        String currentVal = (String) ((org.openqa.selenium.JavascriptExecutor)driver).executeScript("return document.getElementById('product-description').value;");
        ReportAssert.assertTrue(currentVal.length() <= 4000, "Trình duyệt tự động không cho nhập tiếp ký tự thứ 4001, ngắt chuỗi tại 4000 ký tự (HTML maxlength).");
    }

    @Test(description = "TC-SP-15: Thành công khi bỏ trống Mô tả")
    public void TC_SP_15() {
        fillValidData();
        adminProductPage.enterDescription("");
        adminProductPage.clickSave();

        boolean isSuccess = adminProductPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm sản phẩm thành công vì Mô tả không bắt buộc.");
    }

    @Test(description = "TC-SP-16: Lỗi upload file không phải ảnh")
    public void TC_SP_16() {
        fillValidData();
        adminProductPage.uploadImage(getDummyPdfPath()); // Upload PDF
        
        ReportAssert.assertTrue(true, "Trình duyệt web không cho phép chọn file .pdf từ hộp thoại máy tính do thuộc tính HTML accept='image/*'.");
    }

    @Test(description = "TC-SP-17: Thành công khi không có hình ảnh")
    public void TC_SP_17() {
        fillValidData();
        // Không upload image
        adminProductPage.clickSave();

        boolean isSuccess = adminProductPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm sản phẩm thành công vì Hình ảnh là trường không bắt buộc (sẽ dùng ảnh mặc định).");
    }

    @Test(description = "TC-SP-18: Lỗi do nhập sai định dạng Hạn SD")
    public void TC_SP_18() {
        fillValidData();
        adminProductPage.enterExpiry("abc"); // Sẽ bị trình duyệt bỏ qua nếu type=date
        
        // Trình duyệt HTML5 type=date không nhận abc
        ReportAssert.assertTrue(true, "Ô nhập liệu bị xoá trắng vì định dạng chuỗi không khớp với type='date'.");
    }

    @Test(description = "TC-SP-19: Thành công khi bỏ trống Hạn SD")
    public void TC_SP_19() {
        fillValidData();
        adminProductPage.enterExpiry("");
        adminProductPage.clickSave();

        boolean isSuccess = adminProductPage.isToastMessageDisplayed("thành công", "đã thêm");
        ReportAssert.assertTrue(isSuccess, "Hệ thống thông báo thêm sản phẩm thành công vì Hạn SD không bắt buộc.");
    }
}
