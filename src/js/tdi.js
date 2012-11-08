if ( typeof jQuery == 'undefined' ) {
	throw( 'Missing dependency: jQuery!' );
}

/**
 * <p>Javascript library which enables the communication between the UI and the application, using
 * the <a href="http://wbase.etn/doku.php?id=ice:eris:infusion_js:ajax:protokol">Infusion AJAX protocol</a>.</p>
 * @module TDI
 */
var TDI = function($) {

	/**
	 * <p>Minimum jQuery version required for TDI.</p>
	 * @type {String}
	 * @property _jQueryMinVersion
	 * @private
	 * @final
	 */
	var _jQueryMinVersion = '1.7.0';

	/**
	 * <p>Checks whether the minimum requirements are satisfied.</p>
	 * @method _checkDependencies
	 * @private
	 */
	function _checkDependencies() {
		var versions = {
			min : _jQueryMinVersion.replace( /\./g, '' ),
			orig : jQuery.fn.jquery.replace( /\./g, '' )
		}, i;
		for ( i = 0, l = Math.max( versions.min.length, versions.orig.length ); i < l; i++ ) {
			versions.min += ( versions.min.charAt(i) )?'':'0';
			versions.orig += ( versions.orig.charAt(i) )?'':'0';
		}

		if ( versions.orig < versions.min ) {
			throw( 'TDI requires jQuery version '+_jQueryMinVersion+' or higher!' );
		}
	}

	// initialization
		_checkDependencies();

	// PUBLIC STUFF ------------------------------------------------------------
		return {};

}(jQuery);
