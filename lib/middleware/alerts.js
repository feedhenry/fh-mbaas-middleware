var log = require('../logger/logger');
var models = require('../models');
var email = require('../email/index');

var RequestTranslator = require('../util/requestTranslator');
var ResponseTranslator = require('../util/responseTranslator');

var loggerPrefix = 'MBaaS Notifications Alerts HTTP Router: ';


function testEmails(req, res, next){
  var testEmailReq = RequestTranslator.parseTestEmailRequest(req);
  logger = log.defaultLogger();
  var emailData = {};
  emailData.emails = testEmailReq.emails;

  email.sendTestEmail(emailData, function(err, emailBody){
    if (err){
      logger.error('Failed to send test email to ['+ emailData.emails +']', err);
      next(err);
    } else {
      logger.trace('Test email sent to ['+ emailData.emails +']', emailBody);
      next();
    }
  });
}

function createAlert(req, res, next){
  var AlertModel = models.getModels().Alert;
  logger = log.defaultLogger();
  var createReq = RequestTranslator.parseCreateAlertRequest(req);

  var alert = new AlertModel(createReq);
  logger.trace(loggerPrefix + 'ALERT Mongo SAVE');
  alert.save(function (err, result) {
    logger.trace(loggerPrefix + 'ALERT Mongo SAVE [error]: callback');
    if (err) {
      next(err);
      logger.error(loggerPrefix + 'ALERT Mongo SAVE [error]: ', err);
    } else {
      logger.trace(loggerPrefix + 'ALERT Mongo SAVE [OK]');
      req.resultData = {};
      next();
    }
  });

}


function updateAlert(req, res, next){
  var AlertModel = models.getModels().Alert;
  logger = log.defaultLogger();
  var updateReq = RequestTranslator.parseUpdateAlertRequest(req);


  AlertModel.updateAlert(updateReq, function(err,model){
    if(err) {
      logger.error(loggerPrefix + 'Alerts Update Error: ', err);
      next(err);
    } else {
      req.resultData = model;
      next();
    }
  });
}


function deleteAlert(req, res, next){
  var AlertModel = models.getModels().Alert;
  logger = log.defaultLogger();
  var deleteReq = RequestTranslator.parseDeleteAlertRequest(req);

  AlertModel.deleteAlert(deleteReq._id, deleteReq.uid, deleteReq.env, deleteReq.domain, function(err){
    if(err) {
      logger.error(loggerPrefix + 'Alerts Delete Error: ', err);
      next(err);
    } else {
      req.resultData =  {};
      next();
    }
  });
}


function listAlerts(req, res, next){
  var AlertModel = models.getModels().Alert;
  logger = log.defaultLogger();
  var listReq = RequestTranslator.parseListAlertRequest(req);

  AlertModel.queryAlerts(listReq.uid, listReq.env, listReq.domain, function(err, alerts){
    if(err) {
      logger.error(loggerPrefix + 'Alerts Query Error: ', err);
      next(err);
    } else {
      var alertsRes = ResponseTranslator.mapAlertsToResponse(alerts);
      req.resultData = alertsRes;
      next();
    }
  });
}


module.exports.create = createAlert;
module.exports.testEmails = testEmails;
module.exports.update = updateAlert;
module.exports.del = deleteAlert;
module.exports.list = listAlerts;
