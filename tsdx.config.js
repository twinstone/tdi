import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export function rollup(config, options) {
  config.plugins = config.plugins.map(plugin => plugin.name === 'replace'
    ? replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    })
    : plugin
  );

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');

  config.output.banner = `
/*!
 * Twinstone TDI (https://github.com/twinstone/tdi)
 *
 * Version: ${pkg.version}
 * Build: ${date} ${time}
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
    `.trim();

  return config;
}