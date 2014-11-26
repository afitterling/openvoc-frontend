'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['$rootScope', '$timeout', '$log', '$scope', '$resource', '$http', 'Words', 'AppStore',
    function ($rootScope, $timeout, $log, $scope, $resource, $http, Words, AppStore) {

    var conf = $scope.conf;

    var self = this;

    self.words = $scope.words;

    $scope.submitTest = function (data) {
      console.log(data);
      return true;
    };


    /* jshint constructor: false */
    var words = Words(conf);

    $scope.addNewWord = function (word) {
      $scope.success = null;
      /* jshint camelcase: false */
      word.user_id = $scope.profile.user_id;
      words.save({word: word}, function (success) {
        self.words.push(success);
        $scope.success = true;
      }, function (error) {
        $scope.success = false;
        $scope.word = word;
      });
    };

    return;


    var items = Items(conf);

    $scope.addItem = function (item) {
      $scope.success = null;
      /* jshint camelcase: false */
      item.user_id = $scope.profile.user_id;
      items.save({item: item}, function (success) {
        self.items.push(success);
        $scope.success = true;
        $scope.item = {};
      }, function (error) {
        $scope.success = false;
        $scope.item = item;
      });
    };

    // update model
    // we use a trick here:
    // as the editable allows editable per attr of one obj/item we end up in having multiple change/update requests per obj or id
    // as of this fact we update with timeouts/promises and cancel the pre chosen promises if other fields got edited as well
    // as the parameter is always the whole model this won't matter
    var cancelUpdate = {};
    $scope.updateItem = function (item) {
      $log.debug('cancelUpdate', cancelUpdate);
      if (angular.isDefined(cancelUpdate[item.id])) {
        if (cancelUpdate[item.id].status !== 1) { // 1 => resolved
          cancelUpdate[item.id]();
        }
      }
      cancelUpdate[item.id] = $timeout(function(){
        $log.debug('update triggered', item);
        $scope.success = null;
        items.update(item, function (success) {
          $scope.success = true;
          delete cancelUpdate[item.id]; // delete the promise from list as we know it ran through
          $log.debug('cancelUpdate', cancelUpdate);
        }, function (error) {
          $scope.success = false;
          $log.debug('cancelUpdate', cancelUpdate);
        });
      }, 5000);
      $log.debug('cancelUpdate', cancelUpdate);
    };

    $scope.deleteItem = function (item) {
      items.delete({id: item.id}, function(success){
        self.items.splice(self.items.indexOf(item), 1);
        $log.debug('deleted item', item);
      });
    };

  }]);
