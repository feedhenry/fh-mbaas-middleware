var log = require('../logger/logger');
var amqp = require('./amqp');
var EventListener = require('../events/eventDispatch');
var conf =  require('../config/config.js');

const CONST_QUEUE_NAME = "fh-mbaas-notifications-event-handler";
const CONST_TOPIC_FILTER = 'fh.events.#';

var loggerPrefix = 'MBaaS Notifications amqp Message Handler: ';

/**
 * Hook to start this handler
 */
exports.start = function startHandler (){
  var config = conf.getConfig();
  if(! config.fhamqp || config.fhamqp.enabled === false){
    return;
  }
  var logger = log.logger;
  amqp.connect(config);
  var mgr = amqp.getVhostConnection(amqp.VHOSTS.EVENTS);
  var opts = {
    autoDelete: true,
    durable: true
  };

  mgr.subscribeToTopic("fh-events", CONST_QUEUE_NAME, CONST_TOPIC_FILTER, function (msg){
    logger.debug(loggerPrefix + " received messsage from ** AMQP ** ", msg);
    msg.source = "amqp";
    EventListener.handleEvent(msg);
  }, opts, function(err){
    if(err) {
      logger.warn({error:err}, loggerPrefix + 'Failed to subscribe eventMessageHandler');
    } else {
      logger.trace(loggerPrefix + 'Subscribed OK');
    }
  });
};

