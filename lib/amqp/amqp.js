var amqp = require('fh-amqp-js');
var logger = require('../logger/logger');
var _ = require('underscore');
/**
 * Connect to an AMQP message bus based on
 * the configuration provided
 * @param configuration
 * @param cb
 */
var eventsConnection;
var internalConnection;
function connect(config){
  var log = config.logger || logger.defaultLogger();
  if(! config || ! config.fhamqp || config.fhamqp.enabled === false){
    log.info("amqp not enabled");
    return;
  }
  if(eventsConnection && internalConnection){
    return;
  }
  eventsConnection = new amqp.AMQPManager(config.fhamqp.vhosts.events);
  eventsConnection.connectToCluster();
  internalConnection = new amqp.AMQPManager(config.fhamqp.vhosts.internal);
  internalConnection.connectToCluster();

  // Error making connection
  eventsConnection.on('error', error);
  internalConnection.on('error',error);
  // Connection made and ready
  eventsConnection.on('ready', ready);
  internalConnection.on('ready',ready);

  function error(err){
    // Only log the error here, we don't want to completely bail out
    // because of an invalid message
    log.error({error: err}, "AMQP error");
  }
  function ready(){
    log.info("connected to AMQP");
  }

}

exports.connect = connect;
exports.getVhostConnection = function (vhost){
  if("events" === vhost){
    return eventsConnection;
  }else if("internal" === vhost){
    return internalConnection;
  }
  return null;
};

exports.VHOSTS = {
  "EVENTS": "events",
  "INTERNAL":"internal"
};
