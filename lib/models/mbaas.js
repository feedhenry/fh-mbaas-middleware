var timestamps = require('mongoose-timestamp');
var common = require('../util/common');
var mongo = require('../util/mongo');
var mongoose = require('mongoose');
var log = require('../logger/logger.js');

"use strict";

  /**
   * A model that is used to save MBaas related information for an environment.
   * @type {Schema}
   */

var Schema = mongoose.Schema;

  var MbaasSchema = new Schema({
    'domain': {
      type: String,
      required: true
    },
    'environment': {
      type: String,
      required: true
    },
    'dbConf': {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }, {collection: 'mbaas'});

  MbaasSchema.index({domain: 1, environment: 1}, {unique:true});

  MbaasSchema.statics.createModel = function(domain, env, config, cb){
    log.logger.info({domain: domain, env: env}, 'try create mbaas instance');
    var dbConf = getDomainDbConf(domain, env, config);
    this.create({domain: domain, environment: env, dbConf: dbConf}, function(err, savedInstance){
      if(err) return cb(err);
      log.logger.trace({domain: domain, env: env}, 'mbaas instance created');
      return cb(null, savedInstance);
    });
  };
  /**
   * dropDb dropes a db from the mongo database based on the dbConf and using the admin user
   */
  MbaasSchema.methods.dropDb = function dropDb(config, cb){
    var domain = this.domain;
    var env = this.environment;
    var db = this.dbConf;
    log.logger.info("dropping environment database ", env, domain);
    try{
      common.checkDbConf(db);
    }catch(e){
      log.logger.info({db: db}, 'db validation failed');
      return cb(e);
    }
    mongo.dropDb(config,db.user,db.name, cb);
  };

  MbaasSchema.methods.createDb = function(config, cb){
    var domain = this.domain;
    var env = this.environment;
    var db = this.dbConf;

    log.logger.info({domain: domain, env: env, db: db}, 'try to create database for the environment');
    try{
      common.checkDbConf(db);
    }catch(e){
      log.logger.info({db: db}, 'db validation failed');
      return cb(e);
    }
    mongo.createDb(config, db.user, db.pass, db.name, function(err){
      if(err){
        log.logger.error(err, 'Failed to create db : %s.', db.name);
        return cb(err);
      } else {
        log.logger.info({db: db.name, user: db.user}, 'Database created');
        return cb(null, db);
      }
    });
  };


  MbaasSchema.plugin(timestamps, {
    createdAt: 'created',
    modifiedAt: 'modified'
  });


function getDomainDbConf(domain, env, config){
  var db_name = domain + '_' + env;
  var host = config.mongo.host;
  var port = config.mongo.port;
  var db = {
    host: host,
    port: port,
    name: db_name,
    user: db_name,
    pass: common.randomPassword()
  };
  return db;
}

module.exports = MbaasSchema;
