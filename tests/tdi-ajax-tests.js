QUnit.module( 'TDI.Ajax' );

QUnit.test( 'TDI.Ajax.send: beforeStart/start/beforeEnd/end callbacks', function( assert ) {
	var done = assert.async();
	assert.expect(4);

	TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
		beforeStart : function() {
			assert.ok( true, '#tdi-ajax-send-href: beforeStart callback executed.' );
		},
		start : function() {
			assert.ok( true, '#tdi-ajax-send-href: start callback executed.' );
		},
		beforeEnd : function() {
			assert.ok( true, '#tdi-ajax-send-href: beforeEnd callback executed.' );
		},
		end : function() {
			assert.ok( true, '#tdi-ajax-send-href: end callback executed.' );
			done();
		}
	} );
} );
	
QUnit.test( 'TDI.Ajax.send: Link/Href', function( assert ) {
	var done = assert.async();
	assert.expect(1);

	TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
		beforeStart : function( xhr, settings, options ) {
			var url = TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-href' ).attr( 'href' ));
			assert.equal( settings.url.replace(/&_ts=\d+/, ""), url.replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `href` attribute.' );

			done();
			return false;
		}
	} );
} );

QUnit.test( 'TDI.Ajax.send: Link/Data-ajax-url', function( assert ) {
	var done = assert.async();
	assert.expect(1);

	TDI.Ajax.send( $( '#tdi-ajax-send-ajax-url' ), {
		beforeStart : function( xhr, settings, options ) {
			var url = TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-ajax-url' ).data( 'ajax-url' ));
			assert.equal( settings.url.replace(/&_ts=\d+/, ""), url.replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `data-ajax-url` attribute.' );

			done();
			return false;
		}
	} );
} );
	
QUnit.test( 'TDI.Ajax.send: xhrFields', function( assert ) {
	var done = assert.async();
	assert.expect(2);

	TDI.Ajax.send( $( '#tdi-ajax-xhrFields' ), {
		beforeStart : function( xhr, settings, options ) {
			assert.equal( options.xhrFields.withCredentials, true, 'The option xhrField withCredentials' );
			assert.equal( settings.xhrFields.withCredentials, true, 'The xhrField withCredentials' );

			done();
			return false;
		}
	} );
} );
	
QUnit.test( 'TDI.Ajax.send: Link/Disabled', function( assert ) {
	var done = assert.async();
	assert.expect(0);

	TDI.Ajax.send( $( '#tdi-ajax-send-disabled' ), {
		end : function( xhr, textStatus, options ) {
			assert.ok( false, '#tdi-ajax-send-disabled: Disabled ajax link should not send the AJAX call.' );
			done();
		}
	} );

	setTimeout( function() {
		done();
	}, 1000 );
} );
	
QUnit.test( 'TDI.Ajax.send: Form/Action', function( assert ) {
	var done = assert.async();
	assert.expect(1);

	TDI.Ajax.send( $( '#tdi-ajax-send-form-action' ), {
		beforeStart : function( xhr, textStatus, options ) {
			assert.equal( options.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-action' ).attr( 'action' )).replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `action` attribute.' );

			done();
			return false;
		}
	} );
} );
	
QUnit.test( 'TDI.Ajax.send: Form/Data-ajax-url', function( assert ) {
	var done = assert.async();
	assert.expect(1);

	TDI.Ajax.send( $( '#tdi-ajax-send-form-ajax-url' ), {
		beforeStart : function( xhr, textStatus, options ) {
			assert.equal( options.url.replace(/&_ts=\d+/, ""), TDI.Ajax.Request.ajaxifyUrl($( '#tdi-ajax-send-form-ajax-url' ).data( 'ajax-url' )).replace(/&_ts=\d+/, ""), 'The AJAX url is the same as the `data-ajax-url` attribute.' );

			done();
			return false;
		}
	} );
} );
	
QUnit.test( 'TDI.Ajax.send: Form/Disabled', function( assert ) {
	var done = assert.async();
	assert.expect(0);

	TDI.Ajax.send( $( '#tdi-ajax-send-form-disabled' ), {
		end : function( xhr, textStatus, options ) {
			assert.ok( false, '#tdi-ajax-send-form-disabled: Disabled form should not send the AJAX call.' );
			done();
		}
	} );

	setTimeout( function() {
		done();
	}, 1000 );
} );

QUnit.test( 'TDI.Ajax.send: setting/unsetting of the class names', function( assert ) {
	var done = assert.async();
	assert.expect(8);

	var lnk = $( '#tdi-ajax-send-classes' ),
		relatedAncestor = $( '#related-ancestor' ),
		relatedElement = $( '#related-element' ),
		rel = $( '#deprecated-related-element' );

	TDI.Ajax.send( lnk, {
		start : function() {
			assert.ok( lnk.hasClass( 'loading' ), 'The element has the `loading` class name.' );
			assert.ok( relatedAncestor.hasClass( 'loading-target' ), 'The related ancestor element has the `loading-target` class name.' );
			assert.ok( relatedElement.hasClass( 'loading-target' ), 'The related element has the `loading-target` class name.' );
			assert.ok( rel.hasClass( 'loading-target' ), 'The deprecated related ancestor element has the `loading-target` class name.' );
		},
		end : function() {
			assert.ok( !lnk.hasClass( 'loading' ), 'The element does not have the `loading` class name.' );
			assert.ok( !relatedAncestor.hasClass( 'loading-target' ), 'The related ancestor element does not have the `loading` class name.' );
			assert.ok( !relatedElement.hasClass( 'loading-target' ), 'The related element does not have the `loading` class name.' );
			assert.ok( !rel.hasClass( 'loading-target' ), 'The deprecated related ancestor element does not have the `loading` class name.' );

			done();
		}
	} );
} );
	
QUnit.test( 'TDI.Ajax.send: Prevent start (sending)', function( assert ) {
	var done = assert.async();
	assert.expect(0);

	TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
		beforeStart : function() {
			return false;
		},
		end : function() {
			assert.ok( false, 'The AJAX request should not be called, it should be prevented.' );
			done();
		}
	} );

	setTimeout( function() {
		done();
	}, 1000 );
} );
	
QUnit.test( 'TDI.Ajax.send: Prevent end', function( assert ) {
	var done = assert.async();
	assert.expect(0);

	TDI.Ajax.send( $( '#tdi-ajax-send-href' ), {
		beforeEnd : function() {
			return false;
		},
		end : function() {
			assert.ok( false, 'The `end` callback should not be called, it should be prevented.' );
			done();
		}
	} );

	setTimeout( function() {
		done();
	}, 1000 );
} );

QUnit.test( 'TDI.Ajax.send: async option/default', function( assert ) {
	assert.expect(2);

	var _ajax = $.ajax;
	$.ajax = function(conf) {
		assert.ok(conf.async, "Has a `async` option");
		assert.equal(conf.async, true, "Has the `async` option, defaults to true");
	};
	TDI.Ajax.Request.send("url");

	$.ajax = _ajax;
} );

QUnit.test( 'TDI.Ajax.send: async option/custom', function( assert ) {
	assert.expect(2);

	var _ajax = $.ajax;
	$.ajax = function(conf) {
		assert.equal(conf.async, false, "Has the `async` option set to a custom value");
	};
	TDI.Ajax.Request.send("url", {
		sync : true
	});
	TDI.Ajax.Request.send("url", {
		sync : "lorem"
	});

	$.ajax = _ajax;
} );