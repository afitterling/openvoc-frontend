'use strict';

angular.module('famousAngular.formHelpers', [])

  .directive('dropdown', [function () {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/dropdown.html',
      replace : true,
      scope: {
      },
      link: function (scope, elm, attrs) {
      }
    };
  }])

;