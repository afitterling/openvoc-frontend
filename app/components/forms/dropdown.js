'use strict';

angular.module('directives.formHelpers', [])

  .directive('dropdown', ['ValidationActionsStore','$log', function (ValidationActionsStore, $log) {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/dropdown.html',
      scope: {
        listModel: '=',
        selected : '=',
        model: '=',
        name: '@',
        onChange: '&'
      },
      link: function (scope, elm, attrs) {

        // do a simple watch for setting the current value to other triggered changes
        scope.$watch('model', function(newVal) {
          scope.current = newVal;
        });

        var spliceMenuItems = function () {
          scope.menuItems = [];
          angular.copy(scope.listModel, scope.menuItems);
          scope.menuItems.splice(scope.listModel.indexOf(scope.current), 1);
        };

        scope.select = function (item_id) {
          angular.forEach(scope.listModel, function (item) {
            if (angular.equals(item_id, item.id)) {
              scope.current = item;
              return;
            }
          });

          spliceMenuItems();
          scope.model = scope.current;
          console.log(scope.model);
          // why you need this: the model binding is two way to some upper scope model wait until it is really updated
          scope.$watch('model', function() {
            scope.onChange();
          });

          ValidationActionsStore.updateState(scope.name, scope.current);
          $log.debug(scope.name, ' anyValidation =', ValidationActionsStore.anyValidation(scope.name));
          $log.debug(scope.name, ' anyValidationArray =', ValidationActionsStore.anyValidationArray(scope.name));
        };

        // run default on link up
        scope.select(scope.selected);
        spliceMenuItems();
        scope.model = scope.current;
      }
    };
  }])
;