var express = require('express'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  fs = require('fs'),
  app = express(),
  port = process.env.PORT || 2000,
  bodyParser = require('body-parser'),
  isso = require('isso'),
  https = require('https'),
  request = require('request'),
  config = require('./config');
 

var release_db = require('./released_db.js');



// var libs = require('./libs.js');

// libs.sendHtmlMail("rawi.sakhnini@intel.com","title","<b>heeello!</b>");

var currentEnv = process.env.NODE_ENV




var debug_db = require('./debug_db.js');
debug_db.once('open', function() {

});


app.use(function (req, res, next) {
    // Website you wish to allow to connect
//     var origin = req.headers.origin;
//     if(config.client.urls.indexOf(origin) > -1){
	res.setHeader('Access-Control-Allow-Origin', "*");
//     }

// 	  res.setHeader('Access-Control-Allow-Origin', config.client.url);
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

app.use(cookieParser());



app.use(session({ secret: require('intel-generate-secret')(), resave: false, saveUninitialized: true}));
// app.get('/validateisso', isso.validateIssoToken(config.isso));
// 
// var fetched = "";
// app.route('/token').get(function(req, res, next){
//     req.originalUrl = 'https://cnvapi.apps1-lc-int.icloud.intel.com';
//     console.log(fetched);
//     if(fetched != ""){
//       return res.json("aaaa");
//       return;
//     }else{
//       var gotoUrl = 'https://iamws-i.intel.com/api/v1/Windows/Auth'; 
//   //     req.setHeader('origin', 'https://cnvapi.apps1-lc-int.icloud.intel.com/');
//       gotoUrl += '?redirectUrl=' + encodeURIComponent('https://cnvapi.apps1-lc-int.icloud.intel.com/validatetoken');
//       return res.redirect(307, gotoUrl);
// //       next(gotoUrl);
//     }
// });


// app.route('/validatetoken').get(function(req, res){
//     var user_token = req.query.token;
//     req.originalUrl = 'https://cnvapi.apps1-lc-int.icloud.intel.com';
// 
//     var username = 'sys_sidb';
//     var password = 'zaqwsxcdeZAQWSXCDE1@';
//     var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
// 
//     request.post({
// 	url: 'https://iamws-i.intel.com/api/v1/token',
// 	form: {'scope': 'Token_WindowsAuth', 'grant_type': 'client_credentials'},
// 	headers: {"Authorization": auth}
//       }, (erroreee, ress, bodyyyy) => {
// 	  if (erroreee) {
// 	    console.error(erroreee);
// 	    return;
// 	  }
// 	  var bodyObj = JSON.parse(bodyyyy);
// 	  var access_token = bodyObj.access_token;
// 
// 	  request.post({
// 	      url: 'https://iamws-i.intel.com/api/v1/windows/auth',
// 	      form: {'token': user_token},
// 	      headers: {"Authorization": "Bearer " + access_token}
// 	    }, (erroreee, ress, bodyyyy) => {
// 		if (erroreee) {
// 		  console.error(erroreee);
// 		  return;
// 		}
// 		var bodyObj = JSON.parse(bodyyyy);
// 		req.session.userId = bodyObj["IntelUserExtension"]["id"];
// 		fetched = bodyObj["IntelUserExtension"]["id"];
// 		return res.redirect(307, "https://cnvapi.apps1-lc-int.icloud.intel.com/token");
// 	  });
//     })
// });






/*if(config.isProduction){
  app.use(isso.isIssoAuthenticated());
}*/




/*function fetchUserInfo(token, callback){
  users_token.findOne({'token': token} , function(err, doc) {
    if (err || !doc){
      callback(null);
      return;
    }
    callback(doc.toObject());
  });
};
*/
function cdislookupUser(user, callback){
  https.get('https://cdisservice.swiss.intel.com/cdisservice/api/get_user_by_idsid/' + user, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      callback(JSON.parse(data));
    });

  }).on("error", (err) => {
    callback(null);
  });


};


var prepareUserInfo = function (user, callback) {
  var userInfo = {};
  userInfo['type'] = "guest";
  if(user){
      if(config.isProduction){
	cdislookupUser(user, function(userDetails){
	    if(userDetails){
	      //process details
	      userInfo['type'] = "user";
	      userInfo['info'] = userDetails;
	    }
	    return callback(userInfo);
	});
    //     if(req.session.isso && req.session.isso.idsid){
    //       //userInfo['type'] = "guest"; do some user process and decide what he is.
    //       //we have userid, check if info is in DB. if not then fetch and store in DB as cache.
    //     }else{
    //       //user is guest.
    //     }
      }else{
	var debugInfo = {
	  "domain": "AMR",
	  "idsid": "rsakhnin",
	  "raw": {
	    "userName": "AMR\\rsakhnin",
	      "name": {
		"formatted": "Sakhnini, Rawi", "familyName": "Sakhnini", "givenName": "Rawi", "middleName": "R"
	      },
	    "displayName": "Sakhnini, Rawi",
	    "nickName": "Rawi",
	    "userType": "Internal",
	    "preferredLanguage": "en_US",
	    "active": true,
	    "emails": [{"value": "rawi.sakhnini@intel.com", "primary": true}],
	    "id": "11634678",
	    "externalId": "rsakhnin"
	  }
	};
	userInfo['type'] = "super";
	userInfo['info'] = debugInfo;
      }
  }

  return callback(userInfo);
}
// app.use(prepareUserInfo);



// mongoose instance connection url connection
// var options = {
//    sslCA: certFileBuf
// }
// mongoose.Promise = global.Promise;

// var mongoose_released = mongoose.createConnection(config.db.url, options);
// 
// console.log(mongoose_released);


/*var release_db = new mongoose();
release_db.connect(config.db.url, options);*/
// var release_db = mongoose.createConnection(config.db.url, options);
// var unreleased_db = new Mongoose();
// unreleased_db.connect('bar');

// mongoose.connect(config.db.url, options); 

// var db = release_db.connection;

release_db.on('error', console.error.bind(console, 'connection error:'));
release_db.once('open', function() {

  var unrelease_db = require('./unreleased_db.js');
  unrelease_db.on('error', console.error.bind(console, 'connection error:'));

  unrelease_db.once('open', function() {


      var configurationDB = require('./api/models/configurationModel');
      var admin = require('./api/models/admin/adminModel');
      var area = require('./api/models/area/areaModel');
      var user = require('./api/models/user/userModel');
      var leakage = require('./api/models/leakage/leakageModel');
      var power = require('./api/models/power/powerModel');
      var timing = require('./api/models/timing/timingModel');
      var summary = require('./api/models/summary/summaryModel');
      var synthizes = require('./api/models/synthizes/synthizesModel');
      var cellDist = require('./api/models/cellDistribution/cellDistributionModel');
      var cellMacro = require('./api/models/cellMacro/cellMacroModel');
      var cellMacro = require('./api/models/floorplan/floorplanModel');


      app.use(bodyParser.json({limit: '50mb'}));
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());






      var adminRoutes = require('./api/routes/admin/adminRoutes'); //importing route
      adminRoutes(app); //register the route

      var areaRoutes = require('./api/routes/area/areaRoutes'); //importing route
      areaRoutes(app); //register the route

      var leakageRoutes = require('./api/routes/leakage/leakageRoutes'); //importing route
      leakageRoutes(app); //register the route

      var projectRoutes = require('./api/routes/project/projectRoutes'); //importing route
      projectRoutes(app); //register the route

      var powerRoutes = require('./api/routes/power/powerRoutes'); //importing route
      powerRoutes(app); //register the route

      var adminRoutes = require('./api/routes/admin/adminRoutes'); //importing route
      adminRoutes(app); //register the route

      var timingRoutes = require('./api/routes/timing/timingRoutes'); //importing route
      timingRoutes(app); //register the route

      var summaryRoutes = require('./api/routes/summary/summaryRoutes'); //importing route
      summaryRoutes(app); //register the route

      var synthizesRoutes = require('./api/routes/synthizes/synthizesRoutes'); //importing route
      synthizesRoutes(app); //register the route

      var cellDistributionRoutes = require('./api/routes/cellDistribution/cellDistributionRoutes'); //importing route
      cellDistributionRoutes(app); //register the route

      var cellMacroRoutes = require('./api/routes/cellMacro/cellMacroRoutes'); //importing route
      cellMacroRoutes(app); //register the route

      var floorplanRoutes = require('./api/routes/floorplan/floorplanRoutes'); //importing route
      floorplanRoutes(app); //register the route

      var userRoutes = require('./api/routes/user/userRoutes'); //importing route
      userRoutes(app); //register the route


      app.route('/').get(function(req, res) {
/*
	  if (fs.existsSync("./cdislookup")) {
		res.json("yes");
	  }else{
	      res.json("no");
	  }
*/
// 	  const
// 	      { spawnSync } = require( 'child_process' ),
// 	      cdislookup = spawnSync( './cdislookup', [ '-u', 'rsakhnin' ] );
// 
// 	  cdislookupOut = cdislookup.stdout.toString();

// 	  res.json(req.session.isso.idsid);


	  console.log(req.cookies);
// 	  var username = "";
// 	  if(!req.session.isso || !req.session.isso.idsid){
// 	      username="ilancohe";
// 	  }else{
// 	      username=req.session.isso.idsid;
// 	  }
// 	  https.get('https://cdisservice.swiss.intel.com/cdisservice/api/get_user_by_idsid/' + username, (resp) => {
// 	    let data = '';
// 
// 	    // A chunk of data has been recieved.
// 	    resp.on('data', (chunk) => {
// 	      data += chunk;
// 	    });
// 
// 	    // The whole response has been received. Print out the result.
// 	    resp.on('end', () => {
// 	      res.json(JSON.parse(data));
// 	    });
// 
// 	  }).on("error", (err) => {
// 	    console.log("Error: " + err.message);
// 	  });


      });

      app.listen(port);


      console.log('RESTful API server started on: ' + port);

  });
});











