var sinon = require('sinon');
var proxyquire = require('proxyquire');
var assert = require('assert');
var _ = require('underscore');
var log = require('../../../lib/logger/logger.js');

var cfg = {
  mongoUrl: {
    host: 'localhost',
    port: 8888,
    admin_auth : {
      user: 'admin',
      pass: 'admin'
    }
  }
};

var mockRequest = {
  params: {
    domain: "somedomain",
    environment: "someenvironment",
    appname: "some-appguid-env"
  },
  body: {
    apiKey: "someappapikey",
    coreHost: "some.core.host.com",
    appGuid: "appguid",
    type: "feedhenry"
  }
};

log.defaultLogger();

module.exports = {
  test_find_app: function(finish){
    var mockFindModel = sinon.stub().callsArgWith(1, undefined, {
      name: "some-appguid-env"
    });
    var mockNextCall = sinon.spy();

    var mockModels = sinon.stub().returns({
      AppMbaas: {
        findOne: mockFindModel
      }
    });

    var mocks = {
      '../models.js': {
        getModels: mockModels
      }
    };

    var appMiddleware = proxyquire('../../../lib/middleware/app.js', mocks);

    var req = _.clone(mockRequest);

    appMiddleware.findMbaasApp(req, {}, mockNextCall);

    assert.ok(mockNextCall.calledWithExactly(), "Expected Called");

    assert.equal(req.appMbaasModel.name, "some-appguid-env");

    finish();
  },
  test_find_app_not_found: function(finish){
    var mockFindModel = sinon.stub().callsArgWith(1, undefined, null);
    var mockNextCall = sinon.spy();

    var mockModels = sinon.stub().returns({
      AppMbaas: {
        findOne: mockFindModel
      }
    });

    var mocks = {
      '../models.js': {
        getModels: mockModels
      }
    };

    var appMiddleware = proxyquire('../../../lib/middleware/app.js', mocks);

    var req = _.clone(mockRequest);

    appMiddleware.findMbaasApp(req, {}, mockNextCall);

    assert.ok(mockNextCall.calledWithExactly(), "Expected Called With No Error");

    assert.equal(req.appMbaasModel, null);

    finish();
  },
  test_find_or_create_app: function(finish){
    var mockFindModel = sinon.stub().callsArgWith(1, undefined, null);
    var mockNextCall = sinon.spy();
    var mockCreateModel = sinon.stub().callsArgWith(1, undefined, {
      name: mockRequest.params.appname
    });

    var mockModels = sinon.stub().returns({
      AppMbaas: {
        findOne: mockFindModel,
        createModel: mockCreateModel
      }
    });

    var mocks = {
      '../models.js': {
        getModels: mockModels
      }
    };

    var appMiddleware = proxyquire('../../../lib/middleware/app.js', mocks);

    var req = _.clone(mockRequest);

    appMiddleware.findOrCreateMbaasApp(req, {}, mockNextCall);

    assert.ok(mockNextCall.calledWithExactly(), "Expected Called With No Error");

    assert.equal(req.appMbaasModel.name,  mockRequest.params.appname);

    finish();
  },
  test_update_mbaas_app: function(done){
    //Testing updating an existing model
    var mockModel = {
      save: sinon.stub().callsArg(0)
    };

    var mockReq = _.clone(mockRequest);

    mockReq.appMbaasModel = mockModel;

    var appMiddleware = require('../../../lib/middleware/app.js');

    appMiddleware.updateMbaasApp(mockReq, {}, function(err){
      assert.ok(!err, "Expected No Error");
      var firstAccessKey = mockModel.accessKey;

      assert.ok(mockModel.save.calledOnce, "Expected Save To Be Called Once");
      assert.ok(firstAccessKey, "Expected An Access Key");

      appMiddleware.updateMbaasApp(mockReq, {}, function(err){
        assert.ok(!err, "Expected No Error");

        //Checking for the same access Key if updated twice.
        assert.equal(firstAccessKey, mockModel.accessKey);
        done();
      });
    });
  }
};
