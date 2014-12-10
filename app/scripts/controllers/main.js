'use strict';

angular.module('famousAngular')
  .controller('MainCtrl', ['$log', '$scope', '$resource', '$http',
    function ($log, $scope, $resource, $http) {
      //
    }])

  .controller('LearnCtrl', ['$log', '$scope', '$resource', '$http', '$rootScope', 'auth',
    function ($log, $scope, $resource, $http, $rootScope, auth) {

      var AutoUnit = $resource($scope.conf.API_BASEURL + '/unit_items/auto_generate');

      $scope.startUnit = function () {
        // fetch the custom unit
        AutoUnit.query({shuffle: true, user_id: auth.profile.user_id, language_id: $scope.lang.from.id, targetlang_id: $scope.lang.to.id}, function (success) {
          $scope.unit_items = success;
          $scope.unit = { inProgress: true, idx: 0 };
          $scope.show = false;
          $scope.interactive = false;
        });
      };

      $scope.stopUnit = function () {
        $scope.unit = { inProgress: false, idx: 0 };
        $scope.show = false;
      };

      $scope.next = function () {
        $scope.unit.idx += 1;
        $scope.show = false;
      };

      $scope.prev = function () {
        $scope.unit.idx -= 1;
        $scope.show = false;
      };

      $scope.showItem = function () {
        $scope.show = !$scope.show;
      };

      $scope.validator = function (input, model) {
        if (angular.equals(input, model.to.name)){
          $scope.input = null;
          // downgrade "learn need" score
          if ($scope.unit.idx !== $scope.unit_items.length - 1) {
            $scope.next();
          }
          return;
        }
        // upgrade "learn need" score
      };

    }])
;
