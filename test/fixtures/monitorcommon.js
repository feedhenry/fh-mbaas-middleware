exports.amqpmessage = { uid: 'j0BBzHfLAtUwOplhliDgOW4P',
  timestamp: Date.now(),
  eventType: 'CRASHED',
  eventClass: 'APP_STATE',
  eventLevel: 'ERROR',
  domain: 'testing',
  appName: 'testing-j0bbzhflatuwoplhlidgow4p-dev',
  env: 'dev',
  updatedBy: 'System',
  dyno: '',
  details: { message: 'app crashed' } };


var redis = function (getData){
  return{
    connect : function () {
      return {
        "get": function (key, cb) {
          getData = getData || {};
          return cb(getData.err, getData.ok);
        },
        "setex": function (key, time,val, cb) {
          return cb();
        },
        "set": function (key, val, cb) {
          return cb();
        },
        "del": function (key, cb) {
          return cb();
        }
      }
    }
  };
};

exports.redis = function(getData){
  return {
    '../../redis': redis(getData) 
  };
};

var conf = {
  "getConfig": function () {
    return {
      "crash_monitor": {
        "enabled": true,
        "min_num_crashes": 1,
        "tolerance": 1,
        "base_time_seconds": 60,
        "sample_time_hrs": 4
      },
      "fhredis":{
        "host": "127.0.0.1",
        "port": 6379,
        "password":"feedhenry101"
      }
    }
  }
};

exports.config = {
  '../../config/config.js': conf, 
};


exports.general = function (getData){ 
  return {
    '../../config/config.js': conf,
    '../../redis.js': redis(getData)
  };
};