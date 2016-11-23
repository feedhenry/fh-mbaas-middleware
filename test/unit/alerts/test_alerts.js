var proxyquire = require('proxyquire');
var assert = require('assert');
var log = require('../../../lib/logger/logger.js');
log.defaultLogger();

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
            }
          },
          "Notification": function (data) {
            this.save = function (cb) {
              assertFunc(undefined, data);
              cb();
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

module.exports = {
      
  "test_should_trigger_alert_true": function (finish){
    var message = { "timestamp": 1440449734001,
      details: { message: 'dev app start requested' },
      eventClass: 'APP_STATE',
      eventType: 'START_REQUESTED',
      eventLevel: 'INFO',
      uid: '5gycxbnv3m5woqgkl5cduafb',
      env: 'dev',
      dyno: undefined,
      _id: '55db84c2c9be837a0e295dac',
      domain: 'testing' };
    var undertest = proxyquire('../../../lib/alerts/alerts',getMocks());
    var should = undertest.shouldTriggerAlert(message,alertResp[0]);
    assert.ok(should);
    finish();
  },
  "test_should_trigger_alert_false": function (finish){
    var message = { "timestamp": 1440449734001,
      details: { message: 'dev app start requested' },
      eventClass: 'APP_STATE',
      eventType: 'START_SUCCESSFUL',
      eventLevel: 'INFO',
      uid: '5gycxbnv3m5woqgkl5cduafb',
      env: 'dev',
      dyno: undefined,
      _id: '55db84c2c9be837a0e295dac',
      domain: 'testing' };
    var undertest = proxyquire('../../../lib/alerts/alerts',getMocks());
    var should = undertest.shouldTriggerAlert(message,alertResp[0]);
    assert.ok(! should);
    finish();
  },
  
  "test_should_issueAlertEmail": function (finish){
    var message = { "timestamp": 1440449734001,
      details: { message: 'dev app start requested' },
      eventClass: 'APP_STATE',
      eventType: 'START_REQUESTED',
      eventLevel: 'INFO',
      uid: '5gycxbnv3m5woqgkl5cduafb',
      env: 'dev',
      dyno: undefined,
      _id: '55db84c2c9be837a0e295dac',
      domain: 'testing' };
    var undertest = proxyquire('../../../lib/alerts/alerts',getMocks(function (err,data){
        assert.ok("test@test.com" === data.recipients);
        assert.ok("test alert" === data.alertName);
        finish();  
    }));
    undertest.issueAlertEmail(message,alertResp[0]);
  }
  
};
