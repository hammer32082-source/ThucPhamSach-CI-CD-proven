package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By tenDangNhapInput = By.id("tenDangNhap");
    private By matKhauInput = By.id("matKhau");
    private By submitButton = By.cssSelector("#login-form .primary-button[type='submit']");
    private By statusBox = By.id("login-status");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
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

    public void clickSubmit() {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(submitButton));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    public String getStatusMessage() {
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
