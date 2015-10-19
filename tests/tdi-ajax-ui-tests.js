QUnit.module( 'TDI.Ajax UI' );

QUnit.test( 'TDI.Ajax UI: Sending the name and value of the submit button in a hidden field', function( assert ) {
	$( '#submit1' ).click();
	assert.equal( $( '#button-form1 .submit-action' ).val(), 'submit1-value', 'After the first button, there should be a hidden field with value="submit1-value"' );
	$( '#submit2' ).click();
	assert.equal( $( '#button-form1 .submit-action' ).val(), 'submit2-value', 'After the first button, there should be a hidden field with value="submit2-value"' );
	$( '#submit3' ).click();
	assert.equal( $( '#button-form2 .submit-action' ).val(), 'submit3-value', 'After the first button, there should be a hidden field with value="submit3-value"' );
	$( '#submit4' ).click();
	assert.equal( $( '#button-form2 .submit-action' ).val(), 'submit4-value', 'After the first button, there should be a hidden field with value="submit4-value"' );
} );
	
QUnit.test( 'TDI.Ajax UI: send the name=value of TDI enabled field', function( assert ) {
	var done = assert.async();
	var elms = [
		$('#ajaxselect-data-ajax-url'),
		$('#tdi-select-data-ajax-url'),
		$('#tdi-checkbox-data-ajax-url'),
		$('#tdi-radio-data-ajax-url')
	];

	s( elms.shift() );

	function s( elm ) {
		var name = elm.attr( 'name' ),
			value = elm.val(),
			url = TDI.Ajax.Request.ajaxifyUrl( elm.data( 'ajax-url' ) ) + '&' + name + '=' + value,
			tag = elm.attr( 'tagName' ),
			cls = elm.attr( 'className' );

		TDI.Ajax.send( elm, {
			beforeStart : function( xhr, settings, options ) {
				assert.equal( settings.url.replace(/&_ts=\d+/, ""), url.replace(/&_ts=\d+/, ""), 'The name and value of ' + tag + '.' + cls + ' is appended to the AJAX url.' );
				var next = elms.shift();
				if ( next ) {
					s( next );
				}
				else {
					done();
				}
				return false;
			}
		} );
	}
} );

QUnit.test( 'TDI.Ajax UI: Automatic TDI using elements found by CSS selectors', function( assert ) {
	var done = assert.async();

	var handlers = [
		[
			function() { $( '#ajaxlink' ).click(); },
			'a.ajaxlink'
		],
		[
			function() { $( '#ajaxlink-data-ajax-url' ).click(); },
			'a.ajaxlink with data-ajax-url'
		],
		[
			function() { $( '#tdi-link' ).click(); },
			'a.infuse'
		],
		[
			function() { $( '#tdi-link-data-ajax-url' ).click(); },
			'a.infuse with data-ajax-url'
		],
		[
			function() { $( '#ajaxform' ).submit(); },
			'form.ajaxform'
		],
		[
			function() { $( '#ajaxform-data-ajax-url' ).submit(); },
			'form.ajaxform with data-ajax-url'
		],
		[
			function() { $( '#tdi-form' ).submit(); },
			'form.infuse'
		],
		[
			function() { $( '#tdi-form-data-ajax-url' ).submit(); },
			'form.infuse width data-ajax-url'
		],
		[
			function() { $( '#ajaxselect' ).change(); },
			'select.ajaxselect'
		],
		[
			function() { $( '#ajaxselect-data-ajax-url' ).change(); },
			'select.ajaxselect with data-ajax-url'
		],
		[
			function() { $( '#tdi-select' ).change(); },
			'select.infuse'
		],
		[
			function() { $( '#tdi-select-data-ajax-url' ).change(); },
			'select.infuse with data-ajax-url'
		],
		[
			function() { $( '#tdi-checkbox' ).change(); },
			'input[type=checkbox].infuse'
		],
		[
			function() { $( '#tdi-checkbox-data-ajax-url' ).change(); },
			'input[type=checkbox].infuse with data-ajax-url'
		],
		[
			function() { $( '#tdi-radio' ).change(); },
			'input[type=radio].infuse'
		],
		[
			function() { $( '#tdi-radio-data-ajax-url' ).change(); },
			'input[type=radio].infuse with data-ajax-url'
		],
		[
			function() { $( '#tdi-text-data-ajax-url' ).trigger({type:'keydown',keyCode:13}); },
			'input[type=text].infuse with data-ajax-url'
		]
	];

	var num = 0;
	$(document).bind( 'tdi:ajax:start', function( evt, data ) {
		num++;
	} );

	for ( var i = 0, l = handlers.length; i < l; i++ ) {
		handlers[i][0]();
	}

	setTimeout( function() {
		assert.equal( num, handlers.length, 'There should be exactly '+ handlers.length +' requests.' );
		done();
	}, 2000 );
} );
