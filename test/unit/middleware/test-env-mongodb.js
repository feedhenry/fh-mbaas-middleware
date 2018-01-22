"use strict";

var proxyquire = require('proxyquire');
var UNDERTEST = "../../../lib/middleware/envMongoDb.js";
var assert = require('assert');
var config = require('../../../lib/config/config.js');

var mockConfig = {
  "mongo": {
    "enabled": true,
    "name": "fh-mbaas",
    "host": "localhost",
    "port": 27017,
    "replicaset_name": null,
    "auth": {
      "enabled": false,
      "user": "",
      "pass": ""
    },
    "admin_auth": {
      "user": "u-mbaas",
      "pass": "password"
    },
    "form_user_auth": {
      "user": "u-forms",
      "pass": "password"
    },
    "poolSize": 20
  },
  "mongo_userdb": {
    "enabled": true,
    "name": "fh-mbaas",
    "host": "localhost",
    "port": 27017,
    "replicaset_name": null,
    "auth": {
      "enabled": false,
      "user": "",
      "pass": ""
    },
    "admin_auth": {
      "user": "u-mbaas",
      "pass": "password"
    },
    "form_user_auth": {
      "user": "u-forms",
      "pass": "password"
    },
    "poolSize": 20
  }
};

module.exports = {
  "test_drop_environment_db_no_db": function test_drop_environment_db_no_db(done) {
    var mock = {
      '../models.js': {
        "getModels": function () {
          return {
            'Mbaas': {
              findOne: function (params, cb) {
                return cb();
              }
            }
          }
        }
      },
      '../logger/logger.js': {
        "logger": {
          "debug": console.log,
          "info":console.log,
          "error":console.log
        }
      }
    };
    var envMongoDb = proxyquire(UNDERTEST, mock);
    var req = {
      params: {
        "domain": "testing",
        "environment": "dev"
      }
    };
    var res = {};
    envMongoDb.dropEnvironmentDatabase(req, res, function next(err) {
      assert.ok(! err,"expected no error if the database does not exist. Nothing to do");
      done();
    });

  },
  "test_drop_environment_db_db_found": function test_drop_environment_db_db_found(done){
    var mock = {
      '../models.js': {
        "getModels": function () {
          return {
            'Mbaas': {
              findOne: function (params, cb) {
                return cb(undefined,{
                  "dropDb": function (config,cb){
                    cb();
                  },
                  "remove":function (cb){
                    return cb();
                  }
                });
              }
            }
          }
        }
      },
      '../logger/logger.js': {
        "logger": {
          "debug": console.log,
          "info":console.log,
          "error":console.log
        }
      }
    };
    var envMongoDb = proxyquire(UNDERTEST, mock);
    var req = {
      params: {
        "domain": "testing",
        "environment": "dev"
      }
    };
    var res = {};
    envMongoDb.dropEnvironmentDatabase(req, res, function next(err) {
      assert.ok(! err,"did not expect an error dropping the db");
      done();
    });
  },
  "test_drop_environment_db_error": function test_drop_environment_db_db_found(done){
    var mock = {
      '../models.js': {
        "getModels": function () {
          return {
            'Mbaas': {
              findOne: function (params, cb) {
                return cb(new Error("error"));
              }
            }
          }
        }
      },
      '../logger/logger.js': {
        "logger": {
          "debug": console.log,
          "info":console.log,
          "error":console.log
        }
      }
    };
    var envMongoDb = proxyquire(UNDERTEST, mock);
    var req = {
      params: {
        "domain": "testing",
        "environment": "dev"
      }
    };
    var res = {};
    envMongoDb.dropEnvironmentDatabase(req, res, function next(err) {
      assert.ok( err,"expected an error dropping db");
      done();
    });
  },
  "test_get_env_existing_user_db": function(done) {
    config.setConfig(mockConfig, console.log);
    var mock = {
      '../models.js': {
        "getModels": function () {
          return {
            'Mbaas': {
              findOne: function (params, cb) {
                var model = {
                  'domain': 'testing',
                  'environment': 'dev',
                  'dbConf': {
                    "host": "system.db",
                    "port": "27017",
                    "name": "testing_dev",
                    "user": "system",
                    "pass": "system"
                  },
                  'userDbConf': {
                    "host": "user.db",
                    "port": "27017",
                    "name": "testing_dev",
                    "user": "user",
                    "pass": "user"
                  }
                }
                return cb(null, model);
              }
            }
          }
        }
      },
      '../logger/logger.js': {
        "logger": {
          "debug": console.log,
          "info":console.log,
          "error":console.log
        }
      }
    };

    var envMongoDb = proxyquire(UNDERTEST, mock);
    var req = {
      params: {
        "domain": "testing",
        "environment": "dev"
      }
    };

    var res = {};

    envMongoDb.getOrCreateEnvironmentDatabase(req, res, function next(err) {
      assert.ok(!err, "Should not throw an error.");
      assert.ok(req.userMongoUrl, "request object should have userMongoUri property.");
      assert.ok(req.userMongoUrl === 'mongodb://user:user@user.db:27017/testing_dev');
      done();
    });
  },
  "test_get_env_non_existing_user_db": function(done) {
    config.setConfig(mockConfig, console.log);
    var mock = {
      '../models.js': {
        "getModels": function () {
          return {
            'Mbaas': {
              findOne: function (params, cb) {
                var model = {
                  'domain': 'testing',
                  'environment': 'dev',
                  'dbConf': {
                    "host": "system.db",
                    "port": "27017",
                    "name": "testing_dev",
                    "user": "system",
                    "pass": "system",
                  },
                  setUserDb: function(domain, env, cfg, cb) {
                    this.userDbConf = {
                      "host": "user.db",
                      "port": "27017",
                      "name": "testing_dev",
                      "user": "user",
                      "pass": "user"
                    };
                    return cb(null);
                  }
                };
                return cb(null, model);
              }
            }
          }
        }
      },
      '../logger/logger.js': {
        "logger": {
          "debug": console.log,
          "info":console.log,
          "error":console.log
        }
      }
    };

    var envMongoDb = proxyquire(UNDERTEST, mock);
    var req = {
      params: {
        "domain": "testing",
        "environment": "dev"
      }
    };

    var res = {};

    envMongoDb.getOrCreateEnvironmentDatabase(req, res, function next(err) {
      assert.ok(!err, "Should not throw an error.");
      assert.ok(req.userMongoUrl, "request object should have userMongoUri property.");
      assert.ok(req.userMongoUrl === 'mongodb://user:user@user.db:27017/testing_dev');
      done();
    });
  },
  "test_create_and_get_env_user_db": function(done) {
    config.setConfig(mockConfig, console.log);
    var mock = {
      '../models.js': {
        "getModels": function () {
          return {
            'Mbaas': {
              findOne: function (params, cb) {
                return cb(null, null);
              },
              createModel: function (domain, env, cfg, cb) {
                var model = {
                  'domain': 'testing',
                  'environment': 'dev',
                  'dbConf': {
                    "host": "system.db",
                    "port": "27017",
                    "name": "testing_dev",
                    "user": "system",
                    "pass": "system"
                  },
                  'userDbConf': {
                    "host": "user.db",
                    "port": "27017",
                    "name": "testing_dev",
                    "user": "user",
                    "pass": "user"
                  },
                  createDb: function(cfg, cb) {
                    return cb(null);
                  }
                };
                return cb(null, model);
              }
            }
          }
        }
      },
      '../logger/logger.js': {
        "logger": {
          "debug": console.log,
          "info":console.log,
          "error":console.log
        }
      }
    };

    var envMongoDb = proxyquire(UNDERTEST, mock);
    var req = {
      params: {
        "domain": "testing",
        "environment": "dev"
      }
    };

    var res = {};

    envMongoDb.getOrCreateEnvironmentDatabase(req, res, function next(err) {
      assert.ok(!err, "Should not throw an error.");
      assert.ok(req.userMongoUrl, "request object should have userMongoUri property.");
      assert.ok(req.userMongoUrl === 'mongodb://user:user@user.db:27017/testing_dev');
      done();
    });
  }
};
