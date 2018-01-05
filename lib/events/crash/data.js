var constants = require('./constants.js');
var config = require('../../config/config.js');
var logger = require('../../logger/logger').defaultLogger();
var util = require('util');
var models = require('../../models');

/**
 * 
 * @returns {number}
 * @desc unix time stamp in milliseconds
 */
function keyTime(){
  var sampleTime = config.getConfig().crash_monitor.sample_time_hrs; // the amount of time to hold onto crash data
  logger.debug(constants.LOG_TAG + "sample time " + sampleTime);
  if(isNaN(sampleTime)){
    logger.warn(constants.LOG_TAG + " sample time evaluated to NaN sample time reverting to default 24hrs ");
    sampleTime = 24;
  }
  //num seconds in an hour * by sample_time_hrs * 1000 gets milliseconds
  // 1hr is 360 * 1 * 1000 = 36000
  return  Date.now() +( ( 60 * 60 ) * sampleTime ) * 1000;
}
/**
 * 
 * @param from
 * @param modifier
 * @returns {{seconds: number, minutes: number, period: number}}
 * 
 * figures out how much time in second and minutes has passed since from. 
 * Period is the number of intervals (30 second spans for instance) that have passed since from.
 * So if the interval was 30 seconds and 2 minutes has passed 4 periods would have elapsed.
 * 
 */
function getTime(from, interval){
  var seconds = (Date.now() - from) / 1000;

  var minutes = seconds / 60;
  var period = seconds / interval;
  return {
    "seconds":seconds,
    "minutes":minutes,
    "period":period
  };
}


//[db-inspect] makes db call to mongo to using the mongoose model to find what appears to be app crashes
function getCrashes(appName, cb){
  var CrashModel = models.getModels().Crash;
  CrashModel.findCrashes(appName, function (err, ok){
    logger.debug(constants.LOG_TAG + " got from mongo " + util.inspect(ok));
    return cb(err, ok);
  });
}

//[db-inspect] makes db call to mongo to using the mongoose model to add a new crash record
function addCrash(msg , startPoint, cb) {
  var CrashModel = models.getModels().Crash;
  if(! msg || ! msg.appName){
    return cb("expected an appname but found none");
  }
  getCrashes(msg.appName, function (err, crashLog){
    if(err){
      logger.warn(constants.LOG_TAG + "failed to get crash data from Mongo " + util.inspect(err));
      return cb("failed to get crash data from Mongo " + util.inspect(err));
    }
    //check the keytime so if config changes we pickit up
    var timePassed = (crashLog) ? (Date.now() - crashLog.stamp) : undefined;
    if(crashLog && timePassed  < keyTime()){
      logger.debug(constants.LOG_TAG + ' crashLog is still valid incr crashes ',timePassed, keyTime());
      crashLog.crashes++;
      crashLog.save(done);

    }else if(crashLog && timePassed > keyTime()){
      crashLog.crashes=1; //reset after the time interval has passed
      done();
    }
    else{
      crashLog = new CrashModel({
        "stamp":Date.now(),
        "msg_stamp":msg.timestamp,
        "crashes":startPoint,
        "domain":msg.domain,
        "app":msg.appName,
        "env":msg.env,
        "dyno":msg.dyno || msg.domain + "-" + msg.env
      });
      crashLog.save(done)
    }
    function done(err,ok){
      logger.debug(constants.LOG_TAG + " saved data to mongo key "+ "crash-"+msg.appName + " " + util.inspect(ok));
      return cb(err,ok);
    }
  });
}

//[db-inspect] makes db call to mongo using the mongoose model to delete a crash record
function deleteCrash(appName, cb){
  var CrashModel = models.getModels().Crash;
  logger.debug(constants.LOG_TAG + " deleting crash log " + "crash-"+appName);
  CrashModel.deleteByAppName(appName,cb);

}

module.exports = {
  "getTimeSpan":getTime,
  "getCrashes":getCrashes,
  "addCrash":addCrash,
  "deleteCrash":deleteCrash
};
