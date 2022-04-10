var express = require('express'),
  fs = require('fs'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  gridStream = require("gridfs-stream"),
  certFileBuf = fs.readFileSync('./certificate/client.pem'),
  config = require('./config'),
  bodyParser = require('body-parser');
  

var currentEnv = process.env.NODE_ENV

// mongoose instance connection url connection
var options = {
   sslCA: certFileBuf
}
mongoose.Promise = global.Promise;
mongoose.connect(config.db.url, options); 

var db = mongoose.connection;

//var gridDB = gridStream(db, mongoose.mongo);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected");
});


var Schema = mongoose.Schema;
var schema = new Schema({
    file: { file_id: Object, contentType: String, fileName: String, id: String, path: String }
});
var A = mongoose.model('files', schema);

var Schema2 = mongoose.Schema;
var schema2 = new Schema({
    n: Number, buffer: Buffer, files_id: Object
});
var B = mongoose.model('fs.chunks', schema2);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,content-disposition');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


//     var a = new A;
//     a.file.data = fs.readFileSync("/nfs/iil/stod/stod177vs/w.rsakhnin.100/config_scripts/nprj.xml");
//     a.file.contentType = 'xml';
//     a.file.id = 'test';
//     a.file.fileName = 'nprj1';
//     a.save(function (err, a) {
// 	console.log("DONE!");
//     });

app.route('/').get(function(req, res) {
    res.json(config.appName);
});


app.route('/path/:path').get(function(req, res) {
    var disposition = "attachment";
    if(req.query && req.query.target){
      if(req.query.target == "download"){
	disposition = "attachment";
      }
      if(req.query.target == "view"){
	disposition = "inline";
      }
    }

    A.findOne({'file.path': req.params.path}, function(err, fileInfo){
      if (err){
	res.send(err);
	return;
      }
      B.find({'files_id': fileInfo.file.file_id}, function(err, docs){
	if (err){
	  res.send(err);
	  return;
	}
	var arr = [];
	for(var i=0;i<docs.length;i++){
	  var doc = docs[i].toJSON();
	  arr.push(new Buffer(doc.data.buffer));
	}
	res.writeHead(200, {
	  'Content-Disposition': disposition + '; filename='+fileInfo.file.fileName+fileInfo.file.contentType
	});
	res.end(Buffer.concat(arr));
      });
    });

});

app.route('/id/:id').get(function(req, res) {
    var disposition = "attachment";
    if(req.query && req.query.target){
      if(req.query.target == "download"){
	disposition = "attachment";
      }
      if(req.query.target == "view"){
	disposition = "inline";
      }
    }
    A.findOne({'_id': mongoose.Types.ObjectId(req.params.id)}, function(err, fileInfo){
      if (err){
	res.send(err);
	return;
      }
      B.find({'files_id': fileInfo.file.file_id}, function(err, docs){
	if (err){
	  res.send(err);
	  return;
	}
	var arr = [];
	for(var i=0;i<docs.length;i++){
	  var doc = docs[i].toJSON();
	  arr.push(new Buffer(doc.data.buffer));
	}
	res.writeHead(200, {
	  'Content-Disposition': disposition + '; filename='+fileInfo.file.fileName+fileInfo.file.contentType
	});
	res.end(Buffer.concat(arr));
      });
    });
});



app.listen(port);


console.log('RESTful API server started on: ' + port);









