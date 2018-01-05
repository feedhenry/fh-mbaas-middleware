var logger = require('../logger/logger');
var email = require('../email/index');
var models = require('../models');
var mongoose = require('mongoose');
var underscore = require('underscore');
var loggerPrefix = 'MBaaS AlertEmailHandler: ';


/**
 * Iterate user defined alerts to incoming event message and send emails when appropriate
 * @param alerts
 */
function matchAndIssueAlertEmails(eventDetails, alerts){
  underscore.each(alerts, function(alert) {
    if (shouldTriggerAlert(eventDetails, alert)){
      issueAlertEmail(eventDetails, alert);
    }
  });
};

/**
 * Test the Alert and see if we should send an email or not
 * @param alert
 */
function shouldTriggerAlert(eventDetails, alert){
  
  if (alert.alertEnabled){

    // Event Message Criteria
    var msgEventName = eventDetails.eventType;
    var msgEventCategory = eventDetails.eventClass;
    var msgEventSeverity = eventDetails.eventLevel;

    // Saved Alert Criteria
    var alertEventNames = alert.eventNames;
    var alertEventCategories = alert.eventCategories;
    var alertEventSeverities = alert.eventSeverities;

    // Test results
    var matchOnAlertEventName = alertEventNames.indexOf(msgEventName) > -1;
    var matchOnAlertEventCategory = alertEventCategories.indexOf(msgEventCategory) > -1;
    var matchOnAlertSeverity = alertEventSeverities.indexOf(msgEventSeverity) > -1;

    // if we match on the above, grab the emails from the Alert and send email (where is template???) and save Notification to Mongo (what is the record format????)
    if (matchOnAlertEventName && matchOnAlertEventCategory && matchOnAlertSeverity) {
      logger.logger.trace(loggerPrefix +'Match found. Sending emails to: ', alert.emails);
      return true;
    } else {
      logger.logger.trace(loggerPrefix +'No Match found. No emails to send');
      return false;
    }
  } else {
    return false;
  }
};

/**
 * If required send the details to core to issue an Email alert
 */
 //[db-inspect] makes db calls which saves a notificaton to the mongodb
function issueAlertEmail(eventDetails, alertMatch){
  var emailData = {};
  emailData.alert = alertMatch;
  emailData.eventDetails = eventDetails;
  var Notification = models.getModels().Notification;

  // Send the email and save to Mongo on success or error out if not
  email.sendAlertEmail(emailData, function(err, emailBody){
    if (err){
      logger.logger.error(loggerPrefix + '[Error] Sending email alert(s) to ' + emailData.alert.emails, err);
    }
    var notificationDtls = {};
    notificationDtls._id = new mongoose.Types.ObjectId();
    notificationDtls.domain = emailData.alert.domain;
    notificationDtls.uid = emailData.alert.uid;
    notificationDtls.alertName = emailData.alert.alertName;
    notificationDtls.env = emailData.alert.env;
    notificationDtls.recipients = emailData.alert.emails;
    notificationDtls.subject = 'Alert: ' + emailData.alert.alertName + ' - Cloud App (' + emailData.alert.uid + ') - ' + emailData.eventDetails.eventType;
    notificationDtls.body = emailBody;

    var notification = new Notification(notificationDtls);

    notification.save(function (err, result) {
      if (err) {
        logger.logger.error(loggerPrefix +'[Error] Saving Notification record to Mongo ', err);
      } else {
        logger.logger.trace(loggerPrefix +'[OK] Saving Notification record to Mongo ');
      }
    });
  });
};


/**
 * Handle an EVENT. We will take the EVENT details,
 * match the Alerts in Mongo that have been setup and
 * if a match is found, then send the email from the MBaaS
 * @param msg
 * @param headers
 * @param info
 * @param cb
 */
 //[db-inspect] makes db call to mongo using the mongoose model to get the alert models
function handler (eventDetails){
  var Alert = models.getModels().Alert;
  logger.logger.trace(loggerPrefix +'Processing Alerts for Event: ', eventDetails);

  Alert.queryAlerts(eventDetails.uid, eventDetails.env, eventDetails.domain, function(err, alerts){
    if(err) {
      logger.logger.warn({ error:err }, loggerPrefix +'Failed to query Alerts for uid and env', uid, env);
    } else {
      if(alerts && alerts.length > 0){
        logger.logger.trace(loggerPrefix +'Found ['+ alerts.length +'] Alerts. Matching and send emails', alerts);
        matchAndIssueAlertEmails(eventDetails, alerts);
      } else {
        logger.logger.trace(loggerPrefix +'No Alerts for event. No emails to send.');
      }
    }
  });
};



module.exports = {
  'handler':handler,
  'issueAlertEmail': issueAlertEmail,
  'shouldTriggerAlert':shouldTriggerAlert
};