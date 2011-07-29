package org.twinstone.tdi;

import java.io.File;

import org.junit.Before;
import static org.junit.Assert.*;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

public class TestDriver {
	WebDriver driver;
	
	@Before
	public void initDriver() {
		driver = new HtmlUnitDriver();
	}
	
	@Test
	public void getPage() {
		File f = new File("tests/index.html");
		assertTrue(f.exists());
		driver.get(f.toURI().toString());
		WebElement element = driver.findElement(By.tagName("h1"));
		assertEquals("Title",element.getText());
	}
	
}
