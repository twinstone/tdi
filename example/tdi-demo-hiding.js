
/*
 * This is an example definition of some external JavaScript.
 * It defines one function to show or hide all list items NOT having a given class.
 * TDI will ensure it is loaded for the first time only.
 */

function tdiDemoShow(parent, selector, show) {
	var csssel = "#" + parent + " li:not(." + selector + ")";
	if (show) {
		$(csssel).show();
	} else {
		$(csssel).hide();
	}
}

