var proxyquire = require('proxyquire');
var fs = require('fs');
var assert = require('assert');
var util = require('util');
var common = require('./../../../fixtures/monitorcommon');


function getDateMinus(seconds){
  return ( Date.now() - (seconds * 1000));
}

var underTest = '../../../../lib/events/crash/test';

var confMock = {
  '../../config/config.js':{
    "getConfig":function (){
      return{
        "crash_monitor":{
          "enabled":true,
          "min_num_crashes":1,
          "max_num_crashes":100,
          "tolerance":1,
          "base_time_seconds":60,
          "sample_time_hrs":4
        }
      }
    }
  }  
};

exports.test_crash_test_fails_when_too_many_crashes = function (finish){
  var crashData = {
    "stamp":getDateMinus(120),
    "crashes":12,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(failed);
  finish();
};


exports.test_crash_test_succeeds_when_not_many_crashes = function (finish){
  var crashData = {
    "stamp":getDateMinus(120),
    "crashes":1,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(! failed, " expected the test not to fail");
  finish();
};


exports.test_crash_test_succeeds_when_not_many_crashes_over_long_time = function (finish){
  var crashData = {
    "stamp":getDateMinus(60 * 120),
    "crashes":12,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(! failed, " expected the test not to fail");
  finish();
};

exports.test_crash_test_succeeds_when_many_crashes_over_long_time = function (finish){
  var crashData = {
    "stamp":getDateMinus(98 * 60), // 99 minutes
    "crashes":99,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(failed, " expected the test to fail");
  finish();
};

exports.test_crash_test_fails_when_many_crashes_over_long_time = function (finish){
  var crashData = {
    "stamp":getDateMinus(99 * 60), //100 minutes
    "crashes":98,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(! failed, " expected the test not to fail");
  finish();
};

exports.test_crash_test_fails_when_max_crashes_reached = function (finish){
  var crashData = {
    "stamp":getDateMinus(1000 * 60), //1000 minutes
    "crashes":100,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(failed, " expected the test to fail");
  finish();
};


exports.test_crash_test_succeeds_when_max_crashes_not_reached = function (finish){
  var crashData = {
    "stamp":getDateMinus(1000 * 60), //1000 minutes
    "crashes":99,
    "reset":Date.now(),
    "domain":"testing",
    "app":"testapp",
    "dyno":"testing-dev"
  };
  var cTest = proxyquire(underTest,confMock);
  var failed = cTest(crashData);
  assert.ok(! failed, " expected the test not to fail");
  finish();
};


