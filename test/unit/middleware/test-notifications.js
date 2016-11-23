var proxyquire = require('proxyquire');
var assert = require('assert');
var common = require('../../fixtures/alert_notifications_common');

function getMocks(assertFunc,err) {
  return {
    '../models': {
      "getModels": function () {
        var imp = {
          "Notification": function (data) {
            this.save = function (cb) {
              cb();
            }
          }
        };
        imp.Notification.queryNotifications = assertFunc;
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

var testFile = '../../../lib/middleware/notifications';

var reqObj = {"body":{},"params":{}};
reqObj.originalUrl = "/test";
reqObj.params.guid = "guid";
reqObj.params.environment= "dev";
reqObj.params.domain = "testing";


module.exports = {
  "test_list_notification_next_ok":function (finish){
    
    var undertest = proxyquire(testFile,getMocks(function (uid, env, domain, cb){
      assert.ok(uid === "guid", "expected guid");
      assert.ok(env === "dev", "expected dev");
      assert.ok(domain === "testing", "expected testing");
      cb();
    }));
    undertest.list(reqObj,{},function next(err){
      assert.ok(! err, "did not expect an error");
      assert.ok(reqObj.resultData);
      assert.ok(reqObj.resultData.list);
      assert.ok(reqObj.resultData.status);
      finish();  
    });
    
  },
  "test_list_notification_next_err":function (finish){
    var undertest = proxyquire(testFile,getMocks(function (uid, env, domain, cb){
      cb("error");
    }));
    undertest.list(reqObj,{},function next(err){
      assert.ok(err === "error", "expected an error");
      finish();
    });
  }
  
};