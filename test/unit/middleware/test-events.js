var proxyquire = require('proxyquire');
var assert = require('assert');
var common = require('../../fixtures/alert_notifications_common');

function getMocks(assertFunc,err) {
  return {
    '../models': {
      "getModels": function () {
        var imp = {
          "Event": function (data){
            this.save = function (cb) {
              assertFunc(undefined, data);
              console.log("Error save ", err);
              cb(err);
            };
            this.toJSON = function(){
              return {};
            };
          }
        };
        imp.Event.queryEvents = assertFunc;
        imp.Event.updateEvent = assertFunc;
        
        return imp;
      }
    },
    '../events/eventDispatch': {
      handleEvent : assertFunc
    },
    '../email/index': {
      sendAlertEmail: function (data, cb) {
        cb(undefined, "");
      }
    }
  };

}

var testFile = '../../../lib/middleware/events';



module.exports={
  "test_list_events_next_called_ok": function(finish){
    var reqObj = {"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.params.guid = "guid";
    reqObj.params.environment = "dev";
    reqObj.params.domain = "testing";
    
    var undertest = proxyquire(testFile,getMocks(function (uid, env, domain,cb){
      assert.ok(uid === reqObj.params.guid, "id should be the same");
      assert.ok(env === reqObj.params.environment, "env should be the same");
      assert.ok(domain === reqObj.params.domain, "domain should be the same");
      cb();
    }));  
    
    undertest.list(reqObj,{},function (err){
      assert.ok(!err);
      assert.ok(reqObj.resultData);
      assert.ok(reqObj.resultData.list);
      assert.ok(reqObj.resultData.status);
      finish();
    });
  },
  "test_list_events_next_called_err": function(finish){
    
    var reqObj = {"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.params.guid = "guid";
    reqObj.params.environment = "dev";
    reqObj.params.domain = "testing";

    var undertest = proxyquire(testFile,getMocks(function (uid, env, domain,cb){
      assert.ok(uid === reqObj.params.guid, "id should be the same");
      assert.ok(env === reqObj.params.environment, "env should be the same");
      assert.ok(domain === reqObj.params.domain, "domain should be the same");
      cb("error");
    }));
    undertest.list(reqObj,{},function (err){
      assert.ok(err,"expected an error");
      finish();
    });
  },
  "test_create_event_next_called_ok": function (finish) {
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.body.timestamp = 1234567;
    reqObj.body.details = "details";
    reqObj.body.eventClass = "INFO";
    reqObj.body.eventType = "START_REQUESTED";
    reqObj.body.eventLevel = "";
    reqObj.body.updatedBy = "test@example.com";
    reqObj.body.uid = "id";
    reqObj.body.env = "dev";
    reqObj.body.dyno = "";
    reqObj.params.domain = "testing";
    reqObj.source = "http";

    var undertest = proxyquire(testFile, getMocks(function (event) {
      assert.ok(event , "event model should not be undefined");
    }));
    undertest.create(reqObj,{},function (){
      assert.ok(reqObj.resultData);
      finish();
    });
  },
  "test_update_event_next_called_ok": function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.body.timestamp = 123456;
    reqObj.body.details = "details";
    reqObj.body.eventClass = "INFO";
    reqObj.body.eventType = "START_REQUESTED";
    reqObj.body.eventLevel = "";
    reqObj.body.uid = "guid";
    reqObj.body.env = "dev";
    reqObj.body.dyno = "";
    reqObj.params.id = "id";
    reqObj.params.domain = "testing";
    var undertest = proxyquire(testFile, getMocks(function (updateObj,cb) {
      assert.ok(updateObj.eventClass === "INFO","expected same value");
      assert.ok(updateObj.uid === "guid"," expected same value");
      assert.ok(updateObj.domain === "testing"," expected same value");
      cb(undefined,{});
    }));
    undertest.update(reqObj,{},function (err){
      assert.ok(reqObj.resultData);
      assert.ok(!err, "did not expect error");
      finish();
    });
  },
  "test_update_event_next_called_err": function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.body.timestamp = 123456;
    reqObj.body.details = "details";
    reqObj.body.eventClass = "INFO";
    reqObj.body.eventType = "START_REQUESTED";
    reqObj.body.eventLevel = "";
    reqObj.body.uid = "guid";
    reqObj.body.env = "dev";
    reqObj.body.dyno = "";
    reqObj.params.id = "id";
    reqObj.params.domain = "testing";
    var undertest = proxyquire(testFile, getMocks(function (updateObj,cb) {
      cb("error");
    }));
    undertest.update(reqObj,{},function (err){
      assert.ok(err, "expected error");
      finish();
    });
  }
  
};