import { AjaxOptions } from './types/types';
export interface Settings extends AjaxOptions {
    beforeSend?: (response: Response) => boolean;
    complete?: () => void;
    error?: (response: Response) => void;
    success?: (response: Response) => void;
}
export declare const requestSend: (url: string, options: AjaxOptions) => Promise<void>;
export declare const requestSendForm: (form: HTMLFormElement, options: AjaxOptions) => Promise<any>;
declare const _default: {
    requestSend: (url: string, options: AjaxOptions) => Promise<void>;
    requestSendForm: (form: HTMLFormElement, options: AjaxOptions) => Promise<any>;
};
export default _default;
