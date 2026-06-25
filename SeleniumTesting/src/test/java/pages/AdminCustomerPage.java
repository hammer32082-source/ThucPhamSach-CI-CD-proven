package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AdminCustomerPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By customerTab = By.cssSelector(".tab-link[data-tab='customers']");
    private By addToggleBtn = By.id("customer-add-toggle-btn");
    private By hoTenInput = By.id("new-customer-name");
    private By tenDangNhapInput = By.id("new-customer-username");
    private By emailInput = By.id("new-customer-email");
    private By phoneInput = By.id("new-customer-phone");
    private By saveBtn = By.id("customer-add-save-btn");

    public AdminCustomerPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void openCustomerTab() {
        WebElement tab = wait.until(ExpectedConditions.elementToBeClickable(customerTab));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", tab);
    }

    public void clickAddCustomer() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(addToggleBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        // Wait for form to appear
        wait.until(ExpectedConditions.visibilityOfElementLocated(hoTenInput));
    }

    public void enterHoTen(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(hoTenInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterTenDangNhap(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(tenDangNhapInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterEmail(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterPhone(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(phoneInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void clickSave() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(saveBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
    }

    public boolean isToastMessageDisplayed(String... expectedMessages) {
        try {
            Thread.sleep(2000); // Đợi API phản hồi và DOM cập nhật
            
            // Kiểm tra #admin-status (showAdminStatus trong admin.js ghi vào đây)
            try {
                WebElement statusBox = driver.findElement(By.id("admin-status"));
                String statusText = statusBox.getText();
                if (!statusText.isEmpty()) {
                    for (String msg : expectedMessages) {
                        if (core.VietnameseUtils.containsIgnoreDiacritics(statusText, msg)) {
                            return true;
                        }
                    }
                }
            } catch (Exception ignore) {}
            
            // Kiểm tra cả Toast (TPS.showToast)
            try {
                WebElement toast = driver.findElement(By.cssSelector("#tps-toast-container div"));
                String toastText = toast.getText();
                if (!toastText.isEmpty()) {
                    for (String msg : expectedMessages) {
                        if (core.VietnameseUtils.containsIgnoreDiacritics(toastText, msg)) {
                            return true;
                        }
                    }
                }
            } catch (Exception ignore) {}
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public String getValidationMessage(String fieldId) {
        WebElement element = driver.findElement(By.id(fieldId));
        return (String) ((JavascriptExecutor) driver).executeScript("return arguments[0].validationMessage;", element);
    }
}
