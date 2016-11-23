var log = require('../logger/logger');
var models = require('../models');
var RequestTranslator = require('../util/requestTranslator.js');
var ResponseTranslator = require('../util/responseTranslator.js');

var loggerPrefix = 'MBaaS Notifications Notifications HTTP Router: ';


/**
 * List notifications
 * @param req
 * @param res
 * @param next
 */
function listNotifications(req, res, next){
  var logger = log.defaultLogger();
  var listReq = RequestTranslator.parseListNotificationsRequest(req);
  var NotificationsModel = models.getModels().Notification;
  NotificationsModel.queryNotifications(listReq.uid, listReq.env, listReq.domain, function(err, notifications){
    if(err) {
      logger.error(loggerPrefix + 'Notifications Query Error: ', err);
      next(err);
    } else {
      var notificationsRes = ResponseTranslator.mapNotificationsToResponse(notifications);
      req.resultData = notificationsRes;
      next();
    }
  });
}

// Export entry point
module.exports.list = listNotifications;