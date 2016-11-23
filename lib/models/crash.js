var mongoose = require('mongoose');
var log = require('../logger/logger.js');
var Schema = mongoose.Schema;
var loggerPrefix = 'MBaaS App Crash Model: ';

var CrashSchema = new Schema({
  stamp: {
    type: Date,default: Date.now
  },
  msg_stamp:{
    type: Number,
    required: true
  },
  crashes:{
    type: Number,
    required: true
  },
  domain:{
    type: String,
    required: true
  },
  app:{
    type: String,
    required: true    
  },
  env:{
    type: String,
    required: true
  },
  dyno:{
    type: String,
    required: true    
  }
});


CrashSchema.statics.findCrashes = function(appName, cb){
  if(!appName)return cb("expected appname but was undefined");
  var queryParams = {"app":appName};
  this.findOne(queryParams, function (err,doc) {
    if (err) {
      log.logger.error(loggerPrefix + 'Error Querying Alerts for update: ', queryParams, err);
      return cb(err);
    }
    return cb(undefined,doc);
  });
};


CrashSchema.statics.deleteByAppName = function(appName,cb){
  if(!appName)return cb("expected appname but was undefined");
  var queryParams = {"app":appName};
  this.find(queryParams).remove().exec(function(err){
    if(err){
      log.logger.error(loggerPrefix + 'Error Querying Crashes for removal: ', queryParams, err);
      return cb(err);
    }
    log.logger.info(loggerPrefix + 'Crashes remove complete [OK]');
    return cb(null);
  });
};

module.exports.CrashSchema = CrashSchema;
module.exports.Alert = mongoose.model('Crash', CrashSchema);