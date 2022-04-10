app.factory('customchipDataService', function ($q, $timeout, $rootScope, $location, httpService) {
	console.log('customchipDataService');


    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {
        $rootScope.loadingState = true;
        self.projects = [];
        self.pickedReleases = [];

        async.series([
            function (callback) {
	      httpService.get('project/init_info', {}, function(res){self.projects = res.data; self.projectCoreReleases=[];self.projectCores=[]; callback();}, function(msg, code){console.log(msg);callback('error'); })
            }], function (err) {

	    console.log(err);
            if(err){
		  deferred.reject(self);
	    }
	    $rootScope.loadingState = false;
            if (cb && typeof cb === 'function') {
                cb();
            }
        });
    };


    //execute first time only
    self.loadData(function () {
        deferred.resolve(self);
    });

    return deferred.promise;
});




app.controller('customchipCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr) {
    $rootScope.mainClass = 'customchip-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;



    $timeout(function() {
	$('.selectPicker').selectpicker('refresh');
    });
    

    $scope.data.memPercent = 100;
    $scope.data.stdPercent = 100;

// 	onChange: sliderOnChange,
    $scope.data.slider = {
      options: {
	floor: 0,
	ceil: 100,
	step: 1,
	pushRange: true,
      },
    }
    $scope.refreshSlider = function() {
      $timeout(function() {
	$scope.$broadcast('rzSliderForceRender')
      })
    }


    $scope.projectSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){return;}

      $rootScope.loadingState = true;

      httpService.get('project/releases/' + $scope.data.selectedProject,{},
		      function(res){
/*			  $scope.data.selectedCore = "";
			  $scope.data.selectedRelease = "";
			  $scope.updateReleaseList([]);
			  $scope.updateCoreList(res.data); */
			  $rootScope.loadingState = false;

			  $scope.data.projectAreaFullchipCores = [];
			  $scope.data.projectAreaFullchipConfig = [];

			  $scope.data.projectLeakageFullchipCores = [];
			  $scope.data.projectLeakageFullchipConfig = [];

			
			  if(res.data.areaChip && res.data.areaChip.cores){
			    $scope.data.projectAreaFullchipCores = res.data.areaChip.cores;
			    $scope.data.projectAreaFullchipConfig = res.data.areaChip.config;
			  }


			  if(res.data.leakageChip && res.data.leakageChip.cores){
			    $scope.data.projectLeakageFullchipCores = res.data.leakageChip.cores;
			    $scope.data.projectLeakageFullchipConfig = res.data.leakageChip.config;
			  }




			  $scope.data.projectCoresList = [];

			  $scope.data.excelsPath = {};


			  for(var i=0;i<$scope.data.projectAreaFullchipCores.length;i++){
			      var currCore = res.data.areaChip.cores[i][0];
			      $scope.data.excelsPath[currCore['release_name']] = currCore['excelPath'];
			      if($scope.data.projectCoresList.indexOf(currCore['core']) == -1) {
				  $scope.data.projectCoresList.push(currCore['core']);
			      }
			  }
			  for(var i=0;i<$scope.data.projectLeakageFullchipCores.length;i++){
			      var currCore = res.data.leakageChip.cores[i][0];
			      $scope.data.excelsPath[currCore['release_name']] = currCore['excelPath'];
			      if($scope.data.projectCoresList.indexOf(currCore['core']) == -1) {
				  $scope.data.projectCoresList.push(currCore['core']);

			      }
			  }

			  

			  $timeout(function() {
			      $('.selectPicker').selectpicker('refresh');
			  });


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };


    $scope.getRtlByCores = function(core){
	var rtlList = [];
	for(var i=0;i<$scope.data.projectAreaFullchipCores.length;i++){
	    for(var j=0;j<$scope.data.projectAreaFullchipCores[i].length;j++){
	      var currCore = $scope.data.projectAreaFullchipCores[i][j];
	      if(core == currCore['core']){
		 if(rtlList.indexOf(currCore['rtl_name']) == -1) rtlList.push(currCore['rtl_name']);
	      }
	    }
	}

	for(var i=0;i<$scope.data.projectLeakageFullchipCores.length;i++){
	    for(var j=0;j<$scope.data.projectLeakageFullchipCores[i].length;j++){
	      var currCore = $scope.data.projectLeakageFullchipCores[i][j];
	      if(core == currCore['core']){
		 if(rtlList.indexOf(currCore['rtl_name']) == -1) rtlList.push(currCore['rtl_name']);
	      }
	    }
	}
	$scope.data.rtlList = rtlList;
    }


    $scope.getReleasesByCores = function(core, rtl){
	var releaseList = [];
	for(var i=0;i<$scope.data.projectAreaFullchipCores.length;i++){
	  for(var j=0;j<$scope.data.projectAreaFullchipCores[i].length;j++){
	    var currCore = $scope.data.projectAreaFullchipCores[i][j];
	    if(core == currCore['core'] && rtl == currCore['rtl_name']){
		if(releaseList.indexOf(currCore['release_name']) == -1) releaseList.push(currCore['release_name']);
	    }
	  }
	}
	for(var i=0;i<$scope.data.projectLeakageFullchipCores.length;i++){
	  for(var j=0;j<$scope.data.projectLeakageFullchipCores[i].length;j++){
	    var currCore = $scope.data.projectLeakageFullchipCores[i][j];
	    if(core == currCore['core'] && rtl == currCore['rtl_name']){
		if(releaseList.indexOf(currCore['release_name']) == -1) releaseList.push(currCore['release_name']);
	    }
	  }
	}
	$scope.data.releaseList = releaseList;

    }


//     $scope.rtlSelected = function(ind){
// 	$timeout(function() {
// 	    $('.selectPicker').selectpicker('refresh');
// 	});
// 
// 	$scope.getAreaRelease(ind);
// 	$scope.getLeakageRelease(ind);
//     }
// 
// 
//     $scope.releaseSelected = function(ind){
// 	$timeout(function() {
// 	    $('.selectPicker').selectpicker('refresh');
// 	});
// 	$scope.getAreaRelease(ind);
// 	$scope.getLeakageRelease(ind);
//     }

    $scope.fetchAndAddRelease = function(){
// 	if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedRtl && $scope.data.selectedRelease)
	$scope.data.pickedReleases.push({project: $scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: $scope.data.selectedRtl, release_name: $scope.data.selectedRelease});

	$scope.getAreaRelease($scope.data.pickedReleases.length-1);
	$scope.getLeakageRelease($scope.data.pickedReleases.length-1);
    };

    $scope.getAreaRelease = function(indx){

	$scope.data.pickedReleases[indx].area_exists = false;

	httpService.get('area/' + $scope.data.pickedReleases[indx].project + '|' + $scope.data.pickedReleases[indx].core + '|' + $scope.data.pickedReleases[indx].rtl_name + '|' + $scope.data.pickedReleases[indx].release_name ,{'parent': 'root'},
			function(res){
			    $scope.data.pickedReleases[indx].area_release_info = res.data[0];
			    if($scope.data.pickedReleases[indx].area_release_info){
			      $scope.data.pickedReleases[indx].area_exists = true;
			    }
			},
			function(msg, code){
			    console.log(msg);
			});
    }

    $scope.getLeakageRelease = function(indx){

	$scope.data.pickedReleases[indx].leakage_exists = false;
	httpService.get('leakage/' + $scope.data.pickedReleases[indx].project + '|' + $scope.data.pickedReleases[indx].core + '|' + $scope.data.pickedReleases[indx].rtl_name + '|' + $scope.data.pickedReleases[indx].release_name ,{'parent': 'root'},
			function(res){
			    $scope.data.pickedReleases[indx].leakage_release_info = res.data[0];
			    var node = $scope.data.pickedReleases[indx].leakage_release_info;
			    if(node){
			      var currNodeTotal = 0;
			      for(var i=0;i<node['stdcell']['current'].length;i++){
				  currNodeTotal += node['stdcell']['current'][i]['value'];
			      }
			      $scope.data.pickedReleases[indx].leakage_release_info.total_current = currNodeTotal;

			      var currNodeTotal = 0;
			      for(var i=0;i<node['memory']['current'].length;i++){
				if(node['memory']['current'][i]['mode'] == "stdby"){
				  currNodeTotal += node['memory']['current'][i]['value'];
				}
			      }
			      $scope.data.pickedReleases[indx].leakage_release_info.total_stdby = currNodeTotal;
			      if($scope.data.pickedReleases[indx].leakage_release_info.total_stdby && $scope.data.pickedReleases[indx].leakage_release_info.total_current)
				$scope.data.pickedReleases[indx].leakage_exists = true;
			    }
			},
			function(msg, code){
			    console.log(msg);
			});
    }


    $scope.getAreaKgStdcellTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.pickedReleases && i<$scope.data.pickedReleases.length;i++){
	  var core = $scope.data.pickedReleases[i];
	  if(core.area_release_info && core.area_release_info.total_std && core.area_release_info.total_std.area)
	    sum += core.area_release_info.total_std.area / 1000 / (core.area_release_info.G_NAND_EQU_CELL)
      }
      return sum;
    }
    $scope.getAreaKbMemoryTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.pickedReleases && i<$scope.data.pickedReleases.length;i++){
	  var core = $scope.data.pickedReleases[i];
	  if(core.area_release_info && core.area_release_info.total_memory && core.area_release_info.total_memory.KB)
	    sum += core.area_release_info.total_memory.KB
      }
      return sum;

    }
    $scope.getLeakageTotalCurrent = function(){
      var sum = 0;
      for(var i=0;$scope.data.pickedReleases && i<$scope.data.pickedReleases.length;i++){
	  var core = $scope.data.pickedReleases[i];
	  if(core.leakage_release_info && core.leakage_release_info.total_current)
	    sum += core.leakage_release_info.total_current
      }
      return sum;

    }
    $scope.getLeakageTotalStdby = function(){
      var sum = 0;
      for(var i=0;$scope.data.pickedReleases && i<$scope.data.pickedReleases.length;i++){
	  var core = $scope.data.pickedReleases[i];
	  if(core.leakage_release_info && core.leakage_release_info.total_stdby)
	    sum += core.leakage_release_info.total_stdby
      }
      return sum;

    }
    $scope.getMacroTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.pickedReleases && i<$scope.data.pickedReleases.length;i++){
	  var core = $scope.data.pickedReleases[i];
	  if(core.area_release_info && core.area_release_info.macro)
	    sum += core.area_release_info.macro.area
      }
      return sum;

    }




    $scope.getRleasePath = function(tab,indx){
      return tab + "?project=" + $scope.data.selectedProject + "&core="+$scope.data.pickedReleases[indx].core+ "&rtl="+$scope.data.pickedReleases[indx].rtl_name+ "&release="+$scope.data.pickedReleases[indx].release_name;
    }

    
    $scope.getExcelPath = function(excelPath){
      var link = document.createElement('a');
      link.href = $rootScope.filesUrl + "path/" +encodeURIComponent(excelPath);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click(); 

    }

    $scope.removePickedRelease = function(indx){
      $scope.data.pickedReleases.splice(indx, 1);
    }


});




































