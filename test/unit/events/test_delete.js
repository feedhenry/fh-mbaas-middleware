var proxyquire = require('proxyquire');
var assert = require('assert');
var log = require('../../../lib/logger/logger.js');
log.defaultLogger();
var sinon = require('sinon');

var alertResp = [ { alertName: 'test alert',
  emails: 'test@test.com',
  eventCategories: 'APP_STATE',
  eventNames: 'START_REQUESTED',
  eventSeverities: 'INFO',
  uid: '5gycxbnv3m5woqgkl5cduafb',
  env: 'dev',
  alertEnabled: true,
  _id: '55db84b368464f790e79d76f',
  domain: 'testing',
  __v: 0 } ];





function getMocks(assertFunc) {
  return {
    '../models': {
      "getModels": function () {
        return {
          "Alert": {
            "queryAlerts": function (uid, env, domain, cb) {
              return cb(undefined, alertResp);
            },
            deleteAlertsByAppIdAndEnv: function (appId, callback) {
              assertFunc(undefined, appId);
            }
          },
          "Event": {
            deleteEventsByAppIdAndEnv: function (appId, callback) {
              assertFunc(undefined, appId);
            }
          },
          "Notification": {
            deleteNotificationsByAppIdAndEnv: function (appId, callback) {
              assertFunc(undefined, appId);
            }
          }
        };
      }
    },
    '../email/index': {
      sendAlertEmail: function (data, cb) {
        cb(undefined, "");
      }
    }
  };

}


function getMessage(eventType){
  return { "timestamp": 1440449734001,
    details: { message: 'dev app start requested' },
    eventClass: 'APP_STATE',
    eventType: eventType,
    eventLevel: 'INFO',
    uid: '5gycxbnv3m5woqgkl5cduafb',
    env: 'dev',
    dyno: undefined,
    _id: '55db84c2c9be837a0e295dac',
    domain: 'testing' };
}



module.exports = {
  "test_delete_handler_ok": function (finish){
    var message = getMessage("DELETE_REQUESTED");
    var called = 0;
    var undertest = proxyquire("../../../lib/events/delete",getMocks(function (err, appid){
      called++;
      assert.ok(message.uid === appid,"expected appid to be same as message.uid");
      if(called ==2) {
        finish();
      }
    }));
    undertest.handler(message);
    
  },
  "test_delete_handler_err": function (finish){
    
    var message = getMessage("NON_DELETE_EVENT");
    var undertest = proxyquire("../../../lib/events/delete",getMocks(function (err, appid){
      assert.fail("should not get here");
    }));
    undertest.handler(message);
    finish();
    
  }
};