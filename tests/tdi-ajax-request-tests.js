module( 'TDI.Ajax.Request' );
	
	test( 'TDI.Ajax.Request.ajaxifyUrl', function() {
		expect(8);
		
		var urls = [
			[ 'http://example.com', 'http://example.com?_infuse=1' ],
			[ 'http://example.com#hash', 'http://example.com?_infuse=1#hash' ],
			[ 'http://example.com?#hash', 'http://example.com?_infuse=1#hash' ],
			[ 'http://example.com?param=value', 'http://example.com?_infuse=1&param=value' ],
			[ 'http://example.com?param1=value1&param2=value2', 'http://example.com?_infuse=1&param1=value1&param2=value2' ],
			[ 'http://example.com?param1=value1#hash', 'http://example.com?_infuse=1&param1=value1#hash' ],
			[ 'http://example.com?param1=value1&param2=value2#hash', 'http://example.com?_infuse=1&param1=value1&param2=value2#hash' ],
			[ '#hash', '?_infuse=1#hash' ]
		];
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[0][0] ).replace(/&_ts=\d+/, ""), urls[0][1].replace(/&_ts=\d+/, ""), 'URL without parameters and a hash.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[1][0] ).replace(/&_ts=\d+/, ""), urls[1][1].replace(/&_ts=\d+/, ""), 'URL with a hash.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[2][0] ).replace(/&_ts=\d+/, ""), urls[2][1].replace(/&_ts=\d+/, ""), 'URL with queryString sign and a hash.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[3][0] ).replace(/&_ts=\d+/, ""), urls[3][1].replace(/&_ts=\d+/, ""), 'URL with 1 parameter.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[4][0] ).replace(/&_ts=\d+/, ""), urls[4][1].replace(/&_ts=\d+/, ""), 'URL with multiple parameters.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[5][0] ).replace(/&_ts=\d+/, ""), urls[5][1].replace(/&_ts=\d+/, ""), 'URL with 1 parameter and a hash.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[6][0] ).replace(/&_ts=\d+/, ""), urls[6][1].replace(/&_ts=\d+/, ""), 'URL with multiple parameters and a hash.' );
		equals( TDI.Ajax.Request.ajaxifyUrl( urls[7][0] ).replace(/&_ts=\d+/, ""), urls[7][1].replace(/&_ts=\d+/, ""), 'URL with multiple parameters and a hash.' );
	} );
	
	asyncTest( 'TDI.Ajax.Request.send: beforeStart/start/beforeEnd/end callbacks', function() {
		expect(4);
		
		TDI.Ajax.Request.send( 'responses/empty.xml', {
			beforeStart : function() {
				ok( true, '#send: beforeStart callback executed.' );
			},
			start : function() {
				ok( true, '#send: start callback executed.' );
			},
			beforeEnd : function() {
				ok( true, '#send: beforeEnd callback executed.' );
			},
			end : function() {
				ok( true, '#send: end callback executed.' );
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.Request.send: prevent start', function() {
		expect(0);
		
		TDI.Ajax.Request.send( 'responses/empty.xml', {
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
	
	asyncTest( 'TDI.Ajax.Request.send: prevent end', function() {
		expect(0);
		
		TDI.Ajax.Request.send( 'responses/empty.xml', {
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
	asyncTest( 'TDI.Ajax.Request.send: default options', function() {
		expect(3);
		
		TDI.Ajax.Request.send( 'responses/empty.xml', {
			beforeStart : function( xhr, settings, options ) {
				equals( settings.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl( 'responses/empty.xml' ).replace(/&_ts=\d+/, ""), 'The URL of the AJAX request is correct.' );
				equals( settings.type, 'GET', 'The default method is GET.' );
				equals( settings.data, '', 'The default data is empty.' );
				
				start();
				return false;
			}
		} );
	} );
	asyncTest( 'TDI.Ajax.Request.send: options set', function() {
		expect(3);
		
		TDI.Ajax.Request.send( 'responses/empty.xml', {
			method : 'POST',
			data : 'param1=value1&param2=value2',
			beforeStart : function( xhr, settings, options ) {
				equals( settings.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl( 'responses/empty.xml' ).replace(/&_ts=\d+/, ""), 'The URL of the AJAX request is correct.' );
				equals( settings.type, 'POST', 'The default method is GET.' );
				equals( settings.data, 'param1=value1&param2=value2', 'The default data is empty.' );
				
				start();
				return false;
			}
		} );
	} );
	asyncTest( 'TDI.Ajax.Request.send: xhrFields', function() {
		expect(1);
		
		TDI.Ajax.Request.send( 'responses/empty.xml', {
			xhrFields : {
				withCredentials : true
			},
			beforeStart : function( xhr, settings, options ) {
				equals( settings.xhrFields.withCredentials, true, 'The withCredentials xhrField is set' );
				
				start();
				return false;
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.Request.sendForm: beforeStart/start/beforeEnd/end callbacks', function() {
		expect(4);
		
		var $form = $( '#tdi-ajax-send-form-action' );
		
		TDI.Ajax.Request.sendForm( $form, {
			beforeStart : function() {
				ok( true, 'sendForm: beforeStart callback executed.' );
			},
			start : function() {
				ok( true, 'sendForm: start callback executed.' );
			},
			beforeEnd : function() {
				ok( true, 'sendForm: beforeEnd callback executed.' );
			},
			end : function() {
				ok( true, 'sendForm: end callback executed.' );
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.Request.sendForm: prevent start', function() {
		expect(1);
		
		var $form = $( '#tdi-ajax-send-form-action' );
		
		TDI.Ajax.Request.sendForm( $form, {
			beforeStart : function() {
				return false;
			},
			end : function() {
				ok( false, 'The form should not be sent, it should be prevented.' );
				start();
			}
		} );
		
		setTimeout( function() {
			ok( true, 'The form start was prevented.' );
			start();
		}, 1000 );
	} );
	
	asyncTest( 'TDI.Ajax.Request.sendForm: prevent end', function() {
		expect(1);
		
		var $form = $( '#tdi-ajax-send-form-action' );
		
		TDI.Ajax.Request.sendForm( $form, {
			beforeEnd : function() {
				return false;
			},
			end : function() {
				ok( false, 'The `end` callback should not be called, it should be prevented.' );
				start();
			}
		} );
		
		setTimeout( function() {
			ok( true, 'The form end was prevented.' );
			start();
		}, 1000 );
	} );
	
	asyncTest( 'TDI.Ajax.send', function() {
		expect(1);
		
		var $form = $( '#tdi-ajax-send-form-action' );
		TDI.Ajax.send( $form, {
			end : function(xhr, textStatus, options) {
				equals( options.method, 'get', 'The form method should be GET.' );
				
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.Request.sendForm: file field', function() {
		expect(2);
		
		var $form = $( '#tdi-ajax-send-form-with-file' );
		
		TDI.Ajax.Request.sendForm( $form, {
			end : function() {
				equals( $form.attr( 'method' ), 'post', 'The form method should be POST.' );
				equals( $form.attr( 'enctype' ), 'multipart/form-data', 'The form enctype should be set to multipart.' );
				
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.send - form with forced method', function() {
		expect(1);
		
		var $form = $( '#tdi-ajax-send-form-action-forced-method' );
		TDI.Ajax.send( $form, {
			end : function(xhr, textStatus, options) {
				equals( options.method, 'post', 'The form method should be POST.' );
				
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Ajax.Request.sendForm: file field; ignore forced method', function() {
		expect(2);
		
		var $form = $( '#tdi-ajax-send-form-with-file-forced-method' );
		
		TDI.Ajax.Request.sendForm( $form, {
			end : function() {
				equals( $form.attr( 'method' ), 'post', 'The form method should be still POST.' );
				equals( $form.attr( 'enctype' ), 'multipart/form-data', 'The form enctype should be set to multipart.' );
				
				start();
			}
		} );
	} );
		
	asyncTest( 'TDI.Ajax.Request.send: with method', function() {
		expect(1);
		
		var $link = $( '#tdi-ajax-send-with-method' );
		
		TDI.Ajax.send( $link, {
			end : function(xhr, textStatus, options) {
				equals( options.method.toLowerCase(), 'post', 'The request method should be POST.' );
				
				start();
			}
		} );
	} );
	