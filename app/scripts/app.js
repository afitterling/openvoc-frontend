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

//      jwtInterceptorProvider.tokenGetter = function () {
//        return localStorage.getItem('id_token');
//      };

      $httpProvider.interceptors.push('jwtInterceptor');

      authProvider.init({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
//        loginUrl: '/login',
        callbackURL: location.href
      });

      var conf;
      //@TODO return $q in appLaunchProvider
      // wait in dataCtrl until resolved
      // read the app base config, api url, etc.........
      SettingsProvider.readConf().then(function (data) {
        conf = data;
        //      SettingsProvider.setConf(conf);
      });

      $resourceProvider.defaults.stripTrailingSlashes = false;

      authProvider.on('loginSuccess', ['Settings', 'auth', 'Items', '$location', '$rootScope', '$log', '$resource', '$http',
        function (Settings, auth, Items, $location, $rootScope, $log, $resource, $http) {

          // resolves on auth0 profile success
          auth.profilePromise.then(function (profile) {
            $rootScope.profile = profile;
            $log.debug('profile resolved:', profile);

            //Items.fetch();
//        apiCall();

          });

//      $rootScope.refreshViewVars();
          $location.path('/profile');

//      var apiCall = function(){
//        var api = $resource(conf.API_BASEURL + '/secured/ping');
//        api.get({}, function (data) {
//          $log.debug('api data: ', data);
//        });
//      };

//      var doAfterSettingsLoaded = function(settings){

//        $log.debug($rootScope.auth.profile.user_id); @TODO error
//        var Items = $resource(settings.API_BASEURL + '/items/:id', {id: '@id'},
//        // the patch request will update on those fields the model changed server side
//        { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });
//
//        $rootScope.items = Items.query({user_id: auth.profile.user_id}, function (data) {
//          console.log(data);
//        });

//      };

          //load settings

        }]);

      authProvider.on('logout', [ '$rootScope', '$log', function ($rootScope, $log) {
        //$location.path('/');
        $rootScope.refreshViewVars();
      }]);

      authProvider.on('authenticated', ['$location', function ($location) {
        // This is after a refresh of the page
        // If the user is still authenticated, you get this event
//      console.log('authenticated');
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
  .run(['$log', 'auth', '$location', '$rootScope', 'Settings', 'Items', 'jwtHelper', 'store',
    function ($log, auth, $location, $rootScope, Settings, Items, jwtHelper, store) {


      // @TODO resolve in dataCtrl or other ctrls
      Settings.then(function (conf) {
//        Items.fetch();
      });

      auth.hookEvents();

//      console.log(auth);
//      auth.profilePromise.then(function(profile) {
//        $rootScope.profile = profile;
//        console.log('resolved');
//      });

      $rootScope.handleSession = function () {
        if (!auth.isAuthenticated) {

          auth.signin({
            authParams: {
              scope: 'openid profile' // This is if you want the full JWT
            }
          }, function () {
            $location.path('/profile');
            $log.debug('login success:', true);
          }, function (err) {
            console.log('Error:', err);
          });
//        }

//          auth.signin({
//            connection: 'Username-Password-Authentication',
//            popup: true,
//            scope: 'openid name email'
//          }).then(function () {
//              // Success callback
//              $rootScope.refreshViewVars();
//            }, function () {
//              // Error callback
//            });
        }


//        if (auth.isAuthenticated) {
//          auth.signout();
//          $rootScope.refreshViewVars();
//          $location.path('/');
//        }

      };

      $rootScope.logout = function () {
        auth.signout(function () {

        });
      };

      $rootScope.goTo = function (arg) {
        $location.path(arg);
      };

      $rootScope.refreshViewVars = function () {
        if (!auth.isAuthenticated) {
          $rootScope.sessionAction = 'Login';
        }
        if (auth.isAuthenticated) {
          $rootScope.sessionAction = 'Logout';
        }
      };
      $rootScope.refreshViewVars();

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        $log.debug('toState:', toState);
        // block restricted
//        if (!auth.isAuthenticated && toState.data.restricted) {
//          //event.preventDefault();
//          //block transition
//          $log.debug('page restricted!');
//          $location.path('/');
//        }

        if (!auth.isAuthenticated || toState.data.restricted) {
          var token = store.get('token');
          $log.debug('got token:', token);
          if (token) {
            if (!jwtHelper.isTokenExpired(token)) {
              auth.authenticate(store.get('profile'), token);
            } else {
              $location.path('/');
              $log.debug('page restricted!');
            }
          }
        }
      });


    }]
  );

