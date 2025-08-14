import TDI from './tdi-ajax.js';
import { ITDI } from './types/types';

/**
 * Javascript library enabling communication between the UI and the application
 * using the Infusion AJAX protocol.
 */

const _config = {
  method: 'GET',
  headers: {},
};

const TDIApi = (TDI as unknown) as ITDI;

function setup(newConfig: Partial<typeof _config>) {
  if (typeof newConfig === 'object' && newConfig !== null) {
    Object.keys(newConfig).forEach(key => {
      if (_config.hasOwnProperty(key)) {
        (_config as any)[key] = (newConfig as any)[key];
      }
    });
  }
}

Object.defineProperty(TDIApi, 'config', {
  get: () => Object.freeze({ ..._config }),
  set: () => {
    throw new Error('Use setup() to modify config.');
  },
  configurable: false,
  enumerable: true,
});

TDIApi.setup = setup;

// TDI.Ajax = Ajax;
// TDI.Ajax.Request = Request;

if (window) {
  window.TDI = TDI;
}

export default TDI;
