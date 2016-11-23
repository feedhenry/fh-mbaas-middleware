var log = require('../logger/logger');

var loggerPrefix = 'MBaaS StartEventHandler: ';
var crash = require('./crash/index');
var myEvents = [
  'START_REQUESTED',
  'START_SUCCESSFUL',
  'START_FAILED',
  'DEPLOYED'
];

function handler(eventDetails){
  var logger = log.logger;
  if (eventDetails.eventType === 'START_SUCCESSFUL'){
    crash.startEventHandler(eventDetails);
  } else if (eventDetails.eventType === 'DEPLOYED'){
    crash.startEventHandler(eventDetails);
  }
}

function myEvents(){ return myEvents; }

exports.handler = handler;
exports.events = myEvents;
