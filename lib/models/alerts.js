var mongoose = require('mongoose');
var log = require('../logger/logger.js');
var Schema = mongoose.Schema;
var loggerPrefix = 'MBaaS Notifications Events Model: ';

/**
 * ALERT Schema for holding set up alerts on EVENTS
 * Schema matches
 * @type {*|Schema}
 */
var AlertSchema = new Schema({
  
  uid: {
    type: String,
    required: true
  },
  env: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  alertName: {
    type: String
  },
  emails: {
    type: String,
    required: true
  },
  eventCategories: {
    type: Array,
    required: true
  },
  eventNames: {
    type: Array,
    required: true
  },
  eventSeverities: {
    type: Array,
    required: true
  },
  alertEnabled: {
    type: Boolean,
    required: true
  }
}, { collection: 'alerts'});

/**
 * Query all Alerts for uid, env and domain
 * @param uid
 * @param env
 * @param domain
 * @param cb
 */
 //[db-inspect]  makes db call to get alerts
AlertSchema.statics.queryAlerts = function(uid, env, domain, cb){

  // Default query is by UID, Add env and domain if available
  var queryParams = { uid : uid };
  if (env){ queryParams.env = env; }
  if (domain){ queryParams.domain = domain; }

  log.logger.trace(loggerPrefix + 'Querying Alerts for params: ', queryParams);

  // Run the query, returning error or list of Alerts matched
  this.find(queryParams).exec(function(err, alerts){
    if(err){
      log.logger.error(loggerPrefix + 'Error Querying Alerts for params: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(loggerPrefix + 'Alerts query complete [OK]');
    return cb(null, alerts);
  });
};

/**
 * Delete Alerts by _id
 * @param _id
 * @param cb
 */
//[db-inspect] makes db call to delete alerts
AlertSchema.statics.deleteAlert = function(_id, uid, env, domain, cb){

  // Default query is by UID, Add env and domain if available
  var queryParams = {
    _id: _id,
    uid: uid,
    env: env,
    domain: domain
  };

  log.logger.trace(loggerPrefix + 'Querying Alerts for Delete params: ', queryParams);

  // Run the query, returing error or list of Alerts matched
  this.find(queryParams).remove().exec(function(err, alerts){
    if(err){
      log.logger.error(loggerPrefix + 'Error Querying Alerts for removal: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(loggerPrefix + 'Alerts remove complete [OK]');
    return cb(null);
  });
};

//[db-inspect] makes db call
AlertSchema.statics.deleteAlertsByAppIdAndEnv = function(uid, env, cb){
  if(!uid || ! env){
    return cb("expected appid and env");
  }
  // Default query is by UID, Add env and domain if available
  var queryParams = {
    uid: uid,
    env:env
  };

  log.logger.trace(loggerPrefix + 'Querying Alerts for Delete params: ', queryParams);

  // Run the query, returing error or list of Alerts matched
  this.find(queryParams).remove().exec(function(err, alerts){
    if(err){
      log.logger.error(loggerPrefix + 'Error Querying Alerts for removal: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(loggerPrefix + 'Alerts remove complete [OK]');
    return cb(null);
  });
};

/**
 * Update Alerts by _id
 * @param alert
 * @param cb
 */
 //[db-inspect] makes db calls to update alerts
AlertSchema.statics.updateAlert = function(alertUpdateRq, cb){

  var queryParams = {
    _id: alertUpdateRq._id,
    domain: alertUpdateRq.domain
  };
  
  this.findOne(queryParams, function (err,doc){
    if(err){
      log.logger.error(loggerPrefix + 'Error Querying Alerts for update: ', queryParams, err);
      return cb(err);
    }
    if(! doc){
      return cb(new Error("no alert with that id found "));
    }
    doc.alertName =  alertUpdateRq.alertName; 
    doc.emails = alertUpdateRq.emails;
    doc.eventCategories = alertUpdateRq.eventCategories;
    doc.eventNames = alertUpdateRq.eventNames;
    doc.eventSeverities = alertUpdateRq.eventSeverities;
    doc.alertEnabled =alertUpdateRq.alertEnabled;
    doc.save(cb);
  });
};

module.exports.AlertSchema = AlertSchema;
module.exports.Alert = mongoose.model('Alert', AlertSchema);