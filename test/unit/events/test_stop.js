var proxyquire = require('proxyquire');
var assert = require('assert');
var log = require('../../../lib/logger/logger.js');
log.defaultLogger();
var sinon = require('sinon');


function getMocks(assertFunc) {
  return {
    '../models': {
      "getModels": function () {
        return {
          "Alert": {
          },
          "Event":{
          },
          "Notification": function (data) {
            this.save = function (cb) {
              cb();
            }
          }
        };
      }
    },
    './crash/index': {
      stopEventHandler: function (msg){
        assertFunc(msg);
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
  "test_stop_handler_ok": function (finish){
    var message = getMessage("STOP_SUCCESSFUL");
    var undertest = proxyquire("../../../lib/events/stop",getMocks(function (msg){
      assert.ok(message.uid === msg.uid,"expected appid to be same as message.uid");
      assert.ok(message.eventType === "STOP_SUCCESSFUL"," expected eventType to be START_SUCCESSFUL");
      finish();
    }));
    undertest.handler(message);

  },
  "test_start_handler_not_called": function (finish){
    //no async here so ok to call finish
    var message = getMessage("NON_START_EVENT");
    var undertest = proxyquire("../../../lib/events/stop",getMocks(function (err, appid){
      assert.fail("should not get here");
    }));
    undertest.handler(message);
    finish();

  }
};