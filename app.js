
var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainCtrl', function ($scope, $modal) {
  $scope.timeLabels = _.range(1, 12);
  $scope.timeLabels.unshift(12);

  //remove when done:
  window.$scope = $scope;

  function getNextEvent(currentEvent, events) {
    return _.find(events, function (event) {
      return event.startTime >= currentEvent.endTime;
    });
  }

  function calculateColumnIndexes() {
    var colIndex = 0;
    var events = _.clone($scope.events);
    var currentEvent;
    while (events.length) {
      currentEvent = events[0];
      currentEvent.colIndex = colIndex;
      events = _.without(events, currentEvent);
      while (currentEvent = getNextEvent(currentEvent, events)) {
        currentEvent.colIndex = colIndex;
        events = _.without(events, currentEvent);
      }
      colIndex += 1;
    }
    return colIndex;
  }

  function compare(x, y, reverse) {
    var val;
    if (x === y) {
      return 0;
    }
    val = x > y ? 1 : -1;
    if (reverse) {
      return val * -1;
    }
    return val;
  }

  function sortEvents() {
    $scope.events.sort(function(a, b) {
      if (a.startTime !== b.startTime) {
        return compare(a.startTime, b.startTime);
      }
      return compare(a.duration, b.duration, true);
    });
  }

  function calculateStyles() {
    _.each($scope.events, function (event) {
      event.style = {
        left: event.colIndex / 3 * 100 + '%',
        width: (3 - event.colIndex) / 3 * 100 + '%'
      };
    });
  }

  $scope.reflow = function() {
    sortEvents();
    $scope.columnCount = calculateColumnIndexes();
    calculateStyles();
  };

  $scope.events = [
    {
      title: 'Cool event',
      startTime: 1422387657,
      endTime: 1422402032,
      duration: 14375,
      color: 'blue',
      description: 'Cool Description'
    },
    {
      title: 'Cool event 2',
      startTime: 1422377762,
      endTime: 1422392175,
      duration: 14413,
      color: 'blue',
      description: 'Cool Description 2'
    },
    {
      title: 'Cool event 3',
      startTime: 1422387657,
      endTime: 1422392175,
      duration: 4518,
      color: 'blue',
      description: 'Cool Description 3'
    },
  ];

  $scope.reflow();

  $scope.addEvent = function() {
    $modal.open({
      templateUrl: 'addEvent.html'
    });
  };
});

app.filter('formatTime', function () {
  return function (timestamp) {
    return moment(timestamp * 1000).format('h:mma');
  };
});
