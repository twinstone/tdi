package org.twinstone.tdi;

import static org.junit.Assert.assertEquals;

import java.io.File;

import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import static org.junit.Assert.*;

public class BrowserPages {

	protected WebDriver driver;
	
	protected static final File base = new File("tests").getAbsoluteFile();
	
	@BeforeClass
	public static void assertBase() {
		assertNotNull(base);
	}
	
	@Test
	public void index() {
		driver.get(new File(base,"index.html").toURI().toString());
		WebElement element = driver.findElement(By.tagName("h1"));
		assertEquals("Title",element.getText());
	}
	
	@After
	public void quitDriver() {
		if (driver!=null) driver.quit();
	}

}
