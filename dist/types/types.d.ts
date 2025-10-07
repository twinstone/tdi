export interface TdiAjax {
    send: (elm: HTMLElement, callbacks?: any) => any;
}
export declare type DOMParserSupportedType = 'text/html' | 'text/xml' | 'application/xml' | 'application/xhtml+xml' | 'image/svg+xml';
export interface AjaxOptions {
    async: boolean;
    data?: any;
    dataType?: string;
    headers?: Record<string, string>;
    involvedElms?: HTMLElement[];
    media?: string;
    method?: string;
    sync?: boolean;
    trigger?: HTMLElement;
    type?: string;
    url: string;
    xhrFields?: Record<string, any>;
    beforeEnd?: (...args: any[]) => void;
    beforeSend?: (...args: any[]) => void;
    beforeStart?: (...args: any[]) => void;
    end?: (...args: any[]) => void;
    error?: (error: any) => void;
    start?: (...args: any[]) => void;
    success?: (response: any) => void;
}
export interface Request {
    send: (url: string, options?: AjaxOptions | Record<string, any>) => Promise<any>;
    sendForm: (form: HTMLFormElement, options?: AjaxOptions) => Promise<any>;
}
export interface ITDI {
    config: {
        method: string;
        headers: Record<string, string>;
        [key: string]: any;
    };
    setup: (newConfig: Partial<{
        method: string;
        headers: Record<string, string>;
    }>) => void;
    Ajax: TdiAjax;
    Request: Request;
}
