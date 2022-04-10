app.factory('leakageDataService', function ($q, $timeout, $rootScope, $location, httpService) {
	console.log('leakageDataService');




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




app.controller('leakageCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo) {
    $rootScope.mainClass = 'leakage-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;


    $scope.data.pieLabels = [];
    $scope.data.pieValues = [];
    $scope.data.pieOptions = {legend: {display: true}};



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


/*
    $timeout(function() {
	$('.leakageProjectSelectpicker').selectpicker('refresh');
    });
    $timeout(function() {
	$('.leakageCoreSelectpicker').selectpicker('refresh');
    });
    $timeout(function() {
	$('.leakageReleaseSelectpicker').selectpicker('refresh');
    });
    $timeout(function() {
	$('.leakageRtlSelectpicker').selectpicker('refresh');
    });*/



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

      $scope.updatePieChart();

      if(!$scope.data.selectedNode.currentHierarchy){
	$scope.updateHierarchyNodes($scope.data.selectedNode);
      }
    };


    $scope.getLeakagePercentage = function(node){
	var currNodeTotal = 0;

	for(var i=0;i<node['stdcell']['current'].length;i++){
	    currNodeTotal += node['stdcell']['current'][i]['value'];
	}


	var percentage = (currNodeTotal/$scope.data.coreTotalLeakage) * 100;
	var rounded = Math.round(percentage*100)/100;

	return {'value':rounded, 'style': {'width':rounded +'%'}};
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
      httpService.get('leakage/' + release_id,{'parent': node.instance, releaseType: $scope.data.selectedReleaseType},
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
	url: $rootScope.serverUrl + 'leakage/suggestions/' + release_id,
	params: {'instance':instance, releaseType: $scope.data.selectedReleaseType}
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
      httpService.get('leakage/tree/' + release_id,{'instance':$item.instance, releaseType: $scope.data.selectedReleaseType},
		      function(res){
			  if(res.data){
			      var myLevel = $item.instance.split("/");
			      node = $scope.data.chart;
			      for(var level = 1; level < myLevel.length+1 ; level++){
				  var allInstancesInLevel = $scope.findAllInstanceByLevel(res.data,level+1);
				  //find current node,,, and append to children
				  var nodePos = -1
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
      httpService.get('leakage/' + $scope.data.selectedProject + '/cores',{},
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


/*      $scope.showProjectFullChip = false;
      httpService.get('leakage/fullchip/' + $scope.data.selectedProject,{},
		      function(res){
			  $scope.data.projectFullchipCores = res.data.cores;
			  $scope.data.projectFullchipConfig = res.data.config;
		      },
		      function(msg, code){
			  console.log(msg);
		      });*/
    };


    $scope.coreSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){$scope.data.selectedCore = ""; $scope.data.selectedRelease=""; $scope.updateCoreList([]); $scope.updateReleaseList([]); return;}
      if(!$scope.data.selectedCore || $scope.data.selectedCore == ""){$scope.data.selectedRelease=""; $scope.updateReleaseList([]); return;}

      $rootScope.loadingState = true;
      $scope.data.projectCoreRTLS=[];
      httpService.get('leakage/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/rtls',{},
		      function(res){
			  $scope.data.selectedRtl = "";
			  $scope.updateRtlList(res.data); 
			  $rootScope.loadingState = false;

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
      httpService.get('leakage/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + $scope.data.selectedRtl + '/releases',{},
		      function(res){
			  $scope.data.selectedRelease = "";
			  $scope.updateReleaseList(res.data); 
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };


    $scope.fetchLeakageInfo = function(){
      console.log("fetchLeakageInfo");

      var release_id = "";
      if($scope.data.selectedReleaseType == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
      }


      $rootScope.loadingState = true;
      $scope.data.showLeakageInfo = false;
      $scope.data.selectedNode = undefined;
      httpService.get('leakage/' + release_id ,{'parent': 'root', releaseType: $scope.data.selectedReleaseType},
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

			  $scope.data.coreTotalLeakage = 0;

			  for(var i=0;i<$scope.data.chart[0]['stdcell']['current'].length;i++){
			      $scope.data.coreTotalLeakage += $scope.data.chart[0]['stdcell']['current'][i]['value'];
			  }
		
			  $scope.changeSelectedNode($scope.data.chart[0]);

			  $scope.data.showLeakageInfo = true;
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
	
    }

    $scope.compareReleases = function(instance){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == "") return;
      if(!$scope.data.selectedCore || $scope.data.selectedCore == "") return;

      $scope.data.showCompareReleasesModal = false;

      $scope.data.chartReleases = [];
      $scope.data.chartSeries = ['stdcell-total-leakage-current [uA]', 'memory-total-size [KB]'];
      $scope.data.releasesData = [];



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

      $rootScope.loadingState = true;
      httpService.get('leakage/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/compare' ,{'instance': compareInstace, releaseType: $scope.data.selectedReleaseType},
		      function(res){

			  var fetchedReleases = res.data;
// 			  if(!customProject){
// 			    $scope.data.compareProjects = [$scope.data.selectedProject];
// 			  }
			  $scope.data.compareProjects = [$scope.data.selectedProject];
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
// 			  if(!customCore){
			    $scope.data.chartReleases = $scope.data.chartAllReleasesLabels.map(a => a.name);
			    $scope.data.releasesData = $scope.data.chartAllReleasesData;
/*			  }else{
			      var tmp1 = $scope.data.chartAllReleasesLabels.map(a => a.name);
			      var tmp2 = $scope.data.chartAllReleasesData;
			      $scope.data.chartReleases.concat(tmp1);
			      $scope.data.releasesData.concat(tmp2);
			  }*/
			  $scope.reDrawReleaseGraph();


// 			  if(!customCore){
			    $scope.data.chartSelectAllReleases = true;

			    $scope.data.showCompareReleasesModal = true;

// 			    $scope.fetchProjectListToCompare();
// 			  }
			  $rootScope.loadingState = false;


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.reDrawReleaseGraph = function(){
	var pos = $("#leakage_compare_releases_modal").scrollTop();

	$scope.data.chartReleases = [];

	$scope.data.releasesData = [[],[]];

/*	if($scope.data.selectedCompareUnit == $scope.data.compareUnits[0]){
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
	}*/
	for(var i=0;i<$scope.data.chartAllReleasesLabels.length;i++){
	    var release = $scope.data.chartAllReleasesLabels[i];
	    if(release['selected']){
		$scope.data.chartReleases.push(release['name']);
		$scope.prepareCompareData(release);
	    }
	}

	$("#leakage_compare_releases_modal").scrollTop(pos);
	var elmnt = document.getElementById("leakage_compare_releases_modal");
	setTimeout(function() {
	    elmnt.scrollTop = pos;
	}, 100);
    }

    $scope.chartAllReleasesLabelsByProject = function(project){
	var list = [];
	for(var i=0;i<$scope.data.chartAllReleasesLabels.length;i++){
	    if($scope.data.chartAllReleasesLabels[i]['project'] == project){
		list.push($scope.data.chartAllReleasesLabels[i]);
	    }
	}
	return list;
    }

    $scope.prepareCompareData = function(release){
	var stdSum = 0;
	if(release['info']['stdcell'] && release['info']['stdcell']['current']){
	  for (var key in release['info']['stdcell']['current']) {
	    stdSum += release['info']['stdcell']['current'][key].value;
	  }
	}
	var memSum = 0;
	if(release['info']['memory'] && release['info']['memory']['size']){
	  for (var key in release['info']['memory']['size']) {
	    memSum += release['info']['memory']['size'][key].value;
	  }
	}
	$scope.data.releasesData[0].push(stdSum);
	$scope.data.releasesData[1].push(memSum);
    }

    $scope.compareUnitChanged = function(){
      $scope.reDrawReleaseGraph();
    }

//     $scope.toggleAllReleasesChart = function(){
// 	$scope.data.chartSelectAllReleases = !$scope.data.chartSelectAllReleases;
// 	for(var i=0;i<$scope.data.chartAllReleasesLabels.length;i++){
// 	    $scope.data.chartAllReleasesLabels[i]['selected'] = $scope.data.chartSelectAllReleases;
// 	}
// 	$scope.reDrawReleaseGraph();
//     }


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
// 	    $('.leakageCoreSelectpicker').selectpicker('refresh');
// 	});
//     };
//     $scope.updateReleaseList = function(info){
// 	$scope.data.projectCoreReleases = info;
// 	$timeout(function() {
// 	    $('.leakageReleaseSelectpicker').selectpicker('refresh');
// 	});
//     };
//     $scope.updateRtlList = function(info){
// 	$scope.data.projectCoreRTLS = info;
// 	$timeout(function() {
// 	    $('.leakageRtlSelectpicker').selectpicker('refresh');
// 	});
//     };


    function generateColors(arrayColors) {
	var colors = [];

	for (var i = 0, countColors = arrayColors.length; i < countColors; i++) {
	    var rgb = arrayColors[i];
	    colors.push({
		'fill': "false",
		'backgroundColor': "rgba(0,0,0,0)",
		'borderColor': "rgba(" + rgb + ",1)",
		'pointBackgroundColor': "rgba(" + rgb + ",1)",
		'pointHoverBackgroundColor': "rgba(" + rgb + ",0.8)",
		'pointBorderColor': "#fff",
		'pointHoverBorderColor': "rgba(" + rgb + ",1)",
	    });
	}
	return colors;
    }


    $scope.updatePieChart = function(){
      if(!$scope.data.selectedNode) return;
      $scope.data.pieLabels = [];
      $scope.data.pieValues = [];
      $scope.data.pieColors = [];

      var maxValue = -1;
      for(var i=0;i<$scope.data.selectedNode['stdcell']['size'].length;i++){
	  var vt = $scope.data.selectedNode['stdcell']['size'][i];
	  var vt2 = $scope.data.selectedNode['stdcell']['current'][i];
	  if(vt2['value'] != 0 && vt['value']/vt2['value'] > maxValue){
	      maxValue = vt['value']/vt2['value'];
	  }
      }
      var colors = [];
      for(var i=0;i<$scope.data.selectedNode['stdcell']['ratio'].length;i++){
	  var vt = $scope.data.selectedNode['stdcell']['size'][i];
	  var vt2 = $scope.data.selectedNode['stdcell']['current'][i];

	  var currValue = 0;
	  if(vt2['value'] != 0) currValue = vt['value']/vt2['value'];
	  if(currValue == 0){
	    colors.push("0, 0 , 0");
	  }else{
	    var greenValue = (currValue/maxValue) * 255;
	    var redValue = 0;
	    if(greenValue < 255/2){
	      redValue = 255 - greenValue/4;
	    }else{
	      redValue = 255 - greenValue;
	    }
	    colors.push(""+redValue+", "+greenValue+", "+greenValue/3+"");
	  }
      }

      $scope.data.pieColors = generateColors(colors);
      for(var i=0;i<$scope.data.selectedNode['stdcell']['ratio'].length;i++){
	var vt = $scope.data.selectedNode['stdcell']['ratio'][i];
	$scope.data.pieLabels.push(vt['type']);
	$scope.data.pieValues.push(vt['value']);
      }
    };
    $scope.updatePieChart();



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


    $scope.getMemorySizeValue = function(node, memType){
	if(!node || !memType) return -1;
	
	for(var i=0;i<node['memory']['size'].length;i++){
	    var n = node['memory']['size'][i];
	    if(n['type'] == memType) return n['value'];
	}
	return -1;
    }

    $scope.getMemoryModeSum = function(node, memType, mode){
	if(!node || !memType || !mode) return -1;
	var sum = 0;
	for(var i=0;i<node['memory']['current'].length;i++){
	    var n = node['memory']['current'][i];
	    if(n['type'] == memType && n['mode'] == mode) sum += n['value'];
	}
	return sum;
    }

    $scope.getMemorySizeTotalValue = function(node){
	if(!node) return -1;
	var total = 0;
        for(var i=0;i<node['mem_types'].length;i++){
	    var tt = node['mem_types'][i];
	    total += $scope.getMemorySizeValue(node, tt);
	}
	return total;
    }

    $scope.getMemoryModeTotalSum = function(node, mode){
	if(!node) return -1;
	var total = 0;
        for(var i=0;i<node['mem_types'].length;i++){
	    var tt = node['mem_types'][i];
	    total += $scope.getMemoryModeSum(node, tt, mode);
	}
	return total;
    }


    $scope.getStdSizeValue = function(node, memType){
	if(!node || !memType) return -1;
	
	for(var i=0;i<node['stdcell']['size'].length;i++){
	    var n = node['stdcell']['size'][i];
	    if(n['type'] == memType) return n['value'];
	}
	return -1;
    }

    $scope.getStdCurrentValue = function(node, stdType){
	if(!node || !stdType) return -1;
	
	for(var i=0;i<node['stdcell']['current'].length;i++){
	    var n = node['stdcell']['current'][i];
	    if(n['type'] == stdType) return n['value'];
	}
	return -1;
    }

    $scope.getStdRatioValue = function(node, memType){
	if(!node || !memType) return -1;
	
	for(var i=0;i<node['stdcell']['ratio'].length;i++){
	    var n = node['stdcell']['ratio'][i];
	    if(n['type'] == memType) return n['value'];
	}
	return -1;
    }



    $scope.getStdSizeTotalValue = function(node){
	if(!node) return -1;
	var total = 0;
        for(var i=0;i<node['stdcell_types'].length;i++){
	    var tt = node['stdcell_types'][i];
	    total += $scope.getStdSizeValue(node, tt);
	}
	return total;
    }

    $scope.getStdCurrentTotalValue = function(node){
	if(!node) return -1;
	var total = 0;
        for(var i=0;i<node['stdcell_types'].length;i++){
	    var tt = node['stdcell_types'][i];
	    total += $scope.getStdCurrentValue(node, tt);
	}
	return total;
    }



    $scope.showMemoryDetails = function(node){
      $scope.data.showMemoryBlockDetails = true;
      $scope.data.selectedNodeMemDetails = node;

      $scope.data.memoryModesEntity = [];
      for(var i=0;i<node['mem_modes'].length;i++){
	var temp = {'selected': true, 'name': node['mem_modes'][i]};
	$scope.data.memoryModesEntity.push(temp);
      }
      $scope.data.selectedModeDetails = $scope.data.memoryModesEntity[0]['name'];

      $scope.data.memoryTypesEntity = [];
      for(var i=0;i<node['mem_types'].length;i++){
	var temp = {'selected': true, 'name': node['mem_types'][i]};
	$scope.data.memoryTypesEntity.push(temp);
      }
      $scope.data.memoryTypesEntity.push({'selected': false, 'name': "total"});

      var unique = {};
      $scope.data.memoryRailsEntity = [];
      for( var i in node['memory']['current'] ){
	if(typeof(unique[node['memory']['current'][i]['rail']]) == "undefined"){
	  var temp = {'selected': true, 'name': node['memory']['current'][i]['rail']};
	  $scope.data.memoryRailsEntity.push(temp);
	}
      unique[node['memory']['current'][i]['rail']] = 0;
      }
      $scope.data.memoryRailsEntity.push({'selected': false, 'name': "total"});

      $scope.repopulateLeakageMemGraph(node);

    }

    

    $scope.memDetailsSelectionChanged = function(node, name, type){
      console.log("memDetailsSelectionChanged");
      console.log(node);
      console.log(type);
      console.log(name);
      if(type == 'type'){
	if(name == "total"){
	    var totalTypeSelected = false;
	    for(var i=0;i<$scope.data.memoryTypesEntity.length;i++){
	      var temp = $scope.data.memoryTypesEntity[i];
	      if(temp['name'] == "total" && temp['selected']){
		totalTypeSelected = true;
		break;
	      }
	    }
	    if(totalTypeSelected){
	      for(var i=0;i<$scope.data.memoryTypesEntity.length;i++){
		var temp = $scope.data.memoryTypesEntity[i];
		if(temp['name'] != "total"){
		  temp['selected'] = false;
		}
	      }
	    }else{
	      for(var i=0;i<$scope.data.memoryTypesEntity.length;i++){
		var temp = $scope.data.memoryTypesEntity[i];
		if(temp['name'] == "total"){
		  temp['selected'] = false;
		}
	      }
	    }
	}else{
	    for(var i=0;i<$scope.data.memoryTypesEntity.length;i++){
	      var temp = $scope.data.memoryTypesEntity[i];
	      if(temp['name'] == "total"){
		temp['selected'] = false;
	      }
	    }
	}
      }

      if(type == 'rail'){
	if(name == "total"){
	    var totalRailSelected = false;
	    for(var i=0;i<$scope.data.memoryRailsEntity.length;i++){
	      var temp = $scope.data.memoryRailsEntity[i];
	      if(temp['name'] == "total" && temp['selected']){
		totalRailSelected = true;
		break;
	      }
	    }
	    if(totalRailSelected){
	      for(var i=0;i<$scope.data.memoryRailsEntity.length;i++){
		var temp = $scope.data.memoryRailsEntity[i];
		if(temp['name'] != "total"){
		  temp['selected'] = false;
		}
	      }
	    }else{
	      for(var i=0;i<$scope.data.memoryRailsEntity.length;i++){
		var temp = $scope.data.memoryRailsEntity[i];
		if(temp['name'] == "total"){
		  temp['selected'] = false;
		}
	      }
	    }
	}else{
	    for(var i=0;i<$scope.data.memoryRailsEntity.length;i++){
	      var temp = $scope.data.memoryRailsEntity[i];
	      if(temp['name'] == "total"){
		temp['selected'] = false;
	      }
	    }
	}

      }
      
      $scope.repopulateLeakageMemGraph(node);
    }

    $scope.repopulateLeakageMemGraph = function(node){
      console.log("repopulateLeakageMemGraph");
      
      $scope.data.memDetailsChartSeriesRail = [];
      $scope.data.memDetailsChartLabelType = [];
      $scope.data.memDetailsChartData = [];

      var totalTypeSelected = false;
      for(var i=0;i<$scope.data.memoryTypesEntity.length;i++){
	var temp = $scope.data.memoryTypesEntity[i];
	if(temp['name'] == "total" && temp['selected']){
	  totalTypeSelected = true;
	  break;
	}
      }

      if(totalTypeSelected){
	$scope.data.memDetailsChartLabelType.push("all-types");
      }else{
	for(var i=0;i<$scope.data.memoryTypesEntity.length;i++){
	  var temp = $scope.data.memoryTypesEntity[i];
	  if(temp['selected']){
	    $scope.data.memDetailsChartLabelType.push(temp['name']);
	  }
	}
      }
      

      var totalRailSelected = false;
      for(var i=0;i<$scope.data.memoryRailsEntity.length;i++){
	var temp = $scope.data.memoryRailsEntity[i];
	if(temp['name'] == "total" && temp['selected']){
	  totalRailSelected = true;
	  break;
	}
      }

      if(totalRailSelected){
	$scope.data.memDetailsChartSeriesRail.push("all-rails");
      }else{
	for(var i=0;i<$scope.data.memoryRailsEntity.length;i++){
	  var temp = $scope.data.memoryRailsEntity[i];
	  if(temp['selected']){
	    $scope.data.memDetailsChartSeriesRail.push(temp['name']);
	  }
	}
      }

      if($scope.data.memDetailsChartLabelType[0] == "all-types"){
	  if($scope.data.memDetailsChartSeriesRail[0] == "all-rails"){
	      var sum = 0;
	      for(var i=0; i<node["memory"]['current'].length;i++){
		  var temp = node["memory"]['current'][i];
		  if(temp['mode'] == $scope.data.selectedModeDetails){
		      sum += temp['value'];
		  }
	      }
	      $scope.data.memDetailsChartData.push([sum]);
	  }else{
	      for(var j=0;j<$scope.data.memDetailsChartSeriesRail.length;j++){
		var tempRailsRes = [];
		var sum = 0;
		for(var i=0; i<node["memory"]['current'].length;i++){
		    var temp = node["memory"]['current'][i];
		    if(temp['mode'] == $scope.data.selectedModeDetails && temp['rail'] == $scope.data.memDetailsChartSeriesRail[j]){
			sum += temp['value'];
		    }
		}
		tempRailsRes.push(sum);
		$scope.data.memDetailsChartData.push(tempRailsRes);
	      }
	      
	  }
      }else{
	  if($scope.data.memDetailsChartSeriesRail[0] == "all-rails"){
	      var tempRailsRes = [];
	      for(var k=0;k<$scope.data.memDetailsChartLabelType.length;k++){
		var sum = 0;
		var tempTypeName = $scope.data.memDetailsChartLabelType[k];
		for(var i=0; i<node["memory"]['current'].length;i++){
		    var temp = node["memory"]['current'][i];
		    if(temp['mode'] == $scope.data.selectedModeDetails && temp['type'] == tempTypeName){
			sum += temp['value'];
		    }
		}
		tempRailsRes.push(sum);
	      }
	      $scope.data.memDetailsChartData.push(tempRailsRes);
	  }else{
	      for(var j=0;j<$scope.data.memDetailsChartSeriesRail.length;j++){
		var tempRailsRes = [];
		for(var k=0;k<$scope.data.memDetailsChartLabelType.length;k++){
		  var tempTypeName = $scope.data.memDetailsChartLabelType[k];
		  var sum = 0;
		  for(var i=0; i<node["memory"]['current'].length;i++){
		      var temp = node["memory"]['current'][i];
		      if(temp['mode'] == $scope.data.selectedModeDetails && temp['rail'] == $scope.data.memDetailsChartSeriesRail[j] && temp['type'] == tempTypeName){
			  sum += temp['value'];
		      }
		  }
		  tempRailsRes.push(sum);
		}
		$scope.data.memDetailsChartData.push(tempRailsRes);
	      }
	  }
      }

    };


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
	httpService.get('leakage/'+disableType, {level: disableLevel, info: info}, function(res){
	    
	}, function(msg, code){
	      console.log(msg);
	})  
    }


    $scope.toggleTreeVisibility = function(flag){
      $scope.hideTree = flag;
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

	  $scope.fetchLeakageInfo();
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


/*
    var project = $location.search().project; 
    if(project){
      $location.search().project = undefined;
      $scope.data.selectedProject = project;
      $scope.projectSelected();
    }*/

});




































