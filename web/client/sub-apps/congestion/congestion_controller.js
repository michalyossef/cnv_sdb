app.factory('congestionDataService', function ($q, $timeout, $rootScope, $location, httpService) {
	console.log('congestionDataService');




    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {
                cb();
/*
        $rootScope.loadingState = true;
        self.projects = [];

        async.series([
            function (callback) {
	      httpService.get('leakage/init_info', {}, function(res){self.projects = res.data; self.projectCoreReleases=[];self.projectCores=[]; callback();}, function(msg, code){console.log(msg);callback('error'); })
            }], function (err) {

	    console.log(err);
            if(err){
		  deferred.reject(self);
	    }
	    $rootScope.loadingState = false;
            if (cb && typeof cb === 'function') {
                cb();
            }
        });*/
    };


    //execute first time only
    self.loadData(function () {
        deferred.resolve(self);
    });

    return deferred.promise;
});





app.controller('congestionCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo) {
    $rootScope.mainClass = 'congestion-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;



    $scope.fetchCongestionInfo = function(){
      console.log("fetchCongestionInfo");

      $scope.data.congestionImageId = undefined
      $scope.data.noDataInfo = true

      var release_id = "";
      if($scope.data.selectedReleaseType == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
      }


      $rootScope.loadingState = true;

      httpService.get('congestion/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
		      function(res){
			if(res && res.data && res.data.length > 0){
			  
			  $scope.data.maps = res.data;
			  for(i=0;i<$scope.data.maps.length;i++){
			    if($scope.data.maps[i].map_type == "congestion") $scope.data.selectedMap = $scope.data.maps[i];
			  }
			  $scope.data.noDataInfo = false

			}

			$rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
	
    }


    $scope.getImageFile = function(fileId){
      return  $rootScope.filesUrl + "id/" +encodeURIComponent(fileId) + "?target=download";
      /*var link = document.createElement('a');
      link.href = $rootScope.filesUrl + "id/" +encodeURIComponent(fileId) + "?target=view";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click(); */
    }


    $scope.receive = function(message) {
	console.log(message);
	if(message == "synthizesPicked"){
	  $scope.data.selectedReleaseType = $cookies.get('releaseType');
	  if($scope.data.selectedReleaseType == "unreleased"){
	    $scope.data.selectedProject = $cookies.get('project');
	    $scope.data.selectedUnit = $cookies.get('unit');
	    $scope.data.selectedUser = $cookies.get('user');
	    $scope.data.selectedRunid = $cookies.get('run_id');
	    $scope.data.selectedStage = $cookies.get('stage');
	    $scope.data.selectedDate = $cookies.get('date');
	  }
	  if($scope.data.selectedReleaseType == "released"){
	    $scope.data.selectedProject = $cookies.get('project');
	    $scope.data.selectedCore = $cookies.get('core');
	    $scope.data.selectedRtl = $cookies.get('rtl_name');
	    $scope.data.selectedRelease = $cookies.get('release_name');
	  }

	  $scope.data.pickedDate = synthizesInfo.getPickDate();

	  $scope.fetchCongestionInfo();
	}
    };

//     if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showTimingInfo && $cookies.get('project') && $cookies.get('unit') && $cookies.get('user') && $cookies.get('run_id') && $cookies.get('stage') && $cookies.get('date')){
//       $scope.receive("synthizesPicked");
//     }

    if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showLeakageInfo){
	if($cookies.get('releaseType') && $cookies.get('releaseType') == "unreleased" && $cookies.get('project') && $cookies.get('unit') && $cookies.get('user') && $cookies.get('run_id') && $cookies.get('stage') && $cookies.get('date')){
	    $scope.receive("synthizesPicked");
	}
	if($cookies.get('releaseType') && $cookies.get('releaseType') == "released" && $cookies.get('project') && $cookies.get('core') && $cookies.get('rtl_name') && $cookies.get('release_name')){
	    $scope.receive("synthizesPicked");
	}
    }


    if(!$scope.data.SubscribedToMessage){
      $scope.data.SubscribedToMessage = true;
      messageService.addSubscriber($scope);
    }



});




































