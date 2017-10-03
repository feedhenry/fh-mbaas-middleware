var mockMongo = require('../../fixtures/mocksetup.js');
var dbConf = {
  host: process.env.MONGODB_HOST || 'localhost',
  port: 27017,
  name: 'test',
  user: 'testuser',
  pass: 'testpass'
};

var config = {
  fhmbaas:{
    key:'testkey',
    protocol: 'https'
  },
  mongo:{
    enabled: true,
    host: process.env.MONGODB_HOST || 'localhost',
    port: 27017,
    name: 'test-fhmbaas-accept',
    auth: {
      enabled: false
    },
    admin_auth: {
      user: 'admin',
      pass: 'admin'
    }
  }
};

var appEnv = require('../../../lib/models/appEnv');
var assert = require('assert');

exports.test_app_envs = function(finish){
  var params = {
    mbaas: {dbConf: dbConf},
    appMbaas: {
      dbConf: dbConf,
      migrated: true,
      accessKey: "somembaasaccesskey",
      type: 'openshift',
      mbaasUrl: "https://mbaas.somembaas.com",
      isServiceApp: false
    },
    config: config
  };

  var envs = appEnv[params.appMbaas.type](params);

  //Checking mbaas data checked
  assert.equal(envs.FH_MBAAS_HOST, "mbaas.somembaas.com");
  assert.equal(envs.FH_MBAAS_PROTOCOL, "https");
  assert.equal(envs.FH_MBAAS_ENV_ACCESS_KEY, "somembaasaccesskey");
  assert.equal(envs.FH_SERVICE_ACCESS_KEY, undefined);

  finish();
};
