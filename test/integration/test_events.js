var assert = require('assert');
var async = require('async');
var util = require('util');
var models = require('../../lib/models');
var Mongoose = require('mongoose');
var _ = require('underscore');

const EVENT_DETAILS = "some event details";
const EVENT_CLASS = "APP_STATE";
const EVENT_TYPE = "STOP_REQUESTED";
const EVENT_LEVEL = "info";
const EVENT_UPDATED_BY = "test@test.com";
const EVENT_UID = "auid";
const EVENT_ENV = "development";
const EVENT_DYNO = "dyno";
const EVENT_DOMAIN = "domain";
const EVENT_APPNAME = "appname";
const EVENT_ORIG_URL = "original_url";
 
var undertest = require('../../lib/middleware/events');


//[db-inspect]  makes db calls for crud operations for events
module.exports = {
  "test_create_event_OK" : function (done){
    var eventModel = models.getModels().Event;
    async.waterfall(
      [
        function create(callback){
          var req = createEventReq();
          undertest.create(req,{},function next(err){
            assert.ok(!err, "did not expect an error creating event");
            callback();
          });
        },
        function read(callback){
          eventModel.findOne({"uid":EVENT_UID}).lean().exec(callback);
        },
        function verify(event,callback){
          assert.ok(event, "expected an event to have been found ");
          assert.ok(event.uid === EVENT_UID, "event uid should be the same");
          assert.ok(event.domain === EVENT_DOMAIN,"domain should be the same");
          assert.ok(event.env === EVENT_ENV, "environment should be the same");
          assert.ok(event.eventLevel === EVENT_LEVEL, " eventLevel should be the same");
          callback();
        }
      ],done
    )
  },
  "test_list_events_OK" : function (done){
    var req = createListEventsReq();
    async.waterfall([
      function create(callback){
        async.parallel([
          async.apply(createEvent),
          async.apply(createEvent)
        ],callback);
      },
      function list(createRes,callback){
        undertest.list(req,{},function next(err){
          assert.ok(! err, "did not expect an error " + util.inspect(err))
          callback(undefined,req.resultData);
        })
      },
      function verify(list,callback){
        var events = list.list;
        assert.ok(Array.isArray(events),"expected the list to be an array ");
        assert.ok(2 == events.length,"expected only two events ");
        _.each(events, function (event){
          assert.ok(event.uid === EVENT_UID, "event uid should be the same");
          assert.ok(event.domain === EVENT_DOMAIN,"domain should be the same");
          assert.ok(event.env === EVENT_ENV, "environment should be the same");
          assert.ok(event.eventLevel === EVENT_LEVEL, " eventLevel should be the same");
        });
        
        callback();
      }
      
    ],done);
  },
  "test_list_event_bad_request" : function (done){
    var req = createListEventsReq();
    delete req.params.guid;
    async.waterfall([
      function create(callback){
        async.parallel([
          async.apply(createEvent),
          async.apply(createEvent)
        ],callback);
      },
      function list(createRes,callback){
        undertest.list(req,{},function next(err){
          assert.ok( err, "expected an error listing with no guid");
          callback();
        })
      }
    ],done);
  },
  "test_del_event_OK" : function (done){
    var eventModel = models.getModels().Event;
    async.waterfall([
      function create(callback){
        createEvent(callback);
      },
      function read(callback){
        eventModel.findOne({"uid":EVENT_UID}).lean().exec(callback);
      },
      function doDelete(doc,callback){
        assert.ok(doc,"expected to find a document");
        var delReq = createDeleteReq(doc._id);
        undertest.del(delReq,{},function next(err){
          assert.ok(!err, "did not expect an err " + util.inspect(err));
          callback();
        });
      },
      function validate(callback){
        eventModel.findOne({"uid":EVENT_UID}).lean().exec(function shouldBeGone(err,doc){
          assert.ok(! err, "did not expect an error");
          assert.ok(! doc, "did not exepect to find a document after deleting it");
          callback();
        });
      }
    ],done)
  },
  "test_del_event_bad_request" : function (done){
    var delReq = createDeleteReq("doesntmatter");
    delete delReq.params.guid;
    undertest.del(delReq,{},function next(err){
      assert.ok(err, "expected error deleting a doc with a guid ");
      done();
    });
  },
  "test_update_event_ok": function (done){
    var eventModel = models.getModels().Event;
    
    async.waterfall([
      function create(callback){
        createEvent(callback);
      },
      function read(callback){
        eventModel.findOne({"uid":EVENT_UID}).lean().exec(callback);
      },
      function doUpdate(doc,callback){
        var updateReq = createEventReq(doc._id);
        updateReq.body.eventLevel = "warn";
        undertest.update(updateReq,{}, function next(err){
          assert.ok(! err, "did not expect an error " + util.inspect(err));
          callback();
        });
      },
      function validate(callback){
        eventModel.findOne({"uid":EVENT_UID}).lean().exec(function isValid(err,doc){
          assert.ok(! err, "did not expect an error " + util.inspect(err));
          assert.ok(doc, "expected an doc");
          assert.ok(doc.eventLevel === "warn", "expected the event level to have changed");
          callback();  
        });
      }
    ],done);
  },
  "test_update_event_bad_request": function (done){
    var updateReq = createDeleteReq("doesntmatter");
    delete updateReq.params.id;
    undertest.update(updateReq,{},function next(err){
      assert.ok(err, "expected error deleting a doc without a guid ");
      done();
    });
  }
};


function createEvent(callback){
  var reqObj = createEventReq();
  undertest.create(reqObj,{},function next(err){
    assert.ok(!err, "did not expect an error during create " + util.inspect(err));
    callback();
  })
}


function createListEventsReq(){
  var reqObj = {"body":{},"params":{}};
  reqObj.originalUrl = EVENT_ORIG_URL;
  reqObj.params.guid = EVENT_UID;
  reqObj.params.environment = EVENT_ENV;
  reqObj.params.domain = EVENT_DOMAIN;
  return reqObj;
}

function createDeleteReq(id){
  var reqObj = {"body":{},"params":{}};
  reqObj.originalUrl = EVENT_ORIG_URL;
  reqObj.params.guid = EVENT_UID;
  reqObj.params.environment  = EVENT_ENV;
  reqObj.params.domain = EVENT_DOMAIN;
  reqObj.params.id = id;
  return reqObj;
}


function createEventReq(id){
  var reqObj = {"body":{},"params":{}};
  reqObj.originalUrl = EVENT_ORIG_URL;
  reqObj.body.timestamp = new Date().getTime();
  reqObj.body.details = EVENT_DETAILS;
  reqObj.body.eventClass = EVENT_CLASS;
  reqObj.body.eventType = EVENT_TYPE;
  reqObj.body.eventLevel = EVENT_LEVEL;
  reqObj.body.updatedBy = EVENT_UPDATED_BY;
  reqObj.body.uid  = EVENT_UID;
  reqObj.body.env = EVENT_ENV;
  reqObj.body.dyno = EVENT_DYNO;
  if(id){
    reqObj.params.id = id;  
  }else{
    reqObj._id = new Mongoose.Types.ObjectId();
  }
  
  reqObj.params.domain = EVENT_DOMAIN;
  reqObj.source = "http";
  reqObj.appName = EVENT_APPNAME;
  return reqObj;
}