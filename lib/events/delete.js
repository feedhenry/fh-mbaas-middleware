var log = require('../logger/logger');

var loggerPrefix = 'MBaaS DeleteEventHandler: ';
var models = require('../models');

var myEvents = [
  'DELETE_REQUESTED',
  'DELETED',
  'DELETE_FAILED'
];

function handler(eventDetails){

  var logger = log.logger;

  var EventModel = models.getModels().Event;
  var AlertModel = models.getModels().Alert;
  var NotificationModel = models.getModels().Notification;

  if (eventDetails.eventType === 'DELETE_REQUESTED'){
    logger.info(loggerPrefix +'Processing Event [ DELETE_REQUESTED ] - Deleting Events, Alerts and Notifications for uid['+eventDetails.uid+'] env['+eventDetails.env+']');
    EventModel.deleteEventsByAppIdAndEnv(eventDetails.uid, eventDetails.env, function (){});
    AlertModel.deleteAlertsByAppIdAndEnv(eventDetails.uid, eventDetails.env, function (){});
    NotificationModel.deleteNotificationsByAppIdAndEnv(eventDetails.uid, eventDetails.env, function (){});
  }

  else if (eventDetails.eventType === 'DELETED'){
    //done here also as a direct call to df via dfc will not trigger delete requested. Not harm in firing the query twice.
    logger.info(loggerPrefix +'Processing Event [ DELETED ] - Deleting Events, Alerts and Notifications for uid['+eventDetails.uid+'] env['+eventDetails.env+']');
    EventModel.deleteEventsByAppIdAndEnv(eventDetails.uid, eventDetails.env, function (){});
    AlertModel.deleteAlertsByAppIdAndEnv(eventDetails.uid, eventDetails.env, function (){});
    NotificationModel.deleteNotificationsByAppIdAndEnv(eventDetails.uid, eventDetails.env, function (){});
  }
}

function myEvents(){ return myEvents; }

exports.handler = handler;
exports.events = myEvents;
