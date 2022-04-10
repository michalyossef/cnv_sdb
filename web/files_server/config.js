var currentEnv = process.env.NODE_ENV;
exports.appName = currentEnv;


// // url: "mongodb://CNV_DB_rw:2ErJiY3X3ZhKeEt@10.109.204.37:7080,10.109.204.38:7080,10.109.204.39:7080/CNV_DB?ssl=true&replicaSet=mongo7080"
// url: "mongodb://CNV_POWER_DB_rw:0AhH1V2XaU9XpTz@10.109.204.34:7070,10.109.204.35:7070,10.109.204.36:7070/CNV_POWER_DB?replicaSet=mongo7070"
exports.db = {
  url: "mongodb://cnv_files_rw:e966hSh4b5y41L1@10.109.204.37:7080,10.109.204.38:7080,10.109.204.39:7080/cnv_files?ssl=true&replicaSet=mongo7080"
};

































