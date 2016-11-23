var testConf = {
  "crash_monitor": {
    "enabled": true,
    "min_num_crashes": 1,
    "tolerance": 1,
    "base_time_seconds": 60,
    "sample_time_hrs": 4
  },
  "fhredis":{
    "host": "127.0.0.1",
    "port": 6379,
    "password":"feedhenry101"
  },
  "mongoUrl":"",
  "mongo":{
    "name":""
  }
};


var config = require('../../../../lib/config/config');

var proxyquire = require('proxyquire');
var fs = require('fs');
var assert = require('assert');
var util = require('util');
var common = require('./../../../fixtures/monitorcommon');
var _ = require('underscore');
var secondAppName = "testing-someapp-dev";
var async = require('async');


var underTest = '../../../../lib/events/crash/data';



var crashData = {
  "stamp":Date.now(),
  "crashes":1,
  "reset":Date.now(),
  "domain":"testing",
  "app":common.amqpmessage.appName,
  "dyno":"testing-dev"
};


var mock = function (getData){
  return {
    '../../models': {
      "getModels": function () {
        var imp = {
          "Crash": function (data){
            this.save = function (cb) {
              cb(undefined,data);
            };
            this.toJSON = function(){
              return {};
            };
          }
        };
        
        if(getData) {
          getData.save = function save (cb) {
            console.log("save on mock model");
            return cb(undefined, getData);
          }; 
        }
        imp.Crash.findCrashes = function (appName,cb){
          return cb(undefined, getData);
        };
        imp.Crash.deleteByAppName = function (appNme,cb){
          return cb();
        };

        return imp;
      }
    },
    '../../config/config.js':{
      "getConfig": function () {
        return {
          "crash_monitor": {
            "enabled": true,
            "min_num_crashes": 1,
            "tolerance": 1,
            "base_time_seconds": 60,
            "sample_time_hrs": 4
          },
          "fhredis":{
            "host": "127.0.0.1",
            "port": 6379,
            "password":"feedhenry101"
          }
        }
      }
    },
    './config/config.js':{
      "getConfig": function () {
        return {
          "crash_monitor": {
            "enabled": true,
            "min_num_crashes": 1,
            "tolerance": 1,
            "base_time_seconds": 60,
            "sample_time_hrs": 4
          },
          "fhredis":{
            "host": "127.0.0.1",
            "port": 6379,
            "password":"feedhenry101"
          }
        }
      }
    },
    '../../logger/logger':{
      logger:{
        "debug":console.log,
        "info":console.log,
        "error":console.log,
        "warn":console.log
      }
    }
  }
};


exports.test_crash_data_key_time = function (finish){
  var testData = proxyquire(underTest,mock());
  var from = Date.now() - (20 * 1000); // - 20 seconds
  var span = testData.getTimeSpan(from);
  console.log("span minutes ",span.minutes, span.seconds)
  assert.ok(Math.floor(span.seconds) == 20, "only 20 seconds should have passed");
  var mins =  span.seconds / 60;
  
  assert.ok(span.minutes == mins, span.minutes, mins);
  finish();
};

exports.test_getCrashes = function(finish){
  
  var testData = proxyquire(underTest,mock(crashData));
  testData.getCrashes(crashData.appName, function (err, ok){
    console.log("err",err, "ok", ok);
    assert.ok(! err, "expected err not to be set " + util.inspect(err));
    assert.ok(undefined != ok, "expected crash data");
    assert.ok(ok.app === crashData.app);
    finish();
  });
};

exports.test_getCrashes_no_app = function(finish){
  var testData = proxyquire(underTest,mock());
  testData.getCrashes("testapp", function (err, ok){
    assert.ok(! err, "expected err not to be set " + util.inspect(err));
    assert.ok(! ok, "expected no crash data");
    finish();
  });
};

exports.test_add_crash_succeeds = function (finish){
  var testData = proxyquire(underTest,mock(crashData));
  var preAddCrash = crashData.crashes;
  testData.addCrash(common.amqpmessage,1,function (err, ok){
    assert.ok(! err, "did no expect an err" + util.inspect(err));
    assert.ok(ok, "expected a response");
    assert.ok(preAddCrash +1 == ok.crashes,"expected crashes to have incr",ok.crashes);
    finish();
  });
};

exports.test_add_crash_succeeds_new_crash = function (finish){
  var crashData = {
    "stamp":Date.now(),
    "crashes":1,
    "reset":Date.now(),
    "domain":"testing",
    "app":common.amqpmessage.appName,
    "dyno":"testing-dev"
  };
  var testData = proxyquire(underTest,mock(undefined,crashData));
  var amqpMessage = _.clone(common.amqpmessage);
  amqpMessage.appName = secondAppName;
  testData.addCrash(amqpMessage,1,function (err, ok){
    
    console.log("add crash callback",err,ok);
    assert.ok(! err, "did no expect an err" + util.inspect(err));
    assert.ok(ok, "expected a response");
    assert.ok(ok.crashes == 1, "expected 1 crash" + util.inspect(ok));
    finish();
  });
};


exports.test_del_crash_data = function (finish){
  var testData = proxyquire(underTest,mock());
  testData.deleteCrash("test", function (err){
    assert.ok(! err, "did not expect an error " + util.inspect(err));
    finish();
  });
};


