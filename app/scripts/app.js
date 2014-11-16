'use strict';

angular.module('famousAngular',
    [
      'auth0',
      'ngAnimate',
      'ngCookies',
      'ngTouch',
      'ngSanitize',
      'ngResource',
      'ui.router',
      'famous.angular'
    ])

  .config(['$httpProvider', '$stateProvider', 'authProvider', '$logProvider', '$locationProvider', '$urlRouterProvider', function ($httpProvider, $stateProvider, authProvider, $logProvider, $locationProvider, $urlRouterProvider) {

    authProvider.init({
      domain: 'journal-sp33c.auth0.com',
      clientID: 'BcSTdHaYpZHynNIUMXdleiYkaQDp2mMF',
      callbackURL: location.href,
      loginUrl: '/login'
    });

    $httpProvider.interceptors.push('authInterceptor');

    authProvider.on('loginSuccess', ['$location', '$rootScope', '$log', '$resource', '$http', function ($location, $rootScope, $log, $resource, $http) {

      $rootScope.refreshViewVars();
      $location.path('/profile');

      var apiCall = function(){
        var api = $resource($rootScope.conf.API_BASEURL + '/secured/ping');
        api.get({}, function (data) {
          $log.debug('api data', data);
        });
      };

      var doAfterSettingsLoaded = function(){
        apiCall();
        $log.debug($rootScope.auth);
      };

      //load settings
      $http.get('settings.json').success(function(settings){
        // set log provider
        $logProvider.debugEnabled(settings.debug);

        $log.debug('debug', settings.debug);
        $log.debug('settings', settings);

        $rootScope.conf = settings;
        doAfterSettingsLoaded();
      });

    }]);

    authProvider.on('logout', [ '$rootScope', '$log', function($rootScope, $log) {
      //$location.path('/');
      $rootScope.refreshViewVars();
    }]);

    authProvider.on('authenticated', function($location) {
      // This is after a refresh of the page
      // If the user is still authenticated, you get this event
    });

    //@TODO
    authProvider.on('loginFailure', function($location, error) {
      $location.path('/error');
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl',
        data: {}
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
        templateUrl: 'partials/404.html'
      });

    $urlRouterProvider.otherwise('/404');
    $locationProvider.html5Mode(true).hashPrefix('!');

  }])
  .run(['$log', 'auth', '$location', '$rootScope',
    function ($log, auth, $location, $rootScope) {

      auth.hookEvents();

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
          $location.path('/');
        }

      };

      $rootScope.logout = function () {
        auth.signout(function () {

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

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        $log.debug('toState:', toState);
        // block restricted
        if (!auth.isAuthenticated && toState.data.restricted) {
          //block transition
          $log.debug('page restricted!');
          event.preventDefault();
          $location.path('/');
        }
      });

      $rootScope.toggleMenu = function(){
        var menu = $('#navigation-menu');
        menu.slideToggle(function(){
          if(menu.is(':hidden')) {
            menu.removeAttr('style');
          }
        });

        // underline under the active nav item
        $(".nav .nav-link").click(function() {
          $(".nav .nav-link").each(function() {
            $(this).removeClass("active-nav-item");
          });
          $(this).addClass("active-nav-item");
          $(".nav .more").removeClass("active-nav-item");
        });
      };

      $(document).ready(function() {
        var menuToggle = $('#js-mobile-menu');
        var signUp = $('.sign-up');
      });

    }]
  );

