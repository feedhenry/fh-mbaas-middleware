var appMiddleware = require('../middleware/app.js');
var log = require('../logger/logger.js');

/**
 * Authentication For App APIs In Mbaas (/api/mbaas)
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function appAuth(req, res, next){
  var apiKey = req.get('x-fh-auth-app');
  var envAccessKey = req.get('x-fh-env-access-key');

  log.logger.debug("Authenticating App ", apiKey, envAccessKey, req.params);

  if(!apiKey || !envAccessKey){
    res.status(401);
    return res.end();
  }

  appMiddleware.getMbaasApp({
    domain: req.params.domain,
    environment: req.params.environment,
    guid: req.params.appid,
    accessKey: envAccessKey,
    apiKey: apiKey
  }, function(err, mbaasApp){
    if(!mbaasApp){
      log.logger.debug("App Not Valid For Params ", apiKey, envAccessKey, req.params);
      return res.status(401).json({});
    }

    log.logger.debug("App Valid For Params ", apiKey, envAccessKey, req.params);
    req.appMbaasModel = mbaasApp;
    //Authorised, moving on.
    next();
  });
}

module.exports = {
  app: appAuth
};
