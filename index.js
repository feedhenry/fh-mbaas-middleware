var mongoose = require('mongoose');
var app = require('./lib/middleware/app.js');
var appEnv = require('./lib/models/appEnv.js');
var models = require('./lib/models.js');
var auth = require('./lib/middleware/auth.js');
var envMongoDb = require('./lib/middleware/envMongoDb.js');
var appformsMiddleware = require('./lib/middleware/forms.js');
var mongo = require('./lib/util/mongo');
var log = require('./lib/logger/logger.js');
var appMbaasSchema = require('./lib/models/appMbaas.js');
var config = require('./lib/config/config.js');
var eventsMW = require('./lib/middleware/events');
var alertsMW = require('./lib/middleware/alerts');
var notifyMW = require('./lib/middleware/notifications');

/**
 *
 * This module has the basic grouping of middleware functionality
 * Allows for usage in both DynoFarm and OpenShift targets
 *
 */


function init(cfg, err) {

  if (cfg.logger) {
    log.logger = cfg.logger;
  }
  else {
    log.defaultLogger();
  }

  //Setting up namespace for the logger. This allows the logger to track request IDs
  //when mongoose queries have completed.
  var clsMongoose = require('fh-cls-mongoose');
  var loggerNamespace = log.logger.getLoggerNamespace();
  clsMongoose(loggerNamespace, mongoose);

  log.logger.info("Logger created");

  config.setConfig(cfg, function(error) {
    if (error) {
      log.logger.error(error);
      return err(error);
    }
    else {
      models.init(cfg, function(error,cb) {
        return err(error,cb);
      });
      var amqp = require('./lib/amqp/events');
      amqp.start();
    }
  });

}

function getLogger() {
  return log;
}

function getConfig() {
  return config.getConfig();
}

function getMbaas() {
  return models.getModels().Mbaas;
}

function getAppMbaas() {
  return models.getModels().AppMbaas;
}

function setConfig(cfg, err) {
   config.setConfig(cfg, function(error) {
    if (error) {
      log.logger.error(error);
      return err(error);
    }
    else {
      return err();
    }
  });
}


// Export the relevant functions/objects
module.exports = {
  logger: getLogger,
  app: app,
  appEnv: appEnv,
  models: models,
  auth: auth,
  mongo: mongo,
  envMongoDb: envMongoDb,
  appMbaasSchema: appMbaasSchema,
  appformsMiddleware: appformsMiddleware,
  events: eventsMW,
  alerts:alertsMW,
  notifications:notifyMW,
  init: init,
  config: getConfig,
  setConfig: setConfig,
  mbaas: getMbaas,
  appmbaas: getAppMbaas
};
