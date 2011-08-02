package org.twinstone.tdi;


import org.junit.Assume;
import org.junit.Before;
import org.openqa.selenium.firefox.FirefoxDriver;

public class FirefoxTest extends BrowserPages {
	
	@Before
	public void initDriver() {
		String os = (String) System.getProperties().get("os.name");
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		driver = new FirefoxDriver();
	}
	
	
}
