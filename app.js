var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainCtrl', function ($scope, $modal) {
  var containerHeight = $('.events-container').height();
  var startOfDay = moment().startOf('day').unix();
  var endOfDay = moment().endOf('day').unix()
  $scope.events = [];

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

  function sortEvents(field1, field2) {
    $scope.events.sort(function(a, b) {
      if (a[field1] !== b[field1]) {
        return compare(a[field1], b[field1]);
      }
      return compare(a[field2], b[field2], true);
    });
  }

  function getTimeYPosition(timestamp) {
    return Math.round((timestamp - startOfDay) / (endOfDay - startOfDay) * containerHeight);
  }

  function calculateStyles(columnCount) {
    _.each($scope.events, function (event) {
      var top = getTimeYPosition(event.startTime);
      var bottom = getTimeYPosition(event.endTime);
      var width = (columnCount - event.colIndex) / columnCount * 100;
      var height = bottom - top;
      if (height < 5) {
        height = 5;
      }
      if (event.overlapped) {
        width *= 0.85;
      }
      event.style = {
        left: event.colIndex / columnCount * 100 + '%',
        width: width + '%',
        top: top + 'px',
        height: height + 'px',
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

  function timeObjectToUnix(timeObj) {
    return moment(timeObj.hour + ':'+ timeObj.minute + timeObj.meridiem, 'hh:mma').unix();
  }

  function getTimeObject(time) {
    return {
      hour: time.format('h'),
      minute: time.format('mm'),
      meridiem: time.format('A')
    }
  }

  $scope.reflow = function() {
    var columnCount;
    sortEvents('startTime', 'duration');
    columnCount = calculateColumnIndexes();
    sortEvents('colIndex', 'startTime');
    calculateOverlaps();
    calculateStyles(columnCount);
  };

  $scope.addEvent = function() {
    $modal.open({
      templateUrl: 'addEvent.html',
      scope: $scope,
      controller: function ($scope) {
        var endTime = moment().add(1, 'hour');
        var eod = moment().endOf('day');

        $scope.hours = _.invoke(_.range(1, 12), 'toString');
        $scope.hours.unshift('12');
        $scope.minutes = _.map(_.range(0, 60), function (time) {
          time = time.toString();
          if (time.length === 1) {
            return '0' + time;
          }
          return time;
        });

        $scope.eventForm = {
          startTime: getTimeObject(moment()),
          endTime: getTimeObject(endTime.isBefore(eod) ? endTime : eod)
        };

        $scope.submit = function () {
          var event = _.pick($scope.eventForm, 'title', 'description');
          event.startTime = timeObjectToUnix($scope.eventForm.startTime);
          event.endTime = timeObjectToUnix($scope.eventForm.endTime);
          if (event.startTime < event.endTime) {
            event.duration = event.endTime - event.startTime;
            event.color = 'blue';
            if (!event.title) {
              event.title = '(no title)';
            }
            $scope.events.push(event);
            $scope.reflow();
            $scope.$close();
          } else {
            $scope.endTimeError = true;
          }
        };
      }
    });
  };
});

app.filter('formatTime', function () {
  return function (timestamp) {
    return moment(timestamp * 1000).format('h:mma');
  };
});
