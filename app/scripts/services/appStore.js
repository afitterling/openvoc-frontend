'use strict';

// build a AppStore with Promises rather than
// AppStore['key'] = setItems;
angular.module('famousAngular')

  .factory('AppStore', ['$rootScope', '$q', function ($rootScope, $q) {

    var appStore = $rootScope.$new();

    appStore.q = {};

    return {
      set: function (key, data) {
        var deferred = $q.defer();
        appStore.q[key] = deferred.promise;
        deferred.resolve(data);
      },
      get: function (key) {
        if (appStore.q[key]){
          return appStore.q[key];
        }
        return null;
      }
    };

  }]);