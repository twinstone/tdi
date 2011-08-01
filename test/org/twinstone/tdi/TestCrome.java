package org.twinstone.tdi;


import org.junit.Assume;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class TestCrome extends BrowserPages {
	
	@BeforeClass
	public static void setProp() {
		System.setProperty("webdriver.chrome.driver", "C:\\Users\\stepan\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe");
	}
	
	@Before
	public void initDriver() {
		String os = (String) System.getProperties().get("os.name");
		System.out.println(os);
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		DesiredCapabilities capabilities = DesiredCapabilities.chrome();
		capabilities.setCapability("chrome.binary", "C:\\Users\\stepan\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe");
		driver = new ChromeDriver(capabilities);
	}
	
	
}
