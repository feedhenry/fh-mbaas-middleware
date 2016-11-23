var assert = require('assert');
var models = require('../../lib/models');
var mongoose = require('mongoose');
var async = require('async');
var util = require('util');
var _ = require('underscore');

const TEST_URL = "someurl";
const TEST_APPID = "testid";
const TEST_ENV = "development";
const TEST_DOMAIN = "testing";
const TEST_ALERT_NAME = "testalert";
const TEST_EMAIL_ADDR = "test@test.com";
const TEST_EMAIL_SUBJECT = "test subject";
const TEST_EMIAL_CONTENT = "some email content";


var undertest = require('../../lib/middleware/notifications');

module.exports = {
  "test_list_notifications": function (done){
    async.waterfall([
      function create(callback){
        async.parallel([
          async.apply(createNotification),
          async.apply(createNotification)
        ],callback)
      },
      function list(not,callback){
        var req = createListReq();
        undertest.list(req,{},function next(err){
          assert.ok(!err , "did not expect an error" );
          assert.ok(req.resultData,"expected result data");
          assert.ok(Array.isArray(req.resultData.list));
          assert.ok(2 === req.resultData.list.length);
          _.each(req.resultData.list,function validate(not){
            assert.ok(not,"expected a notification");
            assert.ok(not.uid === TEST_APPID,"expected app id to be the same");
            assert.ok(not.recipients === TEST_EMAIL_ADDR,"expected email to match");
          });
          callback();
        });
      }
    ],done);
  },
  "test_list_notifications_bad_request": function(done){
    var req = createListReq();
    delete req.params.guid;
    undertest.list(req,{},function next(err){
      assert.ok(err, "expected an error")
      done();
    });
  }
};



function createNotification(cb){
  var Notification = models.getModels().Notification;
  var notificationDtls = {};
  notificationDtls._id = new mongoose.Types.ObjectId();
  notificationDtls.domain = TEST_DOMAIN;
  notificationDtls.uid = TEST_APPID;
  notificationDtls.alertName = TEST_ALERT_NAME;
  notificationDtls.env = TEST_ENV;
  notificationDtls.recipients = TEST_EMAIL_ADDR;
  notificationDtls.subject = TEST_EMAIL_SUBJECT;
  notificationDtls.body = TEST_EMIAL_CONTENT;  
  
  var notification = new Notification(notificationDtls);
  notification.save(cb)
}



function createListReq(){
  var reqObj = {"params":{},"body":{}};
  reqObj.originalUrl = TEST_URL;
  reqObj.params.guid = TEST_APPID;
  reqObj.params.environment = TEST_ENV;
  reqObj.params.domain = TEST_DOMAIN;
  return reqObj;
}
