QUnit.module( 'TDI.Tools' );

QUnit.test( "TDI.Tools.getScript", function( assert ) {
	assert.expect(5);

	var done = assert.async();
	var scriptId = 'test-script';
	var scriptSrc = 'assets/script.js';

	TDI.Tools.getScript( scriptSrc, {
		id : scriptId,
		complete : function( scriptTag ) {
			assert.ok( true, 'getScript() complete callback called.' );
			assert.ok( scriptTag, 'Script tag is created.' );
			assert.equal( scriptTag, document.getElementById( scriptId ), 'The script tag returned in callback is the same as the one created in DOM.' );
			assert.equal( scriptTag.getAttribute( 'id' ), scriptId, 'The script tags ID attribute is set correctly.' );
			assert.equal( scriptTag.getAttribute( 'src' ), scriptSrc, 'The script tags SRC attribute is set correctly.' );

			done();
		}
	} );
});

QUnit.test( "TDI.Tools.getStyle", function( assert ) {
	assert.expect(5);

	var done = assert.async();
	var styleId = 'test-style',
		styleHref = 'assets/style.css';

	TDI.Tools.getStyle( styleHref, {
		id : styleId,
		complete : function( styleTag ) {
			assert.ok( true, 'getStyle() complete callback called.' );
			assert.ok( styleTag, 'Style tag is created.' );
			assert.equal( styleTag, document.getElementById( styleId ), 'The style tag returned in callback is the same as the one created in DOM.' );
			assert.equal( styleTag.getAttribute( 'id' ), styleId, 'The style tags ID attribute is set correctly.' );
			assert.equal( styleTag.getAttribute( 'href' ), styleHref, 'The style tags HREF attribute is set correctly.' );

			done();
		}
	} );
});
