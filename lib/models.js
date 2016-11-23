var mongoose = require('mongoose');
var util = require('util');
var log = require('./logger/logger.js');
var models = {};

var connection;

// init our Mongo database
function init(config, cb) {
    connection = mongoose.createConnection(config.mongoUrl);

    var firstCallback = true;

    connection.on('error', function(err) {
      log.logger.error('Mongo error: ' + util.inspect(err));
      if (firstCallback) {
        firstCallback = false;
        return cb(err);
      } else {
        log.logger.error('Mongo error: ' + util.inspect(err));
        return cb(err);
      }
    });

    connection.once('open', function callback() {
      if (firstCallback) {
        log.logger.debug('Mongoose connected.');
        firstCallback = false;
        return cb(null,connection);
      }
      else {
        return cb();
      }
    });

    connection.on('disconnected', function() {
      log.logger.debug('Mongoose event - disconnect');
    });
    
    // Load schemas
    models.Mbaas = connection.model('Mbaas', require('./models/mbaas.js'));
    models.AppMbaas = connection.model('AppMbaas', require('./models/appMbaas.js'));
    models.Event = connection.model('Events', require('./models/events.js').EventSchema);
    models.Alert = connection.model('Alerts', require('./models/alerts.js').AlertSchema);
    models.Notification = connection.model("Notification",require('./models/notifications').NotificationSchema);
    models.Crash = connection.model("Crash",require('./models/crash').CrashSchema);
}

// Close all db handles, etc
function disconnect(cb) {
  if (connection) {
    log.logger.debug('Mongoose disconnected');
    connection.close(cb);
  } else {
    cb();
  }
}

module.exports = {
  init: init,
  disconnect: disconnect,
  getConnection: function(){
    return connection;
  },
  getModels: function(){
    return models;
  }
};
