var app = angular.module('appTest', ['ui.bootstrap','ngAnimate','ngRoute', 'ngCookies','ui.router', 'toastr', 'chart.js', 'rzModule', 'ngCookies', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection']);



app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    //redirect if the router is unspecified
    $urlRouterProvider.otherwise('/home');
	var date = new Date();
    var cache_etag = date.getDate() * 1000 + date.getHours() * 100 + date.getMinutes() * 10 + Math.floor((Math.random() * 10) + 1);
	
    /*$stateProvider
		.state('app.home', {
        url: '/home',
        templateUrl: 'client/sub-apps/home/home_main.html',
        controller: 'homeCntrl'
		})*/
	
	var header = {
       templateUrl: "client/header.html",
       controller: function($scope) {}

	}

		
    $stateProvider
        .state('home', {
            url: "/home",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/home/home_main.html?v=" + cache_etag,
                    controller: 'homeCntrl'
                }
            },
            resolve: {
                $data: function (homeDataService) {
                    return homeDataService;
                }
            }
        })
        .state('project', {
            url: "/project",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/project/project_main.html?v=" + cache_etag,
                    controller: 'projectCntrl'
                }
            },
            resolve: {
                $data: function (projectDataService) {
                    return projectDataService;
                }
            }
        })
        .state('power', {
            url: "/power",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/power/power_main.html?v=" + cache_etag,
                    controller: 'powerCntrl'
                }
            },
            resolve: {
                $data: function (powerDataService) {
                    return powerDataService;
                }
            }
        })
        .state('customchip', {
            url: "/customchip",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/custom-chip/custom-chip_main.html?v=" + cache_etag,
                    controller: 'customchipCntrl'
                }
            },
            resolve: {
                $data: function (customchipDataService) {
                    return customchipDataService;
                }
            }
        })
        .state('admin', {
            url: "/admin",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/admin/admin_main.html?v=" + cache_etag,
                    controller: 'adminCntrl'
                }
            },
            resolve: {
                $data: function (adminDataService) {
                    return adminDataService;
                }
            }
        })
        .state('user', {
            url: "/user",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/user/user_main.html?v=" + cache_etag,
                    controller: 'userCntrl'
                }
            },
            resolve: {
                $data: function (userDataService) {
                    return userDataService;
                }
            }
        })
        .state('synthesis', {
            url: "/synthesis",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/synthizes/synthizes_main.html?v=" + cache_etag,
                    controller: 'synthizesCntrl'
                }
            },
            resolve: {
                $data: function (synthizesDataService) {
                    return synthizesDataService;
                }
            }
        })
        .state('synthesis.area', {
            url: "/area",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/area/area_main.html?v=" + cache_etag,
                    controller: 'areaCntrl'
                }
            },
            resolve: {
                $data: function (areaDataService) {
                    return areaDataService;
                }
            }
        })
        .state('synthesis.leakage', {
            url: "/leakage",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/leakage/leakage_main.html?v=" + cache_etag,
                    controller: 'leakageCntrl'
                }
            },
            resolve: {
                $data: function (leakageDataService) {
                    return leakageDataService;
                }
            }
        })
        .state('synthesis.summary', {
            url: "/summary",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/summary/summary_main.html?v=" + cache_etag,
                    controller: 'summaryCntrl'
                }
            },
            resolve: {
                $data: function (summaryDataService) {
                    return summaryDataService;
                }
            }
        })
        .state('synthesis.timing', {
            url: "/timing",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/timing/timing_main.html?v=" + cache_etag,
                    controller: 'timingCntrl'
                }
            },
            resolve: {
                $data: function (timingDataService) {
                    return timingDataService;
                }
            }
        })
        .state('synthesis.congestion', {
            url: "/congestion",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/congestion/congestion_main.html?v=" + cache_etag,
                    controller: 'congestionCntrl'
                }
            },
            resolve: {
                $data: function (congestionDataService) {
                    return congestionDataService;
                }
            }
        })
        .state('synthesis.floorplan', {
            url: "/floorplan",
            views: {
		header: header,
                content: {
                    templateUrl: "client/sub-apps/floorplan/floorplan_main.html?v=" + cache_etag,
                    controller: 'floorplanCntrl'
                }
            },
            resolve: {
                $data: function (floorplanDataService) {
                    return floorplanDataService;
                }
            }
        });
}]);





app.run(function ($rootScope, $cookies, toastrConfig) {

    var date = new Date();
    $rootScope.cache_etag = date.getDate() * 1000 + date.getHours() * 100 + date.getMinutes() * 10 + Math.floor((Math.random() * 10) + 1);

    $rootScope.tabs = [{
            name: "Home",
	    link: "home",
            ref: "home",
            icon: "fa fa-home",
            description: "Get the latest info about each one of the projects based on synthesis releases"
        },
	{
            name: "Project",
	    link: "project",
            ref: "project",
            icon: "fa fa-microchip",
            description: "Project info"
        },
	{
            name: "Synthesis",
	    link: "synthesis/summary",
            ref: "synthesis.summary",
            icon: "fab fa-stripe-s",
            description: "Under this tab you’ll find the data generated by synthesis runs"
        },
	{
            name: "Power",
	    link: "power",
            ref: "power",
            icon: "fa fa-battery-three-quarters",
            description: "Hierarchical viewer of dynamic power based on PowerArtist data"
        },
	{
            name: "Custom-chip",
	    link: "customchip",
            ref: "customchip",
            icon: "fa fa-puzzle-piece",
            description: "Estimate new chip properties based on past projects"
        },
	{
            name: "Admin",
	    link: "admin",
            ref: "admin",
            icon: "fa fa-lock",
            description: "Advanced web configuration for selected users",
	    isAdminTab: true
        }
    ];



    $rootScope.syncTabs = [
	{
            name: "Summary",
	    link: "synthesis/summary",
            ref: "synthesis.summary",
            icon: "fa fa-file-alt",
            description: "All important data from synthesis runs"
        },
	{
            name: "Area",
	    link: "synthesis/area",
            ref: "synthesis.area",
            icon: "fa fa-image",
            description: "Hierarchical viewer of area data with the ability to compare previous runs and Macro cell distribution"
        },
	{
            name: "Leakage",
	    link: "synthesis/leakage",
            ref: "synthesis.leakage",
            icon: "fa fa-tint",
            description: "Hierarchical viewer of leakage data based on synthesis multi VT cell distribution"
        },
	{
            name: "Timing",
	    link: "synthesis/timing",
            ref: "synthesis.timing",
            icon: "fa fa-clock",
            description: "Timing path data"
        },
	{
            name: "Congestion",
	    link: "synthesis/congestion",
            ref: "synthesis.congestion",
            icon: "fa fa-clock",
            description: "Congestion"
        },
	{
            name: "Floorplan",
	    link: "synthesis/floorplan",
            ref: "synthesis.floorplan",
            icon: "fas fa-microchip",
            description: "Chip floorplan"
        }
    ];



    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.timeOut = 5000;
    toastrConfig.closeButton = true;
    toastrConfig.progressBar = true;


});


app.factory('httpService', function($http, $log, $q, $rootScope) {
  return {
   get: function(path, body, successCB, failureCB) {
     $http.get($rootScope.serverUrl+path,{params: body}).then(function(response){successCB(response);}, function(error){failureCB(error);$log.error(error);});
  },
   post: function(path, body, successCB, failureCB) {
     $http.post($rootScope.serverUrl+path,body).then(function(response){successCB(response);}, function(error){failureCB(error);$log.error(error);});
   }
  }
});




app.service("messageService", function() {
    this._subscribers = [];

    this.addSubscriber = function(sub) {
        this._subscribers.push(sub);
    };

    this.sendMessage = function(message) {
        var len = this._subscribers.length;
        for (var i = 0; i < len; i++) {
            this._subscribers[i].receive(message);
        }
    };
});



app
  .directive('excelExport',
    function () {
      return {
        restrict: 'A',
        scope: {
        	fileName: "@",
            data: "&exportData",
            levels: "&rowsLevel",
            merges: "&rowsMerge"

        },
        replace: true,
        template: '<button class="btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10" ng-click="download()">Export to Excel <i class="fa fa-download"></i></button>',
        link: function (scope, element) {
        	
        	scope.download = function() {

        		function datenum(v, date1904) {
            		if(date1904) v+=1462;
            		var epoch = Date.parse(v);
            		return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
            	};
            	
            	function getSheet(data, opts) {
            		var ws = {};
            		var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
            		for(var R = 0; R != data.length; ++R) {
            			for(var C = 0; C != data[R].length; ++C) {
            				if(range.s.r > R) range.s.r = R;
            				if(range.s.c > C) range.s.c = C;
            				if(range.e.r < R) range.e.r = R;
            				if(range.e.c < C) range.e.c = C;
            				var cell = {v: data[R][C] };
            				if(cell.v == null) continue;
            				var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
            				
            				if(typeof cell.v === 'number') cell.t = 'n';
            				else if(typeof cell.v === 'boolean') cell.t = 'b';
            				else if(cell.v instanceof Date) {
            					cell.t = 'n'; cell.z = XLSX.SSF._table[14];
            					cell.v = datenum(cell.v);
            				}
            				else cell.t = 's';
            				
            				ws[cell_ref] = cell;
            			}
            		}
            		if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
            		return ws;
            	};
            	
            	function Workbook() {
            		if(!(this instanceof Workbook)) return new Workbook();
            		this.SheetNames = [];
            		this.Sheets = {};
            	}
            	 
            	var wb = new Workbook(), ws = getSheet(scope.data());

		if(scope.levels()){
		  ws['!rows'] = scope.levels();
		}
		if(scope.merges()){
		  var merge = [];
		  var toMerges = scope.merges();
		  for(var i=0;i<toMerges.length;i=i+2){
		    var firstPoint = toMerges[i]; //this array [[0,0],[1,1],[][]]
		    var secondPoint = toMerges[i+1]; //this array [[0,0],[1,1],[][]]
		    var tmp = {};
		    tmp['s'] = {r: firstPoint[0], c: firstPoint[1]};
		    tmp['e'] = {r: secondPoint[0], c: secondPoint[1]};
		    merge.push(tmp);
		  }
		  ws['!merges'] = merge;
		}
		console.log(ws['!merges']);
            	/* add worksheet to workbook */
            	wb.SheetNames.push(scope.fileName);
            	wb.Sheets[scope.fileName] = ws;
            	var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

            	function s2ab(s) {
            		var buf = new ArrayBuffer(s.length);
            		var view = new Uint8Array(buf);
            		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            		return buf;
            	}
            	
        		saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), scope.fileName+'.xlsx');
        		
        	};
        
        }
      };
    }
 );


/*
app.config(function ($provide) {
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector',function ($delegate, $injector) {
           return function (exception, cause) {
	    $delegate(exception, cause);

	    var exmsg = "";
	    if (exception.message) {
		exmsg += exception.message;
	    }
	    if (exception.stack) {
		exmsg += ' | stack: ' + exception.stack;
	    }

	    if(cause == undefined) cause = '';

              var $http = $injector.get("$http");
	      $http.post('./server/libs/python3.5.2/logger/logger.py', {'exception': exmsg, 'cause':cause}).then(
		function(response){
		  
		}, 
		function(response){
		  
		});
           }
    }]);
  });
*/

















