"use strict";angular.module("famousAngularStarter",["auth0","ngAnimate","ngCookies","ngTouch","ngSanitize","ngResource","ui.router","famous.angular"]).constant("SERVER_CONFIG_BASE_URL","http://localhost").constant("SERVER_CONFIG_PORT","3000").config(["$httpProvider","$stateProvider","authProvider","$logProvider","$locationProvider","$urlRouterProvider",function(a,e,t,o,n,i){o.debugEnabled(!0),t.init({domain:"journal-sp33c.auth0.com",clientID:"BcSTdHaYpZHynNIUMXdleiYkaQDp2mMF",callbackURL:location.href,loginUrl:"/login"}),a.interceptors.push("authInterceptor"),e.state("home",{url:"/",templateUrl:"partials/main.html",controller:"MainCtrl"}).state("login",{url:"/login",templateUrl:"partials/login.html",controller:"LoginCtrl"}).state("jade",{url:"/jade",templateUrl:"partials/jade.html",controller:"MainCtrl"}),i.otherwise("/"),n.html5Mode(!0).hashPrefix("!")}]).run(["$log","auth","$location","$rootScope",function(a,e,t,o){a.debug("debugging on"),e.hookEvents(),o.doLogin=function(){e.signin({connection:"Username-Password-Authentication",popup:!0,scope:"openid name email"}).then(function(){t.path("/")},function(){})},o.$on("$routeChangeStart",function(a,t){t.$$route&&t.$$route.requiresLogin&&!e.isAuthenticated})}]).controller("LoginCtrl",["auth","$scope","$location","$http","SERVER_CONFIG_BASE_URL","SERVER_CONFIG_PORT",function(a,e,t,o,n,i){function r(){e.$parent.message="",t.path("/"),e.loading=!1}function s(){e.$parent.message="invalid credentials",e.loading=!1}e.user="",e.pass="",e.doLogin=function(){e.$parent.message="loading...",e.loading=!0,a.signin({connection:"Username-Password-Authentication",popup:!0,scope:"openid name email"}).then(function(){t.path("/")},function(){})},e.doLogin(),e.doGoogleAuthWithPopup=function(){e.$parent.message="loading...",e.loading=!0,a.signin({popup:!0,connection:"google-oauth2",scope:"openid name email"}).then(function(){t.path("/")},function(){})},e.doSignup=function(){o({method:"POST",url:n+":"+i+"/signup/",data:{email:e.signup.user,password:e.signup.pass}}).success(function(t,o){200===o&&a.signin({connection:"Username-Password-Authentication",username:e.signup.user,password:e.signup.pass},r,s)}).error(function(){})}}]),angular.module("famousAngularStarter").controller("MainCtrl",["$scope","$famous",function(a,e){var t=e["famous/transitions/Transitionable"],o=e["famous/utilities/Timer"];a.spinner={speed:55},a.rotateY=new t(0),o.every(function(){var e=parseFloat(a.spinner.speed)/1200;a.rotateY.set(a.rotateY.get()+e)},1)}]),function(a){try{a=angular.module("famousAngularStarter")}catch(e){a=angular.module("famousAngularStarter",[])}a.run(["$templateCache",function(a){a.put("partials/jade.html",'<fa-app class="full-screen"><fa-modifier fa-origin="[.5, .5]" fa-rotate-y="rotateY.get()"><fa-surface fa-size="[true, true]" fa-color="\'rgb(255,255,250)\'"><img src="images/famous-logo.svg" style="width: 200px; height: 200px;" class="logo"></fa-surface><fa-modifier fa-rotate-y="3.14159"><fa-surface fa-size="[true, true]" fa-color="\'rgb(255,255,250)\'"><img src="images/famous-logo.svg" style="width: 200px; height: 200px;" class="logo"></fa-surface></fa-modifier></fa-modifier><fa-modifier fa-origin="[.5, .9]" fa-size="[200, 100]"><fa-surface><input style="width: 100%; text-align: center;" type="range" min="10" max="100" ng-model="spinner.speed"></fa-surface></fa-modifier></fa-app>')}])}(),function(a){try{a=angular.module("famousAngularStarter")}catch(e){a=angular.module("famousAngularStarter",[])}a.run(["$templateCache",function(a){a.put("partials/login.html",'<button type="submit" ng-disabled="loading" ng-click="doLogin()">login</button>')}])}(),function(a){try{a=angular.module("famousAngularStarter")}catch(e){a=angular.module("famousAngularStarter",[])}a.run(["$templateCache",function(a){a.put("partials/main.html",'<fa-app class="full-screen"><fa-modifier fa-origin="[.5, .5]" fa-rotate-y="rotateY.get()"><fa-surface fa-size="[true, true]" fa-color="\'rgb(255,255,250)\'"><img class="logo" src="images/famous-logo.svg" style="width: 200px; height: 200px;"></fa-surface><fa-modifier fa-rotate-y="3.14159"><fa-surface fa-size="[true, true]" fa-color="\'rgb(255,255,250)\'"><img class="logo" src="images/famous-logo.svg" style="width: 200px; height: 200px;"></fa-surface></fa-modifier></fa-modifier><fa-modifier fa-origin="[.5, .9]" fa-size="[200, 100]"><fa-surface><input style="width: 100%; text-align: center;" type="range" min="10" max="100" ng-model="spinner.speed"></fa-surface></fa-modifier></fa-app>')}])}();