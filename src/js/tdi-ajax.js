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
 * <p>Basic Ajax functionality for the TDI library. Used to bind DOM events to desired HTML elements
 * and send the TDI request when the events fire.</p>
 * <p>Requires TDI global object.</p>
 * @class Ajax
 * @namespace TDI
 */
TDI.Ajax = function($) {

	/**
	 * <p>Selectors for ajax enabled elements:</p>
	 * <ul>
	 *   <li><code>a.tdi</code></li>
	 *   <li><code>form.tdi</code></li>
	 *   <li><code>form.tdi input[type=submit], form.tdi button</code></li>
	 *   <li><code>select.tdi, input[type=checkbox].tdi, input[type=radio].tdi</code></li>
	 *   <li><code>input[type=text].tdi</code></li>
	 * </ul>
	 * @property _delegateSelectors
	 * @private
	 * @final
	 */
	var _delegateSelectors = {
		linkClick			: 'a.ajaxlink, a.tdi, a.infuse',
		formSubmit			: 'form.ajaxform, form.tdi, form.infuse',
		formButtonActivate	: 'form.ajaxform [type=submit], form.tdi [type=submit], form.infuse [type=submit]',
		fieldChange			: 'select.ajaxselect, select.tdi, select.infuse, input[type=checkbox].tdi, input[type=checkbox].infuse, input[type=radio].tdi, input[type=radio].infuse',
		fieldSubmit			: 'input[type=text].tdi, input[type=text].infuse'
	};

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
	function _bindUI() {
		$(document)
			.delegate( _delegateSelectors.formSubmit, 'submit', _onBeforeFormSubmit )
			.delegate( _delegateSelectors.linkClick, 'click', _onBeforeLinkClick )
			.delegate( _delegateSelectors.formButtonActivate, 'click', _onFormButtonActivate )
			.delegate( _delegateSelectors.fieldChange, 'change', _onFieldChange )
			.delegate( _delegateSelectors.fieldSubmit, 'keydown', _onFieldSubmit );

		$(window).on( 'unload', _unbindUI );

		$.event.special[ 'tdi:ajax:beforeLinkClick' ] = {
			_default : _onLinkClick
		};
		$.event.special[ 'tdi:ajax:beforeFormSubmit' ] = {
			_default : _onFormSubmit
		};
	}

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
	function _unbindUI( evt ) {
		$(document)
			.undelegate( _delegateSelectors.linkClick, 'click', _onLinkClick )
			.undelegate( _delegateSelectors.formSubmit, 'submit', _onBeforeFormSubmit )
			.undelegate( _delegateSelectors.formButtonActivate, 'click', _onFormButtonActivate )
			.undelegate( _delegateSelectors.fieldChange, 'change', _onFieldChange )
			.undelegate( _delegateSelectors.fieldSubmit, 'keydown', _onFieldSubmit );
	}

	// EVENT HANDLERS ------------------------------------------------------------
		/**
		 * <p>The link onclick event handler. Used to trigger the preventable <code>tdi:ajax:beforeLinkClick</code> event.</p>
		 * @method _onBeforeLinkClick
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onBeforeLinkClick( evt ) {
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey || (evt.button && evt.button === 1)) {
				return;
			}

			evt.preventDefault();

			/**
			 * <p>Fires before the link is clicked (before the link action is executed).</p>
			 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>_onLinkClick</code>).</p>
			 * @event tdi:ajax:beforeLinkClick
			 * @param {Event} evt The event object
			 * @param {Object} data The event data:
			 *   <dl>
			 *     <dd><code><span>link</span> <span>&lt;jQuery&gt;</span></code> <span>The link object</span></dd>
			 *   </dl>
			 */
			$(this).trigger( 'tdi:ajax:beforeLinkClick', {
				link : $(this)
			} );
		}

		/**
		 * <p>The link onclick event handler.</p>
		 * @method _onLinkClick
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onLinkClick( evt ) {
			TDI.Ajax.send( evt.target );
		}

		/**
		 * <p>The form onsubmit event handler. Used to trigger the preventable <code>tdi:ajax:beforeFormSubmit</code> event.</p>
		 * @method _onBeforeFormSubmit
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onBeforeFormSubmit( evt ) {
			evt.preventDefault();

			/**
			 * <p>Fires before the form is submited.</p>
			 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>_onFormSubmit</code>).</p>
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
		}

		/**
		 * <p>The form onsubmit event default method.</p>
		 * @method _onFormSubmit
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onFormSubmit( evt ) {
			TDI.Ajax.send( evt.target );
		}

		/**
		 * <p>Saves the <code>name</code> and <code>value</code> of the submit button which the user used to
		 * submit the form.</p>
		 * @method _onFormButtonActivate
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onFormButtonActivate( evt ) {
			var $button = $(this),
				$form = $(this.form);

			// save the used submit button
				$form.data( '_submitButton', $button );

			if ( $button.attr( 'name' ) ) {
				// remove the old field
					$form.find( 'input.submit-action' ).remove();

				// create a new field with the buttons name and value
					$( '<input>' )
						.attr( 'type', 'hidden' )
						.attr( 'name', $button.attr( 'name' ) )
						.attr( 'value', $button.attr( 'value' ) )
						.addClass( 'submit-action' )
						.appendTo( $form );
			}
		}

		/**
		 * <p>The field onchange event handler. If the field has the <code>data-ajax-url</code> attribute
		 * it is used as the trigger element. Otherwise, the fields form is considered to be the trigger
		 * element.</p>
		 * @method _onFieldChange
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onFieldChange( evt ) {
			if ( $(this).data( 'ajax-url' ) ) {
				TDI.Ajax.send( this );
			}
			else {
				$( this.form ).submit();
			}
		}

		/**
		 * <p>The field onkeydown event handler. If the field has the <code>data-ajax-url</code> attribute,
		 * a TDI ajax request is sent when Enter is pressed.</p>
		 * @method _onFieldSubmit
		 * @private
		 * @param {Event} evt The event object
		 */
		function _onFieldSubmit( evt ) {
			if ( evt.keyCode === 13 ) {
				evt.preventDefault();
				if ( $(this).data( 'ajax-url' ) ) {
					TDI.Ajax.send( this );
				}
				else {
					$( this.form ).submit();
				}
			}
		}

	// initialization
		_bindUI();

	// PUBLIC STUFF ------------------------------------------------------------
		return {
			/**
			 * <p>Universal method for sending a TDI.Ajax call. It is called internaly for all Ajax enabled
			 * elements (like Links, Forms, Selects, Inputs). This method may be used in other scripts as <code>TDI.Ajax.send( elm );</code> where the <code>elm</code> parameter points to the element, which would trigger the Ajax call if it was Ajax enabled.</p>
			 *
			 * <dl>
			 *   <dt>There are some HTML attributes of the element, which are used to configure the call:</dt>
			 *   <dd><code><span>href</span></code> <span>The target URL of the Ajax call</span></dd>
			 *   <dd><code><span>action</span></code> <span>The same as <strong>href</strong but used at Form elements</span></dd>
			 *   <dd><code><span>data-ajax-url</span></code> <span>The target URL of the Ajax call. Used if the Ajax URL should be different than the one defined by <strong>href</strong> or <strong>action</strong> attributes, or if the HTML element does not have URL attributes (select, input, ...)</span></dd>
			 *   <dd><code><span>method</span></code> <span>The HTTP method to be used for the Ajax request. Only for Form elements. <strong>Forms with &lt;input type="file"&gt; elements will have forced POST method!</strong></dd>
			 *   <dd><code><span>data-ajax-method</span></code> <span>The HTTP method to be used for the Ajax request. The same as <strong>method</strong> but applicable for all elements. If used on Form element, it has precedence before <strong>method</strong> attribute (except Forms with file fields which have always POST method). Defaults to GET.</dd>
			 *   <dd><code><span>data-related-element</span></code> <span>A selector pointing to a related element. This element(s) gets notified when the Ajax call starts/ends.</span></dd>
			 *   <dd class="parameter_deprecated"><code><span>rel</span></code> <span>(deprecated; use <strong>data-related-element</strong> instead) The same as <strong>data-related-element</strong></span></dd>
			 *   <dd><code><span>data-related-ancestor</span></code> <span>A selector pointing to a related parent element. This element gets notified when the Ajax call starts/ends</span></dd>
			 *   <dd><code><span>data-confirm</span></code> <span>A confirmation message. Use when the user should be able to stop the Ajax call</span></dd>
			 *   <dd><code><span>disabled</span></code> <span>The Ajax call does not start if the element has the <strong>disabled</strong> atribute set</span></dd>
			 *   <dd><code><span>class="disabled"</span></code> <span>The Ajax call does not start if the element has a <strong>disabled</strong> class name</span></dd>
			 * </dl>
			 * @method send
			 * @static
			 * @return {jqXHR} xhr The jqXHR object or null if the iframe method was used to send a form
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
					related = $elm.closest( $elm.data( 'related-ancestor' ) || '' ).add( $( $elm.data( 'related-element' ) || '' ) ).add( $( $elm.attr( 'rel' ) || '' ) ).add( $( $elm.data( '_submitButton' ) || '' ) ),
					involvedElms = $elm.add(related),
					triggerGroup = $( $elm.data( 'trigger-group' ) || '' ),
					url = $elm.data( 'ajax-url' ) || $elm.attr( 'href' ) || $elm.attr( 'action' ),
					method = $elm.data( 'ajax-method' ) || $elm.attr( 'method' );
					xhrFields = $elm.data( 'ajax-xhr-fields' ) || {},
					data = {};

				// if the URL is empty, try to use $elm.value
					if ( (url === "" || url === undefined) && value ) {
						url = value;
					}

				// if the element has a name and value, append it to the GET URL
					if ( name && value ) {
						if ( $elm.is( 'input[type=checkbox]' ) && $elm.prop( 'checked' ) === false ) {
							data[ name ] = 0;
						}
						else {
							data[ name ] = value;
						}
					}

				// check for obstacles
					if ( $elm.is( '[disabled], .disabled' ) ) {
						return;
					}
					if ( confirm && !window.confirm( confirm ) ) {
						return;
					}

				var _options = {
					beforeStart : function() {
						var res = callbacks.beforeStart && callbacks.beforeStart.apply( this, arguments );
						if ( typeof res === 'undefined' || res === true ) {
							involvedElms.addClass( 'loading' );
							triggerGroup.each( function() {
								var $trigger = $(this);
								if ( !$trigger.hasClass( 'disabled' ) && !$trigger.prop( 'disabled' ) ) {
									$trigger.addClass( 'disabled' ).prop( 'disabled', true );
									$trigger.data( '_disabled', true );
								}
							} );
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
							involvedElms.removeClass( 'loading' );
							triggerGroup.each( function( i, $trigger ) {
								var $trigger = $(this);
								if ( $trigger.data( '_disabled' ) === true ) {
									$trigger.removeClass( 'disabled' ).prop( 'disabled', false );
									$trigger.data( '_disabled', false );
								}
							} );
							/* deprecated */
								related.get(0) && related.removeClass( 'loading-target' );

							callbacks.end && callbacks.end.apply( this, arguments );
						}
					},
					data : data,
					method : method,
					trigger : $elm,
					involvedElms : involvedElms,
					xhrFields : xhrFields
				};

				if ( $elm.is( 'form' ) ) {
					_options.end = function() {
						$elm.data( '_submitButton', null );
						$elm.find( 'input.submit-action' ).remove();
					};
					
					return TDI.Ajax.Request.sendForm( $elm, _options );
				}
				else {
					return TDI.Ajax.Request.send( url, _options );
				}
			}
		};

}(jQuery);

/**
 * <p>The Request API for the TDI Ajax. Provides methods to send TDI requests.</p>
 * @class Request
 * @namespace TDI.Ajax
 */
TDI.Ajax.Request = function($) {
	var HAS_XHR2_SUPPORT = function () {
		var xhr = new XMLHttpRequest();
		return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
	}();
	var HAS_FORMDATA_SUPPORT = !! window.FormData;

	return {

		/**
		 * <p>Sends the Ajax request and calls the needed callback methods.</p>
		 * @method send
		 * @static
		 * @return {jqXHR} xhr The jqXHR object
		 * @param {String} url The request URL.
		 * @param {Object} options jQuery.ajax() settings. Aditional options:
		 *   <dl>
		 *     <dd><code><span>method</span> <span>&lt;String&gt;</span></code>
		 *       <span>The HTTP method used to send the request. Defaults to <em>get</em>.</span></dd>
		 *     <dd><code><span>data</span> <span>&lt;(String|Object)&gt;</span></code>
		 *       <span>Data to be sent to the server. It is converted to a query string, if not already a string. See jQuery documentation for <a href="http://api.jquery.com/jQuery.ajax/">$.ajax()</a></span></dd>
		 *     <dd><code><span>sync</span> <span>&lt;(Boolean)&gt;</span></code>
		 *       <span>Whether the AJAX request should be synchronous or not. Defaults to <em>false</em></span></dd>
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
			options.xhrFields = options.xhrFields || {};
			options.type = options.type || options.method || 'GET';
			options.async = !options.sync;
			options.data = options.data || '';
			options.dataType = options.dataType || 'xml';

			var jqSettings = $.extend( {}, options );
			jqSettings.beforeSend = function( xhr, settings ) {
				var res = options.beforeStart && options.beforeStart( xhr, settings, options );
				if ( typeof res === 'undefined' || res === true ) {
					$(document).trigger( 'tdi:ajax:_start', { xhr : xhr, settings : settings, options : options } );
					// TDI.Ajax.Response._start( xhr, settings, options );
					options.start && options.start( xhr, settings, options );
					return true;
				}
				return false;
			};
			jqSettings.success = function( data, textStatus, xhr ) {
				$(document).trigger( 'tdi:ajax:_success', { data : data, textStatus : textStatus, xhr : xhr, options : options } );
				// TDI.Ajax.Response._success( data, textStatus, xhr, options );
				options.success && options.success( data, textStatus, xhr, options );
			};
			jqSettings.error = function( xhr, textStatus, error ) {
				$(document).trigger( 'tdi:ajax:_error', { xhr : xhr, textStatus : textStatus, error : error, options : options } );
				// TDI.Ajax.Response._error( xhr, textStatus, error, options );
				options.error && options.error( xhr, textStatus, error, options );
			};
			jqSettings.complete = function( xhr, textStatus ) {
				var res = options.beforeEnd && options.beforeEnd( xhr, textStatus, options );
				if ( typeof res === 'undefined' || res === true ) {
					$(document).trigger( 'tdi:ajax:_end', { xhr : xhr, textStatus : textStatus, options : options } );
					// TDI.Ajax.Response._end( xhr, textStatus, options );
					options.end && options.end( xhr, textStatus, options );
				}
			};

			return $.ajax( jqSettings );
		},

		/**
		 * <p>Submits a form using an Iframe (fake Ajax call).</p>
		 * @method sendForm
		 * @static
		 * @return {jqXHR} xhr The jqXHR object or null if the iframe method is used
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

			// send in iframe or through ajax
				options.method = options.method || $form.attr('method');
				if ($form.find("input[type=file]").length > 0) {
					options.method = "post";
				}

				// send in iframe or through ajax
				if (HAS_XHR2_SUPPORT && HAS_FORMDATA_SUPPORT) {
					options.data = new FormData($form.get(0));
					options.processData = false;
					options.contentType = false;

					return TDI.Ajax.Request.send( url, options );
				}
				else {
					if ($form.find("input[type=file]").length === 0) {
						options.data = $form.serialize(); // safe to overwrite

						return TDI.Ajax.Request.send( url, options );
					}
				}

			// onStart
				options.url = TDI.Ajax.Request.ajaxifyUrl( url );
				var res = options.beforeStart && options.beforeStart( $form, options );
				if ( res === false ) {
					return false;
				}

				$(document).trigger( 'tdi:ajax:_start', { xhr : $form, settings : null, options : options } );
				// TDI.Ajax.Response._start( $form, null, options );
				options.start && options.start( $form, options );
				if ( $submitButton ) {
					$submitButton.addClass( 'loading' );
				}

			// prepare the form and its iframe
				var iframeName = 'form_iframe_'+(new Date()).getTime(),
					iframe;

					// IE8- has a problem assigning the `name` attribute to a dynamicaly created Iframe. It needs to be created as a string.
					if ( document.documentMode && document.documentMode <= 8 ) {
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
							var xml = this.contentWindow.document.XMLDocument || this.contentWindow.document,
								xhr = {
									responseXML : xml,
									responseText : (xml.body) ? xml.getElementsByTagName('html')[0].innerHTML : null
								};

							var res = options.beforeEnd && options.beforeEnd( $form, options, xml );
							if ( res === false ) {
								return false;
							}

							if ( $submitButton ) {
								$submitButton.removeClass( 'loading' );
							}

							$(document).trigger( 'tdi:ajax:_success', { data : xml, textStatus : '', xhr : xhr, options : options } );
							$(document).trigger( 'tdi:ajax:_end', { xhr : $form, textStatus : null, options : options } );
							$form.trigger( 'tdi:ajax:_formSubmit', { form : $form, options : options, xhr : xhr, data : xml } );
							// TDI.Ajax.Response._success( xml, '', null, options );
							// TDI.Ajax.Response._end( $form, null, options );
							options.end && options.end( $form, options, xml );

							setTimeout( function() {
								$(iframe).unbind().remove();
								$form.removeAttr( 'target' );
							}, 10000 );
						} );

					$form.attr( 'action', options.url );
					$form.attr( 'method', options.method || 'post' );
					$form.attr( 'target', iframeName );
					$form.attr( 'enctype', 'multipart/form-data' );

			/*
				Send the $form manualy.
				Needs to be the normal DOM method, jQuery submit() causes endless recursion of submit handlers.
			*/
				$form[0].submit();

			return null;
		},

		/**
		 * <p>Modifies the URL and adds an Ajax (tdi) flag.</p>
		 * @method ajaxifyUrl
		 * @static
		 * @param {String} url The URL to modify
		 * @return {String} The modified URL
		 */
		ajaxifyUrl : function( url ) {
			var p = '_infuse=1&_ts='+(new Date()).getTime();
			if ( url.indexOf( '?#' ) >= 0 ) {
				return url.replace( /\?#/, '?'+p+'#' );
			}
			else if ( url.indexOf( '&#' ) > 0 ) {
				return url.replace( /&#/, '&'+p+'#' );
			}
			else if ( url.indexOf( '?' ) >= 0 ) {
				return url.replace( /\?/, '?'+p+'&' );
			}
			else if ( url.indexOf( '#' ) >= 0 ) {
				return url.replace( /#/, '?'+p+'#' );
			}
			else {
				return url + '?'+p;
			}
		}

	};

}(jQuery);

/**
 * <p>The Response API for the TDI AJAX. Provides a set of custom <em>tdi</em> events which can be used
 * to control or to react to the TDI responses.</p>
 * @class Response
 */
TDI.Ajax.Response = function($) {
	// Listen for ajax internal events
		$(document).bind( 'tdi:ajax:_start', function( evt, data ) {
			_start( data.xhr, data.settings, data.options );
		} );
		$(document).bind( 'tdi:ajax:_success', function( evt, data ) {
			_success( data.data, data.textStatus, data.xhr, data.options );
		} );
		$(document).bind( 'tdi:ajax:_error', function( evt, data ) {
			_error( data.xhr, data.textStatus, data.error, data.options );
		} );
		$(document).bind( 'tdi:ajax:_end', function( evt, data ) {
			_end( data.xhr, data.textStatus, data.options );
		} );

	// Supported Infusion instructions
		var _infusionInstructions = {
				'update'	: _onBeforeUpdate,
				'insert'	: _onBeforeInsert,
				'script'	: _onBeforeScript,
				'style'		: _onBeforeStyle,
				'reload'	: _onBeforeReload,
				'redirect'	: _onBeforeRedirect,
				'popup'		: _onBeforePopup
			};

	// a collection of new script tags which will be added after the response is done to preserve the execution order
		var _scriptTags = [];

	// a collection of responses used for the 'tdi:ajax:done' event
		var _responses = {
			updates : [],
			inserts : [],
			scripts : [],
			styles : [],
			popups : [],
			unknowns : []
		};

	// CALLBACKS -----------------------------------------------------------------
		/**
		 * <p>The default <em>start</em> callback.</p>
		 * @method _start
		 * @private
		 * @param {jqXHR} xhr The jqXHR object
		 * @param {Object} settings The Ajax settings
		 * @param {Object} options Additional request options
		 */
		function _start( xhr, settings, options ) {
			// xhr.setRequestHeader( 'X-Requested-Format', 'xml' );
			/**
			 * <p>Fires when the TDI request has started.</p>
			 * @event tdi:ajax:start
			 * @param {Event} evt The event object
			 * @param {Object} data The event data:
			 *   <dl>
			 *     <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code>
			 *       <span>The jqXHR object</span></dd>
			 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
			 *       <span>Additional request options</span></dd>
			 *     <dd><code><span>settings</span> <span>&lt;Array&gt;</span></code>
			 *       <span>The Ajax settings</span></dd>
			 *   </dl>
			 */
			$(options.involvedElms || document).trigger( 'tdi:ajax:start', [{
				xhr : xhr,
				options : options,
				settings : settings
			}] );
		}

		/**
		 * <p>The default <em>success</em> callback.</p>
		 * @method _success
		 * @private
		 * @param {jQuery} xml The response XML document
		 * @param {String} textStatus The status of the response
		 * @param {jqXHR} xhr The jqXHR object
		 * @param {Object} options Additional request options
		 */
		function _success( xml, textStatus, xhr, options ) {
			if ( !xml ) {
				_error( xhr, textStatus, null, options );
				return false;
			}

			var $xml = $(xml),
				status = $xml.find( 'status' );

			// check for status
				if ( status.text().toLowerCase() != 'ok' ) {
					_error( xhr, textStatus, status.text(), options );
				}

			// handle tags
				$xml.find("response > *:not(status)").each(function( ) {
					var instruction = this.tagName.toLowerCase();
					switch( instruction ) {
						case 'Script':
								// collect all script tags to a list, so they can be downloaded and executed in the preserved order
								_scriptTags.push( this );
							break;
						default:
								if (_infusionInstructions[ instruction ]) {
									_infusionInstructions[ instruction ]( this, options );
								}
								else {
									_onBeforeUnknown( this, options );
								}
							break;
					}
				});

				// download and execute the list of script tags
					_onBeforeScript( _scriptTags.shift(), options );

				// fire the custom ajax:done events
					var $involvedElms = $(options.involvedElms).filter(function(i, elm) {
						return document.body ? document.body.contains(elm) : document.contains(elm);
					});

					if ($involvedElms.length === 0) {
						$involvedElms = $(document);
					}

					/**
					 * <p>Fires when all TDI &lt;update&gt;s are done.</p>
					 * @event tdi:ajax:updatesDone
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>updates</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all updates</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:updatesDone', [{
						updates : _responses.updates,
						options : options
					}] );
					/**
					 * <p>Fires when all TDI &lt;insert&gt;s are done.</p>
					 * @event tdi:ajax:insertsDone
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>inserts</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all inserts</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:insertsDone', [{
						inserts : _responses.inserts,
						options : options
					}] );
					/**
					 * <p>Fires when all TDI &lt;script&gt;s are done.</p>
					 * @event tdi:ajax:scriptsDone
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>scripts</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all scripts</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:scriptsDone', [{
						scripts : _responses.scripts,
						options : options
					}] );
					/**
					 * <p>Fires when all TDI &lt;style&gt;s are done.</p>
					 * @event tdi:ajax:stylesDone
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>styles</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all styles</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:stylesDone', [{
						styles : _responses.styles,
						options : options
					}] );
					/**
					 * <p>Fires when all TDI &lt;popup&gt;s are done.</p>
					 * @event tdi:ajax:popupsDone
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>popups</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all popups</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:popupsDone', [{
						popups : _responses.popups,
						options : options
					}] );
					/**
					 * <p>Fires when all &lt;unknown&gt; TDI instructions are done.</p>
					 * @event tdi:ajax:unknownsDone
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>instructions</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all unknown instructions</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:unknownsDone', [{
						unknowns : _responses.unknowns,
						options : options
					}] );
					/**
					 * <p>Fires when all TDI actions are done.</p>
					 * @event tdi:ajax:done
					 * @param {Event} evt The event object
					 * @param {Object} data The event data:
					 *   <dl>
					 *     <dd><code><span>responses</span> <span>&lt;Array&gt;</span></code>
					 *       <span>The list of all TDI actions</span></dd>
					 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
					 *       <span>Additional request options</span></dd>
					 *   </dl>
					 */
					$involvedElms.trigger( 'tdi:ajax:done', [{
						responses : _responses,
						options : options
					}] );
		}

		/**
		 * <p>The default <em>error</em> callback.</p>
		 * @method _error
		 * @private
		 * @param {jqXHR} xhr The jqXHR object
		 * @param {String} textStatus The status of the response
		 * @param {String} error The error message
		 * @param {Object} options Additional request options
		 */
		function _error( xhr, textStatus, error, options ) {
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
			 *     <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code>
			 *       <span>The jqXHR object (see jQuery documentation for jQuery.ajax())</span></dd>
			 *     <dd><code><span>textStatus</span> <span>&lt;String&gt;</span></code>
			 *       <span>The XHR text status (if available)</span></dd>
			 *     <dd><code><span>options</span> <span>&lt;Array&gt;</span></code>
			 *       <span>Additional request options</span></dd>
			 *   </dl>
			 */
			$(document).trigger( 'tdi:ajax:error', [{
				status : xhr ? xhr.status : 'N/A',
				message : error || 'Invalid Ajax response. The response must be a valid XML.',
				xhr : xhr,
				textStatus : textStatus,
				options : options
			}] );
		}

		/**
		 * <p>The default <em>end</em> callback.</p>
		 * @method _end
		 * @private
		 */
		function _end( xhr, textStatus, options ) {
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
			$(options.involvedElms || document).trigger( 'tdi:ajax:end', [{
				options : options
			}] );
		}

	// RESPONSES -----------------------------------------------------------------
		/**
		 * <p>The beforeUpdate callback. It takes the &lt;update&gt; xml node, gets its data and triggers a custom event which
		 * can stop the default update action.</p>
		 *
		 * @method _onBeforeUpdate
		 * @private
		 * @param {XMLNode} tag The &lt;update&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeUpdate( tag, options ) {
			if ( !tag ) { return false; }

			var $tag = $(tag),
				target_id = $tag.attr( 'target' ),
				selector = $tag.attr( 'selector' ),
				target = selector ? $(selector) : $( '#' + target_id ),
				content = $.trim( $tag.text() ),
				replace = $tag.attr( 'replace' ),
				append = $tag.attr( 'append' ),
				prepend = $tag.attr( 'prepend' ),
				class_add = $tag.attr( 'class-add' ) || '',
				class_remove = $tag.attr( 'class-remove' ) || '',
				event_data = {
					target_id		: target_id,
					selector        : selector,
					target			: target,
					content			: content,
					content_empty	: (content.replace( /\&nbsp;/g, '' ).length === 0),
					replace			: replace,
					append			: append,
					prepend			: prepend,
					class_add		: class_add,
					class_remove	: class_remove,
					options			: options,
					tag					: $tag,
				};

			if ( target.length > 0 ) {
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
					 *     <dd><code><span>selector</span> <span>&lt;String&gt;</span></code>
					 *       <span>CSS selector for multiple targets</span></dd>
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
					 *     <dd><code><span>tag</span> <span>&lt;jQuery&gt;</span></code>
					 *       <span>The XML tag</span></dd>
					 *   </dl>
					 */
					target.first().trigger( 'tdi:ajax:beforeUpdate', event_data );

					_responses.updates.push( event_data );
			}
		}

		/**
		 * <p>The beforeInsert callback. It takes the &lt;insert&gt; xml node, gets its data and triggers a custom event which
		 * can stop the default insert action.</p>
		 *
		 * @method _onBeforeInsert
		 * @private
		 * @param {XMLNode} tag The &lt;insert&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeInsert( tag, options ) {
			if ( !tag ) { return false; }

			var $tag = $(tag),
				target_id = $tag.attr( 'target' ),
				selector = $tag.attr( 'selector' ),
				target = selector ? $(selector) : $( '#' + target_id ),
				content = $.trim( $tag.text() ),
				position = $tag.attr( 'position' ) || 'after',
				inserted_node,
				event_data = {
					target_id		: target_id,
					selector        : selector,
					target			: target,
					content			: content,
					position		: position,
					inserted_node	: inserted_node,
					options			: options,
          tag					: $tag,
				};

			if ( target.length > 0 ) {
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
					 *     <dd><code><span>tag</span> <span>&lt;jQuery&gt;</span></code>
					 *       <span>The XML tag</span></dd>
					 *   </dl>
					 */
					target.first().trigger( 'tdi:ajax:beforeInsert', event_data );

					_responses.inserts.push( event_data );
			}
		}

		/**
		 * <p>The beforeScript callback. It takes the &lt;script&gt; xml node, gets its data and triggers a custom event which
		 * can stop the default script action.</p>
		 *
		 * @method _onBeforeScript
		 * @private
		 * @param {XMLNode} tag The &lt;script&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeScript( tag, options ) {
			if ( !tag ) { return false; }

			var $tag = $(tag),
				contents = $.trim( $tag.text() ),
				src = $tag.attr( 'src' ),
				id = $tag.attr( 'id' ),
				event_data = {
					script_src	: src,
					script_data	: contents,
					script_id	: id,
					options		: options,
					tag				: $tag,
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
				 *     <dd><code><span>tag</span> <span>&lt;jQuery&gt;</span></code>
				 *       <span>The XML tag</span></dd>
				 *   </dl>
				 */
				$(document).trigger( 'tdi:ajax:beforeScript', event_data );

				_responses.scripts.push( event_data );
		}

		/**
		 * <p>The beforeStyle callback. It takes the &lt;style&gt; xml node, gets its data and triggers a custom event which
		 * can stop the default style action.</p>
		 *
		 * @method _onBeforeStyle
		 * @private
		 * @param {XMLNode} tag The &lt;style&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeStyle( tag, options ) {
			if ( !tag ) { return false; }

			var $tag = $(tag),
				src = $tag.attr( 'src' ),
				id = $tag.attr( 'id' ),
				event_data = {
					style_src	: src,
					style_id	: id,
					options		: options,
					tag				: $tag,
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
				 *     <dd><code><span>tag</span> <span>&lt;jQuery&gt;</span></code>
				 *       <span>The XML tag</span></dd>
				 *   </dl>
				 */
				$(document).trigger( 'tdi:ajax:beforeStyle', event_data );

				_responses.styles.push( event_data );
		}

		/**
		 * <p>The beforeReload callback. It just reloads the page.</p>
		 *
		 * @method _onBeforeReload
		 * @private
		 * @param {XMLNode} tag The &lt;reload&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeReload( tag, options ) {
			// fire custom events
				/**
				 * <p>Fires before the TDI <em>reload</em> takes place.</p>
				 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onReloadDefault</code>).</p>
				 * @event tdi:ajax:beforeReload
				 * @param {Event} evt The event object
				 */
				$(document).trigger( 'tdi:ajax:beforeReload', {options : options} );
		}

		/**
		 * <p>The before redirect callback. It takes the &lt;redirect&gt; xml node, gets its data and redirects
		 * the page to the given URL.</p>
		 *
		 * @method _onBeforeRedirect
		 * @private
		 * @param {XMLNode} tag The &lt;redirect&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeRedirect( tag, options ) {
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
					$(document).trigger( 'tdi:ajax:beforeRedirect', { href : href, options : options } );
			}
		}

		/**
		 * <p>The beforePopup callback. It takes the &lt;popup&gt; xml node, gets its data and triggers a custom event which
		 * can stop the default popup action.</p>
		 *
		 * @method _onBeforePopup
		 * @private
		 * @param {XMLNode} tag The &lt;popup&gt; xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforePopup( tag, options ) {
			if ( !tag ) { return false; }

			var $tag = $(tag),
				mode = $tag.attr( 'mode' ) || 'popup',
				href = $tag.attr( 'href' ),
				width = $tag.attr( 'width' ) || 600,
				height = $tag.attr( 'height' ) || 500,
				event_data = {
					href	: href,
					mode	: mode,
					width	: parseInt(width),
					height	: parseInt(height),
					options	: options
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
					_responses.popups.push( event_data );
			}
		}

		/**
		 * <p>The beforeUnknown callback. It takes an unknown instruction xml node, gets its data and triggers a custom event which
		 * can stop the default unknown action.</p>
		 *
		 * @method _onBeforeUnknown
		 * @private
		 * @param {XMLNode} tag The unknown instruction xml tag
		 * @param {Object} options Additional request options
		 */
		function _onBeforeUnknown( tag, options ) {
			if ( !tag ) { return false; }

			var $tag = $(tag),
				name = tag.tagName.toLowerCase(),
				beforeName = name.substr(0, 1).toUpperCase() + name.substr(1),
				attributes = tag.attributes,
				event_data = {
					_name : name,
					contents : $.trim( $tag.text() )
				};

			for (var i = 0, l = attributes.length; i < l; i++) {
				event_data[attributes[i].name] = attributes[i].value;
			}

			// fire custom events
				/**
				 * <p>Fires before the TDI instruction takes place.</p>
				 * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onUnknownDefault</code>).</p>
				 * @event tdi:ajax:beforeUnknown
				 * @param {Event} evt The event object
				 * @param {Object} data The event data:
				 *   <dl>
				 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
				 *       <span>Instruction contents</dd>
				 *     <dd><code><span>ATTRS_NAME</span> <span>&lt;String&gt;</span></code>
				 *       <span>Other attributes</dd>
				 *   </dl>
				 */
				$.event.special[ 'tdi:ajax:before' + beforeName ] = {
					_default : customDefault
				};

				$(document).trigger( 'tdi:ajax:before' + beforeName, event_data );
				_responses.unknowns.push( event_data );
		}

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
		 *     <dd><code><span>selector</span> <span>&lt;String&gt;</span></code>
		 *       <span>CSS selector for multiple targets</span></dd>
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
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *    </dl>
		 */
		function _onUpdateDefault( evt, data ) {
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
				 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
				 *       <span>Additional request options</span></dd>
				 *   </dl>
				 */
				data.target.trigger( 'tdi:ajax:update', data );
		}

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
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *   </dl>
		 */
		function _onInsertDefault( evt, data ) {
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
				 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
				 *       <span>Additional request options</span></dd>
				 *   </dl>
				 */
				data.target.trigger( 'tdi:ajax:insert', data );
		}

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
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 * </dl>
		 */
		function _onScriptDefault( evt, data ) {
			var scripts = _scriptTags,
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
						data.script_node_inline = s;
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
						 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
						 *       <span>Additional request options</span></dd>
						 *   </dl>
						 */
						$(document).trigger( 'tdi:ajax:script', data );

					// process next script
						_onBeforeScript( scripts.shift() );
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
		}

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
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *   </dl>
		 */
		function _onStyleDefault( evt, data ) {
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
							 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
							 *       <span>Additional request options</span></dd>
							 *   </dl>
							 */
							$(document).trigger( 'tdi:ajax:style', data );
					}
				} );
			}
		}

		/**
		 * <p>The reload default response handler. Reloads the page.</p>
		 * @method _onReloadDefault
		 * @private
		 * @param {Object} data The reload data object
		 *   <dl>
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *   </dl>
		 */
		function _onReloadDefault( evt, data ) {
			window.location.reload( true );
		}

		/**
		 * <p>The redirect default response handler. Redirects the page to a given URL.</p>
		 * @method _onRedirectDefault
		 * @private
		 * @param {Object} evt The event object
		 * @param {Object} data The redirect data object:
		 *   <dl>
		 *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
		 *       <span>URL of the redirect</span></dd>
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *   </dl>
		 */
		function _onRedirectDefault( evt, data ) {
			window.location.assign( data.href );
		}

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
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *   </dl>
		 */
		function _onPopupDefault( evt, data ) {
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
				 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
				 *       <span>Additional request options</span></dd>
				 *   </dl>
				 */
				$(document).trigger( 'tdi:ajax:popup', data );
		}

		/**
		 * <p>The unknown instruction default response handler.</p>
		 * @method _onUnknownDefault
		 * @private
		 * @param {Object} evt The event object
		 * @param {Object} data The dialog data object:
		 *   <dl>
		 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
		 *       <span>Instruction contents</span></dd>
		 *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
		 *       <span>Additional request options</span></dd>
		 *   </dl>
		 */
		function _onUnknownDefault( evt, data ) {
			// trigger the dialog event
				/**
				 * <p>Fires after the TDI unknown instruction takes place.</p>
				 * @event tdi:ajax:unknown
				 * @param {Event} evt The event object
				 * @param {Object} data The event data:
				 *   <dl>
				 *     <dd><code><span>contents</span> <span>&lt;String&gt;</span></code>
				 *       <span>Instruction contents</dd>
				 *     <dd><code><span>ATTRS_NAME</span> <span>&lt;String&gt;</span></code>
				 *       <span>Other attributes</dd>
				 *   </dl>
				 */
				$(document).trigger( 'tdi:ajax:' + data._name, data );
		}

	// TDI Ajax custom events -------------------------------------------------
		var i,
			customHandlers = {
				'tdi:ajax:beforeUpdate'		: _onUpdateDefault,
				'tdi:ajax:beforeInsert'		: _onInsertDefault,
				'tdi:ajax:beforeScript'		: _onScriptDefault,
				'tdi:ajax:beforeStyle'		: _onStyleDefault,
				'tdi:ajax:beforeReload'		: _onReloadDefault,
				'tdi:ajax:beforeRedirect'	: _onRedirectDefault,
				'tdi:ajax:beforePopup'		: _onPopupDefault
			},
			customDefault = function( evt, data ) {
				if (customHandlers[ evt.type ]) {
					customHandlers[ evt.type ].call( this, evt, ($.isArray(data) ? data[1] : data) );
				}
				else {
					_onUnknownDefault.call( this, evt, ($.isArray(data) ? data[1] : data) );
				}
			};

		for ( i in customHandlers ) {
			$.event.special[ i ] = {
				_default : customDefault
			};
		}

	// PUBLIC STUFF
		return {};

}(jQuery);
