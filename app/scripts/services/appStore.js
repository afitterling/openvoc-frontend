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
        // simple trick: q.resolve only on !null so we can create promises beforehand to able to resolve on them at state switching
        if (data) {
          deferred.resolve(data);
        }
      },
      get: function (key) {
        if (appStore.q[key]){
          return appStore.q[key];
        }
        return null;
      }
    };

  }]);