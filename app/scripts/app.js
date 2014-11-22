'use strict';

angular.module('famousAngular',
    [
      'auth0',
      'angular-jwt',
      'ngAnimate',
      'ngCookies',
      'ngTouch',
      'ngSanitize',
      'ngResource',
      'ui.router',
      'angular-storage',
      'directives.formHelpers',
      'famousAngular.formHelpers.editables',
      'famous.angular'
    ])

  .config(['SettingsProvider', '$httpProvider', '$resourceProvider', '$stateProvider', 'authProvider', 'jwtInterceptorProvider', '$logProvider', '$locationProvider', '$urlRouterProvider',
    function (SettingsProvider, $httpProvider, $resourceProvider, $stateProvider, authProvider, jwtInterceptorProvider, $logProvider, $locationProvider, $urlRouterProvider) {

      jwtInterceptorProvider.tokenGetter = function (store) {
        return store.get('token');
      };

      $httpProvider.interceptors.push('jwtInterceptor');

      authProvider.init({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        callbackURL: AUTH0_CALLBACK_URL
      });

      var conf;
      SettingsProvider.readConf().then(function (data) {
        conf = data;
      });

      $resourceProvider.defaults.stripTrailingSlashes = false;

      authProvider.on('loginSuccess', ['Settings', 'auth', 'Items', '$location', '$rootScope', '$log', '$resource', '$http',
        function (Settings, auth, Items, $location, $rootScope, $log, $resource, $http) {

          // resolves on auth0 profile success
          auth.profilePromise.then(function (profile) {
            $rootScope.profile = profile;
            $log.debug('profile resolved:', profile);
          });

          $location.path('/profile');
          $rootScope.$broadcast('sig:::profileLoaded');

        }]);

      authProvider.on('logout', [ '$location', '$log', 'store', '$rootScope', function ($location, $log, store, $rootScope) {
        store.remove('token');
        store.remove('profile');
        $rootScope.profile = null;
        $location.path('/');
      }]);

      authProvider.on('authenticated', ['auth', '$location', '$rootScope', '$log',
        function (auth, $location, $rootScope, $log) {
          $rootScope.profile = auth.profile;
//          $log.debug('authenticated (on reload)', auth.profile);
          $location.path('/profile');
          $rootScope.$broadcast('sig:::profileLoaded');
        }]);

      authProvider.on('loginFailure', ['$location', function ($location) {
        $location.path('/error');
      }]);

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'partials/main.html',
          controller: 'MainCtrl',
          data: {}
        });

      $stateProvider
        .state('data', {
          url: '/data',
          templateUrl: 'partials/data.html',
          //controller: 'DataCtrl', // see the partial ng-ctrl
          resolve: {
            conf: ['Settings', function (Settings) {
              return Settings;
            }]
          },
          controller: ['$scope', 'conf', function ($scope, conf) {
            $scope.conf = conf;
          }],
          data: {
            restricted: true
          }
        });

      $stateProvider
        .state('error', {
          url: '/error',
          templateUrl: 'partials/error.html',
          data: {}
        });

      $stateProvider
        .state('profile', {
          url: '/profile',
          templateUrl: 'partials/profile.html',
          //controller: 'MainCtrl'//,
          data: {
            restricted: true
          }
        });

      $stateProvider
        .state('404', {
          url: '/404',
          templateUrl: 'partials/404.html',
          data: {
            restricted: null
          }
        });

      $urlRouterProvider.otherwise('/');
      $locationProvider.html5Mode(true).hashPrefix('!');

    }])
  .run(['$log', 'auth', '$location', '$rootScope', 'Settings', 'Items', 'jwtHelper', 'store', '$resource',
    function ($log, auth, $location, $rootScope, Settings, Items, jwtHelper, store, $resource) {

      auth.hookEvents();

      // @TODO resolve in dataCtrl or other ctrls
      Settings.then(function (conf) {
//        Items.fetch();
      });

      $rootScope.goTo = function (arg) {
        $log.debug('go to:', arg);
        $location.path(arg);
      };

      $rootScope.handleSession = function () {
        if (!auth.isAuthenticated) {

          auth.signin({
            authParams: {
              scope: 'openid profile' // This is if you want the full JWT
            }
          }, function (profile, token) {
            store.set('profile', profile);
            store.set('token', token);
            $location.path('/profile');
            $log.debug('login success:', true);
          }, function (err) {
            console.log('Error:', err);
          });
        }

        if (auth.isAuthenticated) {
          auth.signout();
          //@TODO remove localstorage data if offline
          $location.path('/');
        }

      };

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

//        $log.debug('toState:', toState);

        if (!auth.isAuthenticated) {
          var token = store.get('token');
//          $log.debug('got token:', token);
          if (token) {
            if (!jwtHelper.isTokenExpired(token)) {
              auth.authenticate(store.get('profile'), token);
            } else {
              //
            }
          }
        }

        // block restricted
        if (toState.data.restricted && !auth.isAuthenticated) {
          $log.debug('page restricted!');
          $location.path('/');
        }

      });

      var apiCall = function(conf){
        var api = $resource(conf.API_BASEURL + '/secured/ping');
        api.get({}, function (data) {
          $log.debug('api data: ', data);
        });
      };

      // on profile load (authenticate/login)
      $rootScope.$on('sig:::profileLoaded', function () {
        Settings.then(function (conf) {
          apiCall(conf);
        });
      });

    }]
  );

