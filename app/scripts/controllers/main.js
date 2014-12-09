'use strict';

angular.module('famousAngular')
  .controller('MainCtrl', ['$log', '$scope', '$resource', '$http',
    function ($log, $scope, $resource, $http) {
      //
    }])

  .controller('LearnCtrl', ['$log', '$scope', '$resource', '$http', '$rootScope',
    function ($log, $scope, $resource, $http, $rootScope) {
      //


      var AutoUnit = $resource($scope.conf.API_BASEURL + '/unit_items/auto_generate');

      $scope.start = function () {
        // fetch the custom unit with age param
        console.log($scope.lang);
        AutoUnit.query({language_id: $scope.lang.from.id, targetlang_id: $scope.lang.to.id}, function (data) {
          console.log(data);
        });

//        $scope.learn = true;
//        $scope.index = 0;

      };

    }])
;
