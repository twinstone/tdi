/*
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

(() => {
	'use strict';

	/**
	 * Javascript library enabling communication between the UI and the application
	 * using the Infusion AJAX protocol.
	 * @namespace TDI
	 */
	const _config = {
		method: 'GET',
		headers: {}
	};

	function setup(newConfig) {
		if (typeof newConfig === 'object' && newConfig !== null) {
			Object.keys(newConfig).forEach(key => {
				if (_config.hasOwnProperty(key)) {
					_config[key] = newConfig[key];
				}
			});
		}
	}

	const tdiApi = {};

	Object.defineProperty(tdiApi, 'config', {
		get: () => Object.freeze({ ..._config }),
		set: () => { throw new Error('Use setup() to modify config.'); },
		configurable: false,
		enumerable: true
	});

	tdiApi.setup = setup;

	window.TDI = tdiApi;
})();
