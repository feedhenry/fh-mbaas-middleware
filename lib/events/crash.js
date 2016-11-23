var log = require('../logger/logger');

var loggerPrefix = 'MBaaS CrashEventHandler: ';
var crashMonitor = require('./crash/index');

var myEvents = [
  'CRASHED'
];

function handler(eventDetails){
  if (eventDetails.eventType === 'CRASHED'){
    crashMonitor.handler(eventDetails);
  }
}

function myEvents(){ return myEvents; }

exports.handler = handler;
exports.events = myEvents;