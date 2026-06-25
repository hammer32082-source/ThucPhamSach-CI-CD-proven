package core;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.time.Duration;

import org.testng.annotations.Listeners;

@Listeners(reports.ExtentTestListener.class)
public class BaseTest {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public WebDriver getDriver() {
        return driver;
    }

    // Đường dẫn tuyệt đối đến thư mục chứa website (file HTML)
    // Cần thay đổi nếu chuyển máy khác
    protected final String BASE_URL = "file:///C:/Users/hamme/Desktop/remake/website%20b%C3%A1n%20th%E1%BB%B1c%20ph%E1%BA%A9m%20-%20Copy%20(2)/Web/Frontend/ThucPhamSach_Frontend";

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--allow-file-access-from-files");
        options.addArguments("--disable-web-security");
        // Khởi tạo WebDriver
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        
        // Khởi tạo WebDriverWait chung (10 giây)
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    protected void openPage(String path) {
        driver.get(BASE_URL + path);
        try {
            // Đọc file header.html và footer.html từ ổ cứng
            String rootPath = "C:/Users/hamme/Desktop/remake/website bán thực phẩm - Copy (2)/Web/Frontend/ThucPhamSach_Frontend";
            String headerContent = new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(rootPath + "/common/header.html")), "UTF-8");
            String footerContent = new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(rootPath + "/common/footer.html")), "UTF-8");
            
            // Xử lý lại đường dẫn tương đối trong HTML nếu đang ở trang con (tuỳ theo level của trang con)
            String prefix = "";
            if (path.contains("/")) {
                prefix = "../";
            }
            if (!prefix.isEmpty()) {
                headerContent = headerContent.replace("href=\"", "href=\"" + prefix);
                headerContent = headerContent.replace("src=\"", "src=\"" + prefix);
                headerContent = headerContent.replace("href=\"../http", "href=\"http");
                headerContent = headerContent.replace("src=\"../http", "src=\"http");
                headerContent = headerContent.replace("href=\"../#", "href=\"#");
            }
            
            org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;
            // Inject Header nếu có thẻ header.site-header nhưng đang rỗng
            js.executeScript(
                "var h = document.querySelector('header.site-header'); " +
                "if (h && h.innerHTML.trim() === '') { h.innerHTML = arguments[0]; }", headerContent);
            
            // Inject Footer
            js.executeScript(
                "var f = document.querySelector('footer.simple-footer'); " +
                "if (f && f.innerHTML.trim() === '') { f.innerHTML = arguments[0]; }", footerContent);
            
            Thread.sleep(500); // Đợi js xử lý hiển thị
        } catch (Exception e) {
            System.err.println("Lỗi inject header/footer: " + e.getMessage());
        }
    }
}
