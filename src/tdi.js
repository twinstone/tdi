(function(global, factory) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get TDI
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a TDI-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var TDI = require("tdi")(window);
		// See ticket #14549 for more info
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "TDI requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
	var strundefined = typeof undefined;
	var TDI = {
		bla : "foo"
	};
	
	if ( typeof define === "function" && define.amd ) {
		define([], function() {
			return TDI;
		});
	}
	
	// Expose TDI, even in
	// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if (typeof noGlobal === strundefined) {
		window.TDI = window.$ = TDI;
	}
	
	return TDI;
}));
