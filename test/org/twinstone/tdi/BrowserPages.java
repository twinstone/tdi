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
	protected static final String[] pages = {
		new File(base,"tdi-ajax.html").toURI().toString(),
		new File(base,"tdi-tools.html").toURI().toString(),
		new File(base,"tdi-ajax-ui.html").toURI().toString(),
		new File(base,"tdi-ajax-request.html").toURI().toString(),
		new File(base,"tdi-ajax-response-error.html").toURI().toString(),
		new File(base,"tdi-ajax-response-events-prevent.html").toURI().toString(),
		new File(base,"tdi-ajax-response-events.html").toURI().toString(),
		new File(base,"tdi-ajax-response-responses.html").toURI().toString()
	};
	
	@BeforeClass
	public static void assertBase() {
		assertNotNull(base);
	}
	
	@Test
	public void index() {
		for (String pageURI : pages) {
			driver.get(pageURI);
			
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
	        
	        assertTrue(pageURI, resultElm.getText().contains("0 failed"));
		}
	}
	
	@After
	public void quitDriver() {
		if (driver!=null) driver.quit();
	}

}
