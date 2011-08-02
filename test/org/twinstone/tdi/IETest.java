package org.twinstone.tdi;


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
import org.junit.Assume;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class IETest extends BrowserPages {

		private static int port;
	private static Server server;
	
	@BeforeClass
	public static void runJetty() throws Exception {
		ServerSocket localmachine = new ServerSocket(0);
		port = localmachine.getLocalPort();
		localmachine.close();
		server = new Server(port);
		ResourceHandler res = new ResourceHandler() {

			@Override
			public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
				if (baseRequest.getMethod().toLowerCase().equals("POST")) baseRequest.setMethod("GET");
				super.handle(target, baseRequest, request, response);
			}
			
		};
		res.setDirectoriesListed(true);
		res.setResourceBase(".");
		HandlerList hl = new HandlerList();
		hl.setHandlers(new Handler[]{res,new DefaultHandler()});
		server.setHandler(hl);
		server.start();
	}
		
	@AfterClass
	public static void stopJetty() throws Exception {
		server.stop();
		server.join();
	}
	
	protected URI makeUri(String name) throws URISyntaxException {
		return new URI("http", null, "localhost", port, "/tests/"+name, null, null);
	}

	@Before
	public void initDriver() {
		String os = (String) System.getProperties().get("os.name");
		Assume.assumeTrue(os.toLowerCase().indexOf("windows")>=0);
		DesiredCapabilities capabilities = DesiredCapabilities.internetExplorer();
		capabilities.setCapability(InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, true);
		driver = new InternetExplorerDriver(capabilities);
	}
	
	
}
