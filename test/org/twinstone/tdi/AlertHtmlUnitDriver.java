package org.twinstone.tdi;

import java.util.ArrayList;

import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.CollectingAlertHandler;

public class AlertHtmlUnitDriver extends HtmlUnitDriver {

	private ArrayList<String> collectedAlerts;

	public AlertHtmlUnitDriver(DesiredCapabilities cap) {
		super(cap);
		collectedAlerts = new ArrayList<String>();
		getWebClient().setAlertHandler(new CollectingAlertHandler(collectedAlerts));
		getWebClient().setThrowExceptionOnFailingStatusCode(false);
	}

	public AlertHtmlUnitDriver(BrowserVersion version) {
		super(version);
		collectedAlerts = new ArrayList<String>();
		getWebClient().setAlertHandler(new CollectingAlertHandler(collectedAlerts));
		getWebClient().setThrowExceptionOnFailingStatusCode(false);
		setJavascriptEnabled(true);
	}

	@Override
	public void quit() {
		super.quit();
		for (final String alert : collectedAlerts) {
			System.err.println("ALERT: " + alert);
		}
	}

}
