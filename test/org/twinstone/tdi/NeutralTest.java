package org.twinstone.tdi;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class NeutralTest extends BrowserPages {
	
	@Before
	public void initDriver() {
		DesiredCapabilities capabilities = DesiredCapabilities.htmlUnit();
		capabilities.setCapability("ThrowExceptionOnScriptError", false);
		driver = new HtmlUnitDriver(capabilities);
	}
	
	@After
	public void quitDriver() {
		driver.quit();
	}

	
}
