var MongoClient = require('mongodb').MongoClient;
var log = require('../logger/logger.js');


function handleError(db, err, message, cb){
  if(db && db.close){
    db.close();
  }
  log.logger.error(err, message);
  if(cb){
    return cb(err);
  }
}

// create a database, including user name and pwd
function createDb(config, dbUser, dbUserPass, dbName, cb) {
  log.logger.trace({user: dbUser, pwd: dbUserPass, name: dbName}, 'creating new datatbase');
  var url = config.mongoUrl;
  var admin = config.mongo.admin_auth.user;
  var admin_pass = config.mongo.admin_auth.pass;

  MongoClient.connect(url, function(err, db){
    if (err) return handleError(null, err, 'cannot open mongodb connection', cb);

    var targetDb = db.db(dbName);
    targetDb.authenticate(admin, admin_pass, {'authSource': 'admin'}, function(err) {
      if (err) return handleError(db, err, 'can not authenticate admin user', cb);

      // update for mongodb3.2 - need to remove user first
      targetDb.removeUser(dbUser, function(err) {
        if(err){
          log.logger.error(err, 'failed to remove user');
        }
        // add user to database
        targetDb.addUser(dbUser, dbUserPass, function(err, user) {
          if (err) return handleError(db, err, 'can not add user', cb);
          log.logger.trace({user: user, database: dbName}, 'mongo added new user');
          db.close();
          return cb();
        });
      });
    });
  });
}

//drop a database
function dropDb(config, dbUser, dbName, cb){
  log.logger.trace({user: dbUser, name: dbName}, 'drop database');
  
  var url = config.mongoUrl;
  var admin = config.mongo.admin_auth.user;
  var admin_pass = config.mongo.admin_auth.pass;

  MongoClient.connect(url, function(err, dbObj){
    if (err) return handleError(null, err, 'cannot open mongodb connection', cb);

    var dbToDrop = dbObj.db(dbName);
    dbToDrop.authenticate(admin, admin_pass, {'authSource': 'admin'}, function(err){
      if(err) return handleError(dbObj, err, 'can not authenticate admin user', cb);

      dbToDrop.removeUser(dbUser, function(err){
        if(err){
          log.logger.error(err, 'failed to remove user');
        }
        dbToDrop.dropDatabase(function(err){
          if(err) return handleError(dbObj, err, 'failed to drop database', cb);
          dbObj.close();
          return cb();
        });
      });
    });
  });
}

exports.createDb = createDb;
exports.dropDb = dropDb;
