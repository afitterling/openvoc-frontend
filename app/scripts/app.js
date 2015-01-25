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
      'famous.angular',
      'pascalprecht.translate'
    ])

  .config(['SettingsProvider', '$httpProvider', '$resourceProvider', '$stateProvider', 'authProvider', 'jwtInterceptorProvider', '$logProvider', '$locationProvider', '$urlRouterProvider', '$provide',
    function (SettingsProvider, $httpProvider, $resourceProvider, $stateProvider, authProvider, jwtInterceptorProvider, $logProvider, $locationProvider, $urlRouterProvider, $provide) {

      // the models to be able to resolve on them, must set even we don't know the data yet to return the identical promises
      var AppStoreDefaultModels = ['words', 'languages'];

      ///////////////////////// interceptors ////////////////////////////

      $provide.factory('openRequestInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
        var self = this;
        self.requestCounter = 0;

        return {
          request: function (config) {
            self.requestCounter += 1;
            $rootScope.pendingRequests = !!self.requestCounter;
            return config;
          },
          response: function (response) {
            self.requestCounter -= 1;
            $rootScope.pendingRequests = !!self.requestCounter;
            return response || $q.when(response);
          },
          'responseError': function (response) {
            self.requestCounter -= 1;
            $rootScope.pendingRequests = !!self.requestCounter;
            return response;
          }
        };
      }]);

      $provide.factory('errorInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
        return {
          // check server
          'responseError': function (response) {
            $rootScope.$broadcast('onError');
            return response;
          },
          requestError: function (rejection) {
            //$rootScope.$broadcast('onError');
            return $q.reject(rejection);
          }
        };
      }]);

      $httpProvider.interceptors.push('openRequestInterceptor');
      // must be last one!
      $httpProvider.interceptors.push('errorInterceptor');

      jwtInterceptorProvider.tokenGetter = function (store) {
        return store.get('token');
      };

      $httpProvider.interceptors.push('jwtInterceptor');
//      $httpProvider.interceptors.push('myInterceptor');

      authProvider.init({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        callbackUrl: location.href
      });

      var conf;
      SettingsProvider.readConf().then(function (data) {
        conf = data;
      });

      $resourceProvider.defaults.stripTrailingSlashes = false;

      authProvider.on('loginSuccess', ['Settings', 'auth', 'Words', '$location', '$rootScope', '$log', '$resource', '$http', 'AppStore',
        function (Settings, auth, Words, $location, $rootScope, $log, $resource, $http, AppStore) {

          // preinit AppStore
          AppStore.init(AppStoreDefaultModels);

          // resolves on auth0 profile success
          auth.profilePromise.then(function (profile) {
            $rootScope.profile = profile;
            $log.debug('profile resolved:', profile);
            $rootScope.goTo('/profile');
            $rootScope.$broadcast('sig:::profileLoaded');
          });

        }]);

      authProvider.on('logout', [ '$location', '$log', 'store', '$rootScope', 'AppStore', function ($location, $log, store, $rootScope, AppStore) {
        //@TODO AppStore reset
        AppStore.reset();
        store.remove('token');
        store.remove('profile');
        $rootScope.profile = null;
        $location.path('/');
      }]);

      authProvider.on('authenticated', ['auth', '$location', '$rootScope', '$log', 'AppStore',
        function (auth, $location, $rootScope, $log, AppStore) {
          AppStore.init(AppStoreDefaultModels);

          $rootScope.profile = auth.profile;
          //$location.path('/profile');
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
          data: {
          }
        });

      $stateProvider
        .state('data', {
          url: '/dictionary',
          templateUrl: 'partials/data.html',
          resolve: {
            conf: ['Settings', function (Settings) {
              return Settings;
            }],
            words: ['AppStore', function (AppStore) {
              //return AppStore.get('words'); // will return q not the items directly so it is resolvable
              return true;
            }]
          },
          controller: ['$scope', 'conf', 'words', function ($scope, conf, words) {
            $scope.conf = conf;
            //$scope.words = words;
          }],
          data: {
            restricted: true,
            api: true
          }
        });

      $stateProvider
        .state('learn', {
          url: '/learn',
          templateUrl: 'partials/learn.html',
          resolve: {
            conf: ['Settings', function (Settings) {
              return Settings;
            }],
            languages: ['AppStore', function (AppStore) {
              return AppStore.get('languages');
            }]
          },
          controller: ['$scope', 'conf', 'languages', function ($scope, conf, languages) {
            $scope.conf = conf;
            // resolve languages only, it will be in $rootScope and inherited
          }],
          data: {}
        });

      $stateProvider
        .state('messenger', {
          url: '/feedback',
          templateUrl: 'partials/feedback.html',
          data: {},
          resolve: {
            conf: ['Settings', function (Settings) {
              return Settings;
            }]
          },
          controller: 'FeedbackCtrl'
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

      $urlRouterProvider.otherwise('/profile');
      $locationProvider.html5Mode(true).hashPrefix('!');

    }])
  .run(['ValidationActionsStore', '$log', 'auth', '$location', '$rootScope', 'Settings', 'Words', 'Units', 'jwtHelper', 'store', '$resource', 'AppStore', 'Languages', 'UISettings', '$timeout',
    function (ValidationActionsStore, $log, auth, $location, $rootScope, Settings, Words, Units, jwtHelper, store, $resource, AppStore, Languages, UISettings, $timeout) {

      ValidationActionsStore.register('dropdown.lang.to'); //, function(scope.current, ){})
      ValidationActionsStore.register('dropdown.lang.from');

      auth.hookEvents();

      $rootScope.goTo = function (arg) {
        $location.path(arg);
        $rootScope.link = arg;
      };

      $rootScope.$on('onError', function () {
        $location.path('/error');
      });

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
          });
        }

        if (auth.isAuthenticated) {
          auth.signout();
        }

      };

      $rootScope.feedbackPromise = null;

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        $log.debug('$stateChangeStart');

        if (!auth.isAuthenticated) {
          var token = store.get('token');
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

        // warning this won't fire on reload!
        if (toState.data.api && AppStore.get('offline')) {
          $log.debug('needs api but offline!');
          $location.path('/error');
        }

      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $log.debug('$stateChangeSuccess');
      });

        var apiCall = function (conf) {
        var api = $resource(conf.API_BASEURL + '/secured/ping');
        api.get({}, function (data) {
          $log.debug('secured api test call: ', data);
        }, function (error) {
          AppStore.set('offline', error);
        });
      };



      // on profile load (authenticate/login)
      $rootScope.$on('sig:::profileLoaded', function () {
        Settings.then(function (conf) {
          apiCall(conf);
          var words = Words(conf);
          var units = Units(conf);
          var languages = Languages(conf);
          //@TODO include settings
          var uisettings = UISettings(conf);
          //@TODO uid // language_id, targetlang_id form Settings
          languages.query({}, function (languages) {
            /* jshint camelcase: false */
            AppStore.set('languages', languages);
            units.query({user_id: auth.profile.user_id}, function (units) {
              $rootScope.units = units;
            });
            $rootScope.languages = languages;
            $log.debug(languages);
            // chained query as we need to know langs beforehand, as of this don't need to resolve on langs
            $rootScope.lang_selected = {from_id: 1, to_id: 2};
            $rootScope.lang_selected2 = {from_id: 1, to_id: 2};
//            words.query({language_id: 1, targetlang_id: 2, user_id: auth.profile.user_id}, function (words) {
              //AppStore.set('words', null); // setup promise store
//            });
            $rootScope.sessionStore = {};
          });
        });
      });

      $rootScope.bootstrap = { tooltips: {
        options: {
          delay: { show: 0, hide: 0 }
        }
      }};

      $rootScope.tooltips = function () {
        $timeout(function () {
          //$('[data-toggle="tooltip"]').tooltip('destroy');
          $('[data-toggle="tooltip"]').tooltip($rootScope.bootstrap.tooltips.options);
        });
      };

      $rootScope.tooltips();

    }]
  );

