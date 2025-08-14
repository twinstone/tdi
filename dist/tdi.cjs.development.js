/*!
 * Twinstone TDI (https://github.com/twinstone/tdi)
 *
 * Version: 2.0.11-beta
 * Build: 2025-09-26 192954
 *
 * Copyright Etnetera a.s. https://www.etnetera.cz
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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = !1,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = !0, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), !0), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}

/**
 * Add event event listener to element(s)
 */
function on(eventName, handleFn, selectors) {
  document.body.addEventListener(eventName, function (evt) {
    var selectorsChecks = selectors && selectors.length;
    if (selectorsChecks) {
      if (selectors.some(function (selector) {
        return evt.target.matches(selector);
      })) {
        handleFn(evt);
      }
    } else {
      handleFn(evt);
    }
  });
}
/**
 * Remove known event handlers from element(s)
 */
function off(selectors, eventName, handleFn) {
  var elms = document.querySelectorAll(selectors);
  elms.forEach(function (elm) {
    if (eventName && handleFn) {
      elm.removeEventListener(eventName, handleFn);
    } else {
      offAllEvents(elm);
    }
  });
}
/**
 * Remove all events from an element, or its child nodes
 */
function offAllEvents(target, fromChildNodes) {
  var _target = typeof target === 'string' ? document.querySelector(target) : target;
  if (!_target) return;
  if (fromChildNodes) {
    _target.querySelectorAll('*').forEach(function (child) {
      offAllEvents(child);
    });
  } else {
    var clonedTarget = _target.cloneNode(true);
    if (_target.parentNode) {
      _target.parentNode.replaceChild(clonedTarget, _target);
    }
  }
}
/**
 * Creates custom event
 */
function customEvent(eventName, detail) {
  if (!eventName) return null;
  var event = new CustomEvent(eventName, {
    detail: detail,
    bubbles: true,
    cancelable: true
  });
  return event;
}
/**
 * Dispatches custom event on provided element.
 */
function trigger(target, eventName, detail) {
  var _event = customEvent(eventName, detail);
  if (!_event) return null;
  if (target instanceof NodeList) {
    return target.forEach(function (elm) {
      return elm.dispatchEvent(_event);
    });
  } else {
    return target.dispatchEvent(_event);
  }
}
/**
 * Shorthand method to get value of data attr from element
 */
function getDataAttr(elm, dataAttr) {
  if (elm && elm.dataset && dataAttr) {
    if (dataAttr.indexOf('data-') === 0) throw new Error('getDataAttr: dataAttr should not begin with "data-"');
    return elm.getAttribute('data-' + dataAttr);
  }
  return null;
}
/**
 * Add or remove css classes to element(s)
 */
function batchClass(elms, method, className) {
  Array.from(elms).forEach(function (elm) {
    return elm.classList[method](className);
  });
}
/**
 * Whether elm has class
 */
function hasClass(elm, className) {
  return elm.classList.contains(className);
}
function prepareFormRequest(options) {
  var fetchOptions = _extends({}, options);
  if (options.method.toUpperCase() === 'POST') {
    fetchOptions.body = options.data;
  } else {
    fetchOptions.url = (fetchOptions.url || '') + prepareUrlParams(options.data || {}, fetchOptions.url);
  }
  return fetchOptions;
}
/**
 * Takes serialized form data and prepares it for url params
 */
function prepareUrlParams(data, url) {
  var params = new URLSearchParams();
  var startingSymbol = url && url.indexOf('?') > -1 ? '&' : '?';
  var _loop = function _loop(key) {
    if (Array.isArray(data[key])) {
      data[key].forEach(function (value) {
        params.append(key, value);
      });
    } else {
      params.append(key, data[key]);
    }
  };
  for (var key in data) {
    _loop(key);
  }
  return params.toString() ? startingSymbol + params.toString() : '';
}
/**
 * Wrapper for ajax calls to call beforeSend handlers
 */
function ajax(_x, _x2) {
  return _ajax.apply(this, arguments);
}
/**
 * <p>Modifies the URL and adds an Ajax (tdi) flag.</p>
 * @function ajaxifyUrl
 * @memberOf TDI.Ajax.Request
 * @static
 * @param {String} url The URL to modify
 * @return {String} The modified URL
 */
function _ajax() {
  _ajax = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url, options) {
    var fetchOptions, response;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          if (options && options.beforeSend) {
            options.beforeSend(options);
          }
          // prepare payload
          fetchOptions = options.data ? prepareFormRequest(options) : options; // set custom headers
          if (typeof TDI !== 'undefined' && TDI.config) {
            fetchOptions.headers = _extends({}, fetchOptions.headers, TDI.config.headers);
          }
          _context.n = 1;
          return fetch(fetchOptions.url || url, fetchOptions).then(function (res) {
            if (res.ok) {
              return res;
            } else {
              throw res;
            }
          });
        case 1:
          response = _context.v;
          return _context.a(2, response);
      }
    }, _callee);
  }));
  return _ajax.apply(this, arguments);
}
function ajaxifyUrl(url) {
  var p = '_infuse=1&_ts=' + new Date().getTime();
  if (url.indexOf('?#') >= 0) {
    return url.replace(/\?#/, '?' + p + '#');
  } else if (url.indexOf('&#') > 0) {
    return url.replace(/&#/, '&' + p + '#');
  } else if (url.indexOf('?') >= 0) {
    return url.replace(/\?/, '?' + p + '&');
  } else if (url.indexOf('#') >= 0) {
    return url.replace(/#/, '?' + p + '#');
  } else {
    return url + '?' + p;
  }
}
/**
 * Parse the HTML from string and returns it as a DOM element.
 */
function parseHtmlFromString(content, contentType) {
  var parser = new DOMParser();
  return parser.parseFromString(content, contentType || 'text/html');
}
/**
 * Parse the XML response and returns content as Node.
 */
function parseXMLResponse(_x3) {
  return _parseXMLResponse.apply(this, arguments);
}
/**
 * Parse the XML content and remove the CDATA tags.
 */
function _parseXMLResponse() {
  _parseXMLResponse = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(res) {
    var parser, data, replacedData, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          parser = new DOMParser();
          if (!(typeof res === 'string')) {
            _context2.n = 1;
            break;
          }
          _t = res;
          _context2.n = 3;
          break;
        case 1:
          _context2.n = 2;
          return res.text();
        case 2:
          _t = _context2.v;
        case 3:
          data = _t;
          replacedData = data.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          return _context2.a(2, parser.parseFromString(replacedData, 'text/xml').firstChild);
      }
    }, _callee2);
  }));
  return _parseXMLResponse.apply(this, arguments);
}
function parseXMLContent(content) {
  return content.replace('<![CDATA[', '').replace(']]>', '').trim();
}
/**
 * <p>Loads an external javascript file. It uses a 'script tag' technique instead of AJAX,
 * so the loaded javascript file is debuggable in tools like Firebug.</p>
 * @function getScript
 * @memberOf TDI.Tools
 * @param {String} url URL of the external javascript file
 * @param {Object} options Additional options
 *   <dl>
 *     <dd><code><span>complete</span> <span>&lt;Function&gt;</span></code>
 *       <span>It is called when the javascript is fully loaded.</span></dd>
 *     <dd><code><span>id</span> <span>&lt;String&gt;</span></code>
 *       <span>An optional <em>id</em> attribute of the script tag.</span></dd>
 *     <dd><code><span>nonce</span> <span>&lt;String&gt;</span></code>
 *       <span>An optional <em>nonce</em> attribute of the script tag.</span></dd>
 *   </dl>
 */
function getScript(url, options) {
  var loaded = false;
  var node;
  if (url) {
    options = options || {};
    node = document.createElement('script');
    node.type = 'text/javascript';
    node.src = url;
    if (options.id) {
      node.id = options.id;
    }
    if (options.nonce) {
      node.setAttribute('nonce', options.nonce);
      node.nonce = options.nonce;
    }
    if (options.complete) {
      /*
       IE supports only the `onreadystatechange` event.
       Other browsers (Chrome, Firefox, Opera, Safari) support the `onload` event.
       IE9 supports both. But we make sure, that only one callback is fired.
       */
      node.onreadystatechange = function () {
        var rs = this.readyState;
        if (!loaded && (rs === 'loaded' || rs === 'complete')) {
          loaded = true;
          node.onreadystatechange = null;
          options.complete(node);
        }
      };
      node.onload = function () {
        if (!loaded) {
          loaded = true;
          options.complete(node);
        }
      };
    }
    document.getElementsByTagName('head')[0].appendChild(node);
  }
}
/**
 * <p>Loads an external CSS file. It uses AJAX to load the CSS data to provide
 * the <em>complete</em> event.</p>
 * @function getStyle
 * @memberOf TDI.Tools
 * @param {String} url URL of the external CSS file
 * @param {Object} options Additional options
 *   <dl>
 *     <dd><code><span>complete</span> <span>&lt;Function&gt;</span></code>
 *       <span>It is called when the CSS file is fully loaded.</span></dd>
 *     <dd><code><span>id</span> <span>&lt;String&gt;</span></code>
 *       <span>An optional <em>id</em> attribute of the style tag.</span></dd>
 *   </dl>
 */
function getStyle(url, options) {
  var node;
  if (url) {
    options = options || {};
    node = document.createElement('link');
    node.rel = 'stylesheet';
    node.type = 'text/css';
    node.media = options.media || 'screen';
    node.href = url;
    if (options.id) {
      node.id = options.id;
    }
    document.getElementsByTagName('head')[0].appendChild(node);
    if (options.complete) {
      options.complete(node);
    }
  }
}
function prepareContent(content) {
  var doc = parseHtmlFromString(content);
  var responseContent = doc.body.childNodes;
  var contentFragment = document.createDocumentFragment();
  responseContent.forEach(function (elm) {
    if (elm.nodeName.toUpperCase() === 'SCRIPT' && elm instanceof HTMLScriptElement) {
      // Create a new <script>
      var newScriptTag = document.createElement('script');
      // Copy attributes
      for (var _i = 0, _Array$from = Array.from(elm.attributes); _i < _Array$from.length; _i++) {
        var _Array$from$_i = _Array$from[_i],
          name = _Array$from$_i.name,
          value = _Array$from$_i.value;
        newScriptTag.setAttribute(name, value);
      }
      newScriptTag.textContent = elm.textContent;
      contentFragment.appendChild(newScriptTag);
    } else if (elm instanceof Node) {
      contentFragment.appendChild(elm);
    }
  });
  return contentFragment;
}

var TDI$1 = /*#__PURE__*/function () {
  var TDI = window.TDI || {};
  var tdiScriptTag = document.currentScript;
  var NONCE = tdiScriptTag ? tdiScriptTag.nonce || /*#__PURE__*/tdiScriptTag.getAttribute('nonce') : undefined;
  var WINDOW_UNLOAD = 'unload';
  var WINDOW_PAGEHIDE = 'pagehide';

  /**
   * <p>Basic Ajax functionality for the TDI library.
   * Used to bind DOM events to desired HTML elements
   * and send the TDI request when the events fire.</p>
   * <p>Requires TDI global object.</p>
   * @namespace Ajax
   * @memberOf TDI
   */
  TDI.Ajax = /*#__PURE__*/function () {
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
      linkClick: ['a.ajaxlink', 'a.tdi', 'a.infuse'],
      formSubmit: ['form.ajaxform', 'form.tdi', 'form.infuse'],
      formButtonActivate: ['form.ajaxform [type=submit]', 'form.tdi [type=submit]', 'form.infuse [type=submit]'],
      fieldChange: ['select.ajaxselect', 'select.tdi', 'select.infuse', 'input[type=checkbox].tdi', 'input[type=checkbox].infuse', 'input[type=radio].tdi', 'input[type=radio].infuse'],
      fieldSubmit: ['input[type=text].tdi', 'input[type=text].infuse']
    };

    /**
     * <p>Bind all the needed DOM events for Ajax enabled elements:</p>
     * <ul>
     *   <li><code>onclick</code> - ajax enabled links and submit buttons</li>
     *   <li><code>onsubmit</code> - ajax enabled forms</li>
     *   <li><code>onchange</code> - ajax enabled form fields</li>
     *   <li><code>onunload</code> - window</li>
     * </ul>
     * @function _bindUI
     * @private
     */
    function _bindUI() {
      on('click', _onBeforeLinkClick, _delegateSelectors.linkClick);
      on('submit', _onBeforeFormSubmit, _delegateSelectors.formSubmit);
      on('click', _onFormButtonActivate, _delegateSelectors.formButtonActivate);
      on('change', _onFieldChange, _delegateSelectors.fieldChange);
      on('keydown', _onFieldSubmit, _delegateSelectors.fieldSubmit);
      on('pagehide', _unbindUI, document.body);
      on('tdi:ajax:beforeLinkClick', _onLinkClick);
      on('tdi:ajax:beforeFormSubmit', _onFormSubmit);
    }

    /**
     * <p>Unbind all previously attached DOM event handlers:</p>
     * <ul>
     *   <li><code>onclick</code></li>
     *   <li><code>onsubmit</code></li>
     *   <li><code>onchange</code></li>
     *   <li><code>onunload</code></li>
     * </ul>
     * @function _unbindUI
     * @private
     */
    function _unbindUI(evt) {
      if (evt && evt.persisted) {
        return;
      }
      // removeEventListener
      off(_delegateSelectors.linkClick, 'click', _onLinkClick);
      off(_delegateSelectors.formSubmit, 'submit', _onBeforeFormSubmit);
      off(_delegateSelectors.formButtonActivate, 'click', _onFormButtonActivate);
      off(_delegateSelectors.fieldChange, 'change', _onFieldChange);
      off(_delegateSelectors.fieldSubmit, 'keydown', _onFieldSubmit);
      if (evt) {
        window[evt.type === 'pagehide' ? WINDOW_PAGEHIDE : WINDOW_UNLOAD] = true;
      }
    }

    // EVENT HANDLERS ------------------------------------------------------------
    /**
     * <p>The link onclick event handler. Used to trigger the preventable <code>tdi:ajax:beforeLinkClick</code> event.</p>
     * @function _onBeforeLinkClick
     * @fires TDI#tdi:ajax:beforeLinkClick
     * @private
     * @param {Event} evt The event object
     */
    function _onBeforeLinkClick(evt) {
      var target = evt.target;
      if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.button && evt.button === 1) {
        return;
      }
      evt.preventDefault();

      /**
       * <p>Fires before the link is clicked (before the link action is executed).</p>
       * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>_onLinkClick</code>).</p>
       * @event tdi:ajax:beforeLinkClick
       * @memberOf TDI
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {jQuery} link The link object
       */
      trigger(target, 'tdi:ajax:beforeLinkClick');
    }

    /**
     * <p>The link onclick event handler.</p>
     * @function _onLinkClick
     * @private
     * @param {Event} evt The event object
     */
    function _onLinkClick(evt) {
      TDI.Ajax.send(evt.target);
    }

    /**
     * <p>The form onsubmit event handler. Used to trigger the preventable <code>tdi:ajax:beforeFormSubmit</code> event.</p>
     * @function _onBeforeFormSubmit
     * @fires TDI#tdi:ajax:beforeFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    function _onBeforeFormSubmit(evt) {
      var form = evt.target;
      evt.preventDefault();

      /**
       * <p>Fires before the form is submited.</p>
       * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>_onFormSubmit</code>).</p>
       * @event tdi:ajax:beforeFormSubmit
       * @memberOf TDI
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {jQuery} form The form object
       */
      trigger(form, 'tdi:ajax:beforeFormSubmit', {
        form: form
      });
    }

    /**
     * <p>The form onsubmit event default method.</p>
     * @function _onFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    function _onFormSubmit(evt) {
      TDI.Ajax.send(evt.target);
    }

    /**
     * <p>Saves the <code>name</code> and <code>value</code> of the submit button which the user used to
     * submit the form.</p>
     * @function _onFormButtonActivate
     * @private
     * @param {Event} evt The event object
     */
    // FIXME: je tahle metoda orpavdu potreba?
    function _onFormButtonActivate(evt) {
      var button = evt.target;
      var form = button.form;

      // save the used submit button
      form._submitButton = button;
      if (button.name) {
        // remove the old field
        form.querySelector('input.submit-action').remove();

        // create a new field with the buttons name and value
        var _newBtn = document.createElement('input');
        _newBtn.type = 'hidden';
        _newBtn.name = button.name;
        _newBtn.value = button.value;
        _newBtn.classList.add('submit-action');
        form.appendChild(_newBtn);
      }
    }

    /**
     * <p>The field onchange event handler. If the field has the <code>data-ajax-url</code> attribute
     * it is used as the trigger element. Otherwise, the fields form is considered to be the trigger
     * element.</p>
     * @function _onFieldChange
     * @private
     * @param {Event} evt The event object
     */
    function _onFieldChange(evt) {
      var target = evt.currentTarget;
      if (target.dataset.ajaxUrl) {
        TDI.Ajax.send(target);
      } else {
        target.form.submit();
      }
    }

    /**
     * <p>The field onkeydown event handler. If the field has the <code>data-ajax-url</code> attribute,
     * a TDI ajax request is sent when Enter is pressed.</p>
     * @function _onFieldSubmit
     * @private
     * @param {Event} evt The event object
     */
    function _onFieldSubmit(evt) {
      var target = evt.currentTarget;
      if (evt.keyCode === 13) {
        evt.preventDefault();
        if (target.dataset.ajaxUrl) {
          TDI.Ajax.send(target);
        } else {
          target.form.submit();
        }
      }
    }

    // initialization
    document.addEventListener('DOMContentLoaded', _bindUI);

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
      send: function send(elm, callbacks) {
        if (!elm || elm.nodeType !== Node.ELEMENT_NODE) {
          // TODO: error logging?
          throw new Error('Ajax.send: not a valid element');
        }
        callbacks = callbacks || {};
        var name = elm.getAttribute('name');
        var value = elm.value;
        var confirm = elm.dataset.confirm;
        var relatedAncestor = elm.closest(getDataAttr(elm, 'related-ancestor'));
        var related = [];
        var getRelatedElm = function getRelatedElm(selector) {
          var _relatedElm = selector ? document.querySelector(selector) : null;
          if (_relatedElm) {
            related.push(_relatedElm);
          }
          return _relatedElm;
        };
        if (relatedAncestor) {
          related.push(relatedAncestor);
        }
        getRelatedElm(getDataAttr(elm, 'related-element'));
        if (elm._submitButton) {
          related.push(elm._submitButton);
        }
        getRelatedElm(elm.rel);
        var involvedElms = [elm].concat(related);
        var triggerGroup = document.querySelectorAll(getDataAttr(elm, 'trigger-group'));
        var url = elm.getAttribute('data-ajax-url') || elm.href || elm.action;
        var method = getDataAttr(elm, '-ajax-method') || elm.method;
        var xhrFields = getDataAttr(elm, 'ajax-xhr-fields') || {};
        var data = {};

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
        var _options = {
          beforeStart: function beforeStart() {
            var res = callbacks.beforeStart && callbacks.beforeStart.apply(this, arguments);
            if (typeof res === 'undefined' || res === true) {
              batchClass(involvedElms, 'add', 'loading');
              triggerGroup.forEach(function (trigger) {
                if (!hasClass(trigger, 'disabled') && !trigger.disabled) {
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
          beforeEnd: function beforeEnd() {
            var res = callbacks.beforeEnd && callbacks.beforeEnd.apply(this, arguments);
            if (typeof res === 'undefined' || res === true) {
              batchClass(involvedElms, 'remove', 'loading');
              triggerGroup.forEach(function (trigger) {
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
          xhrFields: xhrFields
        };
        if (elm.matches('form')) {
          _options.end = function () {
            var _submitActionElm = elm.querySelector('input.submit-action');
            elm._submitButton = null;
            if (_submitActionElm) {
              elm.removeChild(_submitActionElm);
            }
          };
          return TDI.Ajax.Request.sendForm(elm, _options);
        } else {
          return TDI.Ajax.Request.send(url, _options);
        }
      }
    };
  }();

  /**
   * <p>The Request API for the TDI Ajax. Provides methods to send TDI requests.</p>
   * @namespace Request
   * @memberOf TDI.Ajax
   */
  TDI.Ajax.Request = /*#__PURE__*/function () {
    return {
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
       *           <dd><code><span>statusText</span> <span>&lt;String&gt;</span></code> Status of the request ("success", "notmodified", "error", "timeout", "abort", or "parsererror")</dd>
       *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</dd>
       *         </dl>
       *       </dd>
       *     <dd><code><span>end</span> <span>&lt;Function&gt;</span></code>
       *         <span>Function to be called after the request is complete. This function is called with parameters:</span>
       *         <dl>
       *           <dd><code><span>xhr</span> <span>&lt;jqXHR&gt;</span></code> The jqXHR object</dd>
       *           <dd><code><span>statusText</span> <span>&lt;String&gt;</span></code> Status of the request ("success", "notmodified", "error", "timeout", "abort", or "parsererror")</dd>
       *           <dd><code><span>options</span> <span>&lt;Object&gt;</span></code> Aditional request options</>
       *         </dl>
       *       </dd>
       *   </dl>
       */
      send: function send(url, options) {
        options = options || {};
        options.url = ajaxifyUrl(url);
        options.xhrFields = options.xhrFields || {};
        options.method = options.type || options.method || TDI.config.method;
        options.async = !options.sync;
        options.data = options.data || '';
        options.dataType = options.dataType || 'xml';
        options.trigger = options.trigger || document.body;
        var settings = _extends({}, options);
        settings.beforeSend = function (settings) {
          var res = options.beforeStart && options.beforeStart(settings, options);
          if (typeof res === 'undefined' || res === true) {
            trigger(options.trigger, 'tdi:ajax:_start', {
              settings: settings,
              options: options
            });

            // TDI.Ajax.Response._start( xhr, settings, options );

            if (options.start) {
              options.start(settings, options);
            }
            return true;
          }
          return false;
        };
        settings.success = /*#__PURE__*/function () {
          var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(response) {
            var statusText, data;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  statusText = response.statusText;
                  _context.n = 1;
                  return response.text();
                case 1:
                  data = _context.v;
                  trigger(options.trigger, 'tdi:ajax:_success', {
                    statusText: statusText,
                    xhr: response,
                    data: data,
                    options: options
                  });
                  if (options.success) {
                    options.success(data, statusText, options);
                  }
                  return _context.a(2, response);
              }
            }, _callee);
          }));
          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }();
        settings.error = function (response) {
          trigger(options.trigger, 'tdi:ajax:_error', {
            xhr: response,
            options: options
          });

          // TDI.Ajax.Response._error( xhr, statusText, error, options );

          if (options.error) {
            options.error(response, options);
          }
          return response;
        };
        settings.complete = function () {
          var res = options.beforeEnd && options.beforeEnd(options);
          if (typeof res === 'undefined' || res === true) {
            trigger(options.trigger, 'tdi:ajax:_end', {
              options: options
            });

            // TDI.Ajax.Response._end( xhr, statusText, options );

            if (options.end) {
              options.end(options);
            }
          }
        };
        ajax(settings.url, settings)
        // .then( res => res.text() )
        // .then(settings.success)
        .then(settings.success)["catch"](settings.error)["finally"](settings.complete);
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
      sendForm: function sendForm(form, options) {
        options = options || {};
        var submitButton = form._submitButton;
        var url = getDataAttr(form, 'ajax-url') || form.action;
        options.headers = options.headers || {};
        options.method = (options.method || form.method).toUpperCase();
        options.trigger = form;
        if (submitButton) {
          submitButton.classList.add('loading');
        }
        options.data = new FormData(form);
        return TDI.Ajax.Request.send(url, options);
      }
    };
  }();

  /**
   * <p>The Response API for the TDI AJAX. Provides a set of custom <em>tdi</em> events which can be used
   * to control or to react to the TDI responses.</p>
   * @namespace Response
   * @memberOf TDI.Ajax
   */
  TDI.Ajax.Response = function () {
    var i;
    var customHandlers;
    var customDefault;
    var customPostDispatch;
    var _infusionInstructions;
    var _scriptTags;
    var _responses;
    var _scriptsDone;

    // Listen for ajax internal events
    on('tdi:ajax:_start', function (evt) {
      _start(evt.detail.settings, evt.detail.options);
    });
    on('tdi:ajax:_success', function (evt) {
      var _evt$detail = evt.detail,
        data = _evt$detail.data,
        statusText = _evt$detail.statusText,
        xhr = _evt$detail.xhr,
        options = _evt$detail.options;
      _success(data, statusText, xhr, options);
    });
    on('tdi:ajax:_error', function (evt) {
      var _evt$detail2 = evt.detail,
        xhr = _evt$detail2.xhr,
        options = _evt$detail2.options;
      _error(xhr, options);
    });
    on('tdi:ajax:_end', function (evt) {
      var options = evt.detail.options;
      _end(options);
    });

    // Supported Infusion instructions
    _infusionInstructions = {
      update: _onBeforeUpdate,
      insert: _onBeforeInsert,
      script: _onBeforeScript,
      style: _onBeforeStyle,
      reload: _onBeforeReload,
      redirect: _onBeforeRedirect,
      // @deprecated
      popup: _onBeforeDialog,
      dialog: _onBeforeDialog
    };

    // a collection of new script tags which will be added after the response is done to preserve the execution order
    _scriptTags = [];

    // a collection of responses used for the 'tdi:ajax:done' event
    _responses = {
      updates: [],
      inserts: [],
      scripts: [],
      styles: [],
      dialogs: [],
      unknowns: []
    };

    // EVENTS
    function _onUpdatesDone(involvedElms, updates, options) {
      /**
       * <p>Fires when all TDI &lt;update&gt;s are done.</p>
       * @event tdi:ajax:updatesDone
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} updates The list of all updates
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:updatesDone', {
            updates: updates,
            options: options
          });
        });
      }
    }
    function _onInsertsDone(involvedElms, inserts, options) {
      /**
       * <p>Fires when all TDI &lt;insert&gt;s are done.</p>
       * @event tdi:ajax:insertsDone
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} inserts The list of all inserts
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:updatesDone', {
            inserts: inserts,
            options: options
          });
        });
      }
    }
    function _onScriptsDone(involvedElms, scripts, options) {
      /**
       * <p>Fires when all TDI &lt;script&gt;s are done.</p>
       * @event tdi:ajax:scriptsDone
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} scripts The list of all scripts
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:scriptsDone', {
            scripts: scripts,
            options: options
          });
        });
      }
    }
    function _onStylesDone(involvedElms, styles, options) {
      /**
       * <p>Fires when all TDI &lt;style&gt;s are done.</p>
       * @event tdi:ajax:stylesDone
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} styles The list of all styles
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:stylesDone', {
            styles: styles,
            options: options
          });
        });
      }
    }
    function _onDialogsDone(involvedElms, dialogs, options) {
      /**
       * <p>Fires when all TDI &lt;dialogs&gt;s are done.</p>
       * @event tdi:ajax:dialogsDone
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} dialogs The list of all dialogs
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:dialogsDone', {
            dialogs: dialogs,
            options: options
          });
        });
      }
    }
    function _onUnknownsDone(involvedElms, unknowns, options) {
      /**
       * <p>Fires when all &lt;unknown&gt; TDI instructions are done.</p>
       * @event tdi:ajax:unknownsDone
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} instructions The list of all unknown instructions
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:unknownsDone', {
            unknowns: unknowns,
            options: options
          });
        });
      }
    }
    function _onAllResponsesDone(involvedElms, responses, options) {
      /**
       * <p>Fires when all TDI actions are done.</p>
       * @event tdi:ajax:done
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Array} responses The list of all instructions
       * @property {Object} options Additional request options
       */
      if (involvedElms && involvedElms.length) {
        involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:done', {
            responses: responses,
            options: options
          });
        });
      }
    }

    // CALLBACKS -----------------------------------------------------------------
    /**
     * <p>The default <em>start</em> callback.</p>
     * @function _start
     * @fires TDI.Ajax.Request#tdi:ajax:start
     * @private
     * @param {Object} settings The Ajax settings
     * @param {Object} options Additional request options
     */
    function _start(settings, options) {
      _scriptsDone = false;

      // xhr.setRequestHeader( 'X-Requested-Format', 'xml' );
      /**
       * <p>Fires when the TDI request has started.</p>
       * @event tdi:ajax:start
       * @memberOf TDI.Ajax.Request
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {jqXHR} xhr The jqXHR object
       * @property {Object} options Additional request options
       * @property {Object} settings The Ajax settings
       */

      [].concat(options.involvedElms || document).forEach(function (elm) {
        return trigger(elm, 'tdi:ajax:start', {
          options: options,
          settings: settings
        });
      });
    }

    /**
     * <p>The default <em>success</em> callback.</p>
     * @function _success
     * @fires TDI.Ajax.Response#tdi:ajax:updatesDone
     * @fires TDI.Ajax.Response#tdi:ajax:insertsDone
     * @fires TDI.Ajax.Response#tdi:ajax:scriptsDone
     * @fires TDI.Ajax.Response#tdi:ajax:stylesDone
     * @fires TDI.Ajax.Response#tdi:ajax:dialogsDone
     * @fires TDI.Ajax.Response#tdi:ajax:unknownsDone
     * @fires TDI.Ajax.Response#tdi:ajax:done
     * @private
     * @param {jQuery} xmlString The response XML document
     * @param {String} statusText The status of the response
     * @param {jqXHR} xhr The jqXHR object
     * @param {Object} options Additional request options
     */
    function _success(_x2, _x3, _x4, _x5) {
      return _success2.apply(this, arguments);
    }
    /**
     * <p>The default <em>error</em> callback.</p>
     * @function _error
     * @fires TDI.Ajax.Request#tdi:ajax:error
     * @private
     * @param {String} status The XHR status text (if available)
     * @param {String} statusText The XHR text status (if available)
     */
    function _success2() {
      _success2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(xmlString, statusText, xhr, options) {
        var xml, xmlStatusAttribute, status, _scriptsDoneInterval, involvedElms;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              if (!(typeof xmlString !== 'string')) {
                _context2.n = 1;
                break;
              }
              _error(statusText, null);
              return _context2.a(2, false);
            case 1:
              _context2.n = 2;
              return parseXMLResponse(xmlString);
            case 2:
              xml = _context2.v;
              xmlStatusAttribute = xml.querySelector && xml.querySelector('status');
              if (xmlStatusAttribute) {
                _context2.n = 3;
                break;
              }
              throw new Error('TDI ajax response does not contain a status tag');
            case 3:
              status = xmlStatusAttribute.innerHTML;
              if (status.toLowerCase() !== 'ok') {
                _error(xhr, statusText);
              }

              // handle tags
              xml.querySelectorAll('response > *:not(status)').forEach(function (elm) {
                var instruction = elm.tagName.toLowerCase();
                switch (instruction) {
                  case 'script':
                    /*
                    Collect all script tags to a list, so they can be downloaded
                    and executed in the preserved order
                    */
                    _scriptTags.push(elm);
                    break;
                  default:
                    if (_infusionInstructions[instruction]) {
                      _infusionInstructions[instruction](elm, options);
                    } else {
                      _onBeforeUnknown(elm, options);
                    }
                    break;
                }
              });

              // fire the custom ajax:done events
              involvedElms = options.involvedElms ? options.involvedElms.filter(function (elm) {
                return document.body ? document.body.contains(elm) : document.contains(elm);
              }) : [];
              if (involvedElms.length === 0) {
                involvedElms = [document];
              }
              _onUpdatesDone(involvedElms, _responses.updates, options);
              _onInsertsDone(involvedElms, _responses.inserts, options);
              _onStylesDone(involvedElms, _responses.styles, options);
              _onDialogsDone(involvedElms, _responses.dialogs, options);
              _onUnknownsDone(involvedElms, _responses.unknowns, options);
              if (_scriptTags.length) {
                _scriptsDoneInterval = window.setInterval(function () {
                  if (_scriptsDone) {
                    window.clearInterval(_scriptsDoneInterval);
                    _onScriptsDone(involvedElms, _responses.scripts, options);
                    _onAllResponsesDone(involvedElms, _responses, options);
                  }
                }, 100);

                // download and execute the list of script tags
                _onBeforeScript(_scriptTags.shift(), options);
              } else {
                _onAllResponsesDone(involvedElms, _responses, options);
              }
            case 4:
              return _context2.a(2);
          }
        }, _callee2);
      }));
      return _success2.apply(this, arguments);
    }
    function _error(status, statusText) {
      /**
       * <p>Fires when the Ajax request ends with an error.</p>
       * @event tdi:ajax:error
       */

      throw new Error('TDI ajax response status ' + status + ', ' + statusText);
    }

    /**
     * <p>The default <em>end</em> callback.</p>
     * @function _end
     * @fires TDI.Ajax.Request#tdi:ajax:end
     * @private
     */
    function _end(options) {
      /**
       * <p>Fires when the TDI request has ended.</p>
       * @event tdi:ajax:end
       * @memberOf TDI.Ajax.Request
       * @property {Object} options Additional request options
       */

      if (options.involvedElms && options.involvedElms.length) {
        options.involvedElms.forEach(function (elm) {
          return trigger(elm, 'tdi:ajax:end', {
            options: options
          });
        });
      }
    }

    // RESPONSES -----------------------------------------------------------------
    /**
     * <p>The beforeUpdate callback. It takes the &lt;update&gt; xml node, gets its data and triggers a custom event which
     * can stop the default update action.</p>
     *
     * @function _onBeforeUpdate
     * @fires TDI.Ajax.Request#tdi:ajax:beforeUpdate
     * @private
     * @param {XMLNode} tag The &lt;update&gt; xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeUpdate(tag, options) {
      if (!tag) {
        return false;
      }
      var target_id = tag.getAttribute('target');
      var purged_target_id = target_id ? target_id.replace(/^[^a-zA-Z]+/, '') : null;
      var selector = tag.getAttribute('selector');
      var targets = document.querySelectorAll(selector || (purged_target_id ? '#' + purged_target_id : ''));
      var content = parseXMLContent(tag.innerHTML.trim());
      var replace = tag.getAttribute('replace');
      var append = tag.getAttribute('append');
      var prepend = tag.getAttribute('prepend');
      var class_add = tag.getAttribute('class-add') || '';
      var class_remove = tag.getAttribute('class-remove') || '';
      var eventData = {
        target_id: target_id,
        selector: selector,
        content: content !== '' ? content : null,
        content_empty: content.replace(/&nbsp;/g, '').length === 0,
        replace: replace,
        append: append,
        prepend: prepend,
        class_add: class_add,
        class_remove: class_remove,
        options: options,
        tag: tag
      };
      if (targets.length) {
        // fire custom events
        /**
         * <p>Fires before the TDI <em>update</em> takes place.</p>
         * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onUpdateDefault</code>).</p>
         * @event tdi:ajax:beforeUpdate
         * @memberOf TDI.Ajax.Response
         * @param {Event} evt The event object
         * @param {Object} data The event properties
         * @property {String} target_id The ID of the update target
         * @property {String} selector CSS selector for multiple targets
         * @property {jQuery} target The update target
         * @property {String} content The update contents
         * @property {Boolean} content_empty Indicates whether the contents are empty
         * @property {Boolean} replace Indicates whether the contents will replace the whole target
         * @property {Boolean} append Indicates whether the contents will be appended to the end of the target
         * @property {Boolean} prepend Indicates whether the contents will be prepended to the beginning of the target
         * @property {String} class_add Space separated list of class names to add
         * @property {String} class_remove Space separated list of class names to remove
         * @property {Object} options Additional request options
         * @property {jQuery} tag The raw XML tag of the instruction
         */

        targets.forEach(function (target) {
          var data = _extends({}, eventData, {
            target: target
          });
          trigger(target, 'tdi:ajax:beforeUpdate', data);
          _responses.updates.push(data);
        });
      }
    }

    /**
     * <p>The beforeInsert callback. It takes the &lt;insert&gt; xml node, gets its data and triggers a custom event which
     * can stop the default insert action.</p>
     *
     * @function _onBeforeInsert
     * @fires TDI.Ajax.Request#tdi:ajax:beforeInsert
     * @private
     * @param {XMLNode} tag The &lt;insert&gt; xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeInsert(tag, options) {
      if (!tag) {
        return false;
      }
      var target_id = tag.getAttribute('target');
      var selector = tag.getAttribute('selector');
      var targets = document.querySelectorAll(selector ? selector : '#' + target_id);
      var content = parseXMLContent(tag.innerHTML);
      var position = tag.getAttribute('position') || 'after';
      var insertedNode;
      var eventData = {
        target_id: target_id,
        selector: selector,
        content: content,
        position: position,
        inserted_node: insertedNode,
        options: options,
        tag: tag
      };
      if (targets.length) {
        // fire custom events
        /**
         * <p>Fires before the TDI <em>insert</em> takes place.</p>
         * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onInsertDefault</code>).</p>
         * @event tdi:ajax:beforeInsert
         * @memberOf TDI.Ajax.Response
         * @param {Event} evt The event object
         * @param {Object} data The event properties
         * @property {String} target_id The ID of the insert target
         * @property {String} selector CSS selector for multiple targets
         * @property {jQuery} target The insert target
         * @property {String} content The insert contents
         * @property {String} position The position of the insert (before|after)
         * @property {Object} options Additional request options
         * @property {jQuery} tag The raw XML tag of the instruction
         */
        targets.forEach(function (target) {
          var data = _extends({}, eventData, {
            target: target
          });
          trigger(target, 'tdi:ajax:beforeInsert', data);
          _responses.inserts.push(data);
        });
      }
    }

    /**
     * <p>The beforeScript callback. It takes the &lt;script&gt; xml node, gets its data and triggers a custom event which
     * can stop the default script action.</p>
     *
     * @function _onBeforeScript
     * @fires TDI.Ajax.Request#tdi:ajax:beforeScript
     * @private
     * @param {XMLNode} tag The &lt;script&gt; xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeScript(tag, options) {
      if (!tag) {
        return false;
      }
      var contents = tag.innerHTML.trim();
      var src = tag.getAttribute('src');
      var id = tag.getAttribute('id');
      var eventData = {
        script_src: src,
        script_data: contents,
        script_id: id,
        options: options,
        tag: tag
      };
      _responses.scripts.push(eventData);

      // fire custom events
      /**
       * <p>Fires before the TDI <em>script</em> takes place.</p>
       * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onScriptDefault</code>).</p>
       * @event tdi:ajax:beforeScript
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} script_src Path to the external Javascript file
       * @property {String} script_data Inline Javascript code
       * @property {String} script_id ID of the &lt;script&gt; tag
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      _triggerDefault('tdi:ajax:beforeScript', eventData);
    }

    /**
     * <p>The beforeStyle callback. It takes the &lt;style&gt; xml node, gets its data and triggers a custom event which
     * can stop the default style action.</p>
     *
     * @function _onBeforeStyle
     * @fires TDI.Ajax.Request#tdi:ajax:beforeStyle
     * @private
     * @param {XMLNode} tag The &lt;style&gt; xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeStyle(tag, options) {
      if (!tag) {
        return false;
      }
      var src = tag.getAttribute('src');
      var id = tag.getAttribute('id');
      var eventData = {
        style_src: src,
        style_id: id,
        options: options,
        tag: tag
      };

      // fire custom events
      /**
       * <p>Fires before the TDI <em>style</em> takes place.</p>
       * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onStyleDefault</code>).</p>
       * @event tdi:ajax:beforeStyle
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} style_src Path to the external CSS file
       * @property {String} style_id ID of the &lt;link&gt; tag
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      _triggerDefault('tdi:ajax:beforeStyle', eventData);
      _responses.styles.push(eventData);
    }

    /**
     * <p>The beforeReload callback. It just reloads the page.</p>
     *
     * @function _onBeforeReload
     * @fires TDI.Ajax.Request#tdi:ajax:beforeReload
     * @private
     * @param {XMLNode} tag The &lt;reload&gt; xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeReload(tag, options) {
      if (!tag) {
        return false;
      }
      var eventData = {
        options: options,
        tag: tag
      };

      // fire custom events
      /**
       * <p>Fires before the TDI <em>reload</em> takes place.</p>
       * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onReloadDefault</code>).</p>
       * @event tdi:ajax:beforeReload
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      _triggerDefault('tdi:ajax:beforeReload', eventData);
    }

    /**
     * <p>The before redirect callback. It takes the &lt;redirect&gt; xml node, gets its data and redirects
     * the page to the given URL.</p>
     *
     * @function _onBeforeRedirect
     * @fires TDI.Ajax.Request#tdi:ajax:beforeRedirect
     * @private
     * @param {XMLNode} tag The &lt;redirect&gt; xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeRedirect(tag, options) {
      if (!tag) {
        return false;
      }
      var eventData = {
        href: tag.getAttribute('href'),
        options: options,
        tag: tag
      };
      if (eventData.href) {
        // fire custom events
        /**
         * <p>Fires before the TDI <em>redirect</em> takes place.</p>
         * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onRedirectDefault</code>).</p>
         * @event tdi:ajax:beforeRedirect
         * @memberOf TDI.Ajax.Response
         * @param {Event} evt The event object
         * @param {Object} data The event properties
         * @property {String} href The URL to redirect to
         * @property {Object} options Additional request options
         * @property {jQuery} tag The raw XML tag of the instruction
         */

        _triggerDefault('tdi:ajax:beforeRedirect', eventData);
      }
    }

    /**
     * <p>The beforeDialog callback. It takes the &lt;dialog&gt; xml node, gets its data and triggers a custom event which
     * can stop the default dialog action.</p>
     *
     * @function _onBeforeDialog
     * @fires TDI.Ajax.Request#tdi:ajax:beforeDialog
     * @private
     * @param {XMLNode} tag The &lt;dialog&gt; xml tag
     * @param {Object} options Additional request options
     * @param {Boolean?} deprecated if Popup is used instead of Dialog
     */
    function _onBeforeDialog(tag, options, deprecated) {
      if (!tag) {
        return false;
      }
      var content = parseXMLContent(tag.innerHTML.trim());
      var class_add = tag.getAttribute('class-add') || '';
      var closable = tag.getAttribute('closable') !== 'false';
      var mode = tag.getAttribute('mode') || 'dialog';
      // const href = tag.getAttribute('href');
      var eventData = {
        class_add: class_add,
        closable: closable,
        content: content,
        mode: mode,
        options: options
      };
      _triggerDefault('tdi:ajax:beforeDialog', eventData);
      _responses.dialogs.push(eventData);
    }

    /**
     * <p>The beforeUnknown callback. It takes an unknown instruction xml node, gets its data and triggers a custom event which
     * can stop the default unknown action.</p>
     *
     * @function _onBeforeUnknown
     * @fires TDI.Ajax.Request#tdi:ajax:beforeUnknown
     * @private
     * @param {XMLNode} tag The unknown instruction xml tag
     * @param {Object} options Additional request options
     */
    function _onBeforeUnknown(tag, options) {
      if (!tag) {
        return false;
      }
      var name = tag.tagName.toLowerCase();
      var beforeName = name.substr(0, 1).toUpperCase() + name.substr(1);
      var attributes = tag.attributes;
      var eventData = {
        _name: name,
        contents: tag.innerHTML.trim(),
        options: options,
        tag: tag
      };
      for (var _i = 0, l = attributes.length; _i < l; _i++) {
        eventData[attributes[_i].name] = attributes[_i].value;
      }

      // fire custom events
      /**
       * <p>Fires before the TDI instruction takes place.</p>
       * <p>This event is <strong>preventable</strong>. Use <a href="http://api.jquery.com/event.preventDefault/">preventDefault()</a> to prevent the default action (<code>Response._onUnknownDefault</code>).</p>
       * @event tdi:ajax:beforeUnknown
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} contents Instruction contents
       * @property {String} ATTRS_NAME Other attributes
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      on('tdi:ajax:before' + beforeName, customDefault, eventData);
      trigger(document, 'tdi:ajax:before' + beforeName, eventData);
      _responses.unknowns.push(eventData);
    }

    // RESPONSES DEFAULTS
    /**
     * <p>The update default response handler. Updates the specified target with new contents.</p>
     * @function _onUpdateDefault
     * @fires TDI.Ajax.Request#tdi:ajax:update
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
    function _onUpdateDefault(evt) {
      var data = evt.detail;

      // classes
      if (data.class_remove.trim()) {
        data.target.classList.remove(data.class_remove);
      }
      if (data.class_add.trim()) {
        data.target.classList.add(data.class_add);
      }
      var responseContent = prepareContent(data.content);

      // update the target element
      if (data.content) {
        if (data.replace === 'true') {
          offAllEvents(data.target, true);
          data.target.replaceWith(responseContent);
          data.target = responseContent;
        } else if (data.append === 'true') {
          data.target.append(responseContent);
        } else if (data.prepend === 'true') {
          data.target.prepend(responseContent);
        } else {
          // data.target.find('*').off(); // detach all event handlers from the targets child nodes
          offAllEvents(data.target, true);
          data.target.innerHTML = data.content;
        }
      }
      // trigger the update event
      /**
       * <p>Fires after the TDI <em>update</em> takes place.</p>
       * @event tdi:ajax:update
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} target_id The ID of the update target
       * @property {String} selector CSS selector for multiple targets
       * @property {jQuery} target The update target
       * @property {String} content The update contents
       * @property {Boolean} content_empty Indicates whether the contents are empty
       * @property {Boolean} replace Indicates whether the contents will replace the whole target
       * @property {Boolean} append Indicates whether the contents will be appended to the end of the target
       * @property {Boolean} prepend Indicates whether the contents will be prepended to the beginning of the target
       * @property {String} class_add Space separated list of class names to add
       * @property {String} class_remove Space separated list of class names to remove
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      trigger(data.target, 'tdi:ajax:update', data);
    }

    /**
     * <p>The insert default response handler. Inserts the contents before/after the target.</p>
     * @function _onInsertDefault
     * @fires TDI.Ajax.Request#tdi:ajax:insert
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
    function _onInsertDefault(evt) {
      var data = evt.detail;
      if (!data.content || !data.target || !data.position) {
        return null;
      }
      var content = parseHtmlFromString(data.content).body.firstChild;
      if (data.position === 'before') {
        data.target.parentNode.insertBefore(content, data.target);
      } else {
        data.target.parentNode.insertBefore(content, data.target.nextSibling);
      }
      data.inserted_node = content;

      // trigger the insert event
      /**
       * <p>Fires after the TDI <em>insert</em> takes place.</p>
       * @event tdi:ajax:insert
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} target_id The ID of the insert target
       * @property {String} selector CSS selector for multiple targets
       * @property {jQuery} target The insert target
       * @property {String} content The insert contents
       * @property {String} position The position of the insert (before|after)
       * @property {jQuery} inserted_node Reference to the inserted HTML node
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      trigger(data.target, 'tdi:ajax:insert', data);
    }

    /**
     * <p>The script default response handler. Loads and executes new scripts.</p>
     * @function _onScriptDefault
     * @fires TDI.Ajax.Request#tdi:ajax:script
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
    function _onScriptDefault(evt, data) {
      var scripts = _scriptTags;
      var download = true;
      var onComplete = function onComplete(node) {
        var s;

        // execute inline script
        if (data.script_data) {
          s = document.createElement('script');
          if (NONCE) {
            s.setAttribute('nonce', NONCE);
            s.nonce = NONCE;
          }
          s.type = 'text/javascript';
          s.text = data.script_data;
          if (data.script_id) {
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
         * @memberOf TDI.Ajax.Response
         * @param {Event} evt The event object
         * @param {Object} data The event properties
         * @property {String} script_src Path to the external Javascript file
         * @property {String} script_data Inline Javascript code
         * @property {String} script_id ID of the &lt;script&gt; tag
         * @property {jQuery} script_node Reference to the inserted &lt;script&gt;
         * @property {jQuery} script_node_inline Reference to the inserted inline &lt;script&gt;
         * @property {Object} options Additional request options
         * @property {jQuery} tag The raw XML tag of the instruction
         */
        trigger(document, 'tdi:ajax:script', data);

        // process next script
        if (scripts.length) {
          _onBeforeScript(scripts.shift());
        } else {
          _scriptsDone = true;
        }
      };

      // if there is an 'src' attribute, load the script first and when fully loaded, execute the script contents
      if (data.script_src) {
        if (data.script_id && document.getElementById(data.script_id)) {
          download = false;
        }
        if (download) {
          getScript(data.script_src, {
            id: data.script_id,
            complete: onComplete,
            nonce: NONCE
          });
        }
      } else {
        onComplete();
      }
    }

    /**
     * <p>The style default response handler. Loads external stylesheets.</p>
     * @function _onStyleDefault
     * @fires TDI.Ajax.Request#tdi:ajax:style
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
    function _onStyleDefault(evt, data) {
      var download = true;
      if (data.style_id && document.getElementById(data.style_id)) {
        download = false;
      }
      if (download) {
        getStyle(data.style_src, {
          id: data.style_id,
          complete: function complete(node) {
            // trigger the style event
            data.style_node = node;
            /**
             * <p>Fires after the TDI <em>style</em> takes place.</p>
             * @event tdi:ajax:style
             * @memberOf TDI.Ajax.Response
             * @param {Event} evt The event object
             * @param {Object} data The event properties
             * @property {String} style_src Path to the external CSS file
             * @property {String} style_id ID of the &lt;link&gt; tag
             * @property {jQuery} style_node Reference to the inserted &lt;link&gt; node
             * @property {Object} options Additional request options
             * @property {jQuery} tag The raw XML tag of the instruction
             */
            trigger(document, 'tdi:ajax:style', data);
          }
        });
      }
    }

    /**
     * <p>The reload default response handler. Reloads the page.</p>
     * @function _onReloadDefault
     * @private
     * @param {Object} data The reload data object
     *   <dl>
     *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
     *       <span>Additional request options</span></dd>
     *   </dl>
     */
    function _onReloadDefault(evt, data) {
      window.location.reload(true);
    }

    /**
     * <p>The redirect default response handler. Redirects the page to a given URL.</p>
     * @function _onRedirectDefault
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
    function _onRedirectDefault(evt, data) {
      window.location.assign(data.href);
    }

    /**
     * <p>The dialog default response handler.</p>
     * @function _onDialogDefault
     * @fires TDI.Ajax.Request#tdi:ajax:dialog
     * @private
     * @param {Object} evt The event object
     * @param {Object} data The dialog data object:
     *   <dl>
     *     <dd><code><span>href</span> <span>&lt;String&gt;</span></code>
     *       <span>Target URL of the dialog</span></dd>
     *     <dd><code><span>mode</span> <span>&lt;String&gt;</span></code>
     *       <span>("popup"|"dialog") The type of the dialog</span></dd>
     *     <dd><code><span>width</span> <span>&lt;Integer&gt;</span></code>
     *       <span>Width of the dialog in mode "dialog"</span></dd>
     *     <dd><code><span>height</span> <span>&lt;Integer&gt;</span></code>
     *       <span>Height of the dialog in mode "dialog"</span></dd>
     *     <dd><code><span>options</span> <span>&lt;Object&gt;</span></code>
     *       <span>Additional request options</span></dd>
     *   </dl>
     */
    function _onDialogDefault(evt, data) {
      var dialog = document.createElement('dialog');
      var dialogContent = prepareContent(data.content);
      dialogContent.className = 'tdi-dialog-content';
      dialogContent.innerHTML = data.content;

      // create and append close button
      if (data.closable) {
        var closeDialogButton = document.createElement('button');
        closeDialogButton.className = 'tdi-dialog-close';
        closeDialogButton.innerHTML = '&times;';
        on('click', function () {
          dialog.close();
          dialog.remove();
        }, closeDialogButton);
        dialog.appendChild(closeDialogButton);
      }
      dialog.appendChild(dialogContent);
      if (data.class_add) {
        dialog.classList.add(data.class_add);
      }
      document.body.appendChild(dialog);
      dialog.showModal();

      // trigger the dialog event
      /**
       * <p>Fires after the TDI <em>dialog</em> takes place.</p>
       * @event tdi:ajax:dialog
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} href The URL of the dialog
       * @property {String} mode The mode of the dialog (popup|dialog)
       * @property {Object} options Additional request options
       */
      trigger(document, 'tdi:ajax:dialog', data);
    }

    /**
     * <p>The unknown instruction default response handler.</p>
     * @function _onUnknownDefault
     * @fires TDI.Ajax.Request#tdi:ajax:unknown
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
    function _onUnknownDefault(evt, data) {
      // trigger the dialog event
      /**
       * <p>Fires after the TDI unknown instruction takes place.</p>
       * @event tdi:ajax:unknown
       * @memberOf TDI.Ajax.Response
       * @param {Event} evt The event object
       * @param {Object} data The event properties
       * @property {String} contents Instruction contents
       * @property {String} ATTRS_NAME Other attributes
       * @property {Object} options Additional request options
       * @property {jQuery} tag The raw XML tag of the instruction
       */
      trigger(document, "tdi:ajax:" + data._name, data);
    }

    // TDI Ajax custom events -------------------------------------------------
    /**
     * <p>The beforeUnknown callback. It takes the &lt;unknown&gt; xml node, gets its data and triggers a custom events default action if not prevented from client.</p>
     * @function _onBeforeUnknown
     * @private
     * @param {String} eventName Name of custom event
     * @param {Object} eventData Additional request options
     * @param {HTMLElement} eventTarget The target element
     */
    function _triggerDefault(eventName, eventData, eventTarget) {
      var _event = customEvent(eventName, eventData);
      var wasDefaultPrevented = !trigger(eventTarget || document, eventName, eventData);

      // If default event handler wasnt prevented via `evt.preventDefault()`
      if (wasDefaultPrevented) {
        customPostDispatch();
      } else {
        customDefault(_event, eventData);
      }
    }
    customHandlers = {
      'tdi:ajax:beforeUpdate': _onUpdateDefault,
      'tdi:ajax:beforeInsert': _onInsertDefault,
      'tdi:ajax:beforeScript': _onScriptDefault,
      'tdi:ajax:beforeStyle': _onStyleDefault,
      'tdi:ajax:beforeReload': _onReloadDefault,
      'tdi:ajax:beforeRedirect': _onRedirectDefault,
      'tdi:ajax:beforeDialog': _onDialogDefault
    };
    customDefault = function customDefault(evt, data) {
      if (customHandlers[evt.type]) {
        customHandlers[evt.type].call(this, evt, data);
      } else {
        _onUnknownDefault.call(this, evt, data);
      }
    };
    customPostDispatch = function customPostDispatch(evt) {
      switch (evt.type) {
        case 'tdi:ajax:beforeScript':
          /*
          If this event was prevented, trigger the scriptsDone event immediately
          */
          _scriptsDone = true;
          break;
        default:
          throw new Error("No postDispatch handler for event " + evt.type);
      }
    };
    for (i in customHandlers) {
      on(i, customDefault);
    }

    // PUBLIC STUFF
    return {};
  };

  // initialization
  document.addEventListener('DOMContentLoaded', TDI.Ajax.Response);
  return TDI;
}();

/**
 * Javascript library enabling communication between the UI and the application
 * using the Infusion AJAX protocol.
 */
var _config = {
  method: 'GET',
  headers: {}
};
var TDIApi = TDI$1;
function setup(newConfig) {
  if (typeof newConfig === 'object' && newConfig !== null) {
    Object.keys(newConfig).forEach(function (key) {
      if (_config.hasOwnProperty(key)) {
        _config[key] = newConfig[key];
      }
    });
  }
}
Object.defineProperty(TDIApi, 'config', {
  get: function get() {
    return Object.freeze(_extends({}, _config));
  },
  set: function set() {
    throw new Error('Use setup() to modify config.');
  },
  configurable: false,
  enumerable: true
});
TDIApi.setup = setup;
// TDI.Ajax = Ajax;
// TDI.Ajax.Request = Request;
if (window) {
  window.TDI = TDI$1;
}

exports.default = TDI$1;
//# sourceMappingURL=tdi.cjs.development.js.map
