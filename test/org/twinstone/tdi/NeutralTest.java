package org.twinstone.tdi;

import org.junit.Before;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import com.gargoylesoftware.htmlunit.BrowserVersion;

public class NeutralTest extends BrowserPages {
	
	@Before
	public void initDriver() {
		BasicConfigurator.configure();
		Logger.getRootLogger().setLevel(Level.INFO);
		Logger logger = Logger.getLogger("com.gargoylesoftware.htmlunit");
		logger.setLevel(Level.DEBUG);
		
		driver = new AlertHtmlUnitDriver(BrowserVersion.FIREFOX_3_6);
	}
	
}
