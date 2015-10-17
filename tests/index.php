<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>TDI Tests</title>
	<link rel="stylesheet" href="base.css" type="text/css">
	<link rel="stylesheet" href="qunit/qunit.css" type="text/css" media="screen">
	<style>
		iframe { width: 0; height: 0; border: 0; position: absolute; left: -1000px; top: -1000px; }
		#tests li a.passed, #tests li a.failed { padding-left: 16px; background: url("data:image/gif;base64,R0lGODlhEAAQAJEAADNmmf///////wAAACH5BAUUAAIALAAAAAAQABAAAAIXlI+py+0PozRAggpv04Lviz3eRJbmUQAAOw==") no-repeat 0 50%; } 
		#tests li a.failed { background-image: url("data:image/gif;base64,R0lGODlhEAAQAJEAAMwAAP///////wAAACH5BAUUAAIALAAAAAAQABAAAAIXlI+py+0PowPA0Enzy3VrzGFWJ5XmmRQAOw=="); }
	</style>
	<script src="qunit/qunit.js"></script>
	<script src="jquery.js"></script>
</head>
<body>
	<h1>TDI Tests</h1>
	<p class="warn"><strong>Execute `gulp build` before running the tests!</strong></p>
	<p class="warn"><strong>You need to allow popups in order to the test to run properly!</strong></p>
	<ul id="tests">
		<?php
			$dir = Dir(__DIR__);
			while ( $f = $dir->read() ) {
				$fp = pathinfo( $f );
				if ( isset($fp[ "extension" ]) && $fp[ "extension" ] == "html" ) {
					echo "<li><a href=\"" . $f . "\">" . ucwords(str_replace("-", " ", $fp[ "filename" ])) . "</a> <span></span></li>\n";
				}
			}
		?>
	</ul>
	<h1 id="qunit-header">TDI - QUnit Test Suite</h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<script>
			var tests = $( '#tests a' ),
				maxRuns = 100;
				
			tests.each( function() {
				var test = $(this);
				
				asyncTest( test.text(), function() {
					var iframe = $( '<iframe src="' + test.attr( 'href' ) + '">' ).appendTo( 'body' );
						iframe.load( function() {
							var runs = 0,
								doc = $(iframe[0].contentWindow.document),
								interval = window.setInterval( function() {
									var results = doc.find( '#qunit-testresult' ),
										failed = results.find( '.failed' );
										
									if ( results.length === 1 && failed.length === 1 ) {
										if ( parseInt(failed.text()) === 0 ) {
											ok( true, 'Test "' + test.text() + '" passed.' );
											test.addClass( 'passed' );
											window.clearInterval( interval );
											start();
										}
										else {
											ok( false, 'Test "' + test.text() + '" failed.' );
											test.addClass( 'failed' );
											window.clearInterval( interval );
											start();
										}
									}
									
									runs++;
									test.next( 'span' ).html( runs+'&times;' );
									
									if ( runs === maxRuns ) {
										ok( false, 'Test "' + test.text() + '" failed to complete in time.' );
										test.addClass( 'failed' );
										window.clearInterval( interval );
										start();
									}
								}, 200 );
						} );
				} );
			} );
	</script>
</body>
</html>
