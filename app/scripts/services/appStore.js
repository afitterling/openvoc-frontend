'use strict';

// build a AppStore with Promises rather than
// e.g. AppStore['key'] = setItems; (!angular anti pattern)
angular.module('famousAngular')

  .factory('AppStore', ['$rootScope', '$q', function ($rootScope, $q) {

    var appStore = $rootScope.$new();

    // promises go here
    appStore.q = {};
    // the deferred if called with null obj goes here
    appStore.deferred = {};

    return {
      // simple trick: q.resolve only on data !null so
      // we can create promises beforehand to able to resolve on them at state switching
      set: function (key, data) {
        var deferred;
        // if data set null but called with key
        if (!appStore.q.hasOwnProperty(key) && !data) {
          // create the defer call
          deferred = $q.defer();
          // save it to pick it up when called with real data
          appStore.deferred[key] = deferred;
          // save the deferred promise
          appStore.q[key] = deferred.promise;
        } else {
          deferred = appStore.deferred[key];
          if (data) {
            deferred.resolve(data);
          }
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