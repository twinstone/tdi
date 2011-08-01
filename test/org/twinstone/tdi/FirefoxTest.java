package org.twinstone.tdi;


import org.junit.Assume;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class FirefoxTest extends BrowserPages {
	
	@Before
	public void initDriver() {
		String os = (String) System.getProperties().get("os.name");
		System.out.println(os);
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		driver = new FirefoxDriver();
	}
	
	
}
