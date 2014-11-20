'use strict';

angular.module('famousAngular.formHelpers.editables', [])

  .directive('editableList', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/editable_list.html',
      replace : true,
      scope: {
        items: '=model',
        columns: '=',
        actions: '=',
        updateFunc: '&',
        // -------------------
        deleteFunc: '&'
      },
      link: function (scope, elm, attrs) {
        // run callbacks given by params
        // but they need to be designed as & in scope beforehand
        scope.runCallback = function (callback, item) {
          var fn = scope[callback];
          var fnParams = [{item: item}];
          fn.apply(null, fnParams);
        };
      }
    };
  }])

  .directive('editable', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/editable.html',
      replace : true,
      scope: {
        model: '=',
        column: '=',
        updateFunc: '&'
      },
      link: function (scope, elm, attrs) {
        scope.toggleState = function(){
          if (scope.editState) return;
          console.log('triggered');
          scope.editState = true;
        };
        scope.endEditMode = function(){
          scope.editState = false;
          console.log(scope.model);
          scope.$parent.updateFunc({item: scope.model});
        };
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