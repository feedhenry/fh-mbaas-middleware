process.env.conf_file = './config/dev.json';
var proxyquire = require('proxyquire');
var fs = require('fs');
var assert = require('assert');
var util = require('util');
var common = require('./../../../fixtures/monitorcommon');
var sinon = require('sinon');



var app_started_message = { uid: '42xc62bdvht42gwllsznetmq',
  timestamp: 1435329241061,
  eventType: 'START_SUCCESSFUL',
  eventClass: 'APP_STATE',
  eventLevel: 'INFO',
  domain: 'testing',
  appName: 'testing-42xc62bdvht42gwllsznetmq-dev',
  dyno: 'testing-dev',
  details:
  { message: 'App started',
    app:
    { app: 'testing-42xc62bdvht42gwllsznetmq-dev',
      dyno: 'testing-dev',
      appDir: '/opt/feedhenry/fh-dynoman/data/testing-dev/home/apps/testing-42xc62bdvht42gwllsznetmq-dev',
      dynoDir: '/opt/feedhenry/fh-dynoman/data/testing-dev',
      numappinstances: 1,
      port: 8181,
      host: '172.21.0.1',
      expectedRunState: 'RUNNING',
      state: 'RUNNING',
      changehash: '940015cc9f59024454a6d7c51fac8566',
      runtime: 'node010',
      running: true },
    dyno:
    { dyno: 'testing-dev',
      dynoDir: '/opt/feedhenry/fh-dynoman/data/testing-dev/',
      host: '172.21.0.1',
      veth: '172.21.0.2',
      broadcast: '172.21.0.3',
      limits: [Object],
      name: 'testing-dev',
      expectedRunState: 'RUNNING',
      state: 'RUNNING' },
    vm:
    { dynoman: 'http://node1.feedhenry.local:8180',
      priority: 1,
      proxy: 'http://node1.feedhenry.local:9080',
      ssh: 'node1.feedhenry.local:2222',
      service_mode: 'active',
      alias: 'node1',
      rsync: 'fh@localhost:9080' } },
  env: 'dev' };

var crashMessage = common.amqpmessage;




var underTest = '../../../../lib/events/crash/index';


exports.test_on_app_start_crash_log_is_deleted = function (finish){

  var crashDao = {
    "deleteCrash" : sinon.stub(),
    "addCrash": sinon.stub(),
    "getCrashes": sinon.stub()
  };

  var messageHandler = proxyquire(underTest,{'./data.js':crashDao});
  crashDao.deleteCrash.callsArg(1);
  crashDao.addCrash.callsArg(2);
  messageHandler.startEventHandler(app_started_message, {}, {});
  assert.ok(crashDao.deleteCrash.calledOnce);
  assert.ok(crashDao.addCrash.calledOnce);
  finish();
};


exports.test_on_app_stop_crash_log_is_deleted = function (finish){
  var crashDao = {
    "deleteCrash" : sinon.stub(),
    "addCrash": sinon.stub(),
    "getCrashes": sinon.stub()
  };
  var messageHandler = proxyquire(underTest,{'./data.js':crashDao});
  crashDao.deleteCrash.callsArg(1);
  crashDao.addCrash.callsArg(2);
  messageHandler.stopEventHandler(app_started_message, {}, {});
  assert.ok(crashDao.deleteCrash.calledOnce);
  assert.ok(crashDao.addCrash.calledOnce);
  finish();
};


