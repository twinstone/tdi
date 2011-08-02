package org.twinstone.tdi;


import org.junit.Assume;
import org.junit.Before;
import org.openqa.selenium.ie.InternetExplorerDriver;

public class IETest extends BrowserPages {
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
		System.out.println(os);
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		driver = new InternetExplorerDriver();
	}
	
	
}
