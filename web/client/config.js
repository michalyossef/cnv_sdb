app.run(function ($rootScope, $cookies) {
    // Default server - localhost
    $rootScope.serverUrl = "http://localhost:1337/"; // default - localhost (must be http, not https to fit localhost)

    // rsakhnin - cnvapi / CNV (Rawi)
    if(window.location.host=="cnv.apps1-lc-int.icloud.intel.com" || window.location.host=="cnv-sdb.intel.com"){
      $rootScope.serverUrl = "https://cnvapi.apps1-lc-int.icloud.intel.com/";
    }

    // CNV-SDB: cnv-sdb-server-dev / cnv-sdb-client-dev -- Development --
    if (window.location.host == "cnv-sdb-client-dev.apps1-lc-int.icloud.intel.com") {
        $rootScope.serverUrl = "https://cnv-sdb-server-dev.apps1-lc-int.icloud.intel.com/";
    }

    // CNV-SDB: cnv-sdb-server-prod / cnv-sdb-client-prod -- Production --
    if (window.location.host == "cnv-sdb-client-prod.apps1-lc-int.icloud.intel.com") {
        $rootScope.serverUrl = "https://cnv-sdb-server-prod.apps1-lc-int.icloud.intel.com/";
    }

    //if(window.location.host=="dbcnv.apps1-lc-int.icloud.intel.com"){
    //  $rootScope.serverUrl = "https://dbcnvapi.apps1-lc-int.icloud.intel.com/";
    //}
    //
    //// Local Linux running mode - Update to User local servers
    //if(window.location.host=="icsl11672.iil.intel.com:5000"){         // client machine
    //  $rootScope.serverUrl = "http://icsl11681.iil.intel.com:2001/";  // server machine
    //} 



    $rootScope.filesUrl = "https://filesapi.apps1-lc-int.icloud.intel.com/";
    if($cookies.get('userData')){
      var userId = JSON.parse($cookies.get('userData'))['idsid'];
      $rootScope.userId = userId;
  //     console.log(JSON.parse($cookies.get('userData'))['idsid']);
      if(userId == "rsakhnin" || userId == "ushtelri" || userId == "nbardavi" || userId == "ksamet" || userId == "okimelma" || userId == "byanovit" || userId == "awolf" || userId == "ebensim1" || userId == "sbelizow" || userId == "jitzik" || userId == "fuchsshx" || userId == "nyamin" || userId == "isimhon"){
	$rootScope.isAdmin = true;
      }
    }
});



app.run(function ($rootScope, $cookies, httpService) {
  var value = $cookies.get("user_data");
  if(!value){
      if($cookies.get('userData')){
	var userId = JSON.parse($cookies.get('userData'))['idsid'];
	$rootScope.userId = userId;
	httpService.get('user/verify',{user: userId},
			function(res){
			    $rootScope.userInfo = res.data.info;
// 			    console.log(res.data);
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
      }
  }
});


app.run(function ($rootScope, $cookies, httpService) {
  var value = $cookies.get("user_data");
  if(!value){
      if($cookies.get('userData')){
	var userId = JSON.parse($cookies.get('userData'))['idsid'];
	$rootScope.userId = userId;
	httpService.get('user/settings',{user: userId},
			function(res){
			    $rootScope.userInfo = res.data.info;
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
      }
  }
});
















