var proxyquire = require('proxyquire');
var assert = require('assert');
var util = require('util');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var _ = require('underscore');
mockgoose(mongoose);

var mockMongo = require('../../fixtures/mocksetup.js');
var createDb = mockMongo.expects('createDb');
var dropDb = mockMongo.expects('dropDb');
var AppMbaasSchema = proxyquire('../../../lib/models/appMbaas', {'../util/mongo': mockMongo});

var TEST_DOMAIN = "testDomain";
var TEST_ENV = "dev";

var cfg = {
  mongoUrl : 'http://somemongo-url',
  mongo: {
    host: 'localhost',
    port: 8888,
    admin_auth: {
      user: 'admin',
      pass: 'admin'
    }
  },
  environment: TEST_ENV,
  domain: TEST_DOMAIN,
  name: TEST_DOMAIN + '_' + TEST_ENV + '_CREATE',
  type: 'feedhenry',
  apiKey: 'appapikey',
  accessKey: mongoose.Types.ObjectId(),
  guid: 'appmbaasguid',
  coreHost: 'https://some.core.host.com',
  mbaasUrl: 'https://mbaas.somembaas.com',
  isServiceApp: true,
  url: "https://url.to.service.app"
};

//[db-inspect] makes db calls for crud operations for app mbaas data

exports.it_should_create = function(finish){
  mockgoose.reset();
  var AppMbaas = mongoose.model('AppMbaas', AppMbaasSchema);
  AppMbaas.createModel(cfg, function(err, created){
    assert.ok(!err, util.inspect(err));

    assert.equal(created.domain, cfg.domain, 'app mbaas instance domain does not match');
    assert.equal(created.environment, cfg.environment, 'app mbaas instance environment does not match');
    assert.equal(created.guid, cfg.guid);
    assert.equal(created.coreHost, cfg.coreHost);
    assert.ok(_.isString(created.accessKey.toString()), "Expected A String Access Key");
    assert.equal(created.apiKey, cfg.apiKey);

    assert.equal(created.isServiceApp, true);
    assert.ok(created.serviceAccessKey, "Expected A Service Access Key To Be Specified If A Cloud App Is A Service App");

    assert.ok(!created.dbConf, "Expected No Db conf when creating a new app model");

    AppMbaas.createModel(cfg, function(err,created){
      assert.ok(err, "Expected a duplicate entry error");
      finish();
    });
  });
};
