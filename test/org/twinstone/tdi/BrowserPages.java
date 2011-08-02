package org.twinstone.tdi;

import java.io.File;

import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Function;

import static org.junit.Assert.*;

public class BrowserPages {

	protected WebDriver driver;
	
	protected static final File base = new File("tests").getAbsoluteFile();
	
	@BeforeClass
	public static void assertBase() {
		assertNotNull(base);
	}
	
	protected void testPage(String name) {
		String url = new File(base,name).toURI().toString();
		driver.get(url);
		WebDriverWait waitForResult = new WebDriverWait(driver, 60);
        WebElement resultElm = waitForResult.until(new Function<WebDriver, WebElement>() {
            @Override
            public WebElement apply(WebDriver driver) {
                WebElement elm = driver.findElement(By.id("qunit-testresult"));
                if (elm != null && !elm.getText().contains("Running")) {
                    return elm;
                }
                return null;
            }
        });
        assertTrue("There are failed qunit tests", resultElm.getText().contains("0 failed"));
	}
	
	@Test
	public void ajax() {
		testPage("tdi-ajax.html");
	}

	@Test
	public void tools() {
		testPage("tdi-tools.html");
	}

	@Test
	public void ajaxUi() {
		testPage("tdi-ajax-ui.html");
	}

	@Test
	public void ajaxRequest() {
		testPage("tdi-ajax-request.html");
	}

	@Test
	public void ajaxResponseError() {
		testPage("tdi-ajax-response-error.html");
	}

	@Test
	public void ajaxResponseEventsPrevent() {
		testPage("tdi-ajax-response-events-prevent.html");
	}

	@Test
	public void ajaxResponseEvents() {
		testPage("tdi-ajax-response-events.html");
	}

	@Test
	public void ajaxResponseResponses() {
		testPage("tdi-ajax-response-responses.html");
	}

	
	@After
	public void quitDriver() {
		if (driver!=null) driver.quit();
	}

}
