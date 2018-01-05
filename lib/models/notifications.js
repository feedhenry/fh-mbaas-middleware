var mongoose = require('mongoose');
var log = require('../logger/logger.js');
var Schema = mongoose.Schema;

var loggerPrefix = 'MBaaS Notifications Notification Model: ';

var NotificationSchema = new Schema({
  guid: {
    type: String
  },
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
  environment: {
    type: String
  },
  recipients: {
    type: String
  },
  subject: {
    type: String
  },
  body: {
    type: String
  },
  sysCreated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Query all Notifications(AlertAudit) for uid & env
 * @param uid
 * @param env
 * @param cb
 */
 //[db-inspect]  makes db call to  query for notifications
NotificationSchema.statics.queryNotifications = function(uid, env, domain, cb){

  // Default query is by UID, Add env and domain if available
  if(!uid || ! env){
    return cb("expected a appid and env");
  }
  var queryParams = { uid : uid };
  if (env){ queryParams.env = env; }
  if (domain){ queryParams.domain = domain; }

  log.logger.trace(loggerPrefix + 'Querying Notifications for params: ', queryParams);

  // Run the query, returning error or list of Alerts matched
  this.find(queryParams).exec(function(err, notifications){
    if(err){
      log.logger.err(loggerPrefix + 'Error Querying Notifications for params: ', queryParams, err);
      return cb(err);
    }
    log.logger.trace(loggerPrefix + 'Notifications query complete [OK]');
    return cb(null, notifications);
  });
};

//[db-inspect]  makes db call to delete notificatons by app id and env
NotificationSchema.statics.deleteNotificationsByAppIdAndEnv = function(uid, env, cb){
  if(!uid || ! env){
    return cb("expected a appid and env");
  }
  // Default query is by UID, Add env and domain if available
  var queryParams = {
    uid: uid,
    "env":env
  };

  log.logger.trace(loggerPrefix + 'Querying Notification for Delete params: ', queryParams);

  // Run the query, returing error or list of Events matched
  this.find(queryParams).remove().exec(function(err, notifications){
    if(err){
      log.logger.error(loggerPrefix + 'Error Querying Notifications for removal: ', queryParams, err);
      return cb(err);
    }
    log.logger.trace(loggerPrefix + 'Notifications remove complete [OK]');
    return cb(null);
  });
};

module.exports.NotificationSchema = NotificationSchema;