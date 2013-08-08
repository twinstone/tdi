/*
 * Copyright 2013 Etnetera a.s. http://www.etnetera.cz
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * <p>A set of tools for the TDI library.</p>
 * <p>Requires TDI global object.</p>
 * @class Tools
 * @namespace TDI
 */
TDI.Tools = function($) {

	// PUBLIC STUFF ------------------------------------------------------------
		return {
			/**
			 * <p>Loads an external javascript file. It uses a 'script tag' technique instead of AJAX,
			 * so the loaded javascript file is debugable in tools like Firebug.</p>
			 * @method getScript
			 * @param {String} url URL of the external javascript file
			 * @param {Object} options Additional options
			 *   <dl>
			 *     <dd><code><span>complete</span> <span>&lt;Function&gt;</span></code>
			 *       <span>It is called when the javascript is fully loaded.</span></dd>
			 *     <dd><code><span>id</span> <span>&lt;String&gt;</span></code>
			 *       <span>An optional <em>id</em> attribute of the script tag.</span></dd>
			 *   </dl>
			 */
			getScript : function( url, options ) {
				var loaded = false,
					node;

				if ( url ) {
					options = options || {};

					node = document.createElement( 'script' );
					node.type = 'text/javascript';
					node.src = url;
					if ( options.id ) {
						node.id = options.id;
					}

					if ( options.complete ) {
						/*
							IE supports only the `onreadystatechange` event.
							Other browsers (Chrome, Firefox, Opera, Safari) support the `onload` event.
							IE9 supports both. But we make sure, that only one callback is fired.
						*/
							node.onreadystatechange = function() {
								var rs = this.readyState;
								if ( !loaded && ( rs === 'loaded' || rs === 'complete' ) ) {
									loaded = true;
									node.onreadystatechange = null;
									options.complete( node );
								}
							};
							node.onload = function() {
								if ( !loaded ) {
									loaded = true;
									options.complete( node );
								}
							};
					}

					document.getElementsByTagName( 'head' )[0].appendChild( node );
				}
			},

			/**
			 * <p>Loads an external CSS file. It uses AJAX to load the CSS data to provide the <em>complete</em> event.</p>
			 * @method getStyle
			 * @param {String} url URL of the external CSS file
			 * @param {Object} options Additional options
			 *   <dl>
			 *     <dd><code><span>complete</span> <span>&lt;Function&gt;</span></code>
			 *       <span>It is called when the CSS file is fully loaded.</span></dd>
			 *     <dd><code><span>id</span> <span>&lt;String&gt;</span></code>
			 *       <span>An optional <em>id</em> attribute of the style tag.</span></dd>
			 *   </dl>
			 */
			getStyle : function( url, options ) {
				var node;
				if ( url ) {
					options = options || {};

					node = document.createElement( 'link' );
					node.rel = 'stylesheet';
					node.type = 'text/css';
					node.media = options.media || 'screen';
					node.href = url;
					if ( options.id ) {
						node.id = options.id;
					}

					document.getElementsByTagName( 'head' )[0].appendChild( node );

					options.complete && options.complete( node );
				}
			}
		}

}(jQuery);
