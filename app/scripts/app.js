'use strict';

angular.module('famousAngular',
    ['auth0', 'ngAnimate', 'ngCookies',
      'ngTouch', 'ngSanitize',
      'ngResource', 'ui.router',
      'famous.angular' ])

  .config(['$httpProvider', '$stateProvider', 'authProvider', '$logProvider', '$locationProvider', '$urlRouterProvider', function ($httpProvider, $stateProvider, authProvider, $logProvider, $locationProvider, $urlRouterProvider) {

    $logProvider.debugEnabled(true);

    authProvider.init({
      domain: 'journal-sp33c.auth0.com',
      clientID: 'BcSTdHaYpZHynNIUMXdleiYkaQDp2mMF',
      callbackURL: location.href,
      loginUrl: '/login'
    });

    $httpProvider.interceptors.push('authInterceptor');

    authProvider.on('loginSuccess', function($rootScope, $log, $resource, $http) {

      $log.debug($rootScope.auth);

      $rootScope.refreshViewVars();

      var apiCall = function(){
        var api = $resource($rootScope.conf.API_BASEURL + '/secured/ping');
        api.get({}, function (data) {
          console.log('data=', data);
        });
      };

      var doAfterSettingsLoaded = function(){
        apiCall();
      };

      //load settings
      $http.get('settings.json').success(function(settings){
        $log.debug('settings', settings);
        $rootScope.conf = settings;
        //doAfterSettingsLoaded();
      });

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
    $stateProvider
      .state('voc', {
        url: '/voc',
        templateUrl: 'partials/table.html',
        //controller: 'MainCtrl'//,
        requiresLogin: true
      })
      .state('404', {
        url: '/404',
        templateUrl: 'partials/404.html'
      });

    $urlRouterProvider.otherwise('/404');
    $locationProvider.html5Mode(true).hashPrefix('!');

  }])
  .run(['$log', 'auth', '$location', '$rootScope',
    function ($log, auth, $location, $rootScope) {

      $log.debug('debugging on');

      auth.hookEvents();

      $location.path('/voc');

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
//              $location.path('/voc');
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
          $location.path('/');
        });
      };

      $rootScope.goTo = function(arg){
        $location.path(arg);
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

      $rootScope.$on('$stateChangeStart', function (e, nextRoute, currentRoute) {
        if (!auth.isAuthenticated) {
          $location.path('/');
          //$rootScope.doLogin();
        }
      });

    }]
  );

