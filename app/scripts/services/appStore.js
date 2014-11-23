'use strict';

// build a global AppStore with Promises
angular.module('famousAngular')

  .factory('AppStore', ['$rootScope', '$q', function ($rootScope, $q) {

    var appStore = $rootScope.$new();

    // promises go here
    appStore.q = {};
    // the deferred if called with null obj goes here (pe-initialization, to keep identical promises if we not yet know the data)
    appStore.deferred = {};

    return {
      // we can create promises beforehand to be able to resolve on them at state switching
      // set latter called with data, the identical promise gets returned
      set: function (key, data) {
        var deferred;
        // if data set null but called with key (initialization)
        if (!appStore.q.hasOwnProperty(key)) {
          // create the defer call
          deferred = $q.defer();
          // save it to pick it up when called with real data
          appStore.deferred[key] = deferred;
          // save the deferred promise
          appStore.q[key] = deferred.promise;
        } else {
          // the deferred object has been stored before
          deferred = appStore.deferred[key];
        }
        // if data resolve deferred
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