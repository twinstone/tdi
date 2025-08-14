// @ts-nocheck

import * as tdi from './tools';
import { TdiAjax } from './types/types';

const Ajax: TdiAjax = {
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
   * @function send
   * @memberOf TDI.Ajax
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
  send(elm, callbacks) {
    if (!elm || elm.nodeType !== Node.ELEMENT_NODE) {
      // TODO: error logging?
      throw new Error('Ajax.send: not a valid element');
    }
    callbacks = callbacks || {};

    const name = elm.getAttribute('name');
    const value = elm.value;
    const confirm = elm.dataset.confirm;

    const relatedAncestorSelector = tdi.getDataAttr(elm, 'related-ancestor');
    const relatedAncestor = relatedAncestorSelector
      ? elm.closest(relatedAncestorSelector)
      : null;
    const related = [];
    const getRelatedElm = (selector: string | null) => {
      const _relatedElm = selector ? document.querySelector(selector) : null;
      if (_relatedElm) {
        related.push(_relatedElm);
      }
      return _relatedElm;
    };

    if (relatedAncestor) {
      related.push(relatedAncestor);
    }
    getRelatedElm(tdi.getDataAttr(elm, 'related-element'));
    if (elm._submitButton) {
      related.push(elm._submitButton);
    }
    getRelatedElm(elm.rel);

    const involvedElms = [elm].concat(related);
    const elmTriggerGroup = tdi.getDataAttr(elm, 'trigger-group');
    const triggerGroup = elmTriggerGroup
      ? document.querySelectorAll(elmTriggerGroup)
      : [];

    let url = elm.getAttribute('data-ajax-url') || elm.href || elm.action;
    const method = tdi.getDataAttr(elm, '-ajax-method') || elm.method;
    const xhrFields = tdi.getDataAttr(elm, 'ajax-xhr-fields') || {};
    const data = {};

    // if the URL is empty, try to use $elm.value
    if ((url === '' || url === undefined) && value) {
      url = value;
    }

    // if the element has a name and value, append it to the GET URL
    if (name && value) {
      if (elm.matches('input[type=checkbox]') && elm.checked === false) {
        data[name] = 0;
      } else {
        data[name] = value;
      }
    }

    // check for obstacles
    if (elm.matches('[disabled], .disabled')) {
      return;
    }

    if (confirm && !window.confirm(confirm)) {
      return;
    }

    const _options = {
      beforeStart: function() {
        const res =
          callbacks.beforeStart && callbacks.beforeStart.apply(this, arguments);
        if (typeof res === 'undefined' || res === true) {
          tdi.batchClass(involvedElms, 'add', 'loading');

          triggerGroup.forEach(trigger => {
            if (!_hasClass(trigger, 'disabled') && !trigger.disabled) {
              trigger.classList.add('disabled');
              trigger.disabled = true;
              trigger._disabled = true;
            }
          });

          if (callbacks.start) {
            callbacks.start.apply(this, arguments);
          }

          return true;
        }

        return false;
      },

      beforeEnd: function() {
        const res =
          callbacks.beforeEnd && callbacks.beforeEnd.apply(this, arguments);
        if (typeof res === 'undefined' || res === true) {
          tdi.batchClass(involvedElms, 'remove', 'loading');
          // $triggerGroup.each(function (i, $trigger) {
          triggerGroup.forEach(trigger => {
            if (trigger._disabled === true) {
              trigger.classList.remove('disabled');
              delete trigger.disabled;
              trigger._disabled = false;
            }
          });

          if (callbacks.end) {
            callbacks.end.apply(this, arguments);
          }
        }
      },

      data: data,
      method: method,
      trigger: elm,
      involvedElms: involvedElms,
      xhrFields: xhrFields,
    };

    if (elm.matches('form')) {
      _options.end = function() {
        const _submitActionElm = elm.querySelector('input.submit-action');
        elm._submitButton = null;
        if (_submitActionElm) {
          elm.removeChild(_submitActionElm);
        }
      };

      return TDI.Ajax.Request.sendForm(elm, _options);
    } else {
      return TDI.Ajax.Request.send(url, _options);
    }
  },
};

export default Ajax;
