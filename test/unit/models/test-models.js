var proxyquire = require('proxyquire');
var sinon = require('sinon');
var mockMongo = require('../../fixtures/mocksetup.js');
var EventEmitter = require('events').EventEmitter;

var dbConf = {
  host: 'localhost',
  port: 27017,
  name: 'test',
  user: 'testuser',
  pass: 'testpass'
};

var config = {
  mongoUrl: 'http://somemongodb',
  mongo:{
    host: 'localhost',
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

var connection = new EventEmitter();
var connectionB = new EventEmitter();
connection.model = sinon.stub();
connectionB.model = sinon.stub();

var connectionStub = sinon.stub();

var mongoose = {
  createConnection: connectionStub
};

var mbaas = sinon.stub();
var appmbaas = sinon.stub();

var models = proxyquire('../../../lib/models.js',{mongoose: mongoose , './models/mbaas.js':mbaas , './models/appMbaas.js':appmbaas});
var assert = require('assert');

exports.test_app_models = function(finish){

  connectionStub.returns(connection);
  models.init(config, function(err) {
    assert.ok(!err, 'Error with models init');
    finish();
  });
  connection.emit('open');

};

exports.test_app_models_error = function(finish){
  connectionStub.returns(connectionB);
  models.init(config, function(err) {
    assert.ok(err, 'Should have error with models init');
    assert.equal(err, 'Test Error');
    finish();
  });
  connectionB.emit('error','Test Error');

};
