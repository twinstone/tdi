module( 'TDI.Ajax.Response' );
	asyncTest( 'TDI.Ajax.Response: preventable events', function() {
		expect(3);
		
		// bind the events
			$(document)
				.bind( 'tdi:ajax:beforeFormSubmit', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeUpdate', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeInsert', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeStyle', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeScript', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforePopup', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeReload', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeRedirect', function() {
					return false;
				} )
				.bind( 'tdi:ajax:beforeMessage', function() {
					return false;
				} )
				.bind( 'tdi:ajax:update', function() {
					ok( false, 'tdi:ajax:update should not be triggered.' );
				} )
				.bind( 'tdi:ajax:insert', function() {
					ok( false, 'tdi:ajax:insert should not be triggered.' );
				} )
				.bind( 'tdi:ajax:script', function() {
					ok( false, 'tdi:ajax:script should not be triggered.' );
				} )
				.bind( 'tdi:ajax:style', function() {
					ok( false, 'tdi:ajax:style should not be triggered.' );
				} )
				.bind( 'tdi:ajax:popup', function( evt, data ) {
					ok( false, 'tdi:ajax:popup should not be triggered.' );
				} )
				.bind( 'tdi:ajax:message', function( evt, data ) {
					ok( false, 'tdi:ajax:message should not be triggered.' );
				} )
				.bind( 'tdi:ajax:done', function() {
					ok( true, 'Form was not submitted.' );
					ok( true, 'Reload was not triggered.' );
					ok( true, 'Redirect was not triggered.' );
					
					start();
				} );
				
		// send the form
			TDI.Ajax.Request.send( 'responses/full.xml' );
			$( '#tdi-ajax-send-form' ).submit();
	} );
	