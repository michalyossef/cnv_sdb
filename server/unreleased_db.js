var   mongoose = require('mongoose'),
      fs = require('fs'),
      certFileBuf = fs.readFileSync('./certificate/unreleased_client.pem'),
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
var unrelease_db = mongoose.createConnection(config.db.unreleasedUrl, options);




module.exports = unrelease_db;








































