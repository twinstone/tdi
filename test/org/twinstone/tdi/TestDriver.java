package org.twinstone.tdi;

import java.io.File;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;

import static org.junit.Assert.*;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class TestDriver {
	WebDriver driver;
	
	@BeforeClass
	public static void setProp() {
		System.setProperty("webdriver.chrome.driver", "C:\\Users\\stepan\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe");
	}
	
	@Before
	public void initDriver() {
		DesiredCapabilities capabilities = DesiredCapabilities.chrome();
		capabilities.setCapability("chrome.binary", "C:\\Users\\stepan\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe");
		driver = new ChromeDriver(capabilities);
	}
	
	@After
	public void quitDriver() {
		driver.quit();
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
