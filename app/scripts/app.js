'use strict';

angular.module('famousAngular',
    ['auth0', 'ngAnimate', 'ngCookies',
      'ngTouch', 'ngSanitize',
      'ngResource', 'ui.router',
      'famous.angular' ])

  .config(function ($httpProvider, $stateProvider, authProvider, $logProvider, $locationProvider, $urlRouterProvider) {

    $logProvider.debugEnabled(true);

    authProvider.init({
      domain: 'journal-sp33c.auth0.com',
      clientID: 'BcSTdHaYpZHynNIUMXdleiYkaQDp2mMF',
      callbackURL: location.href,
      loginUrl: '/login'
    });

    $httpProvider.interceptors.push('authInterceptor');

    authProvider.on('loginSuccess', function($rootScope, $log, $resource, $http) {

      //@TODO load from disk
      $rootScope.conf = {
        API_BASEURL: 'http://localhost:8080/'
      };

      $log.debug($rootScope.auth);
      $rootScope.refreshViewVars();

      var apiCall = function(){
        var api = $resource($rootScope.conf.API_BASEURL + '/secured/ping');
        api.get({}, function (data) {
          console.log('data=', data);
        });
      };

      apiCall();

    });

    authProvider.on('logout', function($rootScope, $log) {
      //$location.path('/');
      $log.debug($rootScope.auth);
      $rootScope.refreshViewVars();
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'//,
        //requiresLogin: true
      })
      .state('404', {
        url: '/404',
        templateUrl: 'partials/404.html'
      });

    $urlRouterProvider.otherwise('/404');
    $locationProvider.html5Mode(true).hashPrefix('!');

  })
  .run(['$log', 'auth', '$location', '$rootScope',
    function ($log, auth, $location, $rootScope) {

      $log.debug('debugging on');

      auth.hookEvents();

      //$location.path('/');

      $rootScope.auth = auth;

      $rootScope.handleSession = function () {
        if (!auth.isAuthenticated) {

          auth.signin({
            connection: 'Username-Password-Authentication',
            popup: true,
            scope: 'openid name email'
          }).then(function () {
              // Success callback
              $rootScope.refreshViewVars();
            }, function () {
              // Error callback
            });
        }

        if (auth.isAuthenticated) {
          auth.signout();
          $rootScope.refreshViewVars();
        }

      };

      $rootScope.logout = function () {
        auth.signout(function () {
        });
      };


      $rootScope.refreshViewVars = function(){
        if (!auth.isAuthenticated) {
          $rootScope.sessionAction = 'Login';
        }
        if (auth.isAuthenticated) {
          $rootScope.sessionAction = 'Logout';
        }
      };
      $rootScope.refreshViewVars();

      $rootScope.$on('$routeChangeStart', function (e, nextRoute, currentRoute) {
        if (nextRoute.$$route && nextRoute.$$route.requiresLogin) {
          if (!auth.isAuthenticated) {
            //$location.path('/login');
            //$rootScope.doLogin();
          }
        }
      });

    }]
  );

