var loggerPrefix = 'MBaaS StopEventHandler: ';
var crash = require('./crash/index');
var log = require('../logger/logger');
var myEvents = [
  'STOP_REQUESTED',
  'STOP_SUCCESSFUL',
  'STOP_FAILED'
];

function handler(eventDetails){
  var logger = log.logger;
  if (eventDetails.eventType === 'STOP_SUCCESSFUL'){
    logger.debug(loggerPrefix + " : STOP_SUCCESSFUL message received", eventDetails );
    crash.stopEventHandler(eventDetails);
  }
}

function myEvents(){ return myEvents; }

exports.handler = handler;
exports.events = myEvents;