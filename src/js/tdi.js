/*
 * Copyright 2013 Etnetera a.s. http://www.etnetera.cz
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

(function () {
	'use strict';

	function versionsCompare(a, b) {
		var pa = a.split('.');
		var pb = b.split('.');
		for (var i = 0; i < 3; i++) {
			var na = Number(pa[i]);
			var nb = Number(pb[i]);
			if (na > nb) {
				return 1;
			}

			if (nb > na) {
				return -1;
			}

			if (!isNaN(na) && isNaN(nb)) {
				return 1;
			}

			if (isNaN(na) && !isNaN(nb)) {
				return -1;
			}
		}

		return 0;
	}

	if (jQuery === undefined) {
		throw('Missing dependency: jQuery!');
	}
	else {
		if (versionsCompare(jQuery.fn.jquery, '1.10.2') < 0) {
			try {
				console.log('Recommended version of jQuery is 1.10.2 or higher.');
				console.log('See: https://github.com/twinstone/tdi/issues/8');
				console.log('See: https://bugs.jquery.com/ticket/13936');
			}
			catch (e) {}
		}
	}

	/**
	 * <p>Javascript library which enables the communication between the UI and the application,
	 * using the Infusion AJAX protocol, see:
	 * https://wiki.twinstone.org/display/TDI/Infusing+Protocol.</p>
	 * Minimum jQuery version required for TDI is 1.10.2.
	 * @module TDI
	 */
	window.TDI = (function () {
		// PRIVATE STUFF -----------------------------------------------------------

		// PUBLIC STUFF ------------------------------------------------------------
		return {};
	})();
}());
