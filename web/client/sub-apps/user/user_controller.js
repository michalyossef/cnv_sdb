app.factory('userDataService', function ($q, $timeout, $rootScope, $location) {

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


app.controller('userCntrl', function ($scope, $rootScope, $cookies, $data, $window) {
    console.log("userCntrl");
    $rootScope.mainClass = 'user-main-window';
    // attaching 'persistent scope'
    $scope.data = $data;

    

});