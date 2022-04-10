app.factory('powerDataService', function ($q, $timeout, $rootScope, $location, httpService) {
    console.log('powerDataService');


    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {
/*        $rootScope.loadingState = true;
        self.projects = [];
        self.pickedReleases = [];*/
	cb();
/*        async.series([
            function (callback) {
	      httpService.get('power/init_info', {}, function(res){self.projects = res.data; self.projectCoreReleases=[];self.projectCores=[]; callback();}, function(msg, code){console.log(msg);callback('error'); })
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




app.controller('powerCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location) {
    $rootScope.mainClass = 'power-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;

    $scope.data.prefix = "**pre_";

    $scope.data.pieOptions = {legend: {display: true}};
    $scope.data.pieLabels = [];
    $scope.data.pieValues = [];


    $scope.updatePicker = function(){
	$timeout(function() {
	    $('.powerSelectpicker').selectpicker('refresh');
	});
    };



/*    $scope.updatePicker = function(){
      $timeout(function() {
	  $('.powerProjectSelectpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerCoreSelectpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerRTLpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerClusterSelectpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerPrimitivepicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerReleaseTypeSelectpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerUnitSelectpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerTagSelectpicker').selectpicker('refresh');
      });
      $timeout(function() {
	  $('.powerRunIdsSelectpicker').selectpicker('refresh');
      });

    };*/
    $scope.updatePicker();



    $scope.releaseTypeSelected = function(){
	if($scope.data.releaseType != "unreleased" && $scope.data.releaseType != "released") return;

	$scope.backToIntial();
	$scope.data.projects = [];
	$scope.updatePicker();

	httpService.get('power/init_info', {releaseType: $scope.data.releaseType}, function(res){
	    $scope.data.projects = res.data;

	    $scope.data.selectedProject = "";
	    $scope.data.selectedCore = "";
	    $scope.data.selectedPrimitive = "";
	    $scope.data.selectedRTL = "";
	    $scope.data.projectCores = [];
	    $scope.data.projectClusters = [];
	    $scope.data.projectPrimitives = [];
	    $scope.data.projectRTLs = [];

	    $scope.data.selectedUnit = "";
	    $scope.data.selectedTag = "";
	    $scope.data.selectedRunId = "";
	    $scope.data.projectUnits = [];
	    $scope.data.projectTags = [];
	    $scope.data.projectRunIds = [];


	    $scope.updatePicker();

	    var project = $location.search().project; 
	    if(project){
	      $location.search().project = undefined;
	      if($scope.data.projects.indexOf(project) > -1){
		$scope.data.selectedProject = project;
		$scope.projectSelected();
	      }
	    }

	    $scope.updatePicker();


	}, function(msg, code){console.log(msg); })

    }

    $scope.projectSelected = function(){

      $scope.backToIntial();
      if($scope.data.releaseType == "released"){
	  $rootScope.loadingState = true;
	  $scope.updateCoreList([]); 
	  $scope.updatePicker();


	  httpService.get('power/' + $scope.data.selectedProject + '/cores',{},
			  function(res){
			      console.log(res.data);

			      $scope.updateCoreList(res.data); 
			      $rootScope.loadingState = false;

			      $scope.data.selectedCore = "";
			      $scope.data.selectedPrimitive = "";
			      $scope.data.selectedRTL = "";
			      $scope.data.projectClusters = [];
			      $scope.data.projectPrimitives = [];
			      $scope.data.projectRTLs = [];


			      $scope.updatePicker();

  
			      var core = $location.search().core; 
			      if(core){
				$location.search().core = undefined;
				if($scope.data.projectCores.indexOf(core) > -1){
				  $scope.data.selectedCore = core;
				  $scope.coreSelected();
				}

			      }


			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });
      }
      if($scope.data.releaseType == "unreleased"){
	  $rootScope.loadingState = true;
	  $scope.updateUnitList([]); 
	  $scope.updatePicker();

	  httpService.get('power/' + $scope.data.selectedProject + '/units',{},
			  function(res){

			      $scope.updateUnitList(res.data); 
			      $scope.data.selectedUnit = "";
			      $scope.data.selectedTag = "";
			      $scope.data.selectedRunId = "";
			      $scope.data.projectTags = [];
			      $scope.data.projectRunIds = [];


			      $scope.updatePicker();

			      $rootScope.loadingState = false;


			      var unit = $location.search().unit; 
			      if(unit){
				$location.search().unit = undefined;
				if($scope.data.projectUnits.indexOf(unit) > -1){
				  $scope.data.selectedUnit = unit;
				  $scope.unitSelected();
				}

			      }

			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });
      }



	  httpService.get('admin/' + $scope.data.selectedProject + '/fetch',{'info': 'power_configuration'},
			  function(res){
			    if(res.data && res.data.info){
			      $scope.data.projectPowerConfiguration = res.data.info;
			      $scope.data.projectPowerInfo = $scope.data.projectPowerConfiguration.projectPowerInfo;

			      for(var j=0;$scope.data.projectPowerConfiguration.checkers && j<$scope.data.projectPowerConfiguration.checkers.length;j++){
				var definedChecker = $scope.data.projectPowerConfiguration.checkers[j];
				var func = new Function(definedChecker.arguments, definedChecker.function);
				$scope.data.projectPowerConfiguration.checkers[j].run = func;
			      }
			    }

			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });


    };


    $scope.coreSelected = function(){
//       $scope.updateReleasesTypeList(); 


      $scope.backToIntial();
      $rootScope.loadingState = true;
      $scope.updateClusterList([]); 
      $scope.updatePicker();

      httpService.get('power/released/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/clusters',{},
		      function(res){
			  $scope.data.selectedCluster = "";
			  $scope.updateClusterList(res.data); 

			  $rootScope.loadingState = false;

			  $scope.data.selectedPrimitive = "";
			  $scope.data.selectedRTL = "";
			  $scope.data.projectPrimitives = [];
			  $scope.data.projectRTLs = [];


			  $scope.updatePicker();



			  var cluster = $location.search().cluster; 
			  if(cluster){
			    $location.search().cluster = undefined;
			    if($scope.data.projectClusters.indexOf(cluster) > -1){
			      $scope.data.selectedCluster = cluster;
			      $scope.clusterSelected();
			    }

			  }


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    };


    $scope.unitSelected = function(){



      $scope.backToIntial();
      $rootScope.loadingState = true;
//       $scope.data.projectTags=[];
      $scope.updateTagList([]); 
      $scope.updatePicker();

      httpService.get('power/unreleased/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/tags',{},
		      function(res){
			  $scope.data.selectedTag = "";
			  $scope.updateTagList(res.data); 

// 			  $scope.data.selectedTag = "";
// 			  $scope.data.selectedRunId = "";
// 			  $scope.updatePicker();

			  $scope.data.selectedTag = "";
			  $scope.data.selectedRunId = "";
			  $scope.data.projectRunIds = [];


			  $scope.updatePicker();

			  $rootScope.loadingState = false;

			  var tag = $location.search().tag; 
			  if(tag){
			    $location.search().tag = undefined;
			    if($scope.data.projectTags.indexOf(tag) > -1){
			      $scope.data.selectedTag = tag;
			      $scope.tagSelected();
			    }

			  }



		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }


    $scope.tagSelected = function(){


//       $scope.data.selectedRunId = "";
//       $scope.updatePicker();


      $scope.backToIntial();
      $rootScope.loadingState = true;
//       $scope.data.projectRunIds=[];
      $scope.updateRunidsList([]); 
      $scope.updatePicker();

      $scope.data.selectedRunId = "";

      httpService.get('power/unreleased/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedTag + '/runids',{},
		      function(res){
			  $scope.updateRunidsList(res.data); 

			  $scope.updatePicker();


			  $rootScope.loadingState = false;



			  var run_id = $location.search().run_id; 
			  if(run_id){
			    $location.search().run_id = undefined;
			    if($scope.data.projectRunIds.indexOf(run_id) > -1){
			      $scope.data.selectedRunId = run_id;
			      $scope.fetchPowerHierarchy();
			    }
			  }


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }


    $scope.clusterSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){$scope.data.selectedCore = ""; return;}

      $scope.data.selectedPrimitive = "";
      $scope.data.selectedRTL = "";

//       $scope.updatePicker();


      $scope.backToIntial();

      $rootScope.loadingState = true;
      $scope.data.projectPrimitives=[];

      $scope.updatePrimitiveList([]); 
      $scope.updatePicker();

      httpService.get('power/released/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/'+ $scope.data.selectedCluster + '/primitives',{},
		      function(res){
// 			  $scope.data.selectedPrimitive = "";
			  $scope.updatePrimitiveList(res.data); 

			  $rootScope.loadingState = false;


			  $scope.data.selectedPrimitive = "";
			  $scope.data.selectedRTL = "";
			  $scope.data.projectRTLs = [];

			  $scope.updatePicker();


			  var primitive = $location.search().primitive; 
			  if(primitive){
			    $location.search().primitive = undefined;
			    if($scope.data.projectPrimitives.indexOf(primitive) > -1){
			      $scope.data.selectedPrimitive = primitive;
			      $scope.primitiveSelected();
			    }

			  }

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }

    $scope.primitiveSelected = function(){
      if(!$scope.data.selectedProject || $scope.data.selectedProject == ""){$scope.data.selectedCore = ""; return;}

      $scope.data.selectedRTL = "";

      $scope.updatePicker();

      $scope.backToIntial();

      $rootScope.loadingState = true;
//       $scope.data.projectRTLs=[];
      $scope.updateRtlList([]); 
      $scope.updatePicker();

      httpService.get('power/released/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/'+ $scope.data.selectedCluster + '/' + encodeURIComponent($scope.data.selectedPrimitive) +'/rtls',{},
		      function(res){

			  $scope.data.selectedRTL = "";
			  $scope.updateRtlList(res.data); 

			  $rootScope.loadingState = false;

			  $scope.data.selectedRTL = "";

			  $scope.updatePicker();


			  var release = $location.search().release; 
			  if(release){
			    $location.search().release = undefined;
			    if($scope.data.projectRTLs.indexOf(release) > -1){
			      $scope.data.selectedRTL = release;
			      $scope.fetchPowerHierarchy();
			    }

			  }


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }



//     $scope.createPower = function(){
//       $rootScope.loadingState = true;
// 
//       httpService.get('power/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/new',{},
// 		      function(res){
// 			  $scope.toggleStatus('new');
// 
// 			  $scope.data.premitives = res.data.primitives;
// 			  $scope.data.clusters = res.data.clusters;
// 			  $scope.data.premitivesInfo = [];
// 			  var temp = Array.apply(null, Array($scope.data.clusters.length)).map(Number.prototype.valueOf,0);
// 			  for(var j=0;j<$scope.data.premitives.length;j++){
// 			      $scope.data.premitivesInfo.push(temp.slice());
// 			  }
// 			  $scope.data.premitivesInfo[1][0] = 5;
// 			  console.log($scope.data.premitivesInfo);
// 			  $scope.data.showPrimitivesTable = true;
// 
// 			  $rootScope.loadingState = false;
// 		      },
// 		      function(msg, code){
// 			  console.log(msg);
// 			  $rootScope.loadingState = false;
// 		      });
//     };

    $scope.fetchPower = function(){
      $rootScope.loadingState = true;
      $scope.data.showPrimitivesTable = false;
      $scope.data.showPrimitiveInfo = false;
      httpService.get('power/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/clusters',{},
		      function(res){

			  $scope.toggleStatus('old');

			  $scope.data.fetchSelectedProject = $scope.data.selectedProject;
			  $scope.data.fetchSelectedCore = $scope.data.selectedCore;

			  $scope.data.summaryHierarchy = res.data;
			  $scope.data.summaryClusters = res.data.clusters;
			  $scope.data.summaryPrimitivesList = [];

			  for(var i=0;i<$scope.data.summaryClusters.length;i++){
			    var cluster = $scope.data.summaryClusters[i];
			    if(cluster && cluster.primitives){
			      for(var j=0;j<cluster.primitives.length;j++){
				  var primitive = cluster.primitives[j];
				  var primitiveName = primitive.name;
				  if($scope.data.summaryPrimitivesList.indexOf(primitiveName) == -1){
				      $scope.data.summaryPrimitivesList.push(primitiveName);
				  }
			      }
			    }
			  }
			  $scope.data.showPrimitivesTable = true;

			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };



    $scope.unitTargetProjectSelected = function(obj,selectedVal1){
      if(!selectedVal1){
	selectedVal1 = $scope.data.unitTargetSelectedProject;
      }
      $rootScope.loadingState = true;
      httpService.get('power/' + selectedVal1 + '/cores',{},
		      function(res){
			if(obj) obj.unitTargetProjectCores = res.data;
			else
			$scope.data.unitTargetProjectCores = res.data;

			$rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.unitTargetCoreSelected = function(obj,selectedVal1,selectedVal2){
      if(!selectedVal1){
	selectedVal1 = $scope.data.unitTargetSelectedProject;
      }
      if(!selectedVal2){
	selectedVal2 = $scope.data.unitTargetSelectedCore ;
      }

      $rootScope.loadingState = true;
      httpService.get('power/released/' + selectedVal1 + '/' + selectedVal2 + '/clusters',{},
		      function(res){
			if(obj) obj.unitTargetProjectClusters = res.data;
			else
			$scope.data.unitTargetProjectClusters = res.data;

			$rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.unitTargetClusterSelected = function(obj,selectedVal1,selectedVal2,selectedVal3){
      if(!selectedVal1){
	selectedVal1 = $scope.data.unitTargetSelectedProject;
      }
      if(!selectedVal2){
	selectedVal2 = $scope.data.unitTargetSelectedCore ;
      }
      if(!selectedVal3){
	selectedVal3 = $scope.data.unitTargetSelectedCluster ;
      }

      $rootScope.loadingState = true;
      httpService.get('power/released/' + selectedVal1 + '/' + selectedVal2 + '/' + selectedVal3 + '/primitives',{},
		      function(res){
			if(obj) obj.unitTargetProjectPrimitives = res.data;
			else
			$scope.data.unitTargetProjectPrimitives = res.data;

			$rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };


    $scope.unitTargetPrimitiveSelected = function(obj,selectedVal1,selectedVal2,selectedVal3,selectedVal4){
      if(!selectedVal1){
	selectedVal1 = $scope.data.unitTargetSelectedProject;
      }
      if(!selectedVal2){
	selectedVal2 = $scope.data.unitTargetSelectedCore ;
      }
      if(!selectedVal3){
	selectedVal3 = $scope.data.unitTargetSelectedCluster ;
      }
      if(!selectedVal4){
	selectedVal4 = $scope.data.unitTargetSelectedPrimitive ;
      }

      $rootScope.loadingState = true;
      httpService.get('power/released/' + selectedVal1 + '/' + selectedVal2 + '/' + selectedVal3 + '/' + encodeURIComponent(selectedVal4) +'/rtls',{},
		      function(res){
			if(obj) obj.unitTargetProjectRTLs = res.data;
			else
			$scope.data.unitTargetProjectRTLs = res.data;

			$rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };



    $scope.addSelectedTargetInfo = function(){

      var releaseQuery = $scope.data.unitTargetSelectedProject + '/' + $scope.data.unitTargetSelectedCore + '/' + $scope.data.unitTargetSelectedCluster + '/' + encodeURIComponent($scope.data.unitTargetSelectedPrimitive) + '/' + $scope.data.unitTargetSelectedRTL;

      $scope.fetchTargetInfo(releaseQuery, function(units){
	  $scope.data.unitsTargetInfo[releaseQuery] = units;
	  $scope.data.unitsTargetReleases.push({'releaseId': releaseQuery, 'core': $scope.data.unitTargetSelectedCore, 'cluster': $scope.data.unitTargetSelectedCluster, 'primitive': $scope.data.unitTargetSelectedPrimitive, 'rtl': $scope.data.unitTargetSelectedRTL});

      });
    }


    $scope.toggleToTargetInfo = function(){
      if(!$scope.data.powerModeOnTarget) return;

      $scope.data.unitsTargetInfo = {};
      $scope.data.unitsTargetReleases = [];

      var releaseQuery = $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + $scope.data.selectedCluster + '/' + encodeURIComponent($scope.data.selectedPrimitive) + '/' + $scope.data.selectedRTL;

      $scope.fetchTargetInfo(releaseQuery, function(units){
	  $scope.data.unitsTargetInfo[releaseQuery] = units;
	$scope.data.unitsTargetReleases.push({'releaseId': releaseQuery, 'core': $scope.data.selectedCore, 'cluster': $scope.data.selectedCluster, 'primitive': $scope.data.selectedPrimitive, 'rtl': $scope.data.selectedRTL});
      });
    }

    $scope.fetchTargetInfo = function(releaseQuery, callback){

      $rootScope.loadingState = true;
      httpService.get('power/' + releaseQuery + '/calculatedUnits',{},
		      function(res){
			  var units = res.data.units;
			  var allUnitsInstance = {};
			  var allUnitsCallback = {};
			  var rootUnit;
			  for(var i=0;i<units.length;i++){
			    if(units[i].level == 1){
			      rootUnit = units[i]; break;
			    }
			  }
			  rootUnit.children = [];
			  for(var i=0;i<units.length;i++){
			      for(var j=0;j<units.length;j++){
				var unit = units[j];
				var copiedUnit = JSON.parse(JSON.stringify(unit));
				allUnitsCallback[copiedUnit.instance] = copiedUnit;
				copiedUnit.children = [];
				copiedUnit.fetched = true;
				allUnitsInstance[copiedUnit.instance] = copiedUnit;
			      }

			      for(var j=0;j<units.length;j++){
				var unit = units[j];
				if(allUnitsInstance[unit.parentPath]){
				  var currChildUnit = allUnitsInstance[unit.instance];
				  allUnitsInstance[unit.parentPath].children.push(currChildUnit);
				}
			      }
			      for(var j=0;j<Object.keys(allUnitsInstance).length;j++){
				var key = Object.keys(allUnitsInstance)[j];
				var unit = allUnitsInstance[key];
				unit.show = false;
				if(!unit.children || unit.children.length == 0) unit.hasChild = false;
			      }
			  }
			  $scope.data.unitsChart = [allUnitsInstance[rootUnit.instance]];
			  console.log($scope.data.unitsChart);
			  $scope.changeSelectedNode($scope.data.unitsChart[0]);
			  $rootScope.loadingState = false;

			  callback(allUnitsCallback);
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    };


    $scope.findUnitInRun = function(runUnits, cInstance){
      var idx = -1;
      for(var i=0;i<runUnits.length;i++){
	if(runUnits[i].instance == cInstance) idx = i;
      }
      return idx;
    }

    $scope.parseCheckerArgument = function(psaudoArg, checker, currUnit, otherUnit, primitives){
	var args = [];
	var currPrimitive = currUnit.primitive;
	var otherPrimitive = otherUnit.primitive;
	
	var currCalculatedValue = currUnit.calculated_dynamic;
	var otherCalculatedValue = otherUnit.calculated_dynamic;

	for(var i=0;i<psaudoArg.length;i++){
	  var found = false;
	  var currArg = psaudoArg[i];
	  if(currArg == "currPrimitive"){
	    found = true;
	    args.push(currCalculatedValue);
	  }
	  if(currArg == "otherPrimitive"){
	    found = true;
	    args.push(otherCalculatedValue);
	  }
	  var splittedArgs = currArg.split(",");
	  if(splittedArgs[0] == "checker"){
	    if(splittedArgs[1] == "Multiplier"){
	      found = true;
	      args.push(checker.Multiplier);
	    }
	    if(splittedArgs[1] == "Adder"){
	      found = true;
	      args.push(checker.Adder);
	    }
	    if(splittedArgs[1] == "Inaccuracy"){
	      found = true;
	      args.push(checker.Inaccuracy);
	    }
	  }
	  if(splittedArgs[0] == "primitive"){
	    if(splittedArgs[1] == "curr"){
	      if(splittedArgs[2] == "BW"){
		for(var j=0;j<primitives.length;j++){
		  var primitiveInfo = primitives[j];
		  if(primitiveInfo.name == currPrimitive){
		    found = true;
		    args.push(primitiveInfo.meta.BW);
		    break;
		  }
		}
	      }
	    }
	    if(splittedArgs[1] == "other"){
	      if(splittedArgs[2] == "BW"){
		for(var j=0;j<primitives.length;j++){
		  var primitiveInfo = primitives[j];
		  if(primitiveInfo.name == otherPrimitive){
		    found = true;
		    args.push(primitiveInfo.meta.BW);
		    break;
		  }
		}
	      }
	    }
	  }
	  if(!found){
	    alert(currArg + " - not found");
	    return;
	  }
	}
	console.log(args);
	return args;
    }


    $scope.getCheckerRunResultKeys = function(checkRunResult, run){
      return Object.keys(checkRunResult[run]);
    }


    $scope.runChecker = function(runs, cInstance, checker, checkerDefination){
      var result = {};
      var runsKey = Object.keys(runs);
      for(var i=0;i<runsKey.length;i++){
	  var runCode = runsKey[i];
	  result[runCode] = {};
	  var runUnits = runs[runCode];

	  var unitIndx = $scope.findUnitInRun(runUnits, cInstance);

	  if(unitIndx!=-1){
	      var currUnit = runUnits[unitIndx];
	      result[runCode]['currUnit'] = currUnit;
	      for(var j=0;j<runsKey.length;j++){
		if(j!=i){
		  var otherRunCode = runsKey[j];
		  var currRunUnits = runs[otherRunCode];
		  var otherIndx = $scope.findUnitInRun(currRunUnits, cInstance);
		  if(otherIndx!=-1){
		      var otherUnit = currRunUnits[otherIndx];
/*		      console.log(checker);*/
// 		      console.log(checkerDefination);
// 		      console.log(cInstance);
		      var args = $scope.parseCheckerArgument(checkerDefination.argumentsDef, checker, currUnit, otherUnit, $scope.data.checkersCluster.primitives);
		      if(!args) continue;
// 		      var args = [currUnit.calculated_dynamic, otherUnit.calculated_dynamic, 1, 0, 600, 1, 1];
		      var res = checkerDefination.run.apply(this, args);
		      res.bPrimitive = currUnit.calculated_dynamic;
		      res.oPrimitive = otherUnit.calculated_dynamic;
		      result[runCode][otherRunCode] = res;
		  }
		}
	      }
	  }
      }
      return result;

//       for(var i=0;i<runsKey.length;i++){
// 	  var runCode = runsKey[i];
// 	  var runUnits = runs[runCode];
// 
// 	  var unitIndx = $scope.findUnitInRun(runUnits, cInstance);
// 
// 	  if(unitIndx!=-1){
// 	      var currUnit = runUnits[unitIndx];
// 	      for(var j=0;j<runsKey.length;j++){
// 		if(j!=i){
// 		  var currRunUnits = runs[runsKey[j]];	
// 		  var otherIndx = $scope.findUnitInRun(currRunUnits, cInstance);
// 		  if(otherIndx!=-1){
// 		      var otherUnit = runUnits[otherIndx];
// 		      console.log(currUnit.instance + " " + otherUnit.instance);
// 		      var args = [currUnit.calculated_dynamic, otherUnit.calculated_dynamic, 1, 0, 5, 1, 1];
// 		      console.log(checkerDefination.run.apply( this, args ));
// 		  }
// 		}
// 	      }
// 	  }
//       }

    }


    $scope.getPrimitiveMode = function(primitiveInfo, primitive){
      for(var i=0;i<primitiveInfo.length;i++){
// 	  console.log(primitiveInfo[i].name);
	if(primitiveInfo[i].name == primitive){
// 	  console.log(primitiveInfo[i].meta);
	  return primitiveInfo[i].meta.Mode;
	}
      }
    }

    $scope.getReleaseUnitsByPrimitiveMode = function(units, checkerPrimitiveMode){
      var answer = {};
      var unitReleaseKeys = Object.keys(units);
      for(var i=0;i<unitReleaseKeys.length;i++){
	var releaseKey = unitReleaseKeys[i];
	var releasePrimitive = units[releaseKey][0].primitive;
	var primitiveMode = $scope.getPrimitiveMode($scope.data.checkersCluster.primitives, releasePrimitive);
	if(primitiveMode && primitiveMode == checkerPrimitiveMode){
	    answer[releaseKey] = units[releaseKey];
	}
      }
      return answer;
    }


    $scope.openCheckersModal = function(){
      $scope.data.checkersCluster = undefined;

      if($scope.data.releaseType == "released"){
	  if($scope.data.projectPowerConfiguration && $scope.data.projectPowerConfiguration.hierarchy && $scope.data.projectPowerConfiguration.hierarchy.length >0){
	      for(var i=0;i<$scope.data.projectPowerConfiguration.hierarchy.length;i++){
		var coreInfo = $scope.data.projectPowerConfiguration.hierarchy[i];
		if(coreInfo.core.name == $scope.data.selectedCore){
		  console.log("found core");
		  for(var j=0;j<coreInfo.clusters.length;j++){
		    var cluster = coreInfo.clusters[j];
		    console.log(cluster.name);
		    if(cluster.name == $scope.data.selectedCluster && cluster.checkersInfo){
			$scope.data.checkersCluster = cluster;
		    }
		  }
		}
	      }
	  }
	  if(!$scope.data.checkersCluster){
	    alert("No checkers found for this unit.");
	    return;
	  }
	  console.log($scope.data.checkersCluster);

	  $scope.data.checkerSummaryResult = {};
	  httpService.get('power/releases/' + $scope.data.selectedProject + "/" + $scope.data.selectedCore + "/" + $scope.data.selectedCluster ,{},
			function(res){

			    if(res.data && res.data.length > 0){

			      var availablesReleaseIds = [];
			      for(var i=0;i<res.data.length;i++){
				var rId = $scope.data.selectedProject + "|" + $scope.data.selectedCore + "|" + $scope.data.selectedCluster + "|" + res.data[i].primitive + "|" + res.data[i].rtl_name;
				availablesReleaseIds.push(rId);
			      }

			      var queries = [];
			      for(var i=0;i<$scope.data.checkersCluster.units.length;i++){
				var unit = $scope.data.checkersCluster.units[i];
				var availableUnits = [];
				if(unit.isCluster){
				  for(var k=0;k<unit.cluster.units.length;k++){
				      var clusterUnit = unit.cluster.units[k];

				      var level = clusterUnit.level+unit.level-1;
				      if(k==0){
					var name = unit.name;
				      }else{
					var name = clusterUnit.name;
				      }
				      
				      var tmp = new Object();
				      tmp = {level: level, name: name};
				      availableUnits.push(tmp);
				  }
				}else{
				  var instance = unit.instance;
				  var level = unit.level;
				  var name = unit.name;
				  var tmp = new Object();
				  tmp = {instance: instance, level: level, name: name};
				  availableUnits.push(tmp);
				}


				for(var k=0;k<availableUnits.length;k++){
				  var info = availableUnits[k];
				  for(var j=0;j<availablesReleaseIds.length;j++){
				    var rId = availablesReleaseIds[j];
				    query = {};
				    query['instance'] = info['instance'];
				    query['level'] = info['level'];
				    query['name'] = info['name'];

				    query['release_id'] = rId;
				    queries.push(query);
				  }
				}
			      }


			      httpService.post('power/multipleUnitsReleases' ,{'queries': queries, 'releaseType': $scope.data.releaseType},
					    function(res){

						if(res.data && res.data.length > 0){
						  var unitsInstances = {};
				    
						  var info = {};
						  var units = {};
						  for(var i=0;i<res.data.length;i++){
						    var obj = res.data[i];
						    var instance = obj['instance'];
						    unitsInstances[instance] = true;
						    var primitive = obj['release_id'].split("|")[3];
						    var rtl_name = obj['release_id'].split("|")[4];
						    var total_current = 0;
						    for(var j=0;j<obj.dynamic.length;j++){
						      total_current += obj.dynamic[j].value;
						    }
						    obj['primitive'] = primitive;
						    obj['rtl_name'] = rtl_name;
						    var unitsCode = primitive + "__" + rtl_name;
						    obj['total_current'] = total_current;
						    if(!units[unitsCode]){
							units[unitsCode] = [];
						    }
						    units[unitsCode].push(obj);
						  }

						  var unitsCodes = Object.keys(units);
						  
						  for(var i=0;i<unitsCodes.length;i++){
						    $scope.calculateUnitsPrimitive(units[unitsCodes[i]]);
						  }

						  for(var i=0;i<$scope.data.checkersCluster.checkersInfo.checkers.length;i++){
						    var checker = $scope.data.checkersCluster.checkersInfo.checkers[i];
						    if(!checker) continue;
						    var foundIdx = -1;
						    for(var j=0;j<$scope.data.projectPowerConfiguration.checkers.length;j++){
						      var checkerDefination = $scope.data.projectPowerConfiguration.checkers[j];
						      if(checkerDefination.name == checker.Checker){
							  foundIdx = j;
							  break;
						      }
						    }
						    if(foundIdx != -1){
						      var checkerDefination = $scope.data.projectPowerConfiguration.checkers[foundIdx];
    // 						      console.log(checkerDefination.run);
						      var cInstance = checker.instance;
						      if(!$scope.data.checkerSummaryResult[cInstance]) $scope.data.checkerSummaryResult[cInstance] = {};
/*						      console.log(checker);
						      console.log(units[Object.keys(units)[0]][0].primitive);*/

						      var checkerPrimitiveMode = checker.Mode;

						      var relativeUnits = $scope.getReleaseUnitsByPrimitiveMode(units, checkerPrimitiveMode);

					    
						      if(unitsInstances[cInstance] && Object.keys(relativeUnits).length > 0){
// 							  var unitIndx = $scope.findUnitInRun(units, cInstance);

							  var checkerResult = $scope.runChecker(relativeUnits, cInstance, checker, checkerDefination); 
// 							  var unitIndx = $scope.findUnitInRun(runUnits, cInstance);
							  var checkerName = checkerDefination.name;
							  $scope.data.checkerSummaryResult[cInstance][checkerName] = {};
							  var pass = 0;
							  var fail = 0;
							  var total = 0;
							  var runs = Object.keys(checkerResult);
							  for(var k=0;k<runs.length;k++){
							    var runKey = runs[k];
							    var compareRuns = checkerResult[runKey];
							    var compareRunsKeys = Object.keys(compareRuns);
							    for(var key=0;key<compareRunsKeys.length;key++){
								currRun = compareRuns[compareRunsKeys[key]];
								total++;
								if(currRun.status == 1){
								  pass++;
								}else if(currRun.status == -1){
								  fail++;
								}
							    }
							  }
							  if(total != 0){
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['total'] = total;
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['pass'] = pass;
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['passPercent'] = pass/total*100;
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['fail'] = fail;
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['failPercent'] = fail/total*100;
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['checkerResult'] = checkerResult;
							    $scope.data.checkerSummaryResult[cInstance][checkerName]['runs'] = runs;
							  }
						      }
						    }
						  }
						  console.log($scope.data.checkerSummaryResult);
						  $scope.data.showCheckersModal = true;
						}
					    },
					    function(msg, code){
						console.log(msg);
						$rootScope.loadingState = false;
					    });


			    }
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});


      }


      if($scope.data.releaseType == "unreleased"){
	  if($scope.data.projectPowerConfiguration && $scope.data.projectPowerConfiguration.hierarchy && $scope.data.projectPowerConfiguration.hierarchy.length >0){
	      for(var i=0;i<$scope.data.projectPowerConfiguration.hierarchy.length;i++){
		var core = $scope.data.projectPowerConfiguration.hierarchy[i];
		for(var j=0;j<core.clusters.length;j++){
		  var cluster = core.clusters[j];
		  if(cluster.unit == $scope.data.selectedUnit && cluster.checkersInfo){
		      $scope.data.checkersCluster = cluster;
		  }
		}
	      }
	  }
	  if(!$scope.data.checkersCluster){
	    alert("No checkers found for this unit.");
	    return;
	  }
	  console.log($scope.data.checkersCluster);
	  httpService.get('power/runs/' + $scope.data.selectedProject + "/" + $scope.data.selectedUnit ,{},
			function(res){

			    if(res.data && res.data.length > 0){

			      var availablesReleaseIds = [];
			      for(var i=0;i<res.data.length;i++){
				var rId = $scope.data.selectedProject + "|" + $scope.data.selectedUnit + "|" + res.data[i].tag + "|" + res.data[i].run_id;
				availablesReleaseIds.push(rId);
			      }

			      var queries = [];
			      for(var i=0;i<$scope.data.checkersCluster.units.length;i++){
				var unit = $scope.data.checkersCluster.units[i];
				var availableUnits = [];
				if(unit.isCluster){
				  for(var k=0;k<unit.cluster.units.length;k++){
				      var clusterUnit = unit.cluster.units[k];

				      var level = clusterUnit.level+unit.level-1;
				      if(k==0){
					var name = unit.name;
				      }else{
					var name = clusterUnit.name;
				      }
				      
				      var tmp = new Object();
				      tmp = {level: level, name: name};
				      availableUnits.push(tmp);
				  }
				}else{
				  var instance = unit.instance;
				  var level = unit.level;
				  var name = unit.name;
				  var tmp = new Object();
				  tmp = {instance: instance, level: level, name: name};
				  availableUnits.push(tmp);
				}


				for(var k=0;k<availableUnits.length;k++){
				  var info = availableUnits[k];
				  for(var j=0;j<availablesReleaseIds.length;j++){
				    var rId = availablesReleaseIds[j];
				    query = {};
				    query['instance'] = info['instance'];
				    query['release_id'] = rId;
				    queries.push(query);
				  }
				}
			      }


			      httpService.post('power/multipleUnitsReleases' ,{'queries': queries, 'releaseType': $scope.data.releaseType},
					    function(res){

						if(res.data && res.data.length > 0){
						  var unitsInstances = {};
				    
						  var info = {};
						  var units = {};
						  for(var i=0;i<res.data.length;i++){
						    var obj = res.data[i];
						    var instance = obj['instance'];
						    unitsInstances[instance] = true;
						    var tag = obj['release_id'].split("|")[2];
						    var runId = obj['release_id'].split("|")[3];
						    var total_current = 0;
						    for(var j=0;j<obj.dynamic.length;j++){
						      total_current += obj.dynamic[j].value;
						    }
						    obj['tag'] = tag;
						    obj['run_id'] = runId;
						    var unitsCode = tag + "__" + runId;
						    obj['total_current'] = total_current;
						    if(!units[unitsCode]){
							units[unitsCode] = [];
						    }
						    units[unitsCode].push(obj);
						  }

						  var unitsCodes = Object.keys(units);
						  
						  for(var i=0;i<unitsCodes.length;i++){
						    $scope.calculateUnitsPrimitive(units[unitsCodes[i]]);
						  }
					      
						  for(var i=0;i<$scope.data.checkersCluster.checkersInfo.checkers.length;i++){
						    var checker = $scope.data.checkersCluster.checkersInfo.checkers[i];
						    if(!checker) continue;
						    var foundIdx = -1;
						    for(var j=0;j<$scope.data.projectPowerConfiguration.checkers.length;j++){
						      var checkerDefination = $scope.data.projectPowerConfiguration.checkers[j];
						      if(checkerDefination.name == checker.Checker){
							  foundIdx = j;
							  break;
						      }
						    }
						    if(foundIdx != -1){
						      var checkerDefination = $scope.data.projectPowerConfiguration.checkers[foundIdx];
    // 						  console.log(checkerDefination.run);
						      var cInstance = checker.instance;
						      console.log(cInstance);

						      if(unitsInstances[cInstance]){
							  var checkerResult = $scope.runChecker(units, cInstance, checker, checkerDefination); 
						      }
						    }
						  }

						  $scope.data.showCheckersModal = true;
						}
					    },
					    function(msg, code){
						console.log(msg);
						$rootScope.loadingState = false;
					    });


			    }
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
      }



    };
    


    $scope.fetchClusterSummary = function(){
      $rootScope.loadingState = true;
      httpService.get('power/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/clusters',{},
		      function(res){
			$scope.data.summaryHierarchy = res.data;
			$scope.data.summaryClusters = res.data['clusters'];

			for(var i=0;res.data && res.data['clusters'] && i<res.data['clusters'].length;i++){
			  var cluster = res.data['clusters'][i];
			  if(cluster.name == $scope.data.selectedCluster){
			    $scope.showClusterSummary(cluster);
			    break;
			  }
			}

			$scope.data.summaryPrimitivesList = [];

			for(var i=0;i<$scope.data.summaryClusters.length;i++){
			  var cluster = $scope.data.summaryClusters[i];
			  if(cluster && cluster.primitives){
			    for(var j=0;j<cluster.primitives.length;j++){
				var primitive = cluster.primitives[j];
				var primitiveName = primitive.name;
				if($scope.data.summaryPrimitivesList.indexOf(primitiveName) == -1){
				    $scope.data.summaryPrimitivesList.push(primitiveName);
				}
			    }
			  }
			}

			$scope.data.clusterSummaryMode = true;

			$rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.showClusterSummary = function(cluster){
      $scope.data.summaryCluster = cluster;
      for(var i=0;i<$scope.data.summaryCluster.units.length;i++){
	var unit = $scope.data.summaryCluster.units[i];
	if(unit.isCluster){
	  for(var k=0;k<unit.cluster.units.length;k++){
	      var clusterUnit = unit.cluster.units[k];
	      var clusterUnitInstances = clusterUnit.instance.split("/");
	      clusterUnitInstances = clusterUnitInstances.slice(1,clusterUnitInstances.length).join("/");
	      if(clusterUnitInstances != ""){
		var clusterCoreInstance = unit.instance + "/" + clusterUnitInstances;
	      }else{
		var clusterCoreInstance = unit.instance;
	      }
	      clusterUnit.coreInstance = clusterCoreInstance;
	  }
	}
      }

      $scope.data.showClusterSummaryModal = true;

//       httpService.get('power/released/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/'+ $scope.data.summaryCluster.name + '/releases',{},
// 		      function(res){
// 			console.log(res.data);
// 			$scope.data.summaryClusterAvailableReleases = res.data;
// 
// 		      },
// 		      function(msg, code){
// 			  console.log(msg);
// 			  $rootScope.loadingState = false;
// 		      });
// 

    };

    $scope.calculateUnitsPrimitive = function(units){

      var sortedUnits = _.sortBy(units, 'level');

      for(var i=0;i<sortedUnits.length;i++){
	var currentUnit = sortedUnits[i];
	var uniqueRelativeUnits = [];
	for(var j=0;j<sortedUnits.length;j++){
	  if(i!=j){
	    var currUnit = sortedUnits[j];
	    if(currUnit.instance.indexOf(currentUnit.instance) !== -1){
		var needed = true;
		for(var k=0;k<uniqueRelativeUnits.length;k++){
		    var unique = uniqueRelativeUnits[k];
		    if(currUnit.instance.indexOf(unique.instance) !== -1){
			needed = false;
		    }
		}
		if(needed)
		  uniqueRelativeUnits.push(currUnit);
	    }
	  }
	}
	var calculated_dynamic = currentUnit.total_current
	for(var c=0;c<uniqueRelativeUnits.length;c++){
	  calculated_dynamic -= uniqueRelativeUnits[c].total_current;
	}
	currentUnit['calculated_dynamic'] = calculated_dynamic;
      }

    }

    $scope.summarySelectedRelease = function(){
      var queries = [];
      for(var i=0;i<$scope.data.summaryCluster.units.length;i++){
	var unit = $scope.data.summaryCluster.units[i];
	var availableUnits = [];
	if(unit.isCluster){
	  for(var k=0;k<unit.cluster.units.length;k++){
	      var clusterUnit = unit.cluster.units[k];

	      var level = clusterUnit.level+unit.level-1;
	      if(k==0){
		var name = unit.name;
	      }else{
		var name = clusterUnit.name;
	      }
	      
	      var tmp = new Object();
	      tmp = {level: level, name: name};
	      availableUnits.push(tmp);
	  }
	}else{
	  var instance = unit.instance;
	  var level = unit.level;
	  var name = unit.name;
	  var tmp = new Object();
	  tmp = {instance: instance, level: level, name: name};
	  availableUnits.push(tmp);
	}


	for(var k=0;k<availableUnits.length;k++){
	  var info = availableUnits[k];
	  for(var j=0;j<$scope.data.summaryCluster.primitives.length;j++){
	    var primitiveName = $scope.data.summaryCluster.primitives[j].name;
	    var releaseId = $scope.data.selectedProject + "|" + $scope.data.selectedCore + "|" + $scope.data.summaryCluster.name + "|" + primitiveName + "|" + $scope.data.summaryClusterSelectedRelease;
	    info['release_id'] = releaseId;
	    queries.push(JSON.parse(JSON.stringify(info)));
	  }
	}
      }

      $scope.data.clusterSummaryData = {};

      httpService.post('power/multipleUnitsReleases' ,{'queries': queries, 'releaseType': $scope.data.releaseType},
		    function(res){
			if(res.data && res.data.length > 0){
			  var info = {};
			  var units = {};
			  for(var i=0;i<res.data.length;i++){
			    var obj = res.data[i];
			    var instance = obj['instance'];
			    var primitiveName = obj['release_id'].split("|")[3];
			    var total_current = 0;
			    for(var j=0;j<obj.dynamic.length;j++){
			      total_current += obj.dynamic[j].value;
			    }
			    obj['primitive'] = primitiveName;
			    obj['total_current'] = total_current;
			    if(!units[primitiveName]){
				units[primitiveName] = [];
			    }
			    units[primitiveName].push(obj);

			    if(!$scope.data.clusterSummaryData[obj.instance]){
				$scope.data.clusterSummaryData[obj.instance] = {};
			    }
			    $scope.data.clusterSummaryData[obj.instance][primitiveName] = obj;

			  }

			  var primitives = Object.keys(units);
			  
			  for(var i=0;i<primitives.length;i++){
			    $scope.calculateUnitsPrimitive(units[primitives[i]]);
			  }
			}else{
			    toastr.error("No data found for current primitives", "failed");
			}
		    },
		    function(msg, code){
			console.log(msg);
			$rootScope.loadingState = false;
		    });


    };




    $scope.fetchPowerHierarchy = function(){
      $scope.data.releaseInfo = undefined;
      $scope.data.releaseTypeAdvancedCompare = "";

      if($scope.data.releaseType == "released"){
	  if(!$scope.data.selectedProject || !$scope.data.selectedCore || !$scope.data.selectedCluster || !$scope.data.selectedPrimitive || !$scope.data.selectedRTL){
	      alert("missing, please pick all options");
	      return;
	  }
	  $rootScope.loadingState = true;
	  $scope.data.showPrimitivesTable = false;
	  $scope.data.showPrimitiveInfo = false;
	  $scope.disableCompare();
	  $scope.data.selectedNode = undefined;
	  console.log($scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedCluster + '|' + encodeURIComponent($scope.data.selectedPrimitive) + '|' + $scope.data.selectedRTL);
	  httpService.get('power/tree/' + $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedCluster + '|' + encodeURIComponent($scope.data.selectedPrimitive) + '|' + $scope.data.selectedRTL ,{'parent': 'root', 'releaseType': $scope.data.releaseType},
			  function(res){
			      $scope.data.chart = res.data.rows;
			      if($scope.data.chart.length == 0){$rootScope.loadingState = false; return;}
			      $scope.data.fetchSelectedProject = $scope.data.selectedProject;
			      $scope.data.fetchSelectedCore = $scope.data.selectedCore;
			      $scope.data.fetchSelectedCluster = $scope.data.selectedCluster;
			      $scope.data.fetchSelectedPrimitive = $scope.data.selectedPrimitive;
			      $scope.data.fetchSelectedRTL = $scope.data.selectedRTL;
			      $scope.data.fetchReleaseType = $scope.data.releaseType;
  
			      $scope.data.chartLeakageInfo = res.data.leakageInfo;


			      $scope.data.coreTotalDynamicPower = 0;
			      for(var i=0;i<$scope.data.chart[0]['dynamic'].length;i++){
				  $scope.data.coreTotalDynamicPower += $scope.data.chart[0]['dynamic'][i].value;
			      }
			      
			      $scope.data.projectPowerInfo = {};
			      $scope.data.projectPowerInfo = res.data.projectPowerInfo;


			      $scope.changeSelectedNode($scope.data.chart[0]);
			      $scope.data.showPrimitiveInfo = true;
			      $rootScope.loadingState = false;
			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });


	  httpService.get('power/info/released/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + $scope.data.selectedCluster + '/' + encodeURIComponent($scope.data.selectedPrimitive) + '/' + $scope.data.selectedRTL ,{},
			  function(res){
			      $scope.data.releaseInfo = res.data;
			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });

      }
      if($scope.data.releaseType == "unreleased"){
	  if(!$scope.data.selectedProject || !$scope.data.selectedUnit || !$scope.data.selectedTag || !$scope.data.selectedRunId){
	      alert("missing, please pick all options");
	      return;
	  }

	  $rootScope.loadingState = true;
	  $scope.data.showPrimitivesTable = false;
	  $scope.data.showPrimitiveInfo = false;
	  $scope.disableCompare();
	  $scope.data.selectedNode = undefined;

	  httpService.get('power/unreleased/tree/' + $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedTag + '|' + $scope.data.selectedRunId ,{'parent': 'root', 'releaseType': $scope.data.releaseType},
			  function(res){
			      if(res.data.rows && res.data.rows.length > 0){
				$scope.data.chart = res.data.rows;
				$scope.data.fetchSelectedProject = $scope.data.selectedProject;
				$scope.data.fetchSelectedUnit = $scope.data.selectedUnit;
				$scope.data.fetchSelectedTag = $scope.data.selectedTag;
				$scope.data.fetchSelectedRunId = $scope.data.selectedRunId;
				$scope.data.fetchReleaseType = $scope.data.releaseType;
				$scope.data.showPrimitiveInfo = true;

				$scope.data.coreTotalDynamicPower = 0;
				for(var i=0;i<$scope.data.chart[0]['dynamic'].length;i++){
				    $scope.data.coreTotalDynamicPower += $scope.data.chart[0]['dynamic'][i].value;
				}

				$scope.changeSelectedNode($scope.data.chart[0]);
			      }
			      $rootScope.loadingState = false;
			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });


	  httpService.get('power/info/unreleased/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedTag + '/' + $scope.data.selectedRunId ,{},
			  function(res){
			      $scope.data.releaseInfo = res.data;
			      console.log("$scope.data.releaseInfo");
			      console.log($scope.data.releaseInfo);
			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });


      }


    }



    $scope.fetchChildren = function(node){
      if($scope.data.fetchReleaseType == "released"){
	$rootScope.loadingState = true;
	httpService.get('power/tree/' + $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedCluster + '|' + encodeURIComponent($scope.data.selectedPrimitive) + '|' + $scope.data.selectedRTL,{'parent': node.instance},
			function(res){
			    for(var i=0;i<res.data.length;i++){
			      res.data[i].parent = node;
			    }
			    $scope.data.chartLeakageInfo = res.data.leakageInfo;
			    node.children = res.data.rows;
			    node.fetched = true;
			    $scope.treeSelectNode(node, true);
			    $rootScope.loadingState = false;
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
      }
      if($scope.data.fetchReleaseType == "unreleased"){
	$rootScope.loadingState = true;
	httpService.get('power/unreleased/tree/' + $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedTag + '|' + $scope.data.selectedRunId,{'parent': node.instance},
			function(res){
			    for(var i=0;i<res.data.length;i++){
			      res.data[i].parent = node;
			    }
			    node.children = res.data.rows;
			    node.fetched = true;
			    $scope.treeSelectNode(node, true);
			    $rootScope.loadingState = false;
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
      }
    };


    $scope.changeSelectedNode = function(node){
      $scope.data.selectedNode = node;
      if(!$scope.data.selectedNode.currentHierarchy || $scope.data.selectedNode.currentHierarchy.length == 0){
	$scope.updateHierarchyNodes($scope.data.selectedNode);
      }


      if(!$scope.data.selectedNode.allChildren || $scope.data.selectedNode.allChildren.length == 0){
	$scope.updateNodeAllChildren($scope.data.selectedNode);
      }

      if($scope.data.compareMode){
	$scope.compareRuns(node);
      }
      if(!$scope.data.compareMode){
	$scope.updatePieChart();
      }
    };
    
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


    $scope.updateNodeAllChildren = function(node){
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



    $scope.treeSelectNode = function(node,tog){
      if(!node.fetched && node.hasChild){
	$scope.fetchChildren(node);
	return;
      }
      if(tog){ node.show = !node.show;}
      else{if(!node.show) node.show = !node.show;}
      $scope.changeSelectedNode(node);
    };



    $scope.getInstanceSuggesions = function(instance) {
      if(!instance || instance.length == 0) return;

      if($scope.data.fetchReleaseType == "released"){
	return $http({
	  method: 'GET',
	  url: $rootScope.serverUrl + 'power/suggestions/' + $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedCluster + '|' + encodeURIComponent($scope.data.selectedPrimitive) + '|' + $scope.data.selectedRTL,
	  params: {'instance':instance}
	}).then(function successCallback(response) {
	  $scope.results = response.data;
	  return $scope.results;
	}, function errorCallback(response) {
	  console.log(response);
	});
      }
      if($scope.data.fetchReleaseType == "unreleased"){
	return $http({
	  method: 'GET',
	  url: $rootScope.serverUrl + 'power/unreleased/suggestions/' + $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedTag + '|' + $scope.data.selectedRunId,
	  params: {'instance':instance}
	}).then(function successCallback(response) {
	  $scope.results = response.data;
	  return $scope.results;
	}, function errorCallback(response) {
	  console.log(response);
	});
      }
    };


    $scope.onSelectInstance = function ($item, $model, $label, $event) {
      if($scope.data.fetchReleaseType == "released"){
	$rootScope.loadingState = true;
	httpService.get('power/tree/search/' + $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedCluster + '|' + encodeURIComponent($scope.data.selectedPrimitive) + '|' + $scope.data.selectedRTL,{'instance':$item.instance},
			function(res){
			    if(res.data){
				var myLevel = $item.instance.split("/");
				node = $scope.data.chart;
				for(var level = 1; level < myLevel.length+1 ; level++){
				    var allInstancesInLevel = $scope.findAllInstanceByLevel(res.data.rows,level+1);
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
      }
      if($scope.data.fetchReleaseType == "unreleased"){
	$rootScope.loadingState = true;
	httpService.get('power/unreleased/tree/search/' + $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedTag + '|' + $scope.data.selectedRunId,{'instance':$item.instance},
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


      }
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


    $scope.getDynamicPowerTotal = function(node){
      var total = 0;
      for(var i=0;i<node.dynamic.length;i++)
	  total+=node.dynamic[i].value;

      return total;
    }



    $scope.getLeakagePowerTotal = function(node){
      var total = 0;
      for(var i=0; node['leakageInfo'] && node['leakageInfo']['stdcell'] && node['leakageInfo']['stdcell']['current'] && i<node['leakageInfo']['stdcell']['current'].length;i++)
	  total+=node['leakageInfo']['stdcell']['current'][i].value;

      return total;
    }


    $scope.updatePieChart = function(){
      if(!$scope.data.selectedNode) return;
      $scope.data.pieLabels = [];
      $scope.data.pieValues = [];

      var maxValue = -1;
      for(var i=0;i<$scope.data.selectedNode['dynamic'].length;i++){
	  var vt = $scope.data.selectedNode['dynamic'][i];
	  $scope.data.pieLabels.push(vt['type']);
	  $scope.data.pieValues.push(vt['value']);

      }
    };
    $scope.updatePieChart();



    $scope.removeSummaryCompare = function(idx){
      $scope.data.summaryCompareData.splice(idx,1);
    }

    $scope.fetchPowerPrimitives = function(clusterInfo){
      clusterInfo.primitivesInfo = {};
      if(clusterInfo.selectedRelease == '') return;

      httpService.get('power/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + clusterInfo.name,{'release': clusterInfo.selectedRelease},
                      function(res){
                          clusterInfo.primitivesInfo = res.data;
                      },
                      function(msg, code){
                          console.log(msg);
                      });
    };


    $scope.fetchSummaryDataToCompare = function(summaryCompareInfo){
      var cluster = summaryCompareInfo.selectedCluster;
      var release = summaryCompareInfo.selectedRelease;
      if(!cluster || !release) return;
      httpService.get('power/' + $scope.data.selectedProject + '/' + $scope.data.selectedCore + '/' + cluster.name,{'release': release},
                      function(res){
			  var temp = {'cluster': cluster, 'release': release};
			  temp['primitivesInfo'] = res.data;
			  $scope.data.summaryCompareData.push(temp);
			  console.log($scope.data.summaryCompareData);
                      },
                      function(msg, code){
                          console.log(msg);
                      });

    };


    $scope.showSummaryCompare = function(){
      $scope.data.showCompareSummaryModal = true;
      $scope.data.summaryCompareInfo = {};
      $scope.data.summaryCompareData = [];

      $scope.data.summaryCompareInfo.selectedCluster = {};
      $scope.data.summaryCompareInfo.selectedRelease = {};
    };


    $scope.toggleStatus = function(status){
      if(status == 'new'){
	  $scope.data.isNew = true;
	  $scope.data.isOld = false;
      }else{
  	  $scope.data.isNew = false;
	  $scope.data.isOld = true;
      }
    }


    $scope.exportToExcel = function(){

	 tab_text ="   <tr>\
	      <th>Primitives</th>\
	  "
	for(j = 0 ; j < $scope.data.clusters.length ; j++) 
	{     
	    var clusterInfo = $scope.data.clusters[j];
	    if(clusterInfo.isExport)
	      tab_text += "<th>"+clusterInfo.cluster+"-"+clusterInfo.selectedRelease+"[uW]"+"</th>";
	}
	tab_text += "</tr>";

	for(j = 0 ; j < $scope.data.premitives.length ; j++)
	{     
	    var primitive = $scope.data.premitives[j];
	    tab_text += "<tr>";
	    tab_text += "<td>"+primitive+"</td>";
	    for(i = 0 ; i < $scope.data.clusters.length ; i++) 
	    {     
		var clusterInfo = $scope.data.clusters[i];
		if(clusterInfo.isExport){
		  if(clusterInfo.primitivesInfo && clusterInfo.primitivesInfo[primitive] != undefined){
		    tab_text += "<td>"+parseInt(clusterInfo.primitivesInfo[primitive].value,10)+"</td>";
		  }
		  else{
		    tab_text += "<td></td>";
		  }
		}
	    }
	    tab_text += "</tr>";
	}
	tab_text+="</table>";

        var data_type = 'data:application/application/xls;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="2px">{table}</table></body></html>',
            base64 = function (s) {
                return window.btoa(unescape(encodeURIComponent(s)))
            },
            format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                })
            }

        var ctx = {
            worksheet: "Sheet 1" || 'Worksheet',
            table: tab_text
        }
	var link = document.createElement('a');
	link.href = data_type + base64(format(template, ctx));
	link.target = "_blank";
	link.download = $scope.data.selectedProject + ".xls";
	document.body.appendChild(link);
	link.click(); 

    };


    $scope.triggetUploadFile = function(){
	document.getElementById('excelFile').click(); 
    };


    $scope.importFromExcel = function(){
	var input = event.target;
	var reader = new FileReader();
	reader.onload = function(){
	    var fileData = reader.result;
	    var wb = XLS.read(fileData, {type : 'binary'});
	    wb.SheetNames.forEach(function(sheetName){
	      $scope.data.premitivesInfo = [];
	      var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]); 
	      console.log(sCSV);
	      var excel = sCSV.split("\n");
	      

	      var clusters = excel[0].split(",");

	      for(var i=1;i<clusters.length;i++){
		var clusterName = clusters[i];
		for(j = 0 ; j < $scope.data.clusters.length ; j++) 
		{     
		    var clusterInfo = $scope.data.clusters[j];
		    if(clusterName == clusterInfo.cluster){
		      var tempPrimitiveInfo = {};
		      for(var k=1;k<excel.length-1;k++){
			var primitiveRow = excel[k].split(",");
			var primitiveName = primitiveRow[0];
			var primitiveValue = primitiveRow[i];
			tempPrimitiveInfo[primitiveName].value = parseInt(primitiveValue, 10);
		      }
		      clusterInfo.primitivesInfo = tempPrimitiveInfo;
		    }
		}
	      }
	      $scope.$apply();
	    })
	};
	reader.readAsBinaryString(input.files[0]);

	angular.element(document.querySelector( '#excelFile' ) ).val(null); 
	$scope.csvFile = undefined;

    };

    $scope.applyChanges = function(){
	var saveRows = [];
	for(j = 0 ; j < $scope.data.clusters.length ; j++) 
	{     
	    var clusterInfo = $scope.data.clusters[j];
	    if(clusterInfo.isSave){
	      if(clusterInfo.newRtlName){
		for(var primitive in clusterInfo.primitivesInfo){
		    var primitiveValue = clusterInfo.primitivesInfo[primitive].value;
		    if(!isNaN(parseFloat(primitiveValue)) && isFinite(primitiveValue)){
		      //create the primitive
		      saveRows.push({project: $scope.data.selectedProject, core: $scope.data.selectedCore, cluster: clusterInfo.cluster, rtl_name: $scope.data.prefix + clusterInfo.newRtlName, primitive: primitive, value: primitiveValue});
		    }
		}
	      }else{
		alert("Missing version name for " + clusterInfo.cluster);
		return;
	      }
	    }
	}

      $rootScope.loadingState = true;

      httpService.get('power/newReleases',{rows: saveRows},
		      function(res){
			  var createdReleases = res.data;
			  if(createdReleases){
			    for(var i=0;i<createdReleases.length;i++){
				var rel = createdReleases[i];
				for(var j=0;j<$scope.data.clusters.length;j++){
				    var clusterInfo = $scope.data.clusters[j];
				    if(clusterInfo['cluster'] == rel['cluster']){
					clusterInfo.releases.push(rel);
					clusterInfo.selectedRelease = rel['rtl_name'];
				    }
				}
			    }
			  }
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });



/*	if($scope.data.isNew){
	  $scope.data.showNewPowerModal = true;
	}
	if($scope.data.isOld){
	    $rootScope.loadingState = true;

	    httpService.get('power/exist',{project: $scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: $scope.data.selectedRtl, info: $scope.data.premitivesInfo},
			    function(res){
				
				$rootScope.loadingState = false;
			    },
			    function(msg, code){
				console.log(msg);
				$rootScope.loadingState = false;
			    });

	}*/
    }

//     $scope.createNewPower = function(){
//       $rootScope.loadingState = true;
//       var newRTL = $scope.data.prefix + $scope.data.newName;
//       httpService.get('power/new',{project: $scope.data.selectedProject, core: $scope.data.selectedCore, rtl_name: newRTL, info: $scope.data.premitivesInfo},
// 		      function(res){
// 			  
// 			  $rootScope.loadingState = false;
// 		      },
// 		      function(msg, code){
// 			  console.log(msg);
// 			  $rootScope.loadingState = false;
// 		      });
//     }


    $scope.showPublishRelease = function(){
      $rootScope.loadingState = true;
      httpService.get('power/' + $scope.data.fetchSelectedProject + '/cores',{},
		      function(res){
			  $scope.data.publishProjectCores = res.data;
			  $rootScope.loadingState = false;
			  $scope.data.showPublishReleaseModal = true;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    }

    $scope.publish_CoreSelected = function(){
      $rootScope.loadingState = true;
      httpService.get('power/publish/' + $scope.data.fetchSelectedProject + '/' + $scope.data.publishSelectedCore + '/info',{},
		      function(res){
			  $scope.data.publishProjectCluster = res.data.clusters;
			  $scope.data.publishProjectPrimitives = res.data.primitives;

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    }

    $scope.showCompareModal = function(){
      $scope.data.compareMode = true;
      $scope.data.compareRunIds = [];
      


      var currRelease = {};
      currRelease['releaseType'] = $scope.data.releaseType;

      var release_id = "";
      if(currRelease['releaseType'] == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedCluster + '|' + $scope.data.selectedPrimitive + '|' + $scope.data.selectedRTL;

	  currRelease['project'] = $scope.data.selectedProject;
	  currRelease['core'] = $scope.data.selectedCore;
	  currRelease['cluster'] = $scope.data.selectedCluster;
	  currRelease['primitive'] = $scope.data.selectedPrimitive;
	  currRelease['rtl_name'] = $scope.data.selectedRTL;
      }

      if(currRelease['releaseType'] == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedTag + '|' + $scope.data.selectedRunId;

	  currRelease['project'] = $scope.data.selectedProject;
	  currRelease['top'] = $scope.data.selectedUnit;
	  currRelease['tag'] = $scope.data.selectedTag;
	  currRelease['run_id'] = $scope.data.selectedRunId;
      }
      
      currRelease['releaseId'] = release_id;

      $scope.data.compareRunIds.push(currRelease);

      $scope.compareUnreleasedRuns($scope.data.selectedNode);


      try{throw currRelease}
      catch(currReleasee) {
	  setTimeout(function(){

	      if(currReleasee['releaseType'] == "released"){

		  httpService.get('power/info/released/' + currReleasee['project'] + '/' + currReleasee['core'] + '/' + currReleasee['cluster'] + '/' + encodeURIComponent(currReleasee['primitive']) + '/' + currReleasee['rtl_name'] ,{},
				  function(res){
				      $scope.data.advancedCompareReleasesInfo[currReleasee['releaseId']] = res.data;
			  
				  },
				  function(msg, code){
				      console.log(msg);
				      $rootScope.loadingState = false;
				  });

	      }
	      if(currReleasee['releaseType'] == "unreleased"){

		  httpService.get('power/info/unreleased/' + currReleasee['project'] + '/' + currReleasee['top'] + '/' + currReleasee['tag'] + '/' + currReleasee['run_id'] ,{},
				  function(res){
				      $scope.data.advancedCompareReleasesInfo[currReleasee['releaseId']] = res.data;
				      console.log($scope.data.advancedCompareReleasesInfo);
				  },
				  function(msg, code){
				      console.log(msg);
				      $rootScope.loadingState = false;
				  });

	      }


	  },100);
      }



      //$scope.data.compareReleases = [{"unitTargetSelectedProject":$scope.data.fetchSelectedProject,"unitTargetSelectedCore":$scope.data.fetchSelectedCore,"unitTargetSelectedCluster":$scope.data.fetchSelectedCluster,"unitTargetSelectedPrimitive":$scope.data.fetchSelectedPrimitive,"unitTargetSelectedRTL":$scope.data.fetchSelectedRTL}, {}];
      //$scope.data.compareRunIds = [{selectedTag: $scope.data.fetchSelectedTag, selectedRunid: $scope.data.fetchSelectedRunId}, {}];

      //$scope.data.showAddReleaseCompareModal = true;
      //$scope.data.projectsAdvancedCompare = $scope.data.projects;
      /*if($scope.data.releaseType == 'unreleased'){
	$scope.data.showCompareUnreleasedModal = true;
	$scope.data.compareRunIds = [{selectedTag: $scope.data.fetchSelectedTag, selectedRunid: $scope.data.fetchSelectedRunId}, {}];
      }
      if($scope.data.releaseType == 'released'){
	$scope.data.showCompareReleasedModal = true;
	$scope.data.compareReleases = [{"unitTargetSelectedProject":$scope.data.fetchSelectedProject,"unitTargetSelectedCore":$scope.data.fetchSelectedCore,"unitTargetSelectedCluster":$scope.data.fetchSelectedCluster,"unitTargetSelectedPrimitive":$scope.data.fetchSelectedPrimitive,"unitTargetSelectedRTL":$scope.data.fetchSelectedRTL}, {}];
      }*/
    };

    $scope.compare_TagSelected = function(idx){
      $rootScope.loadingState = true;
      $scope.data.compareProjectRunIds=[];
      httpService.get('power/unreleased/' + $scope.data.fetchSelectedProject + '/' + $scope.data.fetchSelectedUnit + '/' + $scope.data.compareRunIds[idx].selectedTag + '/runids',{},
		      function(res){
			  $scope.data.compareRunIds[idx].selectedRunid = "";
			  $scope.data.compareRunIds[idx].possibleRunIds = res.data; 

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };
    
    $scope.deleteCompareUnrelease = function(idx){
      $scope.data.compareRunIds.splice(idx,1);
    };
    $scope.deleteCompareRelease = function(idx){
      $scope.data.compareReleases.splice(idx,1);
    };

    
    $scope.activateCompareMode = function(){
      $scope.data.compareMode = true;

      if($scope.data.selectedNode){
	$scope.compareRuns($scope.data.selectedNode);
      }
      
      
      
/*
      if($scope.data.fetchReleaseType == 'unreleased'){
	$scope.data.showCompareUnreleasedModal = false;

	if($scope.data.selectedNode){
	  $scope.compareRuns($scope.data.selectedNode);
	}
      }
      if($scope.data.fetchReleaseType == 'released'){
	$scope.data.showCompareReleasedModal = false;

	if($scope.data.selectedNode){
	  $scope.compareRuns($scope.data.selectedNode);
	}
      }*/
    };

    $scope.data.advancedCompareReleasesInfo = {};

    $scope.disableCompare = function(){
      $scope.data.compareMode = false;
      $scope.data.advancedCompareReleasesInfo = {};
    };


    $scope.compareRuns = function(node){
      if($scope.data.fetchReleaseType == 'unreleased'){
	if($scope.data.selectedNode){
	  $scope.compareUnreleasedRuns($scope.data.selectedNode);
	}
      }
      if($scope.data.fetchReleaseType == 'released'){
	if($scope.data.selectedNode){
	  $scope.compareUnreleasedRuns($scope.data.selectedNode);
	}
      }
    };



    $scope.compareUnreleasedRuns = function(node){

      $scope.data.compareList = {};
      
      $scope.data.compareReleasesInfo = {};
      $scope.data.compareReleasesInfo[$scope.data.selectedTag+$scope.data.selectedRunId] = $scope.data.releaseInfo;

      var neededInfo = [];


      for(var i=0;i<$scope.data.compareRunIds.length;i++){
	var temp = {};
	temp['release_id'] = $scope.data.compareRunIds[i].releaseId
	temp['level'] = node.level;
	temp['instance'] = node.instance;
	neededInfo.push(temp);
      }


      for(var j=0;node.children && j<node.children.length;j++){
	  var currNode = node.children[j];
	  for(var i=0;i<$scope.data.compareRunIds.length;i++){
	    var temp = {};
	    temp['release_id'] = $scope.data.compareRunIds[i].releaseId
	    temp['level'] = currNode.level;
	    temp['instance'] = currNode.instance;
	    neededInfo.push(temp);
	  }
      }

      //console.log(neededInfo);
      $rootScope.loadingState = true;

      httpService.post('power/compare/',{info: neededInfo, releaseType: $scope.data.fetchReleaseType},
		      function(res){
			  //console.log(res.data);
			  $scope.data.compareList = res.data;

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };



    $scope.addReleaseToAdvancedCompare = function(){
      
      var currRelease = {};
      currRelease['releaseType'] = $scope.data.releaseTypeAdvancedCompare;

      var release_id = "";
      if(currRelease['releaseType'] == "released"){
	  release_id = $scope.data.selectedProjectAdvancedCompare + '|' + $scope.data.selectedCoreAdvancedCompare + '|' + $scope.data.selectedClusterAdvancedCompare + '|' + $scope.data.selectedPrimitiveAdvancedCompare + '|' + $scope.data.selectedRTLAdvancedCompare;

	  currRelease['project'] = $scope.data.selectedProjectAdvancedCompare;
	  currRelease['core'] = $scope.data.selectedCoreAdvancedCompare;
	  currRelease['cluster'] = $scope.data.selectedClusterAdvancedCompare;
	  currRelease['primitive'] = $scope.data.selectedPrimitiveAdvancedCompare;
	  currRelease['rtl_name'] = $scope.data.selectedRTLAdvancedCompare;
      }

      if(currRelease['releaseType'] == "unreleased"){
	  release_id = $scope.data.selectedProjectAdvancedCompare + '|' + $scope.data.selectedUnitAdvancedCompare + '|' + $scope.data.selectedTagAdvancedCompare + '|' + $scope.data.selectedRunIdAdvancedCompare;

	  currRelease['project'] = $scope.data.selectedProjectAdvancedCompare;
	  currRelease['top'] = $scope.data.selectedUnitAdvancedCompare;
	  currRelease['tag'] = $scope.data.selectedTagAdvancedCompare;
	  currRelease['run_id'] = $scope.data.selectedRunIdAdvancedCompare;
      }
      
      currRelease['releaseId'] = release_id

      $scope.data.compareRunIds.push(currRelease);
     // console.log("selectedNode");
      //console.log($scope.data.selectedNode);
      $scope.compareUnreleasedRuns($scope.data.selectedNode);


    try{throw currRelease}
    catch(currReleasee) {
	setTimeout(function(){

	    if(currReleasee['releaseType'] == "released"){

		httpService.get('power/info/released/' + currReleasee['project'] + '/' + currReleasee['core'] + '/' + currReleasee['cluster'] + '/' + encodeURIComponent(currReleasee['primitive']) + '/' + currReleasee['rtl_name'] ,{},
				function(res){
				    $scope.data.advancedCompareReleasesInfo[currReleasee['releaseId']] = res.data;
			
				},
				function(msg, code){
				    console.log(msg);
				    $rootScope.loadingState = false;
				});

	    }
	    if(currReleasee['releaseType'] == "unreleased"){

		httpService.get('power/info/unreleased/' + currReleasee['project'] + '/' + currReleasee['top'] + '/' + currReleasee['tag'] + '/' + currReleasee['run_id'] ,{},
				function(res){
				    $scope.data.advancedCompareReleasesInfo[currReleasee['releaseId']] = res.data;
				    console.log($scope.data.advancedCompareReleasesInfo);
				},
				function(msg, code){
				    console.log(msg);
				    $rootScope.loadingState = false;
				});

	    }


	},100);
    }


      
    };



/*  
    $scope.compareUnreleasedRuns = function(node){

      $scope.data.compareList = {};
      
      $scope.data.compareReleasesInfo = {};
      $scope.data.compareReleasesInfo[$scope.data.selectedTag+$scope.data.selectedRunId] = $scope.data.releaseInfo;

      var neededInfo = [];
      for(var i=0;i<$scope.data.compareRunIds.length;i++){
	var temp = {};
	var project = $scope.data.fetchSelectedProject;
	var pTop = $scope.data.fetchSelectedUnit;
	var tag = $scope.data.compareRunIds[i].selectedTag;
	var run_id = $scope.data.compareRunIds[i].selectedRunid;
	temp['release_id'] = project + "|" + pTop + "|" + tag + "|" + run_id
	temp['level'] = node.level;
	temp['instance'] = node.instance;
	neededInfo.push(temp);


	httpService.get('power/info/unreleased/' + project + '/' + pTop + '/' + tag + '/' + run_id ,{},
			function(res){

			    if(!$scope.data.compareReleasesInfo[tag+run_id]){
			      $scope.data.compareReleasesInfo[tag+run_id] = {}
			    }
			    $scope.data.compareReleasesInfo[tag+run_id] = res.data;
			    
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});


      }

      for(var j=0;node.children && j<node.children.length;j++){
	  var currNode = node.children[j];
	  for(var i=0;i<$scope.data.compareRunIds.length;i++){
	    var temp = {};
	    var project = $scope.data.fetchSelectedProject;
	    var pTop = $scope.data.fetchSelectedUnit;
	    var tag = $scope.data.compareRunIds[i].selectedTag;
	    var run_id = $scope.data.compareRunIds[i].selectedRunid;
	    temp['release_id'] = project + "|" + pTop + "|" + tag + "|" + run_id
	    temp['level'] = currNode.level;
	    temp['instance'] = currNode.instance;
	    neededInfo.push(temp);
	  }
      }

      console.log(neededInfo);
      $rootScope.loadingState = true;

      httpService.post('power/compare/',{info: neededInfo, releaseType: $scope.data.fetchReleaseType},
		      function(res){
			  $scope.data.compareList = res.data;

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };
*/

/*
    $scope.compareReleasedRuns = function(node){

      $scope.data.compareList = {};

      var neededInfo = [];
      for(var i=0;i<$scope.data.compareReleases.length;i++){
	var rel = $scope.data.compareReleases[i];

	var temp = {};
	var project = rel.unitTargetSelectedProject;
	var core = rel.unitTargetSelectedCore;
	var cluster = rel.unitTargetSelectedCluster;
	var primitive = rel.unitTargetSelectedPrimitive;

	var release = rel.unitTargetSelectedRTL;
	temp['release_id'] = project + "|" + core + "|" + cluster + "|" + primitive + "|" + release
	$scope.data.compareReleases[i].selectedRelease = temp['release_id'];
	temp['level'] = node.level;
	temp['instance'] = node.instance;
	neededInfo.push(temp);
      }

      for(var j=0;node.children && j<node.children.length;j++){
	  var currNode = node.children[j];
	  for(var i=0;i<$scope.data.compareReleases.length;i++){
	    var rel = $scope.data.compareReleases[i];
	    var temp = {};
	    var project = rel.unitTargetSelectedProject;
	    var core = rel.unitTargetSelectedCore;
	    var cluster = rel.unitTargetSelectedCluster;
	    var primitive = rel.unitTargetSelectedPrimitive;

	    var release = rel.unitTargetSelectedRTL;
	    temp['release_id'] = project + "|" + core + "|" + cluster + "|" + primitive + "|" + release
	    temp['level'] = currNode.level;
	    temp['instance'] = currNode.instance;
	    neededInfo.push(temp);
	  }
      }


      $rootScope.loadingState = true;

      httpService.post('power/compare/',{info: neededInfo, releaseType: $scope.data.fetchReleaseType},
		      function(res){


			  $scope.data.compareList = res.data;

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };
*/



    $scope.getNodePercantageCompare = function(node, cRunid, bRunid){
	if(Object.keys($scope.data.compareList).length == 0) return;


	var cValue = $scope.getNodeCompareTotal(node, cRunid);

	var bValue = $scope.getNodeCompareTotal(node, bRunid);


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


    $scope.getNodeCompareTotal = function(node, cRunid){

      if(Object.keys($scope.data.compareList).length == 0) return;

      var keyName = cRunid.releaseId;
      //if($scope.data.fetchReleaseType == 'unreleased'){
	//keyName = cRunid.selectedRelease;
      //}
     // if($scope.data.fetchReleaseType == 'released'){
	//keyName = cRunid.selectedRelease;
      //}

//       var keyName = cRunid.selectedTag +"-"+ cRunid.selectedRunid;
      var nodeName = node.name;


      return $scope.data.compareList[nodeName][keyName];
    };





    $scope.getNodeCompareColor = function(node, cRunid){
      if(Object.keys($scope.data.compareList).length == 0) return;

      var keyName = cRunid.releaseId;
      //if($scope.data.fetchReleaseType == 'unreleased'){
	//keyName = cRunid.selectedTag +"-"+ cRunid.selectedRunid;
      //}
     // if($scope.data.fetchReleaseType == 'released'){
	//keyName = cRunid.selectedRelease;
     // }

      var nodeName = node.name;
      if($scope.data.selectedNode.name == nodeName){
	return {"background-color": "transparent"};
      }
      var curValue = $scope.data.compareList[nodeName][keyName];
      var max = Number.NEGATIVE_INFINITY;
      var min = Number.POSITIVE_INFINITY;
      var instances = Object.keys($scope.data.compareList);
      for(var i=0;i<instances.length;i++){
	var currInstance = instances[i];
	if(currInstance != $scope.data.selectedNode.name){
	  var instance = $scope.data.compareList[currInstance];
	  if(instance[keyName] && instance[keyName] > max){
	    max = instance[keyName];
	  }
	  if(instance[keyName] && instance[keyName] < min){
	    min = instance[keyName];
	  }
	}
      }
      var bgcolor = getColorForValue(curValue, max, min);
      return {"background-color": bgcolor};
    };






    $scope.getPowerPercentage = function(node){
// 	var currNodeTotal = $scope.getTotal(node['memory'], 'area');
// 	currNodeTotal += node['macro']['area'];
// 	currNodeTotal += $scope.getTotal(node['stdcell'], 'area');
	var currNodeKgates = 0 ;

	for(var i=0;i<node['dynamic'].length;i++){
	    currNodeKgates += node['dynamic'][i].value;
	}

	var percentage = (currNodeKgates/$scope.data.coreTotalDynamicPower) * 100;
	var rounded = Math.round(percentage*100)/100;


// 	var percentage = (currNodeTotal/$scope.data.coreTotalArea) * 100;
// 	var rounded = Math.round(percentage*100)/100;

// 	$scope.data.coreTotalKGates = $scope.data.chart[0]['total_std']['area'] / 1000 / ($scope.data.chart[0]['G_NAND_EQU_CELL']) ;


	return {'value':rounded, 'style': {'width':rounded +'%'}};
    }




//     $scope.publish_ClusterSelected = function(){
//       $rootScope.loadingState = true;
//       httpService.get('power/released/' + $scope.data.fetchSelectedProject + '/' + $scope.data.publishSelectedCore + '/'+ $scope.data.publishSelectedCluster + '/primitives',{},
// 		function(res){
// /*		    $scope.data.selectedPrimitive = "";
// 		    $scope.updatePrimitiveList(res.data); */
// 		    $scope.data.publishProjectPrimitives = res.data;
// 		    $rootScope.loadingState = false;
// 
// 		},
// 		function(msg, code){
// 		    console.log(msg);
// 		    $rootScope.loadingState = false;
// 		});
//     }




    $scope.publishRelease = function(){
      var primitiveValue = $scope.getDynamicPowerTotal($scope.data.chart[0]);
      var core = $scope.data.publishSelectedCore;
      var cluster = $scope.data.publishSelectedCluster;
      var primitive = $scope.data.publishSelectedPrimitive;
      var rtl_name = $scope.data.publishReleaseName;

      if(!primitiveValue || !core || !cluster || !primitive || !rtl_name){alert("missing field");return;}


      $rootScope.loadingState = true;
      httpService.get('power/publish/' + $scope.data.fetchSelectedProject + '/' + $scope.data.fetchSelectedUnit + '/'+ $scope.data.fetchSelectedTag + '/' + $scope.data.fetchSelectedRunId,
		      {'value': primitiveValue, 'core': core, 'cluster': cluster, 'primitive': primitive, 'rtl_name': rtl_name},
		function(res){
		  $rootScope.loadingState = false;

		},
		function(msg, code){
		    console.log(msg);
		    $rootScope.loadingState = false;
		});
      

    }


    $scope.getPrimitivesTotal = function(primitive){
      var countInvalid =0;
      var sum = 0 ;
      for(var j=0;j<$scope.data.summaryClusters.length;j++){
	  if($scope.data.summaryClusters[j].primitivesInfo && $scope.data.summaryClusters[j].primitivesInfo[primitive]){
	    sum+=$scope.data.summaryClusters[j].primitivesInfo[primitive].value;
	  }
	  else{
	    countInvalid++;
	  }
      }
      if(countInvalid == $scope.data.summaryClusters.length) return 0;

      return sum;
    };

    $scope.getLeakageAndDynamic = function(cluster, primitive){

      var sum = 0;
      if(cluster.primitivesInfo && cluster.primitivesInfo[primitive])
	sum += cluster.primitivesInfo[primitive].value;
      sum += $scope.getLeakageValue(cluster);
      return sum;
    }

    $scope.getTargetsTotal = function(primitive){
      var countInvalid =0;
      var sum = 0 ;
      if(!$scope.data.summaryClusters) return sum;
      var clusters = $scope.data.summaryClusters;
      for(var i=0;i<clusters.length;i++){
	var cluster = clusters[i];
	var val = $scope.getTarget(cluster, primitive);
	if(cluster.selectedRelease && val){
	  sum += val;
	}else{
	  countInvalid++;
	}
      }
      if(countInvalid == $scope.data.summaryClusters.length) return 0;

      return sum;
    };

    $scope.getTarget = function(cluster,primitive){
      if(!cluster.clusterTargets) return 0;

      return cluster['clusterTargets'][primitive];

//       for(var i=0;i<cluster.clusterTargets.length;i++){
// 	var targetObj = cluster.clusterTargets[i];
// 	var targetPrimitive = targetObj['primitive'];
// 	var targetUnit = targetObj['unit'];
// 	if(targetUnit.level == level && targetPrimitive.name == primitive){
// 	  return targetObj.value;
// 	}
//       }
    };




    $scope.getUnitNodePercantageCompare = function(node, cRelease, bRelease){

	var cValue = $scope.data.unitsTargetInfo[cRelease.releaseId][node.instance].calculated_dynamic;

	var bValue = $scope.data.unitsTargetInfo[bRelease.releaseId][node.instance].calculated_dynamic;

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
      if($scope.data.unitsTargetReleases.length == 0) return;


      var nodeName = node.name;
      if($scope.data.selectedNode.name == nodeName){
	return {"background-color": "transparent"};
      }

      var curValue = $scope.data.unitsTargetInfo[release_id][node.instance].calculated_dynamic;
      var max = Number.NEGATIVE_INFINITY;
      var min = Number.POSITIVE_INFINITY;

      for(var i=0;i<$scope.data.selectedNode.allChildren.length;i++){
	var currNode = $scope.data.selectedNode.allChildren[i];
	if(currNode.instance != $scope.data.selectedNode.instance){
	  var checkValue = $scope.data.unitsTargetInfo[release_id][currNode.instance].calculated_dynamic;
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



    $scope.getUnitTarget = function(unit, primitive){

      var cluster = $scope.data.summaryCluster;
      if(!cluster.targets || cluster.targets.length == 0) return;

      for(var i=0;i<cluster.targets.length;i++){
	var targetObj = cluster.targets[i];
	var targetPrimitive = targetObj['primitive'];
	var targetUnit = targetObj['unit'];
	if(targetUnit.level == unit.level && targetUnit.instance == unit.instance && targetPrimitive.name == primitive.name){
	  return targetObj.value;
	}
      }
    };

    $scope.getClusterUnitTarget = function(cluster, unit, primitive){

      if(!cluster.targets || cluster.targets.length == 0) return;
      for(var kk=0;kk<cluster.targets.length;kk++){
	var targetObj = cluster.targets[kk];
	var targetPrimitive = targetObj['primitive'];
	var targetUnit = targetObj['unit'];
	if(targetUnit.level == unit.level && targetUnit.instance == unit.instance && targetPrimitive.name == primitive.name){
	  return targetObj.value;
	}
      }
    };


    $scope.checkIfUnitPrimitiveExists = function(unitInstance, primitive){
      return $scope.data.clusterSummaryData[unitInstance] && $scope.data.clusterSummaryData[unitInstance][primitive.name] && "calculated_dynamic" in $scope.data.clusterSummaryData[unitInstance][primitive.name];
    };

    $scope.unitValidTarget = function(unitInstance, primitive){
      return $scope.checkIfUnitPrimitiveExists(unitInstance, primitive);
    };


    $scope.getLeakageTotal = function(){
      var sum = 0 ;
      if(!$scope.data.summaryClusters) return sum;
      var clusters = $scope.data.summaryClusters;
      for(var i=0;i<clusters.length;i++){
	var cluster = clusters[i];
	sum += $scope.getLeakageValue(cluster);
      }
      return sum;
    };

    $scope.getLeakageValue = function(cluster){
      if(!cluster.leakageInfo || !cluster.leakageInfo.total_current) return 0;
      return cluster.leakageInfo.total_current;
    }

    $scope.checkLeakageExists = function(cluster){
      if(!cluster.leakageInfo || !cluster.leakageInfo.total_current) return false;
      return true;
    }
    $scope.checkPrimitiveExists = function(cluster, primitive){
      if(cluster.primitivesInfo && cluster.primitivesInfo[primitive] && cluster.primitivesInfo[primitive].value) return true;
      return false;
    }
    $scope.checkClusterHasPrimitive = function(cluster, primitive){
      for(var i=0;i<cluster.primitives.length;i++){
	if(cluster.primitives[i].name == primitive)
	  return true;
      }
      return false;
    }

    $scope.showTargetInfo = function(cluster, primitive){
      return $scope.checkPrimitiveExists(cluster, primitive);
    };



    $scope.getReleaseToExport = function(){

	var dRelease=[];
	var titles = ['instance (DONT CHANGE)'];
	for(var i=0;i<$scope.data.summaryCluster.primitives.length;i++){
	    titles.push($scope.data.summaryCluster.primitives[i].name);
	}
	dRelease.push(titles);


	for(var i=0;i<$scope.data.summaryCluster.units.length;i++){

	    var unit = $scope.data.summaryCluster.units[i];
	    if(unit.isCluster && unit.cluster.units.length > 0){
	      for(var k=0;k<unit.cluster.units.length;k++){
		var clusterUnit = unit.cluster.units[k];
		var info = [unit.instance+":"+clusterUnit.instance];
		for(var j=0;j<$scope.data.summaryCluster.primitives.length;j++){
		    var val = $scope.getClusterUnitTarget(unit.cluster, clusterUnit, $scope.data.summaryCluster.primitives[j]);

		    info.push(val);
		}
		dRelease.push(info);
	      }
	    }else{
	      var info = [unit.instance];
	      for(var j=0;j<$scope.data.summaryCluster.primitives.length;j++){
		  var val = $scope.getUnitTarget(unit, $scope.data.summaryCluster.primitives[j]);
		  info.push(val);
	      }
	      dRelease.push(info);
	    }
	}
	return dRelease;
    };

    $scope.getReleaseRows = function(){
	var levels = [{}];
	for(var i=0;i<$scope.data.summaryCluster.units.length;i++){
	    var unit = $scope.data.summaryCluster.units[i];
	    if(unit.isCluster && unit.cluster.units.length > 0){
	      for(var k=0;k<unit.cluster.units.length;k++){
		var clusterUnit = unit.cluster.units[k];
		levels.push({level: unit.level+clusterUnit.level-2}); //minus 2 cuz the excel start from 0
	      }
	      
	    }else{
	      levels.push({level: unit.level-1}); //minus 1 cuz the excel start from 0
	    }
	}
	return levels;
    };

    $scope.getCoreReleaseName = function(){
      return $scope.data.selectedProject + "-" + $scope.data.selectedCore + "-" + $scope.data.summaryClusterSelectedRelease;
    };




    $scope.getRowsToMerge = function(){
      var colCounter = 0;
      var ans = [];
      for(var i=0;i<$scope.data.unitsTargetReleases.length;i++){
	  var tmp1 = [0];
	  var tmp2 = [0];
	  colCounter++;
	  tmp1.push(colCounter);

	  colCounter++;
	  tmp2.push(colCounter);

	  ans.push(tmp1);
	  ans.push(tmp2);
      }
      ans.push([0,0],[1,0]);

      return ans;
    }

    $scope.exportTargetInfo = function(){

	var dRelease=[];
	var titles = [$scope.data.unitsChart[0].instance];
	var secondTitles = [""];
	for(var i=0;i<$scope.data.unitsTargetReleases.length;i++){
	    titles.push($scope.data.unitsTargetReleases[i].releaseId);
	    titles.push("");

	    secondTitles.push("dynamic");
	    secondTitles.push("Target");
	}

	dRelease.push(titles);
	dRelease.push(secondTitles);
	var units = [$scope.data.unitsChart[0]];
	for(var i=0;i<units.length;i++){
	    var unit = units[i];
	    if(unit.children && unit.children.length >0){
	      for(var j=0;j<unit.children.length;j++){
		  units.splice(i+j+1, 0, unit.children[j]);
	      }
	    }
	    if(unit.level == 1){
	      continue;
	    }
	    var info = [unit.instance];
	    for(var j=0;j<$scope.data.unitsTargetReleases.length;j++){
		var release = $scope.data.unitsTargetReleases[j];
		var val = $scope.data.unitsTargetInfo[release.releaseId][unit.instance].calculated_dynamic;
		info.push(val);
		var targ = $scope.data.unitsTargetInfo[release.releaseId][unit.instance].target;
		info.push(targ);
	    }
	    dRelease.push(info);
	  }

	console.log(dRelease);
	return dRelease;
    };

    $scope.getTargetFileName = function(){
      return $scope.data.selectedProject + "-targets";
    };




    $scope.jumpToHierarch = function(primitive, cluster){
      console.log(cluster);
      return $scope.jumpToHierarch(primitive, cluster.name, cluster.selectedRelease);
//       return "power?type=released&project=" + $scope.data.fetchSelectedProject + "&core="+$scope.data.fetchSelectedCore+ "&cluster="+cluster.cluster+ "&primitive="+primitive + "&release=" + cluster.selectedRelease;
    };

    $scope.jumpToHierarch = function(primitive, cluster, clusterRelease){
      clusterName = cluster.name;
      if(!clusterRelease){
	clusterRelease = cluster['selectedRelease']; //Dont change the order...
      }
      return "power?type=released&project=" + $scope.data.selectedProject + "&core="+$scope.data.selectedCore+ "&cluster="+clusterName+ "&primitive="+primitive + "&release=" + clusterRelease;
    };



    $scope.jumpToLeakageHierarch = function(cluster, releaseId){
      if(releaseId){
	var releaseInfo = releaseId.split("|");
      }
      if(cluster){
	var leakage = cluster['leakageInfo']['leakage'];
	var releaseInfo = leakage['release_id'].split("|");
      }
      if(!releaseInfo) return;
      return "synthesis/leakage?releaseType=released&project=" + releaseInfo[0] + "&core="+releaseInfo[1]+ "&rtl="+releaseInfo[2]+ "&release="+releaseInfo[3];
    };

    $scope.toggleTotalSummary = function(){
      $scope.data.showTotalDetails = !$scope.data.showTotalDetails;
    }


    $scope.updateCoreList = function(info){
	$scope.data.projectCores = info;
	$timeout(function() {
	    $('.powerCoreSelectpicker').selectpicker('refresh');
	});
    };

    $scope.updateUnitList = function(info){
	$scope.data.projectUnits = info;
	$timeout(function() {
	    $('.powerUnitSelectpicker').selectpicker('refresh');
	});
    };

    $scope.updateTagList = function(info){
	$scope.data.projectTags = info;
	$timeout(function() {
	    $('.powerTagSelectpicker').selectpicker('refresh');
	});
    };

    $scope.updateRunidsList = function(info){
	$scope.data.projectRunIds = info;
	$timeout(function() {
	    $('.powerRunIdsSelectpicker').selectpicker('refresh');
	});
    };


    $scope.updateRtlList = function(info){
	$scope.data.projectCoreRTLS = info;
	$timeout(function() {
	    $('.powerRtlSelectpicker').selectpicker('refresh');
	});
    };
    $scope.updateClusterList = function(info){
	$scope.data.projectClusters = info;
	$timeout(function() {
	    $('.powerClusterSelectpicker').selectpicker('refresh');
	});
    };
    $scope.updatePrimitiveList = function(info){
	$scope.data.projectPrimitives = info;
	$timeout(function() {
	    $('.powerPrimitivepicker').selectpicker('refresh');
	});
    };
    $scope.updateRtlList = function(info){
	$scope.data.projectRTLs = info;
	$timeout(function() {
	    $('.powerRTLpicker').selectpicker('refresh');
	});
    };

    $scope.updateReleasesTypeList = function(){
	$timeout(function() {
	    $('.powerReleaseTypeSelectpicker').selectpicker('refresh');
	});
    };




    $scope.showAdvancedCompareModal = function(){
	$scope.data.automaticallyPickRelease=false;
	if($scope.data.releaseTypeAdvancedCompare != "unreleased" && $scope.data.releaseTypeAdvancedCompare != "released"){
	  $scope.data.automaticallyPickRelease=true;
	  $scope.data.releaseTypeAdvancedCompare = $scope.data.releaseType;
	  $scope.data.selectedProjectAdvancedCompare = $scope.data.selectedProject;

	  if($scope.data.releaseTypeAdvancedCompare == "released"){
	      $scope.data.selectedCoreAdvancedCompare = $scope.data.selectedCore;
	      $scope.data.selectedClusterAdvancedCompare = $scope.data.selectedCluster;

	  }
	  if($scope.data.releaseTypeAdvancedCompare == "unreleased"){
	    $scope.data.selectedUnitAdvancedCompare = $scope.data.selectedUnit;
	  }
	  $scope.releaseTypeSelectedAdvancedCompare();

	}else{
	  $scope.data.showAddReleaseCompareModal = true;
	}
    };

    $scope.releaseTypeSelectedAdvancedCompare = function(){
	if($scope.data.releaseTypeAdvancedCompare != "unreleased" && $scope.data.releaseTypeAdvancedCompare != "released") return;

	httpService.get('power/init_info', {releaseType: $scope.data.releaseTypeAdvancedCompare}, function(res){
	    $scope.data.projectsAdvancedCompare = res.data;

	    $scope.data.selectedPrimitiveAdvancedCompare = "";
	    $scope.data.selectedRTLAdvancedCompare = "";
	    $scope.data.projectCoresAdvancedCompare = [];
	    $scope.data.projectClustersAdvancedCompare = [];
	    $scope.data.projectPrimitivesAdvancedCompare = [];
	    $scope.data.projectRTLsAdvancedCompare = [];

	    $scope.data.selectedTagAdvancedCompare = "";
	    $scope.data.selectedRunIdAdvancedCompare = "";
	    $scope.data.projectUnitsAdvancedCompare = [];
	    $scope.data.projectTagsAdvancedCompare = [];
	    $scope.data.projectRunIdsAdvancedCompare = [];
  
	    if($scope.data.automaticallyPickRelease){
	      $scope.projectSelectedAdvancedCompare();
	    }else{
	      $scope.data.selectedProjectAdvancedCompare = "";
	      $scope.data.selectedCoreAdvancedCompare = "";
	      $scope.data.selectedUnitAdvancedCompare = "";

	    }
  
	}, function(msg, code){console.log(msg); })

    }


    $scope.projectSelectedAdvancedCompare = function(){

      if($scope.data.releaseTypeAdvancedCompare == "released"){
	  $rootScope.loadingState = true;

	  httpService.get('power/' + $scope.data.selectedProjectAdvancedCompare + '/cores',{},
			  function(res){

			      $scope.data.projectCoresAdvancedCompare = res.data
			      $rootScope.loadingState = false;

			      
			      $scope.data.selectedPrimitiveAdvancedCompare = "";
			      $scope.data.selectedRTLAdvancedCompare = "";
			      $scope.data.projectClustersAdvancedCompare = [];
			      $scope.data.projectPrimitivesAdvancedCompare = [];
			      $scope.data.projectRTLsAdvancedCompare = [];

			      if($scope.data.automaticallyPickRelease){
				  $scope.coreSelectedAdvancedCompare();
			      }else{
				$scope.data.selectedCoreAdvancedCompare = "";
			      }

			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });
      }
      if($scope.data.releaseTypeAdvancedCompare == "unreleased"){
	  $rootScope.loadingState = true;

	  httpService.get('power/' + $scope.data.selectedProjectAdvancedCompare + '/units',{},
			  function(res){

			      $scope.data.projectUnitsAdvancedCompare = res.data;
			      $scope.data.selectedTagAdvancedCompare = "";
			      $scope.data.selectedRunIdAdvancedCompare = "";
			      $scope.data.projectTagsAdvancedCompare = [];
			      $scope.data.projectRunIdsAdvancedCompare = [];

			      $rootScope.loadingState = false;

			      if($scope.data.automaticallyPickRelease){
				  $scope.unitSelectedAdvancedCompare();
				  $scope.data.automaticallyPickRelease=false;
				  $scope.data.showAddReleaseCompareModal = true;
			      }else{
				$scope.data.selectedUnitAdvancedCompare = "";
			      }


			  },
			  function(msg, code){
			      console.log(msg);
			      $rootScope.loadingState = false;
			  });
      }
    };


    $scope.coreSelectedAdvancedCompare = function(){

      $rootScope.loadingState = true;

      httpService.get('power/released/' + $scope.data.selectedProjectAdvancedCompare + '/' + $scope.data.selectedCoreAdvancedCompare + '/clusters',{},
		      function(res){
			  $scope.data.projectClustersAdvancedCompare = res.data;

			  $rootScope.loadingState = false;

			  $scope.data.selectedPrimitiveAdvancedCompare = "";
			  $scope.data.selectedRTLAdvancedCompare = "";
			  $scope.data.projectPrimitivesAdvancedCompare = [];
			  $scope.data.projectRTLsAdvancedCompare = [];


			      if($scope.data.automaticallyPickRelease){
				  $scope.clusterSelectedAdvancedCompare();
				  $scope.data.automaticallyPickRelease=false;
				  $scope.data.showAddReleaseCompareModal = true;
			      }else{
				$scope.data.selectedClusterAdvancedCompare = "";
			      }


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    };


    $scope.unitSelectedAdvancedCompare = function(){

      $rootScope.loadingState = true;

      httpService.get('power/unreleased/' + $scope.data.selectedProjectAdvancedCompare + '/' + $scope.data.selectedUnitAdvancedCompare + '/tags',{},
		      function(res){
			  $scope.data.selectedTagAdvancedCompare = "";

			  $scope.data.projectTagsAdvancedCompare = res.data;

			  $scope.data.selectedTagAdvancedCompare = "";
			  $scope.data.selectedRunIdAdvancedCompare = "";
			  $scope.data.projectRunIdsAdvancedCompare = [];

			  $rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }


    $scope.tagSelectedAdvancedCompare = function(){

      $rootScope.loadingState = true;

      $scope.data.selectedRunIdAdvancedCompare = "";

      httpService.get('power/unreleased/' + $scope.data.selectedProjectAdvancedCompare + '/' + $scope.data.selectedUnitAdvancedCompare + '/' + $scope.data.selectedTagAdvancedCompare + '/runids',{},
		      function(res){
			  $scope.data.projectRunIdsAdvancedCompare = res.data;

			  $rootScope.loadingState = false;


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }


    $scope.clusterSelectedAdvancedCompare = function(){

      $scope.data.selectedPrimitiveAdvancedCompare = "";
      $scope.data.selectedRTLAdvancedCompare = "";


      $rootScope.loadingState = true;

      httpService.get('power/released/' + $scope.data.selectedProjectAdvancedCompare + '/' + $scope.data.selectedCoreAdvancedCompare + '/'+ $scope.data.selectedClusterAdvancedCompare + '/primitives',{},
		      function(res){

			  $scope.data.projectPrimitivesAdvancedCompare = res.data;
			  $rootScope.loadingState = false;


			  $scope.data.selectedPrimitiveAdvancedCompare = "";
			  $scope.data.selectedRTLAdvancedCompare = "";
			  $scope.data.projectRTLsAdvancedCompare = [];


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }

    $scope.primitiveSelectedAdvancedCompare = function(){

      $rootScope.loadingState = true;


      httpService.get('power/released/' + $scope.data.selectedProjectAdvancedCompare + '/' + $scope.data.selectedCoreAdvancedCompare + '/'+ $scope.data.selectedClusterAdvancedCompare + '/' + encodeURIComponent($scope.data.selectedPrimitiveAdvancedCompare) +'/rtls',{},
		      function(res){

			  $scope.data.selectedRTLAdvancedCompare = "";
			  $scope.data.projectRTLsAdvancedCompare = res.data;
			  $rootScope.loadingState = false;

			  $scope.data.selectedRTLAdvancedCompare = "";


		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    }







    $scope.deleteProject = function(){
      if($scope.data.releaseType == "unreleased"){
	  if($scope.data.selectedProject && $scope.data.selectedUnit && $scope.data.selectedTag && $scope.data.selectedRunId){
	      if(confirm('Are you sure you want to remove this run?')){
		  $scope.disableRequest("delete", "release", {project:$scope.data.selectedProject, top: $scope.data.selectedUnit, tag: $scope.data.selectedTag, run_id:$scope.data.selectedRunId});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject && $scope.data.selectedUnit && $scope.data.selectedTag){
	      if(confirm('Are you sure you want to remove this tag?')){
		  $scope.disableRequest("delete", "tag", {project:$scope.data.selectedProject, top: $scope.data.selectedUnit, tag: $scope.data.selectedTag});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject && $scope.data.selectedUnit){
	      if(confirm('Are you sure you want to remove this unit?')){
		  $scope.disableRequest("delete", "unit", {project:$scope.data.selectedProject, top: $scope.data.selectedUnit});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject){
	      if(confirm('Are you sure you want to remove this project?')){
		  $scope.disableRequest("delete", "project", {project:$scope.data.selectedProject});
		  return;
	      }
	      return;
	  }   
      }


      if($scope.data.releaseType == "released"){
	  if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedCluster && $scope.data.selectedPrimitive  && $scope.data.selectedRTL){
	      if(confirm('Are you sure you want to remove this release?')){
		  $scope.disableRequest("delete", "release", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, cluster: $scope.data.selectedCluster, primitive:$scope.data.selectedPrimitive, rtl_name:$scope.data.selectedRTL});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedCluster && $scope.data.selectedPrimitive){
	      if(confirm('Are you sure you want to remove this primitive?')){
		  $scope.disableRequest("delete", "primitive", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, cluster: $scope.data.selectedCluster, primitive:$scope.data.selectedPrimitive});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject && $scope.data.selectedCore && $scope.data.selectedCluster){
	      if(confirm('Are you sure you want to remove this cluster?')){
		  $scope.disableRequest("delete", "cluster", {project:$scope.data.selectedProject, core: $scope.data.selectedCore, cluster: $scope.data.selectedCluster});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject && $scope.data.selectedCore){
	      if(confirm('Are you sure you want to remove this core?')){
		  $scope.disableRequest("delete", "core", {project:$scope.data.selectedProject, core: $scope.data.selectedCore});
		  return;
	      }
	      return;
	  }
	  if($scope.data.selectedProject){
	      if(confirm('Are you sure you want to remove this project?')){
		  $scope.disableRequest("delete", "project", {project:$scope.data.selectedProject});
		  return;
	      }
	      return;
	  }

      }


    }


    $scope.disableRequest = function(disableType, disableLevel, info){
	httpService.get('power/'+disableType, {level: disableLevel, info: info, releaseType: $scope.data.releaseType}, function(res){
	    
	}, function(msg, code){
	      console.log(msg);
	})  
    }








    $scope.backToIntial = function(){
      $scope.data.showPrimitivesTable = false;
      $scope.data.showPrimitiveInfo = false;
      $scope.data.compareMode = false;
      $scope.data.selectedNode = undefined;
    };



    $scope.toggleTreeVisibility = function(flag){
      $scope.hideTree = flag;
    }


    $scope.getEmptySpace = function(level){
      var sp = 10 * level;
      return {'padding-left': sp + 'px'};
    }


    $scope.getSystemFile = function(fileId){
      var link = document.createElement('a');
      link.href = $rootScope.filesUrl + "id/" +encodeURIComponent(fileId) + "?target=view";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click(); 
    };

    $scope.copyReleasePath = function(){

      var currentLocation = window.location;

      var url = "";
      url += currentLocation.origin + "/#!/";
/*      url += "/" + currentLocation.pathname;*/
      var currentPicked = "";
      if($scope.data.releaseType == "unreleased"){
	currentPicked = "power?type="+$scope.data.releaseType+"&project=" + $scope.data.selectedProject + "&unit="+$scope.data.selectedUnit+ "&tag="+$scope.data.selectedTag+ "&run_id="+$scope.data.selectedRunId;
      }else{
	currentPicked = "power?type="+$scope.data.releaseType+"&project=" + $scope.data.selectedProject + "&core="+$scope.data.selectedCore+ "&cluster=" + $scope.data.selectedCluster + "&primitive=" + $scope.data.selectedPrimitive + "&release="+$scope.data.selectedRTL;
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



    var relType = $location.search().type; 
    if(relType){

      var relType = $location.search().type;
      $location.search().type = undefined;
      $scope.data.releaseType = relType;
//       $location.search().project = undefined;
//       $scope.data.selectedProject = project;

      $scope.releaseTypeSelected();
    }


});




var ExcelToJSON = function() {
  console.log("aaaa");
  this.parseExcel = function(file) {
  console.log("bbbb");

  };
};



































