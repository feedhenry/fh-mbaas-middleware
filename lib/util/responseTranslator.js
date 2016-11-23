var _ = require('underscore');

/**
 * Alerts from Mongo should not be coupled to response format
 * Map query result Alerts to single response object as it is defined
 * @param alerts
 * @returns {{}}
 */
function mapMongoAlertsToResponseObj(alerts){

  // Base response, regardless of whether we have alerts or not
  var res = {"list":[],"status":"ok"};

  // Filter and add alerts to response if we have them
  if (alerts){
    res.list = _.map(alerts, function(alert){
      var al = alert.toJSON();
      al.guid = alert._id;
      al.enabled = alert.alertEnabled;
      return al;
    });
  }
  // Return the response
  return res;
};

/**
 * Notifications from Mongo should not be coupled to response format
 * Map query result Notifications to single response object as it is defined
 * @param alerts
 * @returns {{}}
 */
function mapMongoNotificationsToResponseObj(notifications){

  // Base response, regardless of whether we have alerts or not
  var res = {"list":[],"status":"ok"};

  // Filter and add alerts to response if we have them
  if (notifications){
    res.list = _.map(notifications, function(notification){
      return notification.toJSON();
    });
  }
  // Return the response
  return res;
};

/**
 * Events from Mongo should not be coupled to response format
 * Map query result Events to single response object as it is defined
 * @param alerts
 * @returns {{}}
 */
function mapMongoEventsToResponseObj(events){

  // Base response, regardless of whether we have alerts or not
  var res = {"list":[],"status":"ok"};

  // Filter and add alerts to response if we have them
  
  if (events){
    res.list = _.map(events, function(event){
      var ev = event.toJSON();
      ev.message = event.details ? event.details.message || " " : " ";
      ev.category = event.eventClass;
      ev.severity = event.eventLevel;
      ev.guid = event._id;
      ev.eventDetails = ev.details ||{};
      return ev;
    });
  }
  // Return the response
  return res;
};

module.exports.mapAlertsToResponse = mapMongoAlertsToResponseObj;
module.exports.mapNotificationsToResponse = mapMongoNotificationsToResponseObj;
module.exports.mapEventsToResponse = mapMongoEventsToResponseObj;