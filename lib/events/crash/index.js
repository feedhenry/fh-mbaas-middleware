var config = require('../../config/config.js');
var log = require('../../logger/logger');
var util = require('util');
var test = require('./test.js');
var amqp = require('../../amqp/amqp.js');
var async = require('async');
var constants =  require('./constants.js');
var crashDao = require('./data.js');
var moment = require('moment');

var handledEvents = ["START_SUCCESSFUL", "CRASHED", "STOP_SUCCESSFUL"];

/**
 * @desc handles crashed messages from apps via rabbitmq or http. Deciding whether or not the app should be terminated or not.
 * @param msg
 * @param headers
 * @param info
 */

function crashEventHandler(msg){
  var logger = log.logger;
  var conf  =  config.getConfig();
  var app = msg.appName;
  var domain = msg.domain;
  var env = msg.env;
  var minCrashes = conf.crash_monitor.min_num_crashes;
  var enabled = conf.crash_monitor.enabled;
  var internalMsg = null;
  //check
  if(conf.fhamqp) {
    amqp.connect();
    internalMsg = amqp.getVhostConnection(amqp.VHOSTS.INTERNAL);
  }

  if(handledEvents.indexOf(msg.eventType) < 0){
    logger.debug(constants.LOG_TAG + " not handleing event ", msg.eventType);
    return;
  }

  if(!enabled){
    logger.debug(constants.LOG_TAG + " crash monitor is not enabled")
    return;
  }

  if(! app){
    logger.warn(constants.LOG_TAG + " cannot process msg no appname in msg " + util.inspect(msg));
    return;
  }
  if(!domain){
    logger.warn(constants.LOG_TAG + " cannot process msg no domain in msg " + util.inspect(msg));
    return;
  }
  if(!env){
    logger.warn(constants.LOG_TAG + " cannot process msg no env in msg " + util.inspect(msg));
    return;
  }

  //helper
  function stopAppAfterCrash(message,crashes, cb){
    //TODO needs to stop apps in OPENSHIFT 3
    if(internalMsg) {
      var now = moment();
      var then = moment(crashes.stamp);
      var inTheLast = moment.duration(now.diff(then)).humanize();
      message.reason = "app crashed # " + crashes.crashes + " times in the last " + inTheLast; // e.g "5 minutes"
      message.severity = "terminated";
      internalMsg.publishTopic("fh-internal", "app.stop", message, function (err) {
        if (err) return handleError(err);
        logger.trace({msg: msg}, 'Published message');
      });
    }
  }

  /**
   * log the crash
   * evaluate the apps crash history
   * decide what action to take
   */
  async.waterfall([
    function logCrash(callback){
      logger.debug(constants.LOG_TAG + " logging crash for app " + app + " " + util.inspect(msg));
      crashDao.addCrash(msg,1,function (err, ok){
        callback(err);
      });
    },
    function getAppCrashes(callback){
      crashDao.getCrashes(app,function (err,ok){
        logger.debug(constants.LOG_TAG + " get app crashes for app " + app + " " + util.inspect(err), " " + util.inspect(ok));
        callback(err, ok);
      });
    },
    function evalCrashes(crashes,callback){
      callback(undefined, test(crashes), crashes);
    },
    function takeAction (failed,crashes,callback){
      logger.debug(constants.LOG_TAG + " crash test for app " + app +" " + " failed: ", failed);
      if(failed){
        logger.info(constants.LOG_TAG + " stopping app " + app + " as crash test failed ");

        stopAppAfterCrash(msg, crashes, function (err, ok){
          callback(err,msg );
          crashDao.deleteCrash(app,function (err, ok){
            if(err){
              logger.warn(constants.LOG_TAG + " failed to delete crash log " + util.inspect(err));
            }
          });
        });
      }else{
        callback(undefined,{"action":"none","crashes":crashes,"message":"","minCrashes":minCrashes});
      }
    }
  ],function complete (err, info){
    logger.debug(constants.LOG_TAG + " crash message handler complete " + util.inspect(err) + " " + util.inspect(info));
    if("function" == typeof  cb) {
      cb(err, info);
    }
  });
};

function resetCrashes(msg){
  var logger = log.logger;
  logger.debug(constants.LOG_TAG + " got started message resetting crashLog");
  return crashDao.deleteCrash(msg.appName, function (err, ok){
    if(err){
      logger.warn(constants.LOG_TAG + " failed to delete crash ", err);
    }
    crashDao.addCrash(msg,0,function (err, ok){
      if(err)logger.warn(constants.LOG_TAG + " failed to add a crashLog ", err);
    });
  });
}

function deleteCrashes(msg) {
  var logger = log.logger;
  logger.debug(constants.LOG_TAG + " got started message deleting crashLog");
  return crashDao.deleteCrash(msg.appName, function (err, ok){
    if(err){
      logger.warn(constants.LOG_TAG + " failed to delete crash ", err);
    }
  });
}

function startEventHandler(event){
  resetCrashes(event);
}

function stopEventHandler(event){
  resetCrashes(event);
}

function deleteEventHandler(event) {
  deleteCrashes(event);
}


exports.handler = crashEventHandler;
exports.startEventHandler = startEventHandler;
exports.stopEventHandler = stopEventHandler;
exports.deleteEventHandler = deleteEventHandler;