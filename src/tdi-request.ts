// @ts-nocheck
import * as tdi from './tools';
import { Request as RequestType, Settings } from './types/types';

/**
 * <p>The Request API for the TDI Ajax. Provides methods to send TDI requests.</p>
 * @namespace Request
 * @memberOf TDI.Ajax
 */
const Request: RequestType = {
  /**
   * <p>Sends the Ajax request and calls the needed callback methods.</p>
   * @function send
   * @memberOf TDI.Ajax.Request
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
  send(url, options) {
    options = options || {};
    options.url = tdi.ajaxifyUrl(url);
    options.xhrFields = options.xhrFields || {};
    options.method = options.type || options.method || TDI.config.method;
    options.async = !options.sync;
    options.data = options.data || '';
    options.dataType = options.dataType || 'xml';
    options.trigger = options.trigger || document.body;
    const trigger: HTMLElement = options.trigger;
    const settings: Settings = { ...options };

    settings.beforeSend = settings => {
      const res = options.beforeStart && options.beforeStart(settings, options);
      if (typeof res === 'undefined' || res === true) {
        tdi.trigger(trigger, 'tdi:ajax:_start', {
          settings,
          options,
        });

        // TDI.Ajax.Response._start( xhr, settings, options );

        if (options.start) {
          options.start(settings, options);
        }

        return true;
      }

      return false;
    };

    settings.success = async function(xhr) {
      const { statusText: textStatus } = xhr;
      const data = await xhr.text();

      tdi.trigger(trigger, 'tdi:ajax:_success', {
        textStatus,
        xhr,
        data,
        options,
      });

      if (options.success) {
        options.success(data, textStatus, options);
      }
    };

    settings.error = function(xhr) {
      tdi.trigger(trigger, 'tdi:ajax:_error', { xhr, options });

      // TDI.Ajax.Response._error( xhr, textStatus, error, options );

      if (options.error) {
        options.error(xhr, options);
      }
    };

    settings.complete = function(xhr, textStatus) {
      const res = options.beforeEnd && options.beforeEnd(textStatus, options);
      if (typeof res === 'undefined' || res === true) {
        tdi.trigger(trigger, 'tdi:ajax:_end', {
          textStatus,
          options,
        });

        // TDI.Ajax.Response._end( xhr, textStatus, options );

        if (options.end) {
          options.end(textStatus, options);
        }
      }
    };

    return (
      tdi
        .ajax(settings.url, settings)
        // .then( res => res.text() )
        .then(settings.success)
        .catch(settings.error)
        .finally(settings.complete)
    );
  },

  /**
   * <p>Submits a form using an Iframe (fake Ajax call).</p>
   * @function sendForm
   * @memberOf TDI.Ajax.Request
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
  sendForm: function(form: HTMLFormElement, options: any) {
    options = options || {};

    const submitButton = form._submitButton;
    const url = tdi.getDataAttr(form, 'ajax-url') || form.action;

    options.headers = options.headers || {};

    options.method = (options.method || form.method).toUpperCase();
    options.trigger = form;

    if (submitButton) {
      submitButton.classList.add('loading');
    }

    options.data = new FormData(form);

    return TDI.Ajax.Request.send(url, options);
  },
};

export default Request;
