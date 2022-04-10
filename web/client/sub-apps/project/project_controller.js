app.factory('projectDataService', function ($q, $timeout, $rootScope, $location, httpService) {
	console.log('projectDataService');


    var self = this;
    var deferred = $q.defer();
    self.data = {};

    self.loadData = function (cb) {
        $rootScope.loadingState = true;
        self.projects = [];

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




app.controller('projectCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr) {
    $rootScope.mainClass = 'project-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;



    $timeout(function() {
	$('.selectPicker').selectpicker('refresh');
    });
    


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
			  $scope.data.selectedReleases = [];

			  $scope.data.excelsPath = {};


			  for(var i=0;i<$scope.data.projectAreaFullchipCores.length;i++){
			      var currCore = res.data.areaChip.cores[i][0];
			      $scope.data.excelsPath[currCore['release_name']] = currCore['excelPath'];
			      if($scope.data.projectCoresList.indexOf(currCore['core']) == -1) {
				  $scope.data.projectCoresList.push(currCore['core']);
				  $scope.data.selectedReleases.push({'core': currCore['core'], 'rtl': currCore['rtl_name'], 'release': currCore['release_name']})
				  $scope.getAreaRelease($scope.data.selectedReleases.length-1);
			      }
			  }
			  for(var i=0;i<$scope.data.projectLeakageFullchipCores.length;i++){
			      var currCore = res.data.leakageChip.cores[i][0];
			      $scope.data.excelsPath[currCore['release_name']] = currCore['excelPath'];
			      if($scope.data.projectCoresList.indexOf(currCore['core']) == -1) {
				  $scope.data.projectCoresList.push(currCore['core']);
				  $scope.data.selectedReleases.push({'core': currCore['core'], 'rtl': currCore['rtl_name'], 'release': currCore['release_name']})
			      }
			  }
			  for(var i=0;i<$scope.data.selectedReleases.length;i++){
			      $scope.getLeakageRelease(i);
			  }
			  
			  for(var i=0;i<$scope.data.selectedReleases.length;i++){
			      $scope.getTimingRelease(i);
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

	return rtlList;
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
	return releaseList;
    }

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




    $scope.rtlSelected = function(ind){
	$timeout(function() {
	    $('.selectPicker').selectpicker('refresh');
	});

	$scope.getTimingRelease(ind);
	$scope.getAreaRelease(ind);
	$scope.getLeakageRelease(ind);
    }


    $scope.releaseSelected = function(ind){
	$timeout(function() {
	    $('.selectPicker').selectpicker('refresh');
	});
	$scope.getTimingRelease(ind);
	$scope.getAreaRelease(ind);
	$scope.getLeakageRelease(ind);
    }

    $scope.getTimingRelease = function(indx){
	if(!$scope.data.selectedProject || !$scope.data.selectedReleases[indx].core || !$scope.data.selectedReleases[indx].rtl || !$scope.data.selectedReleases[indx].release) return;
	$scope.data.selectedReleases[indx].timing_exists = false;

	httpService.get('summary/qor/' + $scope.data.selectedProject + '|' + $scope.data.selectedReleases[indx].core + '|' + $scope.data.selectedReleases[indx].rtl + '|' + $scope.data.selectedReleases[indx].release ,{'releaseType': 'released'},
			function(res){
			    if(res.data && res.data.length > 0){
			      console.log(res.data);
			      $scope.data.selectedReleases[indx].timing_release_info = {};
			      var wns = 0;
			      var tns = 0;
			      var fep = 0;

			      for(var i=0;i<res.data.length;i++){
				var scenario = res.data[i]['scenario'];
				if(scenario=="SYSTEM_SLOW"){
				  tns += res.data[i]['total_negative_slack'];
				  fep += res.data[i]['no_of_violating_paths'];
				  if(res.data[i]['critical_path_slack'] < wns){
				      wns = res.data[i]['critical_path_slack'];
				  }
				}
			      }
			      $scope.data.selectedReleases[indx].timing_release_info.tns = tns;
			      $scope.data.selectedReleases[indx].timing_release_info.fep = fep;
			      $scope.data.selectedReleases[indx].timing_release_info.wns = wns;

			      if($scope.data.selectedReleases[indx].timing_release_info){
				$scope.data.selectedReleases[indx].timing_exists = true;
			      }
			    }
			},
			function(msg, code){
			    console.log(msg);
			});
    }


    $scope.getAreaRelease = function(indx){
	if(!$scope.data.selectedProject || !$scope.data.selectedReleases[indx].core || !$scope.data.selectedReleases[indx].rtl || !$scope.data.selectedReleases[indx].release) return;
	$scope.data.selectedReleases[indx].area_exists = false;

	httpService.get('area/' + $scope.data.selectedProject + '|' + $scope.data.selectedReleases[indx].core + '|' + $scope.data.selectedReleases[indx].rtl + '|' + $scope.data.selectedReleases[indx].release ,{'parent': 'root', 'releaseType': 'released'},
			function(res){
			    $scope.data.selectedReleases[indx].area_release_info = res.data[0];
			    if($scope.data.selectedReleases[indx].area_release_info){
			      $scope.data.selectedReleases[indx].area_exists = true;
			    }
			},
			function(msg, code){
			    console.log(msg);
			});
    }

    $scope.getLeakageRelease = function(indx){
	if(!$scope.data.selectedProject || !$scope.data.selectedReleases[indx].core || !$scope.data.selectedReleases[indx].rtl || !$scope.data.selectedReleases[indx].release) return;

	$scope.data.selectedReleases[indx].leakage_exists = false;
	httpService.get('leakage/' + $scope.data.selectedProject + '|' + $scope.data.selectedReleases[indx].core + '|' + $scope.data.selectedReleases[indx].rtl + '|' + $scope.data.selectedReleases[indx].release ,{'parent': 'root', 'releaseType': 'released'},
			function(res){
			    $scope.data.selectedReleases[indx].leakage_release_info = res.data[0];
			    var node = $scope.data.selectedReleases[indx].leakage_release_info;
			    if(node && node['stdcell']['ratio']){

			      var maxValue = -1;
			      for(var i=0;i<node['stdcell']['size'].length;i++){
				  var vt = node['stdcell']['size'][i];
				  var vt2 = node['stdcell']['current'][i];
				  if(vt2['value'] != 0 && vt['value']/vt2['value'] > maxValue){
				      maxValue = vt['value']/vt2['value'];
				  }
			      }

			      var colors = [];
			      for(var i=0;i<node['stdcell']['ratio'].length;i++){
				  var vt = node['stdcell']['size'][i];
				  var vt2 = node['stdcell']['current'][i];

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

			      var labels = [];
			      var values = [];
			      var summary = "";
			      var pieColors = generateColors(colors);
			      for(var i=0;i<node['stdcell']['ratio'].length;i++){
				var vt = node['stdcell']['ratio'][i];
				labels.push(vt['type']);
				values.push(vt['value']);
				summary +=labels[i]+": "+values[i]+" ,";
			      }

			      $scope.data.selectedReleases[indx].leakage_release_info.pieColors = pieColors;
			      $scope.data.selectedReleases[indx].leakage_release_info.labels = labels;
			      $scope.data.selectedReleases[indx].leakage_release_info.values = values;
			      $scope.data.selectedReleases[indx].leakage_release_info.summary = summary;


// 			      var currNodeTotal = 0;
// 			      for(var i=0;i<node['stdcell']['current'].length;i++){
// 				  currNodeTotal += node['stdcell']['current'][i]['value'];
// 			      }
// 			      $scope.data.selectedReleases[indx].leakage_release_info.total_current = currNodeTotal;
// 
// 			      var currNodeTotal = 0;
// 			      for(var i=0;i<node['memory']['current'].length;i++){
// 				if(node['memory']['current'][i]['mode'] == "stdby"){
// 				  currNodeTotal += node['memory']['current'][i]['value'];
// 				}
// 			      }
// 			      $scope.data.selectedReleases[indx].leakage_release_info.total_stdby = currNodeTotal;


			      if($scope.data.selectedReleases[indx].leakage_release_info.labels)
				$scope.data.selectedReleases[indx].leakage_exists = true;
			    }
			},
			function(msg, code){
			    console.log(msg);
			});
    }


    $scope.getAreaKgStdcellTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.selectedReleases && i<$scope.data.selectedReleases.length;i++){
	  var core = $scope.data.selectedReleases[i];
	  if(core.area_release_info && core.area_release_info.total_std && core.area_release_info.total_std.area)
	    sum += core.area_release_info.total_std.area / 1000 / (core.area_release_info.G_NAND_EQU_CELL)
      }
      return sum;
    }
    $scope.getAreaKbMemoryTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.selectedReleases && i<$scope.data.selectedReleases.length;i++){
	  var core = $scope.data.selectedReleases[i];
	  if(core.area_release_info && core.area_release_info.total_memory && core.area_release_info.total_memory.KB)
	    sum += core.area_release_info.total_memory.KB
      }
      return sum;

    }
    $scope.getAreaCellcountTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.selectedReleases && i<$scope.data.selectedReleases.length;i++){
	  var core = $scope.data.selectedReleases[i];
	  if(core.area_release_info && core.area_release_info.stdcell){
	    var keys = Object.keys(core.area_release_info.stdcell);
	    for(var j=0;j<keys.length;j++){
	      var key = keys[j];
	      var curr_count = core.area_release_info.stdcell[key].count;
	      sum += curr_count;
	    }
	  }
      }
      return sum;
    }

    $scope.getAreaCellcount = function(release){
      var sum = 0;
      if(release && release.stdcell){
	var keys = Object.keys(release.stdcell);
	for(var j=0;j<keys.length;j++){
	  var key = keys[j];
	  var curr_count = release.stdcell[key].count;
	  sum += curr_count;
	}
      }
      return sum;
    };

    $scope.getLeakageTotalCurrent = function(){
      var sum = 0;
      for(var i=0;$scope.data.selectedReleases && i<$scope.data.selectedReleases.length;i++){
	  var core = $scope.data.selectedReleases[i];
	  if(core.leakage_release_info && core.leakage_release_info.total_current)
	    sum += core.leakage_release_info.total_current
      }
      return sum;

    }
    $scope.getLeakageTotalStdby = function(){
      var sum = 0;
      for(var i=0;$scope.data.selectedReleases && i<$scope.data.selectedReleases.length;i++){
	  var core = $scope.data.selectedReleases[i];
	  if(core.leakage_release_info && core.leakage_release_info.total_stdby)
	    sum += core.leakage_release_info.total_stdby
      }
      return sum;

    }
    $scope.getMacroTotal = function(){
      var sum = 0;
      for(var i=0;$scope.data.selectedReleases && i<$scope.data.selectedReleases.length;i++){
	  var core = $scope.data.selectedReleases[i];
	  if(core.area_release_info && core.area_release_info.macro)
	    sum += core.area_release_info.macro.area
      }
      return sum;

    }



    $scope.getRleasePath = function(tab,indx){
      if(tab == "timing"){
	return "synthesis/"+tab+"?reportType=vio_all&delayType=max&scenarioName=SYSTEM_SLOW&releaseType=released&project=" + $scope.data.selectedProject + "&core="+$scope.data.selectedReleases[indx].core+ "&rtl="+$scope.data.selectedReleases[indx].rtl+ "&release="+$scope.data.selectedReleases[indx].release
      }
      return "synthesis/"+tab+"?releaseType=released&project=" + $scope.data.selectedProject + "&core="+$scope.data.selectedReleases[indx].core+ "&rtl="+$scope.data.selectedReleases[indx].rtl+ "&release="+$scope.data.selectedReleases[indx].release;
    }

    
    $scope.getExcelPath = function(excelPath){
      var link = document.createElement('a');
      link.href = $rootScope.filesUrl + "path/" +encodeURIComponent(excelPath);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click(); 

/*      httpService.get('project/excel',{'path': excelPath},
		      function(res){
			  console.log(res);

			  var fileName = $scope.data.selectedProject + "--" + release.core + "--" + release.release;  
			  var headers = res.headers();
			  var fileType = headers['content-type'];
			  var blob = new Blob([res.data], { type: fileType });
			  var objectUrl = window.URL || window.webkitURL;
			  var link = angular.element('<a/>');

			  link.css({ display: 'none' });
			  link.attr({
			      href : objectUrl.createObjectURL(blob),
			      target: '_blank',
			      download : fileName
			  })
			  link[0].click();
			  link.remove();
			  objectUrl.revokeObjectURL(blob);

		      },
		      function(msg, code){
			  console.log(msg);
		      });*/
    }


});




































