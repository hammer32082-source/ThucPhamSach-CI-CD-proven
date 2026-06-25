package reports;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

public class ExtentTestListener implements ITestListener {
    private static ExtentReports extent = ExtentManager.getInstance();
    private static ThreadLocal<ExtentTest> test = new ThreadLocal<>();

    public static ExtentTest getTest() {
        return test.get();
    }

    @Override
    public synchronized void onStart(ITestContext context) {
        System.out.println("Extent Reports Version 5 Test Suite started!");
    }

    @Override
    public synchronized void onFinish(ITestContext context) {
        System.out.println(("Extent Reports Version 5 Test Suite is ending!"));
        extent.flush();
    }

    @Override
    public synchronized void onTestStart(ITestResult result) {
        System.out.println((result.getMethod().getMethodName() + " started!"));
        String testName = result.getMethod().getDescription();
        if (testName == null || testName.isEmpty()) {
            testName = result.getMethod().getMethodName();
        }
        ExtentTest extentTest = extent.createTest(testName);
        
        // Lấy tên Class (VD: LoginTest, RegisterTest...) để làm Category phân nhóm
        String className = result.getTestClass().getRealClass().getSimpleName();
        extentTest.assignCategory(className);
        
        test.set(extentTest);
    }

    private void captureScreenshot(ITestResult result) {
        Object testClass = result.getInstance();
        if (testClass instanceof core.BaseTest) {
            org.openqa.selenium.WebDriver driver = ((core.BaseTest) testClass).getDriver();
            if (driver != null) {
                try {
                    java.io.File scrFile = ((org.openqa.selenium.TakesScreenshot) driver).getScreenshotAs(org.openqa.selenium.OutputType.FILE);
                    String screenshotName = result.getMethod().getMethodName() + "_" + System.currentTimeMillis() + ".png";
                    java.io.File destFile = new java.io.File("test-output/" + screenshotName);
                    org.openqa.selenium.io.FileHandler.copy(scrFile, destFile);
                    test.get().addScreenCaptureFromPath(screenshotName);
                } catch (Exception e) {
                    System.err.println("Lỗi khi chụp màn hình: " + e.getMessage());
                }
            }
        }
    }

    @Override
    public synchronized void onTestSuccess(ITestResult result) {
        System.out.println((result.getMethod().getMethodName() + " passed!"));
        // test.get().pass("Test passed"); // Đã log ở ReportAssert
        captureScreenshot(result);
    }

    @Override
    public synchronized void onTestFailure(ITestResult result) {
        System.out.println((result.getMethod().getMethodName() + " failed!"));
        test.get().fail(result.getThrowable());
        captureScreenshot(result);
    }

    @Override
    public synchronized void onTestSkipped(ITestResult result) {
        System.out.println((result.getMethod().getMethodName() + " skipped!"));
        test.get().skip(result.getThrowable());
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
        System.out.println(("onTestFailedButWithinSuccessPercentage for " + result.getMethod().getMethodName()));
    }
}
