var fhLogger = require('fh-logger');
var logger = null;

var placeholderLogFn = function () {
};

var log = {
  // Initial value of `log.logger` should not be undefined. This placeholder
  // does nothing but guarantees that `log.logger...` will not fail even if
  // the default logger has not yet been initialized.
  logger: {
    trace: placeholderLogFn,
    debug: placeholderLogFn,
    info: placeholderLogFn,
    warn: placeholderLogFn,
    error: placeholderLogFn,
    fatal: placeholderLogFn
  },
  defaultLogger: function () {
    if (logger) {
      return logger;
    }
    logger = fhLogger.createLogger({
      name: 'fh-mbaas-middleware',
      streams: [{
        "type": "stream",
        "src": true,
        "level": "error",
        "stream": "process.stdout"
      }]
    });
    this.logger = logger;
    return logger;
  }
};

module.exports = log; 
