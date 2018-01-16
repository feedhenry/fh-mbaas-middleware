var timestamps = require('mongoose-timestamp');
var common = require('../util/common');
var mongo = require('../util/mongo');
var mongoose = require('mongoose');
var log = require('../logger/logger.js');
var _ = require('underscore');
var util = require('util');

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
    },
    'userDbConf': {
      type: mongoose.Schema.Types.Mixed
    }
  }, {collection: 'mbaas'});

  MbaasSchema.index({domain: 1, environment: 1}, {unique:true});

  MbaasSchema.statics.createModel = function(domain, env, config, cb){
    log.logger.info({domain: domain, env: env}, 'try create mbaas instance');
    var dbConf = getDomainDbConf(domain, env, config);
    var userDbConf = getDomainDbConf(domain, env, config, 'mongo_userdb');
    var fields = {
      domain: domain,
      environment: env,
      dbConf: dbConf
    };

    if (userDbConf) {
      fields.userDbConf = userDbConf;
    }

    this.create(fields, function(err, savedInstance){
      if(err) return cb(err);
      log.logger.trace({domain: domain, env: env}, 'mbaas instance created');
      return cb(null, savedInstance);
    });
  };

  MbaasSchema.methods.setUserDb = function(domain, env, config, cb){
    this.userDbConf = getDomainDbConf(domain, env, config, 'mongo_userdb');
    this.save(function(err) {
      if(err) return cb(err);
      log.logger.trace({domain: domain, env: env}, 'mbaas instance updated');
      return cb(null);
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

    if (config.__isUserDb) {
      db = this.userDbConf;
      config.mongo = config.mongo_userdb;
      delete config.__isUserDb;
    }

    log.logger.info({domain: domain, env: env, db: db}, 'try to create database for the environment');

    var dbError = checkDatabaseConfig(db);
    if (dbError) {
      log.logger.info({db: db}, 'db validation failed');
      return cb(dbError);
    }

    mongo.createDb(config, db.user, db.pass, db.name, function(err){
      if(err){
        log.logger.error(err, 'Failed to create db : %s.', db.name);
        return cb(err);
      }

      log.logger.info({db: db.name, user: db.user}, 'Database created');
      return cb(null, db);
    });
  };

  MbaasSchema.plugin(timestamps, {
    createdAt: 'created',
    modifiedAt: 'modified'
  });


function getDomainDbConf(domain, env, config, key){
  var mongoKey = key || 'mongo';
  var db_name = domain + '_' + env;
  var mongo = config[mongoKey];

  if (!mongo) {
    return;
  }

  var host = mongo.host;
  var port = mongo.port;
  var db = {
    host: host,
    port: port,
    name: db_name,
    user: db_name,
    pass: common.randomPassword()
  };
  return db;
}

function checkDatabaseConfig(db) {
  if (!db) {
    return;
  }

  try {
    common.checkDbConf(db);
  } catch(e) {
    return e;
  }
}

module.exports = MbaasSchema;
