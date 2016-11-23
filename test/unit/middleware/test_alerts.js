var proxyquire = require('proxyquire');
var assert = require('assert');
var common = require('../../fixtures/alert_notifications_common');

function getMocks(assertFunc,err) {
  return {
    '../models': {
      "getModels": function () {
        var imp = {
          "Alert": function (data){
            this.save = function (cb) {
              assertFunc(undefined, data);
              console.log("Error save ", err);
              cb(err);
            };
          },
          "Notification": function (data) {
            this.save = function (cb) {
              cb();
            }
          }
        };
        imp.Alert.queryAlerts = function (uid, env, domain, cb) {
          return cb(undefined, common.alertResp);
        };
        imp.Alert.updateAlert = function(data,cb){
          cb(err);
        };
        imp.Alert.deleteAlert = assertFunc;
        return imp;
      }
    },
    '../email/index': {
      sendAlertEmail: function (data, cb) {
        cb(undefined, "");
      }
    }
  };

}


/**
 * reqObj.originalUrl = req.originalUrl;
 reqObj.alertName = req.body.alertName;
 reqObj.emails = req.body.emails.split(',');
 reqObj.eventCategories = req.body.eventCategories.split(',');
 reqObj.eventNames = req.body.eventNames.split(',');
 reqObj.eventSeverities = req.body.eventSeverities.split(',');
 reqObj.uid = req.body.uid;
 reqObj.env = req.body.env;
 reqObj.alertEnabled = req.body.enabled;
 reqObj._id = new Mongoose.Types.ObjectId();
 reqObj.domain = req.params.domain;
 * @type {{}}
 */


var reqObj = {"body":{},"params":{}};
reqObj.originalUrl = "/test";
reqObj.body.alertName = "test alert";
reqObj.body.emails = "test@test.com";
reqObj.body.eventCategories = "APP_STATE";
reqObj.body.eventNames = "START_REQUESTED";
reqObj.body.eventSeverities = "INFO";
reqObj.uid = "testuid";
reqObj.params.environment = "dev";
reqObj.body.env = "dev";
reqObj.alertEnabled = true;
reqObj.params.domain = "testing";


function commonArrayAssert(data,key,value,len){
  assert.ok(data[key] instanceof Array);
  assert.ok(data[key].length === len);
  var idx = data[key].indexOf(value);
  assert.ok((idx >=0),"expected value   "+ value);
}


module.exports = {
  "test_createAlert_next_called_ok" : function(finish){
    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (err,data){
      console.log(data, reqObj);
      assert.ok(data);
      assert.ok(data.originalUrl === reqObj.originalUrl);
      commonArrayAssert(data,"eventNames","START_REQUESTED",1);
      assert.ok(data.emails === "test@test.com","expected emails to be test@test.com");
      commonArrayAssert(data,"eventCategories","APP_STATE",1);
      assert.ok(data.env === reqObj.body.env,"expected env to be set");
    }));
    undertest.create(reqObj,{},function next(err){
      assert.ok(!err,"did not expect an error");
      finish();
    });
    
  },
  "test_createAlert_next_called_err" : function(finish){
    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (err,data){
      assert.ok(data)
    },"failed to save"));
    undertest.create(reqObj,{},function next(err){
      assert.ok(err,"expected an error");
      finish();
    });

  },
  "test_updateAlert_next_called_ok" : function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.body.alertName = "test alert";
    reqObj.body.emails = "test@test.com,test2@test.com";
    reqObj.body.eventCategories = "APP_STATE";
    reqObj.body.eventNames = "START_REQUESTED,STOP_REQUESTED";
    reqObj.body.eventSeverities = "INFO";
    reqObj.uid = "testuid";
    reqObj.env = "dev";
    reqObj.alertEnabled = true;
    reqObj.params.domain = "testing";
    
    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (err,data){
      assert.ok(data.originalUrl === reqObj.originalUrl);
      commonArrayAssert(data,"eventNames","START_REQUESTED",2);
      commonArrayAssert(data,"emails","test2@test.com",2);
      commonArrayAssert(data,"eventCategories","APP_STATE",1);
      assert.ok(data.env === reqObj.env);
    }));
    undertest.update(reqObj,{},function next(err){
      assert.ok(!err,"did not expect an error");
      finish();
    });

  },
  "test_updateAlert_next_called_err" : function(finish){
    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (err,data){
      assert.ok(data)
    },"failed to save"));
    undertest.update(reqObj,{},function next(err){
      assert.ok(err,"expected an error");
      finish();
    });

  },
  "test_delete_Alert_next_called_ok" : function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.params.guid = "test";
    reqObj.params.environment = "dev";
    reqObj.params.domain = "testing";
    reqObj.params.id = "anid";
    
    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (id, uid, env, domain,cb){
      assert.ok(reqObj.params.id === id);
      assert.ok(reqObj.params.guid === uid);
      assert.ok(reqObj.params.environment === env);
      assert.ok(reqObj.params.domain === domain);
      cb();
    }));
    undertest.del(reqObj,{},function next(err){
      assert.ok(!err,"did not expect an error");
      finish();
    });

  },
  "test_delete_next_called_err" : function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.params.guid = "test";
    reqObj.params.environment = "dev";
    reqObj.params.domain = "testing";
    reqObj.params.id = "anid";

    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (id, uid, env, domain,cb){
      cb("an errror");
    }));
    undertest.del(reqObj,{},function next(err){
      assert.ok(err,"expected an error");
      finish();
    });
  
  },
  "test_list_Alert_next_called_ok" : function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.params.guid = "test";
    reqObj.params.environment = "dev";
    reqObj.params.domain = "testing";
    reqObj.params.id = "anid";
    
    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (id, uid, env, domain,cb){
      assert.ok(reqObj.params.id === id);
      assert.ok(reqObj.params.guid === uid);
      assert.ok(reqObj.params.environment === env);
      assert.ok(reqObj.params.domain === domain);
      cb();
    }));
    undertest.del(reqObj,{},function next(err){
      assert.ok(!err,"did not expect an error");
      finish();
    });

  },
  "test_list_next_called_err" : function(finish){
    var reqObj = {"body":{},"params":{}};
    reqObj.originalUrl = "/test";
    reqObj.params.guid = "test";
    reqObj.params.environment = "dev";
    reqObj.params.domain = "testing";
    reqObj.params.id = "anid";

    var undertest = proxyquire('../../../lib/middleware/alerts',getMocks(function (id, uid, env, domain,cb){
      cb("an errror");
    }));
    undertest.del(reqObj,{},function next(err){
      assert.ok(err,"expected an error");
      finish();
    });
  
  }

};
