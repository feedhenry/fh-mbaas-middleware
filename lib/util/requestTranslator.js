var Mongoose = require('mongoose');

/**
 * Parse the incoming test alert email request
 */
function parseTestEmailRequest(req){
    var reqObj = {};
    reqObj.emails = req.body.emails || 'no-emails';
    return reqObj;
};

/**
 * Parse the incoming Create Alert Request into a common object
 */
function parseCreateAlertRequest(req){

  var reqObj = {};
  reqObj.originalUrl = req.originalUrl;
  reqObj.alertName = req.body.alertName;
  reqObj.emails = req.body.emails;
  reqObj.eventCategories = req.body.eventCategories.split(',');
  reqObj.eventNames = req.body.eventNames.split(',');
  reqObj.eventSeverities = req.body.eventSeverities.split(',');
  reqObj.uid = req.body.uid;
  reqObj.env = req.body.env;
  reqObj.alertEnabled = req.body.enabled;
  reqObj._id = new Mongoose.Types.ObjectId();
  reqObj.domain = req.params.domain;
  return reqObj;
};

/**
 * Parse incoming create Event request into a common object
 */
function parseCreateEventRequest(req){
  var reqObj = {};
  reqObj.originalUrl = req.originalUrl;
  reqObj.timestamp = req.body.timestamp;
  reqObj.details = req.body.details;
  reqObj.eventClass = req.body.eventClass;
  reqObj.eventType = req.body.eventType;
  reqObj.eventLevel = req.body.eventLevel;
  reqObj.updatedBy  = req.body.updatedBy;
  reqObj.uid = req.body.uid;
  reqObj.env = req.body.env;
  reqObj.dyno = req.body.dyno;
  reqObj._id = new Mongoose.Types.ObjectId();
  reqObj.domain = req.params.domain;
  reqObj.source = "http";
  reqObj.appName = req.body.appName;
  return reqObj;
};

/**
 * Parse incoming create Event request into a common object
 */
function parseUpdateEventRequest(req){
  var reqObj = {};
  reqObj.originalUrl = req.originalUrl;
  reqObj.timestamp = req.body.timestamp;
  reqObj.details = req.body.details;
  reqObj.eventClass = req.body.eventClass;
  reqObj.eventType = req.body.eventType;
  reqObj.eventLevel = req.body.eventLevel;
  reqObj.uid = req.body.uid;
  reqObj.env = req.body.env;
  reqObj.dyno = req.body.dyno;
  reqObj._id = req.params.id;
  reqObj.domain = req.params.domain;
  return reqObj;
}

/**
 * Parse the incoming Update Alert Request into a common object
 */
function parseUpdateAlertRequest(req){
  var reqObj = {};
  reqObj.originalUrl = req.originalUrl;
  reqObj.alertName = req.body.alertName;
  reqObj.emails = req.body.emails.split(',');
  reqObj.eventCategories = req.body.eventCategories.split(',');
  reqObj.eventNames = req.body.eventNames.split(',');
  reqObj.eventSeverities = req.body.eventSeverities.split(',');
  reqObj.uid = req.body.uid;
  reqObj.env = req.body.env;
  reqObj.alertEnabled = req.body.enabled;
  reqObj._id = req.params.id;
  reqObj.domain = req.params.domain;
  return reqObj;
}

/**
 * Parse the incoming List Alert Request into a common object
 */
function parseListRequest(req){
  var reqObj = {};
  reqObj.originalUrl = req.originalUrl;
  reqObj.uid = req.params.guid;
  reqObj.env = req.params.environment;
  reqObj.domain = req.params.domain;
  return reqObj;
}

/**
 * Parse the incoming Delete Alert Request into a common object
 */
function parseDeleteRequest(req){
  var reqObj = {};
  reqObj.originalUrl = req.originalUrl;
  reqObj.uid = req.params.guid;
  reqObj.env =req.params.environment;
  reqObj.domain = req.params.domain;
  reqObj._id = req.params.id;
  return reqObj;
}

module.exports.parseCreateAlertRequest = parseCreateAlertRequest;
module.exports.parseCreateEventRequest = parseCreateEventRequest;
module.exports.parseListAlertRequest = parseListRequest;
module.exports.parseListNotificationsRequest = parseListRequest;
module.exports.parseListEventsRequest = parseListRequest;
module.exports.parseDeleteAlertRequest = parseDeleteRequest;
module.exports.parseDeleteEventRequest = parseDeleteRequest;
module.exports.parseUpdateAlertRequest = parseUpdateAlertRequest;
module.exports.parseUpdateEventRequest = parseUpdateEventRequest;
module.exports.parseTestEmailRequest = parseTestEmailRequest;
