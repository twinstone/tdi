module( 'TDI.Ajax UI' );
	asyncTest( 'TDI.Ajax UI: Automatic TDI using elements found by CSS selectors', function() {
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
				'a.tdi'
			],
			[
				function() { $( '#tdi-link-data-ajax-url' ).click(); },
				'a.tdi with data-ajax-url'
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
				'form.tdi'
			],
			[
				function() { $( '#tdi-form-data-ajax-url' ).submit(); },
				'form.tdi width data-ajax-url'
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
				'select.tdi'
			],
			[
				function() { $( '#tdi-select-data-ajax-url' ).change(); },
				'select.tdi with data-ajax-url'
			],
			[
				function() { $( '#tdi-checkbox' ).change(); },
				'input[type=checkbox].tdi'
			],
			[
				function() { $( '#tdi-checkbox-data-ajax-url' ).change(); },
				'input[type=checkbox].tdi with data-ajax-url'
			],
			[
				function() { $( '#tdi-radio' ).change(); },
				'input[type=radio].tdi'
			],
			[
				function() { $( '#tdi-radio-data-ajax-url' ).change(); },
				'input[type=radio].tdi with data-ajax-url'
			]
		];
		
		var num = 0;
		$(document).bind( 'tdi:ajax:done', function( evt, data ) {
			num++;
		} );
		
		for ( var i = 0, l = handlers.length; i < l; i++ ) {
			handlers[i][0]();
		}
		
		setTimeout( function() {
			equals( num, handlers.length, 'There should be exactly '+ handlers.length +' requests.' );
			start();
		}, 2000 );
	} );
	
	test( 'TDI.Ajax UI: Sending the name and value of the submit button in a hidden field', function() {
		$( '#submit1' ).click();
		equals( $( '#button-form1 .submit-action' ).val(), 'submit1-value', 'After the first button, there should be a hidden field with value="submit1-value"' );
		$( '#submit2' ).click();
		equals( $( '#button-form1 .submit-action' ).val(), 'submit2-value', 'After the first button, there should be a hidden field with value="submit2-value"' );
		$( '#submit3' ).click();
		equals( $( '#button-form2 .submit-action' ).val(), 'submit3-value', 'After the first button, there should be a hidden field with value="submit3-value"' );
		$( '#submit4' ).click();
		equals( $( '#button-form2 .submit-action' ).val(), 'submit4-value', 'After the first button, there should be a hidden field with value="submit4-value"' );
	} );
	
	asyncTest( 'TDI.Ajax UI: send the name=value of TDI enabled field', function() {
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
					equals( settings.url, url, 'The name and value of ' + tag + '.' + cls + ' is appended to the AJAX url.' );
					var next = elms.shift();
					if ( next ) {
						s( next );
					}
					else {
						start();
					}
				}
			} );
		}
	} );
	
