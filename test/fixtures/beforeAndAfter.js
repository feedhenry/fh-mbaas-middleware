var models = require('../../lib/models');
var fhconfig = require('fh-config');
var logger = require('../../lib/logger/logger');
var assert = require('assert');
var util = require('util');
var mongodb = require('mongodb');
var async = require('async');
var assert = require('assert');
var mongoConfig = {
  "mongo": {
      "enabled": true,
      "name": "fh-mbaas",
      "host": "localhost",
      "port": 27017,
      "replicaset_name": null,
      "auth": {
        "enabled": false,
        "user": "",
        "pass": ""
      },
      "admin_auth": {
        "user": "u-mbaas",
        "pass": "password"
      }
 },
  "logger": {
    "name": "mbaas",
    "streams": [{
      "type": "stream",
      "src": true,
      "level": "trace",
      "stream": "process.stdout"
    }, {
      "type": "raw",
      "src": true,
      "level": "trace",
      "stream": "ringBuffer"
    }]
  }
};

var dbConn;

module.exports = {
  "before": function (done){
    console.log("running integration set up");
    logger.defaultLogger();
    fhconfig.setRawConfig(mongoConfig);
    var conf = {};
    conf.mongoUrl = fhconfig.getConfig().mongoConnectionString();
    async.parallel([
      function createAMongoConnection(callback){
        mongodb(conf.mongoUrl,{},function (err, ok) {
          assert.ok(!err,"did not expect an error during set up - is an instance of mongodb running ? " + util.inspect(err));
          dbConn = ok;
          callback(err);
        });  
      },
      function initModels (callback){
        models.init(conf,function(err){
          assert.ok(!err,"did not expect an error during set up - is an instance of mongodb running ? " + util.inspect(err));
          callback(err);
        });
      }
    ],done);
  },
  
  "after": function (done){
    console.log("running integration teardown");
    
    async.series([
      function disconnectModels(callback){
        if(models && models.disconnect) {
         return models.disconnect(callback);
        }
        return callback();
      },
      function disconnectMongo(callback){
        if (dbConn){
          return dbConn.close(callback)
        }
        callback()
      }
    ],done);
  },
  "afterEach": function (done){
    if(dbConn) {
      var alertCon = dbConn.collection("alerts");
      var events = dbConn.collection("events");
      var notifications  = dbConn.collection("notifications");
      
      if(alertCon){
        async.parallel([
          function(callback){
            alertCon.remove(callback);
            
          },
          function (callback){
            events.remove(callback);
          },
          function (callback){
            notifications.remove(callback)
          }
        ],done);
      }else {
        done();
      }
    }else{
      console.error("could not drop collection");
      done();
    }
      
    
  }
};
