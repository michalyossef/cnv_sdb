app.factory('adminDataService', function ($q, $timeout, $rootScope, $location, httpService) {
	console.log('adminDataService');


    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {
        $rootScope.loadingState = true;
        self.projects = [];

        async.series([
            function (callback) {
	      httpService.get('project/init_info', {}, function(res){self.projects = res.data; callback();}, function(msg, code){console.log(msg);callback('error'); })
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




app.controller('adminCntrl', function ($scope, $q, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr) {
    $rootScope.mainClass = 'admin-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;

    var tmpCluster = {name:"", primitives: [], instancePath: {}, units: [], targets: []};
    var tmpCore = {core: {name: ""}, clusters: []};


    $scope.updatePicker = function(){
	$timeout(function() {
	    $('.powerSelectpicker').selectpicker('refresh');
	});
    };

    $scope.updatePicker();



    $scope.fetchProjectInfo = function(){
      $rootScope.loadingState = true;
      httpService.get('admin/' + $scope.data.selectedProject + '/fetch' ,{},
		      function(res){
			  if(!res.data.info){
			    alert("project not exists");
			    $scope.data.powerInfo = {}; 
			  }else{
			    if(res.data.info.power_configuration){
			      $scope.data.powerInfo = res.data.info.power_configuration;
			    }else{
			      $scope.data.powerInfo = {}; 
			    }
			      
			  }
			  $scope.data.fetchedProjectData = true;
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

      httpService.get('power/' + $scope.data.selectedProject + '/units',{},
		      function(res){
			  $scope.data.projectAvailableUnits = res.data; 
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    };


    $scope.saveProjectInfo = function(){

      $rootScope.loadingState = true;
      httpService.post('admin/' + $scope.data.selectedProject + '/save' ,{'power_configuration': $scope.data.powerInfo, 'username': $rootScope.userId},
		      function(res){
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };



    $scope.createNewProject = function(isDup){
      var tmp = {};
      if(isDup){
	tmp = {'dupProject': $scope.data.selectedDuplicateProject};
      }
      $rootScope.loadingState = true;
      httpService.post('admin/' + $scope.data.newProjectName + '/new' , tmp,
		      function(res){
			  $rootScope.loadingState = false;
			  toastr.success('Project created successfully!');

		      },
		      function(msg, code){
			  console.log(msg);
			  toastr.error(msg.data.error);

			  $rootScope.loadingState = false;
		      });
    };



    $scope.unitSelectedForCluster = function(releaseMeta, selectedUnit){
      console.log(releaseMeta);
      console.log($scope.data.powerInfo);
      
//       var unit = $scope.data.powerInfo['releaseMeta'].cluster['selectedUnit'];

      httpService.get('power/runs/' + $scope.data.selectedProject + '/' + selectedUnit,{},
		      function(res){

			  releaseMeta.possibleRuns = res.data;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });


    }

//       var primitiveValue = $scope.getDynamicPowerTotal($scope.data.chart[0]);

//     $scope.releaseSelectedRuns = function(info, cluster){
//       var releases = info['releaseMeta'];
//       
//       var rows = [];
//       $rootScope.loadingState = true;
// 
//       for(var i=0;i<info.primitives.length;i++){
// 	  var primitive = info.primitives[i];
// 	  if(releases[cluster][primitive]){
// // 	    var temp={'core': info.core, 'cluster': cluster, 'primitive': primitive, 'rtl_name': };
// 
// 	    var project = $scope.data.selectedProject;
// 	    var unit = releases[cluster].selectedUnit;
// 	    var tag = releases[cluster][primitive]['releaseRun']['tag'];
// 	    var runid = releases[cluster][primitive]['releaseRun']['run_id'];
// 
// 
// 	    httpService.get('power/publish/' + project + '/' + unit + '/'+ tag + '/' + runid,
// 			    {'core': info.core, 'cluster': cluster, 'primitive': primitive, 'rtl_name': releases[cluster].releaseName},
// 		      function(res){
// 			$rootScope.loadingState = false;
// 
// 		      },
// 		      function(msg, code){
// 			  console.log(msg);
// 			  $rootScope.loadingState = false;
// 		      });
// 	  }
//       }
//     }


    $scope.releaseSelectedPrimitives = function(){
      if(!$scope.data.releaseName){
	alert("missing release name");
	return;
      }

      var allRequests = [];

      for(var i=0;i<$scope.data.selectedCluster.primitives.length;i++){

	  (function(idx){
	      var primitive = $scope.data.selectedCluster.primitives[idx];
	      if(primitive.releaseRun){
		var project = $scope.data.selectedProject;
		var unit = $scope.data.selectedCluster.unit;
		var tag = primitive['releaseRun']['tag'];
		var runid = primitive['releaseRun']['run_id'];

		var core = $scope.data.selectedInfo.core.name;
		var cluster = $scope.data.selectedCluster.name;
		var primitiveName = primitive.name;
		var rtl_name = $scope.data.releaseName;

		var request = function (callback) {
		    httpService.get('power/publish/' + encodeURIComponent(project) + '/' + encodeURIComponent(unit) + '/'+ encodeURIComponent(tag) + '/' + encodeURIComponent(runid),
				    {'core': core, 'cluster': cluster, 'primitive': primitiveName, 'rtl_name': rtl_name},
			      function(res){
				callback();
			      },
			      function(msg, code){
			      });
		      }
		allRequests.push(request);
	      }
	  })(i);

      }



      $rootScope.loadingState = true;

      var deferred = $q.defer();

      var publishReleases = function (cb) {
	  $rootScope.loadingState = true;

	  async.series(allRequests, function (err) {

	      console.log(err);
	      if(err){
		    deferred.reject();
	      }
	      $rootScope.loadingState = false;
	      if (cb && typeof cb === 'function') {
		  cb();
	      }
	  });
      };


      publishReleases(function () {
	  deferred.resolve();
      });

      return deferred.promise;


/*      for(var i=0;i<$scope.data.selectedCluster.primitives.length;i++){
	  var primitive = $scope.data.selectedCluster.primitives[i];
	  if(primitive.releaseRun){
	    var project = $scope.data.selectedProject;
	    var unit = $scope.data.selectedCluster.unit;
	    var tag = primitive['releaseRun']['tag'];
	    var runid = primitive['releaseRun']['run_id'];

	    var core = $scope.data.selectedInfo.core.name;
	    var cluster = $scope.data.selectedCluster.name;
	    var primitiveName = primitive.name;
	    var rtl_name = $scope.data.releaseName;

	    httpService.get('power/publish/' + project + '/' + unit + '/'+ tag + '/' + runid,
			    {'core': core, 'cluster': cluster, 'primitive': primitiveName, 'rtl_name': rtl_name},
		      function(res){
			$rootScope.loadingState = false;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
	  }
      }*/
    }


    $scope.saveProjectPrimitives = function(){
      for(var i=0;i<$scope.data.powerInfo.length;i++){
	var pInfo = $scope.data.powerInfo[i];
	for(var j=0;j<pInfo.primitives.length;j++){
	    pInfo.primitives[j] = pInfo.primitives[j].trim();
// 	    pInfo.primitives[j] = pInfo.primitives[j].replace(/ /g,"_");
	    var primitive = pInfo.primitives[j];
	    var re = /^[/\\\_a-zA-Z0-9-\s]*$/;
	    if(!primitive || primitive == "" || !re.test(primitive)){
	      alert("You have invalid primitive in " + pInfo.core + " primitive value '" + primitive +"'");
	      return;
	    }
	}
      }

      $rootScope.loadingState = true;
      httpService.get('admin/primitives/' + $scope.data.selectedProject ,{'info': $scope.data.powerInfo, 'projectPowerInfo': $scope.data.projectPowerInfo},
		      function(res){
			  $rootScope.loadingState = false;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
    };

    $scope.editInstancePath = function(info, cluster){
      $rootScope.loadingState = true;

      $scope.data.currentInfo = cluster;
      $scope.data.pickedCore = info.core.name;
      $scope.data.pickedCluster = cluster.name;

      httpService.get('leakage/' + $scope.data.selectedProject + '/cores',{},
		      function(res){



			  $scope.data.cores = res.data;
			  $rootScope.loadingState = false;
			  $scope.data.showEditInstancePath = true;

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });
      

    };

    $scope.coreSelectedLeakage = function(){
      httpService.get('leakage/topHierarchy/' + $scope.data.selectedProject + "/" + $scope.data.selectedLeakageCore,{},
		      function(res){
			  console.log(res.data);
			  $scope.data.availableInstances = res.data;

			  $timeout(function() {
			      $('.selectpicker').selectpicker('refresh');
			  });

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });      
    }

    $scope.keepInstancePathChanges = function(){
      if(!$scope.data.currentInfo['instancePath']){
	$scope.data.currentInfo['instancePath'] = {};
      }
      if(!$scope.data.currentInfo['instancePath'][$scope.data.pickedCore]){
	$scope.data.currentInfo['instancePath'][$scope.data.pickedCore] = {};
      }
      if(!$scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]){
	$scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster] = {};
      }

      $scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]['powerCore'] = $scope.data.pickedCore;
      $scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]['powerCluster'] = $scope.data.pickedCluster;

      $scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]['mapLevel'] = $scope.data.selectedMapInstance.level;
      $scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]['mapCore'] = $scope.data.selectedLeakageCore;
      $scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]['mapInstance'] = $scope.data.selectedMapInstance.instance;
      $scope.data.currentInfo['instancePath'][$scope.data.pickedCore][$scope.data.pickedCluster]['mapName'] = $scope.data.selectedMapInstance.name;
      console.log($scope.data.currentInfo);

      console.log($scope.data.powerInfo);
      $scope.data.showEditInstancePath = false;

    }

    $scope.saveClusterName = function(info){
      info.clusters[0].name = info.core.name;

    };

    $scope.addCluster = function(indx){
      $scope.data.powerInfo.hierarchy[indx]['clusters'].push(JSON.parse(JSON.stringify(tmpCluster)));
    };

    $scope.addCore = function(){
//       $scope.data.powerInfo.push({"core": "tmp_core", clusters:[], primitives: []});

      if(!$scope.data.powerInfo.hierarchy){
	  $scope.data.powerInfo.hierarchy = [];
      }
      $scope.data.powerInfo.hierarchy.push(JSON.parse(JSON.stringify(tmpCore)));
      var currCorePos = $scope.data.powerInfo.hierarchy.length -1;
      $scope.addCluster(currCorePos);

    };

    $scope.primitivesToView = function(primitives){
      $scope.data.tempPrimitivesMetaData = [];
      for(var i=0;i<primitives.length;i++){
	if(primitives[i].meta){
	  var metas = Object.keys(primitives[i].meta);
	  $scope.data.tempPrimitivesMetaData = [...new Set([...$scope.data.tempPrimitivesMetaData, ...metas])];
	}
      }
    };    

    $scope.editPrimitives = function(cluster){
      $scope.data.primitivesCluster = cluster;

      $scope.data.tempPrimtives = cluster.primitives;

      $scope.primitivesToView($scope.data.tempPrimtives);
      $scope.data.showPrimitivesModal = true;
    };



    $scope.changeSelectedNode = function(node){
      $scope.data.selectedNode = node;
    };
    $scope.treeSelectNode = function(node,tog){
      if(!node.fetched && node.hasChild){
	$scope.fetchChildren(node);
	return;
      }
      if(tog){ node.show = !node.show;}
      else{if(!node.show) node.show = !node.show;}
      $scope.changeSelectedNode(node);
    };
    $scope.fetchChildren = function(node){
	$rootScope.loadingState = true;
	httpService.get('power/tree/' + encodeURIComponent($scope.unitsLatestReleaseId),{'parent': node.instance},
			function(res){
// 			    for(var i=0;i<res.data.rows.length;i++){
// 			      for(var j=0;j<$scope.data.selectedCluster.units.length;j++){
// 				  if($scope.data.selectedCluster.units[j]._id==res.data.rows[i]._id){
// 				      res.data.rows[i].isUnit = true;
// 				  }
// 			      }
// 			    }

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
    };

    $scope.toggleInstanceForUnit = function(){
	console.log($scope.data.selectedCluster.tempUnits);
	$scope.allDescendants($scope.data.chart[0], undefined);

    };


    $scope.saveButtonForUnit = function(){
	console.log($scope.data.selectedCluster.tempUnits);

	$scope.data.selectedCluster.units = $scope.data.selectedCluster.tempUnits;

    };


    $scope.allDescendants = function(node, father) {
	if(node.isUnit || node.release_id == "virtual"){
	  if(node.release_id == "virtual"){
	    if(!father){
	      node['instance'] = node['name'];
	    }else{
	      node['instance'] = father['instance']+'/'+node['name'];
	    }
	  }
	  $scope.data.selectedCluster.tempUnits.push(node);

	}

	for (var i = 0; node.children && i < node.children.length; i++) {
	  var child = node.children[i];
	  $scope.allDescendants(child, node);
	  $scope.doSomethingToNode(child, node);
	}
    };
    $scope.doSomethingToNode = function(child, father){
      if(child.isUnit || child.release_id == "virtual"){
	var pos = -1;
	for(var i=0;i<$scope.data.selectedCluster.tempUnits.length;i++){
	  if(child._id == $scope.data.selectedCluster.tempUnits[i]._id){
	    pos = i;
	    break;
	  }
	}
	if(pos == -1){
	  if(child.release_id == "virtual"){
	    if(!father){
	      child['instance'] = child['name'];
	    }else{
	      child['instance'] = father['instance']+'/'+child['name'];
	    }
	  }
	  $scope.data.selectedCluster.tempUnits.push(child);

	}
      }
    };


    $scope.calcClusterTarget = function(primitiveName){
      var sum = 0;
      var invalid = 0;
      var unitInstances = Object.keys($scope.data.tempTargets);
      for(var i=0;i<unitInstances.length;i++){
	  var unitInstance = unitInstances[i];
	  var unitClusterPos = -1;
	  for(var j=0;j<$scope.data.selectedCluster.units.length;j++){
	      var currUnit = $scope.data.selectedCluster.units[j];
	      if(unitInstance == currUnit.instance && currUnit.isCluster) unitClusterPos = j;
	  }
	  if(unitClusterPos == -1){
	    if($scope.data.tempTargets[unitInstance] && $scope.data.tempTargets[unitInstance][primitiveName]){
	      sum += $scope.data.tempTargets[unitInstance][primitiveName];
	    }else{
	      invalid += 1;
	    }
	  }else{

	    var clust = $scope.data.selectedCluster.units[unitClusterPos].cluster;
	    var val = $scope.isClusterTotalTarget(clust, primitiveName);
	    if(val)
	      sum += $scope.getClusterTotalTarget(clust, primitiveName);
	  }
      }

      if(invalid != unitInstances.length)
	return sum;
    }


    $scope.getClusterTotalTarget = function(cluster, primitiveName){
      if(cluster.targets && cluster.targets.length > 0){

	var sum =0;
	for(var i=0;i<cluster.targets.length;i++){
	  var target = cluster.targets[i];
	  if(target.primitive.name == primitiveName)
	    sum += target.value;
	}
	return sum;
      }
    }

    $scope.isClusterTotalTarget = function(cluster, primitiveName){
      if(cluster.targets && cluster.targets.length > 0){

	var sum =0;
	for(var i=0;i<cluster.targets.length;i++){
	  var target = cluster.targets[i];
	  if(target.primitive.name == primitiveName)
	    sum += target.value;
	}
	return true;
      }

      return false;
    }




    $scope.getTargetValue = function(cluster, unit, primitiveName){
      if(cluster.targets && cluster.targets.length > 0){


	for(var i=0;i<cluster.targets.length;i++){
	  var target = cluster.targets[i];
	  if(target.primitive.name == primitiveName && unit.instance == target.unit.instance)
	    return target.value;
	}
	return 0;
      }
    }


    $scope.editUnitsOnPrimitiveChange = function(){
      console.log("editUnitsOnPrimitiveChange");

      $rootScope.loadingState = true;

      httpService.get('power/released/' + $scope.data.selectedProject + '/' + $scope.data.selectedInfo.core.name + '/'  + $scope.data.selectedCluster.name + '/' + encodeURIComponent($scope.data.tempUnitPrimitiveChange.name) + '/rtls',{},
		      function(res){
			  $rootScope.loadingState = false;
			  $scope.data.fetchedReleases = res.data;
		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;
		      });

    };

    $scope.editUnitsOnReleasesChange = function(){
      console.log("editUnitsOnReleasesChange");

      $scope.editUnits($scope.data.selectedInfo, $scope.data.selectedCluster, $scope.data.tempUnitPrimitiveChange, $scope.data.tempUnitReleaseChange);

    };


    $scope.editUnits = function(info, cluster, primitive, release){
	if(!primitive){
	  $scope.data.tempUnitReleaseChange = undefined;
	  $scope.data.tempUnitPrimitiveChange = undefined;
	}else{
	  $scope.data.selectedCluster.units = []; //re-pick from the start.
	}

	$scope.data.chart = [];
	var regexString = $scope.data.selectedProject + '\\|' + info.core.name + '\\|' + cluster.name + '\\|';
	if(primitive){
	  regexString += primitive.name + '\\|' + release;
	}

	$rootScope.loadingState = true;
	httpService.get('power/regex/tree/' ,{'parent': 'root', 'regex_release_id': regexString},
			function(res){
			    $scope.data.selectedInfo = info;
			    $scope.data.selectedCluster = cluster;

			    $scope.data.selectedCluster.tempUnits = [];

			    if(res.data && res.data.length>0){

			      console.log($scope.data.selectedCluster.units);
			      if(!$scope.data.selectedCluster.units || $scope.data.selectedCluster.units.length == 0){ //add first child
				  $scope.data.selectedCluster.units.push(res.data[0]);
			      }

			      for(var i=0;i<res.data.length;i++){
				for(var j=0;j<$scope.data.selectedCluster.units.length;j++){
				  if($scope.data.selectedCluster.units[j]._id==res.data[i]._id){
				      res.data[i].isUnit = true;
				  }
				}
			      }
			      $scope.data.chart = res.data;
			      $scope.changeSelectedNode($scope.data.chart[0]);
			      $scope.unitsLatestReleaseId = $scope.data.chart[0].release_id;
			      $scope.data.showSetUnitsModal = true;
			    }else{
			      if(info.core.name == cluster.name){
				$scope.data.chart = [{level: 1, release_id: "virtual", name: "root", instance: "1:root:root", show: true}]
				$scope.data.showSetVirtualUnitsModal = true;
			      }else{
				alert("No release found!");
			      }
			    }
			      console.log($scope.data.selectedCluster.units);

			    console.log($scope.data.selectedCluster.tempUnits);

			    $rootScope.loadingState = false;
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
    };

    $scope.addHierarchyChild = function(item){
      if(!item.children) item.children = [];
      var count = item.children.length+1;
      item.children.push({level: item.level+1, release_id: "virtual", name: "child_" + count, instance: count+":"+item.name+":"+"child_" + count, show: true});
      item.hasChild = true;


    };

    $scope.toggleUnitToCluster = function(item){

      item.isCluster = !item.isCluster;

    };


    $scope.editTargets = function(info, cluster){
	if(cluster.units.length == 0){
	    alert("You need to choose units first");
	    return;
	}
	if(cluster.primitives.length == 0){
	    alert("You need to upload primitives first");
	    return;
	}
	$scope.data.selectedCluster = cluster;

	$scope.data.tempTargets = {};
	for(var i=0;i<$scope.data.selectedCluster.units.length;i++){
	  var unit = $scope.data.selectedCluster.units[i];
	  $scope.data.tempTargets[unit.instance] = {};
	}

	if($scope.data.selectedCluster.targets && $scope.data.selectedCluster.targets.length > 0){
	    for(var i=0;i<$scope.data.selectedCluster.targets.length;i++){
	      var targetObj = $scope.data.selectedCluster.targets[i];
	      if(targetObj['unit'].instance in $scope.data.tempTargets){
		var primitiveName = targetObj['primitive'].name;
		var found = false;
		for(var k=0;k<$scope.data.selectedCluster.primitives.length;k++){
		  var primitive = $scope.data.selectedCluster.primitives[k];
		  if(primitive.name == primitiveName){
		    found = true;
		    break;
		  }
		}
		if(found){
		  console.log($scope.data.tempTargets);
		  console.log(targetObj['unit'].instance);

		  $scope.data.tempTargets[targetObj['unit'].instance][targetObj['primitive'].name] = targetObj['value'];

		}
	      }
	    }
	}
	$scope.data.showTargets = true;
    };


    $scope.enableCheckers = function(){
      if(!$scope.data.powerInfo.checkers) $scope.data.powerInfo.checkers = [];
      $scope.data.showDefinedCheckersModal = true;
    };

    $scope.editCheckers = function(info, cluster){
	if(cluster.units.length == 0){
	    alert("You need to choose units first");
	    return;
	}
	if(cluster.primitives.length == 0){
	    alert("You need to upload primitives first");
	    return;
	}
	$scope.data.selectedCluster = cluster;
	$scope.data.showCheckersModal = true;
    };



    $scope.startRelease = function(info, cluster){
	if(!cluster.unit){
	    alert("You need to choose unit first");
	    return;
	}
	if(cluster.primitives.length == 0){
	    alert("You need to upload primitives first");
	    return;
	}
	$scope.data.selectedInfo = info;
	$scope.data.selectedCluster = JSON.parse(JSON.stringify(cluster));
	$scope.data.possibleRuns = [];
	httpService.get('power/runs/' + $scope.data.selectedProject + '/' + $scope.data.selectedCluster.unit,{},
			function(res){

			    $scope.data.possibleRuns = res.data;
			    $scope.data.showRelease = true;
			    $scope.updatePicker();
			},
			function(msg, code){
			    console.log(msg);
			    $rootScope.loadingState = false;
			});
    };

    $scope.openCCList = function(info, cluster){
	$scope.data.selectedInfo = info;
	$scope.data.selectedCluster = cluster;
	$scope.data.showCCList = true;
    };



    $scope.getEmptySpace = function(level){
      var sp = 10 * level;
      return {'padding-left': sp + 'px'};
    }

//     $scope.getTargetValue = function(unit, primitive){
//       if(!$scope.data.selectedCluster.targets) return;
//       for(var i=0;i<$scope.data.selectedCluster.targets.length;i++){
// 	var targetObj = $scope.data.selectedCluster.targets[i];
// 	if(targetObj['primitive'].name == primitive.name && targetObj['unit'].instance == unit.instance){
// 	  return targetObj['value'];
// 	}
//       }
//     }

    $scope.keepTargets = function(){
	$scope.data.selectedCluster.targets = [];
	var unitInstances = Object.keys($scope.data.tempTargets);
	for(var i=0;i<unitInstances.length;i++){
	  var unitInstance = unitInstances[i];
	  var found = false;
	  for(var j=0;j<$scope.data.selectedCluster.units.length;j++){
	    var unit = $scope.data.selectedCluster.units[j];
	    if(unit.instance == unitInstance){
	      found = true;
	      break;
	    }
	  }
	  if(!found){
	    alert("Unit is invalid: " + unitInstance);
	    return;
	  }
	  var primitives = Object.keys($scope.data.tempTargets[unitInstance]);
	  if(primitives.length > 0){
	    for(var j=0;j<primitives.length;j++){
	      var primitiveName = primitives[j];
	      var found = false;
	      for(var k=0;k<$scope.data.selectedCluster.primitives.length;k++){
		var primitive = $scope.data.selectedCluster.primitives[k];
		if(primitive.name == primitiveName){
		  found = true;
		  break;
		}
	      }
	      if(!found){
		alert("Primitive is invalid: " + primitiveName);
		return;
	      }
	    }
	  }
	}

	for(var i=0;i<$scope.data.selectedCluster.units.length;i++){
	  var unit = $scope.data.selectedCluster.units[i];
	  var primitives = Object.keys($scope.data.tempTargets[unit.instance]);
	  if(primitives.length > 0){
	    for(var j=0;j<primitives.length;j++){
	      var primitiveName = primitives[j];
	      var primitivePos = -1;
	      for(var k=0;k<$scope.data.selectedCluster.primitives.length;k++){
		var primitive = $scope.data.selectedCluster.primitives[k];
		if(primitive.name == primitiveName){
		  primitivePos = k;
		  break;
		}
	      }
	      var primitive = $scope.data.selectedCluster.primitives[primitivePos];
	      var val = $scope.data.tempTargets[unit.instance][primitive.name];
	      $scope.data.selectedCluster.targets.push({'primitive': primitive, 'unit': unit, 'value': val});
	    }
	  }
	}
  
	$scope.data.selectedCluster.clusterTargets = {};
	for(var i=0;i<$scope.data.selectedCluster.primitives.length;i++){
	  var primitiveName = $scope.data.selectedCluster.primitives[i].name;
	  var clusterTarget = $scope.calcClusterTarget(primitiveName);
	  if(clusterTarget){
	    $scope.data.selectedCluster.clusterTargets[primitiveName] = clusterTarget;
	  }
	}
    }


    $scope.checkIfTypeNumber = function(prop) {
	return typeof prop === 'number';
    }


    $scope.keepPrimivites = function(){
      $scope.data.primitivesCluster.primitives = $scope.data.tempPrimtives;
//       $scope.data.powerInfo[$scope.data.primitivesIndex].primitivesMetaData = $scope.data.tempPrimitivesMetaData;
    };

    $scope.deleteCore = function(indx){
      $scope.data.powerInfo.hierarchy.splice(indx,1);
    };

    $scope.deleteCluster = function(indx, cIndx){
      $scope.data.powerInfo.hierarchy[indx].clusters.splice(cIndx,1);
    };

    $scope.deletePrimitive = function(indx){
      $scope.data.tempPrimtives.splice(indx,1);
    };


    $scope.triggetUploadPrimitivesFile = function(){
	document.getElementById('primitiveFile').click(); 
    };

    $scope.triggetUploadTargetsFile = function(){
	document.getElementById('targetsFile').click(); 
    };

    $scope.triggetUploadCheckersFile = function(){
	document.getElementById('checkersFile').click(); 
    };

    $scope.triggetUploadUnitsFile = function(){
	document.getElementById('unitFile').click(); 
    };



    $scope.importPrimitives = function(){
	var input = event.target;
	var reader = new FileReader();
	$scope.data.tempPrimtives = [];
	$scope.data.tempPrimitivesMetaData = [];
	reader.onload = function(){
	    var fileData = reader.result;
	    var wb = XLS.read(fileData, {type : 'binary'});
	    wb.SheetNames.forEach(function(sheetName){
		var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]); 

		var excel = sCSV.split("\n");
		var firstRow = excel[0];

		var colsName = firstRow.split(",");
		for(var i=1;i<excel.length;i++){
		  var vals = excel[i].split(",");
		  if(!vals[0] || vals[0] == "") break;
		  var tmp = {"name": vals[0], meta: {}};
		  for(var j=1;j < vals.length;j++){
		    var title = colsName[j];
		    var val = vals[j];
		    if(!isNaN(val)){
		      tmp.meta[title] = parseInt(val);
		    }else{
		      tmp.meta[title] = val;
		    }
		  }
		  $scope.data.tempPrimtives.push(JSON.parse(JSON.stringify(tmp)));
		}

		$scope.primitivesToView($scope.data.tempPrimtives);
		$scope.$apply();
	    });
	};
	reader.readAsBinaryString(input.files[0]);
	angular.element(document.querySelector( '#primitiveFile' ) ).val(null); 
	$scope.primitiveFile = undefined;
    };


    $scope.importTargets = function(){
	var input = event.target;
	var reader = new FileReader();

	reader.onload = function(){
	    var fileData = reader.result;
	    var wb = XLS.read(fileData, {type : 'binary'});
	    wb.SheetNames.forEach(function(sheetName){
		var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]); 
// 		console.log(sCSV);
		var excel = sCSV.split("\n");
		var primitivesTitle = excel[0].split(',')
		for(var j=1;j<excel.length;j++){
		  var row = excel[j];
		  var splitted = row.split(',');
		  var unitInstance = splitted[0];

		  for(var i=1;i<splitted.length;i++){
		      var v = splitted[i];
		      if(v){
			if(!$scope.data.tempTargets[unitInstance]){
			    alert("You are trying to import non-existing unit " + unitInstance);
			    return;
			}
			v = parseInt(v, 10);
			var primitiveName = primitivesTitle[i];
			$scope.data.tempTargets[unitInstance][primitiveName] = v;
		      }
		  }
		}

		$scope.$apply();
	    });
	};
	reader.readAsBinaryString(input.files[0]);
	angular.element(document.querySelector( '#targetsFile' ) ).val(null); 
	$scope.targetsFile = undefined;
    };

    $scope.importCheckers = function(){
	var input = event.target;
	var reader = new FileReader();
	
	reader.onload = function(){
	    $scope.data.selectedCluster.checkersInfo = {'titles': [], 'checkers': []};
	    var fileData = reader.result;
	    var wb = XLS.read(fileData, {type : 'binary'});
	    wb.SheetNames.forEach(function(sheetName){
		var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]); 

		var excel = sCSV.split("\n");
		var titles = excel[0].split(',')
		$scope.data.selectedCluster.checkersInfo.titles = titles;
		for(var j=1;j<excel.length;j++){
		  var row = excel[j];
		  var splitted = row.split(',');
		  if(!splitted[0] || splitted[0] == "")continue;
		  var temp = {};
		  for(var i=0;i<splitted.length;i++){
		      var v = splitted[i];
		      if(!v || v == "") continue;
		      if(!isNaN(v)) v = parseInt(v);
		      var k = titles[i];
		      temp[k] = v;
		  }
		  $scope.data.selectedCluster.checkersInfo.checkers.push(temp);
		}
		console.log($scope.data.selectedCluster.checkersInfo);
		$scope.$apply();
	    });
	};
	reader.readAsBinaryString(input.files[0]);
	angular.element(document.querySelector( '#checkersFile' ) ).val(null); 
	$scope.checkersFile = undefined;
    };


    $scope.verifyUnitsExist = function(importedUnits){
	var deferred = $q.defer();
	var availableUnits = [];
        $rootScope.loadingState = true;
	var calls = [];

	for(var i=0;i<importedUnits.length;i++){
	  const currUnit = importedUnits[i];
	  calls.push(
            function (callback) {
	      httpService.get('power/regex/node/' ,{'level': currUnit.level, 'name': currUnit.name, 'regex_release_id': $scope.data.selectedProject + '\\|' + $scope.data.selectedInfo.core.name + '\\|' + $scope.data.selectedCluster.name + '\\|'}, function(res){
		if(res && res.data){
		  availableUnits.push(res.data);
		}
		callback();
	      }, function(msg, code){console.log(msg);callback('error'); })
            }
	  );
	  
	}

        async.series(calls, function (err) {

	    $rootScope.loadingState = false;
	    deferred.resolve(availableUnits);

        });


	return deferred.promise;
    };

    $scope.importUnits = function(){
// 	$scope.data.selectedCluster.units

	var input = event.target;
	var reader = new FileReader();
	
	reader.onload = function(){
	    var fileData = reader.result;
	    var wb = XLS.read(fileData, {type : 'binary'});
	    wb.SheetNames.forEach(function(sheetName){
		var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]); 
		var excel = sCSV.split("\n");
		var titles = excel[0].split(',');
		var importedUnits = [];
		for(var j=1;j<excel.length;j++){
		  var line = excel[j];
		  if(line && line != ""){
		    var info = line.split(',')
		    var unit = {};
		    unit.level = parseInt(info[0], 10);
		    unit.name = info[1];
		    importedUnits.push(unit);
		  }
		}
		var ans = $scope.verifyUnitsExist(importedUnits);
		ans.then(function(results){
		    if(results.length != importedUnits.length){
		      alert("Not all nodes you entered where found!");
		      return;
		    }
		    $scope.data.selectedCluster.units = results;
		    //$scope.data.selectedCluster.tempUnits = results;

		    $scope.data.showSetUnitsModal = false;

		});
		$scope.$apply();
	    });
	};
	reader.readAsBinaryString(input.files[0]);
	angular.element(document.querySelector( '#unitFile' ) ).val(null); 
	$scope.unitFile = undefined;
    };



    $scope.getCheckersToExport = function(){
	var data=[];
	var titles = ['instance'];
	for(var i=0;i<$scope.data.tempPrimitivesMetaData.length;i++){
	    
	}
	data.push(titles);
	for(var i=0;i<$scope.data.tempPrimtives.length;i++){
	    var primitive = $scope.data.tempPrimtives[i];
	    var info = [primitive.name];
	    for(var j=0;j<$scope.data.tempPrimitivesMetaData.length;j++){
		var key = $scope.data.tempPrimitivesMetaData[j];
		info.push(primitive.meta[key]);
	    }
	    data.push(info);
	}
	return data;
    };


    $scope.getPrimitivesToExport = function(){
	var data=[];
	var titles = ['name'];
	for(var i=0;i<$scope.data.tempPrimitivesMetaData.length;i++){
	    titles.push($scope.data.tempPrimitivesMetaData[i]);
	}
	data.push(titles);
	for(var i=0;i<$scope.data.tempPrimtives.length;i++){
	    var primitive = $scope.data.tempPrimtives[i];
	    var info = [primitive.name];
	    for(var j=0;j<$scope.data.tempPrimitivesMetaData.length;j++){
		var key = $scope.data.tempPrimitivesMetaData[j];
		info.push(primitive.meta[key]);
	    }
	    data.push(info);
	}
	return data;
    };

    $scope.getTargetsToExport = function(){
	var data=[];
	var titles = ['instance (DONT CHANGE)'];
	for(var i=0;i<$scope.data.selectedCluster.primitives.length;i++){
	    titles.push($scope.data.selectedCluster.primitives[i].name);
	}
	data.push(titles);
	for(var i=0;i<$scope.data.selectedCluster.units.length;i++){
	    var unit = $scope.data.selectedCluster.units[i];
	    if(unit.isCluster && unit.cluster.units.length > 0){
	      for(var k=0;k<unit.cluster.units.length;k++){
		var clusterUnit = unit.cluster.units[k];
		var info = [unit.instance+":"+clusterUnit.instance];
		for(var j=0;j<$scope.data.selectedCluster.primitives.length;j++){
		    var val = $scope.getTargetValue(unit.cluster, clusterUnit, $scope.data.selectedCluster.primitives[j].name);
		    info.push(val);
		}
		data.push(info);
	      }
	    }else{
	      var info = [unit.instance];
	      for(var j=0;j<$scope.data.selectedCluster.primitives.length;j++){
		  var val = $scope.data.tempTargets[unit.instance][$scope.data.selectedCluster.primitives[j].name];
		  info.push(val);
	      }
	      data.push(info);
	    }
	}
	return data;
    };


    $scope.getTargetsRows = function(){
	var levels = [{}];
	for(var i=0;i<$scope.data.selectedCluster.units.length;i++){
	    var unit = $scope.data.selectedCluster.units[i];
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


    $scope.getUnitsToExport = function(){
	var data=[];
	var titles = ['level', 'name', 'instance'];
	data.push(titles);
	for(var i=0;i<$scope.data.selectedCluster.units.length;i++){
	    var item = $scope.data.selectedCluster.units[i];
	    var info = [];

	    info.push(item.level);
	    info.push(item.name);
	    info.push(item.instance);
	    data.push(info);
	}
	return data;
    };


    $scope.exportPrimitives = function(){
	var link = document.createElement('a');
	link.href = 'data:application/csv;charset=utf-8,' + encodeURI($scope.data.tempPrimtives.join("\r\n"))
	link.target = "_blank";
	link.download = $scope.data.selectedProject + "_primitives" + ".txt";
	document.body.appendChild(link);
	link.click(); 
    };

    $scope.getPrimitivesFileName = function(){
	return $scope.data.selectedProject + "_primitives";
    };
    $scope.getTargetsFileName = function(){
	return $scope.data.selectedProject + "_targets";
    };
    $scope.getCheckersFileName = function(){
	return $scope.data.selectedProject + "_checkers";
    };
    $scope.getUnitsFileName = function(){
	return $scope.data.selectedProject + "_units";
    };


    $scope.getInstanceSuggesions = function(instance) {
      if(!instance || instance.length == 0) return;

      return $http({
	method: 'GET',
	url: $rootScope.serverUrl + 'power/suggestions/' + $scope.unitsLatestReleaseId,
	params: {'instance':instance}
      }).then(function successCallback(response) {
	$scope.results = response.data;
	return $scope.results;
      }, function errorCallback(response) {
	console.log(response);
      });
    };


    $scope.onSelectInstance = function ($item, $model, $label, $event) {
      $rootScope.loadingState = true;
      httpService.get('power/tree/search/' + $scope.unitsLatestReleaseId,{'instance':$item.instance},
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

    $scope.exportRunIds = function(){
	var link = document.createElement('a');
	var txt = "";
	for(var i=0;i<$scope.data.possibleRuns.length;i++){
	  var run = $scope.data.possibleRuns[i];
	  txt += run.tag + "-" + run.run_id + "\r\n";
	}
	link.href = 'data:application/csv;charset=utf-8,' + encodeURI(txt)
	link.target = "_blank";
	link.download = $scope.data.selectedProject + "_runIds" + ".txt";
	document.body.appendChild(link);
	link.click(); 
    };



});




































