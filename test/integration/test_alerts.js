var undertest = require('../../lib/middleware/alerts');
var assert = require('assert');
var async = require('async');
var util = require('util');
var Mongoose = require ('mongoose');
var integrate = require('../fixtures/beforeAndAfter');
var models = require('../../lib/models');
const TEST_ALERT_NAME = "somealert";
const TEST_ALERT_EMAIL = "someone@test.com,someone2@test.com";
const TEST_ALERT_DOMAIN = "testing";
const TEST_EVENT_CATEGORY = "alert_category";
const TEST_EVENT_SEVERITY = "info";
const TEST_UID = "someguid";
const TEST_ENV = "dev";
//[db-inspect] makes db calls for crud operations for alerts
module.exports = {
  
  "test_should_create_alert_in_db" : function (finish){
    //get the initialised models
    var alertModel = models.getModels().Alert;
    async.series([
      function createTheAlert(callback){
        undertest.create(createAlertRequest(),{},function next(err){
          assert.ok(!err,"did not expect an error during create" + util.inspect(err));
          callback();
        });
      },
      function readAndAsertOnAlert(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc){
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          assert.ok(doc.emails.indexOf(TEST_ALERT_EMAIL) > -1 ,"expected alert to contain " + TEST_ALERT_EMAIL);
          assert.ok(doc.alertName === TEST_ALERT_NAME," expected same alert name");
          assert.ok(doc.domain === TEST_ALERT_DOMAIN," expected same domain name");
          assert.ok(doc.uid === TEST_UID, "expected same uid ");
          callback();
        });
      }
    ],finish);
  },
  "test_should_fail_to_create_alert" : function (finish) {
    var alertModel = models.getModels().Alert;
    async.series([
      function createTheAlert(callback){
        undertest.create(createBadAlertRequest(),{},function next(err){
          assert.ok(err,"expected an error during create" + util.inspect(err));
          callback();
        });
      },
      function readAndAsertOnAlert(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc){
          assert.ok(!doc, " did not expect to find a document matching");
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          callback();
        });
      }
    ],finish);
  },
  "test_should_update_alert_in_db" : function (finish){
    var alertModel = models.getModels().Alert;
    async.waterfall([
      function createTheAlert(callback){
        undertest.create(createAlertRequest(),{},function next(err){
          assert.ok(!err,"did not expect an error during create" + util.inspect(err));
          callback();
        });
      },
      function findTheAlert(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc) {
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          callback(err,doc);
        });
      },
      function updateTheAlert(doc,callback){
        var req = createAlertRequest(doc._id);
        req.body.alertName = "updated alert name";
        req.body.emails = "someone@test.com";
        undertest.update(req,{},function next(err){
          assert.ok(! err, " did not expect an error " + util.inspect(err));
          callback();
        });
      },
      function verifyTheAlert(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc) {
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          assert.ok(doc,"expected to find a document");
          assert.ok(doc.alertName === "updated alert name","expected the env to have been updated");
          assert.ok(doc.emails === "someone@test.com","expected only email someone@test.com");
          callback();
        });
      }
    ],finish);
  },
  "test_should_fail_to_update_alert" : function (finish) {
    var alertModel = models.getModels().Alert;
    async.waterfall([
      function createTheAlert(callback){
        undertest.create(createAlertRequest(),{},function next(err){
          assert.ok(!err,"did not expect an error during create" + util.inspect(err));
          callback();
        });
      },
      function findTheAlert(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc) {
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          callback(err,doc);
        });
      },
      function updateTheAlert(doc,callback){
        var req = createAlertRequest(); //has no id
        req.body.alertName = "updated alert name";
        req.body.emails = "someone@test.com";
        undertest.update(req,{},function next(err){
          assert.ok( err, " expected an error as no id present" + util.inspect(err));
          callback();
        });
      }
    ],finish);
  },
  "test_should_delete_alert": function (finish) {
    var alertModel = models.getModels().Alert;
    async.waterfall([
      function createTheAlert(callback){
        undertest.create(createAlertRequest(),{},function next(err){
          assert.ok(!err,"did not expect an error during create" + util.inspect(err));
          callback();
        });
      },
      function findTheAlert(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc) {
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          callback(err,doc);
        });
      },
      function deleteTheAlert(alert,callback){
        undertest.del(createDelRequest(alert._id),{},function next(err){
          assert.ok(! err, "did not expect an error deleting alert " + util.inspect(err));
          callback();
        });
      },
      function verifyDeleted(callback){
        alertModel.findOne({"domain":TEST_ALERT_DOMAIN,"uid":TEST_UID}).lean().exec(function (err, doc) {
          assert.ok(!err, " did not expect an error finding document " + util.inspect(err));
          assert.ok(!doc, "did not expect to find a document after it was deleted");
          callback();
        });
      }],
      finish);
  },
  "test_should_fail_to_delete_alert" : function (finish){
    async.waterfall([
        function deleteTheAlert(callback){
          undertest.del(createDelRequest("nosuchalert"),{},function next(err){
            assert.ok(err, "expected an error deleting alert ");
            callback();
          });
        }],
      finish);
  }
};


function createAlertRequest(id){
  var req = {"body":{},"params":{}};
  req.originalUrl = "someurl";
  req.body.alertName = TEST_ALERT_NAME;
  req.body.emails = TEST_ALERT_EMAIL;
  req.body.eventCategories = TEST_EVENT_CATEGORY;
  req.body.eventNames = TEST_ALERT_NAME;
  req.body.eventSeverities = TEST_EVENT_SEVERITY;
  req.body.uid = TEST_UID;
  req.body.env = TEST_ENV;
  req.body.enabled = true;
  req.params.domain = TEST_ALERT_DOMAIN;
  if(id){
    req.params.id = id;
  }
  return req;
  
}

function createDelRequest(id){
  return{
    "params":{
      "id":id,
      guid: TEST_UID,
      environment: TEST_ENV,
      "domain":TEST_ALERT_DOMAIN
    }
  }
}

function createBadAlertRequest(){
  var req = {"body":{},"params":{}};
  req.originalUrl = "someurl";
  req.body.alertName = TEST_ALERT_NAME;
  req.body.emails = TEST_ALERT_EMAIL;
  req.body.eventCategories = TEST_EVENT_CATEGORY;
  req.body.eventNames = TEST_ALERT_NAME;
  req.body.eventSeverities = TEST_EVENT_SEVERITY;
  req.body.env = TEST_ENV;
  req.body.enabled = true;
  req.params.domain = TEST_ALERT_DOMAIN;
  return req;
  
}

