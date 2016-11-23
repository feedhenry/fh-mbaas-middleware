var url = require('url');

function _parseMbaasUrl(mbaasUrl){
  mbaasUrl = url.parse(mbaasUrl);
  var mbaasProtocol = mbaasUrl.protocol ? mbaasUrl.protocol : "https";
  mbaasProtocol = mbaasProtocol.replace(":", "");

  return {
    host: mbaasUrl.host,
    protocol: mbaasProtocol
  };
}

/**
 * Getting Environment Variables For Openshift Apps.
 * @param params
 */
function getOpenshiftEnvVars(params){
  var appMbaas = params.appMbaas;

  var mbaasUrl = _parseMbaasUrl(appMbaas.mbaasUrl);

  var appEnvs = {};
  appEnvs.FH_MBAAS_PROTOCOL = mbaasUrl.protocol;
  //App Mbaas Host. Used for apps calling mbaas hosts.
  appEnvs.FH_MBAAS_HOST = mbaasUrl.host;
  //Access key to verify apps calling Mbaas App APIs.
  appEnvs.FH_MBAAS_ENV_ACCESS_KEY = appMbaas.accessKey;

  //If the app is a service, ensure the FH_SERVICE_ACCESS_KEY env var is set.
  //This will allow authorised data sources to access the service using the X-FH-SERViCE-ACCESS-KEY header.
  if(appMbaas.isServiceApp){
    appEnvs.FH_SERVICE_ACCESS_KEY = appMbaas.serviceAccessKey;
  }

  return appEnvs;
}

module.exports = {
  openshift: getOpenshiftEnvVars
};
