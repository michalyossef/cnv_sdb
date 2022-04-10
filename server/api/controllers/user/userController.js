'use strict';


var release_db = require('../../../released_db.js');

var users = release_db.model('users');


var libs = require('../../../libs.js');
var config = require('../../../config.js');


exports.user_info = function(req, res) {
  var user = req.query.user;
  users.findOne({'username': user}, function(err, userDoc) {
    if(userDoc){//check if passed more than a week.
      var timestamp = new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 7 days.
      
    }
    if (err || !userDoc){
      libs.prepareUserInfo(user, function(userInfo){
	if(userInfo['type'] != "guest"){
	  users.create({'username': user, 'info': userInfo}, function (err, small) {
	      if (err){
		res.send(err);
		return;
	      }
	      res.json(userInfo);
	  });
	}else{
	  res.json(userInfo);
	}
      });
    }else{
      res.json(userDoc);
    }
  });
};



exports.get_user_settings = function(req, res) {
  var user = req.query.user;
  users.findOne({'username': user}, function(err, userDoc) {
    if (err){
      res.send(err);
      return;
    }
    if(!userDoc){
      return res.json(config.defaultUserSettings);
    }

    res.json(userDoc);
  });
};


exports.save_user_settings = function(req, res) {
  var user = req.query.user;

};














