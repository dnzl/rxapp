var crypto = require('crypto')

var dz = require('dezalgo')
var objectAssign = require('object-assign')

var MAX_SAFE_INT = Math.pow(2, 53) - 1
var FLOAT_ENTROPY_BYTES = 7

module.exports = {
  randomFloat: _wrap(randomFloat, randomFloatSync),
  randomInt: _wrap(randomInt, randomIntSync),
  randomFloats: _wrap(randomFloats, randomFloatsSync),
  randomInts: _wrap(randomInts, randomIntsSync),
  promise: promise,
  _maxSafeInt: MAX_SAFE_INT
}

var DEFAULT_OPTS = {
  min: 0,
  max: MAX_SAFE_INT,
  num: 10
}

/**
 * Creates a random* function that can work async or sync depending on the
 * parameters passed to it.
 *
 * @param fn the async function to be called
 * @param sync the sync function to be called
 * @returns {Function}
 * @private
 */
function _wrap (fn, sync) {
  return wrapper

  /**
   * Random wrapper function.
   * @param {Object} [_opts] options object; if not provided, defaults are used
   * @param {Function} [ready] ready function; if not provided, the operation
   *   is performed synchronously.
   * @returns {*}
   */
  function wrapper (_opts, ready) {
    if (typeof _opts === 'function') {
      ready = _opts
      _opts = {}
    }

    var opts = objectAssign({}, DEFAULT_OPTS, _opts)

    // if we don't have a ready, perform action synchronously
    if (!ready) {
      if (opts.unique) {
        throw new Error('Cannot generate unique values synchronously.')
      }

      return sync(opts)
    }

    return fn(opts, dz(ready))
  }
}

function randomFloat (opts, ready) {
  crypto.randomBytes(FLOAT_ENTROPY_BYTES, function (err, buf) {
    if (err) {
      return ready(err)
    }

    ready(null, floatFromBuffer(buf))
  })
}

function randomInt (opts, ready) {
  crypto.randomBytes(FLOAT_ENTROPY_BYTES, function (err, buf) {
    if (err) {
      return ready(err)
    }

    ready(null, intFromFloat(floatFromBuffer(buf), opts.min, opts.max))
  })
}

function randomFloats (opts, ready) {
  numItemsFromAsyncFn(randomFloat, opts, ready)
}

function randomInts (opts, ready) {
  if (opts.unique && opts.max - opts.min < opts.num) {
    return ready(new Error('Not enough ints between min and max to be unique.'))
  }

  numItemsFromAsyncFn(randomInt, opts, ready)
}

function randomFloatSync () {
  return floatFromBuffer(crypto.randomBytes(FLOAT_ENTROPY_BYTES))
}

function randomIntSync (opts) {
  return intFromFloat(randomFloatSync(opts), opts.min, opts.max)
}

function randomFloatsSync (opts) {
  return arrayItemsFromFn(opts.num, randomFloatSync, opts)
}

function randomIntsSync (opts) {
  return arrayItemsFromFn(opts.num, randomIntSync, opts)
}

/**
 * Creates promisified versions of all random-lib public methods.
 *
 * @param {Promise} [_Promise] a promise constructor to be used. defaults to
 *   es6-promise in the event that one is not given.
 * @returns {Object} promisified random-lib public methods
 */
function promise (_Promise) {
  var Promise = _Promise || require('es6-promise').Promise
  var methods = ['randomInt', 'randomInts', 'randomFloat', 'randomFloats']
  var promisified = {}

  methods.forEach(function (method) {
    promisified[method] = promisify(module.exports[method])
  })

  return promisified

  function promisify (fn) {
    return promisifiedMethod

    function promisifiedMethod (opts) {
      return new Promise(function (resolve, reject) {
        fn(opts, function (err, result) {
          if (err) {
            return reject(err)
          }

          resolve(result)
        })
      })
    }
  }
}

/**
 * Given a buffer containing bytes of entropy, generate a double-precision
 * 64-bit float.
 *
 * @param {Buffer} buf a buffer of bytes
 * @returns {Number} a float
 */
function floatFromBuffer (buf) {
  if (buf.length < FLOAT_ENTROPY_BYTES) {
    throw new Error(
      'buffer must contain at least ' + FLOAT_ENTROPY_BYTES + ' bytes of entropy'
    )
  }
  var position = 0

  // http://stackoverflow.com/questions/15753019/floating-point-number-from-crypto-randombytes-in-javascript
  return (((((((
    buf[position++] % 32) / 32 +
    buf[position++]) / 256 +
    buf[position++]) / 256 +
    buf[position++]) / 256 +
    buf[position++]) / 256 +
    buf[position++]) / 256 +
    buf[position]) / 256
}

/**
 * Create in integer from a float, bounded between min and max
 * @param {Number} num a float
 * @param {Number} min the lower bound (inclusive)
 * @param {Number} max the upper bound (exclusive)
 * @returns {Number} an integer
 */
function intFromFloat (num, min, max) {
  return min + Math.floor(num * (max - min))
}

/**
 * Create an array of items, whose contents are the result of calling function
 *   fn once for each item in the array.
 *
 * @param {Number} num the size of the array to generate
 * @param {Function} fn the function to call on each
 * @param {*} args... a list of args to pass to the function fn
 * @returns {Array} the filled array
 */
function arrayItemsFromFn () {
  var args = Array.prototype.slice.call(arguments)
  var num = args.shift()
  var fn = args.shift()

  var arr = []

  for (var i = 0; i < num; ++i) {
    arr.push(fn.apply(null, args))
  }

  return arr
}

/**
 * Creates an array of items, whose contents are the result of calling
 *   asynchronous function fn once for each item in the array. The function is
 *   called in series, until the array is filled.
 *
 * @param {Function} fn the function to be called
 * @param {Object} opts the options hash that random-lib expects
 * @param {Function} ready the function to be called with (err, {Array} values)
 */
function numItemsFromAsyncFn (fn, opts, ready) {
  var values = []

  fn(opts, onValue)

  function onValue (err, value) {
    if (err) {
      return ready(err)
    }

    if (!opts.unique || values.indexOf(value) === -1) {
      values.push(value)
    }

    if (values.length >= opts.num) {
      return ready(null, values)
    }

    process.nextTick(function () {
      fn(opts, onValue)
    })
  }
}
