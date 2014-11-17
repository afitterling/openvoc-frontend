'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['$log', '$scope', '$resource', '$http', function ($log, $scope, $resource, $http) {
    var self = this;

    var Items = $resource($scope.conf.API_BASEURL + '/items', {id: '@id'},
      { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });

    self.items = Items.query(function (data) {
      console.log(data);
    });

    $scope.addItem = function (item) {
      console.log(item);
      Items.save(item, function(success){
//        console.log(success);
        self.items.push(success);
        return {};
      });
    };

  }]);
