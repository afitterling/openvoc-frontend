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
          scope.onChange();
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