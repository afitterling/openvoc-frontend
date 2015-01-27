'use strict';

var qStore = 'AppStore';


// build a global AppStore with Promises
angular.module('famousAngular')

  .provider(qStore, ['$logProvider', function ($logProvider) {

    var self = this;
    var defaultObjects = [];

    this.setup = function (Array) {
      defaultObjects = Array || [];
    };

    this.$get = function ($rootScope, $q, $log) {
      return new function () {
        self.qStore = $rootScope.$new(true);

        // promises go here
        self.qStore.q = {};
        // the deferred if called with null obj goes here (pe-initialization, to keep identical promises if we not yet know the data)
        self.qStore.deferred = {};
        // we can create promises beforehand (data=null) to be able to resolve on them at state switching

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

        defaultObjects.map(function(obj){
          self.set(obj, null);
        });

        self.init = function (ObjectKeysAsArray) {
          angular.forEach(ObjectKeysAsArray, function (key) {
            self.set(key, null);
          })};

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
          destroy: function () {
            self.qStore.$destroy();
          }
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
      }
    };

  }])

;