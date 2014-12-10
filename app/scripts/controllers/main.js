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

        AutoUnit.query({shuffle: true, user_id: auth.profile.user_id, language_id: $scope.lang.from.id, targetlang_id: $scope.lang.to.id}, function (data) {
          console.log(data);
        });

        $scope.unit = { inProgress: true, idx: 0 };

      };

      $scope.stopUnit = function () {

        $scope.unit = { inProgress: false, idx: 0 };

      };

    }])
;
