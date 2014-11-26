'use strict';

angular.module('directives.formHelpers', [])

  .directive('dropdown', [function () {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/dropdown.html',
      scope: {
        listModel: '=',
        selected : '='
      },
      link: function (scope, elm, attrs) {
        angular.forEach(scope.listModel, function (item) {
          console.log(item);
          if (angular.equals(scope.selected /* id */, item.id)) {
            scope.current = item;
            return;
          }
        });

        scope.menuItems = scope.listModel;
//        scope.menuItems.splice(scope.menuItems.indexOf(scope.current), 1);

        scope.select = function (item_id) {
          //
          angular.forEach(scope.listModel, function (item) {
            if (angular.equals(item_id, item.id)) {
              scope.current = item;
              return;
            }
          });
          scope.menuItems = scope.listModel;
//          scope.menuItems.splice(scope.menuItems.indexOf(scope.current), 1);
        };

      }
    };
  }])
;