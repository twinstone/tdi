module( 'TDI.Tools' );
	asyncTest( 'TDI.Tools.getScript', function() {
		expect(5);
		
		var scriptId = 'test-script',
			scriptSrc = 'assets/script.js';
			
		TDI.Tools.getScript( scriptSrc, {
			id : scriptId,
			complete : function( scriptTag ) {
				ok( true, 'getScript() complete callback called.' );
				ok( scriptTag, 'Script tag is created.' );
				equals( scriptTag, document.getElementById( scriptId ), 'The script tag returned in callback is the same as the one created in DOM.' );
				equals( scriptTag.getAttribute( 'id' ), scriptId, 'The script tags ID attribute is set correctly.' );
				equals( scriptTag.getAttribute( 'src' ), scriptSrc, 'The script tags SRC attribute is set correctly.' );
				
				start();
			}
		} );
	} );
	
	asyncTest( 'TDI.Tools.getStyle', function() {
		expect(5);
		
		var styleId = 'test-style',
			styleHref = 'assets/style.css';
			
		TDI.Tools.getStyle( styleHref, {
			id : styleId,
			complete : function( styleTag ) {
				ok( true, 'getStyle() complete callback called.' );
				ok( styleTag, 'Style tag is created.' );
				equals( styleTag, document.getElementById( styleId ), 'The style tag returned in callback is the same as the one created in DOM.' );
				equals( styleTag.getAttribute( 'id' ), styleId, 'The style tags ID attribute is set correctly.' );
				equals( styleTag.getAttribute( 'href' ), styleHref, 'The style tags HREF attribute is set correctly.' );
				
				start();
			}
		} );
	} );
	