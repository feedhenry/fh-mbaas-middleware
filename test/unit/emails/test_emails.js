var proxyquire = require('proxyquire');
var assert = require('assert');
var log = require('../../../lib/logger/logger.js');
log.defaultLogger();

function getMocks() {
  return {
    '../util/requestTranslator': {
      parseTestEmailRequest: function(req){
        var reqObj = {};
        reqObj.emails = req.body.emails;
        return reqObj;
      }
    },
    '../email/index': {
      sendTestEmail: function(emailData, cb){
        if (emailData.emails === 'test@test.com'){
          cb();
        } else {
          cb({err:'error mock', emailData: emailData});
        }
      }
    }
  };
}

module.exports = {
  "test_should_sendTestEmail": function (finish){
    var reqValid = { body: { emails: 'test@test.com' }};
    var reqInvalid = { body: { emails: 'test@test@' }};
    var mocktest = proxyquire('../../../lib/middleware/alerts', getMocks());

    mocktest.testEmails(reqValid, {}, function(err){
      assert.equal(err, undefined, 'Email ' + reqValid.emails + ' should be valid: ' + JSON.stringify(err));
    });
    mocktest.testEmails(reqInvalid, {}, function(err){
      assert.equal(err.err, 'error mock', 'Email ' + reqValid.emails + ' should return error: ' + JSON.stringify(err));
    });
    finish();
  }
};
