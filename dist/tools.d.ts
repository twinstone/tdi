import { AjaxOptions, DOMParserSupportedType } from './types/types';
/**
 * Add event event listener to element(s)
 */
export declare function on(eventName: string, handleFn: (evt: Event) => void, selectors?: string[]): void;
/**
 * Remove known event handlers from element(s)
 */
export declare function off(selectors: string, eventName: string, handleFn?: EventListenerOrEventListenerObject): void;
/**
 * Remove all events from an element, or its child nodes
 */
export declare function offAllEvents(target: HTMLElement | string, fromChildNodes?: boolean): void;
/**
 * Creates custom event
 */
export declare function customEvent(eventName: string, detail?: object): CustomEvent<any> | null;
/**
 * Dispatches custom event on provided element.
 */
export declare function trigger(target: HTMLElement | NodeListOf<HTMLElement>, eventName: string, detail: object): void | null | boolean;
/**
 * Shorthand method to get value of data attr from element
 */
export declare function getDataAttr(elm: HTMLElement, dataAttr: string): string | null;
/**
 * Add or remove css classes to element(s)
 */
export declare function batchClass<T extends Element>(elms: NodeListOf<T> | T[], method: 'add' | 'remove', className: string): void;
/**
 * Create a list of elements as NodeList
 */
export declare function convertToNodeList(listOfElms: HTMLElement[]): NodeListOf<ChildNode> | null;
/**
 * Whether elm has class
 */
export declare function hasClass(elm: HTMLElement, className: string): boolean;
export declare function prepareFormRequest(options: AjaxOptions): AjaxOptions;
/**
 * Takes serialized form data and prepares it for url params
 */
export declare function prepareUrlParams(data: Record<string, any>, url?: string): string;
/**
 * Wrapper for ajax calls to call beforeSend handlers
 */
export declare function ajax(url: string, options: AjaxOptions): Promise<Response>;
/**
 * <p>Modifies the URL and adds an Ajax (tdi) flag.</p>
 * @function ajaxifyUrl
 * @memberOf TDI.Ajax.Request
 * @static
 * @param {String} url The URL to modify
 * @return {String} The modified URL
 */
export declare function ajaxifyUrl(url: string): string;
/**
 * Parse the HTML from string and returns it as a DOM element.
 */
export declare function parseHtmlFromString(content: string, contentType?: DOMParserSupportedType): Document;
/**
 * Parse the XML response and returns content as Node.
 */
export declare function parseXMLResponse(res: string | Response): Promise<Node | null>;
/**
 * Parse the XML content and remove the CDATA tags.
 */
export declare function parseXMLContent(content: string): string;
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
export declare function getScript(url: string, options: any): void;
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
export declare function getStyle(url: string, options: any): void;
export declare function prepareContent(content: string): DocumentFragment;
