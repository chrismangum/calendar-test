var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainCtrl', function ($scope, $modal) {
  $scope.timeLabels = _.range(1, 12);
  $scope.timeLabels.unshift(12);
  var startOfDay = moment().startOf('day').unix();
  var endOfDay = moment().endOf('day').unix()

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

  function getTimeYPosition(timestamp) {
    return Math.round((timestamp - startOfDay) / (endOfDay - startOfDay) * 961);
  }

  function calculateStyles() {
    _.each($scope.events, function (event) {
      var top = getTimeYPosition(event.startTime);
      var bottom = getTimeYPosition(event.endTime);
      var width = (3 - event.colIndex) / 3 * 100;
      if (event.overlapped) {
        width *= 0.85;
      }
      event.style = {
        left: event.colIndex / 3 * 100 + '%',
        width: width + '%',
        top: top + 'px',
        height: bottom - top + 'px',
      };
      event.classes = _.pick(event, 'overlapping');
    });
  }

  function testOverlapped(a, b) {
    if (a.startTime < b.endTime && a.endTime > b.startTime) {
      a.overlapped = true;
      b.overlapping = true;
    }
  }

  function getNextColumn(event) {
    return _.where($scope.events, {colIndex: event.colIndex + 1});
  }

  function calculateOverlaps() {
    _.each($scope.events, function (e) {
      e.overlapped = false;
      e.overlapping = false;
    });
    _.each($scope.events, function (a) {
      _.each(getNextColumn(a), function (b) {
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          a.overlapped = true;
          b.overlapping = true;
        }
      });
    });
  }

  $scope.reflow = function() {
    sortEvents();
    $scope.columnCount = calculateColumnIndexes();
    calculateOverlaps();
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
