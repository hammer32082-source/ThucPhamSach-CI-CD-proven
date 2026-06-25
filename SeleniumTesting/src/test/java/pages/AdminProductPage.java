package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AdminProductPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By productTab = By.cssSelector(".tab-link[data-tab='products']");
    private By addToggleBtn = By.id("start-add-product");
    
    private By categorySelect = By.id("product-category");
    private By nameInput = By.id("product-name");
    private By priceInput = By.id("product-price");
    private By stockInput = By.id("product-stock");
    private By unitInput = By.id("product-unit");
    private By originInput = By.id("product-origin");
    private By descInput = By.id("product-description");
    private By imageInput = By.id("product-image");
    private By expiryInput = By.id("product-expiry");
    
    private By saveBtn = By.id("save-product");

    public AdminProductPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void openProductTab() {
        WebElement tab = wait.until(ExpectedConditions.elementToBeClickable(productTab));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", tab);
    }

    public void clickAddProduct() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(addToggleBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput));
    }

    // Workaround cho Select có thể được load AJAX
    public void selectCategory(String textContains) {
        WebElement selectElement = wait.until(ExpectedConditions.visibilityOfElementLocated(categorySelect));
        Select select = new Select(selectElement);
        // Chọn option dựa trên text
        for (WebElement option : select.getOptions()) {
            if (option.getText().contains(textContains)) {
                option.click();
                break;
            }
        }
    }

    public void enterName(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterPrice(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(priceInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterStock(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(stockInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterUnit(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(unitInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterOrigin(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(originInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void enterDescription(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(descInput));
        element.clear();
        if (text != null && !text.isEmpty()) {
            element.sendKeys(text);
        }
    }

    public void uploadImage(String filePath) {
        WebElement element = driver.findElement(imageInput); // file input is often hidden, wait might fail if not careful, but sendKeys works on hidden inputs in selenium if done right
        if (filePath != null && !filePath.isEmpty()) {
            // Unhide input to avoid ElementNotInteractableException
            ((JavascriptExecutor) driver).executeScript("arguments[0].style.display='block';", element);
            element.sendKeys(filePath);
        }
    }

    public void enterExpiry(String text) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(expiryInput));
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
