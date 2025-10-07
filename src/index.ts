import { requestSend, requestSendForm } from './request';
import Ajax from './tdi-ajax';
import { ITDI } from './types/types';

/**
 * Javascript library enabling communication between the UI and the application
 * using the Infusion AJAX protocol.
 */

let TDI = {} as ITDI;

// Create config with setup method to change read-only values
const config = {
  method: 'GET',
  headers: {},
};
function setup(newConfig: Partial<typeof config>) {
  if (typeof newConfig === 'object' && newConfig !== null) {
    Object.keys(newConfig).forEach(key => {
      if (config.hasOwnProperty(key)) {
        (config as any)[key] = (newConfig as any)[key];
      }
    });
  }
}

// set public methods to global TDI object
TDI = {
  ...TDI,
  ...Ajax,
  setup,
  Request: {
    send: requestSend,
    sendForm: requestSendForm,
  },
};

// Make config read-only
Object.defineProperty(TDI, 'config', {
  get: () => Object.freeze({ ...config }),
  set: () => {
    throw new Error('Use TDI.setup() to modify config.');
  },
  configurable: false,
  enumerable: true,
});

// Expose TDI globally if in a browser environment
if (window) {
  window.TDI = TDI;
}

export default TDI;
