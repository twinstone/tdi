module( 'TDI.Ajax.Response' );
	asyncTest( 'TDI.Ajax.Response: events and XML', function() {
		expect(22);
		
		// bind the events
			$(document)
				.bind( 'tdi:ajax:beforeFormSubmit', function() {
					ok( true, 'tdi:ajax:beforeFormSubmit triggered.' );
				} )
				.bind( 'tdi:ajax:beforeUpdate', function() {
					ok( true, 'tdi:ajax:beforeUpdate triggered.' );
				} )
				.bind( 'tdi:ajax:beforeInsert', function() {
					ok( true, 'tdi:ajax:beforeInsert triggered.' );
				} )
				.bind( 'tdi:ajax:beforeStyle', function() {
					ok( true, 'tdi:ajax:beforeScript triggered.' );
				} )
				.bind( 'tdi:ajax:beforeScript', function() {
					ok( true, 'tdi:ajax:beforeScript triggered.' );
				} )
				.bind( 'tdi:ajax:beforePopup', function() {
					ok( true, 'tdi:ajax:beforePopup triggered.' );
				} )
				.bind( 'tdi:ajax:beforeReload', function() {
					ok( true, 'tdi:ajax:beforeReload triggered.' );
					return false;
				} )
				.bind( 'tdi:ajax:beforeRedirect', function() {
					ok( true, 'tdi:ajax:beforeRedirect triggered.' );
					return false;
				} )
				.bind( 'tdi:ajax:beforeMessage', function() {
					ok( true, 'tdi:ajax:beforeMessage triggered.' );
				} )
				.bind( 'tdi:ajax:update', function() {
					ok( true, 'tdi:ajax:update triggered.' );
				} )
				.bind( 'tdi:ajax:insert', function() {
					ok( true, 'tdi:ajax:insert triggered.' );
				} )
				.bind( 'tdi:ajax:script', function() {
					ok( true, 'tdi:ajax:script triggered.' );
				} )
				.bind( 'tdi:ajax:style', function() {
					ok( true, 'tdi:ajax:style triggered.' );
				} )
				.bind( 'tdi:ajax:popup', function( evt, data ) {
					ok( true, 'tdi:ajax:popup triggered.' );
					if ( data.popup ) {
						data.popup.close();
					}
				} )
				.bind( 'tdi:ajax:message', function() {
					ok( true, 'tdi:ajax:message triggered.' );
				} )
				.bind( 'tdi:ajax:updatesDone', function() {
					ok( true, 'tdi:ajax:updatesDone triggered.' );
				} )
				.bind( 'tdi:ajax:insertsDone', function() {
					ok( true, 'tdi:ajax:insertsDone triggered.' );
				} )
				.bind( 'tdi:ajax:scriptsDone', function() {
					ok( true, 'tdi:ajax:scriptsDone triggered.' );
				} )
				.bind( 'tdi:ajax:stylesDone', function() {
					ok( true, 'tdi:ajax:stylesDone triggered.' );
				} )
				.bind( 'tdi:ajax:popupsDone', function() {
					ok( true, 'tdi:ajax:popupsDone triggered.' );
				} )
				.bind( 'tdi:ajax:messagesDone', function() {
					ok( true, 'tdi:ajax:messagesDone triggered.' );
				} )
				.bind( 'tdi:ajax:done', function() {
					ok( true, 'tdi:ajax:done triggered.' );
					
					start();
				} );
				
		// send the form
			$( '#tdi-ajax-send-form' ).submit();
	} );
	