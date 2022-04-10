app.factory('homeDataService', function ($q, $timeout, $rootScope, $location) {

    var self = this;
    var deferred = $q.defer();
    self.data = {};

    deferred.resolve(self.data);

    return deferred.promise;
});





////////////////////////////////////////////////////////////////////////////////

// Controller
//
// $data is actually reference to DataService.data object that doesnt affected (destroyed)
// during ui-router states switch .
// 
// WE ATTACH IT TO OUR SCOPE FOR USAGE: $scope.data = $data; 
// and now all variables under $scope.data.* is not getting reseted after state changes


app.controller('homeCntrl', function ($scope, $rootScope, $cookies, $data, $window) {
    console.log("homeCntrl");
console.log($rootScope.serverUrl)

    $rootScope.mainClass = 'home-main-window';
    var emailId = "rawi.sakhnini@intel.com";
    var preSubject = "[WEB]";


    // attaching 'persistent scope'
    $scope.data = $data;

    $scope.sendBugMail = function(){
	$scope.sendMail(preSubject+"[BUG]");
    };

    $scope.sendIdeaMail = function(){
	$scope.sendMail(preSubject+"[IDEA]");
    };


    $scope.sendMail = function(preSub){
	$window.open("mailto:"+ emailId + "?subject=" + preSub + " " + $scope.data.mailSubject+"&body="+$scope.data.mailBody,"_self");
    };

    


});