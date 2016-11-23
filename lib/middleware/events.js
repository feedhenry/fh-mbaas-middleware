var log = require('../logger/logger');
var models = require('../models');
var EventListener = require('../events/eventDispatch');

var RequestTranslator = require('./../util/requestTranslator.js');
var ResponseTranslator = require('./../util/responseTranslator.js');

var loggerPrefix = 'MBaaS Notifications Events HTTP Router: ';


/**
 * Return list of Events for domain, env and app id
 * @param req
 * @param res
 * @param next
 */
function listEvents(req, res, next){
  var logger = log.logger;
  var EventModel = models.getModels().Event;
  var listReq = RequestTranslator.parseListEventsRequest(req);
  if(! listReq.uid || ! listReq.env || ! listReq.domain){
    return next({"error":"invalid params missing uid env or domain","code":400});
  }
  EventModel.queryEvents(listReq.uid, listReq.env, listReq.domain, function(err, events){
    if(err) {
      logger.error(loggerPrefix + 'Events Query Error: ', err);
      return next(err);
    } else {
      req.resultData =  ResponseTranslator.mapEventsToResponse(events);
      next();
    }
  });
};

function createEvent(req, res, next){
  var logger = log.logger;
  logger.debug(loggerPrefix + " creating event * http * ",req.body);
  var EventModel = models.getModels().Event;
  var createReq = RequestTranslator.parseCreateEventRequest(req);
  var event = new EventModel(createReq);
  EventListener.handleEvent(event);
  req.resultData = ResponseTranslator.mapEventsToResponse([event]);
  next();
};


function updateEvent(req, res, next){
  var logger = log.logger;
  var EventModel = models.getModels().Event;
  var updateReq = RequestTranslator.parseUpdateEventRequest(req);
  EventModel.updateEvent(updateReq, function(err,event){
    if(err) {
      logger.error(loggerPrefix + 'Event Update Error: ', err);
      next(err);
    } else {
      req.resultData = event;
      next()
    }
  });
};


function deleteEvent(req, res, next){
  var logger = log.logger;
  var EventModel = models.getModels().Event;
  var deleteReq = RequestTranslator.parseDeleteEventRequest(req);
  EventModel.deleteEvent(deleteReq._id, deleteReq.uid, deleteReq.env, deleteReq.domain, function(err){
    if(err) {
      logger.error(loggerPrefix + 'Event Delete Error: ', err);
      next(err);
    } else {
      next();
    }
  });
};

module.exports.list = listEvents;
module.exports.create = createEvent;
module.exports.triggerEvent = EventListener.handleEvent;
module.exports.update = updateEvent;
module.exports.del = deleteEvent;