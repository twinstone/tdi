import * as tdi from './tools';
import { AjaxOptions } from './types/types';

export interface Settings extends AjaxOptions {
  beforeSend?: (response: Response) => boolean;
  complete?: () => void;
  error?: (response: Response) => void;
  success?: (response: Response) => void;
}

export const requestSend = (url: string, options: AjaxOptions) => {
  options = options || {};
  options.url = tdi.ajaxifyUrl(url);
  options.xhrFields = options.xhrFields || {};
  options.method = options.type || options.method || TDI.config.method;
  options.async = !options.sync;
  options.data = options.data || '';
  options.dataType = options.dataType || 'xml';
  options.trigger = options.trigger || document.body;
  const trigger: HTMLElement = options.trigger;
  // Omit incompatible beforeSend from options when spreading into settings
  const settings = { ...options } as Settings;

  settings.beforeSend = response => {
    const res = options.beforeStart && options.beforeStart(response, options);
    if (typeof res === 'undefined' || res === true) {
      tdi.trigger(trigger, 'tdi:ajax:_start', {
        settings,
        options,
      });

      if (options.start) {
        options.start(settings, options);
      }

      return true;
    }

    return false;
  };

  settings.success = async function(response) {
    const { statusText } = response;
    const data = await response.text();

    tdi.trigger(trigger, 'tdi:ajax:_success', {
      statusText,
      response,
      data,
      options,
    });

    if (options.success) {
      options.success(response);
    }
  };

  settings.error = function(response) {
    tdi.trigger(trigger, 'tdi:ajax:_error', { response, options });

    if (options.error) {
      options.error(response);
    }
  };

  settings.complete = function() {
    const res = options.beforeEnd && options.beforeEnd();

    if (typeof res === 'undefined' || res === true) {
      tdi.trigger(trigger, 'tdi:ajax:_end', {
        textStatus: 'complete',
        options,
      });

      if (options.end) {
        options.end('complete', options);
      }
    }
  };

  return tdi
    .ajax(settings.url, settings)
    .then(settings.success)
    .catch(settings.error)
    .finally(settings.complete);
};

export const requestSendForm = (
  form: HTMLFormElement,
  options: AjaxOptions
): Promise<any> => {
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

  return requestSend(url, options);
};

export default { requestSend, requestSendForm };
