var mongoose = require('mongoose');
var log = require('../logger/logger.js');
var Schema = mongoose.Schema;

var LoggerPrefix = 'MBaaS Notifications Events Model: ';

/**
 * EVENT message schema
 * @type {*|Schema}
 */
var EventSchema = new Schema({
  
  uid: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date
  },
  updatedBy:{
    type:String, default:"System"
  },
  "source":{
    type:String
  },
  eventType: {
    type: String,
    required: true
  },
  eventClass: {
    type: String,
    required: true
  },
  eventLevel: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  dyno: {
    type: String
  },
  details: {
    type: Object
  },
  env: {
    type: String,
    required: true
  },
  appName:{
    type:String
  }
});

/**
 * Query all Notifications(AlertAudit) for uid & env
 * @param uid
 * @param env
 * @param cb
 */
EventSchema.statics.queryEvents = function(uid, env, domain, cb){
  if(!uid || ! env){
    return cb("expected a uid and env");
  }
  // Default query is by UID, Add env and domain if available
  var queryParams = { uid : uid };
  if (env){ queryParams.env = env; }
  if (domain){ queryParams.domain = domain; }

  log.logger.trace(LoggerPrefix + 'Querying Events for params: ', queryParams);

  // Run the query, returing error or list of Alerts matched
  this.find(queryParams).exec(function(err, events){
    if(err){
      log.logger.err(LoggerPrefix + 'Error Querying Events for params: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(LoggerPrefix + 'Events query complete [OK]');
    return cb(null, events);
  });
};

/**
 * Delete Event by _id
 * @param _id
 * @param cb
 */
EventSchema.statics.deleteEvent = function(_id, uid, env, domain, cb){
  if(!uid || ! env){
    return cb("expected a uid and env");
  }
  // Default query is by UID, Add env and domain if available
  var queryParams = {
    _id: _id,
    uid: uid,
    env: env,
    domain: domain
  };

  log.logger.trace(LoggerPrefix + 'Querying Event for Delete params: ', queryParams);

  // Run the query, returning error or list of Events matched
  this.find(queryParams).remove().exec(function(err, events){
    if(err){
      log.logger.err(LoggerPrefix + 'Error Querying Events for removal: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(LoggerPrefix + 'Events remove complete [OK]');
    return cb(null);
  });
};


EventSchema.statics.deleteEventsByAppIdAndEnv = function(uid, env, cb){
  if(!uid || ! env){
    return cb("expected a appid and env");
  }
  // Default query is by UID, Add env and domain if available
  var queryParams = {
    uid: uid,
    "env":env
  };

  log.logger.trace(LoggerPrefix + 'Querying Event for Delete params: ', queryParams);

  // Run the query, returing error or list of Events matched
  this.find(queryParams).remove().exec(function(err, events){
    if(err){
      log.logger.error(LoggerPrefix + 'Error Querying Events for removal: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(LoggerPrefix + 'Events remove complete [OK]');
    return cb(null);
  });
};

/**
 * Update Events by _id
 * @param alert
 * @param cb
 */
EventSchema.statics.updateEvent = function(eventUpdateRq, cb){
  
  if (! eventUpdateRq._id || ! eventUpdateRq.uid || ! eventUpdateRq.env){
    return cb("expected an event id an env and uid");
  }
  var queryParams = {
    _id: eventUpdateRq._id,
    uid: eventUpdateRq.uid,
    env: eventUpdateRq.env,
    domain: eventUpdateRq.domain
  };

  var updateSet = {
    originalUrl: eventUpdateRq.originalUrl,
    timestamp: eventUpdateRq.timestamp,
    details: eventUpdateRq.details,
    eventClass: eventUpdateRq.eventClass,
    eventType: eventUpdateRq.eventType,
    eventLevel: eventUpdateRq.eventLevel,
    dyno: eventUpdateRq.dyno
  };

  this.update(queryParams, updateSet, {}, function(err, events){
    if(err){
      log.logger.err(LoggerPrefix + 'Error Querying Events for update: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(LoggerPrefix + 'Events update complete [OK]');
    return cb(null);
  });
};

module.exports.EventSchema = EventSchema;