package org.twinstone.tdi;


import org.junit.Assume;
import org.junit.Before;
import org.openqa.selenium.chrome.ChromeDriver;

public class ChromeTest extends BrowserPages {
	/*
	 * ChromeDriverServer must be either in the PATH or should be
	 * set via the System.setProperty method.
	 */
	/*
	@BeforeClass
	public static void setProp() {
		System.setProperty("webdriver.chrome.driver", "d:\\WORK\\libs\\chromedriver.exe");
	}
	*/
	
	@Before
	public void initDriver() {
		String os = (String) System.getProperties().get("os.name");
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		driver = new ChromeDriver();
	}
	
	
}
