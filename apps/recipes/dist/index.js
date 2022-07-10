
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./recipes.cjs.production.min.js')
} else {
  module.exports = require('./recipes.cjs.development.js')
}
