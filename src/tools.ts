import { AjaxOptions, DOMParserSupportedType } from './types/types';

/**
 * Add event event listener to element(s)
 */
export function on(
  eventName: string,
  handleFn: (evt: Event) => void,
  selectors?: string[]
): void {
  document.body.addEventListener(eventName, (evt: Event) => {
    const selectorsChecks = selectors && selectors.length;

    if (selectorsChecks) {
      if (
        selectors!.some(selector => (evt.target as Element).matches(selector))
      ) {
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
export function off(
  selectors: string,
  eventName: string,
  handleFn?: EventListenerOrEventListenerObject
): void {
  const elms = document.querySelectorAll<HTMLElement>(selectors);

  elms.forEach(elm => {
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
export function offAllEvents(
  target: HTMLElement | string,
  fromChildNodes?: boolean
): void {
  const _target =
    typeof target === 'string' ? document.querySelector(target) : target;

  if (!_target) return;

  if (fromChildNodes) {
    _target.querySelectorAll('*').forEach(function(child) {
      offAllEvents(child as HTMLElement);
    });
  } else {
    const clonedTarget = _target.cloneNode(true);
    if (_target.parentNode) {
      _target.parentNode.replaceChild(clonedTarget, _target);
    }
  }
}

/**
 * Creates custom event
 */
export function customEvent(
  eventName: string,
  detail?: object
): CustomEvent<any> | null {
  if (!eventName) return null;

  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
  });

  return event;
}

/**
 * Dispatches custom event on provided element.
 */
export function trigger(
  target: HTMLElement | NodeListOf<HTMLElement>,
  eventName: string,
  detail: object
): void | null | boolean {
  const _event = customEvent(eventName, detail);

  if (!_event) return null;

  if (target instanceof NodeList) {
    return target.forEach(elm => elm.dispatchEvent(_event));
  } else {
    return target.dispatchEvent(_event);
  }
}

/**
 * Shorthand method to get value of data attr from element
 */
export function getDataAttr(elm: HTMLElement, dataAttr: string): string | null {
  if (elm && elm.dataset && dataAttr) {
    if (dataAttr.indexOf('data-') === 0) {
      throw new Error('getDataAttr: dataAttr should not begin with "data-"');
    }
    return elm.getAttribute('data-' + dataAttr);
  }
  return null;
}

/**
 * Add or remove css classes to element(s)
 */
export function batchClass<T extends Element>(
  elms: NodeListOf<T> | T[],
  method: 'add' | 'remove',
  className: string
): void {
  Array.from(elms).forEach(elm => elm.classList[method](className));
}

/**
 * Create a list of elements as NodeList
 */
export function convertToNodeList(
  listOfElms: HTMLElement[]
): NodeListOf<ChildNode> | null {
  if (!listOfElms || !listOfElms.length) return null;

  const fragment = document.createDocumentFragment();
  listOfElms.forEach(elm => {
    fragment.appendChild(elm.cloneNode(true));
  });

  return fragment.childNodes as NodeListOf<ChildNode>;
}

/**
 * Whether elm has class
 */
export function hasClass(elm: HTMLElement, className: string): boolean {
  return elm.classList.contains(className);
}

export function prepareFormRequest(options: AjaxOptions): AjaxOptions {
  const fetchOptions: AjaxOptions & { body?: any } = { ...options };
  if (options.method!.toUpperCase() === 'POST') {
    fetchOptions.body = options.data;
  } else {
    fetchOptions.url =
      (fetchOptions.url || '') +
      prepareUrlParams(options.data || {}, fetchOptions.url);
  }

  return fetchOptions;
}

/**
 * Takes serialized form data and prepares it for url params
 */
export function prepareUrlParams(
  data: Record<string, any>,
  url?: string
): string {
  const params = new URLSearchParams();
  const startingSymbol = url && url.indexOf('?') > -1 ? '&' : '?';

  for (const key in data) {
    if (Array.isArray(data[key])) {
      data[key].forEach((value: string) => {
        params.append(key, value);
      });
    } else {
      params.append(key, data[key]);
    }
  }

  return params.toString() ? startingSymbol + params.toString() : '';
}

/**
 * Wrapper for ajax calls to call beforeSend handlers
 */
export async function ajax(
  url: string,
  options: AjaxOptions
): Promise<Response> {
  if (options && options.beforeSend) {
    options.beforeSend(options);
  }

  if (!options.method) {
    options.method = TDI.config.method;
  }
  // prepare payload
  const fetchOptions = options.data ? prepareFormRequest(options) : options;

  // set custom headers
  if (typeof TDI !== 'undefined' && TDI.config) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      ...TDI.config.headers,
    };
  }

  const response = await fetch(fetchOptions.url || url, fetchOptions).then(
    res => {
      if (res.ok) {
        return res;
      } else {
        throw res;
      }
    }
  );
  return response;
}

/**
 * <p>Modifies the URL and adds an Ajax (tdi) flag.</p>
 * @function ajaxifyUrl
 * @memberOf TDI.Ajax.Request
 * @static
 * @param {String} url The URL to modify
 * @return {String} The modified URL
 */
export function ajaxifyUrl(url: string): string {
  const p = '_infuse=1&_ts=' + new Date().getTime();
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
export function parseHtmlFromString(
  content: string,
  contentType?: DOMParserSupportedType
): Document {
  const parser = new DOMParser();
  return parser.parseFromString(content, contentType || 'text/html');
}

/**
 * Parse the XML response and returns content as Node.
 */
export async function parseXMLResponse(
  res: string | Response
): Promise<Node | null> {
  const parser = new DOMParser();
  const data: string = typeof res === 'string' ? res : await res.text();
  const replacedData = data.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  return parser.parseFromString(replacedData, 'text/xml').firstChild;
}

/**
 * Parse the XML content and remove the CDATA tags.
 */
export function parseXMLContent(content: string): string {
  return content
    .replace('<![CDATA[', '')
    .replace(']]>', '')
    .trim();
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
export function getScript(url: string, options: any) {
  var loaded = false;
  var node: HTMLScriptElement;

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
      (node as any).onreadystatechange = function() {
        var rs = this.readyState;
        if (!loaded && (rs === 'loaded' || rs === 'complete')) {
          loaded = true;
          (node as any).onreadystatechange = null;
          options.complete(node);
        }
      };

      node.onload = function() {
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
export function getStyle(url: string, options: any) {
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

export function prepareContent(content: string): DocumentFragment {
  const doc = parseHtmlFromString(content);
  const responseContent = doc.body.childNodes;
  const contentFragment = document.createDocumentFragment();

  responseContent.forEach(elm => {
    if (
      elm.nodeName.toUpperCase() === 'SCRIPT' &&
      elm instanceof HTMLScriptElement
    ) {
      // Create a new <script>
      const newScriptTag = document.createElement('script');
      // Copy attributes
      for (const { name, value } of Array.from(elm.attributes)) {
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
