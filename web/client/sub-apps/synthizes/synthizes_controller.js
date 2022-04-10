app.factory('synthizesDataService', function ($q, $timeout, $rootScope, $location, httpService) {
    console.log('synthizesDataService');


    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {

	cb();

    };


    //execute first time only
    self.loadData(function () {
        deferred.resolve(self);
    });

    return deferred.promise;
});



app.service("synthizesInfo", function() {
    this._picked = false;
    this._pickDate;


    this.setPicked = function(picked) {
        this._isPicked = picked;
    };

    this.isPicked = function() {
        return this._isPicked;
    };

    this.setPickDate = function(){
      this._pickDate = new Date();
    }
    
    this.getPickDate = function(){
      return this._pickDate;
    }

    this.sameDate = function(date){
	return this._pickDate == date;
    }

});

app.factory('synthizesAPI', function(httpService) {
  return {
   projects: function(releaseType, callback) {
     httpService.get('synthizes/init_info', {releaseType: releaseType}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   units: function(project, callback) {
     httpService.get('synthizes/' + project + '/units', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   users: function(project, unit, callback) {
     httpService.get('synthizes/' + project +'/' + unit + '/users', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   runids: function(project, unit, user, callback) {
     httpService.get('synthizes/' + project + '/' + unit + '/' + user + '/runids', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   stages: function(project, unit, user, runid, callback) {
     httpService.get('synthizes/' + project + '/' + unit + '/' + user + '/' + runid + '/stages', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   dates: function(project, unit, user, runid, stage, callback) {
     httpService.get('synthizes/' + project + '/' + unit + '/' + user + '/' + runid + '/' + stage + '/dates', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },


   cores: function(project, callback) {
     httpService.get('synthizes/' + project + '/cores', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   rtls: function(project, core, callback) {
     httpService.get('synthizes/' + project + '/' + core + '/rtls', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   },

   releases: function(project, core, rtl_name, callback) {
     httpService.get('synthizes/' + project + '/' + core + '/' + rtl_name + '/releases', {}, function(res){
	  callback(res);
      }, function(msg, code){console.log(msg); });
   }

  }
});




app.controller('synthizesCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo, synthizesAPI) {
    $rootScope.mainClass = 'synthizes-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;

    var favouriteProjects = ['mrp_tc', 'solar_f', 'solar_f_A0'];

    $scope.updateSelectors = function(){
      $timeout(function() {
	  $('.selectPicker').selectpicker('refresh');
      });
    };
    $scope.updateSelectors();


    $scope.releaseTypeSelected = function(){
	if($scope.data.releaseType != "unreleased" && $scope.data.releaseType != "released") return;

	synthizesAPI.projects($scope.data.releaseType, function(res){
	    const newFavList = res.data.filter(element => favouriteProjects.includes(element));
	    newFavList.sort();
	    var fetchInfoList = res.data.filter(function(obj) { return newFavList.indexOf(obj) == -1; });
	    fetchInfoList.sort();
	    $scope.data.projects = JSON.parse(JSON.stringify(newFavList));
	    $scope.data.projects = $scope.data.projects.concat(fetchInfoList);
	    $scope.data.projectUnits = [];
	    $scope.data.projectUsers = [];
	    $scope.data.projectRunids = [];
	    $scope.data.projectStages = [];
	    $scope.data.projectDates = [];
	    
	    $scope.data.projectCores = [];
	    $scope.data.projectCoreRTLS = [];
	    $scope.data.projectCoreReleases = [];


	    $scope.data.selectedUnit = undefined;
	    $scope.data.selectedUser = undefined;
	    $scope.data.selectedRunid = undefined;
	    $scope.data.selectedStage = undefined;
	    $scope.data.selectedDate = undefined;

	    $scope.data.selectedCore = undefined;
	    $scope.data.selectedRtl = undefined;
	    $scope.data.selectedRelease = undefined;


	    $scope.updateSelectors();
	    var project = $location.search().project; 
	    if(project){
	      $location.search().project = undefined;
	      $scope.data.selectedProject = project;
	      $scope.projectSelected();
	    }


	});

    }

    $scope.projectSelected = function(){
      if(!$scope.data.selectedProject) return;

      if($scope.data.releaseType == "unreleased"){
	synthizesAPI.units($scope.data.selectedProject, function(res){
	    res.data.sort().reverse();
	    $scope.data.projectUnits = res.data;

	    $scope.data.projectUsers = [];
	    $scope.data.projectRunids = [];
	    $scope.data.projectStages = [];
	    $scope.data.projectDates = [];


	    $scope.data.selectedUnit = undefined;
	    $scope.data.selectedUser = undefined;
	    $scope.data.selectedRunid = undefined;
	    $scope.data.selectedStage = undefined;
	    $scope.data.selectedDate = undefined;



	    $scope.updateSelectors();

	    var unit = $location.search().unit; 
	    if(unit){
	      $location.search().unit = undefined;
	      $scope.data.selectedUnit = unit;
	      $scope.unitSelected();
	    }
	})
      }
      if($scope.data.releaseType == "released"){
	synthizesAPI.cores($scope.data.selectedProject, function(res){
	    res.data.sort();
	    $scope.data.projectCores = res.data;
	    
	    $scope.data.projectCoreRTLS = [];
	    $scope.data.projectCoreReleases = [];


	    $scope.data.selectedCore = undefined;
	    $scope.data.selectedRtl = undefined;
	    $scope.data.selectedRelease = undefined;


	    $scope.updateSelectors();

	    var core = $location.search().core; 
	    if(core){
	      $location.search().core = undefined;
	      $scope.data.selectedCore = core;
	      $scope.coreSelected();
	    }
	})
      }

    }

    $scope.unitSelected = function(){
	if(!$scope.data.selectedUnit) return;

	synthizesAPI.users($scope.data.selectedProject, $scope.data.selectedUnit , function(res){
	    $scope.data.projectUsers = res.data;

	    $scope.data.projectRunids = [];
	    $scope.data.projectStages = [];
	    $scope.data.projectDates = [];
	    

	    $scope.data.selectedUser = undefined;
	    $scope.data.selectedRunid = undefined;
	    $scope.data.selectedStage = undefined;
	    $scope.data.selectedDate = undefined;



	    $scope.updateSelectors();
	    var user = $location.search().user; 
	    if(user){
	      $location.search().user = undefined;
	      $scope.data.selectedUser = user;
	      $scope.userSelected();
	    }


	})
    }

    $scope.userSelected = function(){
	if(!$scope.data.selectedUser) return;

	synthizesAPI.runids($scope.data.selectedProject, $scope.data.selectedUnit, $scope.data.selectedUser, function(res){
	    $scope.data.projectRunids = res.data;

	    $scope.data.projectStages = [];
	    $scope.data.projectDates = [];
	    

	    $scope.data.selectedRunid = undefined;
	    $scope.data.selectedStage = undefined;
	    $scope.data.selectedDate = undefined;


	    $scope.updateSelectors();
	    var run_id = $location.search().run_id; 
	    if(run_id){
	      $location.search().run_id = undefined;
	      $scope.data.selectedRunid = run_id;
	      $scope.runidSelected();
	    }


	})
    }

    $scope.runidSelected = function(){
	if(!$scope.data.selectedRunid) return;

	synthizesAPI.stages($scope.data.selectedProject, $scope.data.selectedUnit, $scope.data.selectedUser, $scope.data.selectedRunid, function(res){
	    $scope.data.projectStages = res.data;

	    $scope.data.projectDates = [];


	    $scope.data.selectedStage = undefined;
	    $scope.data.selectedDate = undefined;


	    $scope.updateSelectors();
	    var stage = $location.search().stage; 
	    if(stage){
	      $location.search().stage = undefined;
	      $scope.data.selectedStage = stage;
	      $scope.stageSelected();
	    }


	})
    }

    $scope.stageSelected = function(){
	if(!$scope.data.selectedStage) return;

	synthizesAPI.dates($scope.data.selectedProject, $scope.data.selectedUnit, $scope.data.selectedUser, $scope.data.selectedRunid, $scope.data.selectedStage, function(res){
	    $scope.data.projectDates = res.data;

	    $scope.data.selectedDate = undefined;


	    $scope.updateSelectors();
	    var date = $location.search().date; 
	    if(date){
	      $location.search().date = undefined;
	      $scope.data.selectedDate = date;
	      $scope.saveSynthizesPick();
	    }


	})
    }


    $scope.coreSelected = function(){
      if(!$scope.data.selectedCore) return;

      synthizesAPI.rtls($scope.data.selectedProject, $scope.data.selectedCore,
		      function(res){
			  $scope.data.projectCoreRTLS = res.data;

			  $scope.data.projectCoreReleases = [];

			  $scope.data.selectedRtl = undefined;
			  $scope.data.selectedRelease = undefined;


			  $scope.updateSelectors();
/*			  $scope.updateRtlList(res.data); */
			  $rootScope.loadingState = false;

			  var rtl = $location.search().rtl; 
			  if(rtl){
			    $location.search().rtl = undefined;
			    $scope.data.selectedRtl = rtl;
			    $scope.rtlSelected();
			  }


		      });
    };

    $scope.rtlSelected = function(){
      if(!$scope.data.selectedRtl) return;

      synthizesAPI.releases($scope.data.selectedProject, $scope.data.selectedCore, $scope.data.selectedRtl,
		      function(res){
			  $scope.data.projectCoreReleases = res.data;
			  $scope.updateSelectors();

			  $rootScope.loadingState = false;

			  $scope.data.selectedRelease = undefined;

			  var release = $location.search().release; 
			  if(release){
			    $location.search().release = undefined;
			    $scope.data.selectedRelease = release;
			    $scope.saveSynthizesPick();
			  }

		      });
    };




    $scope.saveSynthizesPick = function(){
	if($scope.data.releaseType == "unreleased"){
	  if(!$scope.data.selectedProject || !$scope.data.selectedUnit || !$scope.data.selectedUser || !$scope.data.selectedRunid || !$scope.data.selectedStage || !$scope.data.selectedDate){
	    return;
	  }
	}
	if($scope.data.releaseType == "released"){
	  if(!$scope.data.selectedProject || !$scope.data.selectedCore || !$scope.data.selectedRtl || !$scope.data.selectedRelease){
	    return;
	  }
	}
	console.log("saveSynthizesPick");

	$cookies.put('releaseType', $scope.data.releaseType);
	$cookies.put('project', $scope.data.selectedProject);
	  console.log($scope.data.releaseType);

	if($scope.data.releaseType == "unreleased"){
	  $cookies.put('unit', $scope.data.selectedUnit);
	  $cookies.put('user', $scope.data.selectedUser);
	  $cookies.put('run_id', $scope.data.selectedRunid);
	  $cookies.put('stage', $scope.data.selectedStage);
	  $cookies.put('date', $scope.data.selectedDate);
	}
	if($scope.data.releaseType == "released"){
	  $cookies.put('core', $scope.data.selectedCore);
	  $cookies.put('rtl_name', $scope.data.selectedRtl);
	  $cookies.put('release_name', $scope.data.selectedRelease);
	}

	synthizesInfo.setPicked(true);
	synthizesInfo.setPickDate();

	messageService.sendMessage("synthizesPicked");

    }
    

   
    var releaseType = $location.search().releaseType; 
    if(releaseType){
      $location.search().releaseType = undefined;
      $scope.data.releaseType = releaseType;
      $scope.releaseTypeSelected();
    }


    $scope.copyReleasePath = function(){

      var currentLocation = window.location;

      var url = "";
      url += currentLocation.origin + "/#!/";

      var currentPicked = "";
      if($scope.data.releaseType == "unreleased"){
	currentPicked = "synthesis?releaseType="+$scope.data.releaseType+"&project=" + $scope.data.selectedProject + "&unit="+$scope.data.selectedUnit+ "&user="+$scope.data.selectedUser+ "&run_id="+$scope.data.selectedRunid+"&stage="+$scope.data.selectedStage+"&date="+$scope.data.selectedDate;
      }else{
	currentPicked = "synthesis?releaseType="+$scope.data.releaseType+"&project=" + $scope.data.selectedProject + "&core="+$scope.data.selectedCore+ "&rtl="+$scope.data.selectedRtl+ "&release="+$scope.data.selectedRelease;
      }
      url += currentPicked;
      const el = document.createElement('textarea');
      el.value = url;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

    }




});




































