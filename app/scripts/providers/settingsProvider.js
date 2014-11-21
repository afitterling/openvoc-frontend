'use strict';


function Settings(q) {
  return q;
}

angular.module('famousAngular')

  .provider('Settings', ['$logProvider', function ($logProvider) {

    var myInjector = angular.injector(['ng']);
    var $http = myInjector.get('$http');
    var $log = myInjector.get('$log');
    var $q = myInjector.get('$q');

    var deferred = $q.defer();

    this.readConf = function () {

      $http.get('settings.json').success(function (settings) {
        // set log provider
        $logProvider.debugEnabled(settings.debug);
        $log.debug('debug mode:', settings.debug);
        $log.debug('settings:', settings);
        // strip of trailing slash of BASE_URL
        if (settings.API_BASEURL.substr(-1) === '/') {
          settings.API_BASEURL = settings.API_BASEURL.substr(0, settings.API_BASEURL.length - 1);
        }
//        SettingsProvider.set(settings);
        deferred.resolve(settings);
      });
      return deferred.promise;
    };

    this.$get = function () {

      return new Settings(deferred);

    };

  }]);
