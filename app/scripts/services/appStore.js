'use strict';

// build a global AppStore with Promises
angular.module('famousAngular')

  .factory('AppStore', ['$rootScope', '$q', function ($rootScope, $q) {

    var self = this;
    self.appStore = $rootScope.$new();

    // promises go here
    self.appStore.q = {};
    // the deferred if called with null obj goes here (pe-initialization, to keep identical promises if we not yet know the data)
    self.appStore.deferred = {};

    return {
      // we can create promises beforehand to be able to resolve on them at state switching
      // set latter called with data, the identical promise gets returned
      set: function (key, data) {
        var deferred;
        // if data set null but called with key (initialization)
        if (!self.appStore.q.hasOwnProperty(key)) {
          // create the defer call
          deferred = $q.defer();
          // save it to pick it up when called with real data
          self.appStore.deferred[key] = deferred;
          // save the deferred promise
          self.appStore.q[key] = deferred.promise;
        } else {
          // the deferred object has been stored before
          deferred = self.appStore.deferred[key];
        }
        // if data resolve deferred
        if (data) {
          deferred.resolve(data);
        }
      },
      get: function (key) {
        if (self.appStore.q[key]) {
          return self.appStore.q[key];
        }
        return null;
      },
      reset: function () {
        self.appStore = $rootScope.$new();
        self.appStore.q = {};
        self.appStore.deferred = {};
      }
    };

  }]);