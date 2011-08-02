module( 'TDI.Ajax.Response' );
	asyncTest( 'TDI.Ajax.Response: events and XML', function() {
		expect(2);
		
		// bind the error event
			$(document)
				.bind( 'tdi:ajax:error', function() {
					ok( true, 'tdi:ajax:error triggered.' );
				} )
				.bind( 'tdi:ajax:end', function() {
					start();
				} );
				
		// send a request to a non-existing document to cause tdi:ajax:error event
			TDI.Ajax.Request.send( 'responses/404.xml' );
		// send a request to a invalid XML document to cause tdi:ajax:error event
			TDI.Ajax.Request.send( 'responses/invalid.xml' );
	} );
	