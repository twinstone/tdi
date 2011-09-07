package org.twinstone.tdi;


import org.junit.Assume;
import org.junit.Before;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class IETest extends BrowserPages {

	@Before
	public void initDriver() {
		String os = (String) System.getProperties().get("os.name");
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		DesiredCapabilities capabilities = DesiredCapabilities.internetExplorer();
		capabilities.setCapability(InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, true);
		driver = new InternetExplorerDriver(capabilities);
	}
	
	
}
