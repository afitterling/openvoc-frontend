'use strict';

angular.module('famousAngular.formHelpers.editables', [])

  .directive('editableList', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      template: '<table class="table table-hover"><tr ng-repeat="item in items"><td ng-repeat="column in columns">{{item[column]}}</td></tr></table>',
      replace : true,
      scope: {
        items: '=model',
        columns: '='
      },
      link: function (scope, elm, attrs) {
      }
    };
  }])

  .directive('new', [function() {
    return {
      link: function(scope, elm, attrs) {
        // editable should be set with model
      }
    };

  }])
;

angular.module('directives.formHelpers', [])
  .directive('submitState', ['$log','$parse', function ($log, $parse) {
    return {
      scope: false,
      link: function(scope, elm, attrs) {
        var stateModel = $parse(attrs.state);
        scope.pending = false;

        $log.debug('directives.formHelpers.submitState.bind', true);

        scope.$watch(stateModel, function(newVal, oldVal){
          if (newVal === oldVal) {
            return;
          }

          $log.debug(newVal, oldVal);

          if (newVal === null) {
            scope.pending = true;
            $log.debug('directives.formHelpers.eventLoop.triggered', true);
          }

          if (newVal === true) {
            scope.pending = false;
            $log.debug('directives.formHelpers.eventLoop.success', true);
          }

          if (newVal === false) {
            scope.pending = false;
            $log.debug('directives.formHelpers.eventLoop.error', true);
          }
        });

      }
    };
  }])

;