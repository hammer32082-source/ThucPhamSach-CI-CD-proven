package reports;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import java.io.File;

public class ExtentManager {
    private static ExtentReports extent;

    public synchronized static ExtentReports getInstance() {
        if (extent == null) {
            String reportPath = "test-output/ExtentReport.html";
            File reportDir = new File("test-output");
            if (!reportDir.exists()) {
                reportDir.mkdir();
            }
            
            ExtentSparkReporter htmlReporter = new ExtentSparkReporter(reportPath);
            htmlReporter.config().setTheme(Theme.STANDARD);
            htmlReporter.config().setDocumentTitle("ThucPhamSach Automation Report");
            htmlReporter.config().setEncoding("utf-8");
            htmlReporter.config().setReportName("Test Automation Results");

            extent = new ExtentReports();
            extent.attachReporter(htmlReporter);
            extent.setSystemInfo("OS", System.getProperty("os.name"));
            extent.setSystemInfo("Java Version", System.getProperty("java.version"));
            extent.setSystemInfo("Tester", "Automation Bot");
        }
        return extent;
    }
}
