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
				var url = TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-href' ).attr( 'href' ));
				equals( settings.url.replace(/&_ts=\d+/, ""), url.replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `href` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Link/Data-ajax-url', function() {
		expect(1);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-ajax-url' ), {
			beforeStart : function( xhr, settings, options ) {
				var url = TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-ajax-url' ).data( 'ajax-url' ));
				equals( settings.url.replace(/&_ts=\d+/, ""), url.replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `data-ajax-url` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: xhrFields', function() {
		expect(2);
		
		TDI.Ajax.send( $( '#tdi-ajax-xhrFields' ), {
			beforeStart : function( xhr, settings, options ) {
				equals( options.xhrFields.withCredentials, true, 'The option xhrField withCredentials' );
				equals( settings.xhrFields.withCredentials, true, 'The xhrField withCredentials' );
				
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
			beforeStart : function( xhr, textStatus, options ) {
				equals( options.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-action' ).attr( 'action' )).replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `action` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Form/Data-ajax-url', function() {
		expect(1);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-form-ajax-url' ), {
			beforeStart : function( xhr, textStatus, options ) {
				equals( options.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-ajax-url' ).data( 'ajax-url' )).replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `data-ajax-url` attribute.' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send: Form/Files', function() {
		expect(0);
		
		TDI.Ajax.send( $( '#tdi-ajax-send-form-action-file' ), {
			beforeStart : function( $form, options, xml ) {
				equals( options.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-ajax-url' ).data( 'ajax-url' )).replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `action` attribute.' );

				start();
				return false;
			}
		} );
		
		setTimeout( function() {
			start();
		}, 1000 );
	} );

	asyncTest( 'TDI.Ajax.send: Form/Disabled', function() {
		expect(0);

		TDI.Ajax.send( $( '#tdi-ajax-send-form-disabled' ), {
			end : function( xhr, textStatus, options ) {
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

	test( 'TDI.Ajax.send: async option/default', function() {
		expect(2);

		var _ajax = $.ajax;
		$.ajax = function(conf) {
			ok(conf.async, "Has a `async` option");
			equals(conf.async, true, "Has the `async` option, defaults to true");
		};
		TDI.Ajax.Request.send("url");

		$.ajax = _ajax;
	} );


	test( 'TDI.Ajax.send: async option/custom', function() {
		expect(2);

		var _ajax = $.ajax;
		$.ajax = function(conf) {
			equals(conf.async, false, "Has the `async` option set to a custom value");
		};
		TDI.Ajax.Request.send("url", {
			sync : true
		});
		TDI.Ajax.Request.send("url", {
			sync : "lorem"
		});

		$.ajax = _ajax;
	} );