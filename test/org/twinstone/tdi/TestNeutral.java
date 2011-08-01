package org.twinstone.tdi;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

public class TestNeutral extends BrowserPages {
	
	@Before
	public void initDriver() {
		driver = new HtmlUnitDriver(true);
	}
	
	@After
	public void quitDriver() {
		driver.quit();
	}

	
}
