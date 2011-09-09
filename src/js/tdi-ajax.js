(function($) {
	// AJAX ----------------------------------------------------------------------
		/**
		 * <p>Basic Ajax functionality for the TDI library. Used to bind DOM events to desired HTML elements
		 * and send the TDI request when the events fire.</p>
		 * <p>Requires TDI global object.</p>
		 * @class Ajax
		 * @namespace TDI
		 */
		var _AJAX = {
			/**
			 * <p>Selectors for ajax enabled elements:</p>
			 * <ul>
			 *   <li><code>a.tdi</code></li>
			 *   <li><code>form.tdi</code></li>
			 *   <li><code>form.tdi input[type=submit], form.tdi button</code></li>
			 *   <li><code>select.tdi, input.tdi</code></li>
			 * </ul>
			 * @property _delegateSelectors
			 * @private
			 * @final
			 */
			_delegateSelectors : {
				linkClick : 'a.ajaxlink, a.tdi',
				formSubmit : 'form.ajaxform, form.tdi',
				formButtonActivate : 'form.ajaxform [type=submit], form.tdi [type=submit]',
				fieldChange : 'select.ajaxselect, select.tdi, input[type=checkbox].tdi, input[type=radio].tdi',
				fieldSubmit : 'input[type=text].tdi'
			},
			
			/**
			 * <p>The initialization method for <em>TDI.Ajax</em>.</p>
			 * @method _init
			 * @private
			 */
			_init : function() {
				_AJAX._bindUI();
			},
			
			/**
			 * <p>Bind all the needed DOM events for Ajax enabled elements:</p>
			 * <ul>
			 *   <li><code>onclick</code> - ajax enabled links and submit buttons</li>
			 *   <li><code>onsubmit</code> - ajax enabled forms</li>
			 *   <li><code>onchange</code> - ajax enabled form fields</li>
			 *   <li><code>onunload</code> - window</li>
			 * </ul>
			 * @method _bindUI
			 * @private
			 */
			_bindUI : function() {
				$(document)
					.delegate( _AJAX._delegateSelectors.linkClick, 'click', _AJAX._onLinkClick )
					.delegate( _AJAX._delegateSelectors.formSubmit, 'submit', _AJAX._onBeforeFormSubmit )
					.delegate( _AJAX._delegateSelectors.formButtonActivate, 'click', _AJAX._onFormButtonActivate )
					.delegate( _AJAX._delegateSelectors.fieldChange, 'change', _AJAX._onFieldChange )
					.delegate( _AJAX._delegateSelectors.fieldSubmit, 'keydown', _AJAX._onFieldSubmit );
					
				$(window).unload( _AJAX._unbindUI );
				
				$.event.special[ 'tdi:ajax:beforeFormSubmit' ] = {
					_default : _AJAX._onFormSubmit
				};
			},
			
			/**
			 * <p>Unbind all previously attached DOM event handlers:</p>
			 * <ul>
			 *   <li><code>onclick</code></li>
			 *   <li><code>onsubmit</code></li>
			 *   <li><code>onchange</code></li>
			 *   <li><code>onunload</code></li>
			 * </ul>
			 * @method _unbindUI
			 * @private
			 */
			_unbindUI : function( evt ) {
				$(document)
					.undelegate( _AJAX._delegateSelectors.linkClick, 'click', _AJAX._onLinkClick )
					.undelegate( _AJAX._delegateSelectors.formSubmit, 'submit', _AJAX._onBeforeFormSubmit )
					.undelegate( _AJAX._delegateSelectors.formButtonActivate, 'click', _AJAX._onFormButtonActivate )
					.undelegate( _AJAX._delegateSelectors.fieldChange, 'change', _AJAX._onFieldChange )
					.undelegate( _AJAX._delegateSelectors.fieldSubmit, 'keydown', _AJAX._onFieldSubmit );
			},
			
			// EVENT HANDLERS ------------------------------------------------------------
				/**
				 * <p>The link onclick event handler.</p>
				 * @method _onLinkClick
				 * @private
				 * @param {Event} evt The event object
				 */
				_onLinkClick : function( evt ) {
					evt.preventDefault();
					TDI.Ajax.send( this );
				},
				
				/**
				 * <p>The form onsubmit event handler. Used to trigger the preventable <code>tdi:ajax:beforeFormSubmit</code> event.</p>
				 * @method _onBeforeFormSubmit
				 * @private
				 * @param {Event} evt The event object
				 */
				_onBeforeFormSubmit : function( evt ) {
					evt.preventDefault();
					
					/**
					 * <p>Fires before the form is submited.</p>
					 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>_AJAX._onFormSubmit</code>).</p>
					 * @event tdi:ajax:beforeFormSubmit
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>form</span> <span>&lt;jQuery&gt;</span></code> <span>The form object</span></dd>
					 *   </dl>
					 */
					$(this).trigger( 'tdi:ajax:beforeFormSubmit', {
						form : $(this)
					} );
					
					return false;
				},
				
				/**
				 * <p>The form onsubmit event default method.</p>
				 * @method _onFormSubmit
				 * @private
				 * @param {Event} evt The event object
				 */
				_onFormSubmit : function( evt ) {
					TDI.Ajax.send( evt.target );
				},
				
				/**
				 * <p>Saves the <code>name</code> and <code>value</code> of the submit button which the user used to
				 * submit the form.</p>
				 * @method _onFormButtonActivate
				 * @private
				 * @param {Event} evt The event object
				 */
				_onFormButtonActivate : function( evt ) {
					var $button = $(this),
						$form = $(this.form);
						
					if ( $button.attr( 'name' ) ) {
						// save the used submit button
							$form.data( '_submitButton', $button );
							
						// remove the old field
							$form.find( 'input.submit-action' ).remove();
							
						// create a new field with the buttons name and value
							$( '<input>' )
								.attr( 'type', 'hidden' )
								.attr( 'name', $button.attr( 'name' ) )
								.attr( 'value', $button.attr( 'value' ) )
								.addClass( 'submit-action' )
								.appendTo( $form );
								
						// IE7/8 does not fire submit event on the form, if using the <button> element
							if ( $button.is( 'button' ) && $.browser.msie && $.browser.version.slice( 0, 1 ) <= 8 ) {
								$form.trigger( 'submit' );
							}
					}
				},
				
				/**
				 * <p>The field onchange event handler. If the field has the <code>data-ajax-url</code> attribute
				 * it is used as the trigger element. Otherwise, the fields form is considered to be the trigger
				 * element.</p>
				 * @method _onFieldChange
				 * @private
				 * @param {Event} evt The event object
				 */
				_onFieldChange : function( evt ) {
					TDI.Ajax.send( $(this).data( 'ajax-url' ) ? this : this.form );
				},
				
				/**
				 * <p>The field onkeydown event handler. If the field has the <code>data-ajax-url</code> attribute,
				 * a TDI ajax request is sent when Enter is pressed.</p>
				 * @method _onFieldSubmit
				 * @private
				 * @param {Event} evt The event object
				 */
				_onFieldSubmit : function( evt ) {
					if ( evt.keyCode === 13 && $(this).data( 'ajax-url' ) ) {
						evt.preventDefault();
						TDI.Ajax.send( this );
					}
				},
				
			// PUBLIC STUFF ------------------------------------------------------------
				_public : {
					/**
					 * <p>Universal method for sending a TDI.Ajax call. It is called internaly for all Ajax enabled
					 * elements (like Links, Forms, Selects, Inputs). This method may be used in other scripts as <code>TDI.Ajax.send( elm );</code> where the <code>elm</code> parameter points to the element, which would trigger the Ajax call if it was Ajax enabled.</p>
					 * 
					 * <dl>
					 *   <dt>There are some HTML attributes of the element, which are used to configure the call:</dt>
					 *   <dd><code><span>href</span></code> <span>The target URL of the Ajax call</span></dd>
					 *   <dd><code><span>action</span></code> <span>The same as <strong>href</strong but used at Form elements</span></dd>
					 *   <dd><code><span>data-ajax-url</span></code> <span>The target URL of the Ajax call. Used if the Ajax URL should be different than the one defined by <strong>href</strong> or <strong>action</strong> attributes, or if the HTML element does not have URL attributes (select, input, ...)</span></dd>
					 *   <dd><code><span>data-related-element</span></code> <span>A selector pointing to a related element. This element(s) gets notified when the Ajax call starts/ends.</span></dd>
					 *   <dd class="parameter_deprecated"><code><span>rel</span></code> <span>(deprecated; use <strong>data-related-element</strong> instead) The same as <strong>data-related-element</strong></span></dd>
					 *   <dd><code><span>data-related-ancestor</span></code> <span>A selector pointing to a related parent element. This element gets notified when the Ajax call starts/ends</span></dd>
					 *   <dd><code><span>data-confirm</span></code> <span>A confirmation message. Use when the user should be able to stop the Ajax call</span></dd>
					 *   <dd><code><span>disabled</span></code> <span>The Ajax call does not start if the element has the <strong>disabled</strong> atribute set</span></dd>
					 *   <dd><code><span>class="disabled"</span></code> <span>The Ajax call does not start if the element has a <strong>disabled</strong> class name</span></dd>
					 * </dl>
					 * @method send
					 * @static
					 * @param {(String|jQuery|HTMLElement)} elm The element which is used as a trigger for the Ajax call.
					 * @param {Object} callbacks An optional set of callbacks:
					 *   <dl>
					 *     <dd><code><span>beforeStart</span> <span>&lt;Function&gt;</span></code> <span>If it returns false, the AJAX call and the default <code>start</code> callback will not be executed.</span></dd>
					 *     <dd><code><span>start</span> <span>&lt;Function&gt;</span></code></dd>
					 *     <dd><code><span>beforeEnd</span> <span>&lt;Function&gt;</span></code> <span>If it returns false, the default <code>end</code> callback will not be executed.</span></dd>
					 *     <dd><code><span>end</span> <span>&lt;Function&gt;</span></code></dd>
					 *   </dl>
					 */
					send : function( elm, callbacks ) {
						callbacks = callbacks || {};
						
						var $elm = $(elm),
							name = $elm.attr( 'name' ),
							value = $elm.val(),
							confirm = $elm.data( 'confirm' ),
							related = $elm.closest( $elm.data( 'related-ancestor' ) || '' ).add( $( $elm.data( 'related-element' ) || '' ) ).add( $( $elm.attr( 'rel' ) || '' ) ),
							url = $elm.data( 'ajax-url' ) || $elm.attr( 'href' ),
							data = {};
							
						// if the element has a name and value, append it to the GET URL
							if ( name && value ) {
								data[ name ] = value;
							}
							
						// check for obstacles
							if ( (confirm && !window.confirm( confirm )) || $elm.is( '[disabled], .disabled' ) ) {
								return false;
							}
							
						var _options = {
							beforeStart : function() {
								var res = callbacks.beforeStart && callbacks.beforeStart.apply( this, arguments );
								if ( typeof res === 'undefined' || res === true ) {
									$elm.add( related ).addClass( 'loading' );
									/* deprecated */
										related.get(0) && related.addClass( 'loading-target' );
										
									callbacks.start && callbacks.start.apply( this, arguments );
									return true;
								}
								return false;
							},
							beforeEnd : function() {
								var res = callbacks.beforeEnd && callbacks.beforeEnd.apply( this, arguments );
								if ( typeof res === 'undefined' || res === true ) {
									$elm.add( related ).removeClass( 'loading' );
									/* deprecated */
										related.get(0) && related.removeClass( 'loading-target' );
										
									callbacks.end && callbacks.end.apply( this, arguments );
								}
							},
							data : data
						};
						
						if ( $elm.is( 'form' ) ) {
							TDI.Ajax.Request.sendForm( $elm[0], _options );
						}
						else {
							TDI.Ajax.Request.send( url, _options );
						}
					}
				}
		};
		TDI.Ajax = _AJAX._public;
		
	// REQUEST -------------------------------------------------------------------
		/**
		 * <p>The Request API for the TDI Ajax. Provides methods to send TDI requests.</p>
		 * @class Request
		 * @namespace TDI.Ajax
		 */
		TDI.Ajax.Request = {
			
			/**
			 * <p>Sends the Ajax request and calls the needed callback methods.</p>
			 * @method send
			 * @static
			 * @param {String} url The request URL.
			 * @param {Object} options Aditional request options:
			 *   <dl>
			 *     <dd><code><span>method</span> <span>&lt;String&gt;</span></code>
			 *       <span>The HTTP method used to send the request. Defaults to <em>get</em>.</span></dd>
			 *     <dd><code><span>data</span> <span>&lt;(String|Object)&gt;</span></code>
			 *       <span>Data to be sent to the server. It is converted to a query string, if not already a string. See jQuery documentation for <a href="http://api.jquery.com/jQuery.ajax/">$.ajax()</a></span></dd>
			 *     <dd><code><span>beforeStart</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called before the request is sent. If this function returns <em>false</em>, the request is not sent. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code> the jqXHR object</dd>
			 *           <dd><code><span>settings</span> <span>&lt;Object&gt;</span></code> The settings map used in the jQuery $.ajax call</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *         </dl>
			 *       </dd>
			 *     <dd><code><span>start</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called before the request is sent. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code> The jqXHR object</dd>
			 *           <dd><code><span>settings</span> <span>&lt;Object&gt;</span></code> The settings map used in the jQuery $.ajax call</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *          </dl>
			 *       </dd>
			 *     <dd><code><span>beforeEnd</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called after the request is complete. If this function returns <em>false</em>, the default <em>end</em> callback is not executed. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code> The jqXHR object</dd>
			 *           <dd><code><span>textStatus</span> <span>&lt;String&gt;</span></code> Status of the request ("success", "notmodified", "error", "timeout", "abort", or "parsererror")</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *         </dl>
			 *       </dd>
			 *     <dd><code><span>end</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called after the request is complete. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code> The jqXHR object</dd>
			 *           <dd><code><span>textStatus</span> <span>&lt;String&gt;</span></code> Status of the request ("success", "notmodified", "error", "timeout", "abort", or "parsererror")</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</>
			 *         </dl>
			 *       </dd>
			 *   </dl>
			 */
			send : function( url, options ) {
				options = options || {};
				options.url = TDI.Ajax.Request.ajaxifyUrl( url );
				
				$.ajax( {
					url			: options.url,
					type		: options.method || 'GET',
					data		: options.data || '',
					dataType	: 'xml',
					beforeSend	: function( xhr, settings ) {
						var res = options.beforeStart && options.beforeStart( xhr, settings, options );
						if ( typeof res === 'undefined' || res === true ) {
							Response._start( xhr, settings, options );
							options.start && options.start( xhr, settings, options );
							return true;
						}
						return false;
					},
					success		: function( data, textStatus, xhr ) {
						Response._success( data, textStatus, xhr, options );
					},
					error		: function( xhr, textStatus, error ) {
						Response._error( xhr, textStatus, error, options );
					},
					complete	: function( xhr, textStatus ) {
						var res = options.beforeEnd && options.beforeEnd( xhr, textStatus, options );
						if ( typeof res === 'undefined' || res === true ) {
							Response._end( xhr, textStatus, options );
							options.end && options.end( xhr, textStatus, options );
						}
					}
				} );
			},
			
			/**
			 * <p>Submits a form using an Iframe (fake Ajax call).</p>
			 * @method sendForm
			 * @static
			 * @param {String|jQuery|HTMLElement} form The form element which will be sent.
			 * @param {Object} options Aditional request options:
			 *   <dl>
			 *     <dd><code><span>beforeStart</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called before the request is sent. If this function returns <em>false</em>, the request is not sent. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>form</span> <span>&lt;jQuery&gt;</span></code> The form which is to be submited</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *         </dl>
			 *       </dd>
			 *     <dd><code><span>start</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called before the request is sent. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>form</span> <span>&lt;jQuery&gt;</span></code> The form which is to be submited</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *         </dl>
			 *       </dd>
			 *     <dd><code><span>beforeEnd</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called after the request is complete. If this function returns <em>false</em>, the default <em>end</em> callback is not executed. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>form</span> <span>&lt;jQuery&gt;</span></code> The form which was submited</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *           <dd><code><span>xml</span> <span>&lt;jQuery&gt;</span></code> The response XML document</dd>
			 *         </dl>
			 *       </dd>
			 *     <dd><code><span>end</span> <span>&lt;Function&gt;</span></code>
			 *         <span>Function to be called after the request is complete. This function is called with parameters:</span>
			 *         <dl>
			 *           <dd><code><span>form</span> <span>&lt;jQuery&gt;</span></code> The form which was submited</dd>
			 *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
			 *           <dd><code><span>xml</span> <span>&lt;jQuery&gt;</span></code> The response XML document</dd>
			 *         </dl>
			 *       </dd>
			 *   </dl>
			 */
			sendForm : function( form, options ) {
				options = options || {};
				
				var $form = $(form),
					$submitButton = $form.data( '_submitButton' ),
					url = $form.data( 'ajax-url' ) || $form.attr( 'action' );
					
				// onStart
					options.url = TDI.Ajax.Request.ajaxifyUrl( url );
					var res = options.beforeStart && options.beforeStart( $form, options );
					if ( res === false ) {
						return false;
					}
					options.start && options.start( $form, options );
					Response._start( $form, null, options );
					if ( $submitButton ) {
						$submitButton.addClass( 'loading' );
					}
					
				// prepare the form and its iframe
					var iframeName = 'form_iframe_'+(new Date()).getTime(),
						iframe;
						
						// IE8- has a problem assigning the `name` attribute to a dynamicaly created Iframe. It needs to be created as a string.
						if ( $.browser.msie && $.browser.version.slice( 0, 1 ) <= 8 ) {
							iframe = document.createElement( '<iframe name="' + iframeName + '">' );
						}
						else {
							iframe = document.createElement( 'iframe' );
							iframe.name = iframeName;
						}
						
						iframe.style.display = 'none';
						document.body.appendChild( iframe );
						
						// onComplete/onEnd
							$(iframe).load( function() {
								var xml = this.contentWindow.document.XMLDocument || this.contentWindow.document;
								
								var res = options.beforeEnd && options.beforeEnd( $form, options, xml );
								if ( res === false ) {
									return false;
								}
								
								Response._success( xml, '', null, options );
								Response._end( $form, null, options );
								options.end && options.end( $form, options, xml );
								if ( $submitButton ) {
									$submitButton.removeClass( 'loading' );
								}
								
								setTimeout( function() {
									$(iframe).unbind().remove();
									$form.removeAttr( 'target' );
								}, 100 );
							} );
							
						$form.attr( 'action', options.url );
						$form.attr( 'method', 'post' );
						$form.attr( 'target', iframeName );
						
						// set the enctype to multipart if there are any files for upload, but only if there is no enctype attribute present
						if ( !$form.attr( 'enctype' ) ) {
							if ( $form.find( 'input[type=file]' ).length > 0 ) {
								$form.attr( 'enctype', 'multipart/form-data' );
							}
							else {
								$form.attr( 'enctype', 'application/x-www-form-urlencoded' );
							}
						}
					
				/*
					Send the $form manualy.
					Needs to be the normal DOM method, jQuery submit() causes endless recursion of submit handlers.
				*/
					$form[0].submit();
			},
			
			/**
			 * <p>Modifies the URL and adds an Ajax (tdi) flag.</p>
			 * @method ajaxifyUrl
			 * @static
			 * @param {String} url The URL to modify
			 * @return {String} The modified URL
			 */
			ajaxifyUrl : function( url ) {
				var p = '_infuse=1';
				if ( url.indexOf( p ) >= 0 ) {
					return url;
				}
				if ( url.indexOf( '?#' ) > 0 ) {
					return url.replace( /\?#/, '?'+p+'#' );
				}
				else if ( url.indexOf( '&#' ) > 0 ) {
					return url.replace( /&#/, '&'+p+'#' );
				}
				else if ( url.indexOf( '?' ) > 0 ) {
					return url.replace( /\?/, '?'+p+'&' );
				}
				else if ( url.indexOf( '#' ) > 0 ) {
					return url.replace( /#/, '?'+p+'#' );
				}
				else {
					return url + '?'+p;
				}
			}
			
		};
		
	// RESPONSE ------------------------------------------------------------------
		/**
		 * <p>The Response API for the TDI AJAX. Provides a set of custom <em>tdi</em> events which can be used
		 * to control or to react to the TDI responses.</p>
		 * @class Response
		 */
		var Response = {
			
			// Supported Infusion instructions
				_infusionInstructions : [ 'update', 'insert', 'script', 'style', 'reload', 'redirect', 'popup', 'message', 'dialog' ],
				
			// a collection of new script tags which will be added after the response is done to preserve the execution order
				_scriptTags : [],
				
			// a collection of responses used for the 'tdi:ajax:done' event
				_responses : {
					updates : [],
					inserts : [],
					scripts : [],
					styles : [],
					popups : [],
					messages : [],
					dialogs : []
				},
				
			// CALLBACKS -----------------------------------------------------------------
				/**
				 * <p>The default <em>start</em> callback.</p>
				 * @method _start
				 * @private
				 * @param {jqXHR} xhr The jqXHR object
				 * @param {Object} settings The Ajax settings
				 * @param {Object} options Additional request options
				 */
				_start : function( xhr, settings, options ) {
					// xhr.setRequestHeader( 'X-Requested-Format', 'xml' );
					/**
					 * <p>Fires when the TDI request has started.</p>
					 * @event tdi:ajax:start
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$(document).trigger( 'tdi:ajax:start', [{
						options : options
					}] );
				},
				
				/**
				 * <p>The default <em>success</em> callback.</p>
				 * @method _success
				 * @private
				 * @param {jQuery} xml The response XML document
				 * @param {String} textStatus The status of the response
				 * @param {jqXHR} xhr The jqXHR object
				 * @param {Object} options Additional request options
				 */
				_success : function( xml, textStatus, xhr, options ) {
					if ( !xml ) {
						Response._error( xhr, textStatus, null, options );
						return false;
					}
					
					var $xml = $(xml),
						status = $xml.find( 'status' );
						
					// check for status
						if ( status.text().toLowerCase() != 'ok' ) {
							Response._error( xhr, textStatus, status.text(), options );
						}
						
					// handle tags
						$xml.find( Response._infusionInstructions.join( ',' ) ).each( function() {
							var tagName = this.tagName.toLowerCase(),
								instruction = tagName.slice(0,1).toUpperCase() + tagName.slice(1);
								
							switch( instruction ) {
								case 'Script':
										// collect all script tags to a list, so they can be downloaded and executed in the preserved order
										Response._scriptTags.push( this );
									break;
								default:
										Response[ '_onBefore' + instruction ]( this );
									break;
							}
						} );
						
						// download and execute the list of script tags
							Response._onBeforeScript( Response._scriptTags.shift() );
							
						// fire the custom ajax:done events
							/**
							 * <p>Fires when all TDI &lt;update&gt;s are done.</p>
							 * @event tdi:ajax:updatesDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>updates</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all updates</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:updatesDone', [{
								updates : Response._responses.updates
							}] );
							/**
							 * <p>Fires when all TDI &lt;insert&gt;s are done.</p>
							 * @event tdi:ajax:insertsDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>inserts</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all inserts</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:insertsDone', [{
								inserts : Response._responses.inserts
							}] );
							/**
							 * <p>Fires when all TDI &lt;script&gt;s are done.</p>
							 * @event tdi:ajax:scriptsDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>scripts</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all scripts</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:scriptsDone', [{
								scripts : Response._responses.scripts
							}] );
							/**
							 * <p>Fires when all TDI &lt;style&gt;s are done.</p>
							 * @event tdi:ajax:stylesDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>styles</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all styles</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:stylesDone', [{
								styles : Response._responses.styles
							}] );
							/**
							 * <p>Fires when all TDI &lt;popup&gt;s are done.</p>
							 * @event tdi:ajax:popupsDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>popups</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all popups</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:popupsDone', [{
								popups : Response._responses.popups
							}] );
							/**
							 * <p>Fires when all TDI &lt;message&gt;s are done.</p>
							 * @event tdi:ajax:messagesDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>messages</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all messages</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:messagesDone', [{
								messages : Response._responses.messages
							}] );
							/**
							 * <p>Fires when all TDI &lt;dialog&gt;s are done.</p>
							 * @event tdi:ajax:dialogsDone
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>dialogs</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all dialogs</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:dialogsDone', [{
								dialogs : Response._responses.dialogs
							}] );
							/**
							 * <p>Fires when all TDI actions are done.</p>
							 * @event tdi:ajax:done
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
							 *       <span>Additional request options</span></dd>
							 *     <dd><code><span>responses</span> <span>&lt;Array&gt;</span></code>
							 *       <span>The list of all TDI actions</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:done', [{
								options : options,
								responses : Response._responses
							}] );
							
				},
				
				/**
				 * <p>The default <em>error</em> callback.</p>
				 * @method _error
				 * @private
				 * @param {jqXHR} xhr The jqXHR object
				 * @param {String} textStatus The status of the response
				 * @param {String} error The error message
				 * @param {Object} options Additional request options
				 */
				_error : function( xhr, textStatus, error, options ) {
					/**
					 * <p>Fires when the Ajax request ends with an error.</p>
					 * @event tdi:ajax:error
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>status</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The XHR status text (if available)</span></dd>
					 *     <dd><code><span>message</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The error message</span></dd>
					 *   </dl>
					 */
					$(document).trigger( 'tdi:ajax:error', [{
						status : xhr ? xhr.status : 'N/A',
						message : error || 'Invalid Ajax response. The response must be a valid XML.',
						xhr : xhr,
						textStatus : textStatus,
						options : options
					}] );
				},
				
				/**
				 * <p>The default <em>end</em> callback.</p>
				 * @method _end
				 * @private
				 */
				_end : function( xhr, textStatus, options ) {
					/**
					 * <p>Fires when the TDI request has ended.</p>
					 * @event tdi:ajax:end
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$(document).trigger( 'tdi:ajax:end', [{
						options : options
					}] );
				},
				
			// RESPONSES -----------------------------------------------------------------
				/**
				 * <p>The beforeUpdate callback. It takes the &lt;update&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default update action.</p>
				 * 
				 * @method _onBeforeUpdate
				 * @private
				 * @param {XMLNode} tag The &lt;update&gt; xml tag
				 */
				_onBeforeUpdate : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						target_id = $tag.attr( 'target' ),
						target = $( '#' + $tag.attr( 'target' ) ),
						content = $.trim( $tag.text() ),
						replace = $tag.attr( 'replace' ),
						append = $tag.attr( 'append' ),
						prepend = $tag.attr( 'prepend' ),
						class_add = $tag.attr( 'class-add' ) || '',
						class_remove = $tag.attr( 'class-remove' ) || '',
						event_data = {
							target_id		: target_id,
							target			: target,
							content			: content,
							content_empty	: (content.replace( /\&nbsp;/g, '' ).length === 0),
							replace			: replace,
							append			: append,
							prepend			: prepend,
							class_add		: class_add,
							class_remove	: class_remove
						};
						
					if ( target.get(0) ) {
						// fire custom events
							/**
							 * <p>Fires before the TDI <em>update</em> takes place.</p>
							 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onUpdateDefault</code>).</p>
							 * @event tdi:ajax:beforeUpdate
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>target_id</span> <span>&lt;String&gt;</span></code>
							 *       <span>The ID of the update target</span></dd>
							 *     <dd><code><span>target</span> <span>&lt;jQuery&gt;</span></code>
							 *       <span>The update target</span></dd>
							 *     <dd><code><span>content</span> <span>&lt;String&gt;</span></code>
							 *       <span>The update contents</span></dd>
							 *     <dd><code><span>content_empty</span> <span>&lt;Boolean&gt;</span></code>
							 *       <span>Indicates whether the contents are empty</span></dd>
							 *     <dd><code><span>replace</span> <span>&lt;String&gt;</span></code>
							 *       <span>Indicates whether the contents will replace the whole target</span></dd>
							 *     <dd><code><span>append</span> <span>&lt;String&gt;</span></code>
							 *       <span>Indicates whether the contents will be appended to the end of the target</span></dd>
							 *     <dd><code><span>prepend</span> <span>&lt;String&gt;</span></code>
							 *       <span>Indicates whether the contents will be prepended to the beginning of the target</span></dd>
							 *     <dd><code><span>class_add</span> <span>&lt;String&gt;</span></code>
							 *       <span>Space separated list of class names to add</span></dd>
							 *     <dd><code><span>class_remove</span> <span>&lt;String&gt;</span></code>
							 *       <span>Space separates list of class names to remove</span></dd>
							 *   </dl>
							 */
							target.trigger( 'tdi:ajax:beforeUpdate', event_data );
							
							Response._responses.updates.push( event_data );
					}
				},
				
				/**
				 * <p>The beforeInsert callback. It takes the &lt;insert&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default insert action.</p>
				 * 
				 * @method _onBeforeInsert
				 * @private
				 * @param {XMLNode} tag The &lt;insert&gt; xml tag
				 */
				_onBeforeInsert : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						target_id = $tag.attr( 'target' ),
						target = $( '#' + target_id ),
						content = $.trim( $tag.text() ),
						position = $tag.attr( 'position' ) || 'after',
						inserted_node,
						event_data = {
							target_id		: target_id,
							target			: target,
							content			: content,
							position		: position,
							inserted_node	: inserted_node
						};
						
					if ( target.get(0) ) {
						// fire custom events
							/**
							 * <p>Fires before the TDI <em>insert</em> takes place.</p>
							 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onInsertDefault</code>).</p>
							 * @event tdi:ajax:beforeInsert
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>target_id</span> <span>&lt;String&gt;</span></code>
							 *       <span>The ID of the update target</span></dd>
							 *     <dd><code><span>target</span> <span>&lt;jQuery&gt;</span></code>
							 *       <span>The update target</span></dd>
							 *     <dd><code><span>content</span> <span>&lt;String&gt;</span></code>
							 *       <span>The contents</span></dd>
							 *     <dd><code><span>position</span> <span>&lt;String&gt;</span></code>
							 *       <span>The position of the insert (before|after)</span></dd>
							 *   </dl>
							 */
							target.trigger( 'tdi:ajax:beforeInsert', event_data );
							
							Response._responses.inserts.push( event_data );
					}
				},
				
				/**
				 * <p>The beforeScript callback. It takes the &lt;script&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default script action.</p>
				 * 
				 * @method _onBeforeScript
				 * @private
				 * @param {XMLNode} tag The &lt;script&gt; xml tag
				 */
				_onBeforeScript : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						contents = $.trim( $tag.text() ),
						src = $tag.attr( 'src' ),
						id = $tag.attr( 'id' ),
						event_data = {
							script_src : src,
							script_data : contents,
							script_id : id
						};
						
					// fire custom events
						/**
						 * <p>Fires before the TDI <em>script</em> takes place.</p>
						 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onScriptDefault</code>).</p>
						 * @event tdi:ajax:beforeScript
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>script_src</span> <span>&lt;String&gt;</span></code>
						 *       <span>Path to the external Javascript file</span></dd>
						 *     <dd><code><span>script_data</span> <span>&lt;String&gt;</span></code>
						 *       <span>Inline Javascript code</span></dd>
						 *     <dd><code><span>script_id</span> <span>&lt;String&gt;</span></code>
						 *       <span>ID of the &lt;script&gt; tag</span></dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:beforeScript', event_data );
						
						Response._responses.scripts.push( event_data );
				},
				
				/**
				 * <p>The beforeStyle callback. It takes the &lt;style&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default style action.</p>
				 * 
				 * @method _onBeforeStyle
				 * @private
				 * @param {XMLNode} tag The &lt;style&gt; xml tag
				 */
				_onBeforeStyle : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						src = $tag.attr( 'src' ),
						id = $tag.attr( 'id' ),
						event_data = {
							style_src : src,
							style_id : id
						};
						
					// fire custom events
						/**
						 * <p>Fires before the TDI <em>style</em> takes place.</p>
						 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onStyleDefault</code>).</p>
						 * @event tdi:ajax:beforeStyle
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>style_src</span> <span>&lt;String&gt;</span></code>
						 *       <span>Path to the external CSS file</span></dd>
						 *     <dd><code><span>style_id</span> <span>&lt;String&gt;</span></code>
						 *       <span>ID of the &lt;link&gt; tag</span></dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:beforeStyle', event_data );
						
						Response._responses.styles.push( event_data );
				},
				
				/**
				 * <p>The beforeReload callback. It just reloads the page.</p>
				 * 
				 * @method _onBeforeReload
				 * @private
				 * @param {XMLNode} tag The &lt;reload&gt; xml tag
				 */
				_onBeforeReload : function() {
					// fire custom events
						/**
						 * <p>Fires before the TDI <em>reload</em> takes place.</p>
						 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onReloadDefault</code>).</p>
						 * @event tdi:ajax:beforeReload
						 * @param {Event} evt The event object
						 */
						$(document).trigger( 'tdi:ajax:beforeReload', {} );
				},
				
				/**
				 * <p>The before redirect callback. It takes the &lt;redirect&gt; xml node, gets its data and redirects
				 * the page to the given URL.</p>
				 * 
				 * @method _onBeforeRedirect
				 * @private
				 * @param {XMLNode} tag The &lt;redirect&gt; xml tag
				 */
				_onBeforeRedirect : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						href = $tag.attr( 'href' );
						
					if ( href ) {
						// fire custom events
							/**
							 * <p>Fires before the TDI <em>redirect</em> takes place.</p>
							 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onRedirectDefault</code>).</p>
							 * @event tdi:ajax:beforeRedirect
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
							 *       <span>The URL to redirect to</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:beforeRedirect', { href : href } );
					}
				},
				
				/**
				 * <p>The beforePopup callback. It takes the &lt;popup&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default popup action.</p>
				 * 
				 * @method _onBeforePopup
				 * @private
				 * @param {XMLNode} tag The &lt;popup&gt; xml tag
				 */
				_onBeforePopup : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						mode = $tag.attr( 'mode' ) || 'popup',
						href = $tag.attr( 'href' ),
						width = $tag.attr( 'width' ) || 600,
						height = $tag.attr( 'height' ) || 500,
						event_data = {
							href : href,
							mode : mode,
							width : parseInt(width),
							height : parseInt(height)
						};
						
					if ( href ) {
						// fire custom events
							/**
							 * <p>Fires before the TDI <em>popup</em> takes place.</p>
							 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onPopupDefault</code>).</p>
							 * @event tdi:ajax:beforePopup
							 * @param {Event} evt The event object
							 * @param {Object} data The event data:
							 *   <dl>
							 *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
							 *       <span>The URL of the popup</span></dd>
							 *     <dd><code><span>mode</span> <span>&lt;String&gt;</span></code>
							 *       <span>The mode of the popup (popup|dialog)</span></dd>
							 *     <dd><code><span>width</span> <span>&lt;Integer&gt;</span></code>
							 *       <span>Width of the popup. Available only for <em>dialog</em> mode</span></dd>
							 *     <dd><code><span>height</span> <span>&lt;Integer&gt;</span></code>
							 *       <span>Height of the popup. Available only for <em>dialog</em> mode</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:beforePopup', event_data );
							Response._responses.popups.push( event_data );
					}
				},
				
				/**
				 * <p>The beforeMessage callback. It takes the &lt;message&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default message action.</p>
				 * 
				 * @method _onBeforeMessage
				 * @private
				 * @param {XMLNode} tag The &lt;message&gt; xml tag
				 */
				_onBeforeMessage : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						severity = $tag.attr( 'severity' ) || 'INFO',
						title = $tag.attr( 'title' ),
						contents = $.trim( $tag.text() ),
						event_data = {
							severity : severity,
							title : title,
							contents : contents
						};
						
					// fire custom events
						/**
						 * <p>Fires before the TDI <em>message</em> takes place.</p>
						 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onMessageDefault</code>).</p>
						 * @event tdi:ajax:beforeMessage
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>severity</span> <span>&lt;String&gt;</span></code>
						 *       <span>Severity of the message (defaults to INFO)</span></dd>
						 *     <dd><code><span>title</span> <span>&lt;String&gt;</span></code>
						 *       <span>Optional title of the message</span></dd>
						 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
						 *       <span>Message text</dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:beforeMessage', event_data );
						Response._responses.messages.push( event_data );
				},
				
				/**
				 * <p>The beforeDialog callback. It takes the &lt;dialog&gt; xml node, gets its data and triggers a custom event which
				 * can stop the default dialog action.</p>
				 * 
				 * @method _onBeforeDialog
				 * @private
				 * @param {XMLNode} tag The &lt;dialog&gt; xml tag
				 */
				_onBeforeDialog : function( tag ) {
					if ( !tag ) { return false; }
					
					var $tag = $(tag),
						contents = $.trim( $tag.text() ),
						action = $tag.attr( 'action' ) || 'open',
						cancelUrl = $tag.attr( 'cancel-url' ),
						width = $tag.attr( 'width' ) || 'auto',
						height = $tag.attr( 'height' ) || 'auto',
						event_data = {
							contents : contents,
							action : action,
							cancelUrl : cancelUrl,
							width : parseInt(width),
							height : parseInt(height)
						};
						
					// fire custom events
						/**
						 * <p>Fires before the TDI <em>dialog</em> takes place.</p>
						 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onDialogDefault</code>).</p>
						 * @event tdi:ajax:beforeDialog
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
						 *       <span>Dialog contents</dd>
						 *     <dd><code><span>action</span> <span>&lt;String&gt;</span></code>
						 *       <span>What to do with the dialog (defaults to `open`)</dd>
						 *     <dd><code><span>cancel-url</span> <span>&lt;String&gt;</span></code>
						 *       <span>An optional cancel URL. Can be used to close the Dialog with ESC and other UI options.</dd>
						 *     <dd><code><span>width</span> <span>&lt;String&gt;</span></code>
						 *       <span>Optional width of the Dialog.</dd>
						 *     <dd><code><span>height</span> <span>&lt;String&gt;</span></code>
						 *       <span>Optional height of the Dialog.</dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:beforeDialog', event_data );
						Response._responses.dialogs.push( event_data );
				},
				
			// RESPONSES DEFAULTS
				/**
				 * <p>The update default response handler. Updates the specified target with new contents.</p>
				 * @method _onUpdateDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The update data object:
				 *   <dl>
				 *     <dd><code><span>target_id</span> <span>&lt;String&gt;</span></code>
				 *       <span>The ID of the target element</span></dd>
				 *     <dd><code><span>target</span> <span>&lt;jQuery&gt;</span></code>
				 *       <span>The target element</span></dd>
				 *     <dd><code><span>content</span> <span>&lt;String&gt;</span></code>
				 *       <span>The new HTML contents</span></dd>
				 *     <dd><code><span>replace</span> <span>&lt;String&gt;</span></code>
				 *       <span>("true"|"false") Whether to update the targets contents, or to replace the whole target</span></dd>
				 *     <dd><code><span>append</span> <span>&lt;String&gt;</span></code>
				 *       <span>("true"|"false") Whether to append the new contents at the end of the target</span></dd>
				 *     <dd><code><span>prepend</span> <span>&lt;String&gt;</span></code>
				 *       <span>("true"|"false") Whether to prepend the new contents at the begining of the target</span></dd>
				 *     <dd><code><span>class_add</span> <span>&lt;String&gt;</span></code>
				 *       <span>CSS class name(s) which will be added to the target. Multiple class names are separated by a space</span></dd>
				 *     <dd><code><span>class_remove</span> <span>&lt;String&gt;</span></code>
				 *       <span>CSS class name(s) which will be added to the target. Multiple class names are separated by a space</span></dd>
				 *    </dl>
				 */
				_onUpdateDefault : function( evt, data ) {
					// classes
						data.target.removeClass( data.class_remove ).addClass( data.class_add );
						
					// update the target element
						if ( data.replace === 'true' ) {
							data.target.find( '*' ).andSelf().unbind(); // detach all event handlers from the target and its child nodes
							data.target.replaceWith( data.content );
						}
						else if ( data.append === 'true' ) {
							data.target.append( data.content );
						}
						else if ( data.prepend === 'true' ) {
							data.target.prepend( data.content );
						}
						else {
							data.target.find( '*' ).unbind(); // detach all event handlers from the targets child nodes
							data.target.html( data.content );
						}
						
					// trigger the update event
						/**
						 * <p>Fires after the TDI <em>update</em> takes place.</p>
						 * @event tdi:ajax:update
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>target_id</span> <span>&lt;String&gt;</span></code>
						 *       <span>The ID of the update target</span></dd>
						 *     <dd><code><span>target</span> <span>&lt;jQuery&gt;</span></code>
						 *       <span>The update target</span></dd>
						 *     <dd><code><span>content</span> <span>&lt;String&gt;</span></code>
						 *       <span>The update contents</span></dd>
						 *     <dd><code><span>content_empty</span> <span>&lt;Boolean&gt;</span></code>
						 *       <span>Indicates whether the contents are empty</span></dd>
						 *     <dd><code><span>replace</span> <span>&lt;String&gt;</span></code>
						 *       <span>Indicates whether the contents will replace the whole target</span></dd>
						 *     <dd><code><span>append</span> <span>&lt;String&gt;</span></code>
						 *       <span>Indicates whether the contents will be appended to the end of the target</span></dd>
						 *     <dd><code><span>prepend</span> <span>&lt;String&gt;</span></code>
						 *       <span>Indicates whether the contents will be prepended to the beginning of the target</span></dd>
						 *     <dd><code><span>class_add</span> <span>&lt;String&gt;</span></code>
						 *       <span>Space separated list of class names to add</span></dd>
						 *     <dd><code><span>class_remove</span> <span>&lt;String&gt;</span></code>
						 *       <span>Space separates list of class names to remove</span></dd>
						 *   </dl>
						 */
						data.target.trigger( 'tdi:ajax:update', data );
				},
				
				/**
				 * <p>The insert default response handler. Inserts the contents before/after the target.</p>
				 * @method _onInsertDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The insert data object:
				 *   <dl>
				 *     <dd><code><span>target_id</span> <span>&lt;String&gt;</span></code>
				 *       <span>The ID of the target element</span></dd>
				 *     <dd><code><span>target</span> <span>&lt;jQuery&gt;</span></code>
				 *       <span>The target element</span></dd>
				 *     <dd><code><span>content</span> <span>&lt;String&gt;</span></code>
				 *       <span>The new HTML contents</span></dd>
				 *     <dd><code><span>position</span> <span>&lt;String&gt;</span></code>
				 *       <span>("before"|"after") Whether to insert the contents before, or after the target</span></dd>
				 *   </dl>
				 */
				_onInsertDefault : function( evt, data ) {
					data.inserted_node = $( data.content )[ (data.position === 'before') ? 'insertBefore' : 'insertAfter' ]( data.target );
						
					// trigger the insert event
						/**
						 * <p>Fires after the TDI <em>insert</em> takes place.</p>
						 * @event tdi:ajax:insert
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>target_id</span> <span>&lt;String&gt;</span></code>
						 *       <span>The ID of the update target</span></dd>
						 *     <dd><code><span>target</span> <span>&lt;jQuery&gt;</span></code>
						 *       <span>The update target</span></dd>
						 *     <dd><code><span>content</span> <span>&lt;String&gt;</span></code>
						 *       <span>The contents</span></dd>
						 *     <dd><code><span>position</span> <span>&lt;String&gt;</span></code>
						 *       <span>The position of the insert (before|after)</span></dd>
						 *     <dd><code><span>inserted_node</span> <span>&lt;jQuery&gt;</span></code> Reference to the inserted HTML node</span></dd>
						 *   </dl>
						 */
						data.target.trigger( 'tdi:ajax:insert', data );
				},
				
				/**
				 * <p>The script default response handler. Loads and executes new scripts.</p>
				 * @method _onScriptDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The script data object:
				 * <dl>
				 *   <dd><code><span>script_src</span> <span>&lt;String&gt;</span></code>
				 *     <span>URL of the new external script</span></dd>
				 *   <dd><code><span>script_data</span> <span>&lt;String&gt;</span></code>
				 *     <span>Inline script data</span></dd>
				 *   <dd><code><span>script_id</span> <span>&lt;String&gt;</span></code>
				 *     <span>ID of the &lt;script&gt; tag</span></dd>
				 * </dl>
				 */
				_onScriptDefault : function( evt, data ) {
					var scripts = Response._scriptTags,
						download = true,
						onComplete = function( node ) {
							var s;
							
							// execute inline script
							if ( data.script_data ) {
								s = document.createElement( 'script' );
								s.type = 'text/javascript';
								s.text = data.script_data;
								if ( data.script_id ) {
									s.id = data.script_id + '_inline';
								}
								document.getElementsByTagName('head')[0].appendChild(s);
							}
							
							// trigger the script event
								data.script_node = node;
								/**
								 * <p>Fires after the TDI <em>script</em> takes place.</p>
								 * @event tdi:ajax:script
								 * @param {Event} evt The event object
								 * @param {Object} data The event data:
								 *   <dl>
								 *     <dd><code><span>script_src</span> <span>&lt;String&gt;</span></code>
								 *       <span>Path to the external Javascript file</span></dd>
								 *     <dd><code><span>script_data</span> <span>&lt;String&gt;</span></code>
								 *       <span>Inline Javascript code</span></dd>
								 *     <dd><code><span>script_id</span> <span>&lt;String&gt;</span></code>
								 *       <span>ID of the &lt;script&gt; tag</span></dd>
								 *     <dd><code><span>script_node</span> <span>&lt;jQuery&gt;</span></code>
								 *       <span>Reference to the inserted &lt;script&gt; node</span></dd>
								 *   </dl>
								 */
								$(document).trigger( 'tdi:ajax:script', data );
								
							// process next script
								Response._onBeforeScript( scripts.shift() );
						};
						
					// if there is an 'src' attribute, load the script first and when fully loaded, execute the script contents
						if ( data.script_src ) {
							if ( data.script_id && $( '#'+data.script_id ).length > 0 ) {
								download = false;
							}
							if ( download ) {
								TDI.Tools.getScript( data.script_src, {
									id : data.script_id,
									complete : onComplete
								} );
							}
						}
						else {
							onComplete();
						}
				},
				
				/**
				 * <p>The style default response handler. Loads external stylesheets.</p>
				 * @method _onStyleDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The style data object:
				 *   <dl>
				 *     <dd><code><span>style_src</span> <span>&lt;String&gt;</span></code>
				 *       <span>URL of the new external stylesheet</span></dd>
				 *     <dd><code><span>style_id</span> <span>&lt;String&gt;</span></code>
				 *       <span>ID of the &lt;link&gt; tag</span></dd>
				 *   </dl>
				 */
				_onStyleDefault : function( evt, data ) {
					var download = true;
					if ( data.style_id && $( '#'+data.style_id ).length > 0 ) {
						download = false;
					}
					if ( download ) {
						TDI.Tools.getStyle( data.style_src, {
							id : data.style_id,
							complete : function( node ) {
								// trigger the style event
									data.style_node = node;
									/**
									 * <p>Fires after the TDI <em>style</em> takes place.</p>
									 * @event tdi:ajax:style
									 * @param {Event} evt The event object
									 * @param {Object} data The event data:
									 *   <dl>
									 *     <dd><code><span>style_src</span> <span>&lt;String&gt;</span></code>
									 *       <span>Path to the external CSS file</span></dd>
									 *     <dd><code><span>style_id</span> <span>&lt;String&gt;</span></code>
									 *       <span>ID of the &lt;link&gt; tag</span></dd>
									 *     <dd><code><span>style_node</span> <span>&lt;jQuery&gt;</span></code>
									 *       <span>Reference to the inserted &lt;link&gt; node</span></dd>
									 *   </dl>
									 */
									$(document).trigger( 'tdi:ajax:style', data );
							}
						} );
					}
				},
				
				/**
				 * <p>The reload default response handler. Reloads the page.</p>
				 * @method _onReloadDefault
				 * @private
				 * @param {Object} data The reload data object
				 */
				_onReloadDefault : function( evt, data ) {
					window.location.reload( true );
				},
				
				/**
				 * <p>The redirect default response handler. Redirects the page to a given URL.</p>
				 * @method _onRedirectDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The redirect data object:
				 *   <dl>
				 *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
				 *       <span>URL of the redirect</span></dd>
				 *   </dl>
				 */
				_onRedirectDefault : function( evt, data ) {
					window.location.assign( data.href );
				},
				
				/**
				 * <p>The popup default response handler.</p>
				 * @method _onPopupDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The popup data object:
				 *   <dl>
				 *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
				 *       <span>Target URL of the popup</span></dd>
				 *     <dd><code><span>mode</span> <span>&lt;String&gt;</span></code>
				 *       <span>("popup"|"dialog") The type of the popup</span></dd>
				 *     <dd><code><span>width</span> <span>&lt;Integer&gt;</span></code>
				 *       <span>Width of the popup in mode "dialog"</span></dd>
				 *     <dd><code><span>height</span> <span>&lt;Integer&gt;</span></code>
				 *       <span>Height of the popup in mode "dialog"</span></dd>
				 *   </dl>
				 */
				_onPopupDefault : function( evt, data ) {
					var params = '',
						popup;
						
					if ( data.mode === 'dialog' ) {
						params += 'width='+data.width+', height='+data.height;
					}
					
					data.popup = window.open( data.href, '_blank', params );
					
					// trigger the popup event
						/**
						 * <p>Fires after the TDI <em>popup</em> takes place.</p>
						 * @event tdi:ajax:popup
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
						 *       <span>The URL of the popup</span></dd>
						 *     <dd><code><span>mode</span> <span>&lt;String&gt;</span></code>
						 *       <span>The mode of the popup (popup|dialog)</span></dd>
						 *     <dd><code><span>width</span> <span>&lt;Integer&gt;</span></code>
						 *       <span>Width of the popup. Available only for <em>dialog</em> mode</span></dd>
						 *     <dd><code><span>height</span> <span>&lt;Integer&gt;</span></code>
						 *       <span>Height of the popup. Available only for <em>dialog</em> mode</span></dd>
						 *     <dd><code><span>popup</span> <span>&lt;window&gt;</span></code>
						 *       <span>Reference to the opened <em>window</em></span></dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:popup', data );
				},
				
				/**
				 * <p>The message default response handler.</p>
				 * @method _onMessageDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The popup data object:
				 *   <dl>
				 *     <dd><code><span>severity</span> <span>&lt;String&gt;</span></code>
				 *       <span>Severity of the message (defaults to INFO)</span></dd>
				 *     <dd><code><span>title</span> <span>&lt;String&gt;</span></code>
				 *       <span>Optional title of the message</span></dd>
				 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
				 *       <span>Message text</span></dd>
				 *   </dl>
				 */
				_onMessageDefault : function( evt, data ) {
					var message = data.severity;
					if ( data.title ) {
						message += ': ' + data.title;
					}
					if ( data.contents ) {
						message += '\n\n' + data.contents;
					}
					
					// trigger the message event
						/**
						 * <p>Fires after the TDI <em>message</em> takes place.</p>
						 * @event tdi:ajax:message
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>severity</span> <span>&lt;String&gt;</span></code>
						 *       <span>Severity of the message (defaults to INFO)</span></dd>
						 *     <dd><code><span>title</span> <span>&lt;String&gt;</span></code>
						 *       <span>Optional title of the message</span></dd>
						 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
						 *       <span>Message text</dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:message', data );
				},
				
				/**
				 * <p>The dialog default response handler.</p>
				 * @method _onDialogDefault
				 * @private
				 * @param {Object} evt The event object
				 * @param {Object} data The dialog data object:
				 *   <dl>
				 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
				 *       <span>Dialog contents</span></dd>
				 *   </dl>
				 */
				_onDialogDefault : function( evt, data ) {
					// trigger the dialog event
						/**
						 * <p>Fires after the TDI <em>dialog</em> takes place.</p>
						 * @event tdi:ajax:dialog
						 * @param {Event} evt The event object
						 * @param {Object} data The event data:
						 *   <dl>
						 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
						 *       <span>Dialog contents</dd>
						 *     <dd><code><span>action</span> <span>&lt;String&gt;</span></code>
						 *       <span>What to do with the dialog (defaults to `open`)</dd>
						 *     <dd><code><span>cancel-url</span> <span>&lt;String&gt;</span></code>
						 *       <span>An optional cancel URL. Can be used to close the Dialog with ESC and other UI options.</dd>
						 *     <dd><code><span>width</span> <span>&lt;String&gt;</span></code>
						 *       <span>Optional width of the Dialog.</dd>
						 *     <dd><code><span>height</span> <span>&lt;String&gt;</span></code>
						 *       <span>Optional height of the Dialog.</dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:dialog', data );
				}
				
		};
		
	// TDI Ajax custom events -------------------------------------------------
		var i,
			customHandlers = {
				'tdi:ajax:beforeUpdate'		: '_onUpdateDefault',
				'tdi:ajax:beforeInsert'		: '_onInsertDefault',
				'tdi:ajax:beforeScript'		: '_onScriptDefault',
				'tdi:ajax:beforeStyle'		: '_onStyleDefault',
				'tdi:ajax:beforeReload'		: '_onReloadDefault',
				'tdi:ajax:beforeRedirect'	: '_onRedirectDefault',
				'tdi:ajax:beforePopup'		: '_onPopupDefault',
				'tdi:ajax:beforeMessage'	: '_onMessageDefault',
				'tdi:ajax:beforeDialog'		: '_onDialogDefault'
			},
			customDefault = function( evt, data ) {
				Response[ customHandlers[ evt.type ] ]( evt, data[1] );
			};
			
		for ( i in customHandlers ) {
			$.event.special[ i ] = {
				_default : customDefault
			};
		}
		
	// Initialize TDI.Ajax module ---------------------------------------------
		_AJAX._init();
		
}( jQuery ));
