'use strict';

var qStore = 'AppStore';


// build a global AppStore with Promises
angular.module('famousAngular')

  .provider(qStore, [function () {

    var self = this;
    var defaultObjects = [];

    // if setup is required beforehand user handling setup as Provider
    self.init = function (Array) {
      defaultObjects = Array || [];
    };

    // we can create promises beforehand (data=null) to be able to resolve on them at state switching
    self.$get = function ($rootScope, $q, $log) {
      self.initializeStore = function () {
        self.qStore = $rootScope.$new(true);
        // promises go here
        self.qStore.q = {};
        // the deferred if called with null obj goes here (pe-initialization, to keep identical promises if we not yet know the data)
        self.qStore.deferred = {};
      };
      return new function () {
        self.initializeStore();
        // latter called with data, the identical promise gets returned
        // latter re-set with data a new promise gets created and stored internally
        self.set = function (key, data) {
          if (!key) {
            $log.error('ERROR: AppStore setter must get called with key!');
          }
          // if data set null but called with key (initialization)
          if (!data) {
            // create the defer call
            var deferred = $q.defer();
            // save it to pick it up when called with real data
            self.qStore.deferred[key] = deferred;
            // save the deferred promise
            self.qStore.q[key] = deferred.promise;
          }
          // if data and resolved earlier reset q
          if (!!self.qStore.q[key].$$state.status) {
            var deferred = $q.defer();
            self.qStore.deferred[key] = deferred;
            self.qStore.q[key] = deferred.promise;
          }
          // if data - resolve deferred
          if (data) {
            // if resolved earlier create new q
            self.qStore.deferred[key].resolve(data);
          }
        };

        self.init = function (objs) {
          angular.forEach(objs, function (key) {
            self.set(key, null);
          });
        };

        if (angular.isDefined()) {
          self.init(defaultObjects);
        }

        return {
          init: self.init,
          set: self.set,
          get: function (key) {
            if (self.qStore.q[key]) {
              return self.qStore.q[key];
            } else {
              return $q.reject();
            }
          },
          destroy: self.initializeStore
        };
      };
    };
  }])

  .factory('Store', ['$rootScope', '$q', function ($rootScope, $q) {

    var self = this;
    self.store = $rootScope.$new(true);
    self.store = {};

    self.set = function (key, data) {
      self.store[key] = data;
    };

    self.init = function () {
      self.store = $rootScope.$new(true);
      self.store = {};
    };

    return {
      set: self.set,
      get: function (key) {
        if (self.store[key]) {
          return self.store[key];
        }
        return null;
      },
      has: function (key) {
        return self.store[key];
      },
      destroy: self.init,
      init: self.init
    };

  }])

;
