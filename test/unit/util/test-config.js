var util = require('util');
var assert = require('assert');
var config = require('../../../lib/config/config.js');
var exceptionMessages = {};

exceptionMessages.MISSING_CONFIG = "The Config file %s or Object is missing!";
exceptionMessages.MISSING_CONFIG_SECTION = "Config section %s missing!";
exceptionMessages.UNPARSABLE_CONFIG = "The config file %s was unparsable %s!";
exceptionMessages.CONFIG_REMOVED = "The Config setting: %s should be removed!";

//[db-inspect]  makes db calls for testing config

exports.it_should_pass_config = function(finish) {
  var cfg = {
    mongoUrl: 'mongodb://admin:admin@localhost:8888/name',
    mongo: {
      host: 'localhost',
      port: 8888,
      name: 'fh-mbaas-test',
      admin_auth: {
        user: 'admin',
        pass: 'admin'
      }
    }
  };

  config.setConfig(cfg , function(err) {
    assert.ok(!err , err);
    finish();
  });
};

exports.it_should_fail_config = function(finish) {
  config.setConfig(undefined , function(err) {
    assert.equal(err , 'The Config file or Object is missing!');
    finish();
  });
};

exports.it_should_fail_url = function(finish) {
  var cfg = {
    mongo: {
      host: 'localhost',
      port: 8888,
      name: 'fh-mbaas-test',
      admin_auth: {
        user: 'admin',
        pass: 'admin'
      }
    }
  };

  config.setConfig(cfg , function(err) {
    assert.equal(err , 'Config section mongoUrl missing!');
    finish();
  });
};


exports.it_should_fail_mongo = function(finish) {
  var cfg = {
    mongoUrl: 'mongodb://admin:admin@localhost:8888/name',
  };

  config.setConfig(cfg , function(err) {
    assert.equal(err , 'Config section mongo missing!');
    finish();
  });
};

exports.it_should_fail_name = function(finish) {
  var cfg = {
    mongoUrl: 'mongodb://admin:admin@localhost:8888/name',
     mongo: {
      host: 'localhost',
      port: 8888,
      admin_auth: {
        user: 'admin',
        pass: 'admin'
      }
    }
  };

  config.setConfig(cfg , function(err) {
    assert.equal(err , 'Config section mongo.name missing!');
    finish();
  });
};
