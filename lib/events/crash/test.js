var config = require('../../config/config.js');
var log = require('../../logger/logger');
var util = require('util');
var constants =  require('./constants.js');
var crashDao = require('./data.js');


/**
 *
 * @param crashData
 * @returns {boolean}
 * @desc takes the configured time (60 sec for eg) and the tolerance for crashes (1 for eg) so 1 crash every 60 seconds is tolerated; then finds the average number of crashes since the app started
 * to maximum of the configured number of hours (4 for eg) and if the average number of crashes is greater than the tolerance returns true, meaning the crashTest failed and some action can be taken.
 * If the maxNumCrashes is reached over the configured time action is also taken
 */
module.exports = function crashTest(crashData){
  var logger = log.logger;
  if(! crashData){
    logger.warn(constants.LOG_TAG + " crash test called with not crash data. Cannot perform test ");
    return true;
  }
  var conf = config.getConfig();
  var minCrashes = conf.crash_monitor.min_num_crashes; // minumum number of crashes before taking any action
  var maxNumCrashes = conf.crash_monitor.max_num_crashes; //if we reach this number of crashes within the test period stop the app anyway.
  var crashTolerance = conf.crash_monitor.tolerance; // the number of crashes we will tolerate within 1 minute
  var time_modifier = conf.crash_monitor.base_time_seconds;
  logger.debug(constants.LOG_TAG + " evaluating crashes for app " + crashData.app + " " + util.inspect(crashData));

  //allow at least one crash
  if(crashData.crashes <= 1){
    return false;
  }

  var time = crashDao.getTimeSpan(crashData.stamp, time_modifier);
  logger.debug(constants.LOG_TAG +  " time info  ", time);
  var numMin = time.minutes; // number of minutes that have passed since the app started or since the max time elapsed
  var testPeriod = time.period; // the number of intervals that have passed. So if 60 seconds have passed and the time_modifier is 30 then this will be 2
  if(time.seconds < time_modifier){
    logger.debug(constants.LOG_TAG + " ignoring test as not enough time has passed modifier ", time_modifier, " time passed ", time.seconds);
    return false;
  }

  var numCrashesToCompare = crashData.crashes; //how many times have we crashed since the log began and up to the configured sample_time_hrs

  var cpm = ( numCrashesToCompare / numMin); // crashes per minute num of crashes divided by the number of minutes that have passed since the first crash
  var cot = (numCrashesToCompare / testPeriod); //crashes per time period (30 seconds for eg)
  
  logger.debug(constants.LOG_TAG + " avg crashes per min = ", cpm, "avg crashes "+cot+" over time " + time.period, " num crashes ", crashData.crashes, " time passed since first crash ", numMin, "modifier ", time_modifier);
  
  if(crashData.crashes >= maxNumCrashes){
    logger.info(constants.LOG_TAG + " maximum number of crashes reached " + maxNumCrashes + " within the time span sample_time_hrs " + conf.sample_time_hrs + " stopping app");
    return true;
  } 
  
  //fails if more crashes than min crashes, more seconds have passed than the time_modifier and crashes over time is greater than our tolerance.
  
  return (crashData.crashes >= minCrashes
  && time.seconds > time_modifier
  &&  cot > crashTolerance);

};
