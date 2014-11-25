'use strict';

angular.module('famousAngular.formHelpers.editables', [])

  .directive('editableSimple', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      templateUrl: 'components/forms/editableSimple.html',
      replace : true,
      scope: {
        submitCallbackFunc: '&',
        model: '='
      },
      link: function (scope, elm, attrs) {
      }
    };
  }])

;
