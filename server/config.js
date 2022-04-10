var currentEnv = process.env.NODE_ENV;
exports.appName = currentEnv;


var isProduction = currentEnv == "production" ? true: false;
var isTest = currentEnv == "test" ? true: false;
var isDevelopment = currentEnv == "development" ? true: false;

exports.isProduction = isProduction;
exports.isTest = isTest;
exports.isDevelopment = isDevelopment;


if(isProduction){
  exports.client = { 
    urls: ["http://rfad.apps1-lc-int.icloud.intel.com", "http://rfad.app.intel.com"]  
  };

  exports.isso = {
      iamUser: "sidb",
      iamPass: "zaqwsxcdeZAQWSXCDE1!", // however you store your password, you must ensure that it is encrypted. 
      allowBasic: true // this is optional (defaults to false) and will turn on basic auth primarily for server to server calls
  };
}


if(isDevelopment){
  exports.client = {
    urls: ["https://dbcnv.apps1-lc-int.icloud.intel.com"]
  };  
}


if(isTest){
  exports.client = {
    //urls: ["http://icsl11684.iil.intel.com:5000"]
    //urls: ["http://icsl11662.iil.intel.com:5000"]
    urls: ["http://"+process.env.CLIENT_HOSTNAME+":"+process.env.CLIENT_PORT]
  };
}


// // url: "mongodb://CNV_DB_rw:2ErJiY3X3ZhKeEt@10.109.204.37:7080,10.109.204.38:7080,10.109.204.39:7080/CNV_DB?ssl=true&replicaSet=mongo7080"
// url: "mongodb://CNV_POWER_DB_rw:0AhH1V2XaU9XpTz@10.109.204.34:7070,10.109.204.35:7070,10.109.204.36:7070/CNV_POWER_DB?replicaSet=mongo7070"
exports.db = {
  url: "mongodb://CNV_DB_rw:2ErJiY3X3ZhKeEt@10.109.204.37:7080,10.109.204.38:7080,10.109.204.39:7080/CNV_DB?ssl=true&replicaSet=mongo7080",
  unreleasedUrl: "mongodb://UNRELEASED_C_rw:z2162Cu337s93Re@10.109.204.37:7080,10.109.204.38:7080,10.109.204.39:7080/UNRELEASED_CNV_DB?ssl=true&replicaSet=mongo7080",
  debugUrl: "mongodb://CNV_debug_rw:1Ev1l24Ur9646I1@10.109.204.25:7050,10.109.204.26:7050,10.109.204.27:7050/CNV_debug?ssl=true&replicaSet=mongo7050"
};




exports.isso = {
    iamUser: "sys_sidb",
    iamPass: "zaqwsxcdeZAQWSXCDE1@", // however you store your password, you must ensure that it is encrypted. 
    allowBasic: true // this is optional (defaults to false) and will turn on basic auth primarily for server to server calls
};



exports.defaultUserSettings = {
  synthesis_fav_project: ['snj'],


};

































