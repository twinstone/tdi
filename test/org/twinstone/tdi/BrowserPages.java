package org.twinstone.tdi;

import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;

import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
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
	
	protected URI makeUri(String name) throws URISyntaxException {
		return new File(base,name).toURI();
	}
	
	protected void testPage(String name) throws URISyntaxException {
		String url = makeUri(name).toString();
		driver.get(url);
		WebDriverWait waitForResult = new WebDriverWait(driver, 60);
        WebElement resultElm = waitForResult.until(new Function<WebDriver, WebElement>() {
            @Override
            public WebElement apply(WebDriver driver) {
                WebElement elm = driver.findElement(By.id("qunit-testresult"));
                if (elm != null && !elm.getText().contains("Running")) {
                    return elm;
                }
                
				try {
					Alert alert = driver.switchTo().alert();
					alert.accept();
				}
				catch (final WebDriverException e) {}
				
				return null;
            }
        });
        assertTrue("There are failed qunit tests", resultElm.getText().contains("0 failed"));
	}
	
	@Test
	public void ajax() throws URISyntaxException {
		testPage("tdi-ajax.html");
	}

	@Test
	public void tools() throws URISyntaxException {
		testPage("tdi-tools.html");
	}

	@Test
	public void ajaxUi() throws URISyntaxException {
		testPage("tdi-ajax-ui.html");
	}

	@Test
	public void ajaxRequest() throws URISyntaxException {
		testPage("tdi-ajax-request.html");
	}

	@Test
	public void ajaxResponseError() throws URISyntaxException {
		testPage("tdi-ajax-response-error.html");
	}

	@Test
	public void ajaxResponseEventsPrevent() throws URISyntaxException {
		testPage("tdi-ajax-response-events-prevent.html");
	}

	@Test
	public void ajaxResponseEvents() throws URISyntaxException {
		testPage("tdi-ajax-response-events.html");
	}

	@Test
	public void ajaxResponseResponses() throws URISyntaxException {
		testPage("tdi-ajax-response-responses.html");
	}
	
	@After
	public void quitDriver() {
		if (driver!=null) driver.quit();
	}

}
