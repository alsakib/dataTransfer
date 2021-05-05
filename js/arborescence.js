mysigl.controller('arborescenceCtrl', function($scope, $http) {
  var C_ROU_1 = gvar_adressServeur +"/organisationUnits?fields=:all";

    $http.get(C_ROU_1)
    .then(function(response) {
        $scope.json_uo = response.data;
    });
});
