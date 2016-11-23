var logger = require('../logger/logger').logger;
var fs = require('fs');
var config = require('../config/config.js');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var ALERT_EMAIL_TEMPLATE = __dirname + '/templates/alertEmail.txt';
var TEST_EMAIL_TEMPLATE = __dirname + '/templates/testEmail.txt';

function getTransport(emailConfig) {
  if ('sendgrid' === emailConfig.transport) {
    var options = emailConfig.sendgrid;
    logger.info('Mail - SendGrid transport', options);
    return nodemailer.createTransport(sgTransport(options));
  } else if (emailConfig.transport === 'smtp') {
    logger.info('Mail - SMTP transport');
    return nodemailer.createTransport(emailConfig.smtp);
  } else {
    logger.info('Mail - sendmail transport');
    return nodemailer.createTransport();
  }
}

/**
 * Send a test email actioned from ngui create alert modal
 */
function sendTestEmail(testEmailData, cb) {
  var emailConfig = config.getConfig().email;
  var from = emailConfig ? emailConfig.alert_email_from : 'noreply@feedhenry.com';
  var toEmails = testEmailData.emails;

  fs.readFile(TEST_EMAIL_TEMPLATE, function(err, data) {
    if (err) {
      return cb({
        'error': 'Could not load email template from "' + TEST_EMAIL_TEMPLATE + '": ' + err
      });
    }

    logger.info('Sending test email');

    var emailBody = data.toString();
    emailBody = emailBody.replace(/%providerName%/g, from);
    getTransport(emailConfig).sendMail({
      from: from,
      to: toEmails,
      subject: 'Alert Test Email',
      html: emailBody
    }, cb);
  });
}

/**
 * Send an Alert email to recipients for given Event
 * @param alertEmailData
 * @param cb
 */
function sendAlertEmail(alertEmailData, cb) {
  var mongoAlert = alertEmailData.alert;
  var eventDetails = alertEmailData.eventDetails;
  var emailConfig = config.getConfig().email;
  var from = emailConfig ? emailConfig.alert_email_from : 'noreply@feedhenry.com';

  fs.readFile(ALERT_EMAIL_TEMPLATE, function(err, data) {
    if (err) {
      return cb({
        'error': 'Could not load email template from "' + ALERT_EMAIL_TEMPLATE + '": ' + err
      });
    }
    var emailBody = data.toString();
    emailBody = emailBody.replace(/%appName%/g, eventDetails.appName || "");
    emailBody = emailBody.replace(/%appGuid%/g, eventDetails.uid);
    emailBody = emailBody.replace(/%appUrl%/g, ' ');
    emailBody = emailBody.replace(/%alertName%/g, mongoAlert.alertName);
    emailBody = emailBody.replace(/%eventTimestamp%/g, eventDetails.timestamp);
    emailBody = emailBody.replace(/%updatedBy%/g, eventDetails.updatedBy);
    emailBody = emailBody.replace(/%eventMessage%/g, eventDetails.details.message);
    emailBody = emailBody.replace(/%eventCategory%/g, eventDetails.eventClass);
    emailBody = emailBody.replace(/%eventName%/g, eventDetails.eventType);
    emailBody = emailBody.replace(/%eventSeverity%/g, eventDetails.eventLevel);
    emailBody = emailBody.replace(/%eventDetails%/g, JSON.stringify(eventDetails.details));
    emailBody = emailBody.replace(/%providerName%/g, from);

    getTransport(emailConfig).sendMail({
      from: from,
      to: mongoAlert.emails,
      subject: 'Alert Name: ' + mongoAlert.alertName + ' - Cloud App (' + mongoAlert.uid + ')',
      html: emailBody
    }, cb);
  });
}

exports.sendAlertEmail = sendAlertEmail;
exports.sendTestEmail = sendTestEmail;
