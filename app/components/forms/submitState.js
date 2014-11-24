angular.module('directives.formHelpers', [])
  .directive('submitState', ['$log', '$parse', function ($log, $parse) {
    return {
      scope: false,
      link: function(scope, elm, attrs) {
        var stateModel = $parse(attrs.stateFlag);
        // create model pending to be usable in template
        scope.pending = false;

        $log.debug('directives.formHelpers.submitState.bind', true);

        scope.$watch(stateModel, function(newVal, oldVal){
          if (newVal === oldVal) {
            return;
          }

          $log.debug('directives.formHelpers.submitState', newVal, oldVal);

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