package core;

import org.testng.Assert;
import reports.ExtentTestListener;

public class ReportAssert {
    public static void assertTrue(boolean condition, String message) {
        if (condition) {
            if (ExtentTestListener.getTest() != null) {
                ExtentTestListener.getTest().pass("Khớp với kết quả mong đợi: " + message);
            }
        }
        Assert.assertTrue(condition, message);
    }

    public static void assertFalse(boolean condition, String message) {
        if (!condition) {
            if (ExtentTestListener.getTest() != null) {
                ExtentTestListener.getTest().pass("Khớp với kết quả mong đợi: " + message);
            }
        }
        Assert.assertFalse(condition, message);
    }

    /**
     * Kiểm tra xem chuỗi status có chứa BẤT KỲ từ khóa nào trong danh sách hay không,
     * bất kể có dấu tiếng Việt hay không.
     * VD: "Ten dang nhap da ton tai" sẽ khớp với "tồn tại"
     */
    public static void assertContainsAnyVi(String actualStatus, String reportMessage, String... keywords) {
        boolean matched = false;
        for (String kw : keywords) {
            if (VietnameseUtils.containsIgnoreDiacritics(actualStatus, kw)) {
                matched = true;
                break;
            }
        }
        if (matched) {
            if (ExtentTestListener.getTest() != null) {
                ExtentTestListener.getTest().pass("Khớp với kết quả mong đợi: " + reportMessage);
            }
        }
        Assert.assertTrue(matched, reportMessage);
    }
}
