var url = require('url');
var request = require('request');
var log = require('../logger/logger.js');
var _ = require('underscore');

//Creating A Request To Supercore. Supercore will authenticate the app request.
function _createRequestParams(params){
  var resourcePath = params.resourcePath;

  resourcePath = resourcePath.replace(":domain", params.domain)
    .replace(":projectid", params.projectid)
    .replace(":guid", params.appid);

  log.logger.debug("Creating Request Params For Core ", params);
  var coreHost = params.appMbaasModel.coreHost;
  if(coreHost.indexOf("http") !== 0){
    // We do not know protocol so using https as default one.
    coreHost = "https://" + coreHost;
  }
  return {
    url: url.format(coreHost + resourcePath),
    method: params.method,
    headers: {
      'x-fh-auth-app' : params.apiKey
    },
    json: true,
    body: params.data || {}
  };
}


/**
 * Utility function for creating response handlers
 * @param req
 * @param next
 * @returns {Function}
 */
function _createResponseHandler(req, next, skipDataResult){
  return function(err, httpResponse, responseBody){
    log.logger.debug("Performing Core Action ", req.url, err, httpResponse.statusCode, responseBody);

    if(err || (httpResponse.statusCode !== 200 && httpResponse.statusCode !== 204)){
      return next(err || responseBody);
    }

    //Not interested in the response from the core.
    if(!skipDataResult){
      req.appformsResultPayload = {
        data: responseBody || []
      };
    }

    next();
  };
}


/**
 * Middleware To Check That A Requested Form Exists
 * @param req
 * @param res
 * @param next
 */
function checkFormAssociation(req, res, next){
  var requestedFormId = req.params.id;
  req.appformsResultPayload = req.appformsResultPayload || {};
  var formsAssociatedWithProject = req.appformsResultPayload.data || [];

  var foundForm = _.find(formsAssociatedWithProject, function(formId){
    return requestedFormId === formId;
  });

  //Form Associated, can get the form
  if(foundForm){
    return next();
  }  else{
    return next(new Error("Invalid Form Request. Form Not Associated With The Project"));
  }
}

/**
 * Function To Notify Core Platform That The Submission Is Complete. The core platform will send a mail to any subscribers.
 * @param req
 * @param res
 * @param next
 */
function notifySubmissionComplete(req, res, next){
  req.appformsResultPayload = req.appformsResultPayload || {};
  var completeStatus = req.appformsResultPayload.data;
  var submission = completeStatus.formSubmission;

  //The Submission Is Not Complete, No need to send a notification.
  if("complete" !== completeStatus.status){
    return next();
  }

  var resourcePath = "/api/v2/appforms/domain/:domain/projects/:projectid/apps/:guid/forms/" + submission.formId + "/submissions/" + req.params.id + "/complete";

  var params = _createRequestParams(_.extend({
    resourcePath: resourcePath,
    method: "POST",
    apiKey: req.get('x-fh-auth-app'),
    appMbaasModel: req.appMbaasModel,
    data: completeStatus
  }, req.params));

  log.logger.debug("notifySubmissionComplete ", {params: params});

  request(params, _createResponseHandler(req, next, true));
}

module.exports = {
  checkFormAssociation: checkFormAssociation,
  notifySubmissionComplete: notifySubmissionComplete
};
