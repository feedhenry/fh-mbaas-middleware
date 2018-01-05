var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose');
var log = require('../logger/logger.js');
var Schema = mongoose.Schema;

  /**
   * A model that is used to save MBaas related information for an app.
   * @type {Schema}
   *  - name: Full App Name
   *  - guid: App Guid
   *  - domain: Domain App Is Deployed To
   *  - environment: Envrionment App Is Deployed To
   *  - dbConf: App Database Configuration
   *  - migrated: Is The App Migrated To Single Database Per App
   *  - coreHost: Hostname For The Core Platform Associated With The App
   *  - apiKey: App Api Key
   *  - accessKey: Environment/App Specific Key To Validate Apps Communicate With The Mbaas
   *  - type: Type Of Deployment (feedhenry or openshift)
   *  - isServiceApp: Boolean Identifying Service Cloud Apps
   *  - serviceAccessKey: A Unique Key Used To Access The Service
   */


  var AppMbaasSchema = new Schema({
    'name': {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    'guid': {
      type: String,
      required: true
    },
    'domain': {
      type: String,
      required: true
    },
    'environment': {
      type: String,
      required: true
    },
    'mbaasUrl': {
      type: String,
      required: true
    },
    'dbConf': {
      type: mongoose.Schema.Types.Mixed
    },
    'migrated': {
      type:Boolean,
      'default': false
    },
    'coreHost': {
      type: String,
      required: true
    },
    'apiKey': {
      type: String,
      required: true
    },
    'accessKey': {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    'type': {
      type: String,
      required: true
    },
    'isServiceApp': {
      type: Boolean,
      default: false
    },
    'serviceAccessKey': {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    url: {
      type: String,
      required: true
    }
  }, {collection: 'appmbaas'});

  //Need to ensure that a service app contains a service access key.
  AppMbaasSchema.pre('validate', function(next){
    if(this.isServiceApp && !this.serviceAccessKey){
      this.serviceAccessKey = new mongoose.Types.ObjectId();
    }

    next();
  });

  //[db-inspect] makes db callsfor an app
  AppMbaasSchema.statics.createModel = function(params, cb){
    log.logger.info(params, 'try to create AppMbaas instance');

    //Setting The Access Key For This App.
    //This only will get set once at creation time
    params.accessKey  =  new mongoose.Types.ObjectId();

    this.create(params, function(err, created){
      if(err) return cb(err);
      log.logger.trace({domain: params.domain, env: params.env}, 'app db instance created');
      return cb(null, created);
    });
  };

  AppMbaasSchema.plugin(timestamps, {
    createdAt: 'created',
    modifiedAt: 'modified'
  });

module.exports = AppMbaasSchema;
