package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class SearchPage {
    private WebDriver driver;
    private WebDriverWait wait;

    // Locators
    private By keywordInput = By.id("header-search-keyword");
    private By searchBtn = By.cssSelector(".search-btn");
    
    // Category page locators
    private By priceFromInput = By.id("price-from");
    private By priceToInput = By.id("price-to");
    private By applyPriceBtn = By.id("apply-price-filter");
    private By clearFilterBtn = By.id("clear-filters");
    
    private By productItems = By.cssSelector(".product-card");
    private By emptyStateMsg = By.cssSelector(".empty-state"); // giả định có class này khi trống

    public SearchPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void enterKeyword(String keyword) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(keywordInput));
        element.clear();
        if (keyword != null && !keyword.isEmpty()) {
            element.sendKeys(keyword);
        }
    }

    public void clickSearch() {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(searchBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    public void enterPriceFrom(String price) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(priceFromInput));
        element.clear();
        if (price != null && !price.isEmpty()) {
            element.sendKeys(price);
        }
    }

    public void enterPriceTo(String price) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(priceToInput));
        element.clear();
        if (price != null && !price.isEmpty()) {
            element.sendKeys(price);
        }
    }

    public void clickApplyPrice() {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(applyPriceBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }
    
    public void clickClearFilters() {
        try {
            WebElement element = wait.until(ExpectedConditions.elementToBeClickable(clearFilterBtn));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
        } catch(Exception e) {}
    }

    public void selectSubcategory(String categoryName) {
        try {
            WebElement checkbox = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id='subcategory-filters']//label[contains(text(), '" + categoryName + "')]/input")));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", checkbox);
        } catch (Exception e) {}
    }

    public int getProductCount() {
        try {
            // Đợi loader mất đi
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("product-status")));
            List<WebElement> products = driver.findElements(productItems);
            return products.size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isEmptyMessageDisplayed() {
        try {
            // Có thể check xem text "Không tìm thấy" có xuất hiện không
            WebElement grid = driver.findElement(By.id("product-grid"));
            return grid.getText().contains("Không tìm thấy");
        } catch (Exception e) {
            return false;
        }
    }
}
