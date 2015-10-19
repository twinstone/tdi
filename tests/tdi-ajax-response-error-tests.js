QUnit.module( 'TDI.Ajax.Response' );

	QUnit.test( 'TDI.Ajax.Response: events and XML', function( assert ) {
		var done = assert.async();
		assert.expect(2);
		
		// bind the error event
			$(document)
				.bind( 'tdi:ajax:error', function() {
					assert.ok( true, 'tdi:ajax:error triggered.' );
				} );
				
		// send a request to a non-existing document to cause tdi:ajax:error event
			TDI.Ajax.Request.send( 'responses/404.xml' );
		// send a request to a invalid XML document to cause tdi:ajax:error event
			TDI.Ajax.Request.send( 'responses/invalid.xml' );
			
		setTimeout( function() {
			done();
		}, 2000 );
	} );
	