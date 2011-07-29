module( 'TDI.Ajax' );
	asyncTest( 'TDI.Ajax.send: beforeStart/start/beforeEnd/end callbacks', function() {
		expect(4);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
			beforeStart : function() {
				ok( true, '#tdi-ajax-send-href: beforeStart callback executed.' );
			},
			start : function() {
				ok( true, '#tdi-ajax-send-href: start callback executed.' );
			},
			beforeEnd : function() {
				ok( true, '#tdi-ajax-send-href: beforeEnd callback executed.' );
			},
			end : function() {
				ok( true, '#tdi-ajax-send-href: end callback executed.' );
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Link/Href', function() {
		expect(1);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
			beforeStart : function( xhr, settings, options ) {
				equals( settings.url, TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-href' ).attr( 'href' )), 'The AJAX url is the same as the `href` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Link/Data-ajax-url', function() {
		expect(1);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-ajax-url' ), {
			beforeStart : function( xhr, settings, options ) {
				equals( settings.url, TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-ajax-url' ).data( 'ajax-url' )), 'The AJAX url is the same as the `data-ajax-url` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Link/Disabled', function() {
		expect(0);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-disabled' ), {
			end : function( xhr, textStatus, options ) {
				ok( false, '#tdi-ajax-send-disabled: Disabled ajax link should not send the AJAX call.' );
				start();
			}
		} );
		
		setTimeout( function() {
			start();
		}, 1000 );
	} );
	
	asyncTest( 'TDI.Ajax.send: Form/Action', function() {
		expect(1);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-form-action' ), {
			beforeStart : function( $form, options ) {
				equals( options.url, TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-action' ).attr( 'action' )), 'The AJAX url is the same as the `action` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Form/Data-ajax-url', function() {
		expect(1);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-form-ajax-url' ), {
			beforeStart : function( $form, options ) {
				equals( options.url, TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-ajax-url' ).data( 'ajax-url' )), 'The AJAX url is the same as the `data-ajax-url` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Form/Disabled', function() {
		expect(0);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-form-disabled' ), {
			end : function( $form, options, xml ) {
				ok( false, '#tdi-ajax-send-form-disabled: Disabled form should not send the AJAX call.' );
				start();
			}
		} );
		
		setTimeout( function() {
			start();
		}, 1000 );
	} );
	
	asyncTest( 'TDI.Ajax.send: setting/unsetting of the class names', function() {
		expect(8);
		
		var lnk = $( '#tdi-ajax-send-classes' ),
			relatedAncestor = $( '#related-ancestor' ),
			relatedElement = $( '#related-element' ),
			rel = $( '#deprecated-related-element' );
			
		TDI.Ajax.send( lnk, {
			start : function() {
				ok( lnk.hasClass( 'loading' ), 'The element has the `loading` class name.' );
				ok( relatedAncestor.hasClass( 'loading-target' ), 'The related ancestor element has the `loading-target` class name.' );
				ok( relatedElement.hasClass( 'loading-target' ), 'The related element has the `loading-target` class name.' );
				ok( rel.hasClass( 'loading-target' ), 'The deprecated related ancestor element has the `loading-target` class name.' );
			},
			end : function() {
				ok( !lnk.hasClass( 'loading' ), 'The element does not have the `loading` class name.' );
				ok( !relatedAncestor.hasClass( 'loading-target' ), 'The related ancestor element does not have the `loading` class name.' );
				ok( !relatedElement.hasClass( 'loading-target' ), 'The related element does not have the `loading` class name.' );
				ok( !rel.hasClass( 'loading-target' ), 'The deprecated related ancestor element does not have the `loading` class name.' );
				
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Prevent start (sending)', function() {
		expect(0);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
			beforeStart : function() {
				return false;
			},
			end : function() {
				ok( false, 'The AJAX request should not be called, it should be prevented.' );
				start();
			}
		} );
		
		setTimeout( function() {
			start();
		}, 1000 );
	} );
	
	asyncTest( 'TDI.Ajax.send: Prevent end', function() {
		expect(0);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
			beforeEnd : function() {
				return false;
			},
			end : function() {
				ok( false, 'The `end` callback should not be called, it should be prevented.' );
				start();
			}
		} );
		
		setTimeout( function() {
			start();
		}, 1000 );
	} );
	