package org.twinstone.tdi;

import java.io.File;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.URI;
import java.net.URISyntaxException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.junit.AfterClass;

import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Function;

import static org.junit.Assert.*;

public class BrowserPages {

	protected WebDriver driver;
	
	private static int port;
	private static Server server;

	@BeforeClass
	public static void runJetty() throws Exception {
		String path = ".";
		File f = new File("tests");
		if (!f.exists()) {
			path = "..";
			f = new File("../tests");
			if (!f.exists()) throw new Exception("Test path not found"); 
		}
		ServerSocket localmachine = new ServerSocket(0);
		port = localmachine.getLocalPort();
		localmachine.close();
		server = new Server(port);
		ResourceHandler res = new ResourceHandler() {

			@Override
			public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
				if (baseRequest.getMethod().toUpperCase().equals("POST")) baseRequest.setMethod("GET");
				super.handle(target, baseRequest, request, response);
			}
			
		};
		res.setDirectoriesListed(true);
		res.setResourceBase(path);
		HandlerList hl = new HandlerList();
		hl.setHandlers(new Handler[]{res,new DefaultHandler()});
		server.setHandler(hl);
		server.start();
	}
	
	protected URI makeUri(String name) throws URISyntaxException {
		return new URI("http", null, "localhost", port, "/tests/"+name, null, null);
	}
	
	protected void testPage(String name) throws URISyntaxException {
		String url = makeUri(name).toString();
		driver.get(url);
		WebDriverWait waitForResult = new WebDriverWait(driver, 15);
        WebElement resultElm = waitForResult.until(new Function<WebDriver, WebElement>() {
            @Override
            public WebElement apply(WebDriver driver) {
                WebElement elm = driver.findElement(By.id("qunit-testresult"));
                if (elm != null && !elm.getText().contains("Running")) {
                    return elm;
                }
				return null;
            }
        });
        // System.out.println(driver.getPageSource());
        assertTrue("There are failed qunit tests", resultElm.getText().contains("0 failed"));
	}
	
	@Test
	public void ajax() throws URISyntaxException {
		testPage("tdi-ajax.html");
	}

	@Test
	public void tools() throws URISyntaxException {
		testPage("tdi-tools.html");
	}

	@Test
	public void ajaxUi() throws URISyntaxException {
		testPage("tdi-ajax-ui.html");
	}
	
	@Test
	public void ajaxRequest() throws URISyntaxException {
		testPage("tdi-ajax-request.html");
	}
	
	@Test
	public void ajaxResponseError() throws URISyntaxException {
		testPage("tdi-ajax-response-error.html");
	}

	@Test
	public void ajaxResponseEventsPrevent() throws URISyntaxException {
		testPage("tdi-ajax-response-events-prevent.html");
	}

	@Test
	public void ajaxResponseEvents() throws URISyntaxException {
		testPage("tdi-ajax-response-events.html");
	}

	@Test
	public void ajaxResponseResponses() throws URISyntaxException {
		testPage("tdi-ajax-response-responses.html");
	}
	
	@AfterClass
	public static void stopJetty() throws Exception {
		server.stop();
		server.join();
	}
	
	@After
	public void quitDriver() {
		if (driver!=null) driver.quit();
	}

}
