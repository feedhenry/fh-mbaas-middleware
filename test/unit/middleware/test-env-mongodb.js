"use strict";

var proxyquire = require('proxyquire');
var UNDERTEST = "../../../lib/middleware/envMongoDb.js";
var assert = require('assert');

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
  }
};
