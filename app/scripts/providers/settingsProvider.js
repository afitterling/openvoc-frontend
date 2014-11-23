'use strict';

var injector = angular.injector(['ng']);

function Settings(q) {
  return q;
}

angular.module('famousAngular')

  .provider('Settings', ['$logProvider', function ($logProvider) {

    var $http = injector.get('$http');
    var $q = injector.get('$q');

    var deferred = $q.defer();

    this.readConf = function () {
      $http.get('settings.json').success(function (settings) {
        // set log provider
        $logProvider.debugEnabled(settings.debug);
        // strip of trailing slash of BASE_URL
        if (settings.API_BASEURL.substr(-1) === '/') {
          settings.API_BASEURL = settings.API_BASEURL.substr(0, settings.API_BASEURL.length - 1);
        }
        deferred.resolve(settings);
      });
      return deferred.promise;
    };

    this.$get = function () {
      return new Settings(deferred.promise);
    };

  }]);
