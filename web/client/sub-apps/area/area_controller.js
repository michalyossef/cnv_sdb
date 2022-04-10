app.factory('areaDataService', function ($q, $timeout, $rootScope, $location, httpService) {
	console.log('areaDataService');


    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {
//         $rootScope.loadingState = true;
//         self.projects = [];
// 
//         async.series([
//             function (callback) {
// 	      httpService.get('area/init_info', {}, function(res){self.projects = res.data; self.projectCoreReleases=[];self.projectCores=[]; callback();}, function(msg, code){console.log(msg);callback('error'); })
//             }], function (err) {
// 
// 	    console.log(err);
//             if(err){
// 		  deferred.reject(self);
// 	    }
// 	    $rootScope.loadingState = false;
//             if (cb && typeof cb === 'function') {
//                 cb();
//             }
//         });

	cb();


    };


    //execute first time only
    self.loadData(function () {
        deferred.resolve(self);
    });

    return deferred.promise;
});


app.controller('areaCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo, synthizesAPI) {

    $rootScope.mainClass = 'area-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;



//     $scope.receive = function(message) {
// 	console.log(message);
//     };
//     messageService.addSubscriber($scope);


    $scope.data.showKB=true;
    $scope.data.showArea=true;
    $scope.data.showCount=true;

    $scope.data.pieLabels = [];
    $scope.data.pieValues = [];
    $scope.data.pieOptions = {legend: {display: true}};


    $scope.data.coreMemTotal = 0;
    $scope.data.coreMacroTotal = 0;
    $scope.data.coreStdTotal = 0;

    $scope.data.currNodeTotalPercent = 0;


    $scope.data.memPercent = 100;
    $scope.data.stdPercent = 100;

    $scope.data.gridCellDistOptions = {
      enableSorting: true,
      columnDefs: [
	{ name:' ', cellTemplate: 'rowIndex.html', width: 50 },
	{ name:'cell', field: 'cell' },
	{ name:'type', field: 'type' },
	{ name:'description', field: 'description' },
	{ name:'count', field: 'count', type: 'number' },
	{ name:'cell_area', field: 'cell_area' },
	{ name:'total_area', field: 'total_area' }
      ],
      onRegisterApi: function(gridApi){ $scope.data.gridApi = gridApi;},
      data: $scope.data.cellDistInfo
    };


    $scope.data.gridCellMacroOptions = {
      enableSorting: true,
      columnDefs: [
	{ name:' ', cellTemplate: 'rowIndex.html', width: 50 },
	{ name:'instance', field: 'instance' },
	{ name:'cell', field: 'cell' },
	{ name:'cell_area', field: 'cell_area' },
	{ name:'die area', field: 'die_area' }
      ],
      onRegisterApi: function(gridApi){ $scope.data.gridCellMacroApi = gridApi;},
      data: $scope.data.cellMacroInfo
    };



    $scope.data.compareUnits = ["K-gate/KB", "Area [um2]", "Cell count"]


      $scope.chartDatasetOverride = [{ yAxisID: 'y-axis-1' }];
      $scope.chartOptions = {
	legend: {display: true},
	scales: {
	  yAxes: [
	    {
	      id: 'y-axis-1',
	      type: 'linear',
	      scaleStartValue : 0,
	      display: true,
	      position: 'left',
	      ticks: {
		  min: 0,
		  scaleStartValue: 0
	      }
	    }
	  ],
	   xAxes: [
	    {
	      ticks: {
		  autoSkip: false
	      }
	    }
	  ]
	}
      };




    $scope.data.slider = {
      options: {
	floor: 0,
	ceil: 100,
	step: 1,
	pushRange: true,
	onChange: sliderOnChange,
      },
    }


//     $timeout(function() {
// 	$('.areaProjectSelectpicker').selectpicker('refresh');
//     });
//     $timeout(function() {
// 	$('.areaCoreSelectpicker').selectpicker('refresh');
//     });
//     $timeout(function() {
// 	$('.areaReleaseSelectpicker').selectpicker('refresh');
//     });
//     $timeout(function() {
// 	$('.areaRtlSelectpicker').selectpicker('refresh');
//     });

    $scope.refreshSlider = function() {
      $timeout(function() {
	$scope.$broadcast('rzSliderForceRender')
      })
    }


    $scope.treeSelectNode = function(node,tog){

      if(!node.fetched && node.hasChild){
	$scope.fetchChildren(node);
	return;
      }
      if(tog){ node.show = !node.show;}
      else{if(!node.show) node.show = !node.show;}
      $scope.changeSelectedNode(node);
    };

    $scope.changeSelectedNode = function(node){
      $scope.data.selectedNode = node;
      
      if(!$scope.data.selectedNode.currentHierarchy){
	$scope.updateHierarchyNodes($scope.data.selectedNode);
      }

      $scope.updateNodeAllChildren($scope.data.selectedNode);

      if($scope.data.compareMode){
	$scope.fetchUnitsToCompare();
      }

      if(!$scope.data.compareMode){
	$scope.updatePieChart();
	$scope.refreshSlider();
	$scope.updateBlockTotal();
      }

    };



    $scope.updateNodeAllChildren = function(node){
	if(node.allChildren && node.allChildren.length > 1) return;

	var units = [node];
	for(var i=0;i<units.length;i++){
	    var unit = units[i];
	    if(unit.children && unit.children.length >0){
	      for(var j=0;j<unit.children.length;j++){
		  units.splice(i+j+1, 0, unit.children[j]);
	      }
	    }
	  }
	node.allChildren = units;
    }


    $scope.fetchChildren = function(node){

      var release_id = "";
      if($scope.data.selectedReleaseType == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
      }


      $rootScope.loadingState = true;
      httpService.get('area/' + release_id,{'parent': node.instance, releaseType: $scope.data.selectedReleaseType},
		      function(res){
			  for(var i=0;i<res.data.length;i++){
			     res.data[i].parent = node;
			  }
			  node.children = res.data;
			  node.fetched = true;
			  $scope.treeSelectNode(node, true);
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };


//     $scope.getInstanceSuggesions = function(instance){
//       httpService.get('area/suggestions/' + $scope.data.fetchSelectedProject + '/' + $scope.data.fetchSelectedCore + '/' + $scope.data.fetchSelectedRelease,{'instance':instance},
// 		      function(res){
// 			 if($scope.data.searchSuggestion == instance){
// 			    console.log("EQUAL");
// 			    $scope.data.suggestedAreas = res.data;
// // 			    $scope.$apply();
// 			    console.log($scope.data.suggestedAreas);
// 			  }else{
// 			    console.log("NEQUAL");
// 			  }
// 		      },
// 		      function(msg, code){
// 			  console.log(msg);
// 		      });
//     };


    $scope.getInstanceSuggesions = function(instance) {
      if(!instance || instance.length == 0) return;

      var release_id = "";
      if($scope.data.selectedReleaseType == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
      }


      return $http({
	method: 'GET',
	url: $rootScope.serverUrl + 'area/suggestions/' + release_id,
	params: {'instance':instance,releaseType: $scope.data.selectedReleaseType}
      }).then(function successCallback(response) {
	$scope.results = response.data;
	return $scope.results;
      }, function errorCallback(response) {
	console.log(response);
      });
    };




    $scope.onSelectInstance = function ($item, $model, $label, $event) {
      var release_id = "";
      if($scope.data.selectedReleaseType == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
      }

      $rootScope.loadingState = true;
      httpService.get('area/tree/' + release_id, {'instance':$item.instance, releaseType: $scope.data.selectedReleaseType},
		      function(res){
			  if(res.data){
			      var myLevel = $item.instance.split("/");
			      node = $scope.data.chart;
			      for(var level = 1; level < myLevel.length+1 ; level++){
				  var allInstancesInLevel = $scope.findAllInstanceByLevel(res.data,level+1);
				  //find current node,,, and append to children
				  var nodePos = -1;
/*				  console.log(node);
				  console.log(myLevel[level-1]);*/
				  for(var i = 0; i < node.length ; i++){
				      if(node[i].name == myLevel[level-1]){
					  nodePos=i;
					  node[i].children = allInstancesInLevel;
					  node[i].fetched = true;

					  for(var j=0;j<node[i].children.length;j++){
					    node[i].children[j].parent = node[i];
					  }

					  break;
				      }
				  }
/*				  console.log(node);
				  console.log(nodePos);*/
				  if(nodePos == -1){
				      toastr.error('Missing hierarchy: ' + myLevel[level-1], 'Error');
				      $rootScope.loadingState = false;
				      return;
				  }
				  node = node[nodePos].children;
			      }
			      $scope.showInstance($item);
			  }
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.findAllInstanceByLevel = function(arr, level){
	var ans = [];
	for(var i=0;i<arr.length;i++){
	    var instance = arr[i];
	    if(instance['level'] == level)
		ans.push(instance);
	}
	return ans;
    };



    $scope.showInstance = function($item, callback){

	var myLevel = $item.instance.split("/");
	node = $scope.data.chart;
	var foundNode;
	for(var level = 1; level < myLevel.length+1 ; level++){

	    //find current node,,, and append to children
	    var nodePos = -1;
	    for(var i = 0; i < node.length ; i++){
		if(node[i].name == myLevel[level-1]){
		    nodePos=i;
		    node[i].show = true;
		    foundNode = node[i];
		    break;
		}
	    }

	    node = node[nodePos].children;
	}

	setTimeout(function(){var myElement = document.getElementById("block-"+$item._id);
	var topPos = myElement.offsetTop;
	document.getElementById('treeHier').scrollTop = topPos - document.getElementById('treeHier').offsetTop;
	},500);

	$scope.changeSelectedNode(foundNode);
	if(callback)callback();
    }







    $scope.projectSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){$scope.data.selectedCore = ""; $scope.data.selectedRelease=""; $scope.updateCoreList([]); $scope.updateReleaseList([]); return;}

      $rootScope.loadingState = true;
      $scope.data.projectCoreReleases=[];$scope.data.projectCores=[];
      httpService.get('area/' + $scope.data.selectedProject + '/cores',{},
		      function(res){
			  $scope.data.selectedCore = "";
			  $scope.data.selectedRelease = "";
			  $scope.updateReleaseList([]);
			  $scope.updateCoreList(res.data); 
			  $rootScope.loadingState = false;


// 			  var core = $location.search().core; 
// 			  if(core){
// 			    $location.search().core = undefined;
// 			    $scope.data.selectedCore = core;
// 			    $scope.coreSelected();
// 			  }


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });


      $scope.showProjectFullChip = false;
      httpService.get('area/fullchip/' + $scope.data.selectedProject,{},
		      function(res){
			  $scope.data.projectFullchipCores = res.data.cores;
			  $scope.data.projectFullchipConfig = res.data.config;
		      },
		      function(msg, code){
			  console.log(msg);
		      });
    };


    $scope.coreSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){$scope.data.selectedCore = ""; $scope.data.selectedRelease=""; $scope.updateCoreList([]); $scope.updateReleaseList([]); return;}
      if(!$scope.data.selectedCore || $scope.data.selectedCore == ""){$scope.data.selectedRelease=""; $scope.updateReleaseList([]); return;}

      $rootScope.loadingState = true;
      $scope.data.projectCoreRTLS=[];
      httpService.get('area/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/rtls',{},
		      function(res){
			  $scope.data.selectedRtl = "";
			  $scope.updateRtlList(res.data); 
			  $rootScope.loadingState = false;

// 			  var rtl = $location.search().rtl; 
// 			  if(rtl){
// 			    $location.search().rtl = undefined;
// 			    $scope.data.selectedRtl = rtl;
// 			    $scope.rtlSelected();
// 			  }


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.rtlSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){$scope.data.selectedCore = ""; $scope.data.selectedRelease=""; $scope.updateCoreList([]); $scope.updateReleaseList([]); return;}
      if(!$scope.data.selectedCore || $scope.data.selectedCore == ""){$scope.data.selectedRelease=""; $scope.updateReleaseList([]); return;}

      $rootScope.loadingState = true;
      $scope.data.projectCoreReleases=[];
      httpService.get('area/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + $scope.data.selectedRtl + '/releases',{},
		      function(res){
			  $scope.data.selectedRelease = "";
			  $scope.updateReleaseList(res.data); 
			  $rootScope.loadingState = false;


// 			  var release = $location.search().release; 
// 			  if(release){
// 			    $location.search().release = undefined;
// 			    $scope.data.selectedRelease = release;
// 			    $scope.fetchAreaInfo();
// 			  }

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };



    $scope.fetchAreaInfo = function(){
//       if(!$scope.data.selectedProject || $scope.data.selectedProject == "") return;
//       if(!$scope.data.selectedCore || $scope.data.selectedCore == "") return;
//       if(!$scope.data.selectedRelease || $scope.data.selectedRelease == "") return;

      console.log("fetchAreaInfo");

	var release_id = "";
	if($scope.data.selectedReleaseType == "released"){
	    release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
	}
	if($scope.data.selectedReleaseType == "unreleased"){
	    release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
	}


      $rootScope.loadingState = true;
      $scope.data.showAreaInfo = false;
      $scope.data.cellDistInfo = undefined;
      $scope.data.cellMacroInfo = undefined;
      $scope.data.selectedNode = undefined;
      httpService.get('area/' + release_id ,{'parent': 'root',releaseType: $scope.data.selectedReleaseType},
		      function(res){
			  if((Array.isArray(res.data) && res.data.length == 0) || (Object.keys(res.data).length == 0)){
			      $scope.data.noDataInfo = true;
			      $rootScope.loadingState = false;
			      return;
			  }
			  $scope.data.noDataInfo = false;

			  $scope.data.chart = res.data;
			  $scope.data.fetchSelectedProject = $scope.data.selectedProject;
			  $scope.data.fetchSelectedCore = $scope.data.selectedCore;
			  $scope.data.fetchSelectedRtl = $scope.data.selectedRtl;
			  $scope.data.fetchSelectedRelease = $scope.data.selectedRelease;

			  if(!$scope.data.chart[0]['memory']){
			    $scope.data.chart[0]['memory'] = {};
			  }
			  if(!$scope.data.chart[0]['stdcell']){
			    $scope.data.chart[0]['stdcell'] = {};
			  }
			  if(!$scope.data.chart[0]['macro']){
			    $scope.data.chart[0]['macro'] = {};
			  }

			  $scope.data.coreMemTotal = $scope.getTotal($scope.data.chart[0]['memory'], 'area');
			  $scope.data.coreMacroTotal = $scope.data.chart[0]['macro']['area'];
			  $scope.data.coreStdTotal = $scope.getTotal($scope.data.chart[0]['stdcell'], 'area');
			  $scope.data.coreTotalArea = $scope.data.coreMemTotal + $scope.data.coreMacroTotal + $scope.data.coreStdTotal;

			  $scope.data.coreTotalKGates = $scope.data.chart[0]['total_std']['area'] / 1000 / ($scope.data.chart[0]['G_NAND_EQU_CELL']) ;


			  $scope.changeSelectedNode($scope.data.chart[0]);


			  $scope.data.compareMode = false;
			  $scope.data.showAreaInfo = true;
			  $rootScope.loadingState = false;

// 			  console.log(document.getElementById("treeHier"));
// 			  console.log(document.getElementById("content"));
// 			  var splitobj = Split(["#treeHier","#content"], {
// 			      elementStyle: function (dimension, size, gutterSize) { 
// 				  $(window).trigger('resize'); // Optional
// 				  return {'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'}
// 			      },
// 			      gutterStyle: function (dimension, gutterSize) { return {'flex-basis':  gutterSize + 'px'} },
// 			      sizes: [20,60,20],
// 			      minSize: 150,
// 			      gutterSize: 6,
// 			      cursor: 'col-resize'
// 			  });


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });


      $scope.data.cellMacroInfo = [];
      $scope.data.cellDistInfo = [];

      httpService.get('cellDist/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
		      function(res){
			  if((Array.isArray(res.data) && res.data.length == 0) || (Object.keys(res.data).length == 0)){
			      return;
			  }
			  if(res.data.length > 0){
			    $scope.data.cellDistInfo = res.data;
			    $scope.data.cellDistSummary = {};
			    var sumCount = 0;
			    var sumCellArea = 0;
			    var sumTotalArea = 0;

			    for(var i=0;i<$scope.data.cellDistInfo.length;i++){
			      $scope.data.cellDistInfo[i]["idx"] = i+1;
			      sumCount += $scope.data.cellDistInfo[i]["count"];
			      sumCellArea += $scope.data.cellDistInfo[i]["cell_area"];
			      sumTotalArea += $scope.data.cellDistInfo[i]["total_area"];
			    }
			    $scope.data.cellDistSummary["sumCount"] = sumCount;
			    $scope.data.cellDistSummary["sumCellArea"] = sumCellArea;
			    $scope.data.cellDistSummary["sumTotalArea"] = sumTotalArea;

			  }
		      },
		      function(msg, code){
			  console.log(msg);
		      });


      httpService.get('cellMacro/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
		      function(res){
			  if((Array.isArray(res.data) && res.data.length == 0) || (Object.keys(res.data).length == 0)){
			      return;
			  }
			  if(res.data.length > 0){
			    $scope.data.cellMacroInfo = res.data;

			  }
		      },
		      function(msg, code){
			  console.log(msg);
		      });




//     $scope.data.gridCellMacroOptions = {
//       enableSorting: true,
//       columnDefs: [
// 	{ name:' ', cellTemplate: 'rowIndex.html', width: 50 },
// 	{ name:'instance', field: 'instance' },
// 	{ name:'cell', field: 'type' },
// 	{ name:'area', field: 'area' }
//       ],
//       onRegisterApi: function(gridApi){ $scope.data.gridCellMacroApi = gridApi;},
//       data: $scope.data.cellMacroInfo
//     };

	
    }

    $scope.showDistModal = function(){
      $scope.data.gridCellDistOptions.data = $scope.data.cellDistInfo;

      $scope.data.showCellDistModal = true;
      setTimeout( function() {
	$scope.data.gridApi.core.handleWindowResize();
      }, 10, 500);

    }

    $scope.showCellMacroModal = function(type){
      var dat = [];
      var counter = 1;
      $scope.data.cellMacroSummary = {};
      var sumTotalArea = 0;
      console.log(type);
      for(var i=0;i<$scope.data.cellMacroInfo.length;i++){
	if(!$scope.data.cellMacroInfo[i]["type"] || $scope.data.cellMacroInfo[i]["type"] == ""){
	  $scope.data.cellMacroInfo[i]["type"] = "macro"
	}
	if($scope.data.cellMacroInfo[i]["type"] == type){
	  var temp = $scope.data.cellMacroInfo[i];
	  sumTotalArea += temp["area"];

	  temp["idx"] = counter;
	  dat.push(temp)
// 	  $scope.data.cellMacroInfo[i]["idx"] = counter;
	  counter++;
	}
      }
      $scope.data.cellMacroSummary["sumTotalArea"] = sumTotalArea;
      $scope.data.gridCellMacroOptions.data = dat;

      $scope.data.showCellMacroModal = true;
      setTimeout( function() {
	$scope.data.gridCellMacroApi.core.handleWindowResize();
      }, 10, 500);



    }



    $scope.compareReleases = function(instance, customProject, customCore){

      $rootScope.loadingState = true;

      var core;
      var project;
      if(!customCore){
	  $scope.data.showCompareReleasesModal = false;

	  $scope.data.chartReleases = [];
	  $scope.data.chartSeries = ['stdcell', 'memory', 'macro'];
	  $scope.data.releasesData = [];

	  $scope.data.selectedCompareUnit = $scope.data.compareUnits[0];

	  $scope.data.chartAllReleasesLabels = [];
	  $scope.data.chartAllReleases = [];
	  $scope.data.chartAllReleasesData = [[],[],[]];

	  var compareInstace = 'root';
	  if(instance){
	      compareInstace=instance;
	  }
	  $scope.data.compareInstance = compareInstace;

	  project = $scope.data.selectedProject;
	  if($scope.data.selectedReleaseType == "released"){
	      core = $scope.data.selectedCore;
	  }
	  if($scope.data.selectedReleaseType == "unreleased"){
	      core = $scope.data.selectedUnit;
	  }
      }else{
	project = customProject;
	core = customCore;
	compareInstace = instance;
      }
      var isCustom = false;
      if(customCore) isCustom = true;

      httpService.get('area/' + project + '/' + core + '/compare' ,{'instance': compareInstace,releaseType: $scope.data.selectedReleaseType, 'isCustom': isCustom},
		      function(res){
			  var fetchedReleases = res.data;
			  if(!customProject){
			    $scope.data.compareProjects = [$scope.data.selectedProject];
			  }

			  for(var i=0;i<fetchedReleases.length;i++){
			      var release = fetchedReleases[i];
			      var temp;
			      if($scope.data.selectedReleaseType == "released"){
				  temp = {'name':release['release_name'], 'project':release['project'], 'info': release};
			      }
			      if($scope.data.selectedReleaseType == "unreleased"){
				  temp = {'name':release['run_id']+"_"+release['date'], 'project':release['project'], 'info': release};
			      }

			      if(release['project'] == $scope.data.selectedProject) temp['selected'] = true;
			      $scope.data.chartAllReleasesLabels.push(temp);
			      
			      if($scope.data.compareProjects.indexOf(release['project']) == -1){
				  $scope.data.compareProjects.push(release['project']);
			      }
			  }
			  if(!customCore){
			    $scope.data.chartReleases = $scope.data.chartAllReleasesLabels.map(a => a.name);
			    $scope.data.releasesData = $scope.data.chartAllReleasesData;
			  }else{
			      var tmp1 = $scope.data.chartAllReleasesLabels.map(a => a.name);
			      var tmp2 = $scope.data.chartAllReleasesData;
			      $scope.data.chartReleases.concat(tmp1);
			      $scope.data.releasesData.concat(tmp2);
			  }
			  $scope.reDrawReleaseGraph();


			  if(!customCore){
			    $scope.data.chartSelectAllReleases = true;

			    $scope.data.showCompareReleasesModal = true;

			    $scope.fetchProjectListToCompare();
			  }

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });


    };

    $scope.chartAllReleasesLabelsByProject = function(project){
	var list = [];
	for(var i=0;i<$scope.data.chartAllReleasesLabels.length;i++){
	    if($scope.data.chartAllReleasesLabels[i]['project'] == project){
		list.push($scope.data.chartAllReleasesLabels[i]);
	    }
	}
	return list;
    }

    $scope.fetchProjectListToCompare = function(){

	httpService.get('synthizes/init_info', {releaseType: $scope.data.selectedReleaseType}, function(res){
	    $scope.data.compareProjectsList = res.data;
	}, function(msg, code){console.log(msg); })

    }

    $scope.compareProjectSelected = function(){

      if($scope.data.selectedReleaseType == "unreleased"){
	httpService.get('synthizes/' + $scope.data.selectedCompareProject + '/units', {}, function(res){
	    $scope.data.compareCoresList = res.data;
	}, function(msg, code){console.log(msg); })
      }
      if($scope.data.selectedReleaseType == "released"){
	httpService.get('synthizes/' + $scope.data.selectedCompareProject + '/cores', {}, function(res){
	    $scope.data.compareCoresList = res.data;
	}, function(msg, code){console.log(msg); })
      }
    }
    
    $scope.addCustomToCompare = function(){
      
      $scope.compareReleases($scope.data.compareInstance, $scope.data.selectedCompareProject, $scope.data.selectedCompareCore);
    }

    $scope.reDrawReleaseGraph = function(){
	var pos = $("#area_compare_releases_modal").scrollTop();
	console.log(pos);

	$scope.data.chartReleases = [];
	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[0]){
	    $scope.data.chartSeries = ['stdcell', 'memory'];
	    $scope.data.releasesData = [[],[]];
	}
	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[1]){
	    $scope.data.chartSeries = ['stdcell', 'memory', 'macro'];
	    $scope.data.releasesData = [[],[],[]];
	}
	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[2]){
	    $scope.data.chartSeries = ['stdcell', 'macro'];
	    $scope.data.releasesData = [[],[]];
	}
	for(var i=0;i<$scope.data.chartAllReleasesLabels.length;i++){
	    var release = $scope.data.chartAllReleasesLabels[i];
	    if(release['selected']){
		$scope.data.chartReleases.push(release['project']+'_'+release['name']);
		$scope.prepareCompareData(release);
	    }
	}

	$("#area_compare_releases_modal").scrollTop(pos);
	var elmnt = document.getElementById("area_compare_releases_modal");
	setTimeout(function() {
	    elmnt.scrollTop = pos;
	}, 100);
    }


    $scope.prepareCompareData = function(release){
	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[0]){
	  var stdcellGateSum = 0;
	  for (var key in release['info']['stdcell']) {
	    stdcellGateSum += release['info']['stdcell'][key]['area'] / 1000 / release['info'].G_NAND_EQU_CELL;
	  }
	  var memKBSum = 0;
	  for (var key in release['info']['memory']) {
	    memKBSum += release['info']['memory'][key]['KB'];
	  }
	  $scope.data.releasesData[0].push(stdcellGateSum);
	  $scope.data.releasesData[1].push(memKBSum);
	}    
	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[1]){
	  $scope.data.releasesData[0].push(release['info']['total_std']['area']);
	  $scope.data.releasesData[1].push(release['info']['total_memory']['area']);
	  $scope.data.releasesData[2].push(release['info']['macro']['area']);
	}
	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[2]){
	  var stdcellCountSum = 0;
	  for (var key in release['info']['stdcell']) {
	    stdcellCountSum += release['info']['stdcell'][key]['count'];
	  }
	  $scope.data.releasesData[0].push(stdcellCountSum);
	  $scope.data.releasesData[1].push(release['info']['macro']['count']);
	}
    }

    $scope.compareUnitChanged = function(){
      $scope.reDrawReleaseGraph();
    }


    $scope.toggleAdvanceCompareMode = function(){
      $scope.data.compareMode = !$scope.data.compareMode;
      if($scope.data.compareMode){
	$scope.showCompareModal();
      }else{
	
      }
    }


    $scope.showCompareModal = function(){

      $scope.data.advancedCompareInfo = {};
      $scope.data.advancedCompareReleases = [];

      var currRelease = {};
      currRelease['releaseType'] = $scope.data.selectedReleaseType;

      var release_id = "";
      if(currRelease['releaseType'] == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;

	  currRelease['project'] = $scope.data.selectedProject;
	  currRelease['core'] = $scope.data.selectedCore;
	  currRelease['rtl_name'] = $scope.data.selectedRtl;
	  currRelease['release_name'] = $scope.data.selectedRelease;
      }

      if(currRelease['releaseType'] == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;

	  currRelease['project'] = $scope.data.selectedProject;
	  currRelease['unit'] = $scope.data.selectedUnit;
	  currRelease['user'] = $scope.data.selectedUser;
	  currRelease['run_id'] = $scope.data.selectedRunid;
	  currRelease['stage'] = $scope.data.selectedStage;
	  currRelease['date'] = $scope.data.selectedDate;
      }
      
      currRelease['releaseId'] = release_id


      $scope.fetchAdvancedCompareUnits(currRelease, function(units, currRelease){
	  var rId = currRelease['releaseId'];
	  $scope.data.advancedCompareInfo[rId] = units;
	  $scope.data.advancedCompareReleases.push(currRelease);
      });
    };

    $scope.fetchAdvancedCompareUnits = function(releaseQuery, callback){
      $rootScope.loadingState = true;
      httpService.get('area/selfAndchildrenInfo/' + releaseQuery['releaseId'],{'parent': $scope.data.selectedNode.instance, releaseType: releaseQuery['releaseType']},
		      function(res){
			  var units = {};
// 			  units[$scope.data.selectedNode.instance] = $scope.data.selectedNode;
			  for(var i=0;i<res.data.length;i++){
			    var tmpNode = {};
			    var unitInstance = res.data[i].instance;
			    units[unitInstance] = res.data[i];
			  }
			  $rootScope.loadingState = false;
			  callback(units, releaseQuery);
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };


    $scope.fetchUnitsToCompare = function(){
      for(var i=0;i<$scope.data.advancedCompareReleases.length;i++){
	var currRelease = $scope.data.advancedCompareReleases[i];
	console.log(currRelease);

	$scope.fetchAdvancedCompareUnits(currRelease, function(units, currRelease){
	    var rId = currRelease['releaseId'];
	    $scope.data.advancedCompareInfo[rId] = units;
	    console.log($scope.data.advancedCompareInfo);
	});
      }
    };


    $scope.addReleaseToAdvancedCompare = function(){
      
      var currRelease = {};
      currRelease['releaseType'] = $scope.data.advancedCompareReleaseType;

      var release_id = "";
      if(currRelease['releaseType'] == "released"){
	  release_id = $scope.data.advancedCompareSelectedProject + '|' + $scope.data.advancedCompareSelectedCore + '|' + $scope.data.advancedCompareSelectedRtl + '|' + $scope.data.advancedCompareSelectedRelease;

	  currRelease['project'] = $scope.data.advancedCompareSelectedProject;
	  currRelease['core'] = $scope.data.advancedCompareSelectedCore;
	  currRelease['rtl_name'] = $scope.data.advancedCompareSelectedRtl;
	  currRelease['release_name'] = $scope.data.advancedCompareSelectedRelease;
      }

      if(currRelease['releaseType'] == "unreleased"){
	  release_id = $scope.data.advancedCompareSelectedProject + '|' + $scope.data.advancedCompareSelectedUnit + '|' + $scope.data.advancedCompareSelectedUser + '|' + $scope.data.advancedCompareSelectedRunid + '|' + $scope.data.advancedCompareSelectedStage + '|' + $scope.data.advancedCompareSelectedDate;

	  currRelease['project'] = $scope.data.advancedCompareSelectedProject;
	  currRelease['unit'] = $scope.data.advancedCompareSelectedUnit;
	  currRelease['user'] = $scope.data.advancedCompareSelectedUser;
	  currRelease['run_id'] = $scope.data.advancedCompareSelectedRunid;
	  currRelease['stage'] = $scope.data.advancedCompareSelectedStage;
	  currRelease['date'] = $scope.data.advancedCompareSelectedDate;
      }
      
      currRelease['releaseId'] = release_id


      $scope.fetchAdvancedCompareUnits(currRelease, function(units, currRelease){
	  var rId = currRelease['releaseId'];
	  $scope.data.advancedCompareInfo[rId] = units;
	  $scope.data.advancedCompareReleases.push(currRelease);
      });
      


    };


    $scope.getUnitNodePercantageCompare = function(node, cRelease, bRelease){

	if($scope.data.advancedCompareSelectedMode == "KB"){
	  if(!$scope.data.advancedCompareInfo[cRelease.releaseId][node.instance] || !$scope.data.advancedCompareInfo[cRelease.releaseId][node.instance]['total_memory']){
	    return {"sign": "+", "str": "0"};
	  }
	  if(!$scope.data.advancedCompareInfo[bRelease.releaseId][node.instance] || !$scope.data.advancedCompareInfo[bRelease.releaseId][node.instance]['total_memory']){
	    return {"sign": "+", "str": "0"};
	  }
	  var cValue = $scope.data.advancedCompareInfo[cRelease.releaseId][node.instance]['total_memory'].KB;
	  var bValue = $scope.data.advancedCompareInfo[bRelease.releaseId][node.instance]['total_memory'].KB;
	}else{
	  if(!$scope.data.advancedCompareInfo[cRelease.releaseId][node.instance] || !$scope.data.advancedCompareInfo[cRelease.releaseId][node.instance]['total_std']){
	    return {"sign": "+", "str": "0"};
	  }
	  if(!$scope.data.advancedCompareInfo[bRelease.releaseId][node.instance] || !$scope.data.advancedCompareInfo[bRelease.releaseId][node.instance]['total_std']){
	    return {"sign": "+", "str": "0"};
	  }
	  var cValue = $scope.data.advancedCompareInfo[cRelease.releaseId][node.instance]['total_std'].area / 1000 / ($scope.data.advancedCompareInfo[cRelease.releaseId][node.instance].G_NAND_EQU_CELL);
	  var bValue = $scope.data.advancedCompareInfo[bRelease.releaseId][node.instance]['total_std'].area / 1000 / ($scope.data.advancedCompareInfo[bRelease.releaseId][node.instance].G_NAND_EQU_CELL);
	}
	var diff = (bValue - cValue).toFixed(1);
	var sign = cValue/bValue;
	var signStr = "";
	if(sign<1){
	  signStr = "-";
	}else{
	  signStr = "+";
	}

	var value = Math.abs(cValue/bValue -1) * 100;

	var res = {'sign': signStr, 'str':  signStr +Math.abs(diff) + " (" + signStr +value.toFixed(1)+"%)"};

	return res;
    }


    $scope.getUnitNodeCompareColor = function(node, release_id){
      if($scope.data.advancedCompareReleases.length == 0) return;


      var nodeName = node.name;
      if($scope.data.selectedNode.name == nodeName){
	return {"background-color": "transparent"};
      }

      if($scope.data.advancedCompareSelectedMode == "KB"){
	if(!$scope.data.advancedCompareInfo[release_id][node.instance] || !$scope.data.advancedCompareInfo[release_id][node.instance]['total_memory']){
	  return {"background-color": "transparent"};
	}

	var curValue = $scope.data.advancedCompareInfo[release_id][node.instance]['total_memory'].KB;
      }else{
	if(!$scope.data.advancedCompareInfo[release_id][node.instance] || !$scope.data.advancedCompareInfo[release_id][node.instance]['total_std']){
	  return {"background-color": "transparent"};
	}

	var curValue = $scope.data.advancedCompareInfo[release_id][node.instance]['total_std'].area / 1000 / ($scope.data.advancedCompareInfo[release_id][node.instance].G_NAND_EQU_CELL);
      }


      var max = Number.NEGATIVE_INFINITY;
      var min = Number.POSITIVE_INFINITY;

      for(var i=0;i<$scope.data.selectedNode.allChildren.length;i++){
	var currNode = $scope.data.selectedNode.allChildren[i];
	if(currNode.instance != $scope.data.selectedNode.instance){

	  if($scope.data.advancedCompareSelectedMode == "KB"){
	    var checkValue = $scope.data.advancedCompareInfo[release_id][currNode.instance]['total_memory'].KB;
	  }else{
	    var checkValue = $scope.data.advancedCompareInfo[release_id][currNode.instance]['total_std'].area / 1000 / ($scope.data.advancedCompareInfo[release_id][currNode.instance].G_NAND_EQU_CELL);
	  }

	  if(checkValue > max){
	    max = checkValue;
	  }
	  if(checkValue < min){
	    min = checkValue;
	  }
	}
      }

      var bgcolor = getColorForValue(curValue, max, min);
      return {"background-color": bgcolor};
    };



    $scope.advancedCompareReleaseTypeSelected = function(){
	if($scope.data.advancedCompareReleaseType != "unreleased" && $scope.data.advancedCompareReleaseType != "released") return;

	synthizesAPI.projects($scope.data.advancedCompareReleaseType, function(res){
	    $scope.data.advancedCompareProjects = res.data;

	});

    }

    $scope.advancedCompareProjectSelected = function(){

      if($scope.data.advancedCompareReleaseType == "unreleased"){
	synthizesAPI.units($scope.data.advancedCompareSelectedProject, function(res){
	    $scope.data.advancedCompareProjectUnits = res.data;
	})
      }
      if($scope.data.advancedCompareReleaseType == "released"){
	synthizesAPI.cores($scope.data.advancedCompareSelectedProject, function(res){
	    $scope.data.advancedCompareProjectCores = res.data;
	})
      }
    }




    $scope.advancedCompareUnitSelected = function(){


	synthizesAPI.users($scope.data.advancedCompareSelectedProject, $scope.data.advancedCompareSelectedUnit , function(res){
	    $scope.data.advancedCompareProjectUsers = res.data;

	})
    }

    $scope.advancedCompareUserSelected = function(){

	synthizesAPI.runids($scope.data.advancedCompareSelectedProject, $scope.data.advancedCompareSelectedUnit, $scope.data.advancedCompareSelectedUser, function(res){
	    $scope.data.advancedCompareProjectRunids = res.data;

	})
    }

    $scope.advancedCompareRunidSelected = function(){

	synthizesAPI.stages($scope.data.advancedCompareSelectedProject, $scope.data.advancedCompareSelectedUnit, $scope.data.advancedCompareSelectedUser, $scope.data.advancedCompareSelectedRunid, function(res){
	    $scope.data.advancedCompareProjectStages = res.data;

	})
    }

    $scope.advancedCompareStageSelected = function(){
	if(!$scope.data.selectedStage) return;

	synthizesAPI.dates($scope.data.advancedCompareSelectedProject, $scope.data.advancedCompareSelectedUnit, $scope.data.advancedCompareSelectedUser, $scope.data.advancedCompareSelectedRunid, $scope.data.advancedCompareSelectedStage, function(res){
	    $scope.data.advancedCompareProjectDates = res.data;


	})
    }


    $scope.advancedCompareCoreSelected = function(){

      synthizesAPI.rtls($scope.data.advancedCompareSelectedProject, $scope.data.advancedCompareSelectedCore,
		      function(res){
			  $scope.data.advancedCompareProjectCoreRTLS = res.data;

		      });
    };

    $scope.advancedCompareRtlSelected = function(){

      synthizesAPI.releases($scope.data.advancedCompareSelectedProject, $scope.data.advancedCompareSelectedCore, $scope.data.advancedCompareSelectedRtl,
		      function(res){
			  $scope.data.advancedCompareProjectCoreReleases = res.data;

		      });
    };




    $scope.compare_UserSelected = function(idx){
      $rootScope.loadingState = true;
      $scope.data.compareProjectRunIds=[];

      httpService.get('synthizes/' + $scope.data.fetchSelectedProject + '/' + $scope.data.fetchSelectedUnit + '/' + $scope.data.compareRunIds[idx].selectedUser + '/runids', {}, function(res){

	  $scope.data.compareRunIds[idx].selectedRunid = "";
	  $scope.data.compareRunIds[idx].possibleRunIds = res.data; 

      }, function(msg, code){console.log(msg); })
    };



    $scope.toggleAllReleasesChart = function() {
        $scope.data.chartSelectAllReleases = !$scope.data.chartSelectAllReleases;
        angular.forEach($scope.data.chartAllReleasesLabels, function(label){
            label['selected'] = $scope.data.chartSelectAllReleases;
        });
	$scope.reDrawReleaseGraph();
    };


    $scope.toggleRelease = function(){
	var count = 0;
	for(var i=0;i<$scope.data.chartAllReleasesLabels.length;i++){
	    if(!$scope.data.chartAllReleasesLabels[i]['selected']){
		count++;
	    }
	}
	if(count == 0){
	    $scope.data.chartSelectAllReleases = true;
	}else{
	    $scope.data.chartSelectAllReleases = false;
	}
	
	$scope.reDrawReleaseGraph();
    }
    

//     $scope.updateCoreList = function(info){
// 	$scope.data.projectCores = info;
// 	$timeout(function() {
// 	    $('.areaCoreSelectpicker').selectpicker('refresh');
// 	});
//     };
//     $scope.updateReleaseList = function(info){
// 	$scope.data.projectCoreReleases = info;
// 	$timeout(function() {
// 	    $('.areaReleaseSelectpicker').selectpicker('refresh');
// 	});
//     };
// 
//     $scope.updateRtlList = function(info){
// 	$scope.data.projectCoreRTLS = info;
// 	$timeout(function() {
// 	    $('.areaRtlSelectpicker').selectpicker('refresh');
// 	});
//     };



    $scope.getTotal = function(obj, field){
      if(!obj) return 0;
      var total = 0;
      var keys = Object.keys(obj);
      for(var i=0;i<keys.length;i++){
	var k = keys[i];
	total += obj[k][field];
      }
      return total;
    };

    function sliderOnChange(sliderId, modelValue, highValue, pointerType){
      $scope.updatePieChart();
      $scope.updateBlockTotal();
    };


    $scope.updatePieChart = function(){
      if(!$scope.data.selectedNode) return;

      $scope.data.pieLabels = [];
      $scope.data.pieValues = [];
      
      $scope.data.pieLabels.push('memory');
      $scope.data.pieValues.push($scope.getTotal($scope.data.selectedNode['memory'], 'area') / ($scope.data.memPercent /100) );
      $scope.data.pieLabels.push('macro');
      $scope.data.pieValues.push($scope.data.selectedNode['macro']['area']);
      $scope.data.pieLabels.push('stdcell');
      $scope.data.pieValues.push($scope.getTotal($scope.data.selectedNode['stdcell'], 'area') / ($scope.data.stdPercent /100) );
    };
    $scope.updatePieChart();


    $scope.updateBlockPercent = function(){
	var coreTotal = $scope.data.coreMemTotal + $scope.data.coreMacroTotal + $scope.data.coreStdTotal;

	if(coreTotal == 0) return 0;

	var currNodeTotal = $scope.getTotal($scope.data.selectedNode['memory'], 'area')  / ($scope.data.memPercent /100);
	currNodeTotal += $scope.data.selectedNode['macro']['area'];
	currNodeTotal += $scope.getTotal($scope.data.selectedNode['stdcell'], 'area')  / ($scope.data.stdPercent /100);

	$scope.data.currNodeTotalPercent = (currNodeTotal/coreTotal) * 100;
    };


    $scope.updateBlockTotal = function(){
	var currNodeTotal = $scope.getTotal($scope.data.selectedNode['memory'], 'area')  / ($scope.data.memPercent /100);
	currNodeTotal += $scope.data.selectedNode['macro']['area'];
	currNodeTotal += $scope.getTotal($scope.data.selectedNode['stdcell'], 'area')  / ($scope.data.stdPercent /100);

	$scope.data.currNodeTotal = currNodeTotal;
    };



    $scope.getAreaPercentage = function(node){
// 	var currNodeTotal = $scope.getTotal(node['memory'], 'area');
// 	currNodeTotal += node['macro']['area'];
// 	currNodeTotal += $scope.getTotal(node['stdcell'], 'area');

	var currNodeKgates = node['total_std']['area'] / 1000 / ($scope.data.chart[0]['G_NAND_EQU_CELL']) ;

	var percentage = (currNodeKgates/$scope.data.coreTotalKGates) * 100;
	var rounded = Math.round(percentage*100)/100;


// 	var percentage = (currNodeTotal/$scope.data.coreTotalArea) * 100;
// 	var rounded = Math.round(percentage*100)/100;

// 	$scope.data.coreTotalKGates = $scope.data.chart[0]['total_std']['area'] / 1000 / ($scope.data.chart[0]['G_NAND_EQU_CELL']) ;


	return {'value':rounded, 'style': {'width':rounded +'%'}};
    }



    $scope.updateHierarchyNodes = function(node){
	var allNodesHierarchy = [];
	var tNode = node;
	if(tNode.parent){
	  while(tNode.parent){
	      allNodesHierarchy.push(tNode.parent);
	      tNode = tNode.parent;
	  }
	}
	allNodesHierarchy.reverse();
	allNodesHierarchy.push(node);
	if(node.hasChild && node.children && node.children.length >0){
	  allNodesHierarchy = allNodesHierarchy.concat(node.children);
	}else{
	  return;
	}
	node.currentHierarchy = allNodesHierarchy;
    }


    $scope.getKgStdcellTotal = function(){
      var sum = 0;
      for(var i=0;i<$scope.data.projectFullchipConfig.order.length;i++){
	var order = $scope.data.projectFullchipConfig.order[i];
	for(var j=0;j<order.count;j++){
	   sum += $scope.data.projectFullchipCores[i].total_std.area / 1000 / ($scope.data.projectFullchipCores[i].G_NAND_EQU_CELL)
	}
      }
      return sum;
    }

    $scope.getKbMemoryTotal = function(){
      var sum = 0;
      for(var i=0;i<$scope.data.projectFullchipConfig.order.length;i++){
	var order = $scope.data.projectFullchipConfig.order[i];
	for(var j=0;j<order.count;j++){
	   sum += $scope.data.projectFullchipCores[i].total_memory.KB
	}
      }
      return sum;
    }

    $scope.getAreaMacroTotal = function(){
      var sum = 0;
      for(var i=0;i<$scope.data.projectFullchipConfig.order.length;i++){
	var order = $scope.data.projectFullchipConfig.order[i];
	for(var j=0;j<order.count;j++){
	   sum += $scope.data.projectFullchipCores[i].macro.area
	}
      }
      return sum;
    }


    $scope.hideProject = function(){
      if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedRtl && $scope.data.selectedRelease){
	  if(confirm('Are you sure you want to hide this release?')){
	      $scope.disableRequest("hide", "release", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: $scope.data.selectedRtl, release_name:$scope.data.selectedRelease});
	      return;
	  }
      }
      if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedRtl){
	  if(confirm('Are you sure you want to hide this rtl?')){
	      $scope.disableRequest("hide", "rtl", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: $scope.data.selectedRtl});
	      return;
	  }
      }
      if($scope.data.selectedProject && $scope.data.selectedCore){
	  if(confirm('Are you sure you want to hide this core?')){
	      $scope.disableRequest("hide", "core", {project:$scope.data.selectedProject, core: $scope.data.selectedCore});
	      return;
	  }
      }
      if($scope.data.selectedProject){
	  if(confirm('Are you sure you want to hide this project?')){
	      $scope.disableRequest("hide", "project", {project:$scope.data.selectedProject});
	      return;
	  }
      }
    }

    $scope.deleteProject = function(){
      if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedRtl && $scope.data.selectedRelease){
	  if(confirm('Are you sure you want to remove this release?')){
	      $scope.disableRequest("delete", "release", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: $scope.data.selectedRtl, release_name:$scope.data.selectedRelease});
	      return;
	  }
      }
      if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedRtl){
	  if(confirm('Are you sure you want to remove this rtl?')){
	      $scope.disableRequest("delete", "rtl", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: $scope.data.selectedRtl});
	      return;
	  }
      }
      if($scope.data.selectedProject && $scope.data.selectedCore){
	  if(confirm('Are you sure you want to remove this core?')){
	      $scope.disableRequest("delete", "core", {project:$scope.data.selectedProject, core: $scope.data.selectedCore});
	      return;
	  }
      }
      if($scope.data.selectedProject){
	  if(confirm('Are you sure you want to remove this project?')){
	      $scope.disableRequest("delete", "project", {project:$scope.data.selectedProject});
	      return;
	  }
      }      
    }


    $scope.disableRequest = function(disableType, disableLevel, info){
	httpService.get('area/'+disableType, {level: disableLevel, info: info}, function(res){
	    
	}, function(msg, code){
	      console.log(msg);
	})  
    }

    $scope.toggleTreeVisibility = function(flag){
      $scope.hideTree = flag;
    }



//     var project = $location.search().project; 
//     if(project){
//       $location.search().project = undefined;
//       $scope.data.selectedProject = project;
//       $scope.projectSelected();
//     }



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

	  $scope.fetchAreaInfo();
	}
    };


    if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showAreaInfo){
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




































