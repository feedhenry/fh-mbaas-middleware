var log = require('../logger/logger.js');
var mongoose = require('mongoose');
var models = require('../models')
var underscore = require('underscore');

var deleteHandler = require('./delete');
var crashHandler = require('./crash.js');
var alertHandler = require('../alerts/alerts');
var startHandler = require('./start');
var stopHandler = require('./stop');

var loggerPrefix = 'MBaaS Notifications EventHandler: ';

//
// Events that we have no interest in saving.
// e.g DELETE_REQUESTED as it will fire a clean down of the mongo collections for a Cloud App and would be removed anyways
//
var excludedMongoSaveEvents = [
  'DELETE_REQUESTED'
];


function sendAlertEmails(eventDetails){
  alertHandler.handler(eventDetails);
};

function createEventInMongo(eventDetails){
  var logger = log.logger;
  var Event = models.getModels().Event;
  eventDetails._id = new mongoose.Types.ObjectId();
  var event = new Event(eventDetails);

  if (!underscore.contains(excludedMongoSaveEvents, eventDetails.eventType)) {
    event.save(function (err, result) {
      if (err) {
        logger.info(loggerPrefix + 'Event [' + event.eventType + ']: Mongo Save Error', err);
      } else {
        logger.info(loggerPrefix + 'Event [' + event.eventType + '] Saved to Mongo. Forwarding to EventListener...');
      }
    });
  } else {
    logger.info(loggerPrefix + 'Event [' + event.eventType + '] Ignored from Mongo save. Forwarding to EventListener...');
  }
};


/**
 * Entry point for all Events to be acted upon (Source: Messaging)
 * Implementation based on EventType
 */
function handleEvent(eventDetails){

  createEventInMongo(eventDetails);
  sendAlertEmails(eventDetails);

  /// START Event Types
  if (underscore.contains(startHandler.events, eventDetails.eventType)) { startHandler.handler(eventDetails); }

  /// STOP Event Types
  else if (underscore.contains(stopHandler.events, eventDetails.eventType)) { stopHandler.handler(eventDetails); }

  /// DELETE Event Types
  else if (underscore.contains(deleteHandler.events, eventDetails.eventType)) { deleteHandler.handler(eventDetails); }

  /// CRASH Event Types
  else if (underscore.contains(crashHandler.events, eventDetails.eventType)) { crashHandler.handler(eventDetails); }
};


module.exports = {
  'handleEvent': handleEvent
};