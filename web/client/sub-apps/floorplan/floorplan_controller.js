app.factory('floorplanDataService', function ($q, $timeout, $rootScope, $location, httpService) {
    console.log('floorplanDataService');


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



var svgg;
var svgDataCells;
var svgDataDesign;
var svgDataVoltage;
var svgDataMacro;
var svgDataBlockage;
var hierOrder;
var paintCodex;
var svgItems3;


app.controller('floorplanCntrl', function ($scope, $rootScope, $cookies, $data, $window, $timeout, httpService, $http, toastr, $location, messageService, synthizesInfo) {

    $rootScope.mainClass = 'floorplan-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;

    svgg = document.getElementById("svgg");
    panzoom(svgg, {smoothScroll: false});


/*
    var ns = 'http://www.w3.org/2000/svg'
    svgg = document.createElementNS(ns, 'g');

    document.getElementById("mySvg").appendChild(svgg);

    panzoom(svgg, {smoothScroll: false});
*/



/*    svgItems3 = [{'name':'Design','selected':true,'objects':{}, 'hide': true},
    {'name':'std_cells','selected':true,'objects':{}},
    {'name':'Macros','selected':true,'objects':{}},
    {'name':'Blockages','selected':false,'objects':{}},
    {'name':'Voltage area','selected':false,'objects':{}},
    {'name':'Timing paths','selected':true,'objects':{}, 'hide': true},
    {'name':'Grid layer','selected':false,'objects':{}, 'hide': true}]
*/
//     makecheckbox();
    

    if(svgItems3){
      makecheckbox();
      makeSlider();

      createsvg();
    }
    
    $scope.hideBar = function(){
      $rootScope.hideFirstBar = true;
      $rootScope.hideSecondBar = true;
      $rootScope.hideSelectionBar = true;
    };
    $scope.showBar = function(){
      $rootScope.hideFirstBar = false;
      $rootScope.hideSecondBar = false;
      $rootScope.hideSelectionBar = false;
    };

    $scope.toggleTreeVisibility = function(flag){
      $scope.hideTree = flag;
    }

/*
    $scope.highlightShape = function(ev){
      obj = ev.target;
      obj.setAttributeNS(null, "fill", "rgb(0,0,0)");
      console.log(obj);
    }


    $scope.normalShape = function(ev){
      obj = ev.target;
      console.log(obj.getAttributeNS(null, "originalfill"));
      obj.setAttributeNS(null, "fill", obj.getAttributeNS(null, "originalfill"));
      console.log(obj);
    }
*/

    $scope.highlightShape = function(obj){
      obj.fill = "rgb(0,0,0)";
    }


    $scope.normalShape = function(obj){
      obj.fill = obj.originalfill ;
    }



    $scope.objectOnMouseEnter = function(ev){
      obj = ev.target;
      obj.setAttribute("fill-opacity","0.75");
    };

    $scope.objectOnMouseOut = function(ev){
      obj = ev.target;
      obj.setAttribute("fill-opacity",obj.getAttribute("originalopacity"));
    };


    $scope.filterMacrosOnChange = function(objects){
      if(!$scope.data.filterMacros || $scope.data.filterMacros.length == 0){
	for(var i = 0; i < objects.length; i++){
	  var obj = objects[i];
	  $scope.normalShape(obj);
	}
	return;
      }
      for(var i = 0; i < objects.length; i++){
	var obj = objects[i];
	var desc = obj["description"];
	if(desc && desc.indexOf($scope.data.filterMacros) != -1){
	  $scope.highlightShape(obj);
	}else{
	  $scope.normalShape(obj);
	}
      }
    }

    $scope.treeSelectNode = function(node, tog){
      if(tog){ node.show = !node.show;}
      else{if(!node.show) node.show = !node.show;}
    }
  
    $scope.getAllChildren = function(node){
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
	return units;
    }


    $scope.hierarchySelectionChange = function(item){
      var checkAll;
      var hierarchy;
      if(item.level == 0){
	var allChild = $scope.getAllChildren($scope.data.floorplanData['std_hierarchy'][0]);
	if(item.level == 0 && item.selected){
	  checkAll = 1;
	}
	if(item.level == 0 && !item.selected){
	  checkAll = 0
	}
	for(var i=0;i<allChild.length;i++){
	  var child = allChild[i];
	  if(checkAll == 1)
	    child.selected = true;
	  if(checkAll == 0)
	    child.selected = false;
	}
      }else{
	if(item.hierarchy){
	  hierarchy = item.hierarchy;
	}
      }
      for(var i=0;i<$scope.data.floorplanData['std_cells'].objects.length;i++){
	var obj = $scope.data.floorplanData['std_cells'].objects[i];
	if(checkAll == 1){
	  obj.draw = true;
	}
	else if(checkAll == 0){
	  obj.draw = false;
	}else{
	  if(obj.hierarchy && item.hierarchy == obj.hierarchy){
	    if(item.selected){
	      obj.draw = true;
	    }
	    if(!item.selected){
	      obj.draw = false;
	    }
	  }
	}
      }
    }


    $scope.showBlockDetails = function(obj){
      $scope.data.blockDetails = obj;
    }

    $scope.fetchFloorplanInfo = function(){

      console.log("fetchFloorplanInfo");
      var release_id = "";
      if($scope.data.selectedReleaseType == "released"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedCore + '|' + $scope.data.selectedRtl + '|' + $scope.data.selectedRelease;
      }
      if($scope.data.selectedReleaseType == "unreleased"){
	  release_id = $scope.data.selectedProject + '|' + $scope.data.selectedUnit + '|' + $scope.data.selectedUser + '|' + $scope.data.selectedRunid + '|' + $scope.data.selectedStage + '|' + $scope.data.selectedDate;
      }

      $scope.data.showFloorplanInfo = false;

      $scope.data.floorplanData = {};

      $rootScope.loadingState = true;



      httpService.get('floorplan/' + release_id,{releaseType: $scope.data.selectedReleaseType},
		      function(res){

			  if(!res.data || Object.keys(res.data).length == 0){
			      $scope.data.noDataInfo = true;
			      $rootScope.loadingState = false;
			      return;
			  }
			  $scope.data.noDataInfo = false;


			  $scope.data.floorplanInfo = res.data;

			  svgDataCells = res.data.std_cells ? res.data.std_cells : {};
			  svgDataDesign = res.data.design ? res.data.design : {};
			  svgDataVoltage = res.data.voltages ? res.data.voltages : {};
			  svgDataMacro = res.data.macros ? res.data.macros : {};
			  svgDataBlockage = res.data.blockages ? res.data.blockages : {};

			  hierOrder = res.data.hierarchy_order ? res.data.hierarchy_order : {};
			  paintCodex = res.data.hierarchy_colors ? res.data.hierarchy_colors : {};


			  $scope.data.floorplanData['std_cells'] = {'name': 'std_cells', 'selected': false, 'objects': res.data.std_cells};
			  $scope.data.floorplanData['design'] = {'name': 'Design', 'selected': true, 'objects': res.data.design};
			  $scope.data.floorplanData['voltage'] = {'name': 'Voltage area', 'selected': true, 'objects': res.data.voltages, 'area': Math.ceil(res.data.voltage_area)};
			  $scope.data.floorplanData['macros'] = {'name': 'Macros', 'selected': false, 'objects': res.data.macros, 'area': Math.ceil(res.data.macros_area)};
			  $scope.data.floorplanData['blockages'] = {'name': 'Blockages', 'selected': false, 'objects': res.data.blockages, 'area': Math.ceil(res.data.blockage_area)};

			  $scope.data.floorplanData['physical_area'] = res.data.physical_area;

			  var rootNode;
			  var hierarchy_std = {};
			  if(res.data.hierarchy_order && res.data.hierarchy_order.length>0){
			    for(var i=0;i<res.data.hierarchy_order.length;i++){
				var node = res.data.hierarchy_order[i];
				if(node.level == 0) rootNode = node;
				node.children = [];
				hierarchy_std[node.name] = node;
			    }
			    for(var i=0;i<res.data.hierarchy_order.length;i++){
				var node = res.data.hierarchy_order[i];
				if(hierarchy_std[node.parent]){
				  hierarchy_std[node.parent].hasChild = true;
				  hierarchy_std[node.parent].children.push(node);
				}
			    }
			    $scope.data.floorplanData['std_hierarchy'] = [rootNode];
			  }

			  console.log($scope.data.floorplanData['std_hierarchy'] );

			  $scope.data.showFloorplanInfo = true;
			  $rootScope.loadingState = false;




			  httpService.get('area/' + release_id ,{'parent': 'root',releaseType: $scope.data.selectedReleaseType},
					  function(res){
					      if(res.data && res.data.length > 0 && res.data[0]['total_std']){
						$scope.data.floorplanData['std_cells']['count'] = Math.round(res.data[0]['total_std']['count']);
						$scope.data.floorplanData['std_cells']['area'] = Math.round(res.data[0]['total_std']['area']);
						$scope.data.floorplanData['std_cells']['kgates'] = Math.round(res.data[0]['total_std']['area'] / 1000 / (res.data[0]['G_NAND_EQU_CELL']));
					      }

					  },
					  function(msg, code){
					      console.log(msg);
					  });


/*
			  svgItems3 = [{'name':'Design','selected':true,'objects':svgDataDesign, 'hide': true},
			  {'name':'std_cells','selected':true,'objects':svgDataCells},
			  {'name':'Macros','selected':true,'objects':svgDataMacro, 'count': svgDataMacro.length, 'area': Math.ceil(res.data.macros_area)},
			  {'name':'Blockages','selected':false,'objects':svgDataBlockage, 'count': svgDataBlockage.length, 'area': Math.ceil(res.data.blockage_area)},
			  {'name':'Voltage area','selected':false,'objects':svgDataVoltage, 'count': svgDataVoltage.length, 'area': Math.ceil(res.data.voltage_area)},
			  {'name':'Timing paths','selected':true,'objects':multipoints, 'hide': true},
			  {'name':'Grid layer','selected':false,'objects':svgDataDesign, 'hide': true}]


			  $scope.data.svgItems3 = svgItems3;
			  
  

			  if(!document.getElementById("hierDiv")){
			    makecheckbox();
			    makeSlider();
			  }

			  if(document.getElementById("topDiv")){
			    initSVG();
			    createsvg();
			    
			  }
*/

/*
			  httpService.get('area/' + release_id ,{'parent': 'root',releaseType: $scope.data.selectedReleaseType},
					  function(res){
					      console.log(res.data);
					      if(res.data && res.data.length > 0 && res.data[0]['total_std']){
						svgItems3[1]['count'] = Math.round(res.data[0]['total_std']['count']);
						svgItems3[1]['area'] = Math.round(res.data[0]['total_std']['area']);
						svgItems3[1]['kgates'] = Math.round(res.data[0]['total_std']['area'] / 1000 / (res.data[0]['G_NAND_EQU_CELL']));
					      }

					  },
					  function(msg, code){
					      console.log(msg);
					  });
*/

		      },
		      function(msg, code){
			  console.log(msg);
			  $rootScope.loadingState = false;

		      });
    }



//     $scope.createsvg = function(){
//       createsvg();
//     }


//   $scope.data.circles = [
//     {'x': 15, 'y': 20, 'r':15},
//     {'x': 50, 'y': 60, 'r':20},
//     {'x': 80, 'y': 10, 'r':10},
//   ];
// 



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

	  $scope.fetchFloorplanInfo();
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





// var multipoints = {};
// var multi_stats = {};
// var usethat = {};
// 
// 
// 
// 
// var scene = document.getElementById("mySvg");
// 
// 
// 
// 
// function initSVG(){
//     idArr = [] //An array containing the id of each svg shape.
//     x1 = 0;
//     y1 = 0;
//     isDrag= false;
//     canPan = false;
//     zoomfactor = 0.125;
//     moveX = 0;
//     moveY = 0;
//     centerX = 0;
//     centerY = 0;
// 
//     checkid = 0;
//     nothing = [];
//     lIdArr = [];
//     cHierArr = [];
//     macroIdArr = [];
//     colorDict = Object.assign({},paintCodex);
//     colorDictOrigin = Object.assign({},paintCodex);
//     showGrid = false;
//     rotateNinety = false;
//     polypoints = [];
//     borderX = 0;
//     borderY = 0;
//     iniX = 0;
//     iniY = 0;
//     polyidArr = [];
//     gradiantArr = [];
//     arrayofpoints = [];
//     pointsandlines = [];
// }


/*function makecheckbox()
{
	for (checkid = 0; checkid < svgItems3.length; checkid++)
	{
		if(svgItems3[checkid]['hide']) continue;

		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.hidden = true;
// 		checkbox.name = svgItems3[checkid].name;
		checkbox.id = checkid;
// 		checkbox.setAttribute("onchange","printcheck("+checkid+")");
// 		if(svgItems3[checkid].selected)
// 		{
// 			checkbox.setAttribute("checked",true);
// 		}
		
		document.getElementById("topDiv").appendChild(checkbox);
// 		document.getElementById("topDiv").appendChild(label);
	}

// 	document.getElementById("topDiv").appendChild(br);
// 	document.getElementById("topDiv").appendChild(optionBox);
// 	document.getElementById("topDiv").appendChild(optionLabel);
// 	document.getElementById("topDiv").appendChild(br2);
	
}*/
// function printcheck(index)
// {
// 	svgItems3[index].selected = !svgItems3[index].selected;
// 
// 	var str = ""
// 	for(var j = 0; j < svgItems3.length; j++)
// 	{
// 		if(svgItems3[j].selected)
// 		{
// 			str+="t";
// 		}
// 		else
// 		{
// 			str+="f";
// 		}
// 		
// 	}
// 	//console.log(str);
// 	createsvg();
// }

// var svgNS = "http://www.w3.org/2000/svg";  
// function createsvg()
// 	{
// 		if(!svgItems3) return;
// 		var myNode = svgg;
// 		var c = checkid + 1;
// 		var matgroup = "";
// 		idArr = [];
// 		macroIdArr = [];
// 		polypoints = [];
// 		polyidArr = [];
// 		arrayofpoints = [];
// 		pointsandlines = [];
// 		while(myNode.firstChild)
// 			{
// 				myNode.removeChild(myNode.firstChild);
// 			}
// 		for(var i = 0; i < svgItems3.length; i++)
// 		{
// 			for(var j = 0; svgItems3[i].selected == true && svgItems3[i].objects && j < svgItems3[i].objects.length; j++)
// 			{
// 				
// 				var obj = svgItems3[i].objects[j];
// 				
// 				var el = document.createElementNS(svgNS,obj.shape);
// 				if(obj.shape == "rect")
// 				{
// 					el.setAttributeNS(null,"x",obj.x * zoomfactor + moveX);
// 					el.setAttributeNS(null,"y",obj.y * zoomfactor + moveY);
// 					el.setAttributeNS(null,"width",obj.width * zoomfactor);
// 					el.setAttributeNS(null,"height",obj.height * zoomfactor);
// 					el.setAttributeNS(null,"fill",obj.fill);
// 					el.setAttribute("originalfill",obj.fill);
// 					el.setAttributeNS(null,"stroke",obj.stroke);
// 					el.setAttribute("id",c);
// 					el.setAttribute("description",obj.description);
// 					el.setAttribute("ogX",obj.ogX);
// 					el.setAttribute("ogY",obj.ogY);
// 					el.setAttribute("ogWidth",obj.ogWidth);
// 					el.setAttribute("ogHeight",obj.ogHeight);
// 					el.setAttribute("onmouseenter","showtooltip(document.getElementById("+c+"))");
// 					el.setAttribute("onmouseout","hidetooltip(document.getElementById("+c+"))");
// 					el.setAttribute("onclick","showBlockDetails('"+JSON.stringify(obj)+"')");
// 
// 					el.setAttribute("realdescription",obj.realdescription);
// 					el.setAttribute("randomfill",null);
// 					el.setAttribute("realstroke",obj.realstroke);
// 					el.setAttributeNS(null,"stroke-width","2");
// 					
// 					el.setAttribute("metadata", obj.metadata);
// 					el.setAttribute("shape","rect");
// 					el.setAttribute("class","dragsvg");
// 				}
// 				else if (obj.shape == "circle")
// 				{
// 					el.setAttributeNS(null,"cx",(obj.cx * zoomfactor)+moveX);
// 					el.setAttributeNS(null,"cy",(obj.cy * zoomfactor)+moveY);
// 					el.setAttributeNS(null,"r",obj.r);
// 					el.setAttributeNS(null,"stroke",obj.stroke);
// 					el.setAttributeNS(null,"stroke-width","0");
// 					el.setAttributeNS(null,"fill",obj.fill);
// 					el.setAttribute("shape","circle");
// 					el.setAttribute("ogX",obj.ogX);
// 					el.setAttribute("ogY",obj.ogY);
// 					el.setAttribute("ogR",obj.ogR);
// 					el.setAttribute("id",c);
// 					el.setAttribute("randomfill",null);
// 					el.setAttribute("realstroke",obj.realstroke);
// 					el.setAttribute("description",obj.description);
// 					el.setAttribute("realdescription",obj.realdescription);
// 					el.setAttribute("onmouseenter","showtooltip(document.getElementById("+c+"))");
// 					el.setAttribute("onmouseout","hidetooltip(document.getElementById("+c+"))");
// 					el.setAttribute("onclick","showBlockDetails('"+JSON.stringify(obj)+"')");
// 
// 					el.setAttribute("originalfill",obj.fill);
// 					el.setAttribute("metadata",obj.metadata);
// 					el.setAttribute("class","dragsvg");
// 				}
// 				else if(obj.shape == "polygon" || obj.shape == "polyline")
// 				{
// 					
// 					var pointarr = obj.points.split(" ");
// 					var realpoints = "";
// 					for (var d = 0; d < pointarr.length; d++)
// 					{
// 						var minipoint = pointarr[d].split(",");
// 						if(minipoint[0] != "" && minipoint[1] != "")
// 						{
// 							realpoints += (Number(minipoint[0])*zoomfactor+moveX)+","+(Number(minipoint[1])*zoomfactor+moveY)+" ";
// 						}
// 					}
// 					el.setAttributeNS(null,"points",realpoints);
// 					polypoints.push(realpoints);
// 					el.setAttributeNS(null,"stroke",obj.stroke);
// 					el.setAttribute("description",obj.description);
// 					el.setAttributeNS(null,"fill",obj.fill);
// 					el.setAttribute("ogPoints",obj.points);
// 					el.setAttribute("originalfill",obj.fill);
// 					el.setAttribute("onmouseenter","showtooltip(document.getElementById("+c+"))");
// 					el.setAttribute("onmouseout","hidetooltip(document.getElementById("+c+"))");
// 					el.setAttribute("onclick","showBlockDetails('"+JSON.stringify(obj)+"')");
// 
// 					el.setAttribute("randomfill",null);
// 					el.setAttribute("metadata",obj.description);
// 					el.setAttribute("shape","polygon");
// 					el.setAttribute("id",c);
// 					el.setAttribute("class","dragsvg");
// 					el.setAttribute("originalfill",obj.fill);
// 					el.setAttribute("realstroke",obj.stroke);
// 					
// 					if(obj.shape == "polyline")
// 					{
// 						el.setAttribute("marker-start",obj.marker_start);
// 						el.setAttribute("marker-mid",obj.marker_mid);
// 						el.setAttribute("marker-end",obj.marker_end);
// 					}
// 					if(obj.shape == "polygon" && i > 1 && i < 5)
// 					{
// 						polyidArr.push(c);
// 					}
// 				}
// 				
// 				
// 				idArr.push(c);
// 				var title = document.createElementNS(svgNS,"title");
// 				title.setAttribute("id","a"+c.toString());
// 				el.setAttribute("stroke-opacity",obj.stroke_opacity);
// 				if(j == 0 && i == 0)//checking if "Design"
// 				{
// 					el.setAttribute("stroke-width","1");
// 					el.setAttribute("stroke-opacity","1");
// 					el.setAttribute("stroke","black");
// 					
// 					el.setAttribute("fill","white");
// 					
// 					
// 					
// 					el.setAttribute("originalfill","white");
// 					
// 				}
// 				else
// 				{
// 					el.setAttribute("stroke-width","0.5");
// 				}
// 				if(i == 3 || i == 4) // if blockages or voltages
// 				{
// 					el.setAttribute("fill-opacity","0.5");
// 					el.setAttribute("originalOpacity","0.5");
// 					el.setAttribute("stroke-opacity","1");
// 					el.setAttribute("stroke-width","1");
// 				}
// 				else // all others
// 				{
// 					el.setAttribute("fill-opacity","1");
// 					el.setAttribute("originalOpacity","1");
// 				}
// 				if(i == 2)
// 				{
// 					macroIdArr.push(c);
// 				}
// 				if(i == 6)
// 				{
// 					if(showGrid)
// 					{
// 						el.setAttribute("fill","url(#grid)");
// 					}
// 					else
// 					{
// 						el.setAttribute("fill","none");
// 					}
// 					el.removeAttribute("onmouseenter");
// 					el.removeAttribute("onmouseout");
// 					
// 				}
// 				//console.log(obj.hierarchy);
// 				
// 				el.setAttribute("hierarchy",obj.hierarchy);
// 				title.textContent = obj.description;
// 				matgroup += el;
// 				
// 				if(i != 6)
// 				{
// 					el.append(title);
// 				}
// 				if(obj.stroke_width != null)
// 				{
// 					el.setAttribute("stroke-width",obj.stroke_width);
// 				}
// 				if(obj.shape == "circle")
// 				{
// 					arrayofpoints.push(c);
// 				}
// 				if(i == 5)
// 				{
// 					el.setAttribute("path",obj.path);
// 				}
// 				svgg.appendChild(el);
// 				if (obj.shape == "circle" || obj.shape == "polyline")
// 				{
// 					pointsandlines.push(c);
// 				}
// 				
// 				
// 				c++;
// 				
// 			}
// 		}
// 		makeHierarchy(hierOrder);
// 		hidepaths();
// 		
// 	}

/*	function showBlockDetails(objStr){
	  objJson = JSON.parse(objStr);
	  var scope = angular.element(document.getElementById('floorplanContainer')).scope();
	  scope.data.blockDetails = objJson;
	  scope.$apply();
	}*/
// 	function showtooltip(event)
// 	{
// 	
// 		event.setAttribute("fill-opacity","0.75");
// 
// 	}
// 	function hidetooltip(event)
// 	{
// 		event.setAttribute("fill-opacity",event.getAttribute("originalOpacity"));
// 	}
// 
// 	function reset()
// 	{
// 		for(var i = 0; i < idArr.length;i++)
// 		{
// 			el = document.getElementById(idArr[i].toString());
// 			if (el.getAttribute("shape") == "rect")
// 			{
// 				el.setAttributeNS(null,"x",(Number(el.getAttribute("ogX"))));
// 				el.setAttributeNS(null,"y",(Number(el.getAttribute("ogY"))));
// 				el.setAttributeNS(null,"width",(Number(el.getAttribute("ogWidth"))));
// 				el.setAttributeNS(null,"height",(Number(el.getAttribute("ogHeight"))));
// 			}
// 			else if (el.getAttribute("shape") == "circle")
// 			{
// 				el.setAttributeNS(null,"cx",(Number(el.getAttribute("ogX"))));
// 				el.setAttributeNS(null,"cy",(Number(el.getAttribute("ogY"))));
// 				el.setAttributeNS(null,"r",(Number(el.getAttribute("ogR"))));
// 				
// 			}
// 			else if (el.getAttribute("shape") == "polygon" || el.getAttribute("shape") == "polyline")
// 			{
// 				el.setAttributeNS(null,"points",el.getAttribute("ogPoints"));
// 				zoomfactor = 0.125;
// 				moveX = 0;
// 				moveY = 0;
// 				createsvg();
// 			}
// 			
// 		}
// 		zoomfactor = 0.125;
// 		moveX = 0;
// 		moveY = 0;
// 		document.getElementById("mySvg").setAttribute("viewBox","0 0 500 500");
// 	}
// 	function randomcolor()
// 	{
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			el = document.getElementById(idArr[i].toString());
// 			var rancolor = "rgb(";
// 			rancolor += Math.floor(Math.random()*255).toString() + "," + Math.floor(Math.random()*255).toString() + "," + Math.floor(Math.random()*255).toString() + ")";
// 			el.setAttributeNS(null,"fill",rancolor);
// 			el.setAttribute("randomfill",rancolor);
// 			el.setAttribute("description","My color is: " + rancolor);
// 		}
// 	}
// 	function restorecolor()
// 	{
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			el = document.getElementById(idArr[i].toString());
// 			
// 			el.setAttributeNS(null,"fill",el.getAttribute("originalfill"));
// 			el.setAttribute("description",el.getAttribute("realdescription"));
// 			el.setAttributeNS(null,"stroke",el.getAttribute("realstroke"));
// 			el.setAttribute("randomfill",null);
// 			
// 		}
// 	}
// 	function randomstroke()
// 	{
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			el = document.getElementById(idArr[i].toString());
// 			var rancolor = "rgb(";
// 			rancolor += Math.floor(Math.random()*255).toString() + "," + Math.floor(Math.random()*255).toString() + "," + Math.floor(Math.random()*255).toString() + ")";
// 			el.setAttributeNS(null,"stroke",rancolor);
// 			
// 			
// 		}
// 	}

/*	function makeHierarchy(hierArr)
	{
// 		if(!hierArr || hierArr.length == 0) return;
		var t0 = performance.now();
		document.getElementById("hierDiv").innerHTML="";
		var padSet = 30;
		var cHier = idArr[idArr.length-1]+1; //Checkbox ID.
		
		var lId = idArr[idArr.length-1]+10; //Label ID.
		
		//console.log("initial cHier is: " + cHier);
		//console.log("initial lId is : " + lId);
		var rootlabel = document.createElement('label');
		rootlabel.innerHTML=hierArr[0].instance+"<br>";
		rootlabel.id = lId;
		rootlabel.name=hierArr[0].instance;
		var rootbox = document.createElement('input');
		rootbox.type = "checkbox";
		
		document.getElementById("hierDiv").appendChild(rootbox);
		document.getElementById("hierDiv").appendChild(rootlabel);
		rootbox.setAttribute("for",hierArr[0].instance);
		rootbox.setAttribute("onchange","hideAllKids("+cHier+","+0+")");
		
		if(!svgItems3[1].selected)
		{
			rootbox.disabled = true;
			hierArr[0].selected = 0;
			rootlabel.innerHTML = "Hierechies are disabled.";
// 			hideSVG();
		}
		else
		{
			rootbox.removeAttribute("disabled");
			rootlabel.innerHTML="Show hierarchies";
			var br = document.createElement("br");
			document.getElementById("hierDiv").appendChild(br);

		}
		if(svgItems3[1].selected)
		{
		    if(hierArr[0].showKids == 1)
		    {
			    rootbox.setAttribute("checked",true);
		    }
		    else 
		    {
			    rootbox.removeAttribute("checked");
			    
		    }
		
			for (var i = 1; i < hierArr.length; i++)
			{
				cHier++;
				cHierArr.push(cHier);
				lId++;
				lIdArr.push(lId);
				var label = document.createElement('label');
				
				
				var checkbox = document.createElement('input');
				var myHier = hierArr[i].hierarchy;
				//console.log(myHier);
				var myOriginColor = colorDictOrigin[myHier];
				//console.log(myHier + " " + myOriginColor);
				var myColor = colorDict[myHier];
				var parentdex = findParent(hierArr[i].parent);
				
				var rootdex = locateBoss(hierArr[i].name);
				var rootColor = colorDict[rootdex];
				var parentSVG = null;
				var parentExists = false;
				var parentHier = hierArr[parentdex].hierarchy;
				var parentColor = colorDict[parentHier];
				var parentOriginColor = colorDictOrigin[parentHier];
				var usecolor = "";
				var rootHier = hierArr[rootdex].hierarchy;
				
				var parentBox = {};
				var parentLabel = document.getElementById(findLabel(hierArr[parentdex].name).toString());
				
				if(hierOrder[i].level > 1)
				{
					parentBox = document.getElementById(findCheckBox(hierArr[parentdex].name).toString());
				}
				
				checkbox.type = 'checkbox';
				checkbox.name = hierArr[i].instance;
				label.setAttribute("style","padding-left: "+1*hierArr[i].level+"px");
				label.id = lId;
				label.classList.add("clickable");
				checkbox.setAttribute("style","margin-left: "+padSet*hierArr[i].level+"px");
				checkbox.setAttribute("class","active");
				checkbox.setAttribute("name",hierArr[i].name);
				label.setAttribute("onclick","hideAllKids("+cHier+","+i+")");

				
				if(checkbox.disabled)
				{
					checkbox.removeAttribute("checked");
				}else{


				}
				
				
				checkbox.setAttribute("onchange","changeHierarchy("+cHier+","+i+")");
				checkbox.id=cHier;
				label.innerHTML = hierArr[i].instance;


				if(parentdex > 0)
				{
					if(hierArr[i].selected == 1 && hierArr[parentdex].selected == 1)
					{
						label.style.color = myOriginColor;
						colorDict[myHier] = myOriginColor;
						recolor(myHier,myOriginColor);
					}
					else if (hierArr[i].selected == 0 && hierArr[parentdex].selected == 1)
					{
						label.style.color = parentOriginColor;
						colorDict[myHier] = parentOriginColor;
						recolor(myHier,parentOriginColor);
					}
					else if (hierArr[i].selected == 0 && hierArr[parentdex].selected == 0)
					{
						label.style.color = rootColor;
						colorDict[myHier] = rootColor;
						recolor(myHier,rootColor);
						
					}
					else 
					{
						label.style.color = parentColor;
						colorDict[myHier] = parentColor;
						recolor(myHier, parentColor);
					}
					if(hierArr[i].level >= 2)
					{
						if(hierArr[parentdex].selected == 1)
						{
							label.style.color = parentOriginColor;
							colorDict[myHier] = parentOriginColor;
							recolor(myHier,parentOriginColor);
						}
						else 
						{
							label.style.color = parentColor;
							colorDict[myHier] = parentColor;
							recolor(myHier, parentColor);
						}
						if(hierArr[i].selected == 1)
						{
							label.style.color = myOriginColor;
							colorDict[myHier] = myOriginColor;
							recolor(myHier,myOriginColor);
						}
						if(hierArr[parentdex].showKids == 0)
						{
							hierArr[i].showKids == 0;
							checkbox.classList.add("nested");
							label.classList.add("nested");
							checkbox.removeAttribute("checked");
						}
					}
				}
				else
				{
					label.style.color = myOriginColor;
					recolor(myHier,myOriginColor);
				}
				if(hierArr[i].selected == 1)
				{
					disguiseSVG(myHier,1);
					
					checkbox.setAttribute("checked",true);
				}
				else
				{
					disguiseSVG(myHier,0);
					
				}
				if(hierArr[parentdex].showKids == 0)
				{
					
					label.classList.add("nested");
					checkbox.classList.add("nested");
					checkbox.removeAttribute("checked");
				}
				else
				{
					checkbox.removeAttribute("disabled");
					label.classList.remove("nested");
					checkbox.classList.remove("nested");

				  var br = document.createElement("br");
				  document.getElementById("hierDiv").appendChild(br);

				}
				
				if(hierArr[rootdex].selected == 1)
				{
					disguiseSVG(myHier,1);
				}
				else if(hierArr[rootdex].selected == 0 && hierArr[i].selected == 0)
				{
					disguiseSVG(myHier,0);
				}
				else if (hierArr[rootdex].selected == 0 && hierArr[i].selected == 1)
				{
					disguiseSVG(myHier,1);
				}
				
				if(hierArr[parentdex].showKids == 0)
				{
					hierArr[i].showKids == 0;
					
					label.classList.add("nested");
					checkbox.classList.add("nested");
				}
				if(i != rootdex)
				{
					if(hierArr[rootdex].showKids == 0)
					{
						hierArr[i].showKids == 0;
						
						label.classList.add("nested");
						checkbox.classList.add("nested");
					}
				}
				if(parentLabel != null)
				{
					if(parentLabel.classList.contains("nested"))
					{
						hierArr[i].showKids = 0;
						label.classList.add("nested");
						checkbox.classList.add("nested");
					}
				}
				
				label.setAttribute("for",hierArr[i].name);
				label.setAttribute("name",hierArr[i].name);
				

// 				var rootlabel2 = document.createElement('label');
// 				rootlabel2.innerHTML="T";
// 				rootlabel2.name="teeeeest";
// 				rootlabel2.setAttribute("for",hierArr[i].name);
// 				document.getElementById("hierDiv").appendChild(rootlabel2);

				document.getElementById("hierDiv").appendChild(checkbox);
				document.getElementById("hierDiv").appendChild(label);
				
				
			}
		}
		else
		{
			
// 			hideSVG();
			
		}
		var t1 = performance.now();
		//console.log("MakeHierarchy took " + (t1-t0) + " miliseconds");
		//console.log("final cHier is: " + cHier);
		//console.log("final lId is: " + lId);
		//console.log("cHierArr.length is: " + cHierArr.length);
		//console.log("lIdArr.length is: " + lIdArr.length);
		//console.log("\n");
		
	}*/
// 	function changeHierarchy(id, index)
// 	{
// 		var el = document.getElementById(id);
// 		hierOrder[index].selected = 1 - hierOrder[index].selected;
// 		hierOrder[index].checkClicks++;
// 		//console.log("hierOrder["+index+"] has " + hierOrder[index].checkClicks.toString()+" clicks.");
// 		makeHierarchy(hierOrder);
// 	}
// 	function findParent(parentName)
// 	{
// 		for (var i = 0; i < hierOrder.length; i++)
// 		{
// 			if(hierOrder[i].name == parentName)
// 			{
// 				return i;
// 			}
// 		}
// 		//return -1;
// 	}
// 	
// 	function findSVG(fullname)
// 	{
// 
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			if(compareStrings(el.getAttribute("description"),fullname) && el != null)
// 			{
// 				//console.log("match found");
// 				
// 				//console.log(idArr[i]);
// 				return idArr[i];
// 			}
// 		}
// 		//console.log("failure");
// 		return -1;
// 	}
// 	function locateBoss(hiername)
// 	{
// 		console.log(hiername);
// 		var el = hierOrder[findParent(hiername)];
// 		var el_index = findParent(hiername);
// 		if (el.level == 1)
// 		{
// 			
// 			return el_index;
// 		}
// 		
// 		return locateBoss(el.parent);
// 	}
// 	function findCheckBox(name)
// 	{
// 		for (var i = 0 ; i < cHierArr.length; i++)
// 		{
// 			var el = document.getElementById(cHierArr[i].toString());
// 			if (el != null && el.getAttribute("name") == name)
// 			{
// 				return cHierArr[i];
// 			}
// 		}
// 		return -1;
// 	}
// 	function findLabel(name)
// 	{
// 		for (var i = 0; i < lIdArr.length; i++)
// 		{
// 			var el = document.getElementById(lIdArr[i].toString());
// 			if(el != null && el.getAttribute("name") == name)
// 			{
// 				
// 				return lIdArr[i];
// 			}
// 		}
// 		
// 		return -1;
// 	}
// 	function recolor(hierarchy, filler)
// 	{
// 		for(var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			
// 			if(el != null && el.getAttribute("hierarchy") == hierarchy)
// 			{
// 				el.setAttribute("fill",filler);
// 				el.setAttribute("stroke",filler);
// 			}
// 		}
// 	}
// 	function hideSVG()
// 	{
// 		var t2 = performance.now();
// 		for(var i = 0; i < idArr.length; i++)
// 		{
// 			console.log(idArr[i].toString());
// 			var el = document.getElementById(idArr[i].toString());
// 			if(el.hasAttribute("name"))
// 			{
// 				el.setAttribute("style","display:none;");
// 			}
// 		}
// 		var t3 = performance.now();
// 		//console.log("it took " + (t3 - t2) + " miliseconds to hide all svg");
// 	}
// 	function compareStrings(a, b)
// 	{
// 		
// 		if(a.length != b.length)
// 		{
// 			return false;
// 		}
// 		else
// 		{
// 			for(var i = 0; i < a.length; i++)
// 			{
// 				
// 				if(a[i] != b[i])
// 				{
// 					//console.log("failure");
// 					//console.log("a was: " + a);
// 					//console.log("b was: " + b);
// 					//console.log("a[i] was: " + a[i]);
// 					//console.log("b[i] was: " + b[i]);
// 					//console.log("\n");
// 					return false;
// 				}
// 				
// 			}
// 			//console.log("a is: " + a);
// 			//console.log("b is: " + b);
// 			//console.log("\n");
// 		}
// 		//console.log("success");
// 		return true;
// 	}
// 	function disguiseSVG(hierarchy,state)
// 	{
// 		//0: Hide hierarchy.
// 		//1: Show hierarchy.
// 		for(var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			if(el != null && el.getAttribute("hierarchy") == hierarchy)
// 			{
// 				if(state == 1)
// 				{
// 					el.removeAttribute("style");
// 				}
// 				else
// 				{
// 					el.setAttribute("style","display:none;");
// 				}
// 			}
// 		}
// 	}
// 	function hideAllKids(id, index)
// 	{
// 		var el = document.getElementById(id);
// 		hierOrder[index].showKids = 1 - hierOrder[index].showKids;
// 		makeHierarchy(hierOrder);
// 	}
// 	function makeSelection(arr)
// 	{
// 		
// 		var selectlist = document.createElement("select");
// 		selectlist.id = "mySelection";
// 		selectlist.size = 5;
// 		selectlist.classList.add("personalSelection");
// 		//selectlist.style.width = "200px";
// 		
// 		//selectlist.setAttribute("onchange","locateMacro(selectlist.value)");
// 		var divToUse = document.getElementById("myDiv");
// 		var br = document.createElement("br");
// 		divToUse.appendChild(br);
// 		divToUse.appendChild(selectlist);
// 		var rootOption = document.createElement("option");
// 		rootOption.value = "List of macros";
// 		rootOption.text = "List of macros";
// 		
// 		selectlist.appendChild(rootOption);
// 		for(var i = 0; i < arr.length; i++)
// 		{
// 			var el = document.getElementById(arr[i].toString());
// 			var option = document.createElement("option");
// 			option.value = el.getAttribute("description");
// 			option.text = el.getAttribute("description");
// 			
// 			selectlist.appendChild(option);
// 		}
// 		
// 		
// 		
// 
// 	}
// 	function locateMacro()
// 	{
// 		var name = document.getElementById("mySearchText").value;
// 		//console.log(name);
// 		var txtbx = document.getElementById("mySearchLabel");
// 		var found = 0;
// 		
// 		for(var i = 0; i < macroIdArr.length; i++)
// 		{
// 			//console.log(i);
// 			var el = document.getElementById(macroIdArr[i].toString());
// 			
// 			//console.log(n);
// 			var description = el.getAttribute("description");
// 			
// 			var n = description.search(name);
// 			if(n > -1 && name != "")
// 			{
// 				//console.log("hi");
// 				el.classList.remove("nested");
// 				found++;
// 			}
// 			else
// 			{
// 				el.classList.add("nested");
// 			}
// 		}
// 		if(name != "")
// 		{
// 			
// 			txtbx.innerHTML = found + " matches were found for " +name+".";
// 		}
// 		
// 		else
// 		{
// 			txtbx.innerHTML = "";
// 			
// 		}
// 	}
// 	function disguiseSelection()
// 	{
// 		var el1 = document.getElementById("mySearchText");
// 		var el2 = document.getElementById("mySearchButton");
// 		var el3 = document.getElementById("mySearchLabel");
// 		var el4 = document.getElementById("myCleanButton");
// 		if(!document.getElementById("2").checked)
// 		{
// 			el1.classList.add("nested");
// 			el2.classList.add("nested");
// 			el3.classList.add("nested");
// 			el4.classList.add("nested");
// 		}
// 		else
// 		{
// 			el1.classList.remove("nested");
// 			el2.classList.remove("nested");
// 			el3.classList.remove("nested");
// 			el4.classList.remove("nested");
// 			el1.value = "";
// 			locateMacro(el1.getAttribute("text"));
// 		}
// 	}
// 	function makeAsearchEngine()
// 	{
// 		var searchButton = document.createElement("input");
// 		var searchText = document.createElement("input");
// 		var searchLabel = document.createElement("label");
// 		var cleanButton = document.createElement("input");
// 		cleanButton.id = "myCleanButton";
// 		cleanButton.type = "button";
// 		cleanButton.value = "Reset macro visibility.";
// 		
// 		var br = document.createElement("br");
// 		var divToUse = document.getElementById("topDiv");
// 		divToUse.appendChild(br);
// 		
// 		searchButton.type = "button";
// 		searchButton.value="Search";
// 		searchText.type = "text";
// 		searchButton.innerHTML = "Search";
// 		searchLabel.id = "mySearchLabel";
// 		searchLabel.innerHTML = "";
// 		searchText.placeholder = "Insert a part of a macro here...";
// 		searchButton.id = "mySearchButton";
// 		searchText.id = "mySearchText";
// 		searchButton.setAttribute("onclick","locateMacro()");
// 		cleanButton.setAttribute("onclick","cleanMacros()");
// 		divToUse.appendChild(searchText);
// 		divToUse.appendChild(searchButton);
// 		divToUse.appendChild(cleanButton);
// 		divToUse.appendChild(br);
// 		divToUse.appendChild(searchLabel);
// 	}
// 	function cleanMacros()
// 	{
// 		//console.log("reached");
// 		var txtbx = document.getElementById("mySearchLabel");
// 		for (var i = 0; i < macroIdArr.length; i++)
// 		{
// 			var el = document.getElementById(macroIdArr[i].toString());
// 			el.classList.remove("nested");
// 		}
// 		txtbx.innerHTML = "All macros are visible again.";
// 		document.getElementById("mySearchText").value="";
// 	}
// 	function flipfloorplan()
// 	{
// 		
// 		rotateNinety = !rotateNinety;
// 		for(var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			var shape = el.getAttribute("shape");
// 			el.setAttribute("transform-origin","50% 50%");
// 			if(rotateNinety)
// 			{
// 				el.setAttribute("transform","rotate(90)")
// 			}
// 			else
// 			{
// 				el.setAttribute("transform","rotate(0)")
// 			}
// 			
// 		}
// 	}
// 	function showStats()
// 	{
// 		var lengthLabel = document.createElement("label");
// 		var radiusLabel = document.createElement("label");
// 		var br2 = document.createElement("br");
// 		var br = document.createElement("br");
// 		lengthLabel.id = "lengthLabel";
// 		radiusLabel.id = "radiusLabel";
// 		lengthLabel.innerHTML = "";
// 		radiusLabel.innerHTML = "";
// 		document.getElementById("topDiv").appendChild(br2);
// 		document.getElementById("topDiv").appendChild(lengthLabel);
// 		document.getElementById("topDiv").appendChild(br);
// 		document.getElementById("topDiv").appendChild(radiusLabel);
// 		
// 	}
// 	function hideStats()
// 	{
// 		var el1 = document.getElementById("lengthLabel");
// 		var el2 = document.getElementById("radiusLabel");
// 		console.log(el1);
// 		if(!document.getElementById("5").checked)
// 		{
// 			el1.classList.add("nested");
// 			el2.classList.add("nested");
// 		}
// 		else
// 		{
// 			el1.classList.remove("nested");
// 			el2.classList.remove("nested");
// 		}
// 	}
// 	function makeSlider()
// 	{
// 		var slide = document.createElement("input");
// 		slide.type = "range";
// 		slide.id = "mySlide";
// 		slide.min = "1";
// 		slide.max = "20";
// 		slide.value = "8";
// 		var valShow = document.createElement("label");
// 		valShow.innerHTML = "Size: 48px";
// 		valShow.id = "valPres";
// 		slide.classList.add("nested");
// 		var toggeler = document.createElement("input");
// 		toggeler.type = "button";
// 		toggeler.value = "Toggle grid";
// 		valShow.classList.add("nested");
// 		toggeler.id = "toggeling";
// 		toggeler.setAttribute("onclick","toggleGrid()");
// 		var br = document.createElement("br");
// 		var br2 = document.createElement("br");
// 		var gridcolor = document.createElement("input");
// 		var br3 = document.createElement("br");
// 		var br4 = document.createElement("br");
// 		gridcolor.type = "button";
// 		gridcolor.id="gridcolorButton";
// 		gridcolor.value = "Change grid color";
// 		gridcolor.setAttribute("onclick","changeGridColor()");
// 		gridcolor.classList.add("nested");
// 		slide.setAttribute("oninput","resizeGrid()");
// // 		document.getElementById("gridDiv").appendChild(br);
// 		document.getElementById("gridDiv").appendChild(slide);
// // 		document.getElementById("gridDiv").appendChild(br2);
// // 		document.getElementById("gridDiv").appendChild(toggeler);
// // 		document.getElementById("gridDiv").appendChild(br3);
// 		document.getElementById("gridDiv").appendChild(valShow);
// 		document.getElementById("gridDiv").appendChild(br4);
// 		document.getElementById("gridDiv").appendChild(gridcolor);
// 		document.getElementById("gridDiv").classList.add("nested");
// 	}
// 	function resizeGrid()
// 	{
// 		var slide = document.getElementById("mySlide");
// 		var val = slide.value;
// 		var grid1 = document.getElementById("gridspace");
// 		var grid2 = document.getElementById("grid");
// 		var el3 = document.getElementById("valPres");
// 		grid2.setAttribute("width",val.toString());
// 		grid2.setAttribute("height",val.toString());
// 		grid1.setAttribute("d","M "+(val).toString()+" 0 L 0 0 0 "+(val).toString());
// 		el3.innerHTML = "Size: " +6*val.toString()+"px";
// 	}
// 	function toggleGrid()
// 	{
// /*		var el = document.getElementById(idArr[idArr.length-1].toString());
// 		var el2 = document.getElementById("mySlide");
// 		var el3 = document.getElementById("valPres");
// 		var el4 = document.getElementById("gridcolorButton");
// 		showGrid = !showGrid;
// 		if(showGrid)
// 		{
// 			el.setAttribute("fill","url(#grid)");
// 			el2.classList.remove("nested");
// 			el3.classList.remove("nested");
// 			el4.classList.remove("nested");
// 		}
// 		else
// 		{
// 			el.setAttribute("fill","none");
// 			el2.classList.add("nested");
// 			el3.classList.add("nested");
// 			el4.classList.add("nested");
// 		}*/
// 	}
// 	function hideGridStuff()
// 	{
// 		var el = document.getElementById("mySlide");
// 		var el2 = document.getElementById("gridDiv");
// 		var el3 = document.getElementById("valPres");
// 		var el4 = document.getElementById("gridcolorButton");
// 		if(!document.getElementById("6").checked)
// 		{
// 			el.classList.add("nested");
// 			el2.classList.add("nested");
// 			el3.classList.add("nested");
// 			el4.classList.add("nested");
// 			showGrid = false;
// 		}
// 		else
// 		{
// 			
// 			el2.classList.remove("nested");
// 		}
// 
// 
// 		var el = document.getElementById(idArr[idArr.length-1].toString());
// 		var el2 = document.getElementById("mySlide");
// 		var el3 = document.getElementById("valPres");
// 		var el4 = document.getElementById("gridcolorButton");
// 		showGrid = true;
// 
// 		el.setAttribute("fill","url(#grid)");
// 		el2.classList.remove("nested");
// 		el3.classList.remove("nested");
// 		el4.classList.remove("nested");
// 
// 
// 	}
// 	function findCenter()
// 	{
// 		var el = document.getElementById(idArr[0].toString());
// 		var pointlist = el.getAttribute("points");
// 		var pointarr = pointlist.split(" ");
// 		var sumX = 0;
// 		var sumY = 0;
// 		var foundX = [];
// 		var foundY = [];
// 		for (var i = 0; i < pointarr.length; i++)
// 		{
// 			var point = pointarr[i].split(",");
// 			var x = Number(point[0]);
// 			var y = Number(point[1]);
// 			if(x != "" && y != "")
// 			{
// 				foundX.push(Number(x));
// 				foundY.push(Number(y));
// 			}
// 		}
// 		sumX = Math.max.apply(Math,foundX) + Math.min.apply(Math,foundX);
// 		sumY = Math.max.apply(Math,foundY) + Math.min.apply(Math,foundY);
// 		centerX = Number(sumX/2);
// 		centerY = Number(sumY/2);
// 		borderX = Math.max.apply(Math,foundX);
// 		borderY = Math.max.apply(Math,foundY);
// 		iniX = Math.min.apply(Math,foundX);
// 		iniY = Math.min.apply(Math,foundY);
// 		console.log(centerY.toString());
// 		console.log(centerX.toString());
// 	}
// 	function spazpolycolor()
// 	{
// 		
// 			for (var i = 0; i < polyidArr.length; i++)
// 			{
// 				var red = Math.floor(Math.random()*256);
// 				var green = Math.floor(Math.random()*256);
// 				var blue = Math.floor(Math.random()*256);
// 				var el = document.getElementById(polyidArr[i].toString());
// 				var replacefill = "rgb("+red.toString()+","+green.toString()+","+blue.toString()+")";
// 				el.setAttribute("fill",replacefill);
// 			}
// 			
// 		
// 		
// 	}
// 	function makePrank()
// 	{
// 		var prankbutton = document.createElement("input");
// 		prankbutton.type = "button";
// 		prankbutton.value = "Do not move your cursor here.";
// 		prankbutton.setAttribute("onmousemove","spazpolycolor()");
// 		//prankbutton.setAttribute("onmouseout","washOff()");
// 		prankbutton.classList.add("secretbutton");
// 		document.getElementById("hierDiv").appendChild(prankbutton);
// 	}
// 	function washOff()
// 	{
// 		for (var i = 0; i < polyidArr.length; i++)
// 		{
// 			var el = document.getElementById(polyidArr[i].toString());
// 			var replacefill = el.getAttribute("originalfill");
// 			el.setAttribute("fill",replacefill);
// 		}
// 	}
// 	function changeGridColor()
// 	{
// 		var red2 = Math.floor(Math.random()*256);
// 		var green2 = Math.floor(Math.random()*256);
// 		var blue2 = Math.floor(Math.random()*256);
// 		var replacefill2 = "rgb("+red2.toString()+","+green2.toString()+","+blue2.toString()+")";
// 		document.getElementById("gridspace").setAttribute("stroke",replacefill2);
// 		
// 	}
// 	function getRandomColor()
// 	{
// 		var red2 = Math.floor(Math.random()*256);
// 		var green2 = Math.floor(Math.random()*256);
// 		var blue2 = Math.floor(Math.random()*256);
// 		var replacefill2 = "rgb("+red2.toString()+","+green2.toString()+","+blue2.toString()+")";
// 		return replacefill2;
// 	}
// 	function getPercent()
// 	{
// 		var num = Math.floor(Math.random()*100);
// 		return num.toString()+"%";
// 	}
// 	function makeOriginGradients()
// 	{
// 		var lastkey = 0;
// 		for (var key = 0; key < 1000; key++)
// 		{
// 			gradiantArr.push(key);
// 			lastkey += 1;
// 			var altgrad = document.createElementNS(svgNS,'linearGradient');
// 			altgrad.setAttribute("id","grad"+key);
// 			altgrad.setAttribute("x1","0%");
// 			altgrad.setAttribute("x2","0%");
// 			altgrad.setAttribute("y1","0%");
// 			altgrad.setAttribute("y2","100%");
// 			var altcolornum = 2;
// 			for (var k = 0; k < altcolornum; k++)
// 			{
// 				var altstop = document.createElementNS(svgNS,'stop');
// 				if(k == 0)
// 				{
// 					altstop.setAttribute("offset","0%");
// 				}
// 				else
// 				{
// 					altstop.setAttribute("offset","100%");
// 				}
// 				altstop.setAttribute("style","stop-color:"+getRandomColor()+";stop-opacity:1");
// 				altgrad.appendChild(altstop);
// 			}
// 			document.getElementById("testSVG").appendChild(altgrad);
// 		}
// 		var altgrad2 = document.createElementNS(svgNS,'linearGradient');
// 		altgrad2.setAttribute("id","grad"+(lastkey+1).toString());
// 		gradiantArr.push(lastkey + 1);
// 		altgrad2.setAttribute("x1","0%");
// 		altgrad2.setAttribute("x2","0%");
// 		altgrad2.setAttribute("y1","0%");
// 		altgrad2.setAttribute("y2","100%");
// 		var altcolornum = 2;
// 		for (var k = 0; k < altcolornum; k++)
// 		{
// 			var altstop2 = document.createElementNS(svgNS,'stop');
// 			if(k == 0)
// 				{
// 					altstop2.setAttribute("offset","0%");
// 				}
// 				else
// 				{
// 					altstop2.setAttribute("offset","100%");
// 				}
// 			altstop2.setAttribute("style","stop-color:"+getRandomColor()+";stop-opacity:1");
// 			altgrad2.appendChild(altstop);
// 		}
// 		document.getElementById("testSVG").appendChild(altgrad2);
// 		
// 	}
// 	function colorGradients()
// 	{
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			
// 			if((el.getAttribute("fill") != "none") && (el.getAttribute("fill") != "url(#grid)"))
// 			{
// 				el.setAttribute("fill","url(#grad"+gradiantArr[Math.floor(Math.random()*gradiantArr.length)]+")");
// 			}
// 			
// 		}
// 	}
// 	function changeXskew(value)
// 	{
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			
// 			el.setAttribute("transform","skewX("+value.toString()+")");
// 			
// 		}
// 	}
// 	function changeYskew(value)
// 	{
// 		for (var i = 0; i < idArr.length; i++)
// 		{
// 			var el = document.getElementById(idArr[i].toString());
// 			
// 			el.setAttribute("transform","skewY("+value.toString()+")");
// 			
// 		}
// 		
// 	}
// 	function hideOptions()
// 	{
// 		var divHide = document.getElementById("secretContols");
// 		if(!document.getElementById("extra_options").checked)
// 		{
// 			divHide.classList.add("nested");
// 		}
// 		else
// 		{
// 			divHide.classList.remove("nested");
// 		}
// 	}
// 	function makeForm()
// 	{
// 		var divtouse = document.getElementById("topDiv");
// 		var f = document.createElement("form");
// 		var br = document.createElement("br");
// 		var radioHier = document.createElement("input");
// 		radioHier.type = "radio";
// 		radioHier.name = "hierorpath";
// 		radioHier.setAttribute("checked",true);
// 		radioHier.id = "radio1";
// 		radioHier.setAttribute("onclick","hiersOrTiming()");
// 		var labelHier = document.createElement("label");
// 		labelHier.innerHTML = "Hierarchies    ";
// 		var radioPath = document.createElement("input");
// 		radioPath.type = "radio";
// 		radioPath.name = "hierorpath";
// 		radioPath.id = "radio2";
// 		radioPath.setAttribute("onclick","hiersOrTiming()");
// 		var labelPath = document.createElement("label");
// 		labelPath.innerHTML = "Timing path";
// 		
// 		divtouse.appendChild(radioHier);
// 		divtouse.appendChild(labelHier);
// 		divtouse.appendChild(radioPath);
// 		divtouse.appendChild(labelPath);
// 		divtouse.appendChild(br);
// 		
// 	}
// 	function hiersOrTiming()
// 	{
// 		var check1 = document.getElementById("radio1");
// 		var check2 = document.getElementById("radio2");
// 		var div1 = document.getElementById("hierDiv");
// 		var div2 = document.getElementById("timingDiv");
// 		if(!check1.checked)
// 		{
// 			div1.classList.add("nested");
// 		}
// 		else
// 		{
// 			div1.classList.remove("nested");
// 		}
// 		if(!check2.checked)
// 		{
// 			div2.classList.add("nested");
// 		}
// 		else
// 		{
// 			div2.classList.remove("nested");
// 		}
// 	}
// 	function makeTable()
// 	{
// 		var grandTab = document.createElement("table");
// 		var divtouse = document.getElementById("timingDiv");
// 		grandTab.setAttribute("class","mainTable");
// 		
// 		var numpath = usethat.num_of_paths;
// 		var mainArr = [];
// 		var th1Main = document.createElement("th");
// 		var p1main = document.createElement("p");
// 		p1main.innerHTML = "Path summery";
// 		th1Main.appendChild(p1main);
// 		var th2Main = document.createElement("th");
// 		var p2main = document.createElement("p");
// 		p2main.innerHTML = "Path";
// 		th2Main.appendChild(p2main);
// 		var mainrow = document.createElement("tr");
// 		mainrow.appendChild(th1Main);
// 		mainrow.appendChild(th2Main);
// 		grandTab.appendChild(mainrow);
// 		for(var i = 0; i < numpath; i++)
// 		{
// 			mainArr.push([]);
// 		}
// 		for (var j = 0; j < multipoints.length; j++)
// 		{
// 			var obj = multipoints[j];
// 			if(obj.shape == "circle")
// 			{
// 				mainArr[Number(obj.path)-1].push(obj);
// 			}
// 		}
// 		for (var j = 0; j < mainArr.length; j++)
// 		{
// 			var subArr = mainArr[j];
// 			var tr1Main = document.createElement("tr");
// 			var td1main = document.createElement("td");
// 			var p2main = document.createElement("p");
// 			var td2main = document.createElement("td");
// 			var subTable = document.createElement("table");
// 			subTable.classList.add("subTable");
// 			var subheader1 = document.createElement("th");
// 			var subheader2 = document.createElement("th");
// 			var subheader3 = document.createElement("th");
// 			var phead1 = document.createElement("p");
// 			var phead2 = document.createElement("p");
// 			var phead3 = document.createElement("p");
// 			var subrow = document.createElement("tr");
// 			var summery = document.createElement("p");
// 			var showbutton = document.createElement("input");
// 			showbutton.type = "button";
// 			showbutton.value = "Show this path";
// 			showbutton.setAttribute("onclick","displaypaths("+(j+1).toString()+")");
// 			var stats = multi_stats[j];
// 			summery.innerHTML = "Total path radius: " + stats.path_radius.toString()
// 			+"<br><br>"+"Total path length: "+stats.path_length.toString()
// 			+"<br><br>"+"Average length: "+stats.avg_length.toString()
// 			+"<br><br>"+"Number of lines: "+stats.num_lines.toString()
// 			+"<br><br>"+"Number of points: "+stats.num_points.toString()+"<br><br>";
// 			td1main.appendChild(summery);
// 			td1main.appendChild(showbutton);
// 			phead1.innerHTML = "Name";
// 			phead2.innerHTML = "Location";
// 			phead3.innerHTML = "Delay";
// 			subheader1.appendChild(phead1);
// 			subheader2.appendChild(phead2);
// 			subheader3.appendChild(phead3);
// 			subrow.appendChild(subheader1);
// 			subrow.appendChild(subheader2);
// 			subrow.appendChild(subheader3);
// 			subTable.appendChild(subrow);
// 			var doesntexist = false;
// 			for(var k = 0; k < subArr.length; k++)
// 			{
// 				var obj = subArr[k];
// 				var trsub = document.createElement("tr");
// 				var tdsub1 = document.createElement("td");
// 				var psub1 = document.createElement("p");
// 				var psub2 = document.createElement("p");
// 				var tdsub2 = document.createElement("td");
// 				var tdsub3 = document.createElement("td");
// 				var psub3 = document.createElement("p");
// 				psub1.innerHTML = obj.name;
// 				psub2.innerHTML = obj.cx + "," + obj.cy;
// 				psub3.innerHTML = obj.delay;
// 				var checkprop = "delay";
// 				if (obj.shape != "polyline")
// 				{
// 					doesntexist = true;
// 				}
// 				if(doesntexist)
// 				{
// 					tdsub1.appendChild(psub1);
// 					tdsub2.appendChild(psub2);
// 					tdsub3.appendChild(psub3);
// 					trsub.appendChild(tdsub1);
// 					trsub.appendChild(tdsub2);
// 					trsub.appendChild(tdsub3);
// 					subTable.appendChild(trsub);
// 				}
// 			}
// 			if(doesntexist)
// 			{
// 				td2main.appendChild(subTable);
// 				tr1Main.appendChild(td1main);
// 				tr1Main.appendChild(td2main);
// 				grandTab.appendChild(tr1Main);
// 			}
// 		}
// 		var foot = document.createElement("tfoot");
// 		var endrow = document.createElement("tr");
// 		var endcell = document.createElement("td");
// 		var hidebutton = document.createElement("input");
// 		hidebutton.type = "button";
// 		hidebutton.value = "Hide path";
// 		hidebutton.setAttribute("onclick","displaypaths(0)");
// 		endcell.appendChild(hidebutton);
// 		endrow.appendChild(endcell);
// 		foot.appendChild(endrow);
// 		grandTab.appendChild(foot);
// 		divtouse.appendChild(grandTab);
// 		
// 	}
// 	function hidepaths()
// 	{
// 		for(var i = 0; i < pointsandlines.length; i++)
// 		{
// 			var el = document.getElementById(pointsandlines[i].toString());
// 			el.classList.add("nested");
// 		}
// 	}
// 	function displaypaths(index)
// 	{
// 		for(var i = 0; i < pointsandlines.length; i++)
// 		{
// 			var el = document.getElementById(pointsandlines[i].toString());
// 			var path = el.getAttribute("path");
// 			if(path == index)
// 			{
// 				el.classList.remove("nested");
// 			}
// 			else
// 			{
// 				el.classList.add("nested");
// 			}
// 		}
// 		window.scrollTo(0,0);
// 	}
// 




































