
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./tdi.cjs.production.min.js')
} else {
  module.exports = require('./tdi.cjs.development.js')
}
