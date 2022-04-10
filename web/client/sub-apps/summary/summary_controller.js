app.factory('summaryDataService', function ($q, $timeout, $rootScope, $location, httpService) {
    console.log('summaryDataService');


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




app.controller('summaryCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo) {
    $rootScope.mainClass = 'summary-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;


    function mouseOver(elm) {
	console.log(elm.id);
    }

    function mouseOut(elm) {
	console.log(elm.id);
    }



    var tooltipWNS = "Worst Negative Slack";
    var tooltipTNS = "Total Negative Slack";
    var tooltipFEP = "Failing End Points";
    var tooltipKgates = "area of design measured in nand2 equivalent";
    var tooltipKbyte = "size of memory in KB";


    $scope.data.areaPieOptions = {legend: {display: true}, options: {  
      responsive: false,
      maintainAspectRatio: false
    }};

    $scope.data.runTimePieOptions = {legend: {display: false}};



//     for(var i=0;i<108;i++){
//       var poly=document.getElementById("poly"+i);  
// 
//       poly.onmouseover = function() {mouseOver(poly)};
//       poly.onmouseout = function() {mouseOut(poly)};
// 
//     }




    $scope.releaseTypeSelected = function(){
	if($scope.data.releaseType != "unreleased" && $scope.data.releaseType != "released") return;

	httpService.get('summary/init_info', {releaseType: $scope.data.releaseType}, function(res){
	    $scope.data.projects = res.data;

	}, function(msg, code){console.log(msg); })

    }

    $scope.projectSelected = function(){

	httpService.get('summary/' + $scope.data.selectedProject, {}, function(res){
	    $scope.data.projectUnits = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.unitSelected = function(){

	httpService.get('summary/' + $scope.data.selectedProject +'/' + $scope.data.selectedUnit, {}, function(res){
	    $scope.data.projectUsers = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.userSelected = function(){

	httpService.get('summary/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedUser, {}, function(res){
	    $scope.data.projectRunids = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.runidSelected = function(){

	httpService.get('summary/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedUser + '/' + $scope.data.selectedRunid, {}, function(res){
	    $scope.data.projectStages = res.data;

	}, function(msg, code){console.log(msg); })
    }

    $scope.stageSelected = function(){

	httpService.get('summary/' + $scope.data.selectedProject + '/' + $scope.data.selectedUnit + '/' + $scope.data.selectedUser + '/' + $scope.data.selectedRunid + '/' + $scope.data.selectedStage, {}, function(res){
	    $scope.data.projectDates = res.data;

	}, function(msg, code){console.log(msg); })
    }
    


    $scope.getPropertyValue = function(sData, category, subCatogry, property){
      
      for(var i=0;i<sData.length;i++){
	var curr_category = sData[i];
	var name = curr_category.name;
	if(name == category){
	  for(var j=0;j<sData[i].subCategories.length;j++){
	      var subCategory = sData[i].subCategories[j];
	      var sub_name = subCategory.sub_name;
	      if(sub_name == subCatogry){
		for(var k=0;k<sData[i].subCategories[j].data.length;k++){
		  var propr = subCategory.data[k];
		  var propr_name = propr.property;
		  if(propr_name == property){
		    return sData[i].subCategories[j].data[k].result;
		  }
		}
	      }
	  }
	}
      }
    };

    $scope.getSubCategoryValues = function(sData, category, subCatogry){
      
      for(var i=0;i<sData.length;i++){
	var curr_category = sData[i];
	var name = curr_category.name;
	if(name == category){
	  for(var j=0;j<sData[i].subCategories.length;j++){
	      var subCategory = sData[i].subCategories[j];
	      var sub_name = subCategory.sub_name;
	      if(sub_name == subCatogry){
		return sData[i].subCategories[j].data;
	      }
	  }
	}
      }
    };

    $scope.getCategoryValues = function(sData, category){
      for(var i=0;i<sData.length;i++){
	var curr_category = sData[i];
	var name = curr_category.name;
	if(name == category){
	  return curr_category;
	}
      }
    };


    $scope.converrunTimeResultToNumber = function(strTime){
      strTime = strTime.replace("minutes", "*60");
      strTime = strTime.replace("and", "+");
      strTime = strTime.replace("hours", "*3600");
      return eval(strTime);
    };


    $scope.fetchSummaryInfo = function(){

	var release_id = "";
	if($scope.data.selectedReleaseType == "released"){
	    release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
	}
	if($scope.data.selectedReleaseType == "unreleased"){
	    release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
	}

	$scope.data.showSummaryInfo = false;

	$scope.data.summaryStepArea = [];
	$scope.data.summaryStepTiming = [];

	httpService.get('summary/data/' + release_id, {releaseType :$scope.data.selectedReleaseType}, function(res){

	    if((Array.isArray(res.data) && res.data.length == 0) || (Object.keys(res.data).length == 0)){
		$scope.data.noDataInfo = true;
		$rootScope.loadingState = false;
		return;
	    }
	    $scope.data.noDataInfo = false;


// 	    $scope.data.summaryData = res.data;
	    $scope.data.showSummaryInfo = true;

	    
	    var staticsCategory = $scope.getCategoryValues(res.data, "Statistics");
	    var mvStatistics = $scope.getSubCategoryValues(res.data, "Power & DFT", "MV statistics");

	    $scope.data.summaryData = [];
	    if(staticsCategory){
	      staticsCategory.name = "Detailed design statistics";
	      staticsCategory.subCategories.push({sub_name: "MV statistics", data: mvStatistics});
	      $scope.data.summaryData.push(staticsCategory);
	    }
	    

	    $scope.data.indicatorsSummary = [];
	    $scope.data.summaryCheckInfo = [];
	    

	    $scope.data.runTimeStepSummary = [];

	    var runsProperties = $scope.getSubCategoryValues(res.data, "Run time", "");
	    $scope.data.runtimePieLabels = [];
	    $scope.data.runtimePieValues = [];
	    if(runsProperties){
	      for(var i=0;i<runsProperties.length;i++){
		  var runProperty = runsProperties[i];
		  if(runProperty.result == "N/A"){
		    runProperty.result = "0";
		  }
		  tmp = {};
		  tmp['title'] = runProperty.property;
		  tmp['description'] = runProperty.result;
		  $scope.data.runTimeStepSummary.push(tmp);

		  var val = $scope.converrunTimeResultToNumber(runProperty.result) / 60 / 60;
		  $scope.data.runtimePieLabels.push(runProperty.property + "(hour)");
		  $scope.data.runtimePieValues.push(val);
	      }
	    }





	    var tmp = {};
// 	    console.log($scope.getPropertyValue($scope.data.summaryData, "Area", "", " Gate count"));
// 	    tmp.title = "Gate Count";
// 	    tmp.value = $scope.getPropertyValue($scope.data.summaryData, "Area", "", " Gate count");
// 	    tmp.color = "transparent";
// 
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));
// 
// 	    console.log($scope.getPropertyValue($scope.data.summaryData, "Area", "", " Memories size"));
// 	    tmp.title = "Memory KB";
// 	    tmp.value = $scope.getPropertyValue($scope.data.summaryData, "Area", "", " Memories size");
// 	    tmp.color = "transparent";
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));


// 	    tmp.title = "WNS";
// 	    val1 = $scope.getPropertyValue($scope.data.summaryData, "Timing", "Timing - SYSTEM SLOW", " Worst negative slack (ns)");
// 	    if (typeof val1 === 'undefined') {
// 		val1 = $scope.getPropertyValue($scope.data.summaryData, "Timing", "Timing - SYSTEM SLOW", " Worst negative slack (ps)");
// 		if (typeof val1 !== 'undefined') {
// 		   val1 = val1 / 1000;   
// 		}
// 	    }
// 	    if(val1 < 0.1){
// // 	      tmp.value = "OK";
// 	      tmp.color = "#98FB98";
// 	    }else if(val1 < 0.2){
// // 	      tmp.value = "Warning";
// 	      tmp.color = "#FAFAD2";
// 	    }else{
// // 	      tmp.value = "Fail";
// 	      tmp.color = "#FF6347";
// 	    }
// 	    tmp.value = val1;
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));
// 
// 
// 	    tmp.title = "TNS";
// 	    val1 = $scope.getPropertyValue($scope.data.summaryData, "Timing", "Timing - SYSTEM SLOW", " Total negative slack (ns)");
// 	    if (typeof val1 === 'undefined') {
// 		val1 = $scope.getPropertyValue($scope.data.summaryData, "Timing", "Timing - SYSTEM SLOW", " Total negative slack (ps)");
// 		if (typeof val1 !== 'undefined') {
// 		   val1 = val1 / 1000;   
// 		}
// 	    }
// 	    if(val1 < 50){
// // 	      tmp.value = "OK";
// 	      tmp.color = "#98FB98";
// 	    }else if(val1 < 200){
// // 	      tmp.value = "Warning";
// 	      tmp.color = "#FAFAD2";
// 	    }else{
// // 	      tmp.value = "Fail";
// 	      tmp.color = "#FF6347";
// 	    }
// 	    tmp.value = val1;
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));
// 
// 
// 	    tmp.title = "FEP";
// 	    val1 = $scope.getPropertyValue($scope.data.summaryData, "Timing", "Timing - SYSTEM SLOW", " Failing end points");
// 	    if(val1 < 100){
// // 	      tmp.value = "OK";
// 	      tmp.color = "#98FB98";
// 	    }else if(val1 < 500){
// // 	      tmp.value = "Warning";
// 	      tmp.color = "#FAFAD2";
// 	    }else{
// // 	      tmp.value = "Fail";
// 	      tmp.color = "#FF6347";
// 	    }
// 	    tmp.value = val1;
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));


// 	    var val1 = $scope.getPropertyValue($scope.data.summaryData, "RTL constraints quality", "Check Timing", " generated_clocks");
// 	    var val2 = $scope.getPropertyValue($scope.data.summaryData, "RTL constraints quality", "Check Timing", " loops")
// 	    tmp.title = "Check timing";
// 	    if(val1 == 0 && val2 == 0){
// // 	      tmp.value = "OK";
// 	      tmp.color = "#98FB98";
// 	    }else{
// // 	      tmp.value = "Fail";
// 	      tmp.color = "#FF6347";
// 	    }
// 	    tmp.value = "generated_clocks: " + val1 + " loops: " + val2;
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));


// 	    var val1 = $scope.getPropertyValue($scope.data.summaryData, "RTL constraints quality", "Elaborate Check Design", " Multiply driven inputs (LINT-6)");
// 	    var val2 = $scope.getPropertyValue($scope.data.summaryData, "RTL constraints quality", "Elaborate Check Design", " Net has multiple drivers (LINT-4)")
// 	    tmp.title = "Check design";
// 	    if(val1 == 0 && val2 == 0){
// 	      tmp.value = "OK";
// 	      tmp.color = "#98FB98";
// 	    }else{
// 	      tmp.value = "Fail";
// 	      if(val1 != 0)
// 		tmp.value += "Multiply driven inputs (LINT-6) > 0 ";
// 	      if(val2 != 0)
// 		tmp.value += "Net has multiple drivers (LINT-4) > 0";
// 	      tmp.value += ", please review check_design report";
// 
// 	      tmp.color = "#FF6347";
// 	    }
// 	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));



/*	    val1 = $scope.getPropertyValue($scope.data.summaryData, "Power & DFT", "MV status", " Missing isolation (MV-514)");
	    val2 = $scope.getPropertyValue($scope.data.summaryData, "Power & DFT", "MV status", " Missing isolation (MV-514a)");

	    tmp.title = "Check MV (UPF)";
	    if(val1 == 0 && val2 == 0){
	      tmp.value = "OK";
	      tmp.color = "#98FB98";
	    }else if(val1 < 5 && val2 < 5){
	      tmp.value = "Warning: Too many missing ISO, please review check_mv_design report";
	      tmp.color = "#FAFAD2";
	    }else{
	      tmp.value = "Fail : Too many missing ISO, please review check_mv_design report";
	      tmp.color = "#FF6347";
	    }
	    $scope.data.indicatorsSummary.push(JSON.parse(JSON.stringify(tmp)));*/
    


	    httpService.get('summary/check_design/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
			    function(res){
			      var tmp = {title: "Check design"};
			      tmp.color = "#98FB98";
			      if(res.data && res.data.info){
				tmp.data = {};
				var keys = Object.keys(res.data.info);
				for(var i=0;i<keys.length;i++){
				  var key = keys[i];
				  tmp.data[key] = {'objects': res.data.info[key]}
				}
				var v1 = 0;
				var v2 = 0;
				if(res.data.info['LINT-6']) v1 = 1;
				if(res.data.info['LINT-4']) v2 = 1;
				if(v1 == 0 && v2 == 0){
				  tmp.color = "#98FB98";
				}else{
				  tmp.color = "#ff6347e0";
				}
			      }
			      $scope.data.summaryCheckInfo.push(tmp);
			    },
			    function(msg, code){
				console.log(msg);
			    });

	    httpService.get('summary/check_timing/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
			    function(res){


			      var tmp = {title: "Check timing"};
			      tmp.data = res.data;
// 			      tmp.color = "#98FB98";
/*			      if(res.data && res.data.info){
				tmp.data = {};
				var keys = Object.keys(res.data.info);
				for(var i=0;i<keys.length;i++){
				  var key = keys[i];
				  tmp.data[key] = {'objects': res.data.info[key]}
				}
				var critical = 0;
				if(res.data.info['unconstrained_endpoints'] && res.data.info['unconstrained_endpoints'].length < 1000) critical = 1;
				if(res.data.info['unconstrained_endpoints'] && res.data.info['unconstrained_endpoints'].length >= 1000) critical = 2;
				if(res.data.info['generated_clocks']) critical = 2;
				if(res.data.info['loops']) critical = 2;
				if(critical == 1){
				  tmp.color = "#FAFAD2";
				}
				if(critical == 2){
				  tmp.color = "#ff6347e0";
				}
			      }*/
			      $scope.data.summaryCheckInfo.push(tmp);

			    },
			    function(msg, code){
				console.log(msg);
			    });

	    httpService.get('summary/mv_drc/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
			    function(res){
			      var tmp = {title: "Check MV (UPF)"};
			      tmp.color = "#98FB98";
			      if(res.data && res.data.info){
				tmp.data = {};
				var keys = Object.keys(res.data.info);
				for(var i=0;i<keys.length;i++){
				  var key = keys[i];
				  tmp.data[key] = {'objects': res.data.info[key]}
				}
				var v1 = 0;
				var v2 = 0;
				if(res.data.info['MV-514']) v1 = res.data.info['MV-514'].length;
				if(res.data.info['MV-514a']) v2 = res.data.info['MV-514a'].length;
				if(v1 == 0 && v2 == 0){
				  tmp.color = "#98FB98";
				}else if(v1 < 5 && v2 < 5){
				  tmp.color = "#FAFAD2";
				}else{
				  tmp.color = "#ff6347e0";
				}
			      }
			      $scope.data.summaryCheckInfo.push(tmp);

			    },
			    function(msg, code){
				console.log(msg);
			    });



	    $scope.data.leakageStepSummary = [];

	    httpService.get('leakage/' + release_id ,{'parent': 'root',releaseType: $scope.data.selectedReleaseType},
			    function(res){
				console.log(res.data[0]['stdcell']);
				if(res.data && res.data.length > 0 && res.data[0]['stdcell'] && res.data[0]['stdcell']['ratio'] && res.data[0]['stdcell']['ratio'].length > 0){

				  $scope.data.leakageStepSummary = [];
				  $scope.data.leakagePieLabels = [];
				  $scope.data.leakagePieValues = [];

				  for(var i=0;i<res.data[0]['stdcell']['ratio'].length;i++){
				      var rat = res.data[0]['stdcell']['ratio'][i];
				      tmp = {};
				      tmp['title'] = rat['type'];
				      tmp['description'] = rat['value'];
				      $scope.data.leakageStepSummary.push(tmp);

				      $scope.data.leakagePieLabels.push(rat['type']);
				      $scope.data.leakagePieValues.push(rat['value']);

				  }
				}

			    },
			    function(msg, code){
				console.log(msg);
			    });



	    httpService.get('area/' + release_id ,{'parent': 'root',releaseType: $scope.data.selectedReleaseType},
			    function(res){

				if(res.data && res.data.length > 0 && res.data[0]['total_std']){

				  $scope.data.summaryStepArea = [];

				  tmp = {};
				  tmp['title'] = 'K gates';
				  tmp['tooltip'] = tooltipKgates;
				  tmp['description'] = Math.round(res.data[0]['total_std']['area'] / 1000 / (res.data[0]['G_NAND_EQU_CELL']));
				  $scope.data.summaryStepArea.push(tmp);

				  tmp = {};
				  tmp['title'] = 'K byte';
				  tmp['tooltip'] = tooltipKbyte;
				  tmp['description'] = Math.round(res.data[0]['total_memory']['KB']);
				  $scope.data.summaryStepArea.push(tmp);

				  tmp = {};
				  tmp['title'] = 'Cell count';
				  tmp['description'] = Math.round(res.data[0]['total_std']['count']);
				  $scope.data.summaryStepArea.push(tmp);

// 				  tmp = {};
// 				  tmp['title'] = 'memory- area [u2]';
// 				  tmp['description'] = Math.round(res.data[0]['total_memory']['area']);
// 				  $scope.data.summaryStepArea.push(tmp);
// 
// 				  tmp = {};
// 				  tmp['title'] = 'stdcell- cell count';
// 				  tmp['description'] = Math.round(res.data[0]['total_std']['count']);
// 				  $scope.data.summaryStepArea.push(tmp);
// 
// 
// 				  tmp = {};
// 				  tmp['title'] = 'stdcell- area [u2]';
// 				  tmp['description'] = Math.round(res.data[0]['total_std']['area']);
// 				  $scope.data.summaryStepArea.push(tmp);


				  $scope.data.areaPieLabels = [];
				  $scope.data.areaPieValues = [];
				  
				  $scope.data.areaPieLabels.push('macro');
				  $scope.data.areaPieValues.push(Math.round(res.data[0]['macro']['area']));
				  $scope.data.areaPieLabels.push('memory');
				  $scope.data.areaPieValues.push(Math.round(res.data[0]['total_memory']['area']));
				  $scope.data.areaPieLabels.push('stdcell');
				  $scope.data.areaPieValues.push(Math.round(res.data[0]['total_std']['area']));
				}

			    },
			    function(msg, code){
				console.log(msg);
			    });




	    httpService.get('summary/qor/' + release_id ,{releaseType: $scope.data.selectedReleaseType},
			    function(res){
			      $scope.data.summaryQorInfo = res.data;
			      $scope.data.summaryStepTiming = [];

			      
			      var scenarios = [];
			      for(var i = 0; i<$scope.data.summaryQorInfo.length;i++){
				var obj = $scope.data.summaryQorInfo[i];
				if(scenarios.indexOf(obj.scenario) == -1){
				  scenarios.push(obj.scenario);
				}
			      }
			      
			      var timingDataByScenarios = [];
			      for(var i=0;i<scenarios.length;i++){
				timingDataByScenarios.push([]);
			      }
			      
			      for(var i = 0; i<$scope.data.summaryQorInfo.length;i++){
				var obj = $scope.data.summaryQorInfo[i];
				var scenarioPos = scenarios.indexOf(obj.scenario);
				timingDataByScenarios[scenarioPos].push(obj);
			      }

			      var stepsInfoByScenarios = [];
			      for(var i=0;i<scenarios.length;i++){
				var currentScenario = [];
				var info = {};
				var scenario = scenarios[i];

				info['scenario'] = scenario;
				info['objects'] = [];
				var wns = 0;
				var tns = 0;
				var fep = 0;
				for(var j=0;j<timingDataByScenarios[i].length;j++){
				  var obj = timingDataByScenarios[i][j];
				  tns += obj['total_negative_slack'];
				  fep += obj['no_of_violating_paths'];
				  if(obj['critical_path_slack'] < wns){
				      wns = obj['critical_path_slack'];
				  }
				}

				tmp = {};
				tmp['title'] = 'WNS';
				tmp['tooltip'] = tooltipWNS;
				tmp['code'] = scenario+'-wns';
				tmp['description'] = wns;
				info['objects'].push(tmp);

				tmp = {};
				tmp['title'] = 'TNS';
				tmp['tooltip'] = tooltipTNS;
				tmp['code'] = scenario+'-tns';
				tmp['description'] = tns;
				info['objects'].push(tmp);

				tmp = {};
				tmp['title'] = 'FEP';
				tmp['tooltip'] = tooltipFEP;
				tmp['code'] = scenario+'-fep';
				tmp['description'] = fep;
				info['objects'].push(tmp);

				$scope.data.summaryStepTiming.push(info);



			      }


			    },
			    function(msg, code){
				console.log(msg);
			    });


	}, function(msg, code){console.log(msg); })

    }



    $scope.showTimingHistoGraph = function(mode){
      console.log(mode);

      var relvantCounter = 0;
      for(var i = 0; i<$scope.data.summaryQorInfo.length;i++){
	var obj = $scope.data.summaryQorInfo[i];
	var isRelevant = false;
	if(mode.indexOf("SYSTEM_SLOW") !== -1 && obj.scenario == "SYSTEM_SLOW"){
	  isRelevant = true;
	}

	if(mode.indexOf("SYSTEM_FAST") !== -1 && obj.scenario == "SYSTEM_FAST"){
	  isRelevant = true;
	}
	if(isRelevant) relvantCounter++;
      }

//       var ctx = $('#HorizontalBarTimingSummary')[0];
//       console.log(relvantCounter);
//       if(relvantCounter < 10){
// 	if(ctx.height != 200){
// 	  ctx.height = 200;
// 	}
//       }else if(relvantCounter < 20){
// 	if(ctx.height != 400){
// 	  ctx.height = 400;
// 	}
//       }else{
// 	if(ctx.height != 1000){
// 	  ctx.height = 1000;
// 	}
//       }
//       console.log(ctx.height);

      $scope.data.summaryGraphLabels = [];
      $scope.data.summaryGraphValues = [];

        $timeout( function(){

	  for(var i = 0; i<$scope.data.summaryQorInfo.length;i++){
	    var obj = $scope.data.summaryQorInfo[i];
	    var isRelevant = false;
	    if(mode.indexOf("SYSTEM_SLOW") !== -1 && obj.scenario == "SYSTEM_SLOW"){
	      isRelevant = true;
	    }

	    if(mode.indexOf("SYSTEM_FAST") !== -1 && obj.scenario == "SYSTEM_FAST"){
	      isRelevant = true;
	    }

	    if(isRelevant){
		
		if(mode.indexOf("wns") !== -1 && obj['critical_path_slack'] && obj['critical_path_slack'] < 0){
		  $scope.data.summaryGraphValues.push(obj['critical_path_slack']);
		  $scope.data.summaryGraphLabels.push(obj['timing_path_group']);
		}
		if(mode.indexOf("tns") !== -1 && obj['total_negative_slack'] && obj['total_negative_slack'] < 0){
		  $scope.data.summaryGraphValues.push(obj['total_negative_slack']);
		  $scope.data.summaryGraphLabels.push(obj['timing_path_group']);
		}
		if(mode.indexOf("fep") !== -1 && obj['no_of_violating_paths']){
		  $scope.data.summaryGraphValues.push(obj['no_of_violating_paths']);
		  $scope.data.summaryGraphLabels.push(obj['timing_path_group']);
		}
	    }
	  }

	  console.log($scope.data.summaryGraphValues);
	  console.log($scope.data.summaryGraphLabels);

        }, 100 );


//       console.log($scope.data.summaryGraphLabels);
//       var ctx = document.getElementById("HorizontalBarTimingSummary");
//       ctx.height = "600px";
// 



    };

    $scope.getTabPath = function(tab){
//       console.log(window.location);
      if(tab == "timing_slow"){
	return "synthesis/timing?reportType=vio_all&delayType=max&scenarioName=SYSTEM_SLOW";
      }
      if(tab == "timing_fast"){
	return "synthesis/timing?reportType=vio_all&delayType=min&scenarioName=SYSTEM_FAST";
      }
      if(tab.indexOf("timing") != -1){
	return "synthesis/timing";
      }
      return "synthesis/"+tab;
//       console.log(window.location.href);

    };


//     $scope.receive = function(message) {
// 	console.log(message);
// 	if(message == "synthizesPicked"){
// 	  $scope.data.selectedProject = $cookies.get('project');
// 	  $scope.data.selectedUnit = $cookies.get('unit');
// 	  $scope.data.selectedUser = $cookies.get('user');
// 	  $scope.data.selectedRunid = $cookies.get('run_id');
// 	  $scope.data.selectedStage = $cookies.get('stage');
// 	  $scope.data.selectedDate = $cookies.get('date');
// 	  $scope.fetchSummaryInfo();
// 	}
//     };
//     if(!$scope.data.showSummaryInfo && $cookies.get('project') && $cookies.get('unit') && $cookies.get('user') && $cookies.get('run_id') && $cookies.get('stage') && $cookies.get('date')){
//       $scope.receive("synthizesPicked");
//     }
// 
//     messageService.addSubscriber($scope);

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

	  $scope.fetchSummaryInfo();
	}
    };
    //get data immediatly if we moved to this controller for the first time
//     if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showSummaryInfo && $cookies.get('project') && $cookies.get('unit') && $cookies.get('user') && $cookies.get('run_id') && $cookies.get('stage') && $cookies.get('date')){
//       $scope.receive("synthizesPicked");
//     }


    if(!synthizesInfo.sameDate($scope.data.pickedDate) && synthizesInfo.isPicked() && !$scope.data.showSummaryInfo){
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




































