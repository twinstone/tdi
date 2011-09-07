if ( typeof jQuery == 'undefined' ) {
	throw( 'Missing dependency: jQuery!' );
}

(function($) {
	
	/**
	 * <p>Javascript library which enables the communication between the UI and the application, using
	 * the <a href="http://wbase.etn/doku.php?id=ice:eris:infusion_js:ajax:protokol">Infusion AJAX protocol</a>.</p>
	 * @module TDI
	 */
	var _TDI = {
		
		/**
		 * <p>Minimum jQuery version required for TDI.</p>
		 * @type {String}
		 * @property _jQueryMinVersion
		 * @private
		 * @final
		 */
		_jQueryMinVersion : '1.6.3',
		
		/**
		 * <p>The initialization method for TDI.</p>
		 * @method _init
		 * @private
		 */
		_init : function() {
			_TDI._checkDependencies();
		},
		
		/**
		 * <p>Checks whether the minimum requirements are satisfied.</p>
		 * @method _checkDependencies
		 * @private
		 */
		_checkDependencies : function() {
			var jQueryMinVersion = _TDI._jQueryMinVersion,
				versions = {
				min : jQueryMinVersion.replace( /\./g, '' ),
				orig : jQuery.fn.jquery.replace( /\./g, '' )
			}, i;
			for ( i = 0, l = Math.max( versions.min.length, versions.orig.length ); i < l; i++ ) {
				versions.min += ( versions.min.charAt(i) )?'':'0';
				versions.orig += ( versions.orig.charAt(i) )?'':'0';
			}
			
			if ( versions.orig < versions.min ) {
				throw( 'TDI requires jQuery version '+jQueryMinVersion+' or higher!' );
			}
		},
		
		// PUBLIC STUFF ------------------------------------------------------------
			_public : {}
			
	};
	
	window.TDI = _TDI._public;
	$(document).ready( _TDI._init );
	
}(jQuery));
