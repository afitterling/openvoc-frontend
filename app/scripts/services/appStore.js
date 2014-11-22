'use strict';

angular.module('famousAngular')

  .factory('AppStore', ['$rootScope', function ($rootScope) {

    var appStore = $rootScope.$new();

    return {
      set: function (key, data) {
        appStore[key] = data;
      },
      get: function (key) {
        return appStore[key];
      }
    };

  }]);