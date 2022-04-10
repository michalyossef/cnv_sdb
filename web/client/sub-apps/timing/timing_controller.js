app.factory('timingDataService', function ($q, $timeout, $rootScope, $location, httpService) {
    console.log('timingDataService');


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




app.controller('timingCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo) {
    $rootScope.mainClass = 'timing-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;



    $scope.data.filter = {};




    $scope.data.gridOptions = {
      enableSorting: true,
      enableGridMenu: true,
      columnDefs: [
	{ name:' ', cellTemplate: 'rowIndex.html', width: 50 },
	{ name:'group', field: 'group', width: 200, headerCellTemplate: 'groupHeaderTemplate.html'  },
	{ name:'slack', field: 'slack', cellTemplate: 'slackTemplate.html', headerCellTemplate: 'slackHeaderTemplate.html' , width: 100, enableSorting: true, },
	{ name:'t-slack', field: 't-slack', width: 100 },
	{ name:'start', field: 'start', cellTemplate: 'longTextWithTooltip.html', headerCellTemplate: 'startHeaderTemplate.html', width: 200 },
	{ name:'clk_start', field: 'clk_start', cellTemplate: 'longTextWithTooltip.html', headerCellTemplate: 'clkStartHeaderTemplate.html', width: 300 },
	{ name:'end', field: 'end', cellTemplate: 'longTextWithTooltip.html'  },
	{ name:'clk_end', field: 'clk_end', cellTemplate: 'longTextWithTooltip.html', width: 300 }
      ],
      onRegisterApi: function(gridApi){ $scope.data.gridApi = gridApi;},
      data: $scope.data.timingData
    };




    $scope.releaseTypeSelected = function(){
	if($scope.data.releaseType != "unreleased" && $scope.data.releaseType != "released") return;

	httpService.get('timing/init_info', {releaseType: $scope.data.releaseType}, function(res){
	    $scope.data.projects = res.data;

	}, function(msg, code){console.log(msg); })

    }

    $scope.projectSelected = function(){

	httpService.get('timing/' + $scope.data.selectedProject, {}, function(res){
	    $scope.data.projectUnits = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.unitSelected = function(){

	httpService.get('timing/' + $scope.data.selectedProject +'/' + $scope.data.selectedUnit, {}, function(res){
	    $scope.data.projectUsers = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.userSelected = function(){

	httpService.get('timing/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedUser, {}, function(res){
	    $scope.data.projectRunids = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.runidSelected = function(){

	httpService.get('timing/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedUser + '/' + $scope.data.selectedRunid, {}, function(res){
	    $scope.data.projectStages = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.stageSelected = function(){

	httpService.get('timing/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedUser + '/' + $scope.data.selectedRunid + '/' + $scope.data.selectedStage, {}, function(res){
	    $scope.data.projectDates = res.data;

	}, function(msg, code){console.log(msg); })
    }

//       <div style="text-align: center;display:inline-block">
// 	  <label>report_type</label></br>
// 	  <select class="selectPicker" data-width="150px" ng-model="data.selectedReportType" ng-change="reportTypeSelected()">
// 	    <option value="" selected="selected">Choose</option>
// 	    <option ng-repeat="reportType in data.reportsType track by $index" ng-value="reportType">{{reportType}}</option>
// 	  </select>
//       </div>
// 
//       <div style="text-align: center;display:inline-block">
// 	  <label>delay_type</label></br>
// 	  <select class="selectPicker" data-width="150px" ng-model="data.selectedDelayType" ng-change="delayTypeSelected()">
// 	    <option value="" selected="selected">Choose</option>
// 	    <option ng-repeat="delayType in data.delaysType track by $index" ng-value="delayType">{{delayType}}</option>
// 	  </select>
//       </div>
//       <div style="text-align: center;display:inline-block">
// 	  <label>scenario_name</label></br>
// 	  <select class="selectPicker" data-width="150px" ng-model="data.selectedScenarioName" ng-change="scenarioNameSelected()">
// 	    <option value="" selected="selected">Choose</option>
// 	    <option ng-repeat="scenarioName in data.scenarioNames track by $index" ng-value="scenarioName">{{scenarioName}}</option>
// 	  </select>
//       </div>


    $scope.reportTypeSelected = function(){
// 	httpService.get('timing/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + $scope.data.selectedRtl + '/' + $scope.data.selectedRelease + '/' + $scope.data.selectedReportType + '/delays', {}, function(res){
// 	    $scope.data.delaysType = res.data;
// 
//   // 	    $scope.data.gridApi.core.refresh();
// 	}, function(msg, code){console.log(msg); })

      if($scope.data.selectedReleaseType == "released"){
	  httpService.get('timing/delays', 
	      {'releaseType': $scope.data.selectedReleaseType, 'query': {'project': $scope.data.selectedProject, 'core': $scope.data.selectedCore, 'rtl_name': $scope.data.selectedRtl, 'release_name': $scope.data.selectedRelease, 'report_type': $scope.data.selectedReportType}},
	  function(res){
	      $scope.data.delaysType = res.data;

	      $timeout(function() {
		  $('.selectPicker').selectpicker('refresh');
	      });


	      var delayType = $location.search().delayType; 
	      if(delayType){
		$location.search().delayType = undefined;
		$scope.data.selectedDelayType = delayType;
		$scope.delayTypeSelected();
	      }


	  }, function(msg, code){console.log(msg); })
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  httpService.get('timing/delays', 
	      {'releaseType': $scope.data.selectedReleaseType, 'query': {'project': $scope.data.selectedProject, 'unit': $scope.data.selectedUnit, 'user': $scope.data.selectedUser, 'run_id': $scope.data.selectedRunid, 'stage': $scope.data.selectedStage, 'date': $scope.data.selectedDate, 'report_type': $scope.data.selectedReportType}},
	  function(res){
	      $scope.data.delaysType = res.data;

	      $timeout(function() {
		  $('.selectPicker').selectpicker('refresh');
	      });

	      var delayType = $location.search().delayType; 
	      console.log(delayType);
	      if(delayType){
		$location.search().delayType = undefined;
		$scope.data.selectedDelayType = delayType;
		$scope.delayTypeSelected();
	      }


	  }, function(msg, code){console.log(msg); })
      }

    }


    $scope.delayTypeSelected = function(){
	$scope.data.showTimingInfo = false;
// 	httpService.get('timing/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + $scope.data.selectedRtl + '/' + $scope.data.selectedRelease + '/' + $scope.data.selectedReportType + '/'+ $scope.data.selectedDelayType + '/scenarios', {}, function(res){
// 	    $scope.data.scenarioNames = res.data;
// 
//   // 	    $scope.data.gridApi.core.refresh();
// 	}, function(msg, code){console.log(msg); })

      if($scope.data.selectedReleaseType == "released"){
	  httpService.get('timing/scenarios', 
	      {'releaseType': $scope.data.selectedReleaseType, 'query': {'project': $scope.data.selectedProject, 'core': $scope.data.selectedCore, 'rtl_name': $scope.data.selectedRtl, 'release_name': $scope.data.selectedRelease, 'report_type': $scope.data.selectedReportType, 'delay_type': $scope.data.selectedDelayType}},
	  function(res){
	      $scope.data.scenarioNames = res.data;

	      $timeout(function() {
		  $('.selectPicker').selectpicker('refresh');
	      });

	      var scenarioName = $location.search().scenarioName; 
	      if(scenarioName){
		$location.search().scenarioName = undefined;
		$scope.data.selectedScenarioName = scenarioName;
		$scope.scenarioNameSelected();
	      }

	  }, function(msg, code){console.log(msg); })
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  httpService.get('timing/scenarios', 
	      {'releaseType': $scope.data.selectedReleaseType, 'query': {'project': $scope.data.selectedProject, 'unit': $scope.data.selectedUnit, 'user': $scope.data.selectedUser, 'run_id': $scope.data.selectedRunid, 'stage': $scope.data.selectedStage, 'date': $scope.data.selectedDate, 'report_type': $scope.data.selectedReportType, 'delay_type': $scope.data.selectedDelayType}},
	  function(res){
	      $scope.data.scenarioNames = res.data;

	      $timeout(function() {
		  $('.selectPicker').selectpicker('refresh');
	      });

	      var scenarioName = $location.search().scenarioName; 
	      if(scenarioName){
		$location.search().scenarioName = undefined;
		$scope.data.selectedScenarioName = scenarioName;
		$scope.scenarioNameSelected();
	      }


	  }, function(msg, code){console.log(msg); })
      }


    }

    $scope.scenarioNameSelected = function(){
	$scope.data.filter = {};
	$scope.fetchTimingInfo(true);
    }

    $scope.fetchTimingInfo = function(withFilterOptions){
	var dataGetParams = {"filter": $scope.data.filter, "releaseType": $scope.data.selectedReleaseType};
	var dataReleaseParams = {"releaseType": $scope.data.selectedReleaseType};
	var dbKey = ""
	if($scope.data.selectedReleaseType == "released"){
	  dataGetParams['extra_info'] = $scope.data.selectedReportType + '|' + $scope.data.selectedDelayType + '|' + $scope.data.selectedScenarioName;
	  dbKey = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
	}
	if($scope.data.selectedReleaseType == "unreleased"){
	  dataGetParams['extra_info'] = $scope.data.selectedReportType + '|' + $scope.data.selectedDelayType + '|' + $scope.data.selectedScenarioName;
	  dbKey = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
	}
	$scope.data.showTimingInfo = false;
	httpService.get('timing/data/' + dbKey, dataGetParams, function(res){

	    if((Array.isArray(res.data) && res.data.length == 0) || (Object.keys(res.data).length == 0)){
		$scope.data.noDataInfo = true;
		$rootScope.loadingState = false;
		return;
	    }
	    $scope.data.noDataInfo = false;

	    $scope.data.timingData = res.data;
	    for(var i=0;i<$scope.data.timingData.length;i++){
	      $scope.data.timingData[i]["idx"] = i+1;
	    }
	    $scope.data.gridOptions.data = $scope.data.timingData;

	    $scope.data.showTimingInfo = true;

// 	    $scope.data.gridApi.core.refresh();
	}, function(msg, code){console.log(msg); })

	if(withFilterOptions){
	    httpService.get('timing/filterOptions/' + dbKey , dataGetParams, function(res){
		  $scope.data.filterOptions = res.data;
		  $scope.data.filterGroups = $scope.data.filterOptions.groups;
		  $scope.data.filterSlackRanges = $scope.data.filterOptions.slacks.ranges;
		  $scope.data.filterSlackStrings = $scope.data.filterOptions.slacks.strings;

		  $timeout(function() {
		      $('.timingGroupFilterSelectpicker').selectpicker('refresh');
		  });


	    }, function(msg, code){console.log(msg); })
	}
    }


    $scope.initialFetchTimingInfo = function(){
      if($scope.data.selectedReleaseType == "released"){
	  httpService.get('timing/reports', 
	      {'releaseType': $scope.data.selectedReleaseType, 'query': {'project': $scope.data.selectedProject, 'core': $scope.data.selectedCore, 'rtl_name': $scope.data.selectedRtl, 'release_name': $scope.data.selectedRelease}},
	  function(res){
	      $scope.data.reportsType = res.data;

	      $timeout(function() {
		  $('.selectPicker').selectpicker('refresh');
	      });

	      var reportType = $location.search().reportType; 
	      if(reportType){
		$location.search().reportType = undefined;
		$scope.data.selectedReportType = reportType;
		$scope.reportTypeSelected();
	      }


	  }, function(msg, code){console.log(msg); })
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  httpService.get('timing/reports', 
	      {'releaseType': $scope.data.selectedReleaseType, 'query': {'project': $scope.data.selectedProject, 'unit': $scope.data.selectedUnit, 'user': $scope.data.selectedUser, 'run_id': $scope.data.selectedRunid, 'stage': $scope.data.selectedStage, 'date': $scope.data.selectedDate}},
	  function(res){
	      $scope.data.reportsType = res.data;

	      $timeout(function() {
		  $('.selectPicker').selectpicker('refresh');
	      });

	      var reportType = $location.search().reportType; 
	      if(reportType){
		$location.search().reportType = undefined;
		$scope.data.selectedReportType = reportType;
		$scope.reportTypeSelected();
	      }

	  }, function(msg, code){console.log(msg); })
      }
    }

    $scope.getTimingInfo = function(){

      $scope.fetchTimingInfo(false);
    }



    $scope.showFilterByGroups = function(){
      $scope.data.showGroupsFilterModal = true;
    };

    $scope.showFilterBySlacks = function(){
      $scope.data.showSlacksFilterModal = true;
    };

    $scope.showFilterByStart = function(){
      $scope.data.showStartFilterModal = true;
    };

    $scope.showFilterByClkStarts = function(){
      $scope.data.showClkStartFilterModal = true;
    };


    $scope.filterByGroups = function(){
      $scope.data.filter.groups = $scope.data.selectedGroupsFilter;
      $scope.getTimingInfo();
    }

    $scope.filterBySlacks = function(){
      $scope.data.filter.slacksRanges = $scope.data.selectedSlacksRange;
      $scope.data.filter.slacksStrings = $scope.data.selectedSlacksString;
      $scope.getTimingInfo();
    }

    $scope.filterByStarts = function(){
      $scope.data.filter.start = $scope.data.selectedStartFilter;
      $scope.getTimingInfo();
    }

    $scope.filterByClkStarts = function(){
      $scope.data.filter.clk_start = $scope.data.selectedClkStartFilter;
      $scope.getTimingInfo();
    }



    $scope.getSlackFile = function(fileId){
      var link = document.createElement('a');
      link.href = $rootScope.filesUrl + "id/" +encodeURIComponent(fileId) + "?target=view";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click(); 
    }

    $scope.copyToClipboard = function(str){
	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
	toastr.success(str, 'Copied successfully')
    }



    var reportType = $location.search().reportType; 
    if(reportType){
      $scope.initialFetchTimingInfo();
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

	  $scope.initialFetchTimingInfo();
	}
    };

//     if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showTimingInfo && $cookies.get('project') && $cookies.get('unit') && $cookies.get('user') && $cookies.get('run_id') && $cookies.get('stage') && $cookies.get('date')){
//       $scope.receive("synthizesPicked");
//     }

    if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showTimingInfo){
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




































