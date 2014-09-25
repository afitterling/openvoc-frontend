'use strict';

angular.module('famousAngularStarter',
    ['auth0', 'ngAnimate', 'ngCookies',
      'ngTouch', 'ngSanitize',
      'ngResource', 'ui.router',
      'famous.angular' ])

  .constant('SERVER_CONFIG_BASE_URL', 'http://localhost')
  .constant('SERVER_CONFIG_PORT', '3000')

  .config(function ($httpProvider, $stateProvider, authProvider, $logProvider, $locationProvider, $urlRouterProvider) {

    $logProvider.debugEnabled(true);

    authProvider.init({
      domain: 'journal-sp33c.auth0.com',
      clientID: 'BcSTdHaYpZHynNIUMXdleiYkaQDp2mMF',
      callbackURL: location.href,
      loginUrl: '/login'
    });

    $httpProvider.interceptors.push('authInterceptor');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'//,
        //requiresLogin: true
      })
      .state('login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .state('jade', {
        url: '/jade',
        templateUrl: 'partials/jade.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true).hashPrefix('!');

  })
  .run(['$log', 'auth', '$location', '$rootScope',
    function ($log, auth, $location, $rootScope) {

      $log.debug('debugging on');
      auth.hookEvents();
      $location.path('/login');

      $rootScope.$on('$routeChangeStart', function (e, nextRoute, currentRoute) {
        if (nextRoute.$$route && nextRoute.$$route.requiresLogin) {
          if (!auth.isAuthenticated) {
            $location.path('/login');
          }
        }
      });

    }])
  .controller('LoginCtrl', ['auth', '$scope', '$location', '$http',
    'SERVER_CONFIG_BASE_URL', 'SERVER_CONFIG_PORT',
    function (auth, $scope, $location, $http, SERVER_CONFIG_BASE_URL, SERVER_CONFIG_PORT) {

      $scope.user = '';
      $scope.pass = '';

      function onLoginSuccess() {
        $scope.$parent.message = '';
        $location.path('/');
        $scope.loading = false;
      }

      function onLoginFailed() {
        $scope.$parent.message = 'invalid credentials';
        $scope.loading = false;
      }

      $scope.doLogin = function () {
        $scope.$parent.message = 'loading...';
        $scope.loading = true;

        auth.signin({
          connection: 'Username-Password-Authentication',
//          username: $scope.user,
//          password: $scope.pass,
          popup: true,
          scope: 'openid name email'
        }).then(function () {
            // Success callback
            $location.path('/');
          }, function () {
            // Error callback
          });
      };

      $scope.doGoogleAuthWithPopup = function () {
        $scope.$parent.message = 'loading...';
        $scope.loading = true;

        auth.signin({
          popup: true,
          connection: 'google-oauth2',
          scope: 'openid name email'
        }).then(function () {
            // Success callback
            $location.path('/');
          }, function () {
            // Error callback
          });
      };

      $scope.doSignup = function () {
        $http({method: 'POST',
          url: SERVER_CONFIG_BASE_URL + ':' + SERVER_CONFIG_PORT + '/signup/',
          data: {
            email: $scope.signup.user,
            password: $scope.signup.pass
          }})
          .success(function (data, status) {
            if (status === 200) {
              auth.signin({
                // Make sure that connection matches
                // your server-side connection id
                connection: 'Username-Password-Authentication',
                username: $scope.signup.user,
                password: $scope.signup.pass
              }, onLoginSuccess, onLoginFailed);
            }
          })
          .error(function (data) {
            // error
          });
      };
    }]
  )
;
