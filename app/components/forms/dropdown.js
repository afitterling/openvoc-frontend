'use strict';

angular.module('directives.formHelpers', [])

  .directive('dropdown', ['ValidationActionsStore', '$log', function (ValidationActionsStore, $log) {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/dropdown.html',
      scope: {
        listModel: '=',
        selected: '=',
        model: '=',
        name: '@',
        onChange: '&',
        ready: '='
      },
      link: function (scope, elm, attrs) {

        var id = null;

        var promises = {};

        if (angular.isDefined(attrs.id)) {
          id = attrs.id;
        }

        ////////////// helpers ////////////////////////////////////

        scope.select = function (item_id) {
          scope.menuItems = [];
          angular.forEach(scope.listModel, function (item) {
            if (item_id === item.id) {
              scope.model = item;
            } else {
              this.push(item);
            }
          }, scope.menuItems);
          scope.selected = item_id;
        };

        var setup = function () {
          promises.selected = scope.$watch('selected', function (newId, oldId) {
            if (!newId) {
              return;
            }
            scope.select(newId);
            scope.ready = true;

            // update value store
            ValidationActionsStore.updateState(scope.name, scope.model);
//          $log.debug(scope.name, ' anyValidation =', ValidationActionsStore.anyValidation(scope.name));
//          $log.debug(scope.name, ' anyValidationArray =', ValidationActionsStore.anyValidationArray(scope.name));
          });

          scope.$watch('model', function (newVal, oldVal) {
            if (!newVal || newVal === oldVal) return;
            // changed value
          });
        };

        setup();

      }
    };
  }])
;