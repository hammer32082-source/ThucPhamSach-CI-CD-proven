package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class RegisterPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By hoTenInput = By.id("hoTen");
    private By tenDangNhapInput = By.id("tenDangNhap");
    private By matKhauInput = By.id("matKhau");
    private By sdtInput = By.id("sdt");
    private By emailInput = By.id("email");
    private By submitButton = By.cssSelector("#register-form .primary-button[type='submit']");
    private By statusBox = By.id("register-status");

    public RegisterPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void enterHoTen(String hoTen) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(hoTenInput));
        element.clear();
        if (hoTen != null && !hoTen.isEmpty()) {
            element.sendKeys(hoTen);
        }
    }

    public void enterTenDangNhap(String tenDangNhap) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(tenDangNhapInput));
        element.clear();
        if (tenDangNhap != null && !tenDangNhap.isEmpty()) {
            element.sendKeys(tenDangNhap);
        }
    }

    public void enterMatKhau(String matKhau) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(matKhauInput));
        element.clear();
        if (matKhau != null && !matKhau.isEmpty()) {
            element.sendKeys(matKhau);
        }
    }

    public void enterSdt(String sdt) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(sdtInput));
        element.clear();
        if (sdt != null && !sdt.isEmpty()) {
            element.sendKeys(sdt);
        }
    }

    public void enterEmail(String email) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        element.clear();
        if (email != null && !email.isEmpty()) {
            element.sendKeys(email);
        }
    }

    public void clickSubmit() {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(submitButton));
        // Sử dụng JS Click để tránh lỗi intercepted
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    public String getStatusMessage() {
        // Chờ status box hiển thị (không có class is-hidden)
        wait.until(ExpectedConditions.not(ExpectedConditions.attributeContains(statusBox, "class", "is-hidden")));
        WebElement element = driver.findElement(statusBox);
        return element.getText();
    }
    
    public boolean isStatusError() {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(statusBox));
        return element.getAttribute("class").contains("is-error");
    }

    public String getValidationMessage(String fieldId) {
        WebElement element = driver.findElement(By.id(fieldId));
        return (String) ((JavascriptExecutor) driver).executeScript("return arguments[0].validationMessage;", element);
    }
}
