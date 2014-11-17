'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['$log', '$scope', '$resource', '$http', function ($log, $scope, $resource, $http) {

    var self = this;

    // @TODO service
    var Items = $resource($scope.conf.API_BASEURL + '/items/:id', {id: '@id'},
      { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });

    self.items = Items.query(function (data) {
      console.log(data);
    });

    $scope.addItem = function (item) {
      $scope.success = null;

      Items.save(item, function (success) {
        self.items.push(success);
        $scope.success = true;
        $scope.item = {};
      }, function (error) {
        $scope.success = false;
        $scope.item = item;
      });
    };

    $scope.updateItem = function (item) {
      $log.debug('update triggered', item);
      $scope.success = null;
      Items.update(item, function (success) {
        $scope.success = true;
      }, function (error) {
        $scope.success = false;
      });
    };

  }]);
