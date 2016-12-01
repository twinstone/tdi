QUnit.module( 'TDI.Ajax.Response' );

QUnit.test( 'TDI.Ajax.Response: events and XML', function( assert ) {
	var done = assert.async();
	assert.expect(179);

	// bind the events
	$(document)
		.bind( 'tdi:ajax:beforeReload', function( evt, data ) {
			return false;
		} )
		.bind( 'tdi:ajax:beforeRedirect', function( evt, data ) {
			assert.equal( data.href, 'http://google.com', 'Redirect: href' );
			return false;
		} )
		.bind( 'tdi:ajax:updatesDone', function( evt, data ) {
			// check the API data
			var u1 = data.updates[0],
				u2 = data.updates[1],
				u3 = data.updates[2],
				u4 = data.updates[3],
				u5 = data.updates[4],
				u6 = data.updates[5],
				u7 = data.updates[6],
				u8 = data.updates[7],
				u9 = data.updates[8],
				u10 = data.updates[9];

			assert.equal( u1.target_id, 'update-default', 'Update1: target_id' );
			assert.equal( u1.target.attr( 'id' ), 'update-default', 'Update1: target' );
			assert.equal( u1.content, 'Update default', 'Update1: content' );

			assert.equal( u2.target_id, 'update-replace', 'Update2: target_id' );
			assert.equal( u2.target.attr( 'id' ), 'update-replace', 'Update2: target' );
			assert.equal( u2.replace, 'true', 'Update2: replace' );
			assert.equal( u2.content, '<div id="update-replaced">Update replace</div>', 'Update2: content' );

			assert.equal( u3.target_id, 'update-append', 'Update3: target_id' );
			assert.equal( u3.target.attr( 'id' ), 'update-append', 'Update3: target' );
			assert.equal( u3.append, 'true', 'Update3: append' );
			assert.equal( u3.content, 'Update append', 'Update3: content' );

			assert.equal( u4.target_id, 'update-prepend', 'Update4: target_id' );
			assert.equal( u4.target.attr( 'id' ), 'update-prepend', 'Update4: target' );
			assert.equal( u4.prepend, 'true', 'Update4: prepend' );
			assert.equal( u4.content, 'Update prepend', 'Update4: content' );

			assert.equal( u5.target_id, 'update-add-class', 'Update5: target_id' );
			assert.equal( u5.target.attr( 'id' ), 'update-add-class', 'Update5: target' );
			assert.equal( u5.class_add, 'cls-add', 'Update5: class add' );
			assert.equal( u5.content, 'Update add class', 'Update5: content' );

			assert.equal( u6.target_id, 'update-remove-class', 'Update6: target_id' );
			assert.equal( u6.target.attr( 'id' ), 'update-remove-class', 'Update6: target' );
			assert.equal( u6.class_remove, 'cls-remove', 'Update6: class remove' );
			assert.equal( u6.content, '', 'Update6: content' );

			assert.equal( u7.selector, '#update-multiple-1, #update-multiple-2, .update-multiple', 'Update7: selector' );
			assert.equal( u7.target.length, 4, 'Update7: targets' );
			assert.equal( u7.class_remove, 'cls-remove', 'Update7: class remove' );
			assert.equal( u7.class_add, 'cls-add', 'Update7: class add' );
			assert.equal( u7.content, 'Update multiple', 'Update7: content' );

			assert.equal( u8.selector, '.update-multiple-replace', 'Update8: selector' );
			assert.equal( u8.target.length, 2, 'Update8: targets' );
			assert.equal( u8.content, '<div class="update-multiple-replaced">Update multiple replace</div>', 'Update8: content' );

			assert.equal( u9.selector, '.update-multiple-append', 'Update9: selector' );
			assert.equal( u9.target.length, 2, 'Update9: targets' );
			assert.equal( u9.content, 'Update append' );

			assert.equal( u10.selector, '.update-multiple-prepend', 'Update10: selector' );
			assert.equal( u10.target.length, 2, 'Update10: targets' );
			assert.equal( u10.content, 'Update prepend' );

			assert.ok(u1.tag instanceof $);
			assert.ok(u2.tag instanceof $);
			assert.ok(u3.tag instanceof $);
			assert.ok(u4.tag instanceof $);
			assert.ok(u5.tag instanceof $);
			assert.ok(u6.tag instanceof $);
			assert.ok(u7.tag instanceof $);
			assert.ok(u8.tag instanceof $);
			assert.ok(u9.tag instanceof $);
			assert.ok(u10.tag instanceof $);

			// check the markup
			assert.equal( $( '#update-default' ).text(), 'Update default', 'The target was updated and has the correct contents.' );
			assert.equal( $( '#update-replace' ).length, 0, 'The target does not exist, it was replaced.' );
			assert.equal( $( '#update-replaced' ).length, 1, 'A new element `update-replace` replaced the former update target.' );
			assert.equal( $( '#update-replaced' ).text(), 'Update replace', 'The new element has the correct contents.' );
			assert.equal( $( '#update-append' ).text(), 'This is the first text.Update append', 'The target was updated and new contents were appended at the end.' );
			assert.equal( $( '#update-prepend' ).text(), 'Update prependThis is the last text.', 'The target was updated and new contents were prepended at the beginning.' );
			assert.ok( $( '#update-add-class' ).hasClass( 'cls-add' ), 'A new class name was added to the target.' );
			assert.equal( $( '#update-add-class' ).text(), 'Update add class' );
			assert.ok( !$( '#update-remove-class' ).hasClass( 'cls-remove' ), 'A class name was removed from the target.' );
			assert.equal( $( '#update-multiple-1' ).text(), 'Update multiple', 'The multiple target 1 was updated and has the correct contents.' );
			assert.equal( $( '#update-multiple-2' ).text(), 'Update multiple', 'The multiple target 2 was updated and has the correct contents.' );
			assert.equal( $( '.update-multiple' ).eq(0).text(), 'Update multiple', 'The multiple target 3 was updated and has the correct contents.' );
			assert.equal( $( '.update-multiple' ).eq(1).text(), 'Update multiple', 'The multiple target 4 was updated and has the correct contents.' );
			assert.ok( $( '#update-multiple-1' ).hasClass( 'cls-add' ), 'A new class name was added to the multiple target 1' );
			assert.ok( $( '#update-multiple-2' ).hasClass( 'cls-add' ), 'A new class name was added to the multiple target 2' );
			assert.ok( $( '.update-multiple' ).eq(0).hasClass( 'cls-add' ), 'A new class name was added to the multiple target 3' );
			assert.ok( $( '.update-multiple' ).eq(1).hasClass( 'cls-add' ), 'A new class name was added to the multiple target 4' );
			assert.ok( !$( '#update-multiple-1' ).hasClass( 'cls-remove' ), 'A class name was removed from the multiple target 1' );
			assert.ok( !$( '#update-multiple-2' ).hasClass( 'cls-remove' ), 'A class name was removed from the multiple target 2' );
			assert.ok( !$( '.update-multiple' ).eq(0).hasClass( 'cls-remove' ), 'A class name was removed from the multiple target 3' );
			assert.ok( !$( '.update-multiple' ).eq(1).hasClass( 'cls-remove' ), 'A class name was removed from the multiple target 4' );
			assert.equal( $( '.update-multiple-replace' ).length, 0, 'The targets do not exist, they were replaced.' );
			assert.equal( $( '.update-multiple-replaced' ).length, 2, 'New elements `update-multiple-replaced` replaced the former update targets.' );
			assert.equal( $( '.update-multiple-replaced' ).eq(0).text(), 'Update multiple replace', 'The new element has the correct contents.' );
			assert.equal( $( '.update-multiple-replaced' ).eq(1).text(), 'Update multiple replace', 'The new element has the correct contents.' );
			assert.equal( $( '#update-multiple-7' ).text(), 'This is the first text.Update append', 'The multiple target was updated and new contents were appended at the end.' );
			assert.equal( $( '#update-multiple-8' ).text(), 'This is the first text.Update append', 'The multiple target was updated and new contents were appended at the end.' );
			assert.equal( $( '#update-multiple-9' ).text(), 'Update prependThis is the last text.', 'The multiple target was updated and new contents were prepended at the beginning.' );
			assert.equal( $( '#update-multiple-10' ).text(), 'Update prependThis is the last text.', 'The multiple target was updated and new contents were prepended at the beginning.' );
		} )
		.bind( 'tdi:ajax:insertsDone', function( evt, data ) {
			// check the API data
			var i1 = data.inserts[0],
				i2 = data.inserts[1],
				i3 = data.inserts[2],
				i4 = data.inserts[3],
				i5 = data.inserts[4],
				i6 = data.inserts[5];

			assert.equal( i1.target_id, 'inserts', 'Insert1: target_id' );
			assert.equal( i1.target.attr( 'id' ), 'inserts', 'Insert1: target' );
			assert.equal( i1.content, '<div id="inserted-after-default">Inserted after (default)</div>', 'Insert1: content' );
			assert.equal( i1.position, 'after', 'Insert1: position' );
			assert.equal( i1.inserted_node.attr( 'id' ), 'inserted-after-default', 'Insert1: inserted node' );

			assert.equal( i2.target_id, 'inserts', 'Insert2: target_id' );
			assert.equal( i2.target.attr( 'id' ), 'inserts', 'Insert2: target' );
			assert.equal( i2.content, '<div id="inserted-after">Inserted after</div>', 'Insert2: content' );
			assert.equal( i2.position, 'after', 'Insert2: position' );
			assert.equal( i2.inserted_node.attr( 'id' ), 'inserted-after', 'Insert2: inserted node' );

			assert.equal( i3.target_id, 'inserts', 'Insert3: target_id' );
			assert.equal( i3.target.attr( 'id' ), 'inserts', 'Insert3: target' );
			assert.equal( i3.content, '<div id="inserted-before">Inserted before</div>', 'Insert3: content' );
			assert.equal( i3.position, 'before', 'Insert3: position' );
			assert.equal( i3.inserted_node.attr( 'id' ), 'inserted-before', 'Insert3: inserted node' );

			assert.equal( i4.selector, '.inserts-multiple-default', 'Insert4: selector' );
			assert.equal( i4.target.length, 2, 'Insert4: targets' );
			assert.equal( i4.content, '<div class="inserted-multiple-after-default">Inserted after (default)</div>', 'Insert4: content' );
			assert.equal( i4.position, 'after', 'Insert4: position' );
			assert.equal( i4.inserted_node.length, 2, 'Insert4: inserted nodes' );

			assert.equal( i5.selector, '.inserts-multiple-after', 'Insert5: selector' );
			assert.equal( i5.target.length, 2, 'Insert5: targets' );
			assert.equal( i5.content, '<div class="inserted-multiple-after">Inserted after</div>', 'Insert5: content' );
			assert.equal( i5.position, 'after', 'Insert5: position' );
			assert.equal( i5.inserted_node.length, 2, 'Insert5: inserted nodes' );

			assert.equal( i6.selector, '.inserts-multiple-before', 'Insert6: selector' );
			assert.equal( i6.target.length, 2, 'Insert6: targets' );
			assert.equal( i6.content, '<div class="inserted-multiple-before">Inserted before</div>', 'Insert6: content' );
			assert.equal( i6.position, 'before', 'Insert6: position' );
			assert.equal( i6.inserted_node.length, 2, 'Insert6: inserted nodes' );

			assert.ok(i1.tag instanceof $);
			assert.ok(i2.tag instanceof $);
			assert.ok(i3.tag instanceof $);
			assert.ok(i4.tag instanceof $);
			assert.ok(i5.tag instanceof $);
			assert.ok(i6.tag instanceof $);

			// check the markup
			assert.equal( $( '#inserted-after-default' ).length, 1, 'Inserted after (default)' );
			assert.equal( $( '#inserted-after' ).length, 1, 'Inserted after' );
			assert.equal( $( '#inserted-before' ).length, 1, 'Inserted before' );
			assert.equal( $( '#inserts' ).next( '#inserted-after' ).next( '#inserted-after-default' ).length, 1, 'Inserted after: correct position' );
			assert.equal( $( '#inserts' ).prev( '#inserted-before' ).length, 1, 'Inserted before: correct position' );
			assert.equal( $( '.inserted-multiple-after-default' ).length, 2, 'Inserted multiple after (default)' );
			assert.equal( $( '#inserts-multiple-default-1' ).next( '.inserted-multiple-after-default' ).length, 1, 'Inserted multiple after (default): correct position' );
			assert.equal( $( '#inserts-multiple-default-2' ).next( '.inserted-multiple-after-default' ).length, 1, 'Inserted multiple after (default): correct position' );
			assert.equal( $( '.inserted-multiple-after' ).length, 2, 'Inserted multiple after' );
			assert.equal( $( '#inserts-multiple-after-1' ).next( '.inserted-multiple-after' ).length, 1, 'Inserted multiple after: correct position' );
			assert.equal( $( '#inserts-multiple-after-2' ).next( '.inserted-multiple-after' ).length, 1, 'Inserted multiple after: correct position' );
			assert.equal( $( '.inserted-multiple-before' ).length, 2, 'Inserted multiple before' );
			assert.equal( $( '#inserts-multiple-before-1' ).prev( '.inserted-multiple-before' ).length, 1, 'Inserted multiple before: correct position' );
			assert.equal( $( '#inserts-multiple-before-2' ).prev( '.inserted-multiple-before' ).length, 1, 'Inserted multiple before: correct position' );
		} )
		.bind( 'tdi:ajax:scriptsDone', function( evt, data ) {
			var s1 = data.scripts[0],
				s2 = data.scripts[1],
				s3 = data.scripts[2];

			assert.equal( s1.script_src, undefined );
			assert.equal( s1.script_data, "/*QUnit.test( 'TDI.Ajax.Response: inline script', function( assert ) {\n\
			assert.expect(1);\n\
\n\
			assert.ok( true, 'Inline script executed.' );\n\
		} );*/" );
			assert.equal( s1.script_id, undefined );
			assert.equal( s1.script_node, undefined );
			assert.ok( s1.script_node_inline, "Script 1 inline tag exists" );

			assert.equal( s2.script_src, 'responses/script1.js' );
			assert.equal( s2.script_data, "" );
			assert.equal( s2.script_id, undefined );
			setTimeout(function() {
				assert.ok( s2.script_node, "Script 2 tag exists" );
			}, 200);
			assert.equal( s2.script_node_inline, undefined );

			assert.equal( s3.script_src, 'responses/script2.js' );
			assert.equal( s3.script_data, "if ( window._TDI_TEST_SCRIPT_EXTERNAL_2 = true ) {\n\
			/*QUnit.test( 'TDI.Ajax.Response: external script with inline script', function( assert ) {\n\
				assert.expect(3);\n\
\n\
				assert.ok( true, 'External script loaded and inline script executed.' );\n\
				assert.equals( $( '#script2' ).length, 1, 'External script with ID.' );\n\
				assert.equals( $( '#script2_inline' ).length, 1, 'Inline script with ID.' );\n\
			} );*/\n\
		}" );
			assert.equal( s3.script_id, "script2" );
			setTimeout(function() {
				assert.ok( s3.script_node, "Script 3 tag exists" );
				assert.ok( s3.script_node_inline, "Script 3 inline tag exists" );
			}, 200);
		} )
		.bind( 'tdi:ajax:stylesDone', function( evt, data ) {
			// check the API data (expect 1 style)
			assert.equal( data.styles[0].style_src, 'responses/style.css', 'Style: src' );
			assert.equal( data.styles[0].style_id, 'style1', 'Style: id' );

			// check the markup
			assert.equal( $( '#style1' ).length, 1, 'Style loaded.' );
		} )
		.bind( 'tdi:ajax:popupsDone', function( evt, data ) {
			// 3 popups are expected
			var p1 = data.popups[0],
				p2 = data.popups[1],
				p3 = data.popups[2];

			assert.equal( p1.href, 'responses/popup1.html', 'Popup: correct URL' );
			assert.equal( p2.href, 'responses/popup2.html', 'Dialog (default): correct URL' );
			assert.equal( p2.width, 600, 'Dialog (default): correct width' );
			assert.equal( p2.height, 500, 'Dialog (default): correct height' );
			assert.equal( p3.href, 'responses/popup3.html', 'Dialog: correct URL' );
			assert.equal( p3.width, 300, 'Dialog: correct width' );
			assert.equal( p3.height, 300, 'Dialog: correct height' );

			p1.popup.close();
			p2.popup.close();
			p3.popup.close();

		} )
		.bind( 'tdi:ajax:unknownsDone', function( evt, data ) {
			// 5 unknowns are expected
			var u1 = data.unknowns[0],
				u2 = data.unknowns[1],
				u3 = data.unknowns[2],
				u4 = data.unknowns[3],
				u5 = data.unknowns[4];

			assert.equal( u1._name, 'message', 'Message: correct instruction name' );
			assert.equal( u1.severity.toUpperCase(), 'INFO', 'Message: correct severity' );
			assert.equal( u1.contents, 'Info message 1', 'Message: correct text' );
			assert.equal( u1.title, 'Info message 1 title', 'Message: correct title' );
			assert.equal( u2._name, 'message', 'Message: correct instruction name' );
			assert.equal( u2.name, 'message-name', 'Message: correct name' );
			assert.equal( u2.severity.toUpperCase(), 'ERROR', 'Message: correct severity' );
			assert.equal( u2.contents, 'Info message 2', 'Message: correct text' );
			assert.equal( u2.title, undefined, 'Message: correct title' );
			assert.equal( u3._name, 'dialog', 'Dialog: correct instruction name' );
			assert.equal( u3.contents, 'This is a dialog!', 'Dialog: correct contents' );
			assert.equal( u3.width, "500", 'Dialog: correct width' );
			assert.equal( u3.id, 'dialog1', 'Dialog: correct id' );
			assert.equal( u3.height, "400", 'Dialog: correct height' );
			assert.equal( u4._name, 'dialog', 'Dialog: correct instruction name' );
			assert.equal( u4.action, 'open', 'Dialog: correct action' );
			assert.equal( u4["cancel-url"], 'cancel/url', 'Dialog: correct cancel URL' );
			assert.equal( u4.id, 'dialog2', 'Dialog: correct id' );
			assert.equal( u5._name, 'dialog', 'Dialog: correct instruction name' );
			assert.equal( u5.action, 'close', 'Dialog: correct action' );
			assert.equal( u5.id, 'dialog3', 'Dialog: correct id' );
		} )
		.bind( 'tdi:ajax:done', function( evt, data ) {
			var r = data.responses;
			setTimeout( function() {
				assert.equal( r.updates && r.updates.length, 10, 'Ajax done: updates' );
				assert.equal( r.inserts && r.inserts.length, 6, 'Ajax done: inserts' );
				assert.equal( r.scripts && r.scripts.length, 3, 'Ajax done: scripts' );
				assert.equal( r.styles && r.styles.length, 1, 'Ajax done: styles' );
				assert.equal( r.popups && r.popups.length, 3, 'Ajax done: popups' );
				assert.equal( r.unknowns && r.unknowns.length, 5, 'Ajax done: unknowns' );

				done();
			}, 1000 );
		} );

	// send the request
	TDI.Ajax.Request.send( 'responses/full.xml' );
} );
