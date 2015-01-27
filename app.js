
var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainCtrl', function ($scope, $modal) {
    $scope.timeLabels = _.range(1, 12);
    $scope.timeLabels.unshift(12);

    $scope.addEvent = function() {
        $modal.open({
            templateUrl: 'addEvent.html'
        });
    };
});
