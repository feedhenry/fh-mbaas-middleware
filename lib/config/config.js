var util = require('util');

var config;
var exceptionMessages = {};

exceptionMessages.MISSING_CONFIG = "The Config file or Object is missing!";
exceptionMessages.MISSING_CONFIG_SECTION = "Config section %s missing!";
exceptionMessages.UNPARSABLE_CONFIG = "The config file %s was unparsable %s!";

function setConfig(cfg, err) {
  
  config = cfg;
  if ('object' !== typeof config) {
    return err(util.format(exceptionMessages.MISSING_CONFIG));
  }
  else if(!config.hasOwnProperty("mongoUrl")) {
    return err(util.format(exceptionMessages.MISSING_CONFIG_SECTION, 'mongoUrl'));
  }
  else if(!config.hasOwnProperty("mongo")) {
    return err(util.format(exceptionMessages.MISSING_CONFIG_SECTION, 'mongo'));
  }
  else if (!config.mongo.hasOwnProperty("name")) {
    return err(util.format(exceptionMessages.MISSING_CONFIG_SECTION, 'mongo.name'));
  }
  else {
    return err();
  }
}

function getConfig() {
  return config;
}

module.exports = {
  setConfig: setConfig,
  getConfig: getConfig
};
