var   mongoose = require('mongoose'),
      fs = require('fs'),
      certFileBuf = fs.readFileSync('./certificate/debug_client.pem'),
      config = require('./config');


var options = {
   sslCA: certFileBuf,
  useNewUrlParser: true
}
mongoose.Promise = global.Promise;

// var mongoose_released = mongoose.createConnection(config.db.url, options);
// 
// console.log(mongoose_released);


/*var release_db = new mongoose();
release_db.connect(config.db.url, options);*/
var debug_db = mongoose.createConnection(config.db.debugUrl, options);




module.exports = debug_db;








































