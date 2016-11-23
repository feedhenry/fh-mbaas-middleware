//Function for getting the mongo connection URI for a specific environment.

"use strict";

var mbaas = require('../models.js');
var common = require('../util/common.js');
var log = require('../logger/logger.js');
var config = require('../config/config.js');

/**
 * DropEnvironmentDatabase removes the database for specific environment completely
 *  */

function dropEnvironmentDatabase(domain, env, next) {
  _getEnvironmentDatabase({
    domain: domain,
    environment: env
  }, function (err, found) {
    if (err) {
      return next(common.buildErrorObject({
        err: err,
        msg: 'Failed to get environment',
        httpCode: 500
      }));
    }
    if (!found) {
      log.logger.info("no environment db for " + env + " moving on");
      return next();
    }
    found.dropDb(config.getConfig(), function dropped(err) {
      if (err) {
        log.logger.error('Failed to delete model');
        return next(common.buildErrorObject({
          err: err,
          msg: 'Failed to drop environment db',
          httpCode: 500
        }));
      }
      found.remove(next);
    });
  });
}

/**
 * Function that will return a mongo
 * @param req
 * @param res
 * @param next
 */
function getOrCreateEnvironmentDatabase(req, res, next){

  var models = mbaas.getModels();

  log.logger.debug('process getOrCreateEnvironmentDatabase request', req.originalUrl , req.body, req.method, req.params);

  var domain = req.params.domain;
  var env = req.params.environment;
  log.logger.debug('process db create request', {domain: domain, env: env} );

  _getEnvironmentDatabase({
    domain: domain,
    environment: env
  }, function(err, found){
    if(err){
      return next(common.buildErrorObject({
        err: err,
        msg: 'Failed to get mbaas instance',
        httpCode: 500
      }));
    }

    log.logger.debug('process db create request AFTER', {domain: domain, env: env} );

    if(found){
      req.mongoUrl = common.formatDbUri(found.dbConf);
      return next();
    } else {
      // because of the composite unique index on the collection, only the first creation call will succeed.
      // NB the req.params should have the mongo.host and mongo.port set !!
      var cfg = config.getConfig();

      models.Mbaas.createModel(domain, env, cfg, function(err, created){
        if(err){
          return next(common.buildErrorObject({
            err: err,
            msg: 'Failed to create mbaas instance',
            httpCode: 500
          }));
        }
        created.createDb(cfg, function(err, dbConf){
          if(err){
            log.logger.error('Failed to create db, delete model');
            created.remove(function(removeErr){
              if(removeErr){
                log.logger.error(removeErr, 'Failed to remove model');
              }
              return next(common.buildErrorObject({
                err: err,
                msg: 'Failed to create db for domain ' + domain + ' and env ' + env,
                httpCode: 500
              }));
            });
          } else {
            req.mongoUrl = common.formatDbUri(dbConf);
            next();
          }
        });
      });
    }
  });
}

function _getEnvironmentDatabase(params, cb){
  var models = mbaas.getModels();
  log.logger.debug('process _getEnvironmentDatabase request', params );
  models.Mbaas.findOne(params, cb);
}

//Middleware To Get An Environment Database
function getEnvironmentDatabase(req, res, next){
  log.logger.debug('process getEnvironmentDatabase request', req.originalUrl );

  _getEnvironmentDatabase({
    domain: req.params.domain,
    environment: req.params.environment
  }, function(err, envDb){
    if(err){
      log.logger.error('Failed to get mbaas instance', err);
      return next(common.buildErrorObject({
        err: err,
        msg: 'Failed to get mbaas instance',
        httpCode: 500
      }));
    }

    if(!envDb){
      log.logger.error("No Environment Database Found", err);
      return next(common.buildErrorObject({
        err: new Error("No Environment Database Found"),
        httpCode: 400
      }));
    }

    req.mongoUrl = common.formatDbUri(envDb.dbConf);

    log.logger.debug("Found Environment Database", req.mongoUrl);

    return next();
  });
}

module.exports = {
  getOrCreateEnvironmentDatabase: getOrCreateEnvironmentDatabase,
  getEnvironmentDatabase: getEnvironmentDatabase,
  dropEnvironmentDatabase: dropEnvironmentDatabase
};
