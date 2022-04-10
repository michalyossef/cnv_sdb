var nodemailer = require('nodemailer');
var config = require('./config');
var https = require('https');

function sendMail(to, subject, body, isHtml) {

  var mailOptions = {};
  mailOptions['from'] = 'rawi.sakhnini@intel.com';
  mailOptions['to'] = to;
  mailOptions['subject'] = subject;
  if(isHtml){
    mailOptions['html'] = body;
  }else{
    mailOptions['text'] = body;
  }


  var transporter = nodemailer.createTransport({
    host: "smtp.intel.com",
    port: 25
  });


  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
    

};


exports.sendTextMail = function(to, subject, body) {
  sendMail(to, subject, body, false);
};

exports.sendHtmlMail = function(to, subject, body) {
  sendMail(to, subject, body, true);
};


exports.sendPowerPublishMail = function(to, releaseUrl, rtl_name) {
  var subject = "[WEB] new release: '"+rtl_name+"'";
  var body = "Use the following link to see details: "+ releaseUrl;
  sendMail(to, subject, body, false);
};






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


exports.prepareUserInfo = function(user, callback) {
  var userInfo = {};
  userInfo['type'] = "guest";
  if(user){
//       if(config.isProduction){
	cdislookupUser(user, function(userDetails){
	    if(userDetails){
	      //process details
	      userInfo['type'] = "user";

	      userInfo['wwid'] = userDetails['wwid'];
	      userInfo['postOffice'] = userDetails['postOffice'];
	      userInfo['region'] = userDetails['region'];
	      userInfo['siteCode'] = userDetails['siteCode'];
	      userInfo['fname'] = userDetails['fname'];
	      userInfo['lname'] = userDetails['lname'];
	      userInfo['domainAddress'] = userDetails['domainAddress'];
	    }
	    return callback(userInfo);
	});
    //     if(req.session.isso && req.session.isso.idsid){
    //       //userInfo['type'] = "guest"; do some user process and decide what he is.
    //       //we have userid, check if info is in DB. if not then fetch and store in DB as cache.
    //     }else{
    //       //user is guest.
    //     }
/*      }else{
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
	return callback(userInfo);
      }*/
  }else{
    return callback(userInfo);
  }

  
}



















































